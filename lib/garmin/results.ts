// Outcome of the Garmin OAuth callback, passed to /dashboard as ?garmin=<result>.
// Plain module (no server/client-only code) so the route, the page and the
// client notice share one list.
export const GARMIN_RESULTS = [
  "connected",
  "connected_no_activity", // linked, but the user didn't share ACTIVITY_EXPORT
  "denied", // user declined on Garmin's consent page
  "invalid_state", // missing/expired cookie or state mismatch
  "in_use", // that Garmin account is linked to another W3Runn3rs user
  "other_provider", // user already has a different device provider connected
  "failed",
] as const

export type GarminResult = (typeof GARMIN_RESULTS)[number]

export function parseGarminResult(value: unknown): GarminResult | null {
  return typeof value === "string" && (GARMIN_RESULTS as readonly string[]).includes(value)
    ? (value as GarminResult)
    : null
}
