"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cancelJoinRequest, joinOrRequestClub, type JoinOutcome } from "@/lib/clubs"
import { sendJoinRequestEmails } from "@/lib/admin-emails"

/** Join an open club, or ask to join an approval club (emails its admins). */
export async function joinClubAction(clubId: string): Promise<JoinOutcome> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "not_found" }
  const before = await prisma.clubJoinRequest.findUnique({ where: { pendingUserId: session.user.id }, select: { id: true } })
  const outcome = await prisma.$transaction((tx) => joinOrRequestClub(tx, session.user.id, clubId))
  if (outcome.ok && outcome.status === "requested" && !before) {
    const [club, user] = await Promise.all([
      prisma.club.findUnique({ where: { id: clubId }, select: { slug: true } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, username: true } }),
    ])
    await sendJoinRequestEmails({
      clubId,
      clubName: outcome.clubName,
      clubSlug: club?.slug ?? "",
      runnerName: user?.name || "A runner",
      username: user?.username ?? null,
    })
  }
  revalidatePath("/clubs")
  revalidatePath("/dashboard")
  return outcome
}

export async function cancelJoinRequestAction(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return false
  const cancelled = await prisma.$transaction((tx) => cancelJoinRequest(tx, session.user.id))
  revalidatePath("/clubs")
  revalidatePath("/dashboard")
  return cancelled
}
