// Server-only: club invite links (/clubs/<slug>/join).
// The link stores the club in a cookie and sends the runner through sign-in →
// beta gate → onboarding. A valid invite grants beta access (the club is the
// way in) and preselects the club in onboarding. The cookie holds the club id,
// so renaming the club (new slug) doesn't break pending invites.
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

type Db = Pick<typeof prisma, "club">

export const CLUB_INVITE_COOKIE = "w3_club_invite"
export const CLUB_INVITE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function clubJoinPath(slug: string): string {
  return `/clubs/${encodeURIComponent(slug)}/join`
}

export type InviteClub = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  requiresApproval: boolean
}

/** Active club by id or slug; null if it doesn't exist or was deactivated. */
export async function findInviteClub(where: { id: string } | { slug: string }, db: Db = prisma): Promise<InviteClub | null> {
  const club = await db.club.findFirst({
    where: { ...where, active: true },
    select: { id: true, name: true, slug: true, logoUrl: true, joinPolicy: true },
  })
  if (!club) return null
  return { id: club.id, name: club.name, slug: club.slug, logoUrl: club.logoUrl, requiresApproval: club.joinPolicy === "APPROVAL" }
}

/** Club id from the invite cookie (unvalidated). */
export async function inviteClubIdFromCookie(): Promise<string | null> {
  return (await cookies()).get(CLUB_INVITE_COOKIE)?.value || null
}

/** The invite cookie's club, if it's still an active club. */
export async function getInviteClubFromCookie(): Promise<InviteClub | null> {
  const id = await inviteClubIdFromCookie()
  return id ? findInviteClub({ id }) : null
}
