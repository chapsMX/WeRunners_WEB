import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppTranslator } from "@/lib/app-i18n"
import { getPendingClubRequest } from "@/lib/clubs"
import { ClubRequestForm } from "@/components/app/clubs/ClubRequestForm"
import { AMBASSADOR_APPLY_PATH } from "@/lib/ambassador-intent"

export const metadata: Metadata = {
  title: "Register your club · W3Runn3rs",
}

// A runner without a club asks for theirs to be added to W3Runn3rs.
export default async function NewClubRequestPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  // Only the ambassador application can ask to come back here after sending.
  const next = (await searchParams).next === AMBASSADOR_APPLY_PATH ? AMBASSADOR_APPLY_PATH : null
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")
  const active = await prisma.clubMembership.findUnique({ where: { activeUserId: session.user.id }, select: { id: true } })
  if (active) redirect("/dashboard")

  const { t } = await getAppTranslator("clubRequest")
  const pending = await getPendingClubRequest(prisma, session.user.id, session.user.email)

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8 lg:px-8">
      <Link href={next ?? "/dashboard"} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-green">
        ← {next ? t("backToApplication") : t("back")}
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>
      {pending ? (
        <div className="space-y-4 border border-brand-green/40 bg-brand-green/10 p-5 text-sm text-foreground">
          <p>{t("pending", { club: pending.clubName })}</p>
          {next && (
            <Link href={next} className="inline-flex border border-brand-green bg-brand-green px-4 py-2 font-semibold text-brand-navy hover:bg-brand-green/90">
              {t("continueApplication")}
            </Link>
          )}
        </div>
      ) : (
        <section className="border border-line bg-surface-alt/40 p-6">
          <ClubRequestForm defaultEmail={session.user.email} next={next} />
        </section>
      )}
    </div>
  )
}
