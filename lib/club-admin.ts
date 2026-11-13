// Server-only: who can manage a club, and the club management operations.
//
// Roles
// - Superadmin (platform): User.role = ADMIN. Manages every club without being
//   a member; creates clubs, approves landing registrations, assigns owners.
// - Owner: Club.ownerId — must be an active member of the club. null = the club
//   is managed by W3Runn3rs (superadmin) until it's handed over.
// - Collaborator: ClubMembership.role = ADMIN on an active membership.
//
// Every operation takes a transaction client so it can run atomically and be
// tested inside a rolled-back transaction. Callers wrap it in prisma.$transaction.
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { isBlobImageUrl } from "@/lib/blob-upload"
import { isCountryCode } from "@/lib/countries"

type Tx = Prisma.TransactionClient
type Db = Tx | typeof prisma

export type ClubAccess = {
  club: { id: string; slug: string; name: string; ownerId: string | null }
  superadmin: boolean
  isOwner: boolean
  isCollaborator: boolean
  /** Superadmin, owner or collaborator: members list + club profile. */
  canManage: boolean
  /** Superadmin or owner: collaborators, removing members, transferring. */
  canAdminister: boolean
}

export type ClubOpError =
  | "forbidden"
  | "not_found"
  | "not_member"
  | "is_owner"
  | "invalid"
  | "slug_taken"

export type ClubOpResult = { ok: true } | { ok: false; error: ClubOpError }

const ok: ClubOpResult = { ok: true }
const fail = (error: ClubOpError): ClubOpResult => ({ ok: false, error })

export async function isSuperadmin(userId: string | undefined | null, db: Db = prisma): Promise<boolean> {
  if (!userId) return false
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } })
  return user?.role === "ADMIN"
}

async function activeMembership(db: Db, userId: string, clubId: string) {
  return db.clubMembership.findFirst({
    where: { activeUserId: userId, clubId },
    select: { id: true, role: true },
  })
}

export async function getClubAccess(
  userId: string | undefined | null,
  where: { slug: string } | { id: string },
  db: Db = prisma
): Promise<ClubAccess | null> {
  if (!userId) return null
  const club = await db.club.findUnique({
    where,
    select: { id: true, slug: true, name: true, ownerId: true },
  })
  if (!club) return null
  const [superadmin, membership] = await Promise.all([
    isSuperadmin(userId, db),
    activeMembership(db, userId, club.id),
  ])
  const isOwner = club.ownerId === userId && membership !== null
  const isCollaborator = membership?.role === "ADMIN"
  return {
    club,
    superadmin,
    isOwner,
    isCollaborator,
    canManage: superadmin || isOwner || isCollaborator,
    canAdminister: superadmin || isOwner,
  }
}

/** Club the runner manages as owner/collaborator (for the sidebar link). */
export async function getManagedClubSlug(userId: string, db: Db = prisma): Promise<string | null> {
  const m = await db.clubMembership.findUnique({
    where: { activeUserId: userId },
    select: { role: true, club: { select: { slug: true, ownerId: true } } },
  })
  if (!m) return null
  return m.role === "ADMIN" || m.club.ownerId === userId ? m.club.slug : null
}

// ── Members ─────────────────────────────────────────────────

/** Make an active member a collaborator (on) or a plain member (off). */
export async function setCollaborator(
  tx: Tx,
  actorId: string,
  clubId: string,
  memberId: string,
  on: boolean
): Promise<ClubOpResult> {
  const access = await getClubAccess(actorId, { id: clubId }, tx)
  if (!access) return fail("not_found")
  if (!access.canAdminister) return fail("forbidden")
  if (access.club.ownerId === memberId) return fail("is_owner")
  const m = await activeMembership(tx, memberId, clubId)
  if (!m) return fail("not_member")
  await tx.clubMembership.update({ where: { id: m.id }, data: { role: on ? "ADMIN" : "MEMBER" } })
  return ok
}

/**
 * End a runner's membership. Their past kilometers stay with the club
 * (Activity.clubId is a snapshot). The owner can't be removed — transfer first.
 */
export async function removeMember(
  tx: Tx,
  actorId: string,
  clubId: string,
  memberId: string,
  now = new Date()
): Promise<ClubOpResult> {
  const access = await getClubAccess(actorId, { id: clubId }, tx)
  if (!access) return fail("not_found")
  if (!access.canAdminister) return fail("forbidden")
  if (access.club.ownerId === memberId) return fail("is_owner")
  const m = await activeMembership(tx, memberId, clubId)
  if (!m) return fail("not_member")
  await tx.clubMembership.update({
    where: { id: m.id },
    data: { isActive: false, activeUserId: null, leftAt: now, role: "MEMBER" },
  })
  await tx.club.update({ where: { id: clubId }, data: { memberCount: { decrement: 1 } } })
  return ok
}

/**
 * Hand the club to another active member. The previous owner (if any) stays
 * on as a collaborator. Owner or superadmin.
 */
export async function transferOwnership(
  tx: Tx,
  actorId: string,
  clubId: string,
  newOwnerId: string
): Promise<ClubOpResult> {
  const access = await getClubAccess(actorId, { id: clubId }, tx)
  if (!access) return fail("not_found")
  if (!access.canAdminister) return fail("forbidden")
  if (access.club.ownerId === newOwnerId) return ok
  const target = await activeMembership(tx, newOwnerId, clubId)
  if (!target) return fail("not_member")

  const previous = access.club.ownerId
  await tx.club.update({ where: { id: clubId }, data: { ownerId: newOwnerId } })
  await tx.clubMembership.update({ where: { id: target.id }, data: { role: "MEMBER" } })
  if (previous) {
    await tx.clubMembership.updateMany({
      where: { activeUserId: previous, clubId },
      data: { role: "ADMIN" },
    })
  }
  return ok
}

/** Superadmin only: take the club back (managed by W3Runn3rs). Ex-owner stays a collaborator. */
export async function clearOwner(tx: Tx, actorId: string, clubId: string): Promise<ClubOpResult> {
  if (!(await isSuperadmin(actorId, tx))) return fail("forbidden")
  const club = await tx.club.findUnique({ where: { id: clubId }, select: { ownerId: true } })
  if (!club) return fail("not_found")
  if (!club.ownerId) return ok
  await tx.club.update({ where: { id: clubId }, data: { ownerId: null } })
  await tx.clubMembership.updateMany({
    where: { activeUserId: club.ownerId, clubId },
    data: { role: "ADMIN" },
  })
  return ok
}

// ── Club profile ────────────────────────────────────────────

export type ClubProfileInput = {
  name?: string
  description?: string | null
  city?: string | null
  country?: string
  logoUrl?: string | null
  instagram?: string | null
  twitter?: string | null
  tiktok?: string | null
  facebook?: string | null
  contactEmail?: string | null
}

const trimOrNull = (v: string | null | undefined, max: number) => {
  if (v == null) return null
  const t = v.trim().slice(0, max)
  return t.length > 0 ? t : null
}

type CleanClubProfile = {
  name?: string
  country?: string
  description?: string | null
  city?: string | null
  logoUrl?: string | null
  instagram?: string | null
  twitter?: string | null
  tiktok?: string | null
  facebook?: string | null
  contactEmail?: string | null
}

/** Validates and normalizes profile fields. null = invalid input. */
export function cleanClubProfile(input: ClubProfileInput): CleanClubProfile | null {
  const out: CleanClubProfile = {}
  if (input.name !== undefined) {
    const name = input.name.trim().slice(0, 80)
    if (name.length < 2) return null
    out.name = name
  }
  if (input.country !== undefined) {
    const c = input.country.trim().toUpperCase()
    if (!isCountryCode(c)) return null
    out.country = c
  }
  if (input.logoUrl !== undefined) {
    if (input.logoUrl !== null && !isBlobImageUrl(input.logoUrl)) return null
    out.logoUrl = input.logoUrl
  }
  if (input.contactEmail !== undefined) {
    const e = trimOrNull(input.contactEmail, 200)
    if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null
    out.contactEmail = e
  }
  if (input.description !== undefined) out.description = trimOrNull(input.description, 600)
  if (input.city !== undefined) out.city = trimOrNull(input.city, 80)
  for (const k of ["instagram", "twitter", "tiktok", "facebook"] as const) {
    if (input[k] !== undefined) out[k] = trimOrNull(input[k], 200)
  }
  return out
}

/** Profile fields from the club profile form (absent fields are left untouched). */
export function clubProfileFromForm(form: FormData): ClubProfileInput {
  const str = (k: string) => {
    const v = form.get(k)
    return typeof v === "string" ? v : undefined
  }
  const nullable = (k: string) => {
    const v = str(k)
    return v === undefined ? undefined : v.trim() || null
  }
  return {
    name: str("name"),
    country: str("country"),
    city: nullable("city"),
    description: nullable("description"),
    logoUrl: nullable("logoUrl"),
    instagram: nullable("instagram"),
    twitter: nullable("twitter"),
    tiktok: nullable("tiktok"),
    facebook: nullable("facebook"),
    contactEmail: nullable("contactEmail"),
  }
}

/** Owner, collaborators and superadmin edit the profile; only owner/superadmin rename. */
export async function updateClubProfile(
  tx: Tx,
  actorId: string,
  clubId: string,
  input: ClubProfileInput
): Promise<ClubOpResult> {
  const access = await getClubAccess(actorId, { id: clubId }, tx)
  if (!access) return fail("not_found")
  if (!access.canManage) return fail("forbidden")
  if (input.name !== undefined && !access.canAdminister) return fail("forbidden")
  const data = cleanClubProfile(input)
  if (!data) return fail("invalid")
  await tx.club.update({ where: { id: clubId }, data })
  return ok
}

// ── Superadmin: create clubs, approve registrations ─────────

export function slugify(name: string): string {
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

/** A free slug for `name` (adds -2, -3… on collisions). */
export async function uniqueClubSlug(db: Db, name: string): Promise<string> {
  const base = slugify(name)
  for (let i = 1; i < 100; i++) {
    const slug = i === 1 ? base : `${base}-${i}`
    if (!(await db.club.findUnique({ where: { slug }, select: { id: true } }))) return slug
  }
  return `${base}-${Date.now().toString(36)}`
}

export async function createClub(
  tx: Tx,
  actorId: string,
  input: ClubProfileInput & { name: string; country: string }
): Promise<ClubOpResult & { slug?: string }> {
  if (!(await isSuperadmin(actorId, tx))) return fail("forbidden")
  const data = cleanClubProfile(input)
  if (!data?.name || !data.country) return fail("invalid")
  const slug = await uniqueClubSlug(tx, data.name)
  await tx.club.create({ data: { ...data, name: data.name, country: data.country, slug } })
  return { ok: true, slug }
}

// ── Owner from the landing registration ─────────────────────

/**
 * Whoever registered the club on the landing form becomes its owner when they
 * join it with the same verified email, unless the club already has an owner.
 * Returns true when ownership was assigned.
 */
export async function claimRegistrantOwnership(tx: Tx, userId: string, clubId: string): Promise<boolean> {
  const [club, user] = await Promise.all([
    tx.club.findUnique({
      where: { id: clubId },
      select: { ownerId: true, registration: { select: { email: true } } },
    }),
    tx.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true, ownedClub: { select: { id: true } } },
    }),
  ])
  if (!club || club.ownerId || !club.registration || !user?.emailVerified || user.ownedClub) return false
  if (club.registration.email.trim().toLowerCase() !== user.email.trim().toLowerCase()) return false
  if (!(await activeMembership(tx, userId, clubId))) return false
  await tx.club.update({ where: { id: clubId }, data: { ownerId: userId } })
  return true
}
