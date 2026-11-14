"use client"

import { useLocale, useTranslations } from "next-intl"
import { daysSince, formatDistance, formatPace, formatShortDate } from "@/lib/format"
import type { ClubPageData } from "@/lib/club-page"
import { RunnerAvatar, RunnerName } from "./RunnerAvatar"

/** The club's latest counted runs this month. */
export function ClubMonthActivities({ activities }: { activities: ClubPageData["activities"] }) {
  const t = useTranslations("clubPage")
  const tr = useTranslations("dashboard.recent")
  const locale = useLocale()
  const when = (date: Date) => {
    const days = daysSince(date)
    if (days <= 0) return tr("today")
    if (days === 1) return tr("yesterday")
    if (days < 7) return tr("daysAgo", { days })
    return formatShortDate(date, locale)
  }

  return (
    <section className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("activitiesTitle")}</h3>
      {activities.length === 0 ? (
        <p className="flex flex-1 items-center justify-center border border-dashed border-line bg-surface-alt/30 p-8 text-center text-sm text-muted">
          {t("activitiesEmpty")}
        </p>
      ) : (
        <ul className="divide-y divide-line border border-line bg-surface-alt/40">
          {activities.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-3">
              <RunnerAvatar runner={a.runner} />
              <div className="min-w-0 flex-1">
                <RunnerName runner={a.runner} />
                <p className="text-xs text-muted">
                  {when(a.date)} · {formatPace(a.avgPaceSecPerKm)}
                </p>
              </div>
              <span className="text-base font-bold text-foreground">{formatDistance(a.distanceMeters)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
