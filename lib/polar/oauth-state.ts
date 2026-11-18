// Short-lived httpOnly cookie carrying the OAuth state between /connect and
// /callback (Polar's OAuth has no PKCE). Same pattern as Garmin.
export const POLAR_OAUTH_COOKIE = "polar_oauth"
export const POLAR_OAUTH_COOKIE_PATH = "/api/integrations/polar"

export type PolarOAuthState = { state: string; userId: string }

export function polarCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: POLAR_OAUTH_COOKIE_PATH,
    maxAge: 10 * 60,
  }
}

export function parsePolarOAuthState(raw: string | undefined): PolarOAuthState | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as Partial<PolarOAuthState>
    if (typeof v.state === "string" && typeof v.userId === "string") return { state: v.state, userId: v.userId }
  } catch {
    // fall through
  }
  return null
}
