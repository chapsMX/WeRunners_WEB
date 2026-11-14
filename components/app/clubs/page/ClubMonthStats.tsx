"use client"

import { useLocale, useTranslations } from "next-intl"
import type { ClubPageData } from "@/lib/club-page"

/** This month at a glance: km, runs, active runners, members. */
export function ClubMonthStats({ month, memberCount }: { month: ClubPageData["month"]; memberCount: number }) {
  const t = useTranslations("clubPage.stats")
  const locale = useLocale()
  const items = [
    { label: t("km"), value: `${Math.round(month.distanceMeters / 1000).toLocaleString(locale)} km` },
    { label: t("activities"), value: month.activities.toLocaleString(locale) },
    { label: t("runners"), value: month.runners.toLocaleString(locale) },
    { label: t("members"), value: memberCount.toLocaleString(locale) },
  ]
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("title")}</h3>
      <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="flex flex-col items-center gap-1 bg-surface-alt p-5 text-center">
            <span className="text-2xl font-extrabold text-white">{i.value}</span>
            <span className="text-xs uppercase tracking-wide text-muted">{i.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
