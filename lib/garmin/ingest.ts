// Server-only: turns Garmin push payloads into our data.
// Fairness rules: docs/device-integrations.md. Every handler takes a
// transaction client so a whole webhook event is applied atomically (and so
// tests can run inside a rolled-back transaction).
import type { ActivityType, ExclusionReason, Prisma } from "@prisma/client"
import { decideFairness } from "@/lib/activity-fairness"
import { buildRouteShape, saveActivityRoute } from "@/lib/routes"

export { IMPLAUSIBLE_PACE_SEC_PER_KM } from "@/lib/activity-fairness"

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

/**
 * Keep the run summary exactly as Garmin sent it (garmin_activities), linked to
 * its canonical activity. Only runs are kept. Upsert: Garmin can resend a summaryId.
 */
async function storeRawGarminActivity(tx: Tx, s: GarminActivitySummary, activityId: string) {
  const data = {
    garminUserId: s.userId,
    garminActivityId: s.activityId != null ? String(s.activityId) : null,
    activityType: s.activityType,
    startTime: new Date(s.startTimeInSeconds * 1000),
    manual: Boolean(s.manual),
    isWebUpload: Boolean(s.isWebUpload),
    deviceName: s.deviceName?.trim() || null,
    raw: s as unknown as Prisma.InputJsonValue,
    activityId,
  }
  await tx.garminActivity.upsert({
    where: { summaryId: String(s.summaryId) },
    create: { summaryId: String(s.summaryId), ...data },
    update: data,
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
  // Multisport (e.g. triathlon): the run leg arrives as its own RUNNING child
  // and counts like any run; the parent and the other legs are not kept.
  if (s.isParent) return { status: "skipped", why: "multisport_parent" }
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

  // ── Fairness (shared rules): counts for the club, and why not ──
  const { countsForLeaderboard, reason, clubId } = await decideFairness(tx, {
    source: "GARMIN",
    userId,
    externalId,
    activityDate,
    deviceName,
    isManual,
    isWebUpload,
    avgPaceSecPerKm,
  })

  const data = {
    clubId,
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
  const activity = await tx.activity.upsert({
    where: { userId_source_externalId: { userId, source: "GARMIN", externalId } },
    create: { userId, source: "GARMIN", externalId, ...data },
    update: data,
    select: { id: true },
  })
  await storeRawGarminActivity(tx, s, activity.id)
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

// ── Activity details (route shape) ──────────────────────────

/** Activity Details push item (Activity API v2.1). Only what we read. */
export type GarminActivityDetails = {
  userId: string
  summaryId: string // "<activity summaryId>-detail"
  summary?: Omit<GarminActivitySummary, "userId" | "summaryId">
  samples?: { latitudeInDegree?: number; longitudeInDegree?: number }[]
}

export type RouteOutcome = "route_saved" | "route_none" | "route_unknown_user" | `route_skipped_${string}`

/**
 * Activity Details → the run's route shape (ActivityRoute). Only the shape is
 * kept (lib/routes); the GPS samples are dropped from the stored event after
 * processing (lib/garmin/events). Details can arrive before the activity
 * summary: then the run is ingested from the summary they carry (same
 * fairness rules; the later summary push upserts the same activity).
 */
export async function ingestGarminActivityDetails(tx: Tx, d: GarminActivityDetails): Promise<RouteOutcome> {
  if (!d?.summaryId || !d.userId) return "route_skipped_invalid"
  const externalId = String(d.summaryId).replace(/-detail$/, "")
  const conn = await tx.deviceConnectionGarmin.findFirst({
    where: { garminUserId: d.userId, isActive: true },
    select: { userId: true },
  })
  if (!conn) return "route_unknown_user"

  const where = { userId_source_externalId: { userId: conn.userId, source: "GARMIN" as const, externalId } }
  let activity = await tx.activity.findUnique({ where, select: { id: true } })
  if (!activity) {
    if (!d.summary) return "route_skipped_no_activity"
    const outcome = await ingestGarminActivity(tx, { ...d.summary, userId: d.userId, summaryId: externalId } as GarminActivitySummary)
    if (outcome.status !== "stored") return `route_skipped_${outcome.why}`
    activity = await tx.activity.findUnique({ where, select: { id: true } })
    if (!activity) return "route_skipped_no_activity"
  }

  const shape = buildRouteShape(
    (d.samples ?? []).map((s) => ({ lat: Number(s.latitudeInDegree), lon: Number(s.longitudeInDegree) }))
  )
  if (!shape) return "route_none" // treadmill / no GPS
  await saveActivityRoute(tx, activity.id, "GARMIN", shape)
  return "route_saved"
}

/** The stored event without GPS samples (privacy): only the shape is kept. */
export function stripActivityDetailSamples(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload
  const p = payload as Record<string, unknown>
  if (!Array.isArray(p.activityDetails)) return payload
  return {
    ...p,
    activityDetails: p.activityDetails.map((d) =>
      d && typeof d === "object" ? { ...(d as Record<string, unknown>), samples: [], samplesStripped: true } : d
    ),
  }
}

// ── Whole payload ───────────────────────────────────────────

export type PayloadSummary = Record<string, number>

/**
 * Apply one push payload. Known keys: activities, activityDetails (route
 * shape), deregistrations, userPermissionsChange. Other summary types are
 * counted and ignored.
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
      } else if (key === "activityDetails") {
        bump(await ingestGarminActivityDetails(tx, item as GarminActivityDetails))
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
