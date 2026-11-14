"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { countryName } from "@/lib/countries"
import { cancelJoinRequestAction, joinClubAction } from "@/app/(app)/(protected)/(onboarded)/clubs/actions"

type DirectoryClub = {
  id: string
  name: string
  slug: string
  city: string | null
  country: string
  logoUrl: string | null
  memberCount: number
  requiresApproval: boolean
}

export function ClubDirectory({
  clubs,
  myClubId,
  pendingClubId,
}: {
  clubs: DirectoryClub[]
  myClubId: string | null
  pendingClubId: string | null
}) {
  const t = useTranslations("clubDirectory")
  const locale = useLocale()
  const [query, setQuery] = useState("")
  const [pending, start] = useTransition()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clubs
    return clubs.filter((c) =>
      [c.name, c.city ?? "", countryName(c.country, locale)].some((v) => v.toLowerCase().includes(q))
    )
  }, [clubs, query, locale])

  const myClub = clubs.find((c) => c.id === myClubId)
  const pendingClub = clubs.find((c) => c.id === pendingClubId)

  function join(club: DirectoryClub) {
    setError(null)
    setBusy(club.id)
    start(async () => {
      const r = await joinClubAction(club.id)
      if (!r.ok) setError(t(`errors.${r.error}`, { club: r.clubName ?? "" }))
      setBusy(null)
    })
  }
  function cancel() {
    setError(null)
    setBusy("cancel")
    start(async () => {
      await cancelJoinRequestAction()
      setBusy(null)
    })
  }

  const primary =
    "border border-brand-green bg-brand-green px-3 py-1.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:opacity-50"

  return (
    <div className="space-y-4">
      {myClub && <p className="border border-line bg-surface-alt/40 p-4 text-sm text-muted">{t("inClub", { club: myClub.name })}</p>}
      {pendingClub && (
        <div className="flex flex-wrap items-center gap-3 border border-brand-green/40 bg-brand-green/10 p-4 text-sm">
          <span className="flex-1 text-foreground">{t("pendingNote", { club: pendingClub.name })}</span>
          <button type="button" onClick={cancel} disabled={pending} className="text-sm font-semibold text-muted hover:text-red-400">
            {busy === "cancel" ? t("cancelling") : t("cancel")}
          </button>
        </div>
      )}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search")}
        className="w-full rounded-xl border border-line bg-surface-alt/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-brand-green focus:outline-none"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}

      {shown.length === 0 ? (
        <p className="border border-dashed border-line bg-surface-alt/30 p-6 text-center text-sm text-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-line border border-line bg-surface-alt/40">
          {shown.map((c) => {
            const place = [c.city, countryName(c.country, locale)].filter(Boolean).join(" · ")
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
                  {c.logoUrl ? (
                    <Image src={c.logoUrl} alt="" fill sizes="44px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-bold text-brand-green">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                    <span className="truncate">{c.name}</span>
                    {c.requiresApproval && (
                      <span className="border border-line px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-muted">
                        🔒 {t("approvalBadge")}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {place} · {t("members", { count: c.memberCount })}
                  </p>
                </div>
                {c.id === myClubId ? (
                  <span className="text-sm font-semibold text-brand-green">{t("yourClub")}</span>
                ) : c.id === pendingClubId ? (
                  <span className="text-sm text-muted">{t("pending")}</span>
                ) : !myClubId && !pendingClubId ? (
                  <button type="button" disabled={pending} onClick={() => join(c)} className={primary}>
                    {busy === c.id ? t("joining") : c.requiresApproval ? t("request") : t("join")}
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {!myClub && (
        <p className="text-sm text-muted">
          {t("missing")}{" "}
          <Link href="/clubs/new" className="font-semibold text-brand-green hover:underline">
            {t("register")} →
          </Link>
        </p>
      )}
    </div>
  )
}
