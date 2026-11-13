"use client"

import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import type { DashboardMembership, PersonalRecordRow, RankingSummary, RankPosition } from "@/lib/dashboard-data"
import { ActivityIcon, TargetIcon, TrophyIcon } from "../icons"
import { StatGrid, type StatGridCard } from "../dashboard/StatGrid"
import { RecordsCard } from "../dashboard/RecordsCard"

function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code
  } catch {
    return code
  }
}

/** The runner's club, shown right under their name. */
export function ProfileClub({ club }: { club: DashboardMembership }) {
  const t = useTranslations("profile.club")
  const locale = useLocale()

  if (!club) {
    return <p className="mt-4 text-sm text-muted">{t("none")}</p>
  }

  const place = [club.city, countryName(club.country, locale)].filter(Boolean).join(" · ")

  return (
    <div className="mt-4 inline-flex items-center gap-3 border border-brand-green/30 bg-brand-green/5 px-4 py-2.5 text-left">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
        {club.logoUrl ? (
          <Image src={club.logoUrl} alt={club.clubName} fill sizes="40px" className="object-cover" />
        ) : (
          <span className="text-sm font-bold text-brand-green">
            {club.clubName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("label")}</p>
        <p className="font-semibold leading-tight text-foreground">{club.clubName}</p>
        {place && <p className="text-xs text-muted">{place}</p>}
      </div>
    </div>
  )
}

/** Real ranking for the runner: global + club monthly, club contribution and share. */
export function ProfileClubStats({ clubName, ranking }: { clubName: string; ranking: RankingSummary }) {
  const t = useTranslations("profile.clubStats")
  const locale = useLocale()

  const km = (meters: number) => `${Math.round(meters / 1000).toLocaleString(locale)} km`
  const rankCard = (title: string, pos: RankPosition | null): StatGridCard => ({
    title,
    value: pos?.rank ? `#${pos.rank}` : "—",
    sub: pos?.rank ? t("rankSub", { runners: pos.runners, dist: km(pos.distanceMeters) }) : t("noRankMonth"),
    icon: TrophyIcon,
  })

  const cards: StatGridCard[] = [
    rankCard(t("globalMonthly"), ranking.globalMonthly),
    rankCard(t("clubMonthly"), ranking.clubMonthly),
    {
      title: t("contribution"),
      value: km(ranking.contributionMeters),
      sub: t("toClub", { club: clubName }),
      icon: ActivityIcon,
    },
    {
      title: t("share"),
      value: `${ranking.productivityPct.toFixed(1)}%`,
      sub: t("ofClubTotal"),
      icon: TargetIcon,
    },
  ]

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("title")}
      </h3>
      <StatGrid cards={cards} />
    </section>
  )
}

export function ProfileRecords({ records }: { records: PersonalRecordRow[] }) {
  const t = useTranslations("profile.records")
  return (
    <RecordsCard records={records} title={t("title")} subtitle={t("subtitle")} bleed={false} />
  )
}
