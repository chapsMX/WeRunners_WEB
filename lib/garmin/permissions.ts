// Server-only: Garmin data-sharing permissions (ACTIVITY_EXPORT).
//
// Known vs unknown: `permissionsUpdatedAt = null` means we couldn't confirm the
// permissions yet (Garmin call failed, or consent hadn't propagated right after
// OAuth). The UI only says "activity sharing is off" when the value is known, and
// pages self-heal an unknown/off value by asking Garmin again (rate-limited).
import { prisma } from "@/lib/prisma"
import { ACTIVITY_EXPORT, describeGarminError, getGarminPermissions } from "./client"
import { getValidAccessToken } from "./connection"

/** Wait before the single retry on connect (consent can lag the token exchange). */
const CONNECT_RETRY_DELAY_MS = 1500
/** How far back the callback looks for a userPermissionsChange push. */
const WEBHOOK_LOOKBACK_MS = 10 * 60 * 1000
/** A known "off" is re-checked with Garmin at most this often. */
const RECHECK_AFTER_MS = 10 * 60 * 1000
/** An empty answer this soon after connecting is not trusted as "off". */
const FRESH_CONNECTION_MS = 10 * 60 * 1000
/** Per-instance floor between two re-checks for the same user. */
const MIN_RECHECK_INTERVAL_MS = 60 * 1000
/** Pages never wait longer than this for Garmin. */
const RECHECK_TIMEOUT_MS = 2500

type PermissionFields = { permissions: string[]; permissionsUpdatedAt: Date | null }
type ConnectionPermissions = PermissionFields & { isActive: boolean }

export type SharingState = "on" | "off" | "unknown"

export function sharingState(c: PermissionFields): SharingState {
  if (c.permissions.includes(ACTIVITY_EXPORT)) return "on"
  return c.permissionsUpdatedAt ? "off" : "unknown"
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((p): p is string => typeof p === "string") : null)

/**
 * Permissions right after the token exchange. Retries once if the call fails or
 * comes back empty. Returns null when we still can't be sure (never a false "off").
 */
export async function fetchPermissionsOnConnect(accessToken: string): Promise<string[] | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const permissions = await getGarminPermissions(accessToken)
      if (permissions.length > 0) return permissions
      console.warn("[garmin/permissions] empty on connect", { attempt })
    } catch (e) {
      console.error("[garmin/permissions] lookup failed on connect", { attempt, ...describeGarminError(e) })
    }
    if (attempt === 1) await sleep(CONNECT_RETRY_DELAY_MS)
  }
  return null
}

/**
 * Latest userPermissionsChange push for this Garmin user in the last minutes.
 * Garmin can send it before our connection row exists (first connect), in which
 * case the webhook couldn't apply it — the callback picks it up from here.
 */
export async function recentWebhookPermissions(garminUserId: string): Promise<string[] | null> {
  const events = await prisma.garminWebhookEvent.findMany({
    where: {
      summaryType: "userPermissionsChange",
      receivedAt: { gte: new Date(Date.now() - WEBHOOK_LOOKBACK_MS) },
    },
    orderBy: { receivedAt: "desc" },
    take: 20,
    select: { payload: true },
  })
  for (const { payload } of events) {
    const list = (payload as { userPermissionsChange?: unknown } | null)?.userPermissionsChange
    if (!Array.isArray(list)) continue
    for (let i = list.length - 1; i >= 0; i--) {
      const item = list[i] as { userId?: unknown; permissions?: unknown } | null
      const permissions = item?.userId === garminUserId ? strings(item.permissions) : null
      if (permissions) return permissions
    }
  }
  return null
}

/** True when a page should ask Garmin again before showing the sharing state. */
export function needsPermissionsRecheck(c: ConnectionPermissions | null | undefined): boolean {
  if (!c?.isActive || sharingState(c) === "on") return false
  if (!c.permissionsUpdatedAt) return true
  return Date.now() - c.permissionsUpdatedAt.getTime() > RECHECK_AFTER_MS
}

const lastRecheck = new Map<string, number>()

/**
 * Ask Garmin for the current permissions and store them. Returns the fresh
 * values, or null if nothing changed (rate-limited, timed out, failed, or an
 * empty answer too soon after connecting to trust).
 */
export async function recheckGarminPermissions(userId: string): Promise<ConnectionPermissions | null> {
  const now = Date.now()
  if (now - (lastRecheck.get(userId) ?? 0) < MIN_RECHECK_INTERVAL_MS) return null
  if (lastRecheck.size > 1000) lastRecheck.clear()
  lastRecheck.set(userId, now)

  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), RECHECK_TIMEOUT_MS)
  })
  try {
    return await Promise.race([recheck(userId), timeout])
  } catch (e) {
    console.error("[garmin/permissions] recheck failed", describeGarminError(e))
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function recheck(userId: string): Promise<ConnectionPermissions | null> {
  const conn = await prisma.deviceConnectionGarmin.findUnique({ where: { userId } })
  if (!conn?.isActive) return null
  const permissions = await getGarminPermissions(await getValidAccessToken(conn))
  if (permissions.length === 0 && Date.now() - conn.connectedAt.getTime() < FRESH_CONNECTION_MS) {
    return null
  }
  return prisma.deviceConnectionGarmin.update({
    where: { id: conn.id },
    data: { permissions, permissionsUpdatedAt: new Date() },
    select: { isActive: true, permissions: true, permissionsUpdatedAt: true },
  })
}
