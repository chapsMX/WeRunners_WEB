// Outcome of the Polar OAuth callback, passed to /dashboard as ?polar=<result>.
export const POLAR_RESULTS = [
  "connected",
  "consent_required", // user hasn't accepted Polar's mandatory consents (account.polar.com)
  "denied",
  "invalid_state",
  "in_use", // that Polar account is linked to another W3Runn3rs user
  "other_provider",
  "failed",
] as const

export type PolarResult = (typeof POLAR_RESULTS)[number]

export function parsePolarResult(value: unknown): PolarResult | null {
  return typeof value === "string" && (POLAR_RESULTS as readonly string[]).includes(value) ? (value as PolarResult) : null
}
