"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { getClubViewerState } from "@/lib/club-page"
import { cancelJoinRequestAction, joinClubAction } from "@/app/(app)/(protected)/(onboarded)/clubs/actions"

type Viewer = Awaited<ReturnType<typeof getClubViewerState>>

const primary =
  "border border-brand-green bg-brand-green px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:opacity-50"

/**
 * Join (open club) / Request to join (approval) / pending / member. Guests and
 * runners who haven't finished onboarding go through the club invite link
 * (/clubs/<slug>/join): sign-in → access → onboarding with this club picked.
 */
export function ClubJoinButton({
  clubId,
  clubSlug,
  clubName,
  requiresApproval,
  viewer,
}: {
  clubId: string
  clubSlug: string
  clubName: string
  requiresApproval: boolean
  viewer: Viewer
}) {
  const t = useTranslations("clubPage")
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!viewer.signedIn || (!viewer.onboarded && !viewer.isMember)) {
    return (
      // Plain <a>: the invite link is a route handler (cookie + redirect), not a page.
      <a href={`/clubs/${encodeURIComponent(clubSlug)}/join`} className={primary}>
        {requiresApproval ? t("request") : t("join")}
      </a>
    )
  }
  if (viewer.isMember) return <span className="text-sm font-semibold text-brand-green">✓ {t("yourClub")}</span>
  // In a free-switch club (Solo): they can move here. Any other club: no switching.
  if ((viewer.inOtherClub && !viewer.canSwitch) || viewer.pendingElsewhere) return null

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
        onClick={() => {
          if (viewer.canSwitch && viewer.currentClubName) {
            const key = requiresApproval ? "switchConfirmApproval" : "switchConfirm"
            if (!window.confirm(t(key, { from: viewer.currentClubName, to: clubName }))) return
          }
          start(async () => {
            const r = await joinClubAction(clubId)
            if (!r.ok) setError(t(`errors.${r.error}`, { club: r.clubName ?? "" }))
            router.refresh()
          })
        }}
      >
        {pending ? t("joining") : requiresApproval ? t("request") : t("join")}
      </button>
      {error && <span className="mt-1 text-xs text-red-400">{error}</span>}
    </span>
  )
}
