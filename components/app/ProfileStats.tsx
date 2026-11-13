"use client"

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export type ProfileStatsData = {
  following: number
  followers: number
  activities: number
}

/** Following · Followers · Activities. With a username, the first two link to the lists. */
export function ProfileStats({
  stats,
  username,
  onNavigate,
  className,
}: {
  stats: ProfileStatsData
  username?: string | null
  onNavigate?: () => void
  className?: string
}) {
  const t = useTranslations("app.stats")
  const locale = useLocale()
  const fmt = (n: number) => n.toLocaleString(locale)

  const items = [
    { label: t("following"), value: stats.following, href: username ? `/u/${username}/following` : null },
    { label: t("followers"), value: stats.followers, href: username ? `/u/${username}/followers` : null },
    { label: t("activities"), value: stats.activities, href: null },
  ]

  return (
    <div className={cn("grid grid-cols-3 divide-x divide-line", className)}>
      {items.map((it) => {
        const body = (
          <>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{it.label}</span>
            <span className="stat-value mt-0.5 text-lg font-bold text-foreground">{fmt(it.value)}</span>
          </>
        )
        return it.href ? (
          <Link
            key={it.label}
            href={it.href}
            onClick={onNavigate}
            className="flex flex-col items-center px-1 transition-colors hover:[&_.stat-value]:text-brand-green"
          >
            {body}
          </Link>
        ) : (
          <div key={it.label} className="flex flex-col items-center px-1">
            {body}
          </div>
        )
      })}
    </div>
  )
}
