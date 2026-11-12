// Server-only: turns Garmin push payloads into our data.
// Fairness rules: docs/device-integrations.md. Every handler takes a
// transaction client so a whole webhook event is applied atomically (and so
// tests can run inside a rolled-back transaction).
import type { ActivityType, ExclusionReason, Prisma } from "@prisma/client"

type Tx = Prisma.TransactionClient

// ── Activity types ──────────────────────────────────────────
// Only running is stored. OBSTACLE_RUN / VIRTUAL_RUN are open questions
// (roadmap) → ignored until decided.
const RUN_TYPES: Record<string, ActivityType> = {
  RUNNING: "RUN",
  STREET_RUNNING: "RUN",
  TRACK_RUNNING: "RUN",
  ULTRA_RUN: "RUN",
  TRAIL_RUNNING: "TRAIL",
  TREADMILL_RUNNING: "TREADMILL", // indoor counts the same as GPS (fairness rules)
  INDOOR_RUNNING: "TREADMILL",
}

/** Faster than this (seconds per km) is treated as not a run (e.g. a bike). */
export const IMPLAUSIBLE_PACE_SEC_PER_KM = 150 // 2:30 min/km

/** Same run recorded on two watches: starts within this window. */
const DUPLICATE_START_WINDOW_SEC = 5 * 60

/** Subset of the Activity API v2.1 activity summary we use. */
export type GarminActivitySummary = {
  userId: string
  summaryId: string
  activityId?: number | string
  activityName?: string
  activityType: string
  startTimeInSeconds: number
  startTimeOffsetInSeconds?: number
  durationInSeconds: number
  distanceInMeters?: number
  totalElevationGainInMeters?: number
  totalElevationLossInMeters?: number
  averageHeartRateInBeatsPerMinute?: number
  maxHeartRateInBeatsPerMinute?: number
  averageRunCadenceInStepsPerMinute?: number
  activeKilocalories?: number
  startingLatitudeInDegree?: number
  startingLongitudeInDegree?: number
  deviceName?: string
  manual?: boolean
  isWebUpload?: boolean
  isParent?: boolean
  parentSummaryId?: string | number
}

export type ActivityOutcome =
  | { status: "stored"; counts: boolean; reason: ExclusionReason | null }
  | { status: "skipped"; why: "unknown_user" | "not_running" | "multisport_parent" | "invalid" }

const int = (n: number | undefined | null) =>
  typeof n === "number" && Number.isFinite(n) ? Math.round(n) : null

/** Club membership active on the day the run happened (not the sync day). */
async function clubOnDate(tx: Tx, userId: string, at: Date) {
  const active = await tx.clubMembership.findFirst({
    where: {
      userId,
      joinedAt: { lte: at },
      OR: [{ leftAt: null }, { leftAt: { gt: at } }],
    },
    orderBy: { joinedAt: "desc" },
    select: { clubId: true },
  })
  if (active) return { clubId: active.clubId, reason: null }
  // Has a club, but joined after this run → no backfill for clubs.
  const later = await tx.clubMembership.findFirst({
    where: { userId, joinedAt: { gt: at } },
    select: { id: true },
  })
  return { clubId: null, reason: later ? ("BEFORE_JOIN" as const) : ("NO_CLUB" as const) }
}

/** Another counting run of this user, from a different device, starting at ~the same time. */
async function findDuplicate(
  tx: Tx,
  userId: string,
  externalId: string,
  start: Date,
  deviceName: string | null
) {
  const w = DUPLICATE_START_WINDOW_SEC * 1000
  return tx.activity.findFirst({
    where: {
      userId,
      source: "GARMIN",
      externalId: { not: externalId },
      countsForLeaderboard: true,
      activityDate: { gte: new Date(start.getTime() - w), lte: new Date(start.getTime() + w) },
      ...(deviceName ? { NOT: { deviceName } } : {}),
    },
    select: { id: true },
  })
}

/** Store (or update) one Garmin activity summary applying the fairness rules. */
export async function ingestGarminActivity(
  tx: Tx,
  s: GarminActivitySummary
): Promise<ActivityOutcome> {
  if (!s?.summaryId || !s.userId || typeof s.startTimeInSeconds !== "number") {
    return { status: "skipped", why: "invalid" }
  }
  if (s.isParent) return { status: "skipped", why: "multisport_parent" } // children carry the run
  const activityType = RUN_TYPES[s.activityType]
  if (!activityType) return { status: "skipped", why: "not_running" }

  const conn = await tx.deviceConnectionGarmin.findFirst({
    where: { garminUserId: s.userId, isActive: true },
    select: { id: true, userId: true },
  })
  if (!conn) return { status: "skipped", why: "unknown_user" }

  const userId = conn.userId
  const externalId = String(s.summaryId)
  const activityDate = new Date(s.startTimeInSeconds * 1000)
  const distanceMeters = int(s.distanceInMeters) ?? 0
  const durationSeconds = int(s.durationInSeconds) ?? 0
  const avgPaceSecPerKm =
    distanceMeters > 0 && durationSeconds > 0 ? Math.round(durationSeconds / (distanceMeters / 1000)) : null
  const deviceName = s.deviceName?.trim() || null
  const isManual = Boolean(s.manual)
  const isWebUpload = Boolean(s.isWebUpload)

  // ── Fairness: decide whether it counts for the club, and why not ──
  let reason: ExclusionReason | null = null
  let clubId: string | null = null
  if (isManual) reason = "MANUAL"
  else if (isWebUpload) reason = "WEB_UPLOAD"
  else {
    const club = await clubOnDate(tx, userId, activityDate)
    if (club.reason) reason = club.reason
    else if (avgPaceSecPerKm !== null && avgPaceSecPerKm < IMPLAUSIBLE_PACE_SEC_PER_KM) {
      reason = "IMPLAUSIBLE_PACE"
    } else if (await findDuplicate(tx, userId, externalId, activityDate, deviceName)) {
      reason = "DUPLICATE"
    } else {
      clubId = club.clubId
    }
  }
  const countsForLeaderboard = reason === null
  // clubId is only set on runs that count, so club totals are a plain SUM by clubId.

  const data = {
    clubId: countsForLeaderboard ? clubId : null,
    distanceMeters,
    durationSeconds,
    elevationGainMeters: int(s.totalElevationGainInMeters),
    elevationLossMeters: int(s.totalElevationLossInMeters),
    activityDate,
    title: s.activityName?.trim() || null,
    activityType,
    avgPaceSecPerKm,
    avgHeartRate: int(s.averageHeartRateInBeatsPerMinute),
    maxHeartRate: int(s.maxHeartRateInBeatsPerMinute),
    avgCadence: int(s.averageRunCadenceInStepsPerMinute),
    calories: int(s.activeKilocalories),
    startLat: s.startingLatitudeInDegree ?? null,
    startLng: s.startingLongitudeInDegree ?? null,
    providerActivityType: s.activityType,
    startTimeOffsetSeconds: int(s.startTimeOffsetInSeconds),
    deviceName,
    parentExternalId: s.parentSummaryId != null ? String(s.parentSummaryId) : null,
    isManual,
    isWebUpload,
    countsForLeaderboard,
    exclusionReason: reason,
  }

  // Garmin can resend an updated summary for the same summaryId → upsert.
  await tx.activity.upsert({
    where: { userId_source_externalId: { userId, source: "GARMIN", externalId } },
    create: { userId, source: "GARMIN", externalId, ...data },
    update: data,
  })
  await tx.deviceConnectionGarmin.update({ where: { id: conn.id }, data: { lastSyncAt: new Date() } })

  return { status: "stored", counts: countsForLeaderboard, reason }
}

// ── Deregistrations / permissions ───────────────────────────

/** User removed W3Runn3rs in Garmin Connect (or after our DELETE /registration). */
export async function ingestGarminDeregistration(tx: Tx, garminUserId: string): Promise<boolean> {
  const conn = await tx.deviceConnectionGarmin.findUnique({
    where: { garminUserId },
    select: { id: true, userId: true, isActive: true },
  })
  if (!conn || !conn.isActive) return false
  await tx.deviceConnectionGarmin.update({
    where: { id: conn.id },
    data: { isActive: false, deregisteredAt: new Date(), accessToken: "", refreshToken: "" },
  })
  await tx.user.updateMany({
    where: { id: conn.userId, connectedProvider: "GARMIN" },
    data: { connectedProvider: null },
  })
  return true
}

/** Permissions changed after connecting (e.g. activity sharing turned off). */
export async function ingestGarminPermissions(
  tx: Tx,
  garminUserId: string,
  permissions: string[],
  changedAt?: number
): Promise<boolean> {
  const result = await tx.deviceConnectionGarmin.updateMany({
    where: { garminUserId },
    data: {
      permissions: permissions.filter((p) => typeof p === "string"),
      permissionsUpdatedAt: changedAt ? new Date(changedAt * 1000) : new Date(),
    },
  })
  return result.count > 0
}

// ── Whole payload ───────────────────────────────────────────

export type PayloadSummary = Record<string, number>

/**
 * Apply one push payload. Known keys: activities, deregistrations,
 * userPermissionsChange. Other summary types are counted and ignored.
 */
export async function ingestGarminPayload(tx: Tx, payload: unknown): Promise<PayloadSummary> {
  const out: PayloadSummary = {}
  const bump = (k: string) => (out[k] = (out[k] ?? 0) + 1)
  if (!payload || typeof payload !== "object") return { invalid_payload: 1 }

  for (const [key, list] of Object.entries(payload as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue
    for (const item of list) {
      if (key === "activities") {
        const r = await ingestGarminActivity(tx, item as GarminActivitySummary)
        bump(r.status === "stored" ? (r.counts ? "counted" : `excluded_${r.reason}`) : `skipped_${r.why}`)
      } else if (key === "deregistrations") {
        bump((await ingestGarminDeregistration(tx, (item as { userId: string }).userId)) ? "deregistered" : "deregistration_unknown")
      } else if (key === "userPermissionsChange") {
        const p = item as { userId: string; permissions?: string[]; changeTimeInSeconds?: number }
        bump((await ingestGarminPermissions(tx, p.userId, p.permissions ?? [], p.changeTimeInSeconds)) ? "permissions_updated" : "permissions_unknown")
      } else {
        bump(`ignored_${key}`)
      }
    }
  }
  return out
}
