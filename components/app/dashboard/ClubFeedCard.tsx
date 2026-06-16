"use client"

import { useLocale, useTranslations } from "next-intl"
import { daysSince, formatDistance, formatShortDate } from "@/lib/format"
import type { ClubFeedRow } from "@/lib/dashboard-data"

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-green/10 text-sm font-bold text-brand-green">
      {initial}
    </span>
  )
}

export function ClubFeedCard({
  clubName,
  feed,
}: {
  clubName: string | null
  feed: ClubFeedRow[]
}) {
  const t = useTranslations("dashboard.clubFeed")
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
    <section className="flex h-full flex-col border border-line bg-surface-alt/40">
      {/* Encabezado: nombre del club */}
      <div className="border-b border-line p-5">
        <h3 className="text-lg font-bold text-foreground">{clubName ?? t("fallbackName")}</h3>
        <p className="text-xs text-muted">{t("subtitle")}</p>
      </div>

      {/* Cabecera de columnas */}
      <div className="flex items-center gap-4 border-b border-line px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-muted">
        <span className="flex-1">{t("colRunner")}</span>
        <span className="hidden w-24 text-right sm:block">{t("colDistance")}</span>
        <span className="w-20 text-right">{t("colWhen")}</span>
      </div>

      {/* Filas */}
      <ul className="flex flex-1 flex-col divide-y divide-line">
        {feed.map((row) => (
          <li key={row.id} className="flex items-center gap-4 px-5 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={row.name} />
              <span className="truncate text-sm font-semibold text-foreground">{row.name}</span>
            </div>
            <span className="hidden w-24 text-right text-sm font-medium text-foreground sm:block">
              {formatDistance(row.distanceMeters)}
            </span>
            <span className="w-20 text-right text-sm text-muted">{when(row.date)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
