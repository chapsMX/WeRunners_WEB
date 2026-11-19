// Server-only: the global club leaderboard (/leaderboard, dashboard, club page).
// Ranks active clubs by the kilometers that count for them (countsForLeaderboard:
// device-recorded, plausible, non-duplicate runs of members after joining —
// only those carry a clubId). Periods are UTC: week = Monday 00:00, month = 1st.
// Live aggregates: fine at today's scale; move to ClubStats / LeaderboardEntry
// snapshots (and rank-change arrows) when it isn't.
import { prisma } from "@/lib/prisma"

type Db = Pick<typeof prisma, "activity" | "club">

export const LEADERBOARD_PERIODS = ["month", "week"] as const
export type LeaderboardPeriod = (typeof LEADERBOARD_PERIODS)[number]

export function parseLeaderboardPeriod(value: unknown): LeaderboardPeriod {
  return value === "week" ? "week" : "month"
}

/** First instant of the period in UTC (week starts on Monday). */
export function leaderboardPeriodStart(period: LeaderboardPeriod, now = new Date()): Date {
  if (period === "month") return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const daysSinceMonday = (now.getUTCDay() + 6) % 7
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday))
}

export type LeaderboardClub = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  city: string | null
  country: string
}

export type ClubLeaderboardRow = {
  /** Competition ranking (ties share a place: 1, 1, 3). null = no counted km yet. */
  rank: number | null
  club: LeaderboardClub
  distanceMeters: number
  activities: number
  /** Runners with counted km in the period. */
  runners: number
  /** distanceMeters / runners (informative; the ranking is total km). */
  metersPerRunner: number
}

export type ClubLeaderboard = {
  period: LeaderboardPeriod
  start: Date
  rows: ClubLeaderboardRow[]
  /** Clubs with counted km in the period. */
  rankedClubs: number
}

/**
 * Ranked clubs first (km desc, then name), then clubs without km yet (by name),
 * so a new club can still find itself on the board.
 */
export function rankClubs(
  clubs: LeaderboardClub[],
  totals: Map<string, { meters: number; activities: number; runners: number }>
): ClubLeaderboardRow[] {
  const rows = clubs.map((club) => {
    const t = totals.get(club.id) ?? { meters: 0, activities: 0, runners: 0 }
    return {
      rank: null as number | null,
      club,
      distanceMeters: t.meters,
      activities: t.activities,
      runners: t.runners,
      metersPerRunner: t.runners > 0 ? t.meters / t.runners : 0,
    }
  })
  rows.sort((a, b) => b.distanceMeters - a.distanceMeters || a.club.name.localeCompare(b.club.name))
  rows.forEach((row, i) => {
    if (row.distanceMeters <= 0) return
    const prev = rows[i - 1]
    row.rank = prev && prev.distanceMeters === row.distanceMeters ? prev.rank : i + 1
  })
  return rows
}

export async function getClubLeaderboard(
  period: LeaderboardPeriod,
  now = new Date(),
  db: Db = prisma
): Promise<ClubLeaderboard> {
  const start = leaderboardPeriodStart(period, now)
  const where = { countsForLeaderboard: true, clubId: { not: null }, activityDate: { gte: start } }
  const [clubs, perClub, perRunner] = await Promise.all([
    db.club.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true, logoUrl: true, city: true, country: true },
    }),
    db.activity.groupBy({ by: ["clubId"], where, _sum: { distanceMeters: true }, _count: true }),
    db.activity.groupBy({ by: ["clubId", "userId"], where }),
  ])

  const runners = new Map<string, number>()
  for (const r of perRunner) if (r.clubId) runners.set(r.clubId, (runners.get(r.clubId) ?? 0) + 1)
  const totals = new Map<string, { meters: number; activities: number; runners: number }>()
  for (const c of perClub) {
    if (!c.clubId) continue
    totals.set(c.clubId, { meters: c._sum.distanceMeters ?? 0, activities: c._count, runners: runners.get(c.clubId) ?? 0 })
  }

  const rows = rankClubs(clubs, totals)
  return { period, start, rows, rankedClubs: rows.filter((r) => r.rank != null).length }
}

/** A club's place on the board (dashboard hero, club page badge). */
export type ClubWorldRank = { rank: number | null; rankedClubs: number; distanceMeters: number }

export async function getClubWorldRank(
  clubId: string,
  period: LeaderboardPeriod = "month",
  now = new Date(),
  db: Db = prisma
): Promise<ClubWorldRank | null> {
  const board = await getClubLeaderboard(period, now, db)
  const row = board.rows.find((r) => r.club.id === clubId)
  return row ? { rank: row.rank, rankedClubs: board.rankedClubs, distanceMeters: row.distanceMeters } : null
}
