import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppTranslator } from "@/lib/app-i18n"
import { getClubAccess } from "@/lib/club-admin"
import { ClubProfileForm } from "@/components/app/clubs/ClubProfileForm"
import { ClubMembers, type ClubMemberRow } from "@/components/app/clubs/ClubMembers"
import { OwnerPicker } from "@/components/app/clubs/OwnerPicker"
import { getPendingOwnerInvite } from "@/lib/club-owners"
import { updateClubProfileAction } from "./actions"

export const metadata: Metadata = { robots: { index: false, follow: false } }

// Club management: owner, collaborators and the superadmin.
export default async function ManageClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  const access = await getClubAccess(session?.user.id, { slug })
  if (!access?.canManage) notFound()

  const { t, locale } = await getAppTranslator("clubAdmin")
  const [club, memberships, pendingInvite] = await Promise.all([
    prisma.club.findUniqueOrThrow({
      where: { id: access.club.id },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        description: true,
        logoUrl: true,
        bannerUrl: true,
        instagram: true,
        twitter: true,
        tiktok: true,
        facebook: true,
        contactEmail: true,
        memberCount: true,
        ownerId: true,
        owner: { select: { username: true } },
      },
    }),
    prisma.clubMembership.findMany({
      where: { clubId: access.club.id, activeUserId: { not: null } },
      orderBy: { joinedAt: "asc" },
      select: {
        role: true,
        joinedAt: true,
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    }),
    access.superadmin ? getPendingOwnerInvite(prisma, access.club.id) : Promise.resolve(null),
  ])

  const rank = (m: ClubMemberRow) => (m.isOwner ? 0 : m.isCollaborator ? 1 : 2)
  const members: ClubMemberRow[] = memberships
    .map((m) => ({
      id: m.user.id,
      name: m.user.name || "Runner",
      username: m.user.username,
      image: m.user.image,
      joinedAt: m.joinedAt.toLocaleDateString(locale, { dateStyle: "medium" }),
      isOwner: m.user.id === club.ownerId,
      isCollaborator: m.role === "ADMIN",
      isViewer: m.user.id === session?.user.id,
    }))
    .sort((a, b) => rank(a) - rank(b))

  const yourRole = access.isOwner
    ? t("roles.owner")
    : access.superadmin
      ? t("superadmin")
      : t("roles.collaborator")

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-8 lg:px-8">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-brand-green">
          ← {t("backToDashboard")}
        </Link>
        {access.superadmin && (
          <Link href="/admin/clubs" className="text-muted transition-colors hover:text-brand-green">
            {t("backToAdmin")}
          </Link>
        )}
      </nav>

      <header className="flex items-center gap-4">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-2 ring-line">
          {club.logoUrl ? (
            <Image src={club.logoUrl} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-green">
              {club.name.charAt(0).toUpperCase()}
            </span>
          )}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{club.name}</h1>
          <p className="text-sm text-muted">
            {t("members", { count: club.memberCount })} ·{" "}
            {club.owner?.username ? t("ownedBy", { username: club.owner.username }) : t("managedByW3")} ·{" "}
            {t("yourRole", { role: yourRole })}
          </p>
        </div>
      </header>

      {access.superadmin && (
        <section className="border border-line bg-surface-alt/40 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("owner.title")}</h2>
          <OwnerPicker clubId={club.id} clubName={club.name} pendingInvite={pendingInvite?.email ?? null} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("membersTitle")}</h2>
        <ClubMembers
          clubId={club.id}
          members={members}
          canAdminister={access.canAdminister}
          viewerIsOwner={access.isOwner}
          superadmin={access.superadmin}
        />
      </section>

      <section className="border border-line bg-surface-alt/40 p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">{t("profileTitle")}</h2>
        <ClubProfileForm
          initial={{
            name: club.name,
            city: club.city ?? "",
            country: club.country,
            description: club.description ?? "",
            logoUrl: club.logoUrl,
            bannerUrl: club.bannerUrl,
            instagram: club.instagram ?? "",
            twitter: club.twitter ?? "",
            tiktok: club.tiktok ?? "",
            facebook: club.facebook ?? "",
            contactEmail: club.contactEmail ?? "",
          }}
          action={updateClubProfileAction.bind(null, club.id)}
          canRename={access.canAdminister}
          submitLabel={t("profileSubmit")}
        />
      </section>
    </div>
  )
}
