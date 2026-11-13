"use client"

import { useActionState, useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"
import { countryOptions } from "@/lib/countries"
import {
  createClubRequestAction,
  type ClubRequestState,
} from "@/app/(app)/(protected)/(onboarded)/clubs/new/actions"

const input =
  "mt-2 w-full rounded-xl border border-line bg-surface-alt/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-brand-green focus:outline-none"

export function ClubRequestForm({ defaultEmail }: { defaultEmail: string }) {
  const t = useTranslations("clubRequest")
  const locale = useLocale()
  const countries = useMemo(() => countryOptions(locale), [locale])
  const [state, action, pending] = useActionState<ClubRequestState, FormData>(createClubRequestAction, {})

  const field = (name: string, label: string, opts: { required?: boolean; type?: string; placeholder?: string; defaultValue?: string; hint?: string } = {}) => (
    <div>
      <label htmlFor={`req-${name}`} className="block text-sm font-semibold text-foreground">
        {label}
        {opts.required && " *"}
      </label>
      <input
        id={`req-${name}`}
        name={name}
        type={opts.type ?? "text"}
        required={opts.required}
        placeholder={opts.placeholder}
        defaultValue={opts.defaultValue}
        className={input}
      />
      {opts.hint && <p className="mt-1.5 text-xs text-muted">{opts.hint}</p>}
    </div>
  )

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">{field("clubName", t("clubName"), { required: true })}</div>
        {field("city", t("city"), { required: true })}
        <div>
          <label htmlFor="req-country" className="block text-sm font-semibold text-foreground">
            {t("country")} *
          </label>
          <select id="req-country" name="country" defaultValue="MX" className={input}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          {field("email", t("email"), { required: true, type: "email", defaultValue: defaultEmail, hint: t("emailHint") })}
        </div>
        {field("runners", t("runners"), { type: "number", placeholder: "25" })}
        {field("instagram", "Instagram", { placeholder: "@club" })}
        {field("tiktok", "TikTok", { placeholder: "@club" })}
      </div>
      <p className="text-xs text-muted">{t("ownerNote")}</p>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="border border-brand-green bg-brand-green px-5 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:opacity-50"
        >
          {pending ? t("sending") : t("submit")}
        </button>
        {state.error && <span className="text-sm text-red-400">{t(`errors.${state.error}`)}</span>}
      </div>
    </form>
  )
}
