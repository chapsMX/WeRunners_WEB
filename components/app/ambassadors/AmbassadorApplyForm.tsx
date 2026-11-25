"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
import { trackEvent } from "@/lib/analytics"
import { AMBASSADOR_LIMITS } from "@/lib/ambassadors"
import {
  submitAmbassadorApplicationAction,
  type ApplyState,
} from "@/app/(app)/(protected)/(onboarded)/ambassadors/apply/actions"

const input =
  "mt-2 w-full border border-line bg-surface-alt/40 px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:border-brand-green focus:outline-none"
const readOnly = "mt-2 w-full border border-line bg-surface-alt/20 px-3 py-2.5 text-muted"

/** Ambassador application: account data read-only, socials prefilled from the profile. */
export function AmbassadorApplyForm({
  name,
  email,
  instagram,
  twitter,
}: {
  name: string
  email: string
  instagram: string | null
  twitter: string | null
}) {
  const t = useTranslations("ambassadorApply.form")
  const [motivation, setMotivation] = useState("")
  const [state, action, pending] = useActionState<ApplyState, FormData>(async (prev, form) => {
    const result = await submitAmbassadorApplicationAction(prev, form)
    if (result.ok) trackEvent.ambassadorApply() // only once it's saved
    return result
  }, {})

  const label = "block text-sm font-semibold text-foreground"
  const handle = (fieldName: string, text: string, defaultValue: string | null, optional = true) => (
    <div>
      <label htmlFor={`amb-${fieldName}`} className={label}>
        {text}
        {optional && <span className="ml-1 font-normal text-muted">{t("optional")}</span>}
      </label>
      <input id={`amb-${fieldName}`} name={fieldName} defaultValue={defaultValue ? `@${defaultValue}` : ""} placeholder="@handle" className={input} />
    </div>
  )

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className={label}>{t("name")}</p>
          <p className={readOnly}>{name}</p>
        </div>
        <div>
          <p className={label}>{t("email")}</p>
          <p className={`${readOnly} truncate`}>{email}</p>
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted">{t("accountHint")}</p>

      <div className="grid gap-5 sm:grid-cols-3">
        {handle("instagram", "Instagram", instagram)}
        {handle("twitter", "X", twitter)}
        {handle("tiktok", "TikTok", null)}
      </div>
      <p className="-mt-2 text-xs text-muted">{t("socialHint")}</p>

      <div>
        <label htmlFor="amb-motivation" className={label}>
          {t("motivation")} *
        </label>
        <textarea
          id="amb-motivation"
          name="motivation"
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          required
          minLength={AMBASSADOR_LIMITS.motivationMin}
          maxLength={AMBASSADOR_LIMITS.motivationMax}
          placeholder={t("motivationPlaceholder")}
          className={`${input} h-36 resize-none`}
        />
        <p className="mt-1.5 text-right text-xs text-muted">
          {motivation.trim().length} / {AMBASSADOR_LIMITS.motivationMax}
        </p>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-400">
          {t(`errors.${state.error}`, { min: AMBASSADOR_LIMITS.motivationMin, max: AMBASSADOR_LIMITS.motivationMax })}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-brand-green bg-brand-green px-4 py-3 font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:opacity-50"
      >
        {pending ? t("sending") : t("submit")}
      </button>
      <p className="text-center text-xs text-muted">{t("note")}</p>
    </form>
  )
}
