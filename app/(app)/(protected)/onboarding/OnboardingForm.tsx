"use client"

import { useActionState, useState } from "react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { SegToggle, SocialInput } from "@/components/app/forms"
import type { SelectableClub } from "@/lib/clubs"
import { completeOnboarding, type OnboardingState } from "./actions"

type Unit = "KM" | "MILES"
type Locale = "en" | "es"

export function OnboardingForm({
  name,
  suggestedUsername,
  defaultUnit,
  defaultLocale,
  clubs,
}: {
  name: string | null
  suggestedUsername: string
  defaultUnit: Unit
  defaultLocale: Locale
  clubs: SelectableClub[]
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
  const [club, setClub] = useState("")

  const firstName = (name ?? "").split(" ")[0]
  const usernameError = state.error?.field === "username" ? state.error.code : null
  const clubError = state.error?.field === "club" ? state.error.code : null
  const facebookError = state.error?.field === "facebook" ? state.error.code : null
  const stravaError = state.error?.field === "strava" ? state.error.code : null
  const formError = state.error?.field === "form" ? state.error.code : null

  return (
    <div className="bg-white/5 border border-brand-green/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        {firstName ? t("welcome", { name: firstName }) : t("welcomeNoName")}
      </h1>
      <p className="mt-2 text-sm text-white/70">{t("subtitle")}</p>

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

        {/* Club (obligatorio) */}
        <fieldset>
          <legend className="block text-sm font-semibold text-foreground">{t("clubLabel")}</legend>
          <p className="mt-1 text-xs text-muted">{t("clubHint")}</p>
          <div className="mt-3 space-y-2" role="radiogroup">
            {clubs.map((c) => (
              <ClubOption
                key={c.id}
                club={c}
                checked={club === c.id}
                onSelect={() => setClub(c.id)}
              />
            ))}
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                club === "none"
                  ? "border-brand-green bg-brand-green/10"
                  : "border-line bg-surface-alt/40 hover:border-brand-green/50"
              )}
            >
              <input
                type="radio"
                name="club"
                value="none"
                checked={club === "none"}
                onChange={() => setClub("none")}
                required
                className="sr-only"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">{t("clubNone")}</span>
                <span className="block text-xs text-muted">
                  {t("clubNoneHint")}{" "}
                  <a
                    href="https://www.w3runn3rs.com/en/for-clubs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-green hover:underline"
                  >
                    {t("clubRegister")} →
                  </a>
                </span>
              </span>
              <RadioDot checked={club === "none"} />
            </label>
          </div>
          <p className={cn("mt-2 text-xs", clubError ? "text-red-400" : "text-muted")}>
            {clubError ? t(`errors.${clubError}`) : t("clubLock")}
          </p>
        </fieldset>

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

function ClubOption({
  club,
  checked,
  onSelect,
}: {
  club: SelectableClub
  checked: boolean
  onSelect: () => void
}) {
  const t = useTranslations("onboarding")
  const locale = useLocale()
  const fmt = (n: number) => n.toLocaleString(locale)

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
        checked
          ? "border-brand-green bg-brand-green/10"
          : "border-line bg-surface-alt/40 hover:border-brand-green/50"
      )}
    >
      <input
        type="radio"
        name="club"
        value={club.id}
        checked={checked}
        onChange={onSelect}
        required
        className="sr-only"
      />
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-line">
        {club.logoUrl ? (
          <Image src={club.logoUrl} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <span className="text-lg font-bold text-brand-green">{club.name.charAt(0).toUpperCase()}</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-foreground">{club.name}</span>
        <span className="block text-xs text-muted">
          {club.city}
          {club.declaredRunners ? ` · ${t("clubRunners", { count: fmt(club.declaredRunners) })}` : ""}
          {club.members > 0 ? ` · ${t("clubOnApp", { count: fmt(club.members) })}` : ""}
        </span>
      </span>
      <RadioDot checked={checked} />
    </label>
  )
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
        checked ? "border-brand-green bg-brand-green" : "border-line"
      )}
    >
      {checked && <span className="h-2 w-2 rounded-full bg-brand-navy" />}
    </span>
  )
}
