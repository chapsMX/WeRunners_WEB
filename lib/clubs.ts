// Server-only: selectable clubs and joining one.
// Selectable = ClubRegistration.enabled (landing "for clubs" form). The
// platform Club row is created from the registration the first time a runner
// joins (Club.registrationId, unique).
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/** A runner can change clubs once per lock period. */
export const CLUB_LOCK_MONTHS = 6

export type SelectableClub = {
  /** ClubRegistration id — the value the onboarding form submits. */
  id: string
  name: string
  city: string
  logoUrl: string | null
  /** Runners declared by the club when it registered. */
  declaredRunners: number | null
  /** Runners already on W3Runn3rs (0 until the platform club exists). */
  members: number
}

export async function getSelectableClubs(): Promise<SelectableClub[]> {
  const regs = await prisma.clubRegistration.findMany({
    where: { enabled: true },
    orderBy: { clubName: "asc" },
    select: {
      id: true,
      clubName: true,
      city: true,
      logoUrl: true,
      runners: true,
      club: { select: { memberCount: true } },
    },
  })
  return regs.map((r) => ({
    id: r.id,
    name: r.clubName,
    city: r.city,
    logoUrl: r.logoUrl,
    declaredRunners: r.runners,
    members: r.club?.memberCount ?? 0,
  }))
}

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "club"
  )
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

type Tx = Prisma.TransactionClient

/** Platform club for an enabled registration, created on first use. */
async function ensureClubForRegistration(tx: Tx, registrationId: string): Promise<string | null> {
  const existing = await tx.club.findUnique({ where: { registrationId }, select: { id: true } })
  if (existing) return existing.id

  const reg = await tx.clubRegistration.findFirst({
    where: { id: registrationId, enabled: true },
  })
  if (!reg) return null

  // Slugs are unique across clubs; disambiguate with part of the registration id.
  let slug = slugify(reg.clubName)
  if (await tx.club.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${slug}-${reg.id.slice(-6).toLowerCase()}`
  }

  const club = await tx.club.create({
    data: {
      name: reg.clubName,
      slug,
      city: reg.city,
      logoUrl: reg.logoUrl,
      instagram: reg.instagram,
      twitter: reg.twitter,
      tiktok: reg.tiktok,
      facebook: reg.facebook,
      initialMemberCount: reg.runners,
      registrationId: reg.id,
      // country: defaults to "MX" — registrations don't capture it yet.
    },
    select: { id: true },
  })
  return club.id
}

/**
 * Inside a transaction: create the runner's active membership in the club of
 * `registrationId` (6-month lock) and bump memberCount.
 * Returns false if the club isn't selectable. A runner who already has an
 * active membership keeps it (activeUserId is unique) — returns true.
 */
export async function joinClubFromRegistration(
  tx: Tx,
  userId: string,
  registrationId: string,
  now = new Date()
): Promise<boolean> {
  const clubId = await ensureClubForRegistration(tx, registrationId)
  if (!clubId) return false

  const active = await tx.clubMembership.findUnique({
    where: { activeUserId: userId },
    select: { id: true },
  })
  if (active) return true

  await tx.clubMembership.create({
    data: {
      userId,
      clubId,
      joinedAt: now,
      lockExpiresAt: addMonths(now, CLUB_LOCK_MONTHS),
      isActive: true,
      activeUserId: userId,
    },
  })
  await tx.club.update({ where: { id: clubId }, data: { memberCount: { increment: 1 } } })
  return true
}
