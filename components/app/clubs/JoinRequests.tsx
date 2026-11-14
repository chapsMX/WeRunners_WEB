"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { decideJoinRequestAction } from "@/app/(app)/(protected)/(onboarded)/clubs/[slug]/manage/actions"

type RequestRow = { id: string; name: string; username: string | null; image: string | null; requestedAt: string }

/** Pending join requests with approve / reject (owner, collaborators, superadmin). */
export function JoinRequests({ requests }: { requests: RequestRow[] }) {
  const t = useTranslations("clubAdmin.requests")
  const [pending, start] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function decide(r: RequestRow, approve: boolean) {
    if (!approve && !window.confirm(t("confirmReject", { name: r.name }))) return
    setMessage(null)
    setBusyId(r.id)
    start(async () => {
      const res = await decideJoinRequestAction(r.id, approve)
      if (!res.ok) setMessage(t(`errors.${res.error}`))
      else if (!res.emailed) setMessage(t("emailFailed"))
      setBusyId(null)
    })
  }

  if (requests.length === 0) {
    return <p className="border border-dashed border-line bg-surface-alt/30 p-6 text-center text-sm text-muted">{t("empty")}</p>
  }

  return (
    <>
      {message && <p className="mb-2 text-sm text-yellow-300">{message}</p>}
      <ul className="divide-y divide-line border border-line bg-surface-alt/40">
        {requests.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
              {r.image ? (
                <Image src={r.image} alt="" fill sizes="40px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-bold text-brand-green">{r.name.charAt(0).toUpperCase()}</span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              {r.username ? (
                <Link href={`/u/${r.username}`} className="block truncate font-semibold text-foreground hover:text-brand-green">
                  {r.name}
                </Link>
              ) : (
                <span className="block truncate font-semibold text-foreground">{r.name}</span>
              )}
              <span className="block truncate text-xs text-muted">
                {r.username ? `@${r.username} · ` : ""}
                {t("requested", { date: r.requestedAt })}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending && busyId === r.id}
                onClick={() => decide(r, true)}
                className="border border-brand-green bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:opacity-50"
              >
                {t("approve")}
              </button>
              <button
                type="button"
                disabled={pending && busyId === r.id}
                onClick={() => decide(r, false)}
                className="border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-red-500/60 hover:text-red-400 disabled:opacity-50"
              >
                {t("reject")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
