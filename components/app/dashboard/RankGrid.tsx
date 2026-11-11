"use client"

import { useLocale, useTranslations } from "next-intl"
import type { HeroSummary } from "@/lib/dashboard-data"
import { ActivityIcon, TargetIcon, TrophyIcon } from "../icons"
import { StatGrid, type StatGridCard } from "./StatGrid"

/** Las 4 tarjetas de ranking en grid 2×2 (estilo home "Does your running club…"). */
export function RankGrid({
  hero,
  hasClub,
}: {
  hero: HeroSummary
  hasClub: boolean
}) {
  const t = useTranslations("dashboard")
  const locale = useLocale()

  const km = (meters: number) =>
    `${Math.round(meters / 1000).toLocaleString(locale)} km`
  const rankValue = (rank: number | null) => (rank ? `#${rank}` : "—")

  const rankSub = (rank: number | null, dist: number, period: "thisWeek" | "thisMonth") => {
    if (!hasClub) return t("cards.noClub")
    if (rank == null) return t(period === "thisWeek" ? "cards.noRankWeek" : "cards.noRankMonth")
    return `${km(dist)} · ${t(`cards.${period}`)}`
  }

  const cards: StatGridCard[] = [
    {
      title: t("cards.rankWeekly"),
      value: rankValue(hero.weeklyRank),
      sub: rankSub(hero.weeklyRank, hero.weeklyDistanceMeters, "thisWeek"),
      icon: TrophyIcon,
    },
    {
      title: t("cards.rankMonthly"),
      value: rankValue(hero.monthlyRank),
      sub: rankSub(hero.monthlyRank, hero.monthlyDistanceMeters, "thisMonth"),
      icon: TrophyIcon,
    },
    {
      title: t("cards.contribution"),
      value: km(hero.contributionMeters),
      sub: hasClub ? t("cards.toYourClub") : t("cards.noClub"),
      icon: ActivityIcon,
    },
    {
      title: t("cards.productivity"),
      value: `${hero.productivityPct.toFixed(1)}%`,
      sub: hasClub ? t("cards.ofClubTotal") : t("cards.noClub"),
      icon: TargetIcon,
    },
  ]

  return (
    <section className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("rankGridTitle")}
      </h3>

      <StatGrid cards={cards} />
    </section>
  )
}
