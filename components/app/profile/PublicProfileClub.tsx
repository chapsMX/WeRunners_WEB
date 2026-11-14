"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import type { DashboardMembership, MonthlyClubStats, PersonalRecordRow } from "@/lib/dashboard-data"
import { ActivityIcon, FlameIcon, TargetIcon, TrophyIcon } from "../icons"
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
    <Link
      href={`/clubs/${club.clubSlug}`}
      className="mt-4 inline-flex items-center gap-3 border border-brand-green/30 bg-brand-green/5 px-4 py-2.5 text-left transition-colors hover:border-brand-green"
    >
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
    </Link>
  )
}

/** "Monthly ranking in <club>": rank · activities / contribution · productivity (month to date). */
export function ProfileClubStats({ clubName, monthly }: { clubName: string; monthly: NonNullable<MonthlyClubStats> }) {
  const t = useTranslations("profile.clubStats")
  const locale = useLocale()
  const km = (meters: number) => `${Math.round(meters / 1000).toLocaleString(locale)} km`

  const cards: StatGridCard[] = [
    {
      title: t("rank"),
      value: monthly.rank.rank ? `#${monthly.rank.rank}` : "—",
      sub: monthly.rank.rank
        ? t("rankSub", { runners: monthly.rank.runners, dist: km(monthly.rank.distanceMeters) })
        : t("noRankMonth"),
      icon: TrophyIcon,
    },
    { title: t("activities"), value: monthly.activities.toLocaleString(locale), sub: t("thisMonth"), icon: FlameIcon },
    { title: t("contribution"), value: km(monthly.contributionMeters), sub: t("toClub", { club: clubName }), icon: ActivityIcon },
    { title: t("productivity"), value: `${monthly.productivityPct.toFixed(1)}%`, sub: t("ofClub", { club: clubName }), icon: TargetIcon },
  ]

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("title", { club: clubName })}</h3>
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
