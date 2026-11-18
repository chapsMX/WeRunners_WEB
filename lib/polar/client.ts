// Server-only: Polar AccessLink v3 — OAuth2, user registration, exercises,
// webhook signature. Docs: https://www.polar.com/accesslink-api/
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

const AUTHORIZE_URL = "https://flow.polar.com/oauth2/authorization"
const TOKEN_URL = "https://polarremote.com/v2/oauth2/token"
export const POLAR_API = "https://www.polaraccesslink.com/v3"

export class PolarApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "PolarApiError"
    this.status = status
  }
}

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

/** Client-level auth (token exchange, webhooks): Basic base64(client_id:client_secret). */
export function polarBasicAuth(): string {
  return `Basic ${Buffer.from(`${env("POLAR_CLIENT_ID")}:${env("POLAR_CLIENT_SECRET")}`).toString("base64")}`
}

export function newOAuthState(): string {
  return randomBytes(24).toString("base64url")
}

export function buildAuthorizeUrl(state: string): string {
  const url = new URL(AUTHORIZE_URL)
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: env("POLAR_CLIENT_ID"),
    redirect_uri: env("POLAR_REDIRECT_URI"),
    scope: "accesslink.read_all",
    state,
  }).toString()
  return url.toString()
}

export type PolarToken = { accessToken: string; polarUserId: string; expiresAt: Date | null }

export async function exchangeCode(code: string): Promise<PolarToken> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: polarBasicAuth(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: env("POLAR_REDIRECT_URI") }),
    cache: "no-store",
  })
  // Never log the body of a token response.
  if (!res.ok) throw new PolarApiError("Token request failed", res.status)
  const data = (await res.json()) as { access_token?: string; expires_in?: number; x_user_id?: number | string }
  if (!data.access_token || data.x_user_id == null) throw new PolarApiError("Token response missing fields", res.status)
  return {
    accessToken: data.access_token,
    polarUserId: String(data.x_user_id),
    expiresAt: typeof data.expires_in === "number" ? new Date(Date.now() + data.expires_in * 1000) : null,
  }
}

/**
 * POST /v3/users — required once after OAuth. 409 = already registered to us
 * (fine). 403 = the user hasn't accepted Polar's mandatory consents.
 */
export async function registerUser(accessToken: string, memberId: string): Promise<"registered" | "already" | "consent_required"> {
  const res = await fetch(`${POLAR_API}/users`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ "member-id": memberId }),
    cache: "no-store",
  })
  if (res.ok) return "registered"
  if (res.status === 409) return "already"
  if (res.status === 403) return "consent_required"
  throw new PolarApiError("POST /users failed", res.status)
}

/** DELETE /v3/users/{id} — deregisters and revokes the token. */
export async function deregisterUser(accessToken: string, polarUserId: string): Promise<void> {
  const res = await fetch(`${POLAR_API}/users/${encodeURIComponent(polarUserId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!res.ok && res.status !== 204) throw new PolarApiError("DELETE /users failed", res.status)
}

/** Only fetch exercise URLs on AccessLink itself (the webhook hands us the URL). */
export function isPolarExerciseUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname === "www.polaraccesslink.com" && /^\/v3\/exercises\/[\w-]+$/.test(url.pathname)
  } catch {
    return false
  }
}

/** GET an exercise by its AccessLink URL (summary fields; no samples/route). */
export async function getExercise(accessToken: string, url: string): Promise<unknown> {
  if (!isPolarExerciseUrl(url)) throw new PolarApiError("Unexpected exercise URL", 400)
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
  })
  if (!res.ok) throw new PolarApiError("GET exercise failed", res.status)
  return res.json()
}

/** Polar-Webhook-Signature = hex HMAC-SHA256(raw body, signature_secret_key). */
export function isValidPolarSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")
  const a = Buffer.from(expected, "utf8")
  const b = Buffer.from(signature.trim().toLowerCase(), "utf8")
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Log-safe error summary (never tokens or bodies). */
export function describePolarError(e: unknown) {
  if (e instanceof PolarApiError) return { message: e.message, status: e.status }
  if (e instanceof Error) return { message: e.message }
  return { message: String(e) }
}
