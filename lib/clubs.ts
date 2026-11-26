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
import { cleanUrl } from "@/lib/profile-validation"
import { claimRegistrantOwnership, getClubAccess, isSuperadmin, uniqueClubSlug } from "@/lib/club-admin"

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
  /** joinPolicy = APPROVAL: joining sends a request to the club's admins. */
  requiresApproval: boolean
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
        joinPolicy: true,
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
      requiresApproval: c.joinPolicy === "APPROVAL",
    })),
    ...regs.map((r) => ({
      id: `reg:${r.id}`,
      name: r.clubName,
      city: r.city,
      country: r.country,
      logoUrl: r.logoUrl,
      declaredRunners: r.runners,
      members: 0,
      requiresApproval: false,
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
      website: reg.website,
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
 * Inside a transaction (onboarding): join the selected club — or, if it
 * requires approval, send a join request. Joining creates the membership
 * (6-month lock), bumps memberCount and makes the runner owner if they
 * registered the club. Returns false if the club isn't selectable.
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

  const outcome = await joinOrRequestClub(tx, userId, clubId, now)
  return outcome.ok || outcome.error === "has_pending"
}

/**
 * New active membership (6-month lock) + memberCount. Caller checks there's no
 * active one. Any pending join request of the runner is closed.
 */
export async function createMembership(tx: Tx, userId: string, clubId: string, now = new Date()) {
  await tx.clubJoinRequest.updateMany({
    where: { pendingUserId: userId },
    data: { status: "CANCELLED", pendingUserId: null, decidedAt: now },
  })
  // Free-switch clubs (Solo Running Club) don't lock their members in.
  const club = await tx.club.findUnique({ where: { id: clubId }, select: { freeSwitch: true } })
  await tx.clubMembership.create({
    data: {
      userId,
      clubId,
      joinedAt: now,
      lockExpiresAt: club?.freeSwitch ? now : addMonths(now, CLUB_LOCK_MONTHS),
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
  website: string | null
}

export type ClubRequestResult =
  | { ok: true }
  | { ok: false; error: "has_club" | "has_pending" | "invalid" | "invalid_website" | "email_taken" }

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
  const website = cleanUrl(input.website ?? "")
  if (website.invalid) return { ok: false, error: "invalid_website" }
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
      website: website.url,
      requestedById: user.id,
    },
  })
  return { ok: true }
}

// ── Joining from the app: open clubs vs. approval clubs ─────

export type JoinOutcome =
  | { ok: true; status: "joined" | "requested"; clubName: string; /** Left this free-switch club to join. */ leftClubName?: string }
  | { ok: false; error: "not_found" | "has_club" | "has_pending"; clubName?: string }

/**
 * The runner's active membership, and whether they may leave it right now
 * for another club: only free-switch clubs (Solo Running Club), and never
 * the club's owner (a club always keeps its owner as a member).
 */
export async function getSwitchableMembership(tx: Tx | typeof prisma, userId: string) {
  const m = await tx.clubMembership.findUnique({
    where: { activeUserId: userId },
    select: { id: true, clubId: true, club: { select: { name: true, freeSwitch: true, ownerId: true } } },
  })
  if (!m) return null
  return { id: m.id, clubId: m.clubId, clubName: m.club.name, canSwitch: m.club.freeSwitch && m.club.ownerId !== userId }
}

/** Leave a free-switch club (the runs already logged stay with it). */
export async function leaveMembership(tx: Tx, membership: { id: string; clubId: string }, now = new Date()) {
  await tx.clubMembership.update({ where: { id: membership.id }, data: { isActive: false, activeUserId: null, leftAt: now } })
  await tx.club.update({ where: { id: membership.clubId }, data: { memberCount: { decrement: 1 } } })
}

/**
 * A runner without a club joins it (OPEN) or asks to join (APPROVAL).
 * Only one pending request at a time — cancel it to pick another club.
 * A runner in a free-switch club (Solo) can move on: an OPEN club switches
 * them now; an APPROVAL club keeps them in Solo until they're approved.
 */
export async function joinOrRequestClub(tx: Tx, userId: string, clubId: string, now = new Date()): Promise<JoinOutcome> {
  const club = await tx.club.findFirst({ where: { id: clubId, active: true }, select: { id: true, name: true, joinPolicy: true } })
  if (!club) return { ok: false, error: "not_found" }
  const active = await getSwitchableMembership(tx, userId)
  if (active && (active.clubId === club.id || !active.canSwitch)) return { ok: false, error: "has_club", clubName: active.clubName }
  const pending = await tx.clubJoinRequest.findUnique({ where: { pendingUserId: userId }, select: { clubId: true, club: { select: { name: true } } } })
  if (pending) {
    return pending.clubId === club.id
      ? { ok: true, status: "requested", clubName: club.name }
      : { ok: false, error: "has_pending", clubName: pending.club.name }
  }
  if (club.joinPolicy === "APPROVAL") {
    await tx.clubJoinRequest.create({ data: { userId, clubId: club.id, pendingUserId: userId } })
    return { ok: true, status: "requested", clubName: club.name }
  }
  if (active) await leaveMembership(tx, active, now)
  await createMembership(tx, userId, club.id, now)
  await claimRegistrantOwnership(tx, userId, club.id)
  return { ok: true, status: "joined", clubName: club.name, ...(active ? { leftClubName: active.clubName } : {}) }
}

/** The runner's pending join request, if any. */
export async function getPendingJoinRequest(db: Tx | typeof prisma, userId: string) {
  return db.clubJoinRequest.findUnique({
    where: { pendingUserId: userId },
    select: { id: true, createdAt: true, club: { select: { id: true, name: true, slug: true } } },
  })
}

export async function cancelJoinRequest(tx: Tx, userId: string, now = new Date()): Promise<boolean> {
  const r = await tx.clubJoinRequest.updateMany({
    where: { pendingUserId: userId },
    data: { status: "CANCELLED", pendingUserId: null, decidedAt: now },
  })
  return r.count > 0
}

/** Pending requests for a club, oldest first (manage page). */
export async function listPendingJoinRequests(db: Tx | typeof prisma, clubId: string) {
  return db.clubJoinRequest.findMany({
    where: { clubId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: { id: true, createdAt: true, user: { select: { id: true, name: true, username: true, image: true } } },
  })
}

export type DecideOutcome =
  | { ok: true; status: "APPROVED" | "REJECTED"; user: { email: string; name: string | null }; clubName: string; clubSlug: string }
  | { ok: false; error: "forbidden" | "not_found" | "has_club" }

/**
 * Owner, collaborators or superadmin approve/reject a pending request. On
 * approval the membership starts now (earlier runs don't count for the club).
 * If the runner joined another club meanwhile, the request is closed.
 */
export async function decideJoinRequest(
  tx: Tx,
  actorId: string,
  requestId: string,
  approve: boolean,
  now = new Date()
): Promise<DecideOutcome> {
  const req = await tx.clubJoinRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, clubId: true, userId: true, user: { select: { email: true, name: true } } },
  })
  if (!req || req.status !== "PENDING") return { ok: false, error: "not_found" }
  const access = await getClubAccess(actorId, { id: req.clubId }, tx)
  if (!access?.canManage) return { ok: false, error: "forbidden" }

  const close = (status: "APPROVED" | "REJECTED" | "CANCELLED") =>
    tx.clubJoinRequest.update({ where: { id: req.id }, data: { status, pendingUserId: null, decidedAt: now, decidedById: actorId } })

  if (!approve) {
    await close("REJECTED")
    return { ok: true, status: "REJECTED", user: req.user, clubName: access.club.name, clubSlug: access.club.slug }
  }
  // Approved while in a free-switch club (Solo) → the switch happens now.
  const current = await getSwitchableMembership(tx, req.userId)
  if (current && !current.canSwitch) {
    await close("CANCELLED")
    return { ok: false, error: "has_club" }
  }
  await close("APPROVED")
  if (current) await leaveMembership(tx, current, now)
  await createMembership(tx, req.userId, req.clubId, now)
  return { ok: true, status: "APPROVED", user: req.user, clubName: access.club.name, clubSlug: access.club.slug }
}

/** Club directory: every active club with what the viewer can do. */
/** userId null = a guest (public /clubs): no membership or request to show. */
export async function getClubDirectory(db: Tx | typeof prisma, userId: string | null) {
  const [clubs, active, pending] = await Promise.all([
    db.club.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, city: true, country: true, logoUrl: true, memberCount: true, joinPolicy: true },
    }),
    userId ? getSwitchableMembership(db, userId) : Promise.resolve(null),
    userId ? db.clubJoinRequest.findUnique({ where: { pendingUserId: userId }, select: { clubId: true } }) : Promise.resolve(null),
  ])
  return {
    myClubId: active?.clubId ?? null,
    /** The runner is in a free-switch club (Solo) and may join another one. */
    canSwitch: active?.canSwitch ?? false,
    pendingClubId: pending?.clubId ?? null,
    clubs: clubs.map((c) => ({ ...c, requiresApproval: c.joinPolicy === "APPROVAL" })),
  }
}
