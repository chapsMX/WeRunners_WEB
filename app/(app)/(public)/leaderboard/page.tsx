import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppLocale } from "@/lib/app-i18n"
import { shareMetadata } from "@/lib/app-share-metadata"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import { getClubLeaderboard, parseLeaderboardPeriod } from "@/lib/leaderboard"
import { ClubLeaderboardView } from "@/components/app/leaderboard/ClubLeaderboardView"

type SearchParams = Promise<{ period?: string | string[]; lang?: string | string[] }>

// Link previews have no cookie: shared links carry ?lang=es for the Spanish card.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { lang } = await searchParams
  const locale = lang === "es" || lang === "en" ? lang : await getAppLocale()
  const t = (locale === "es" ? es : en).leaderboard
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    ...shareMetadata({ title: t.metaTitle, description: t.metaDescription, image: `/api/og/leaderboard?lang=${locale}` }),
  }
}

// Global club leaderboard — public and shareable (see middleware).
export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: SearchParams
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
