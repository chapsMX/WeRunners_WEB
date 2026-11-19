import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// Beta gate. The waitlist (WaitlistEntry) is the single source of access:
// with AppConfig.betaOpen = true any registered user gets in; otherwise the
// user's waitlist entry needs betaAccess. Emails are stored lowercased.

async function isBetaOpen(): Promise<boolean> {
  const config = await prisma.appConfig.findUnique({
    where: { id: "global" },
    select: { betaOpen: true },
  })
  return Boolean(config?.betaOpen)
}

/** Read-only check, for API routes acting on the user's behalf. */
export async function hasBetaAccess(email: string): Promise<boolean> {
  if (await isBetaOpen()) return true
  const entry = await prisma.waitlistEntry.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { betaAccess: true },
  })
  return Boolean(entry?.betaAccess)
}

/**
 * Beta check for the protected area that also keeps the waitlist complete:
 * - no entry yet (signed up straight in the app) → create one (betaAccess false),
 *   so the "You're on the list" screen is true and access can be granted there;
 * - entry from the landing form → stamp convertedAt the first time;
 * - came through a club invite link (inviteClubId = the cookie's club, still
 *   active) → the invite grants access and the club is remembered on the entry
 *   (admin waitlist + onboarding fallback on another device).
 */
export async function resolveBetaAccess(
  user: { email: string; name?: string | null },
  inviteClubId?: string | null
): Promise<boolean> {
  const email = user.email.trim().toLowerCase()
  const [betaOpen, entry, inviteClub] = await Promise.all([
    isBetaOpen(),
    prisma.waitlistEntry.findUnique({
      where: { email },
      select: { betaAccess: true, convertedAt: true, inviteClubId: true },
    }),
    inviteClubId
      ? prisma.club.findFirst({ where: { id: inviteClubId, active: true }, select: { id: true } })
      : Promise.resolve(null),
  ])
  const invitedTo = inviteClub?.id ?? null

  if (!entry) {
    try {
      await prisma.waitlistEntry.create({
        data: {
          email,
          name: user.name?.trim() || null,
          convertedAt: new Date(),
          ...(invitedTo ? { betaAccess: true, inviteClubId: invitedTo } : {}),
        },
      })
    } catch (e) {
      // Concurrent request already created it — fine (the next request, still
      // carrying the cookie, records the invite on the existing entry).
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e
    }
    return betaOpen || Boolean(invitedTo)
  }

  const data: Prisma.WaitlistEntryUpdateInput = {}
  if (!entry.convertedAt) data.convertedAt = new Date()
  if (invitedTo && !entry.betaAccess) data.betaAccess = true
  if (invitedTo && !entry.inviteClubId) data.inviteClub = { connect: { id: invitedTo } }
  if (Object.keys(data).length > 0) {
    await prisma.waitlistEntry.update({ where: { email }, data })
  }

  return betaOpen || entry.betaAccess || Boolean(invitedTo)
}
