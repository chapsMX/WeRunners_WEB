// Server-only: Garmin Connect Developer Program — OAuth2 PKCE + partner-gateway calls.
// Spec: docs/OAuth2PKCE 2.0.pdf. Token exchange/refresh need the client secret,
// so everything here runs on our backend (Garmin has no public-client flow).
import { createHash, randomBytes } from "node:crypto"

const AUTHORIZE_URL = "https://connect.garmin.com/oauth2Confirm"
const TOKEN_URL = "https://diauth.garmin.com/di-oauth2-service/oauth/token"
const PARTNER_API = "https://apis.garmin.com/partner-gateway/rest"

/** Refresh this long before the access token actually expires (spec recommends ≥600 s). */
export const ACCESS_TOKEN_REFRESH_MARGIN_MS = 600 * 1000

export class GarminApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "GarminApiError"
    this.status = status
  }
}

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

function base64url(buf: Buffer): string {
  return buf.toString("base64url")
}

// ── PKCE ────────────────────────────────────────────────────

export type PkcePair = { verifier: string; challenge: string; state: string }

export function generatePkce(): PkcePair {
  // 48 random bytes → 64 base64url chars (spec: 43–128, A-Z a-z 0-9 - . _ ~)
  const verifier = base64url(randomBytes(48))
  const challenge = base64url(createHash("sha256").update(verifier).digest())
  const state = base64url(randomBytes(24))
  return { verifier, challenge, state }
}

export function buildAuthorizeUrl({ challenge, state }: Pick<PkcePair, "challenge" | "state">) {
  const url = new URL(AUTHORIZE_URL)
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: env("GARMIN_CLIENT_ID"),
    code_challenge: challenge,
    code_challenge_method: "S256",
    redirect_uri: env("GARMIN_REDIRECT_URI"),
    state,
  }).toString()
  return url.toString()
}

// ── Tokens ──────────────────────────────────────────────────

type TokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_token_expires_in: number
  scope?: string
  token_type?: string
}

export type TokenSet = {
  accessToken: string
  refreshToken: string
  tokenExpiresAt: Date
  refreshTokenExpiresAt: Date
  scope: string | null
}

async function postToken(params: Record<string, string>): Promise<TokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env("GARMIN_CLIENT_ID"),
      client_secret: env("GARMIN_CLIENT_SECRET"),
      ...params,
    }),
    cache: "no-store",
  })
  if (!res.ok) {
    // Never log the body of a token request — it may echo credentials.
    throw new GarminApiError(`Token request failed (${params.grant_type})`, res.status)
  }
  const data = (await res.json()) as TokenResponse
  if (!data.access_token || !data.refresh_token) {
    throw new GarminApiError("Token response missing tokens", res.status)
  }
  const now = Date.now()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenExpiresAt: new Date(now + data.expires_in * 1000),
    refreshTokenExpiresAt: new Date(now + data.refresh_token_expires_in * 1000),
    scope: data.scope ?? null,
  }
}

export function exchangeCode(code: string, verifier: string): Promise<TokenSet> {
  return postToken({
    grant_type: "authorization_code",
    code,
    code_verifier: verifier,
    redirect_uri: env("GARMIN_REDIRECT_URI"),
  })
}

/** Garmin rotates the refresh token on every call: always persist the returned one. */
export function refreshTokens(refreshToken: string): Promise<TokenSet> {
  return postToken({ grant_type: "refresh_token", refresh_token: refreshToken })
}

// ── Partner gateway (Bearer) ────────────────────────────────

async function partnerFetch(path: string, accessToken: string, init: RequestInit = {}) {
  const res = await fetch(`${PARTNER_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...init.headers },
    cache: "no-store",
  })
  if (!res.ok) throw new GarminApiError(`${init.method ?? "GET"} ${path} failed`, res.status)
  return res
}

/** Stable Garmin user id — same across reconnects; matches `userId` in push payloads. */
export async function getGarminUserId(accessToken: string): Promise<string> {
  const res = await partnerFetch("/user/id", accessToken)
  const data = (await res.json()) as { userId?: string }
  if (!data.userId) throw new GarminApiError("user/id response missing userId", res.status)
  return data.userId
}

/** e.g. ["ACTIVITY_EXPORT", …]. Without ACTIVITY_EXPORT no activities are pushed. */
export async function getGarminPermissions(accessToken: string): Promise<string[]> {
  const res = await partnerFetch("/user/permissions", accessToken)
  const data = (await res.json()) as { permissions?: unknown }
  return Array.isArray(data.permissions)
    ? data.permissions.filter((p): p is string => typeof p === "string")
    : []
}

/** Required whenever the user disconnects or deletes their account on our side. */
export async function deleteGarminRegistration(accessToken: string): Promise<void> {
  await partnerFetch("/user/registration", accessToken, { method: "DELETE" })
}

export const ACTIVITY_EXPORT = "ACTIVITY_EXPORT"

/** Log-safe error summary (never includes tokens or response bodies). */
export function describeGarminError(e: unknown) {
  if (e instanceof GarminApiError) return { message: e.message, status: e.status }
  if (e instanceof Error) return { message: e.message }
  return { message: String(e) }
}
