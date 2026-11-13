import Image from "next/image"
import Link from "next/link"
import { getAppTranslator } from "@/lib/app-i18n"
import { prisma } from "@/lib/prisma"
import { countryName } from "@/lib/countries"
import { ClubProfileForm, EMPTY_CLUB_FORM } from "@/components/app/clubs/ClubProfileForm"
import { ApproveRegistrationButton, GrantBetaButton } from "@/components/app/clubs/ApproveRegistrationButton"
import { createClubAction } from "./actions"

// Superadmin: every club, pending landing registrations, and "create club".
export default async function AdminClubsPage() {
  const { t, locale } = await getAppTranslator("clubAdmin")

  const [clubs, pending, waitlist] = await Promise.all([
    prisma.club.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        country: true,
        logoUrl: true,
        memberCount: true,
        active: true,
        owner: { select: { username: true, name: true } },
      },
    }),
    prisma.clubRegistration.findMany({
      where: { enabled: false, club: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, clubName: true, city: true, country: true, email: true, runners: true, createdAt: true, requestedBy: { select: { username: true } } },
    }),
    prisma.waitlistEntry.findMany({
      where: { betaAccess: false },
      orderBy: { createdAt: "asc" },
      select: { email: true, name: true, createdAt: true, convertedAt: true },
    }),
  ])
  const withAccount = new Set(
    (
      await prisma.user.findMany({
        where: { email: { in: waitlist.map((w) => w.email), mode: "insensitive" } },
        select: { email: true },
      })
    ).map((u) => u.email.toLowerCase())
  )

  const place = (city: string | null, country: string) =>
    [city, countryName(country, locale)].filter(Boolean).join(" · ")

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-8 lg:px-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">{t("superadmin")}</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{t("adminTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{t("adminSubtitle")}</p>
      </header>

      {/* Pending registrations from the landing */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("pendingTitle", { count: pending.length })}
        </h2>
        {pending.length === 0 ? (
          <p className="border border-dashed border-line bg-surface-alt/30 p-6 text-center text-sm text-muted">
            {t("pendingEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-line border border-line bg-surface-alt/40">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{r.clubName}</p>
                  <p className="truncate text-xs text-muted">
                    {place(r.city, r.country)}
                    {r.runners ? ` · ${t("declared", { count: r.runners })}` : ""} · {r.email} ·{" "}
                    {r.createdAt.toLocaleDateString(locale, { dateStyle: "medium" })}
                    {r.requestedBy?.username ? ` · ${t("requestedBy", { username: r.requestedBy.username })}` : ""}
                  </p>
                </div>
                <ApproveRegistrationButton registrationId={r.id} />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted">{t("pendingHint")}</p>
      </section>

      {/* Waitlist → beta access */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("waitlistTitle", { count: waitlist.length })}
        </h2>
        {waitlist.length === 0 ? (
          <p className="border border-dashed border-line bg-surface-alt/30 p-6 text-center text-sm text-muted">
            {t("waitlistEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-line border border-line bg-surface-alt/40">
            {waitlist.map((w) => (
              <li key={w.email} className="flex flex-wrap items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {w.name || w.email}
                    {withAccount.has(w.email.toLowerCase()) && (
                      <span className="ml-2 border border-line px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-muted">
                        {t("hasAccount")}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {w.name ? `${w.email} · ` : ""}
                    {w.createdAt.toLocaleDateString(locale, { dateStyle: "medium" })}
                  </p>
                </div>
                <GrantBetaButton email={w.email} />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted">{t("waitlistHint")}</p>
      </section>

      {/* Clubs */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("clubsTitle", { count: clubs.length })}
        </h2>
        <ul className="divide-y divide-line border border-line bg-surface-alt/40">
          {clubs.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
                {c.logoUrl ? (
                  <Image src={c.logoUrl} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-bold text-brand-green">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {c.name}
                  {!c.active && <span className="ml-2 text-xs font-normal text-red-400">{t("inactive")}</span>}
                </p>
                <p className="truncate text-xs text-muted">
                  {place(c.city, c.country)} · {t("members", { count: c.memberCount })} ·{" "}
                  {c.owner?.username ? t("ownedBy", { username: c.owner.username }) : t("managedByW3")}
                </p>
              </div>
              <Link
                href={`/clubs/${c.slug}/manage`}
                className="border border-line px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-green hover:text-brand-green"
              >
                {t("manage")} →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Create a club */}
      <section className="border border-line bg-surface-alt/40 p-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">{t("createTitle")}</h2>
        <p className="mb-5 text-sm text-muted">{t("createHint")}</p>
        <ClubProfileForm
          initial={EMPTY_CLUB_FORM}
          action={createClubAction}
          canRename
          submitLabel={t("createSubmit")}
          resetOnSuccess
        />
      </section>
    </div>
  )
}
