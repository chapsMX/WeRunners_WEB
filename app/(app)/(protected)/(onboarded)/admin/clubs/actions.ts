"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clubProfileFromForm, createClub, isSuperadmin } from "@/lib/club-admin"
import { approveRegistration } from "@/lib/clubs"
import { grantBetaAccess } from "@/lib/club-owners"
import { sendBetaAccessEmail, sendClubApprovedEmail, sendClubOwnerEmail } from "@/lib/admin-emails"
import type { ClubFormState } from "@/components/app/clubs/ClubProfileForm"

async function actorId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

export type AdminActionResult = { ok: boolean; emailed?: boolean }

export async function createClubAction(_prev: ClubFormState, form: FormData): Promise<ClubFormState> {
  const actor = await actorId()
  if (!actor) return { error: "forbidden" }
  const input = clubProfileFromForm(form)
  const result = await prisma.$transaction((tx) =>
    createClub(tx, actor, { ...input, name: input.name ?? "", country: input.country ?? "" })
  )
  if (!result.ok) return { error: result.error }
  revalidatePath("/admin/clubs")
  revalidatePath("/onboarding")
  return { ok: true, slug: result.slug }
}

/**
 * Approve a club registration. Emails the runner who asked for it (now its
 * owner) and the club's own address (if it's a different email).
 */
export async function approveRegistrationAction(registrationId: string): Promise<AdminActionResult> {
  const actor = await actorId()
  if (!actor) return { ok: false }
  const result = await prisma.$transaction((tx) => approveRegistration(tx, actor, registrationId))
  if (!result.ok) return { ok: false }
  const sends: Promise<boolean>[] = []
  if (result.owner) {
    sends.push(
      sendClubOwnerEmail({
        email: result.owner.email,
        name: result.owner.name,
        clubName: result.clubName,
        clubSlug: result.clubSlug,
        hasAccount: true,
      })
    )
  }
  if (!result.owner || result.owner.email.toLowerCase() !== result.clubEmail.toLowerCase()) {
    sends.push(sendClubApprovedEmail(result.clubEmail, result.clubName))
  }
  const emailed = (await Promise.all(sends)).every(Boolean)
  revalidatePath("/admin/clubs")
  revalidatePath("/onboarding")
  revalidatePath("/dashboard")
  return { ok: true, emailed }
}

/** Give a waitlist email beta access and send the "you're in" email. */
export async function grantBetaAction(email: string): Promise<AdminActionResult> {
  const actor = await actorId()
  if (!(await isSuperadmin(actor))) return { ok: false }
  const entry = await prisma.waitlistEntry.findUnique({ where: { email }, select: { name: true } })
  if (!entry) return { ok: false }
  const newly = await grantBetaAccess(prisma, email)
  const emailed = newly ? await sendBetaAccessEmail(email, entry.name) : false
  revalidatePath("/admin/clubs")
  return { ok: true, emailed }
}
