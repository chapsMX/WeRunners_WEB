// "On the list" flag shared across w3runn3rs.com subdomains.
// The app (app.w3runn3rs.com) sets it for signed-in users — every account is
// on the waitlist — so the landing (www) can show "You're on the list!"
// instead of the form. Not a credential: it holds no user data, and it is
// readable by client JS on purpose. Only set on the real domain.

export const ON_LIST_COOKIE = "w3_on_list"
export const ON_LIST_DOMAIN = ".w3runn3rs.com"
export const ON_LIST_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

/** True for w3runn3rs.com and its subdomains (not localhost / previews). */
export function isW3Host(host: string | null): boolean {
  const hostname = (host ?? "").split(":")[0].toLowerCase()
  return hostname === "w3runn3rs.com" || hostname.endsWith(".w3runn3rs.com")
}

/** Client-side check (landing). */
export function hasOnListCookie(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.split("; ").some((c) => c === `${ON_LIST_COOKIE}=1`)
}
