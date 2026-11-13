"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createClubRequest } from "@/lib/clubs"
import { sendClubRequestEmails } from "@/lib/admin-emails"

export type ClubRequestState = { error?: string }

export async function createClubRequestAction(_prev: ClubRequestState, form: FormData): Promise<ClubRequestState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")
  const str = (k: string) => String(form.get(k) ?? "")
  const runners = Number.parseInt(str("runners"), 10)
  const input = {
    clubName: str("clubName"),
    city: str("city"),
    country: str("country"),
    email: str("email"),
    runners: Number.isFinite(runners) ? runners : null,
    instagram: str("instagram") || null,
    tiktok: str("tiktok") || null,
  }
  const result = await prisma.$transaction((tx) => createClubRequest(tx, session.user, input))
  if (!result.ok) return { error: result.error }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true } })
  await sendClubRequestEmails({
    clubName: input.clubName.trim(),
    city: input.city.trim(),
    country: input.country.toUpperCase(),
    clubEmail: input.email.trim().toLowerCase(),
    runners: input.runners,
    requester: { email: session.user.email, username: user?.username ?? null },
  })
  revalidatePath("/dashboard")
  revalidatePath("/admin/clubs")
  redirect("/dashboard")
}
