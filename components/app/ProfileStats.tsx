"use client"

import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export type ProfileStatsData = {
  following: number
  followers: number
  activities: number
}

export function ProfileStats({
  stats,
  className,
}: {
  stats: ProfileStatsData
  className?: string
}) {
  const t = useTranslations("app.stats")
  const locale = useLocale()
  const fmt = (n: number) => n.toLocaleString(locale)

  const items = [
    { label: t("following"), value: stats.following },
    { label: t("followers"), value: stats.followers },
    { label: t("activities"), value: stats.activities },
  ]

  return (
    <dl className={cn("grid grid-cols-3 divide-x divide-line", className)}>
      {items.map((it) => (
        <div key={it.label} className="flex flex-col items-center px-1">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {it.label}
          </dt>
          <dd className="mt-0.5 text-lg font-bold text-foreground">{fmt(it.value)}</dd>
        </div>
      ))}
    </dl>
  )
}
