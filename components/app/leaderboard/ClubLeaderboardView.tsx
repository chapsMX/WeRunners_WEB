"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { countryName } from "@/lib/countries"
import { APP_URL, shareLinks } from "@/lib/share"
import type { ClubLeaderboard, LeaderboardPeriod } from "@/lib/leaderboard"
import { ShareButtons } from "../ShareButtons"

/** Global club leaderboard: tabs (month / week), ranked clubs, then clubs without km. */
export function ClubLeaderboardView({ board, myClubId }: { board: ClubLeaderboard; myClubId: string | null }) {
  const t = useTranslations("leaderboard")
  const locale = useLocale()
  const km = (m: number, digits = 1) =>
    `${(m / 1000).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })} km`

  const start = new Date(board.start)
  const periodLabel =
    board.period === "month"
      ? start.toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: "UTC" })
      : `${start.toLocaleDateString(locale, { day: "numeric", month: "short", timeZone: "UTC" })} – ${new Date(
          start.getTime() + 6 * 86_400_000
        ).toLocaleDateString(locale, { day: "numeric", month: "short", timeZone: "UTC" })}`

  const tab = (period: LeaderboardPeriod) => (
    <Link
      key={period}
      href={period === "month" ? "/leaderboard" : "/leaderboard?period=week"}
      aria-current={board.period === period ? "page" : undefined}
      className={cn(
        "border px-4 py-2 text-sm font-semibold transition-colors",
        board.period === period
          ? "border-brand-green bg-brand-green text-brand-navy"
          : "border-line text-muted hover:border-brand-green hover:text-brand-green"
      )}
    >
      {t(`tabs.${period}`)}
    </Link>
  )

  return (
    <div className="space-y-6 px-6 py-8 text-foreground lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">{t("share")}</span>
          <ShareButtons
            links={shareLinks(t("shareText"), `${APP_URL}/leaderboard${locale === "es" ? "?lang=es" : ""}`)}
            labels={{ x: t("shareX"), farcaster: t("shareFarcaster") }}
          />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <nav className="flex gap-2">{["month", "week"].map((p) => tab(p as LeaderboardPeriod))}</nav>
        <span className="text-sm text-muted">{periodLabel}</span>
      </div>

      {board.rankedClubs === 0 && (
        <p className="border border-dashed border-line bg-surface-alt/30 p-4 text-center text-sm text-muted">
          {t(`empty.${board.period}`)}
        </p>
      )}

      <div className="border border-line bg-surface-alt/40">
        <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted">
          <span className="w-6 text-center sm:w-8">#</span>
          <span className="flex-1">{t("colClub")}</span>
          <span className="hidden w-20 text-right sm:block">{t("colRunners")}</span>
          <span className="hidden w-24 text-right md:block">{t("colPerRunner")}</span>
          <span className="w-20 text-right sm:w-24">{t("colKm")}</span>
        </div>
        <ol className="divide-y divide-line">
          {board.rows.map((r) => {
            const mine = r.club.id === myClubId
            const place = [r.club.city, countryName(r.club.country, locale)].filter(Boolean).join(", ")
            return (
              <li key={r.club.id} className={cn("flex items-center gap-3 px-4 py-3", mine && "bg-brand-green/10")}>
                <span
                  className={cn(
                    "w-6 shrink-0 text-center text-sm font-extrabold sm:w-8",
                    r.rank != null && r.rank <= 3 ? "text-brand-green" : "text-muted"
                  )}
                >
                  {r.rank ?? "–"}
                </span>
                <Link href={`/clubs/${r.club.slug}`} className="group flex min-w-0 flex-1 items-center gap-3">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
                    {r.club.logoUrl ? (
                      <Image src={r.club.logoUrl} alt="" fill sizes="32px" className="object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-brand-green">{r.club.name.charAt(0).toUpperCase()}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold text-foreground group-hover:text-brand-green">{r.club.name}</span>
                      {mine && (
                        <span className="shrink-0 border border-brand-green px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-green">
                          {t("yourClub")}
                        </span>
                      )}
                    </span>
                    {place && <span className="block truncate text-xs text-muted">{place}</span>}
                  </span>
                </Link>
                <span className="hidden w-20 text-right text-sm text-muted sm:block">{r.runners.toLocaleString(locale)}</span>
                <span className="hidden w-24 text-right text-sm text-muted md:block">
                  {r.runners > 0 ? km(r.metersPerRunner) : "–"}
                </span>
                <span className="w-20 shrink-0 text-right text-sm font-bold text-foreground sm:w-24">{km(r.distanceMeters)}</span>
              </li>
            )
          })}
        </ol>
      </div>

      <p className="text-xs text-muted">{t("footnote")}</p>
    </div>
  )
}
