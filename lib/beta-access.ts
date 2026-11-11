import { prisma } from "@/lib/prisma"

/**
 * Beta gate: with AppConfig.betaOpen = true any registered user gets in;
 * otherwise the user's waitlist entry needs betaAccess.
 * Used by the (protected) layout and by API routes that act on the user's behalf.
 */
export async function hasBetaAccess(email: string): Promise<boolean> {
  const config = await prisma.appConfig.findUnique({
    where: { id: "global" },
    select: { betaOpen: true },
  })
  if (config?.betaOpen) return true

  const entry = await prisma.waitlistEntry.findUnique({
    where: { email },
    select: { betaAccess: true },
  })
  return Boolean(entry?.betaAccess)
}
