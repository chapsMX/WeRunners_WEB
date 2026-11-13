"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { approveRegistrationAction } from "@/app/(app)/(protected)/(onboarded)/admin/clubs/actions"

export function ApproveRegistrationButton({ registrationId }: { registrationId: string }) {
  const t = useTranslations("clubAdmin")
  const [pending, start] = useTransition()
  const [failed, setFailed] = useState(false)
  return (
    <span className="inline-flex items-center gap-2">
      {failed && <span className="text-xs text-red-400">{t("form.errors.unknown")}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setFailed(!(await approveRegistrationAction(registrationId)))
          })
        }
        className="border border-brand-green bg-brand-green px-3 py-1.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:opacity-50"
      >
        {pending ? t("approving") : t("approve")}
      </button>
    </span>
  )
}
