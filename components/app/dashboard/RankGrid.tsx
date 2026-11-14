"use client"

import { useLocale, useTranslations } from "next-intl"
import type { MonthlyClubStats } from "@/lib/dashboard-data"
import { ActivityIcon, FlameIcon, TargetIcon, TrophyIcon } from "../icons"
import { StatGrid, type StatGridCard } from "./StatGrid"

/** "Your monthly ranking in <club>": rank · activities / contribution · productivity (month to date). */
export function RankGrid({ monthly, clubName }: { monthly: MonthlyClubStats; clubName: string | null }) {
  const t = useTranslations("dashboard.cards")
  const locale = useLocale()
  const km = (meters: number) => `${Math.round(meters / 1000).toLocaleString(locale)} km`
  const club = clubName ?? ""

  const cards: StatGridCard[] = [
    {
      title: t("rank"),
      value: monthly?.rank.rank ? `#${monthly.rank.rank}` : "—",
      sub: !monthly
        ? t("noClub")
        : monthly.rank.rank
          ? t("rankSub", { runners: monthly.rank.runners, dist: km(monthly.rank.distanceMeters) })
          : t("noRankMonth"),
      icon: TrophyIcon,
    },
    {
      title: t("activities"),
      value: monthly ? monthly.activities.toLocaleString(locale) : "—",
      sub: monthly ? t("thisMonth") : t("noClub"),
      icon: FlameIcon,
    },
    {
      title: t("contribution"),
      value: monthly ? km(monthly.contributionMeters) : "—",
      sub: monthly ? t("toClub", { club }) : t("noClub"),
      icon: ActivityIcon,
    },
    {
      title: t("productivity"),
      value: monthly ? `${monthly.productivityPct.toFixed(1)}%` : "—",
      sub: monthly ? t("ofClub", { club }) : t("noClub"),
      icon: TargetIcon,
    },
  ]

  return (
    <section className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {clubName ? t("title", { club: clubName }) : t("titleNoClub")}
      </h3>
      <StatGrid cards={cards} />
    </section>
  )
}
