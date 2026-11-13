// Server-only: superadmin picks a club's owner from anyone in the database
// (accounts or waitlist emails), grants beta access, and owner invitations for
// people who don't have an account yet. Operations take a transaction client;
// emails are sent by the caller after the transaction commits.
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { isSuperadmin } from "@/lib/club-admin"
import { createMembership } from "@/lib/clubs"

type Tx = Prisma.TransactionClient
type Db = Tx | typeof prisma

const norm = (email: string) => email.trim().toLowerCase()

// ── Beta access ─────────────────────────────────────────────

/** Give beta access to an email. Returns true when it wasn't granted before. */
export async function grantBetaAccess(db: Db, email: string, name?: string | null): Promise<boolean> {
  const e = norm(email)
  const entry = await db.waitlistEntry.findUnique({ where: { email: e }, select: { betaAccess: true } })
  if (entry?.betaAccess) return false
  if (entry) {
    await db.waitlistEntry.update({ where: { email: e }, data: { betaAccess: true } })
  } else {
    await db.waitlistEntry.create({ data: { email: e, name: name?.trim() || null, betaAccess: true } })
  }
  return true
}

// ── Candidates ──────────────────────────────────────────────

export type OwnerCandidate =
  | {
      kind: "user"
      userId: string
      name: string
      username: string | null
      email: string
      image: string | null
      /** waiting = no beta yet · onboarding = beta but not onboarded */
      status: "waiting" | "onboarding" | "no_club" | "this_club" | "other_club"
      clubName: string | null
    }
  | {
      kind: "waitlist"
      email: string
      name: string | null
      beta: boolean
      /** Club they already have a pending owner invite for. */
      invitedTo: string | null
    }

/** Accounts and waitlist-only emails matching name, @username or email. */
export async function searchOwnerCandidates(db: Db, query: string, clubId: string): Promise<OwnerCandidate[]> {
  const q = query.trim().replace(/^@/, "")
  if (q.length < 2) return []
  const like = { contains: q, mode: "insensitive" as const }

  const users = await db.user.findMany({
    where: { OR: [{ name: like }, { username: like }, { email: like }] },
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      onboardingCompletedAt: true,
      memberships: { where: { activeUserId: { not: null } }, select: { clubId: true, club: { select: { name: true } } } },
    },
  })
  const accountEmails = users.map((u) => norm(u.email))
  const [waitlist, betaRows, invites] = await Promise.all([
    db.waitlistEntry.findMany({
      where: { OR: [{ email: like }, { name: like }], email: { notIn: accountEmails } },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { email: true, name: true, betaAccess: true },
    }),
    db.waitlistEntry.findMany({ where: { email: { in: accountEmails } }, select: { email: true, betaAccess: true } }),
    db.clubOwnerInvite.findMany({ select: { email: true, club: { select: { name: true } } } }),
  ])
  // Waitlist rows whose email already has an account are shown as accounts.
  const registered = new Set(
    (await db.user.findMany({ where: { email: { in: waitlist.map((w) => w.email) } }, select: { email: true } })).map((u) => norm(u.email))
  )
  const beta = new Map(betaRows.map((b) => [b.email, b.betaAccess]))
  const invitedTo = new Map(invites.map((i) => [i.email, i.club.name]))

  return [
    ...users.map((u): OwnerCandidate => {
      const m = u.memberships[0]
      const status = m
        ? m.clubId === clubId ? "this_club" : "other_club"
        : !beta.get(norm(u.email)) ? "waiting" : !u.onboardingCompletedAt ? "onboarding" : "no_club"
      return {
        kind: "user",
        userId: u.id,
        name: u.name || "Runner",
        username: u.username,
        email: u.email,
        image: u.image,
        status,
        clubName: m?.club.name ?? null,
      }
    }),
    ...waitlist
      .filter((w) => !registered.has(norm(w.email)))
      .map((w): OwnerCandidate => ({
        kind: "waitlist",
        email: w.email,
        name: w.name,
        beta: w.betaAccess,
        invitedTo: invitedTo.get(w.email) ?? null,
      })),
  ]
}

// ── Assign owner ────────────────────────────────────────────

export type AssignOwnerResult =
  | { ok: true; kind: "assigned" | "invited"; email: string; name: string | null; clubName: string; newlyBeta: boolean }
  | { ok: false; error: "forbidden" | "not_found" | "in_other_club" | "invited_elsewhere"; clubName?: string }

/** Make `userId` the owner (previous owner stays as collaborator). They must be an active member. */
async function setOwner(tx: Tx, clubId: string, userId: string, previousOwnerId: string | null) {
  await tx.club.update({ where: { id: clubId }, data: { ownerId: userId } })
  await tx.clubMembership.updateMany({ where: { activeUserId: userId, clubId }, data: { role: "MEMBER" } })
  if (previousOwnerId && previousOwnerId !== userId) {
    await tx.clubMembership.updateMany({ where: { activeUserId: previousOwnerId, clubId }, data: { role: "ADMIN" } })
  }
  await tx.clubOwnerInvite.deleteMany({ where: { clubId } })
}

/**
 * Superadmin: pick the owner of a club. With an account → beta access, join
 * the club if needed, owner. Without one (waitlist email) → beta access +
 * owner invitation, applied when they sign up with that email.
 * An owner can't belong to another club: that's an error, nobody is moved.
 */
export async function assignOwner(
  tx: Tx,
  actorId: string,
  clubId: string,
  target: { userId: string } | { email: string },
  now = new Date()
): Promise<AssignOwnerResult> {
  if (!(await isSuperadmin(actorId, tx))) return { ok: false, error: "forbidden" }
  const club = await tx.club.findUnique({ where: { id: clubId }, select: { id: true, name: true, ownerId: true } })
  if (!club) return { ok: false, error: "not_found" }

  const user =
    "userId" in target
      ? await tx.user.findUnique({ where: { id: target.userId }, select: { id: true, email: true, name: true } })
      : await tx.user.findFirst({
          where: { email: { equals: norm(target.email), mode: "insensitive" } },
          select: { id: true, email: true, name: true },
        })

  if (user) {
    const active = await tx.clubMembership.findUnique({
      where: { activeUserId: user.id },
      select: { clubId: true, club: { select: { name: true } } },
    })
    if (active && active.clubId !== club.id) return { ok: false, error: "in_other_club", clubName: active.club.name }
    if (!active) await createMembership(tx, user.id, club.id, now)
    await setOwner(tx, club.id, user.id, club.ownerId)
    const newlyBeta = await grantBetaAccess(tx, user.email, user.name)
    return { ok: true, kind: "assigned", email: user.email, name: user.name, clubName: club.name, newlyBeta }
  }

  if (!("email" in target)) return { ok: false, error: "not_found" }
  const email = norm(target.email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "not_found" }
  const pending = await tx.clubOwnerInvite.findUnique({ where: { email }, select: { clubId: true, club: { select: { name: true } } } })
  if (pending && pending.clubId !== club.id) return { ok: false, error: "invited_elsewhere", clubName: pending.club.name }

  await tx.clubOwnerInvite.deleteMany({ where: { clubId: club.id, NOT: { email } } })
  await tx.clubOwnerInvite.upsert({
    where: { email },
    create: { email, clubId: club.id, invitedById: actorId },
    update: { invitedById: actorId },
  })
  const entry = await tx.waitlistEntry.findUnique({ where: { email }, select: { name: true } })
  const newlyBeta = await grantBetaAccess(tx, email)
  return { ok: true, kind: "invited", email, name: entry?.name ?? null, clubName: club.name, newlyBeta }
}

/**
 * On first visit after signing up: apply a pending owner invitation for the
 * runner's email (join the club + owner). Returns the club id, or null.
 */
export async function applyOwnerInvite(tx: Tx, userId: string, email: string, now = new Date()): Promise<string | null> {
  const invite = await tx.clubOwnerInvite.findUnique({
    where: { email: norm(email) },
    select: { id: true, clubId: true, club: { select: { ownerId: true, active: true } } },
  })
  if (!invite) return null
  const active = await tx.clubMembership.findUnique({ where: { activeUserId: userId }, select: { clubId: true } })
  if ((active && active.clubId !== invite.clubId) || !invite.club.active) {
    await tx.clubOwnerInvite.delete({ where: { id: invite.id } })
    return null
  }
  if (!active) await createMembership(tx, userId, invite.clubId, now)
  await setOwner(tx, invite.clubId, userId, invite.club.ownerId)
  return invite.clubId
}

/** Pending owner invitation for a club (shown on the manage page). */
export async function getPendingOwnerInvite(db: Db, clubId: string) {
  return db.clubOwnerInvite.findFirst({ where: { clubId }, select: { email: true, createdAt: true } })
}
