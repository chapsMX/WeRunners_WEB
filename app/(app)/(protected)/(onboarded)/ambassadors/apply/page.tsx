import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppTranslator } from "@/lib/app-i18n"
import { countryName } from "@/lib/countries"
import { getAmbassadorEligibility, getMyApplication } from "@/lib/ambassador-applications"
import { AMBASSADOR_APPLY_PATH } from "@/lib/ambassador-intent"
import { AmbassadorApplyForm } from "@/components/app/ambassadors/AmbassadorApplyForm"
import { SignUpTracker } from "@/components/app/SignUpTracker"

export const metadata: Metadata = {
  title: "Ambassador application · We Runners",
  robots: { index: false, follow: false },
}

const card = "border border-line bg-surface-alt/40 p-6"
const primary =
  "inline-flex border border-brand-green bg-brand-green px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90"

// Ambassadors lead a running club: the club is required (owner of a Club, or a
// club request waiting for approval). Already applied → their status.
export default async function AmbassadorApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ signup?: string | string[] }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(AMBASSADOR_APPLY_PATH)}`)
  const { signup } = await searchParams
  const signUpMethod = signup === "google" || signup === "email" ? signup : null

  const { t, locale } = await getAppTranslator("ambassadorApply")
  const [user, application] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, instagramHandle: true, twitterHandle: true },
    }),
    getMyApplication(prisma, session.user),
  ])
  const eligibility = application ? null : await getAmbassadorEligibility(prisma, session.user.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8 lg:px-8">
      {signUpMethod && <SignUpTracker method={signUpMethod} />}
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">{t("eyebrow")}</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>

      {application ? (
        <section className={card}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("status.label")}</p>
          <p
            className={`mt-1 text-xl font-bold ${
              application.status === "shortlisted" ? "text-brand-green" : application.status === "rejected" ? "text-muted" : "text-foreground"
            }`}
          >
            {t(`status.${application.status}.title`)}
          </p>
          <p className="mt-2 text-sm text-muted">{t(`status.${application.status}.body`)}</p>
          <p className="mt-4 text-xs text-muted">
            {t("status.sent", { date: application.createdAt.toLocaleDateString(locale, { dateStyle: "medium" }) })}
          </p>
        </section>
      ) : eligibility?.status === "eligible" && user ? (
        <>
          <section className={`${card} flex flex-wrap items-center justify-between gap-3`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("club.label")}</p>
              <p className="mt-1 font-semibold text-foreground">
                {eligibility.club.kind === "club" ? (
                  <Link href={`/clubs/${eligibility.club.slug}`} className="hover:text-brand-green">
                    {eligibility.club.name}
                  </Link>
                ) : (
                  eligibility.club.name
                )}
                <span className="ml-2 text-sm font-normal text-muted">{countryName(eligibility.club.country, locale)}</span>
              </p>
            </div>
            {eligibility.club.kind === "registration" && (
              <span className="border border-yellow-300/60 px-2 py-0.5 text-xs text-yellow-300">{t("club.pending")}</span>
            )}
          </section>
          <section className={card}>
            <AmbassadorApplyForm
              name={user.name || session.user.email}
              email={user.email}
              instagram={user.instagramHandle}
              twitter={user.twitterHandle}
            />
          </section>
        </>
      ) : eligibility?.status === "member" ? (
        <section className={card}>
          <h2 className="text-lg font-bold text-foreground">{t("member.title")}</h2>
          <p className="mt-2 text-sm text-muted">{t("member.body", { club: eligibility.clubName })}</p>
          <a href="mailto:run@w3runn3rs.com" className="mt-4 inline-block text-sm font-semibold text-brand-green hover:underline">
            run@w3runn3rs.com
          </a>
        </section>
      ) : (
        <section className={card}>
          <h2 className="text-lg font-bold text-foreground">{t("noClub.title")}</h2>
          <p className="mt-2 text-sm text-muted">{t("noClub.body")}</p>
          <Link href={`/clubs/new?next=${encodeURIComponent(AMBASSADOR_APPLY_PATH)}`} className={`${primary} mt-4`}>
            {t("noClub.cta")}
          </Link>
        </section>
      )}
    </div>
  )
}
