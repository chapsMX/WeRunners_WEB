// Server-only: data for the superadmin panel's Waitlist and Activity tabs.
import { prisma } from "@/lib/prisma"

type Db = typeof prisma

export const ADMIN_LATEST_ACTIVITIES = 15
const ACTIVE_WINDOW_DAYS = 30

// ── Waitlist ────────────────────────────────────────────────

export type WaitlistRow = {
  email: string
  name: string | null
  createdAt: Date
  beta: boolean
  /** Came through this club's invite link (which granted access). */
  inviteClubName: string | null
  /** Account in the app with this email. */
  account: { username: string | null; onboarded: boolean; clubName: string | null } | null
}

/** Everyone on the waitlist (oldest first) with their access/account status. */
export async function getWaitlistOverview(db: Db = prisma) {
  const entries = await db.waitlistEntry.findMany({
    orderBy: { createdAt: "asc" },
    select: { email: true, name: true, createdAt: true, betaAccess: true, inviteClub: { select: { name: true } } },
  })
  const users = await db.user.findMany({
    where: { email: { in: entries.map((e) => e.email), mode: "insensitive" } },
    select: {
      email: true,
      username: true,
      onboardingCompletedAt: true,
      memberships: { where: { activeUserId: { not: null } }, select: { club: { select: { name: true } } } },
    },
  })
  const byEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]))
  const rows: WaitlistRow[] = entries.map((e) => {
    const u = byEmail.get(e.email.toLowerCase())
    return {
      email: e.email,
      name: e.name,
      createdAt: e.createdAt,
      beta: e.betaAccess,
      inviteClubName: e.inviteClub?.name ?? null,
      account: u
        ? { username: u.username, onboarded: Boolean(u.onboardingCompletedAt), clubName: u.memberships[0]?.club.name ?? null }
        : null,
    }
  })
  return {
    rows,
    totals: {
      total: rows.length,
      withAccess: rows.filter((r) => r.beta).length,
      withAccount: rows.filter((r) => r.account).length,
      onboarded: rows.filter((r) => r.account?.onboarded).length,
    },
  }
}

// ── Activity ────────────────────────────────────────────────

export type ActiveUserRow = {
  id: string
  name: string
  username: string | null
  image: string | null
  clubName: string | null
  clubSlug: string | null
  device: string | null
  activities: number
  lastActivityAt: Date | null
  joinedAt: Date
}

export type LatestActivityRow = {
  id: string
  runner: { name: string; username: string | null }
  clubName: string | null
  distanceMeters: number
  durationSeconds: number
  activityDate: Date
  createdAt: Date
  source: string
  deviceName: string | null
  counts: boolean
  exclusionReason: string | null
}

/**
 * Active users = onboarded accounts (they can use the app), newest first,
 * with club, device, activity count and last run. Plus the latest runs
 * received (by ingestion time).
 */
export async function getActivityOverview(db: Db = prisma) {
  const since = new Date(Date.now() - ACTIVE_WINDOW_DAYS * 86_400_000)
  const [users, latest, perUser] = await Promise.all([
    db.user.findMany({
      where: { onboardingCompletedAt: { not: null } },
      orderBy: { onboardingCompletedAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        connectedProvider: true,
        onboardingCompletedAt: true,
        memberships: { where: { activeUserId: { not: null } }, select: { club: { select: { name: true, slug: true } } } },
      },
    }),
    db.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: ADMIN_LATEST_ACTIVITIES,
      select: {
        id: true,
        distanceMeters: true,
        durationSeconds: true,
        activityDate: true,
        createdAt: true,
        source: true,
        deviceName: true,
        countsForLeaderboard: true,
        exclusionReason: true,
        club: { select: { name: true } },
        user: { select: { name: true, username: true } },
      },
    }),
    db.activity.groupBy({ by: ["userId"], _count: true, _max: { activityDate: true } }),
  ])
  const stats = new Map(perUser.map((p) => [p.userId, { count: p._count, last: p._max.activityDate }]))

  const rows: ActiveUserRow[] = users.map((u) => {
    const s = stats.get(u.id)
    const club = u.memberships[0]?.club
    return {
      id: u.id,
      name: u.name || "Runner",
      username: u.username,
      image: u.image,
      clubName: club?.name ?? null,
      clubSlug: club?.slug ?? null,
      device: u.connectedProvider,
      activities: s?.count ?? 0,
      lastActivityAt: s?.last ?? null,
      joinedAt: u.onboardingCompletedAt!,
    }
  })

  return {
    users: rows,
    totals: {
      active: rows.length,
      withClub: rows.filter((r) => r.clubName).length,
      withDevice: rows.filter((r) => r.device).length,
      ranLast30Days: rows.filter((r) => r.lastActivityAt && r.lastActivityAt >= since).length,
    },
    latest: latest.map(
      (a): LatestActivityRow => ({
        id: a.id,
        runner: { name: a.user.name || "Runner", username: a.user.username },
        clubName: a.club?.name ?? null,
        distanceMeters: a.distanceMeters,
        durationSeconds: a.durationSeconds,
        activityDate: a.activityDate,
        createdAt: a.createdAt,
        source: a.source,
        deviceName: a.deviceName,
        counts: a.countsForLeaderboard,
        exclusionReason: a.exclusionReason,
      })
    ),
  }
}
