"use client"

import { useLocale, useTranslations } from "next-intl"
import type { ClubPageData } from "@/lib/club-page"
import { RunnerAvatar, RunnerName } from "./RunnerAvatar"

/** Monthly leaderboard of the club by kilometers (ties share a place). */
export function ClubLeaderboard({ rows }: { rows: ClubPageData["leaderboard"] }) {
  const t = useTranslations("clubPage")
  const locale = useLocale()
  const month = new Date().toLocaleDateString(locale, { month: "long", timeZone: "UTC" })
  const km = (m: number) => `${(m / 1000).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`

  return (
    <section className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("leaderboardTitle", { month })}</h3>
      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center border border-dashed border-line bg-surface-alt/30 p-8 text-center text-sm text-muted">
          {t("leaderboardEmpty")}
        </p>
      ) : (
        <div className="border border-line bg-surface-alt/40">
          <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted">
            <span className="w-8 text-center">#</span>
            <span className="flex-1">{t("colRunner")}</span>
            <span className="hidden w-16 text-right sm:block">{t("colRuns")}</span>
            <span className="w-20 text-right">{t("colKm")}</span>
          </div>
          <ol className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.runner.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`w-8 text-center text-sm font-extrabold ${r.rank <= 3 ? "text-brand-green" : "text-muted"}`}>{r.rank}</span>
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <RunnerAvatar runner={r.runner} size={32} />
                  <RunnerName runner={r.runner} />
                </span>
                <span className="hidden w-16 text-right text-sm text-muted sm:block">{r.activities}</span>
                <span className="w-20 text-right text-sm font-bold text-foreground">{km(r.distanceMeters)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
