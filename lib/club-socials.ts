// Club social links from what admins typed (a handle like "@club" or a URL).
export type ClubSocialNetwork = "instagram" | "x" | "tiktok" | "facebook"

const BASE: Record<ClubSocialNetwork, (handle: string) => string> = {
  instagram: (h) => `https://instagram.com/${h}`,
  x: (h) => `https://x.com/${h}`,
  tiktok: (h) => `https://www.tiktok.com/@${h}`,
  facebook: (h) => `https://facebook.com/${h}`,
}

/** "https://…" stays (only http/https); "@club" / "club" becomes the network URL. */
export function clubSocialHref(network: ClubSocialNetwork, value: string | null): string | null {
  const v = value?.trim()
  if (!v) return null
  if (/^https?:\/\//i.test(v)) {
    try {
      const url = new URL(v)
      return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
    } catch {
      return null
    }
  }
  const handle = v.replace(/^@/, "").replace(/^(www\.)?(instagram|x|twitter|tiktok|facebook)\.com\//i, "").replace(/^@/, "")
  return /^[\w.\-/]{1,100}$/.test(handle) ? BASE[network](handle) : null
}
