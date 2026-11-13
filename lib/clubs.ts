// Server-only: selectable clubs and joining one.
//
// Selectable clubs:
// - active platform clubs (Club.active) — created by the superadmin or from an
//   approved landing registration;
// - enabled landing registrations that don't have a Club row yet (legacy path:
//   the Club is created the first time a runner joins).
// The onboarding form submits "club:<id>" or "reg:<id>".
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { claimRegistrantOwnership, isSuperadmin, uniqueClubSlug } from "@/lib/club-admin"

/** A runner can change clubs once per lock period. */
export const CLUB_LOCK_MONTHS = 6

export type SelectableClub = {
  /** Form value: "club:<Club.id>" or "reg:<ClubRegistration.id>". */
  id: string
  name: string
  city: string
  /** ISO 3166-1 alpha-2, e.g. "MX", "PH". */
  country: string
  logoUrl: string | null
  /** Runners declared by the club when it registered. */
  declaredRunners: number | null
  /** Runners already on W3Runn3rs. */
  members: number
}

export async function getSelectableClubs(): Promise<SelectableClub[]> {
  const [clubs, regs] = await Promise.all([
    prisma.club.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        logoUrl: true,
        memberCount: true,
        initialMemberCount: true,
      },
    }),
    prisma.clubRegistration.findMany({
      where: { enabled: true, club: null },
      select: { id: true, clubName: true, city: true, country: true, logoUrl: true, runners: true },
    }),
  ])
  return [
    ...clubs.map((c) => ({
      id: `club:${c.id}`,
      name: c.name,
      city: c.city ?? "",
      country: c.country,
      logoUrl: c.logoUrl,
      declaredRunners: c.initialMemberCount,
      members: c.memberCount,
    })),
    ...regs.map((r) => ({
      id: `reg:${r.id}`,
      name: r.clubName,
      city: r.city,
      country: r.country,
      logoUrl: r.logoUrl,
      declaredRunners: r.runners,
      members: 0,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name))
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

type Tx = Prisma.TransactionClient

/** Platform club for an enabled registration, created on first use. */
export async function ensureClubForRegistration(tx: Tx, registrationId: string): Promise<string | null> {
  const existing = await tx.club.findUnique({ where: { registrationId }, select: { id: true } })
  if (existing) return existing.id

  const reg = await tx.clubRegistration.findFirst({
    where: { id: registrationId, enabled: true },
  })
  if (!reg) return null

  const club = await tx.club.create({
    data: {
      name: reg.clubName,
      slug: await uniqueClubSlug(tx, reg.clubName),
      city: reg.city,
      country: reg.country,
      logoUrl: reg.logoUrl,
      instagram: reg.instagram,
      twitter: reg.twitter,
      tiktok: reg.tiktok,
      facebook: reg.facebook,
      initialMemberCount: reg.runners,
      registrationId: reg.id,
    },
    select: { id: true },
  })
  return club.id
}

/** Resolve a form value ("club:<id>" / "reg:<id>") to an active Club id. */
async function resolveSelectedClub(tx: Tx, value: string): Promise<string | null> {
  const [kind, id] = value.split(":", 2)
  if (!id) return null
  if (kind === "club") {
    const club = await tx.club.findFirst({ where: { id, active: true }, select: { id: true } })
    return club?.id ?? null
  }
  if (kind === "reg") return ensureClubForRegistration(tx, id)
  return null
}

/**
 * Inside a transaction: create the runner's active membership in the selected
 * club (6-month lock), bump memberCount, and make them owner if they're the
 * one who registered the club. Returns false if the club isn't selectable.
 * A runner who already has an active membership keeps it — returns true.
 */
export async function joinSelectedClub(
  tx: Tx,
  userId: string,
  value: string,
  now = new Date()
): Promise<boolean> {
  const clubId = await resolveSelectedClub(tx, value)
  if (!clubId) return false

  const active = await tx.clubMembership.findUnique({
    where: { activeUserId: userId },
    select: { id: true },
  })
  if (active) return true

  await createMembership(tx, userId, clubId, now)
  await claimRegistrantOwnership(tx, userId, clubId)
  return true
}

/** New active membership (6-month lock) + memberCount. Caller checks there's no active one. */
export async function createMembership(tx: Tx, userId: string, clubId: string, now = new Date()) {
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
}

/**
 * Superadmin: approve a landing registration — it becomes selectable and its
 * Club is created right away (owner = the registrant, once they join).
 */
export async function approveRegistration(tx: Tx, actorId: string, registrationId: string): Promise<boolean> {
  if (!(await isSuperadmin(actorId, tx))) return false
  const reg = await tx.clubRegistration.findUnique({ where: { id: registrationId }, select: { id: true } })
  if (!reg) return false
  await tx.clubRegistration.update({ where: { id: reg.id }, data: { enabled: true } })
  return (await ensureClubForRegistration(tx, reg.id)) !== null
}
