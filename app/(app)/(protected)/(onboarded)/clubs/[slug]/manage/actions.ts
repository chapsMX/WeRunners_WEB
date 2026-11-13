"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  clearOwner,
  clubProfileFromForm,
  removeMember,
  setCollaborator,
  transferOwnership,
  updateClubProfile,
  type ClubOpResult,
} from "@/lib/club-admin"
import type { ClubFormState } from "@/components/app/clubs/ClubProfileForm"

async function actorId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

async function revalidateClub(clubId: string) {
  const club = await prisma.club.findUnique({ where: { id: clubId }, select: { slug: true } })
  if (club) revalidatePath(`/clubs/${club.slug}/manage`)
  revalidatePath("/admin/clubs")
  revalidatePath("/dashboard")
}

export async function updateClubProfileAction(
  clubId: string,
  _prev: ClubFormState,
  form: FormData
): Promise<ClubFormState> {
  const actor = await actorId()
  if (!actor) return { error: "forbidden" }
  const result = await prisma.$transaction((tx) => updateClubProfile(tx, actor, clubId, clubProfileFromForm(form)))
  if (!result.ok) return { error: result.error }
  await revalidateClub(clubId)
  return { ok: true }
}

export type MemberOp = "collaborator_on" | "collaborator_off" | "remove" | "make_owner" | "clear_owner"

export async function memberAction(clubId: string, memberId: string, op: MemberOp): Promise<ClubOpResult> {
  const actor = await actorId()
  if (!actor) return { ok: false, error: "forbidden" }
  const result = await prisma.$transaction((tx) => {
    switch (op) {
      case "collaborator_on":
        return setCollaborator(tx, actor, clubId, memberId, true)
      case "collaborator_off":
        return setCollaborator(tx, actor, clubId, memberId, false)
      case "remove":
        return removeMember(tx, actor, clubId, memberId)
      case "make_owner":
        return transferOwnership(tx, actor, clubId, memberId)
      case "clear_owner":
        return clearOwner(tx, actor, clubId)
    }
  })
  if (result.ok) await revalidateClub(clubId)
  return result
}
