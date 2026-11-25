// Server-only: ambassador applications from the app (/ambassadors/apply).
// Ambassadors lead a running club, so a club is required: the runner owns an
// active Club, or asked for one (ClubRegistration.requestedById) that's still
// waiting for approval. Name, email and country are a snapshot at application
// time (from the account and the club).
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { AMBASSADOR_LIMITS, cleanSocialHandle } from "@/lib/ambassadors"

type Db = Prisma.TransactionClient | typeof prisma

export const AMBASSADOR_STATUSES = ["pending", "shortlisted", "rejected"] as const
export type AmbassadorStatus = (typeof AMBASSADOR_STATUSES)[number]

export type AmbassadorClub =
  | { kind: "club"; id: string; name: string; slug: string; country: string }
  | { kind: "registration"; id: string; name: string; country: string }

export type AmbassadorEligibility =
  | { status: "eligible"; club: AmbassadorClub }
  /** Active member (or collaborator) of a club they don't own. */
  | { status: "member"; clubName: string }
  | { status: "no_club" }

export async function getAmbassadorEligibility(db: Db, userId: string): Promise<AmbassadorEligibility> {
  const owned = await db.club.findFirst({
    where: { ownerId: userId, active: true },
    select: { id: true, name: true, slug: true, country: true },
  })
  if (owned) return { status: "eligible", club: { kind: "club", ...owned } }

  // A request still waiting for approval (approving it creates the Club and
  // makes the requester its owner, which the branch above covers).
  const requested = await db.clubRegistration.findFirst({
    where: { requestedById: userId, club: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, clubName: true, country: true },
  })
  if (requested) {
    return { status: "eligible", club: { kind: "registration", id: requested.id, name: requested.clubName, country: requested.country } }
  }

  const membership = await db.clubMembership.findUnique({
    where: { activeUserId: userId },
    select: { club: { select: { name: true } } },
  })
  if (membership) return { status: "member", clubName: membership.club.name }
  return { status: "no_club" }
}

export type MyApplication = { id: string; status: AmbassadorStatus; createdAt: Date }

function asStatus(value: string): AmbassadorStatus {
  return (AMBASSADOR_STATUSES as readonly string[]).includes(value) ? (value as AmbassadorStatus) : "pending"
}

/** Their application: made from the app, or from the old landing form with the same email. */
export async function getMyApplication(db: Db, user: { id: string; email: string }): Promise<MyApplication | null> {
  const app = await db.ambassadorApplication.findFirst({
    where: { OR: [{ userId: user.id }, { email: user.email.trim().toLowerCase(), userId: null }] },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, createdAt: true },
  })
  return app ? { ...app, status: asStatus(app.status) } : null
}

export type ApplicationInput = { instagram: string | null; twitter: string | null; tiktok: string | null; motivation: string }
export type ApplicationError = "motivation_short" | "motivation_long" | "not_eligible" | "already_applied"

export function parseApplicationInput(raw: Record<string, unknown>): { data: ApplicationInput } | { error: ApplicationError } {
  const motivation = typeof raw.motivation === "string" ? raw.motivation.trim() : ""
  if (motivation.length < AMBASSADOR_LIMITS.motivationMin) return { error: "motivation_short" }
  if (motivation.length > AMBASSADOR_LIMITS.motivationMax) return { error: "motivation_long" }
  return {
    data: {
      instagram: cleanSocialHandle(raw.instagram),
      twitter: cleanSocialHandle(raw.twitter),
      tiktok: cleanSocialHandle(raw.tiktok),
      motivation,
    },
  }
}

export type SubmittedApplication = {
  fullName: string
  email: string
  country: string
  instagram: string | null
  twitter: string | null
  tiktok: string | null
  motivation: string
  club: AmbassadorClub
}

export async function submitAmbassadorApplication(
  db: Db,
  user: { id: string; email: string; name: string | null },
  input: ApplicationInput
): Promise<{ ok: true; application: SubmittedApplication } | { ok: false; error: ApplicationError }> {
  if (await getMyApplication(db, user)) return { ok: false, error: "already_applied" }
  const eligibility = await getAmbassadorEligibility(db, user.id)
  if (eligibility.status !== "eligible") return { ok: false, error: "not_eligible" }
  const club = eligibility.club

  const application: SubmittedApplication = {
    fullName: user.name?.trim() || user.email,
    email: user.email.trim().toLowerCase(),
    country: club.country,
    ...input,
    club,
  }
  try {
    await db.ambassadorApplication.create({
      data: {
        userId: user.id,
        clubId: club.kind === "club" ? club.id : null,
        clubRegistrationId: club.kind === "registration" ? club.id : null,
        fullName: application.fullName,
        email: application.email,
        country: application.country,
        instagram: input.instagram,
        twitter: input.twitter,
        tiktok: input.tiktok,
        motivation: input.motivation,
      },
    })
  } catch (e) {
    // Double submit, or an old landing application linked to another account.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { ok: false, error: "already_applied" }
    throw e
  }
  return { ok: true, application }
}

// ── Admin ───────────────────────────────────────────────────

export type AdminAmbassadorRow = {
  id: string
  status: AmbassadorStatus
  createdAt: Date
  fullName: string | null
  email: string | null
  country: string | null
  instagram: string | null
  twitter: string | null
  tiktok: string | null
  motivation: string
  /** null = old landing-form application (no account). */
  user: { username: string | null; name: string } | null
  club: { name: string; slug: string | null; pending: boolean } | null
}

export async function listAmbassadorApplications(db: Db = prisma): Promise<AdminAmbassadorRow[]> {
  const rows = await db.ambassadorApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, name: true } },
      club: { select: { name: true, slug: true } },
      clubRegistration: { select: { clubName: true, club: { select: { name: true, slug: true } } } },
    },
  })
  return rows.map((r) => {
    // A registration approved after applying now has its Club: link to it.
    const regClub = r.clubRegistration?.club ?? null
    const club = r.club
      ? { name: r.club.name, slug: r.club.slug, pending: false }
      : regClub
        ? { name: regClub.name, slug: regClub.slug, pending: false }
        : r.clubRegistration
          ? { name: r.clubRegistration.clubName, slug: null, pending: true }
          : null
    return {
      id: r.id,
      status: asStatus(r.status),
      createdAt: r.createdAt,
      fullName: r.fullName,
      email: r.email,
      country: r.country,
      instagram: r.instagram,
      twitter: r.twitter,
      tiktok: r.tiktok,
      motivation: r.motivation,
      user: r.user ? { username: r.user.username, name: r.user.name || "Runner" } : null,
      club,
    }
  })
}

export async function setAmbassadorStatus(db: Db, id: string, status: string): Promise<boolean> {
  if (!(AMBASSADOR_STATUSES as readonly string[]).includes(status)) return false
  const r = await db.ambassadorApplication.updateMany({ where: { id }, data: { status } })
  return r.count === 1
}
