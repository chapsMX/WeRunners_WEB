"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clubProfileFromForm, createClub } from "@/lib/club-admin"
import { approveRegistration } from "@/lib/clubs"
import type { ClubFormState } from "@/components/app/clubs/ClubProfileForm"

async function actorId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

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

export async function approveRegistrationAction(registrationId: string): Promise<boolean> {
  const actor = await actorId()
  if (!actor) return false
  const approved = await prisma.$transaction((tx) => approveRegistration(tx, actor, registrationId))
  if (approved) {
    revalidatePath("/admin/clubs")
    revalidatePath("/onboarding")
  }
  return approved
}
