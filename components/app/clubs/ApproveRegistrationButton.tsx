"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import {
  approveRegistrationAction,
  grantBetaAction,
  type AdminActionResult,
} from "@/app/(app)/(protected)/(onboarded)/admin/clubs/actions"

/** Admin button that runs an action and reports whether the email went out. */
function AdminActionButton({ run, label, pendingLabel }: { run: () => Promise<AdminActionResult>; label: string; pendingLabel: string }) {
  const t = useTranslations("clubAdmin")
  const [pending, start] = useTransition()
  const [result, setResult] = useState<AdminActionResult | null>(null)
  return (
    <span className="inline-flex items-center gap-2">
      {result && !result.ok && <span className="text-xs text-red-400">{t("form.errors.unknown")}</span>}
      {result?.ok && result.emailed === false && <span className="text-xs text-yellow-300">{t("emailFailed")}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setResult(await run()))}
        className="border border-brand-green bg-brand-green px-3 py-1.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:opacity-50"
      >
        {pending ? pendingLabel : label}
      </button>
    </span>
  )
}

export function ApproveRegistrationButton({ registrationId }: { registrationId: string }) {
  const t = useTranslations("clubAdmin")
  return <AdminActionButton run={() => approveRegistrationAction(registrationId)} label={t("approve")} pendingLabel={t("approving")} />
}

export function GrantBetaButton({ email }: { email: string }) {
  const t = useTranslations("clubAdmin")
  return <AdminActionButton run={() => grantBetaAction(email)} label={t("grantBeta")} pendingLabel={t("granting")} />
}
