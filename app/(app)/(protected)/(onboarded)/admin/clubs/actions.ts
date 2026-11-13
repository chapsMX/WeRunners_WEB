"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clubProfileFromForm, createClub, isSuperadmin } from "@/lib/club-admin"
import { approveRegistration } from "@/lib/clubs"
import { grantBetaAccess } from "@/lib/club-owners"
import { sendBetaAccessEmail, sendClubApprovedEmail } from "@/lib/admin-emails"
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

/** Approve a landing registration and tell the club (its registration email). */
export async function approveRegistrationAction(registrationId: string): Promise<AdminActionResult> {
  const actor = await actorId()
  if (!actor) return { ok: false }
  const approved = await prisma.$transaction((tx) => approveRegistration(tx, actor, registrationId))
  if (!approved) return { ok: false }
  const reg = await prisma.clubRegistration.findUnique({
    where: { id: registrationId },
    select: { email: true, clubName: true },
  })
  const emailed = reg ? await sendClubApprovedEmail(reg.email, reg.clubName) : false
  revalidatePath("/admin/clubs")
  revalidatePath("/onboarding")
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
