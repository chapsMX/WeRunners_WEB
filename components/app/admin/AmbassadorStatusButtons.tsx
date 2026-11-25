"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { AmbassadorStatus } from "@/lib/ambassador-applications"
import { setAmbassadorStatusAction } from "@/app/(app)/(protected)/(onboarded)/admin/ambassadors/actions"

/** Admin › Ambassadors: move an application between pending, shortlisted and rejected. */
export function AmbassadorStatusButtons({ id, status }: { id: string; status: AmbassadorStatus }) {
  const t = useTranslations("clubAdmin.ambassadors")
  const router = useRouter()
  const [pending, start] = useTransition()
  const set = (next: AmbassadorStatus) =>
    start(async () => {
      await setAmbassadorStatusAction(id, next)
      router.refresh()
    })
  const btn = "border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
  return (
    <span className="flex flex-wrap gap-2">
      {status !== "shortlisted" && (
        <button type="button" disabled={pending} onClick={() => set("shortlisted")} className={`${btn} border-brand-green text-brand-green hover:bg-brand-green hover:text-brand-navy`}>
          {t("shortlist")}
        </button>
      )}
      {status !== "rejected" && (
        <button type="button" disabled={pending} onClick={() => set("rejected")} className={`${btn} border-line text-muted hover:border-red-400 hover:text-red-400`}>
          {t("reject")}
        </button>
      )}
      {status !== "pending" && (
        <button type="button" disabled={pending} onClick={() => set("pending")} className={`${btn} border-line text-muted hover:text-foreground`}>
          {t("reset")}
        </button>
      )}
    </span>
  )
}
