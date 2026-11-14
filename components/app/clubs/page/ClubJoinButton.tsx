"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { getClubViewerState } from "@/lib/club-page"
import { cancelJoinRequestAction, joinClubAction } from "@/app/(app)/(protected)/(onboarded)/clubs/actions"

type Viewer = Awaited<ReturnType<typeof getClubViewerState>>

const primary =
  "border border-brand-green bg-brand-green px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:opacity-50"

/** Join (open club) / Request to join (approval) / pending / member — or sign in for guests. */
export function ClubJoinButton({ clubId, requiresApproval, viewer }: { clubId: string; requiresApproval: boolean; viewer: Viewer }) {
  const t = useTranslations("clubPage")
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!viewer.signedIn) {
    return (
      <Link href="/auth/sign-in" className={primary}>
        {requiresApproval ? t("request") : t("join")}
      </Link>
    )
  }
  if (viewer.isMember) return <span className="text-sm font-semibold text-brand-green">✓ {t("yourClub")}</span>
  if (!viewer.onboarded || viewer.inOtherClub || viewer.pendingElsewhere) return null

  if (viewer.pendingHere) {
    return (
      <span className="flex items-center gap-3">
        <span className="text-sm text-muted">{t("pending")}</span>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => { await cancelJoinRequestAction(); router.refresh() })}
          className="text-sm font-semibold text-muted hover:text-red-400"
        >
          {t("cancel")}
        </button>
      </span>
    )
  }

  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        className={primary}
        onClick={() =>
          start(async () => {
            const r = await joinClubAction(clubId)
            if (!r.ok) setError(t(`errors.${r.error}`, { club: r.clubName ?? "" }))
            router.refresh()
          })
        }
      >
        {pending ? t("joining") : requiresApproval ? t("request") : t("join")}
      </button>
      {error && <span className="mt-1 text-xs text-red-400">{error}</span>}
    </span>
  )
}
