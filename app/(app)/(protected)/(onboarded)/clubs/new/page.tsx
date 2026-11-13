import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppTranslator } from "@/lib/app-i18n"
import { getPendingClubRequest } from "@/lib/clubs"
import { ClubRequestForm } from "@/components/app/clubs/ClubRequestForm"

// A runner without a club asks for theirs to be added to W3Runn3rs.
export default async function NewClubRequestPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")
  const active = await prisma.clubMembership.findUnique({ where: { activeUserId: session.user.id }, select: { id: true } })
  if (active) redirect("/dashboard")

  const { t } = await getAppTranslator("clubRequest")
  const pending = await getPendingClubRequest(prisma, session.user.id, session.user.email)

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8 lg:px-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-green">
        ← {t("back")}
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>
      {pending ? (
        <p className="border border-brand-green/40 bg-brand-green/10 p-5 text-sm text-foreground">
          {t("pending", { club: pending.clubName })}
        </p>
      ) : (
        <section className="border border-line bg-surface-alt/40 p-6">
          <ClubRequestForm defaultEmail={session.user.email} />
        </section>
      )}
    </div>
  )
}
