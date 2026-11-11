// Short-lived httpOnly cookie that carries the PKCE verifier + state between
// /connect and /callback. Same-site redirects only, never readable by JS.

export const GARMIN_OAUTH_COOKIE = "garmin_oauth"
export const GARMIN_OAUTH_COOKIE_PATH = "/api/integrations/garmin"
export const GARMIN_OAUTH_MAX_AGE = 10 * 60 // seconds

export type GarminOAuthState = {
  verifier: string
  state: string
  /** W3Runn3rs user that started the flow — must match the session at callback. */
  userId: string
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const, // sent on Garmin's top-level redirect back to us
    path: GARMIN_OAUTH_COOKIE_PATH,
    maxAge: GARMIN_OAUTH_MAX_AGE,
  }
}

export function parseOAuthState(raw: string | undefined): GarminOAuthState | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as Partial<GarminOAuthState>
    if (typeof v.verifier === "string" && typeof v.state === "string" && typeof v.userId === "string") {
      return { verifier: v.verifier, state: v.state, userId: v.userId }
    }
  } catch {
    // fall through
  }
  return null
}
