"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { WebhookProvider } from "@/lib/ops-health"
import { retryWebhookEventAction } from "@/app/(app)/(protected)/(onboarded)/admin/activity/actions"

/** Admin › Activity › Webhooks: retry one stuck/failed event now. */
export function RetryEventButton({ provider, eventId }: { provider: WebhookProvider; eventId: string }) {
  const t = useTranslations("clubAdmin.activity.webhooks")
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null)
            const r = await retryWebhookEventAction(provider, eventId)
            if (!r.ok) setError(r.error ? r.error.slice(0, 120) : t("retryFailed"))
            router.refresh()
          })
        }
        className="border border-brand-green px-3 py-1.5 text-sm font-semibold text-brand-green transition-colors hover:bg-brand-green hover:text-brand-navy disabled:opacity-50"
      >
        {pending ? t("retrying") : t("retry")}
      </button>
      {error && <span className="max-w-xs text-right text-xs text-red-400">{error}</span>}
    </span>
  )
}
