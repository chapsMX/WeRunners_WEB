"use client"

import { useTranslations } from "next-intl"
import { formatDistance, formatPace } from "@/lib/format"
import type { PersonalSummary } from "@/lib/dashboard-data"
import { ActivityIcon, FlameIcon, TargetIcon } from "../icons"
import { StatCard } from "./StatCard"

export function PersonalStats({ personal }: { personal: PersonalSummary }) {
  const t = useTranslations("dashboard.personal")

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("title")}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          title={t("week")}
          value={formatDistance(personal.weekDistanceMeters)}
          sub={t("thisWeek")}
          icon={ActivityIcon}
        />
        <StatCard
          title={t("month")}
          value={formatDistance(personal.monthDistanceMeters)}
          sub={t("thisMonth")}
          icon={ActivityIcon}
        />
        <StatCard
          title={t("streak")}
          value={`${personal.streakDays} d`}
          sub={t("streakHint")}
          icon={FlameIcon}
        />
        <StatCard
          title={t("pace")}
          value={formatPace(personal.avgPaceSecPerKm)}
          sub={t("paceSub")}
          icon={TargetIcon}
        />
      </div>
    </section>
  )
}
