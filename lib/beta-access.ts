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
 * - entry from the landing form → stamp convertedAt the first time.
 */
export async function resolveBetaAccess(user: {
  email: string
  name?: string | null
}): Promise<boolean> {
  const email = user.email.trim().toLowerCase()
  const [betaOpen, entry] = await Promise.all([
    isBetaOpen(),
    prisma.waitlistEntry.findUnique({
      where: { email },
      select: { betaAccess: true, convertedAt: true },
    }),
  ])

  if (!entry) {
    try {
      await prisma.waitlistEntry.create({
        data: { email, name: user.name?.trim() || null, convertedAt: new Date() },
      })
    } catch (e) {
      // Concurrent request already created it — fine.
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e
    }
    return betaOpen
  }

  if (!entry.convertedAt) {
    await prisma.waitlistEntry.update({
      where: { email },
      data: { convertedAt: new Date() },
    })
  }

  return betaOpen || entry.betaAccess
}
