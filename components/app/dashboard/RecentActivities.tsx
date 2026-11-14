"use client"

import { useLocale, useTranslations } from "next-intl"
import {
  daysSince,
  formatDistance,
  formatDuration,
  formatPace,
  formatShortDate,
} from "@/lib/format"
import type { ActivityRow } from "@/lib/dashboard-data"
import { ActivityIcon } from "../icons"
import { XIcon } from "@/components/ui/SocialIcons"

// Plataformas de origen — marcas que no se traducen (MANUAL sí, vía i18n).
const SOURCE_LABEL: Record<string, string> = {
  GARMIN: "Garmin",
  POLAR: "Polar",
  SUUNTO: "Suunto",
  COROS: "Coros",
  STRAVA: "Strava",
  APPLE_HEALTH: "Apple",
  GOOGLE_FIT: "Google Fit",
}

/** X (Twitter) share link for one run. */
function shareUrl(text: string) {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`
}

export function RecentActivities({
  activities,
  clubName,
}: {
  activities: ActivityRow[]
  /** Runner's current club — used in the share text when the run itself didn't count for one. */
  clubName: string | null
}) {
  const t = useTranslations("dashboard.recent")
  const locale = useLocale()

  function dateLabel(date: Date): string {
    const days = daysSince(date)
    if (days <= 0) return t("today")
    if (days === 1) return t("yesterday")
    if (days < 7) return t("daysAgo", { days })
    return formatShortDate(date, locale)
  }

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("title")}
      </h3>

      {activities.length === 0 ? (
        <div className="border border-dashed border-line bg-surface-alt/30 p-8 text-center">
          <ActivityIcon size={26} className="mx-auto text-muted" />
          <p className="mt-3 text-sm font-semibold text-foreground">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted">{t("emptyBody")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden border border-line bg-surface-alt/40">
          {activities.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-alt"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-green/10 text-brand-green">
                <ActivityIcon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {a.title || t("defaultTitle")}
                </p>
                <p className="text-xs text-muted">
                  {dateLabel(a.date)} · {SOURCE_LABEL[a.source] ?? t("manual")}
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-xs text-muted">{t("pace")}</p>
                <p className="text-sm font-medium text-foreground">
                  {formatPace(a.avgPaceSecPerKm)}
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-xs text-muted">{t("time")}</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDuration(a.durationSeconds)}
                </p>
              </div>

              <div className="w-20 text-right">
                <p className="text-base font-bold text-foreground">
                  {formatDistance(a.distanceMeters)}
                </p>
              </div>

              <a
                href={shareUrl(
                  (a.clubName ?? clubName)
                    ? t("shareText", { dist: formatDistance(a.distanceMeters), club: a.clubName ?? clubName ?? "" })
                    : t("shareTextNoClub", { dist: formatDistance(a.distanceMeters) })
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("share")}
                title={t("share")}
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-line text-muted transition-colors hover:border-brand-green hover:text-brand-green"
              >
                <XIcon size={14} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
