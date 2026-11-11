"use client"

import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import type { ClubSummary, HeroSummary, PersonalRecordRow } from "@/lib/dashboard-data"
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

/** "Sample data" badge — shown while the runner has no real activities yet. */
export function ProfileSampleBadge() {
  const t = useTranslations("profile")
  return (
    <span className="border border-brand-green/40 bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
      {t("sampleBadge")}
    </span>
  )
}

/** The runner's club, shown right under their name. */
export function ProfileClub({ club }: { club: ClubSummary | null }) {
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
          <Image src={club.logoUrl} alt={club.name} fill sizes="40px" className="object-cover" />
        ) : (
          <span className="text-sm font-bold text-brand-green">
            {club.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("label")}</p>
        <p className="font-semibold leading-tight text-foreground">{club.name}</p>
        {place && <p className="text-xs text-muted">{place}</p>}
      </div>
    </div>
  )
}

/** Club rank (week / month), total contribution and share of the club total. */
export function ProfileClubStats({ club, hero }: { club: ClubSummary; hero: HeroSummary }) {
  const t = useTranslations("profile.clubStats")
  const locale = useLocale()

  const km = (meters: number) => `${Math.round(meters / 1000).toLocaleString(locale)} km`
  const rankValue = (rank: number | null) => (rank ? `#${rank}` : "—")

  const cards: StatGridCard[] = [
    {
      title: t("rankWeekly"),
      value: rankValue(hero.weeklyRank),
      sub:
        hero.weeklyRank == null
          ? t("noRankWeek")
          : `${km(hero.weeklyDistanceMeters)} · ${t("thisWeek")}`,
      icon: TrophyIcon,
    },
    {
      title: t("rankMonthly"),
      value: rankValue(hero.monthlyRank),
      sub:
        hero.monthlyRank == null
          ? t("noRankMonth")
          : `${km(hero.monthlyDistanceMeters)} · ${t("thisMonth")}`,
      icon: TrophyIcon,
    },
    {
      title: t("contribution"),
      value: km(hero.contributionMeters),
      sub: t("toClub", { club: club.name }),
      icon: ActivityIcon,
    },
    {
      title: t("share"),
      value: `${hero.productivityPct.toFixed(1)}%`,
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
