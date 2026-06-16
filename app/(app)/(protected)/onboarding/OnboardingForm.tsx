"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { completeOnboarding, type OnboardingState } from "./actions"

type Unit = "KM" | "MILES"
type Locale = "en" | "es"

function SegToggle<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
            value === o.value
              ? "border-brand-green bg-brand-green/10 text-brand-green"
              : "border-line text-muted hover:border-brand-green/50 hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
      <input type="hidden" name={name} value={value} />
    </div>
  )
}

/**
 * Input de red social con prefijo fijo visible (p. ej. `@` o `facebook.com/`).
 * El usuario sólo escribe su segmento; se envía `prefix + segmento` cuando hay
 * texto, o vacío cuando no, vía un input oculto con el `name` real.
 */
function SocialInput({
  id,
  name,
  prefix,
  value,
  onChange,
  placeholder,
  error,
  errorText,
}: {
  id: string
  name: string
  prefix: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  error?: boolean
  errorText?: string
}) {
  const trimmed = value.trim()
  const submitValue = trimmed ? prefix + trimmed : ""
  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-xl border bg-surface-alt/40 px-3 transition-colors focus-within:border-brand-green",
          error ? "border-red-500/60" : "border-line"
        )}
      >
        <span className="shrink-0 text-sm text-muted">{prefix}</span>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={placeholder}
          className="w-full bg-transparent px-1 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none"
        />
        <input type="hidden" name={name} value={submitValue} />
      </div>
      {error && errorText && <p className="mt-1.5 text-xs text-red-400">{errorText}</p>}
    </div>
  )
}

export function OnboardingForm({
  name,
  suggestedUsername,
  defaultUnit,
  defaultLocale,
}: {
  name: string | null
  suggestedUsername: string
  defaultUnit: Unit
  defaultLocale: Locale
}) {
  const t = useTranslations("onboarding")
  const [state, formAction, isPending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    {}
  )

  const [username, setUsername] = useState(suggestedUsername)
  const [unit, setUnit] = useState<Unit>(defaultUnit)
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [twitter, setTwitter] = useState("")
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [strava, setStrava] = useState("")

  const firstName = (name ?? "").split(" ")[0]
  const usernameError = state.error?.field === "username" ? state.error.code : null
  const facebookError = state.error?.field === "facebook" ? state.error.code : null
  const stravaError = state.error?.field === "strava" ? state.error.code : null
  const formError = state.error?.field === "form" ? state.error.code : null

  return (
    <div>
      <p className="text-xl font-bold tracking-tight">
        <span className="text-brand-green">W3</span>
        <span className="text-foreground">RUNN3RS</span>
      </p>

      <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
        {firstName ? t("welcome", { name: firstName }) : t("welcomeNoName")}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>

      <form action={formAction} className="mt-8 space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-foreground">
            {t("usernameLabel")}
          </label>
          <div
            className={cn(
              "mt-2 flex items-center rounded-xl border bg-surface-alt/40 px-3 transition-colors focus-within:border-brand-green",
              usernameError ? "border-red-500/60" : "border-line"
            )}
          >
            <span className="text-muted">@</span>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))
              }
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="tu_username"
              className="w-full bg-transparent px-1 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none"
            />
          </div>
          <p
            className={cn(
              "mt-1.5 text-xs",
              usernameError ? "text-red-400" : "text-muted"
            )}
          >
            {usernameError ? t(`errors.${usernameError}`) : t("usernameHint")}
          </p>
        </div>

        {/* Unidad */}
        <div>
          <span className="block text-sm font-semibold text-foreground">{t("unitLabel")}</span>
          <div className="mt-2">
            <SegToggle<Unit>
              name="preferredUnit"
              value={unit}
              onChange={setUnit}
              options={[
                { value: "KM", label: t("unitKm") },
                { value: "MILES", label: t("unitMiles") },
              ]}
            />
          </div>
        </div>

        {/* Idioma */}
        <div>
          <span className="block text-sm font-semibold text-foreground">{t("localeLabel")}</span>
          <div className="mt-2">
            <SegToggle<Locale>
              name="locale"
              value={locale}
              onChange={setLocale}
              options={[
                { value: "en", label: "English" },
                { value: "es", label: "Español" },
              ]}
            />
          </div>
        </div>

        {/* Redes sociales (opcional) */}
        <div>
          <span className="block text-sm font-semibold text-foreground">
            {t("socialLabel")}
          </span>
          <p className="mt-1 text-xs text-muted">{t("socialHint")}</p>
          <div className="mt-3 space-y-2.5">
            <SocialInput
              id="twitterHandle"
              name="twitterHandle"
              prefix="@"
              value={twitter}
              onChange={setTwitter}
              placeholder={t("twitterPlaceholder")}
            />
            <SocialInput
              id="instagramHandle"
              name="instagramHandle"
              prefix="@"
              value={instagram}
              onChange={setInstagram}
              placeholder={t("instagramPlaceholder")}
            />
            <SocialInput
              id="facebookProfileUrl"
              name="facebookProfileUrl"
              prefix="facebook.com/"
              value={facebook}
              onChange={setFacebook}
              placeholder={t("facebookPlaceholder")}
              error={!!facebookError}
              errorText={facebookError ? t(`errors.${facebookError}`) : undefined}
            />
            <SocialInput
              id="stravaProfileUrl"
              name="stravaProfileUrl"
              prefix="strava.com/athletes/"
              value={strava}
              onChange={setStrava}
              placeholder={t("stravaPlaceholder")}
              error={!!stravaError}
              errorText={stravaError ? t(`errors.${stravaError}`) : undefined}
            />
          </div>
        </div>

        {formError && <p className="text-sm text-red-400">{t(`errors.${formError}`)}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </div>
  )
}
