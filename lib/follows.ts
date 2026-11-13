// Server-only: follow graph (one-way follows, no approval — profiles are public).
import { prisma } from "@/lib/prisma"

export type FollowCounts = { following: number; followers: number }

export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  const [following, followers] = await Promise.all([
    // Same filter as the lists: only onboarded runners.
    prisma.follow.count({ where: { followerId: userId, following: { username: { not: null } } } }),
    prisma.follow.count({ where: { followingId: userId, follower: { username: { not: null } } } }),
  ])
  return { following, followers }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const row = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { followerId: true },
  })
  return row !== null
}

export type FollowListKind = "followers" | "following"

export type FollowListItem = {
  id: string
  name: string
  username: string
  image: string | null
  /** The signed-in viewer follows this runner. */
  viewerFollows: boolean
  isViewer: boolean
}

export const FOLLOW_LIST_LIMIT = 100

/** Newest first. Only onboarded runners (with a username) are listed. */
export async function listFollows(
  userId: string,
  kind: FollowListKind,
  viewerId: string | null
): Promise<FollowListItem[]> {
  const select = { id: true, name: true, username: true, image: true } as const
  const rows =
    kind === "followers"
      ? (
          await prisma.follow.findMany({
            where: { followingId: userId, follower: { username: { not: null } } },
            orderBy: { createdAt: "desc" },
            take: FOLLOW_LIST_LIMIT,
            select: { follower: { select } },
          })
        ).map((r) => r.follower)
      : (
          await prisma.follow.findMany({
            where: { followerId: userId, following: { username: { not: null } } },
            orderBy: { createdAt: "desc" },
            take: FOLLOW_LIST_LIMIT,
            select: { following: { select } },
          })
        ).map((r) => r.following)

  const viewerFollows = new Set<string>()
  if (viewerId && rows.length > 0) {
    const mine = await prisma.follow.findMany({
      where: { followerId: viewerId, followingId: { in: rows.map((r) => r.id) } },
      select: { followingId: true },
    })
    mine.forEach((m) => viewerFollows.add(m.followingId))
  }

  return rows.map((r) => ({
    id: r.id,
    name: r.name || "Runner",
    username: r.username as string,
    image: r.image,
    viewerFollows: viewerFollows.has(r.id),
    isViewer: r.id === viewerId,
  }))
}

/** The signed-in runner who may follow others: onboarded (has a username). */
export async function getFollowViewer(userId: string | undefined) {
  if (!userId) return null
  return prisma.user.findFirst({
    where: { id: userId, onboardingCompletedAt: { not: null }, username: { not: null } },
    select: { id: true, username: true },
  })
}
