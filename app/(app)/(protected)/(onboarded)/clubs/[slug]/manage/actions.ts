"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { assignOwner, searchOwnerCandidates, type OwnerCandidate } from "@/lib/club-owners"
import { sendClubOwnerEmail } from "@/lib/admin-emails"
import {
  isSuperadmin,
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

// ── Superadmin: choose the owner ────────────────────────────

export async function searchOwnersAction(clubId: string, query: string): Promise<OwnerCandidate[]> {
  const actor = await actorId()
  if (!(await isSuperadmin(actor))) return []
  return searchOwnerCandidates(prisma, query, clubId)
}

export type AssignOwnerActionResult =
  | { ok: true; kind: "assigned" | "invited"; email: string; emailed: boolean }
  | { ok: false; error: string; clubName?: string }

/** Make someone the owner (or invite them), then email them. */
export async function assignOwnerAction(
  clubId: string,
  target: { userId: string } | { email: string }
): Promise<AssignOwnerActionResult> {
  const actor = await actorId()
  if (!actor) return { ok: false, error: "forbidden" }
  const result = await prisma.$transaction((tx) => assignOwner(tx, actor, clubId, target))
  if (!result.ok) return { ok: false, error: result.error, clubName: result.clubName }

  const club = await prisma.club.findUnique({ where: { id: clubId }, select: { slug: true } })
  const emailed = await sendClubOwnerEmail({
    email: result.email,
    name: result.name,
    clubName: result.clubName,
    clubSlug: club?.slug ?? "",
    hasAccount: result.kind === "assigned",
  })
  await revalidateClub(clubId)
  return { ok: true, kind: result.kind, email: result.email, emailed }
}
