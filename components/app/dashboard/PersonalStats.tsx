"use client"

import { useTranslations } from "next-intl"
import { formatDistance, formatPace } from "@/lib/format"
import type { PersonalSummary } from "@/lib/dashboard-data"
import { ActivityIcon, FlameIcon, TargetIcon } from "../icons"
import { StatGrid, type StatGridCard } from "./StatGrid"

export function PersonalStats({ personal }: { personal: PersonalSummary }) {
  const t = useTranslations("dashboard.personal")

  const cards: StatGridCard[] = [
    {
      title: t("week"),
      value: formatDistance(personal.weekDistanceMeters),
      sub: t("thisWeek"),
      icon: ActivityIcon,
    },
    {
      title: t("month"),
      value: formatDistance(personal.monthDistanceMeters),
      sub: t("thisMonth"),
      icon: ActivityIcon,
    },
    {
      title: t("streak"),
      value: `${personal.streakDays} d`,
      sub: t("streakHint"),
      icon: FlameIcon,
    },
    {
      title: t("pace"),
      value: formatPace(personal.avgPaceSecPerKm),
      sub: t("paceSub"),
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
