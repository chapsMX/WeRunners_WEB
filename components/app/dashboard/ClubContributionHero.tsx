"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/Button"
import { formatKm } from "@/lib/format"
import type { ClubSummary, ContributionSummary } from "@/lib/dashboard-data"
import { ClubIcon } from "../icons"
import { ProgressBar } from "./ProgressBar"

export function ClubContributionHero({
  club,
  contribution,
}: {
  club: ClubSummary | null
  contribution: ContributionSummary
}) {
  const t = useTranslations("dashboard.hero")

  // Sin club activo → onboarding para unirse.
  if (!club) {
    return (
      <section className="rounded-2xl border border-line bg-surface-alt/40 p-6 sm:p-8">
        <ClubIcon size={28} className="text-brand-green" />
        <h2 className="mt-4 text-2xl font-bold text-foreground">{t("noClubTitle")}</h2>
        <p className="mt-2 max-w-md text-sm text-muted">{t("noClubBody")}</p>
        <Link href="/clubs" className="mt-5 inline-block">
          <Button variant="primary">{t("noClubCta")}</Button>
        </Link>
      </section>
    )
  }

  // Posición invertida para la barra (1º = barra llena).
  const rankFill =
    contribution.rankInClub && contribution.totalContributors > 0
      ? ((contribution.totalContributors - contribution.rankInClub + 1) /
          contribution.totalContributors) *
        100
      : 0

  return (
    <section className="relative overflow-hidden rounded-2xl border border-brand-green/30 bg-brand-green/5 p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-green/10 blur-3xl" />

      <p className="text-xs font-semibold uppercase tracking-widest text-brand-green">
        {t("eyebrow")}
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="text-5xl font-bold leading-none text-foreground sm:text-6xl">
          {formatKm(contribution.distanceMeters)}
        </span>
        <span className="pb-1 text-2xl font-semibold text-muted">{t("km")}</span>
        <span className="pb-1.5 text-sm text-muted">
          · {t("activities", { count: contribution.activities })}
        </span>
      </div>

      {/* Ranking del usuario dentro del club */}
      {contribution.rankInClub ? (
        <div className="mt-6 max-w-md">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-foreground">
              {t("contributor", { rank: contribution.rankInClub })}
            </span>
            <span className="text-muted">
              {t("ofActive", { total: contribution.totalContributors })}
            </span>
          </div>
          <ProgressBar value={rankFill} className="mt-2" />
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">{t("beFirst")}</p>
      )}

      {/* Vínculo con el club */}
      <div className="mt-6 flex items-center gap-3 border-t border-brand-green/20 pt-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-alt ring-1 ring-line">
          <ClubIcon size={20} className="text-brand-green" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{club.name}</p>
          <p className="text-xs text-muted">
            {t.rich("share", {
              pct: contribution.sharePct.toFixed(1),
              b: (chunks) => <span className="font-semibold text-brand-green">{chunks}</span>,
            })}
          </p>
        </div>
      </div>
    </section>
  )
}
