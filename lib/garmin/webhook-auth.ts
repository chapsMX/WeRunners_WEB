// Server-only: checks for incoming Garmin push notifications.
// Garmin doesn't sign webhooks, so we combine: secret path segment
// (GARMIN_WEBHOOK_SECRET) + garmin-client-id header + Garmin's published IPs.
import { timingSafeEqual } from "node:crypto"

// Activity API v2.1 §4 "IP Range".
const GARMIN_CIDRS = [
  "204.77.162.0/23",
  "204.77.163.0/24",
  "98.199.124.0/23",
  "185.132.79.0/24",
  "208.65.206.0/23",
  "185.207.94.0/23",
  "198.233.176.0/24",
]

export function isValidWebhookSecret(candidate: string): boolean {
  const expected = process.env.GARMIN_WEBHOOK_SECRET
  if (!expected) return false
  const a = Buffer.from(candidate)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function isGarminClientId(header: string | null): boolean {
  const expected = process.env.GARMIN_CLIENT_ID
  return Boolean(expected && header && header === expected)
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".")
  if (parts.length !== 4) return null
  let n = 0
  for (const p of parts) {
    const v = Number(p)
    if (!Number.isInteger(v) || v < 0 || v > 255) return null
    n = n * 256 + v
  }
  return n
}

/** True when the IP is inside one of Garmin's published ranges (IPv4 only). */
export function isGarminIp(ip: string | null): boolean {
  if (!ip) return false
  const n = ipv4ToInt(ip.trim())
  if (n === null) return false
  return GARMIN_CIDRS.some((cidr) => {
    const [base, bits] = cidr.split("/")
    const b = ipv4ToInt(base)
    if (b === null) return false
    const size = 2 ** (32 - Number(bits))
    const start = Math.floor(b / size) * size
    return n >= start && n < start + size
  })
}

/** First hop in x-forwarded-for (set by Vercel). */
export function clientIp(forwardedFor: string | null): string | null {
  return forwardedFor?.split(",")[0]?.trim() || null
}
