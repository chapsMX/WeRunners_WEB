// Server-only: the fairness rules every provider applies when a run arrives
// (docs/device-integrations.md). Decides whether the run counts for a club,
// which club (the one active on the day of the run), and why not otherwise.
import type { ActivitySource, ExclusionReason, Prisma } from "@prisma/client"

type Tx = Prisma.TransactionClient

/** Faster than this (seconds per km) is treated as not a run (e.g. a bike). */
export const IMPLAUSIBLE_PACE_SEC_PER_KM = 150 // 2:30 min/km

/** Same run recorded on two watches: starts within this window. */
export const DUPLICATE_START_WINDOW_SEC = 5 * 60

/** Club membership active on the day the run happened (not the sync day). */
export async function clubOnDate(tx: Tx, userId: string, at: Date) {
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

/** Another counting run of this user (same provider), from a different device, starting at ~the same time. */
export async function findDuplicate(
  tx: Tx,
  source: ActivitySource,
  userId: string,
  externalId: string,
  start: Date,
  deviceName: string | null
) {
  const w = DUPLICATE_START_WINDOW_SEC * 1000
  return tx.activity.findFirst({
    where: {
      userId,
      source,
      externalId: { not: externalId },
      countsForLeaderboard: true,
      activityDate: { gte: new Date(start.getTime() - w), lte: new Date(start.getTime() + w) },
      ...(deviceName ? { NOT: { deviceName } } : {}),
    },
    select: { id: true },
  })
}

export type FairnessInput = {
  source: ActivitySource
  userId: string
  externalId: string
  activityDate: Date
  deviceName: string | null
  isManual: boolean
  isWebUpload: boolean
  avgPaceSecPerKm: number | null
}

/**
 * Order matters: manual → web upload → club on the day → implausible pace →
 * duplicate. clubId is only set on runs that count, so club totals are a plain
 * SUM by clubId.
 */
export async function decideFairness(
  tx: Tx,
  r: FairnessInput
): Promise<{ countsForLeaderboard: boolean; reason: ExclusionReason | null; clubId: string | null }> {
  let reason: ExclusionReason | null = null
  let clubId: string | null = null
  if (r.isManual) reason = "MANUAL"
  else if (r.isWebUpload) reason = "WEB_UPLOAD"
  else {
    const club = await clubOnDate(tx, r.userId, r.activityDate)
    if (club.reason) reason = club.reason
    else if (r.avgPaceSecPerKm !== null && r.avgPaceSecPerKm < IMPLAUSIBLE_PACE_SEC_PER_KM) {
      reason = "IMPLAUSIBLE_PACE"
    } else if (await findDuplicate(tx, r.source, r.userId, r.externalId, r.activityDate, r.deviceName)) {
      reason = "DUPLICATE"
    } else {
      clubId = club.clubId
    }
  }
  return { countsForLeaderboard: reason === null, reason, clubId: reason === null ? clubId : null }
}
