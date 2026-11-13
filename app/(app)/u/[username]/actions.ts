"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getFollowViewer } from "@/lib/follows"

export type FollowResult =
  | { ok: true; following: boolean }
  | { ok: false; error: "unauthorized" | "not_found" | "self" }

/** Follow (true) or unfollow (false) a runner by username. Idempotent. */
export async function setFollow(targetUsername: string, follow: boolean): Promise<FollowResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  const viewer = await getFollowViewer(session?.user.id)
  if (!viewer) return { ok: false, error: "unauthorized" }

  const target = await prisma.user.findUnique({
    where: { username: targetUsername.toLowerCase() },
    select: { id: true, username: true },
  })
  if (!target?.username) return { ok: false, error: "not_found" }
  if (target.id === viewer.id) return { ok: false, error: "self" }

  const pair = { followerId: viewer.id, followingId: target.id }
  if (follow) {
    await prisma.follow.createMany({ data: [pair], skipDuplicates: true })
  } else {
    await prisma.follow.deleteMany({ where: pair })
  }

  for (const u of [target.username, viewer.username]) {
    revalidatePath(`/u/${u}`)
    revalidatePath(`/u/${u}/followers`)
    revalidatePath(`/u/${u}/following`)
  }
  return { ok: true, following: follow }
}
