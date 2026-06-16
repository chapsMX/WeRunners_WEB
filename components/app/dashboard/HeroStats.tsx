"use client"

import { useLocale, useTranslations } from "next-intl"
import type { HeroSummary } from "@/lib/dashboard-data"
import { ActivityIcon, TargetIcon, TrophyIcon } from "../icons"
import { StatCard } from "./StatCard"

export function HeroStats({
  name,
  hero,
  hasClub,
}: {
  name: string
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

  const cards = [
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
    <section>
      {/* Banda full-bleed con título indentado */}
      <div className="bg-brand-blue px-6 pb-20 pt-7 text-white lg:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("greeting", { name })}</h1>
      </div>

      {/* Tarjetas superpuestas con el mismo margen interior */}
      <div className="-mt-14 grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 md:grid-cols-4 lg:px-8">
        {cards.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  )
}
