"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { formatDistance } from "@/lib/format"
import type { ClubSummary } from "@/lib/dashboard-data"
import { ArrowDownIcon, ArrowUpIcon, TrophyIcon } from "../icons"

export function ClubRankCard({ club }: { club: ClubSummary | null }) {
  const t = useTranslations("dashboard.rank")

  if (!club) {
    return (
      <section className="flex h-full flex-col rounded-2xl border border-line bg-surface-alt/40 p-6">
        <div className="flex items-center gap-2 text-muted">
          <TrophyIcon size={18} />
          <h3 className="text-sm font-semibold uppercase tracking-wide">{t("title")}</h3>
        </div>
        <p className="mt-4 text-sm text-muted">{t("noClub")}</p>
      </section>
    )
  }

  const up = club.rankDelta > 0
  const down = club.rankDelta < 0

  return (
    <section className="flex h-full flex-col rounded-2xl border border-line bg-surface-alt/40 p-6">
      <div className="flex items-center gap-2 text-muted">
        <TrophyIcon size={18} />
        <h3 className="text-sm font-semibold uppercase tracking-wide">{t("titleGlobal")}</h3>
      </div>

      {club.rank ? (
        <>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-bold leading-none text-foreground">
              #{club.rank}
            </span>
            {club.rankDelta !== 0 && (
              <span
                className={`mb-1 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  up
                    ? "bg-brand-green/10 text-brand-green"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {up && <ArrowUpIcon size={13} />}
                {down && <ArrowDownIcon size={13} />}
                {Math.abs(club.rankDelta)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {t("thisWeek", { dist: formatDistance(club.totalDistanceMeters, 0) })}
          </p>

          {club.gapToNextMeters != null && club.nextRivalName && (
            <div className="mt-5 rounded-xl border border-line bg-background/40 p-3">
              <p className="text-sm text-foreground">
                {t.rich("gap", {
                  dist: formatDistance(club.gapToNextMeters, 0),
                  b: (chunks) => (
                    <span className="font-semibold text-brand-green">{chunks}</span>
                  ),
                })}
              </p>
              <p className="text-sm font-semibold text-foreground">{club.nextRivalName}</p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4">
          <p className="text-2xl font-bold text-foreground">{club.name}</p>
          <p className="mt-1 text-sm text-muted">
            {t("thisWeek", { dist: formatDistance(club.totalDistanceMeters, 0) })}
          </p>
          <p className="mt-4 rounded-xl border border-line bg-background/40 p-3 text-xs text-muted">
            {t("pending")}
          </p>
        </div>
      )}

      <div className="mt-auto pt-5">
        <Link
          href="/clubs"
          className="text-sm font-semibold text-brand-green hover:underline"
        >
          {t("viewClub")}
        </Link>
      </div>
    </section>
  )
}
