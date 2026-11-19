import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppTranslator } from "@/lib/app-i18n"
import { appOpenGraph, appTwitter } from "@/lib/app-share-metadata"
import { getClubLeaderboard, parseLeaderboardPeriod } from "@/lib/leaderboard"
import { ClubLeaderboardView } from "@/components/app/leaderboard/ClubLeaderboardView"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAppTranslator("leaderboard")
  const title = t("metaTitle")
  const description = t("metaDescription")
  return {
    title,
    description,
    openGraph: { ...appOpenGraph, title, description },
    twitter: { ...appTwitter, title, description },
  }
}

// Global club leaderboard — public and shareable (see middleware).
export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string | string[] }>
}) {
  const period = parseLeaderboardPeriod((await searchParams).period)
  const session = await auth.api.getSession({ headers: await headers() })
  const [board, membership] = await Promise.all([
    getClubLeaderboard(period),
    session
      ? prisma.clubMembership.findUnique({ where: { activeUserId: session.user.id }, select: { clubId: true } })
      : Promise.resolve(null),
  ])

  return <ClubLeaderboardView board={board} myClubId={membership?.clubId ?? null} />
}
