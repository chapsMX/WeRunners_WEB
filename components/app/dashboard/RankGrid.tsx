"use client"

import { useLocale, useTranslations } from "next-intl"
import type { RankingSummary, RankPosition } from "@/lib/dashboard-data"
import { ActivityIcon, TargetIcon, TrophyIcon } from "../icons"
import { StatGrid, type StatGridCard } from "./StatGrid"

/** Ranking 2×2: global monthly · club monthly / club contribution · productivity. */
export function RankGrid({ ranking }: { ranking: RankingSummary }) {
  const t = useTranslations("dashboard.cards")
  const locale = useLocale()

  const km = (meters: number) => `${Math.round(meters / 1000).toLocaleString(locale)} km`
  const hasClub = ranking.clubMonthly !== null

  const rankCard = (title: string, pos: RankPosition | null): StatGridCard => ({
    title,
    value: pos?.rank ? `#${pos.rank}` : "—",
    sub: !pos
      ? t("noClub")
      : pos.rank
        ? t("rankSub", { runners: pos.runners, dist: km(pos.distanceMeters) })
        : t("noRankMonth"),
    icon: TrophyIcon,
  })

  const cards: StatGridCard[] = [
    rankCard(t("globalMonthly"), hasClub ? ranking.globalMonthly : null),
    rankCard(t("clubMonthly"), ranking.clubMonthly),
    {
      title: t("contribution"),
      value: hasClub ? km(ranking.contributionMeters) : "—",
      sub: hasClub ? t("toYourClub") : t("noClub"),
      icon: ActivityIcon,
    },
    {
      title: t("productivity"),
      value: hasClub ? `${ranking.productivityPct.toFixed(1)}%` : "—",
      sub: hasClub ? t("ofClubTotal") : t("noClub"),
      icon: TargetIcon,
    },
  ]

  return (
    <section className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("title")}
      </h3>
      <StatGrid cards={cards} />
    </section>
  )
}
