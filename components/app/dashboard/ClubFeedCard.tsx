"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { daysSince, formatDistance, formatShortDate } from "@/lib/format"
import type { ClubFeedRow } from "@/lib/dashboard-data"

function Avatar({ row }: { row: ClubFeedRow }) {
  const body = row.image ? (
    <Image src={row.image} alt="" fill sizes="36px" className="object-cover" />
  ) : (
    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-brand-green">
      {row.name.charAt(0).toUpperCase()}
    </span>
  )
  const cls = "relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-1 ring-line"
  return row.username ? (
    <Link href={`/u/${row.username}`} className={cls} aria-label={row.name}>
      {body}
    </Link>
  ) : (
    <span className={cls}>{body}</span>
  )
}

/** Latest runs that counted for the runner's club (real data). */
export function ClubFeedCard({
  clubName,
  clubSlug,
  feed,
}: {
  clubName: string | null
  clubSlug: string | null
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
    <section className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {clubName && clubSlug ? (
          <Link href={`/clubs/${clubSlug}`} className="hover:text-brand-green">
            {t("titleLastRuns", { club: clubName })} →
          </Link>
        ) : (
          clubName ?? t("fallbackName")
        )}
      </h3>

      {!clubName || feed.length === 0 ? (
        <div className="flex flex-1 items-center justify-center border border-dashed border-line bg-surface-alt/30 p-8 text-center text-sm text-muted">
          {clubName ? t("empty") : t("noClub")}
        </div>
      ) : (
        <div className="flex flex-1 flex-col border border-line bg-surface-alt/40">
          <div className="flex items-center gap-4 border-b border-line px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-muted">
            <span className="flex-1">{t("colRunner")}</span>
            <span className="w-24 text-right">{t("colDistance")}</span>
            <span className="w-20 text-right">{t("colWhen")}</span>
          </div>
          <ul className="flex flex-1 flex-col divide-y divide-line">
            {feed.map((row) => (
              <li key={row.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar row={row} />
                  {row.username ? (
                    <Link href={`/u/${row.username}`} className="truncate text-sm font-semibold text-foreground hover:text-brand-green">
                      @{row.username}
                    </Link>
                  ) : (
                    <span className="truncate text-sm font-semibold text-foreground">{row.name}</span>
                  )}
                </div>
                <span className="w-24 text-right text-sm font-medium text-foreground">{formatDistance(row.distanceMeters)}</span>
                <span className="w-20 text-right text-sm text-muted">{when(row.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
