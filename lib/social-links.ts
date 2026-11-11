// Builds the outbound social links shown on a public profile.
// Values come from the DB but are user-controlled, so every href is rebuilt
// from a fixed base (handles) or checked against the expected host (URLs).
// Anything that doesn't pass is dropped instead of rendered.

export type SocialNetwork = "x" | "instagram" | "facebook" | "strava"

export type SocialLink = {
  network: SocialNetwork
  href: string
  /** Accessible label, e.g. "Instagram: @chaps". */
  label: string
}

const HANDLE_RE = /^[A-Za-z0-9_.]{1,30}$/

function handleLink(
  network: SocialNetwork,
  name: string,
  base: string,
  raw: string | null
): SocialLink | null {
  const handle = raw?.trim().replace(/^@/, "")
  if (!handle || !HANDLE_RE.test(handle)) return null
  return { network, href: `${base}/${handle}`, label: `${name}: @${handle}` }
}

function urlLink(
  network: SocialNetwork,
  name: string,
  domain: string,
  raw: string | null
): SocialLink | null {
  if (!raw) return null
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase()
  const hostOk = host === domain || host.endsWith(`.${domain}`)
  const hasPath = url.pathname.replace(/\/+$/, "").length > 0
  if (!hostOk || !hasPath || !/^https?:$/.test(url.protocol)) return null
  url.protocol = "https:"
  return { network, href: url.toString(), label: name }
}

export function buildSocialLinks(user: {
  twitterHandle: string | null
  instagramHandle: string | null
  facebookProfileUrl: string | null
  stravaProfileUrl: string | null
}): SocialLink[] {
  return [
    handleLink("x", "X", "https://x.com", user.twitterHandle),
    handleLink("instagram", "Instagram", "https://instagram.com", user.instagramHandle),
    urlLink("facebook", "Facebook", "facebook.com", user.facebookProfileUrl),
    urlLink("strava", "Strava", "strava.com", user.stravaProfileUrl),
  ].filter((l): l is SocialLink => l !== null)
}
