// Ambassador "pass": someone heading to /ambassadors/apply (the landing's
// "Apply now" signs in with callbackUrl=/ambassadors/apply) gets past the closed
// beta, like a club invite link. Set by the middleware, read by the beta gate
// and onboarding, cleared once the application is sent. No imports: the
// middleware runs on the edge.
export const AMBASSADOR_INTENT_COOKIE = "w3_ambassador"
export const AMBASSADOR_INTENT_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
export const AMBASSADOR_APPLY_PATH = "/ambassadors/apply"
