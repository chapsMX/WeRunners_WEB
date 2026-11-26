import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppLocale, getAppTranslator } from "@/lib/app-i18n"
import { shareMetadata } from "@/lib/app-share-metadata"
import { getClubDirectory } from "@/lib/clubs"
import { ClubDirectory } from "@/components/app/clubs/ClubDirectory"
import en from "@/messages/en.json"
import es from "@/messages/es.json"

type SearchParams = Promise<{ lang?: string | string[] }>

// Link previews have no cookie: ?lang=es gives the Spanish card.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { lang } = await searchParams
  const locale = lang === "es" || lang === "en" ? lang : await getAppLocale()
  const t = (locale === "es" ? es : en).clubDirectory
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    ...shareMetadata({ title: t.metaTitle, description: t.metaDescription, image: `/api/og/clubs?lang=${locale}` }),
  }
}

// Every club on We Runners — public. Guests join through each club's invite
// link (sign-up with the club picked); onboarded runners join or ask to join
// right here.
export default async function ClubsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { onboardingCompletedAt: true } })
    : null
  const member = Boolean(user?.onboardingCompletedAt)
  const { t } = await getAppTranslator("clubDirectory")
  const dir = await getClubDirectory(prisma, member ? session!.user.id : null)

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8 lg:px-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>
      <ClubDirectory
        clubs={dir.clubs}
        myClubId={dir.myClubId}
        pendingClubId={dir.pendingClubId}
        canSwitch={dir.canSwitch}
        guest={!member}
      />
    </div>
  )
}
