import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppTranslator } from "@/lib/app-i18n"
import { getClubDirectory } from "@/lib/clubs"
import { ClubDirectory } from "@/components/app/clubs/ClubDirectory"

export const metadata: Metadata = {
  title: "Clubs · W3Runn3rs",
  description: "Every running club on W3Runn3rs. Pick yours and every kilometer counts for it.",
}

// Every club on W3Runn3rs. Runners without a club join (open clubs) or ask
// to join (approval clubs) from here.
export default async function ClubsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")
  const { t } = await getAppTranslator("clubDirectory")
  const dir = await getClubDirectory(prisma, session.user.id)

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8 lg:px-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>
      <ClubDirectory clubs={dir.clubs} myClubId={dir.myClubId} pendingClubId={dir.pendingClubId} />
    </div>
  )
}
