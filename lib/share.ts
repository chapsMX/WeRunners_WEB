// Share intents (X, Farcaster). Spaces encoded as %20, not "+".
export const APP_URL = "https://app.w3runn3rs.com"

export function clubPageUrl(slug: string): string {
  return `${APP_URL}/clubs/${slug}`
}

/** Club invite link: preview = the club card; people land in sign-up with the club picked. */
export function clubInviteUrl(slug: string): string {
  return `${APP_URL}/clubs/${slug}/join`
}

export function shareLinks(text: string, url: string | null): { x: string; farcaster: string } {
  const q = (pairs: [string, string][]) =>
    pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
  return {
    x: `https://x.com/intent/tweet?${q(url ? [["text", text], ["url", url]] : [["text", text]])}`,
    farcaster: `https://farcaster.xyz/~/compose?${q(url ? [["text", text], ["embeds[]", url]] : [["text", text]])}`,
  }
}
