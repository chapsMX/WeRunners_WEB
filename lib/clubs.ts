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

export type ApproveResult =
  | { ok: false }
  | {
      ok: true
      clubName: string
      clubSlug: string
      /** The club's own email (from the registration). */
      clubEmail: string
      /** The runner who asked for the club, now its owner (null if none / already in another club). */
      owner: { email: string; name: string | null } | null
    }

/**
 * Superadmin: approve a club registration — it becomes selectable and its Club
 * is created right away. The runner who asked for it (in-app request, or the
 * verified account with the registration's email) joins as owner, unless they
 * already belong to another club.
 */
export async function approveRegistration(tx: Tx, actorId: string, registrationId: string, now = new Date()): Promise<ApproveResult> {
  if (!(await isSuperadmin(actorId, tx))) return { ok: false }
  const reg = await tx.clubRegistration.findUnique({
    where: { id: registrationId },
    select: { id: true, email: true, requestedById: true },
  })
  if (!reg) return { ok: false }
  await tx.clubRegistration.update({ where: { id: reg.id }, data: { enabled: true } })
  const clubId = await ensureClubForRegistration(tx, reg.id)
  if (!clubId) return { ok: false }

  const registrant = reg.requestedById
    ? await tx.user.findUnique({ where: { id: reg.requestedById }, select: { id: true, email: true, name: true } })
    : await tx.user.findFirst({
        where: { email: { equals: reg.email.trim(), mode: "insensitive" }, emailVerified: true },
        select: { id: true, email: true, name: true },
      })

  let owner: { email: string; name: string | null } | null = null
  const club = await tx.club.findUniqueOrThrow({ where: { id: clubId }, select: { name: true, slug: true, ownerId: true } })
  if (registrant && !club.ownerId) {
    const active = await tx.clubMembership.findUnique({ where: { activeUserId: registrant.id }, select: { clubId: true } })
    if (!active || active.clubId === clubId) {
      if (!active) await createMembership(tx, registrant.id, clubId, now)
      await tx.club.update({ where: { id: clubId }, data: { ownerId: registrant.id } })
      owner = { email: registrant.email, name: registrant.name }
    }
  }
  return { ok: true, clubName: club.name, clubSlug: club.slug, clubEmail: reg.email, owner }
}

// ── Club requests from inside the app ───────────────────────

export type ClubRequestInput = {
  clubName: string
  city: string
  country: string
  email: string
  runners: number | null
  instagram: string | null
  tiktok: string | null
}

export type ClubRequestResult =
  | { ok: true }
  | { ok: false; error: "has_club" | "has_pending" | "invalid" | "email_taken" }

/** The runner's own club request waiting for approval (in-app, or landing form with their email). */
export async function getPendingClubRequest(db: Tx | typeof prisma, userId: string, email: string) {
  return db.clubRegistration.findFirst({
    where: {
      enabled: false,
      club: null,
      OR: [{ requestedById: userId }, { email: { equals: email.trim(), mode: "insensitive" } }],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, clubName: true, createdAt: true },
  })
}

/** A runner without a club asks for theirs to be added (pending superadmin approval). */
export async function createClubRequest(
  tx: Tx,
  user: { id: string; email: string },
  input: ClubRequestInput
): Promise<ClubRequestResult> {
  if (await tx.clubMembership.findUnique({ where: { activeUserId: user.id }, select: { id: true } })) {
    return { ok: false, error: "has_club" }
  }
  if (await getPendingClubRequest(tx, user.id, user.email)) return { ok: false, error: "has_pending" }

  const clubName = input.clubName.trim().slice(0, 80)
  const city = input.city.trim().slice(0, 80)
  const email = input.email.trim().toLowerCase()
  const country = input.country.trim().toUpperCase()
  if (clubName.length < 2 || city.length < 2 || !/^[A-Z]{2}$/.test(country) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "invalid" }
  }
  if (await tx.clubRegistration.findUnique({ where: { email }, select: { id: true } })) {
    return { ok: false, error: "email_taken" }
  }
  await tx.clubRegistration.create({
    data: {
      clubName,
      city,
      country,
      email,
      runners: input.runners && input.runners > 0 ? Math.min(Math.round(input.runners), 100000) : null,
      instagram: input.instagram?.trim().slice(0, 200) || null,
      tiktok: input.tiktok?.trim().slice(0, 200) || null,
      requestedById: user.id,
    },
  })
  return { ok: true }
}
