// Server-only: everything the runner dashboard and the public profile show.
// Real data only (no sample fallback): empty states when there's nothing yet.
import { prisma } from "@/lib/prisma"
import { getPendingClubRequest, getPendingJoinRequest } from "@/lib/clubs"
import {
  needsPermissionsRecheck,
  recheckGarminPermissions,
  sharingState,
} from "@/lib/garmin/permissions"

// ─────────────────────────────────────────────────────────────
// Types the UI consumes
// ─────────────────────────────────────────────────────────────

export type ActivityRow = {
  id: string
  title: string
  type: string // RUN, TRAIL, TREADMILL, ...
  distanceMeters: number
  durationSeconds: number
  avgPaceSecPerKm: number | null
  date: Date
  source: string // GARMIN, POLAR, MANUAL, ...
  /** Club the run counted for (snapshot at ingestion); null if it didn't count. */
  clubName: string | null
  clubSlug: string | null
}

export type PersonalRecordRow = {
  /** Enum PRDistance (K5, K10, HALF_MARATHON, ...). */
  key: string
  durationSeconds: number
}

/** The runner's active club membership (hero: "Running with … · Since …"). */
export type DashboardMembership = {
  clubName: string
  clubSlug: string
  logoUrl: string | null
  city: string | null
  country: string
  joinedAt: Date
} | null

/** One leaderboard position: competition ranking (ties share a place: 1, 1, 3). */
export type RankPosition = {
  /** null = no counted km in the period yet. */
  rank: number | null
  /** Runners with counted km in the period. */
  runners: number
  distanceMeters: number
}

/**
 * "Your monthly ranking in <club>": everything month to date (UTC), counted
 * runs only. null = the runner has no club.
 */
export type MonthlyClubStats = {
  rank: RankPosition
  /** Counted runs this month. */
  activities: number
  /** Km added to the club this month. */
  contributionMeters: number
  /** contributionMeters as % of the club's km this month. */
  productivityPct: number
} | null

/** "Your numbers": all of the runner's runs, all time. */
export type PersonalTotals = {
  totalDistanceMeters: number
  totalActivities: number
  longestRunMeters: number
  /** Total time / total distance. null = no runs with distance. */
  avgPaceSecPerKm: number | null
}

/** Latest counted runs of the runner's club. */
export type ClubFeedRow = {
  id: string
  name: string
  username: string | null
  image: string | null
  distanceMeters: number
  date: Date
}

export type DashboardData = {
  membership: DashboardMembership
  /** No club yet, but their club request is waiting for approval. */
  pendingClubRequest: { clubName: string } | null
  /** No club yet, but they asked to join one that requires approval. */
  pendingJoinRequest: { clubName: string } | null
  monthly: MonthlyClubStats
  totals: PersonalTotals
  /** The runner's personal records (time-based). Empty = none yet. */
  records: PersonalRecordRow[]
  recent: ActivityRow[]
  clubFeed: ClubFeedRow[]
  /** The runner's own dashboard banner (Vercel Blob). null = default image. Independent of the club banner. */
  bannerUrl: string | null
  deviceConnected: boolean
  /** Connected, but the user didn't share activities (Garmin ACTIVITY_EXPORT off). */
  activitySharingOff: boolean
}

export const RECENT_LIMIT = 5
export const CLUB_FEED_LIMIT = 10

// ─────────────────────────────────────────────────────────────
// Loader
// ─────────────────────────────────────────────────────────────

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [user, membership, recentActivities, prRecords, totals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        bannerUrl: true,
        connectedProvider: true,
        garminConnection: {
          select: { isActive: true, permissions: true, permissionsUpdatedAt: true },
        },
      },
    }),
    // activeUserId is the one-active-club guarantee (unique while active).
    prisma.clubMembership.findUnique({
      where: { activeUserId: userId },
      include: { club: true },
    }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { activityDate: "desc" },
      take: RECENT_LIMIT,
      select: {
        id: true,
        title: true,
        activityType: true,
        distanceMeters: true,
        durationSeconds: true,
        avgPaceSecPerKm: true,
        activityDate: true,
        source: true,
        club: { select: { name: true, slug: true } },
      },
    }),
    prisma.personalRecord.findMany({
      where: { userId },
      select: { distance: true, durationSeconds: true },
    }),
    getPersonalTotals(userId),
  ])

  const deviceConnected = Boolean(user?.connectedProvider)
  // Sharing off/unknown → ask Garmin again (rate-limited) before warning.
  let garmin = user?.garminConnection
  if (needsPermissionsRecheck(garmin)) {
    garmin = (await recheckGarminPermissions(userId)) ?? garmin
  }
  const activitySharingOff = Boolean(garmin?.isActive && sharingState(garmin) === "off")

  const clubId = membership?.clubId ?? null
  const [monthly, clubFeed, pendingClubRequest, pendingJoinRequest] = await Promise.all([
    getMonthlyClubStats(userId, clubId),
    clubId ? getClubFeed(clubId) : Promise.resolve([]),
    !membership && user?.email
      ? getPendingClubRequest(prisma, userId, user.email).then((r) => (r ? { clubName: r.clubName } : null))
      : Promise.resolve(null),
    !membership
      ? getPendingJoinRequest(prisma, userId).then((r) => (r ? { clubName: r.club.name } : null))
      : Promise.resolve(null),
  ])

  return {
    membership: membership?.club
      ? {
          clubName: membership.club.name,
          clubSlug: membership.club.slug,
          logoUrl: membership.club.logoUrl,
          city: membership.club.city,
          country: membership.club.country,
          joinedAt: membership.joinedAt,
        }
      : null,
    pendingClubRequest,
    pendingJoinRequest,
    monthly,
    totals,
    records: realRecords(prRecords),
    recent: recentActivities.map((a) => ({
      id: a.id,
      title: a.title ?? "Run",
      type: a.activityType,
      distanceMeters: a.distanceMeters,
      durationSeconds: a.durationSeconds,
      avgPaceSecPerKm: a.avgPaceSecPerKm,
      date: a.activityDate,
      source: a.source,
      clubName: a.club?.name ?? null,
      clubSlug: a.club?.slug ?? null,
    })),
    clubFeed,
    bannerUrl: user?.bannerUrl ?? null,
    deviceConnected,
    activitySharingOff,
  }
}

// ─────────────────────────────────────────────────────────────
// Monthly club stats: live aggregates over runs that count for a club
// (countsForLeaderboard = device-recorded, plausible, non-duplicate runs of a
// club member after joining — only those carry a clubId). Fine at today's
// scale; move to ClubStats / snapshots when it isn't.
// ─────────────────────────────────────────────────────────────

/** First instant of the current month in UTC. */
export function startOfMonthUtc(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

/** Competition ranking of `userId` among per-runner totals (ties share a place). */
export function rankPosition(
  totals: { userId: string; meters: number }[],
  userId: string
): RankPosition {
  const ranked = totals.filter((t) => t.meters > 0)
  const mine = ranked.find((t) => t.userId === userId)?.meters ?? 0
  return {
    rank: mine > 0 ? ranked.filter((t) => t.meters > mine).length + 1 : null,
    runners: ranked.length,
    distanceMeters: mine,
  }
}

export async function getMonthlyClubStats(userId: string, clubId: string | null): Promise<MonthlyClubStats> {
  if (!clubId) return null
  const where = { clubId, countsForLeaderboard: true, activityDate: { gte: startOfMonthUtc() } }
  const [perRunner, mine] = await Promise.all([
    prisma.activity.groupBy({ by: ["userId"], where, _sum: { distanceMeters: true } }),
    prisma.activity.aggregate({ where: { ...where, userId }, _count: true }),
  ])
  const totals = perRunner.map((r) => ({ userId: r.userId, meters: r._sum.distanceMeters ?? 0 }))
  const clubMeters = totals.reduce((sum, t) => sum + t.meters, 0)
  const rank = rankPosition(totals, userId)
  return {
    rank,
    activities: mine._count,
    contributionMeters: rank.distanceMeters,
    productivityPct: clubMeters > 0 ? (rank.distanceMeters / clubMeters) * 100 : 0,
  }
}

// ─────────────────────────────────────────────────────────────
// Personal totals (all of the runner's runs, any source) and club feed
// ─────────────────────────────────────────────────────────────

export async function getPersonalTotals(userId: string): Promise<PersonalTotals> {
  const agg = await prisma.activity.aggregate({
    where: { userId },
    _sum: { distanceMeters: true, durationSeconds: true },
    _max: { distanceMeters: true },
    _count: true,
  })
  const distance = agg._sum.distanceMeters ?? 0
  const duration = agg._sum.durationSeconds ?? 0
  return {
    totalDistanceMeters: distance,
    totalActivities: agg._count,
    longestRunMeters: agg._max.distanceMeters ?? 0,
    avgPaceSecPerKm: distance > 0 && duration > 0 ? Math.round(duration / (distance / 1000)) : null,
  }
}

/** Latest runs that counted for the club, newest first. */
export async function getClubFeed(clubId: string): Promise<ClubFeedRow[]> {
  const rows = await prisma.activity.findMany({
    where: { clubId, countsForLeaderboard: true },
    orderBy: { activityDate: "desc" },
    take: CLUB_FEED_LIMIT,
    select: {
      id: true,
      distanceMeters: true,
      activityDate: true,
      user: { select: { name: true, username: true, image: true } },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.user.name || "Runner",
    username: r.user.username,
    image: r.user.image,
    distanceMeters: r.distanceMeters,
    date: r.activityDate,
  }))
}

/** Time-based records only; LONGEST_RUN (a distance) will be shown separately. */
function realRecords(rows: { distance: string; durationSeconds: number | null }[]): PersonalRecordRow[] {
  return rows
    .filter((r): r is typeof r & { durationSeconds: number } => r.durationSeconds != null)
    .map((r) => ({ key: r.distance, durationSeconds: r.durationSeconds }))
    .slice(0, 4)
}
