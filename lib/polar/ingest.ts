// Server-only: turns a Polar AccessLink exercise into our data, applying the
// shared fairness rules (lib/activity-fairness). Takes a transaction client.
import type { ActivityType, ExclusionReason, Prisma } from "@prisma/client"
import { decideFairness } from "@/lib/activity-fairness"
import { newShortId } from "@/lib/short-id"

type Tx = Prisma.TransactionClient

// detailed_sport_info → our type. Only running is stored; multisport run legs
// count like any run (decided 2026-11-12). Obstacle / water running: open question.
export const POLAR_RUN_TYPES: Record<string, ActivityType> = {
  RUNNING: "RUN",
  ROAD_RUNNING: "RUN",
  JOGGING: "RUN",
  TRACK_AND_FIELD_RUNNING: "RUN",
  ULTRARUNNING_RUNNING: "RUN",
  DUATHLON_RUNNING: "RUN",
  TRIATHLON_RUNNING: "RUN",
  TRAIL_RUNNING: "TRAIL",
  CROSS_COUNTRY_RUNNING: "TRAIL",
  OFFROADDUATHLON_RUNNING: "TRAIL",
  OFFROADTRIATHLON_RUNNING: "TRAIL",
  TREADMILL_RUNNING: "TREADMILL", // indoor counts the same as GPS
}

/** Subset of the AccessLink exercise we use (GET /v3/exercises/{id}). */
export type PolarExercise = {
  id: string
  upload_time?: string
  device?: string | null
  device_id?: string | null
  start_time: string // local time, e.g. "2026-11-18T07:30:00"
  start_time_utc_offset?: number // minutes
  duration?: string // ISO 8601, e.g. "PT54M47S"
  calories?: number
  distance?: number // meters
  heart_rate?: { average?: number; maximum?: number }
  sport?: string
  detailed_sport_info?: string
  has_route?: boolean
}

export type PolarOutcome =
  | { status: "stored"; counts: boolean; reason: ExclusionReason | null }
  | { status: "skipped"; why: "unknown_user" | "not_running" | "invalid" }

const int = (n: number | undefined | null) => (typeof n === "number" && Number.isFinite(n) ? Math.round(n) : null)

/** "PT1H2M3.5S" → 3724 (rounded). null if it isn't an ISO 8601 duration. */
export function parseIsoDuration(value: string | undefined): number | null {
  const m = value?.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/)
  if (!m || value === "P" || value === "PT") return null
  const [, d, h, min, s] = m
  return Math.round(Number(d ?? 0) * 86400 + Number(h ?? 0) * 3600 + Number(min ?? 0) * 60 + Number(s ?? 0))
}

/** start_time is the device's local time; UTC = local − offset. */
export function polarStartUtc(startTime: string, offsetMinutes: number | undefined): Date | null {
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(startTime)) {
    const d = new Date(startTime)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const m = startTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/)
  if (!m) return null
  const [, y, mo, da, h, mi, s, frac] = m
  const ms = Date.UTC(+y, +mo - 1, +da, +h, +mi, +(s ?? 0), frac ? Math.round(Number(`0.${frac}`) * 1000) : 0)
  return new Date(ms - (offsetMinutes ?? 0) * 60_000)
}

export async function ingestPolarExercise(tx: Tx, polarUserId: string, ex: PolarExercise): Promise<PolarOutcome> {
  if (!ex?.id || typeof ex.start_time !== "string") return { status: "skipped", why: "invalid" }
  const sportKey = ex.detailed_sport_info ?? ex.sport ?? ""
  const activityType = POLAR_RUN_TYPES[sportKey]
  if (!activityType) return { status: "skipped", why: "not_running" }
  const activityDate = polarStartUtc(ex.start_time, ex.start_time_utc_offset)
  if (!activityDate) return { status: "skipped", why: "invalid" }

  const conn = await tx.deviceConnectionPolar.findFirst({
    where: { polarUserId, isActive: true },
    select: { id: true, userId: true },
  })
  if (!conn) return { status: "skipped", why: "unknown_user" }

  const userId = conn.userId
  const externalId = String(ex.id)
  const distanceMeters = int(ex.distance) ?? 0
  const durationSeconds = parseIsoDuration(ex.duration) ?? 0
  const avgPaceSecPerKm =
    distanceMeters > 0 && durationSeconds > 0 ? Math.round(durationSeconds / (distanceMeters / 1000)) : null
  const deviceName = ex.device?.trim() || null
  // AccessLink has no manual/web-upload flag: an exercise without a Polar
  // device is treated as entered by hand (fail-closed: it doesn't count).
  const isManual = deviceName === null

  const { countsForLeaderboard, reason, clubId } = await decideFairness(tx, {
    source: "POLAR",
    userId,
    externalId,
    activityDate,
    deviceName,
    isManual,
    isWebUpload: false,
    avgPaceSecPerKm,
  })

  const data = {
    clubId,
    distanceMeters,
    durationSeconds,
    activityDate,
    activityType,
    avgPaceSecPerKm,
    avgHeartRate: int(ex.heart_rate?.average),
    maxHeartRate: int(ex.heart_rate?.maximum),
    calories: int(ex.calories),
    providerActivityType: sportKey,
    startTimeOffsetSeconds: typeof ex.start_time_utc_offset === "number" ? ex.start_time_utc_offset * 60 : null,
    deviceName,
    isManual,
    isWebUpload: false,
    countsForLeaderboard,
    exclusionReason: reason,
  }

  // Polar can notify again for the same exercise → upsert.
  const activity = await tx.activity.upsert({
    where: { userId_source_externalId: { userId, source: "POLAR", externalId } },
    create: { userId, source: "POLAR", externalId, shortId: newShortId(), ...data },
    update: data,
    select: { id: true },
  })
  const raw = {
    polarUserId,
    activityType: sportKey,
    startTime: activityDate,
    deviceName,
    raw: ex as unknown as Prisma.InputJsonValue,
    activityId: activity.id,
  }
  await tx.polarActivity.upsert({
    where: { exerciseId: externalId },
    create: { exerciseId: externalId, ...raw },
    update: raw,
  })
  await tx.deviceConnectionPolar.update({ where: { id: conn.id }, data: { lastSyncAt: new Date() } })
  return { status: "stored", counts: countsForLeaderboard, reason }
}
