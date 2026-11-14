// Server-only: data for the public club page (/clubs/<slug>).
// Month = UTC month to date, counted runs only (same rules as the dashboard).
import { prisma } from "@/lib/prisma"
import { startOfMonthUtc } from "@/lib/dashboard-data"

type Db = typeof prisma

export const CLUB_MONTH_ACTIVITY_LIMIT = 20
export const CLUB_LEADERBOARD_LIMIT = 50
const MEMBER_FACES = 4

export type ClubRunner = { id: string; name: string; username: string | null; image: string | null }

export type ClubPageData = {
  club: {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    bannerUrl: string | null
    city: string | null
    country: string
    memberCount: number
    requiresApproval: boolean
    socials: { instagram: string | null; twitter: string | null; tiktok: string | null; facebook: string | null }
  }
  /** Up to 4 random members, preferring ones with a photo. */
  faces: ClubRunner[]
  month: { distanceMeters: number; activities: number; runners: number }
  /** Latest counted runs this month. */
  activities: { id: string; runner: ClubRunner; distanceMeters: number; durationSeconds: number; avgPaceSecPerKm: number | null; date: Date }[]
  /** Monthly leaderboard by km; ties share a place. */
  leaderboard: { rank: number; runner: ClubRunner; distanceMeters: number; activities: number }[]
}

const runnerSelect = { id: true, name: true, username: true, image: true } as const
const toRunner = (u: { id: string; name: string | null; username: string | null; image: string | null }): ClubRunner => ({
  id: u.id,
  name: u.name || "Runner",
  username: u.username,
  image: u.image,
})

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function getClubPage(slug: string, db: Db = prisma): Promise<ClubPageData | null> {
  const club = await db.club.findFirst({
    where: { slug, active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      bannerUrl: true,
      city: true,
      country: true,
      memberCount: true,
      joinPolicy: true,
      instagram: true,
      twitter: true,
      tiktok: true,
      facebook: true,
    },
  })
  if (!club) return null

  const monthWhere = { clubId: club.id, countsForLeaderboard: true, activityDate: { gte: startOfMonthUtc() } }
  const [members, recent, perRunner] = await Promise.all([
    db.clubMembership.findMany({
      where: { clubId: club.id, activeUserId: { not: null } },
      take: 200,
      select: { user: { select: runnerSelect } },
    }),
    db.activity.findMany({
      where: monthWhere,
      orderBy: { activityDate: "desc" },
      take: CLUB_MONTH_ACTIVITY_LIMIT,
      select: {
        id: true,
        distanceMeters: true,
        durationSeconds: true,
        avgPaceSecPerKm: true,
        activityDate: true,
        user: { select: runnerSelect },
      },
    }),
    db.activity.groupBy({
      by: ["userId"],
      where: monthWhere,
      _sum: { distanceMeters: true },
      _count: true,
    }),
  ])

  const people = members.map((m) => toRunner(m.user))
  const withPhoto = shuffle(people.filter((p) => p.image))
  const faces = [...withPhoto, ...shuffle(people.filter((p) => !p.image))].slice(0, MEMBER_FACES)

  const sorted = perRunner
    .map((r) => ({ userId: r.userId, meters: r._sum.distanceMeters ?? 0, activities: r._count }))
    .filter((r) => r.meters > 0)
    .sort((a, b) => b.meters - a.meters)
  const top = sorted.slice(0, CLUB_LEADERBOARD_LIMIT)
  const users = await db.user.findMany({ where: { id: { in: top.map((t) => t.userId) } }, select: runnerSelect })
  const byId = new Map(users.map((u) => [u.id, toRunner(u)]))

  return {
    club: {
      id: club.id,
      name: club.name,
      slug: club.slug,
      description: club.description,
      logoUrl: club.logoUrl,
      bannerUrl: club.bannerUrl,
      city: club.city,
      country: club.country,
      memberCount: club.memberCount,
      requiresApproval: club.joinPolicy === "APPROVAL",
      socials: { instagram: club.instagram, twitter: club.twitter, tiktok: club.tiktok, facebook: club.facebook },
    },
    faces,
    month: {
      distanceMeters: sorted.reduce((s, r) => s + r.meters, 0),
      activities: sorted.reduce((s, r) => s + r.activities, 0),
      runners: sorted.length,
    },
    activities: recent.map((a) => ({
      id: a.id,
      runner: toRunner(a.user),
      distanceMeters: a.distanceMeters,
      durationSeconds: a.durationSeconds,
      avgPaceSecPerKm: a.avgPaceSecPerKm,
      date: a.activityDate,
    })),
    leaderboard: top
      .filter((t) => byId.has(t.userId))
      .map((t) => ({
        rank: sorted.filter((s) => s.meters > t.meters).length + 1,
        runner: byId.get(t.userId)!,
        distanceMeters: t.meters,
        activities: t.activities,
      })),
  }
}

/** What the signed-in viewer can do on a club page. */
export async function getClubViewerState(userId: string | null, clubId: string, db: Db = prisma) {
  if (!userId) return { signedIn: false as const }
  const [active, pending, user] = await Promise.all([
    db.clubMembership.findUnique({ where: { activeUserId: userId }, select: { clubId: true, role: true, club: { select: { ownerId: true } } } }),
    db.clubJoinRequest.findUnique({ where: { pendingUserId: userId }, select: { clubId: true } }),
    db.user.findUnique({ where: { id: userId }, select: { role: true, onboardingCompletedAt: true } }),
  ])
  const isMember = active?.clubId === clubId
  return {
    signedIn: true as const,
    onboarded: Boolean(user?.onboardingCompletedAt),
    isMember,
    inOtherClub: Boolean(active) && !isMember,
    pendingHere: pending?.clubId === clubId,
    pendingElsewhere: Boolean(pending) && pending?.clubId !== clubId,
    canManage: user?.role === "ADMIN" || (isMember && (active?.role === "ADMIN" || active?.club.ownerId === userId)),
  }
}
