"use client"

import { useLocale, useTranslations } from "next-intl"
import { formatDistance, formatPace } from "@/lib/format"
import type { PersonalTotals } from "@/lib/dashboard-data"
import { ActivityIcon, FlameIcon, TargetIcon, TrophyIcon } from "../icons"
import { StatGrid, type StatGridCard } from "./StatGrid"

/** "Your numbers": all-time totals across all of the runner's runs. */
export function PersonalStats({ totals }: { totals: PersonalTotals }) {
  const t = useTranslations("dashboard.personal")
  const locale = useLocale()

  const cards: StatGridCard[] = [
    {
      title: t("totalDistance"),
      value: `${Math.round(totals.totalDistanceMeters / 1000).toLocaleString(locale)} km`,
      sub: t("allTime"),
      icon: ActivityIcon,
    },
    {
      title: t("longest"),
      value: totals.longestRunMeters > 0 ? formatDistance(totals.longestRunMeters) : "—",
      sub: t("longestSub"),
      icon: TrophyIcon,
    },
    {
      title: t("activities"),
      value: totals.totalActivities.toLocaleString(locale),
      sub: t("allTime"),
      icon: FlameIcon,
    },
    {
      title: t("pace"),
      value: formatPace(totals.avgPaceSecPerKm),
      sub: t("paceSub"),
      icon: TargetIcon,
    },
  ]

  return (
    <section className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("title")}</h3>
      <StatGrid cards={cards} />
    </section>
  )
}
