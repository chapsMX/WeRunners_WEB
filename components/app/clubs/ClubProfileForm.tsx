"use client"

import Image from "next/image"
import { useActionState, useMemo, useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { countryOptions } from "@/lib/countries"

export type ClubFormState = { ok?: boolean; error?: string; slug?: string }

export type ClubFormInitial = {
  name: string
  city: string
  country: string
  description: string
  logoUrl: string | null
  instagram: string
  twitter: string
  tiktok: string
  facebook: string
  contactEmail: string
}

export const EMPTY_CLUB_FORM: ClubFormInitial = {
  name: "",
  city: "",
  country: "MX",
  description: "",
  logoUrl: null,
  instagram: "",
  twitter: "",
  tiktok: "",
  facebook: "",
  contactEmail: "",
}

const input =
  "mt-2 w-full rounded-xl border border-line bg-surface-alt/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-brand-green focus:outline-none disabled:opacity-60"

/** Club profile: create (superadmin) or edit (owner, collaborators, superadmin). */
export function ClubProfileForm({
  initial,
  action,
  canRename,
  submitLabel,
  resetOnSuccess = false,
}: {
  initial: ClubFormInitial
  action: (prev: ClubFormState, form: FormData) => Promise<ClubFormState>
  canRename: boolean
  submitLabel: string
  resetOnSuccess?: boolean
}) {
  const t = useTranslations("clubAdmin.form")
  const locale = useLocale()
  const countries = useMemo(() => countryOptions(locale), [locale])
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(false)

  const [state, formAction, pending] = useActionState(async (prev: ClubFormState, form: FormData) => {
    const result = await action(prev, form)
    if (result.ok && resetOnSuccess) {
      formRef.current?.reset()
      setLogoUrl(null)
    }
    return result
  }, {})

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(false)
    setUploading(true)
    try {
      const blob = await upload(`clubs/${file.name}`, file, { access: "public", handleUploadUrl: "/api/clubs/logo" })
      setLogoUrl(blob.url)
    } catch {
      setUploadError(true)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const field = (name: keyof ClubFormInitial, label: string, opts: { placeholder?: string; type?: string } = {}) => (
    <div>
      <label htmlFor={`club-${name}`} className="block text-sm font-semibold text-foreground">
        {label}
      </label>
      <input
        id={`club-${name}`}
        name={name}
        type={opts.type ?? "text"}
        defaultValue={(initial[name] as string) ?? ""}
        placeholder={opts.placeholder}
        className={input}
      />
    </div>
  )

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-2 ring-line">
          {logoUrl ? (
            <Image src={logoUrl} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs text-muted">{t("noLogo")}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="border border-line px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-green hover:text-brand-green disabled:opacity-50"
          >
            {uploading ? t("uploading") : t("uploadLogo")}
          </button>
          {logoUrl && (
            <button type="button" onClick={() => setLogoUrl(null)} className="text-sm text-muted hover:text-red-400">
              {t("removeLogo")}
            </button>
          )}
          {uploadError && <span className="text-xs text-red-400">{t("uploadError")}</span>}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogo} />
        <input type="hidden" name="logoUrl" value={logoUrl ?? ""} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="club-name" className="block text-sm font-semibold text-foreground">
            {t("name")}
          </label>
          <input
            id="club-name"
            name={canRename ? "name" : undefined}
            defaultValue={initial.name}
            required={canRename}
            disabled={!canRename}
            className={input}
          />
          {!canRename && <p className="mt-1.5 text-xs text-muted">{t("nameLocked")}</p>}
        </div>
        {field("city", t("city"))}
        <div>
          <label htmlFor="club-country" className="block text-sm font-semibold text-foreground">
            {t("country")}
          </label>
          <select id="club-country" name="country" defaultValue={initial.country} className={input}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="club-description" className="block text-sm font-semibold text-foreground">
            {t("description")}
          </label>
          <textarea
            id="club-description"
            name="description"
            rows={3}
            maxLength={600}
            defaultValue={initial.description}
            className={cn(input, "resize-none")}
          />
        </div>
        {field("instagram", "Instagram", { placeholder: "@club" })}
        {field("twitter", "X", { placeholder: "@club" })}
        {field("tiktok", "TikTok", { placeholder: "@club" })}
        {field("facebook", "Facebook", { placeholder: "facebook.com/club" })}
        <div className="sm:col-span-2">{field("contactEmail", t("contactEmail"), { type: "email" })}</div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="border border-brand-green bg-brand-green px-5 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90 disabled:opacity-50"
        >
          {pending ? t("saving") : submitLabel}
        </button>
        {state.ok && <span className="text-sm text-brand-green">{t("saved")}</span>}
        {state.error && <span className="text-sm text-red-400">{t(`errors.${state.error}`)}</span>}
      </div>
    </form>
  )
}
