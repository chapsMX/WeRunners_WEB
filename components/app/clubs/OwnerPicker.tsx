"use client"

import Image from "next/image"
import { useEffect, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import type { OwnerCandidate } from "@/lib/club-owners"
import {
  assignOwnerAction,
  searchOwnersAction,
  type AssignOwnerActionResult,
} from "@/app/(app)/(protected)/(onboarded)/clubs/[slug]/manage/actions"

/** Superadmin: search accounts + waitlist and pick the club's owner. */
export function OwnerPicker({
  clubId,
  clubName,
  pendingInvite,
}: {
  clubId: string
  clubName: string
  pendingInvite: string | null
}) {
  const t = useTranslations("clubAdmin.owner")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<OwnerCandidate[]>([])
  const [searching, setSearching] = useState(false)
  const [pending, start] = useTransition()
  const [outcome, setOutcome] = useState<AssignOwnerActionResult | null>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const id = setTimeout(async () => {
      setResults(await searchOwnersAction(clubId, q))
      setSearching(false)
    }, 300)
    return () => clearTimeout(id)
  }, [query, clubId])

  function pick(c: OwnerCandidate) {
    const who = c.kind === "user" ? c.name : c.name || c.email
    const key = c.kind === "user" ? "confirmUser" : "confirmInvite"
    if (!window.confirm(t(key, { name: who, club: clubName, email: c.email }))) return
    setOutcome(null)
    start(async () => {
      const r = await assignOwnerAction(clubId, c.kind === "user" ? { userId: c.userId } : { email: c.email })
      setOutcome(r)
      if (r.ok) {
        setQuery("")
        setResults([])
      }
    })
  }

  const statusLabel = (c: OwnerCandidate) => {
    if (c.kind === "waitlist") return c.invitedTo ? t("status.invitedTo", { club: c.invitedTo }) : t("status.waitlist")
    if (c.status === "other_club") return t("status.otherClub", { club: c.clubName ?? "" })
    return t(`status.${c.status}`)
  }
  const blocked = (c: OwnerCandidate) =>
    (c.kind === "user" && c.status === "other_club") || (c.kind === "waitlist" && c.invitedTo !== null && c.invitedTo !== clubName)

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{t("hint")}</p>
      {pendingInvite && <p className="text-sm text-yellow-300">{t("pendingInvite", { email: pendingInvite })}</p>}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full rounded-xl border border-line bg-surface-alt/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-brand-green focus:outline-none"
      />
      {searching && <p className="text-xs text-muted">{t("searching")}</p>}
      {!searching && query.trim().length >= 2 && results.length === 0 && (
        <p className="text-xs text-muted">{t("noResults")}</p>
      )}
      {results.length > 0 && (
        <ul className="divide-y divide-line border border-line bg-surface-alt/40">
          {results.map((c) => {
            const name = c.kind === "user" ? c.name : c.name || c.email
            return (
              <li key={c.kind === "user" ? c.userId : `w:${c.email}`} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
                  {c.kind === "user" && c.image ? (
                    <Image src={c.image} alt="" fill sizes="36px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-brand-green">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {name}
                    {c.kind === "user" && c.username && <span className="ml-1 font-normal text-muted">@{c.username}</span>}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {c.email} · {statusLabel(c)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending || blocked(c)}
                  onClick={() => pick(c)}
                  className="border border-brand-green bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-muted"
                >
                  {c.kind === "user" ? t("makeOwner") : t("invite")}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {outcome?.ok && (
        <p className="text-sm text-brand-green">
          {t(outcome.kind === "assigned" ? "doneAssigned" : "doneInvited", { email: outcome.email })}
          {!outcome.emailed && <span className="ml-1 text-yellow-300">{t("emailFailed")}</span>}
        </p>
      )}
      {outcome && !outcome.ok && (
        <p className="text-sm text-red-400">{t(`errors.${outcome.error}`, { club: outcome.clubName ?? "" })}</p>
      )}
    </div>
  )
}
