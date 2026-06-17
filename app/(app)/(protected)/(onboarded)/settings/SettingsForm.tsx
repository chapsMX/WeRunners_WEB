"use client"

import Image from "next/image"
import Link from "next/link"
import { useActionState, useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { SegToggle, SocialInput } from "@/components/app/forms"
import { updateProfile, type ProfileState } from "./actions"

type Unit = "KM" | "MILES"
type Locale = "en" | "es"

const MAX_BIO = 280

export type SettingsInitial = {
  name: string
  image: string | null
  username: string
  bio: string
  preferredUnit: Unit
  locale: Locale
  twitter: string
  instagram: string
  facebook: string
  strava: string
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
      {children}
    </h2>
  )
}

export function SettingsForm({ initial }: { initial: SettingsInitial }) {
  const t = useTranslations("settings")
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {}
  )

  const fileRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string | null>(initial.image)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [name, setName] = useState(initial.name)
  const [username, setUsername] = useState(initial.username)
  const [bio, setBio] = useState(initial.bio)
  const [unit, setUnit] = useState<Unit>(initial.preferredUnit)
  const [locale, setLocale] = useState<Locale>(initial.locale)
  const [twitter, setTwitter] = useState(initial.twitter)
  const [instagram, setInstagram] = useState(initial.instagram)
  const [facebook, setFacebook] = useState(initial.facebook)
  const [strava, setStrava] = useState(initial.strava)

  const nameError = state.error?.field === "name" ? state.error.code : null
  const usernameError = state.error?.field === "username" ? state.error.code : null
  const bioError = state.error?.field === "bio" ? state.error.code : null
  const facebookError = state.error?.field === "facebook" ? state.error.code : null
  const stravaError = state.error?.field === "strava" ? state.error.code : null
  const formError = state.error?.field === "form" ? state.error.code : null

  const initialName = name.trim() ? name.trim() : "Runner"
  const avatarInitial = initialName.charAt(0).toUpperCase()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/profile/avatar",
      })
      setImage(blob.url)
    } catch {
      setUploadError(t("photo.error"))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-green"
      >
        ← {t("back")}
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>

      <form action={formAction} className="mt-8 space-y-8">
        {/* ── Foto de perfil ── */}
        <section className="border border-line bg-surface-alt/40 p-6">
          <SectionTitle>{t("photo.label")}</SectionTitle>
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-2 ring-line">
              {image ? (
                <Image src={image} alt={initialName} fill sizes="80px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand-green">
                  {avatarInitial}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand-green/50 hover:text-brand-green disabled:opacity-50"
                >
                  {uploading ? t("photo.uploading") : t("photo.upload")}
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    disabled={uploading}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-red-400 disabled:opacity-50"
                  >
                    {t("photo.remove")}
                  </button>
                )}
              </div>
              <p className="text-xs text-muted">{t("photo.hint")}</p>
              {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="hidden"
          />
          <input type="hidden" name="image" value={image ?? ""} />
        </section>

        {/* ── Datos básicos ── */}
        <section className="border border-line bg-surface-alt/40 p-6">
          <SectionTitle>{t("basics.label")}</SectionTitle>

          <div className="space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                {t("nameLabel")}
              </label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 60))}
                className={cn(
                  "mt-2 w-full rounded-xl border bg-surface-alt/40 px-3 py-2.5 text-foreground placeholder:text-muted/50 transition-colors focus:border-brand-green focus:outline-none",
                  nameError ? "border-red-500/60" : "border-line"
                )}
              />
              {nameError && <p className="mt-1.5 text-xs text-red-400">{t(`errors.${nameError}`)}</p>}
            </div>

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
                  className="w-full bg-transparent px-1 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none"
                />
              </div>
              <p className={cn("mt-1.5 text-xs", usernameError ? "text-red-400" : "text-muted")}>
                {usernameError ? t(`errors.${usernameError}`) : t("usernameHint")}
              </p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-foreground">
                {t("bioLabel")}
              </label>
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
                rows={3}
                placeholder={t("bioPlaceholder")}
                className={cn(
                  "mt-2 w-full resize-none rounded-xl border bg-surface-alt/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-brand-green focus:outline-none",
                  bioError ? "border-red-500/60" : "border-line"
                )}
              />
              <div className="mt-1.5 flex justify-between text-xs text-muted">
                <span className={bioError ? "text-red-400" : undefined}>
                  {bioError ? t(`errors.${bioError}`) : t("bioHint")}
                </span>
                <span>{bio.length}/{MAX_BIO}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Preferencias ── */}
        <section className="border border-line bg-surface-alt/40 p-6">
          <SectionTitle>{t("prefs.label")}</SectionTitle>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
          </div>
        </section>

        {/* ── Perfiles sociales ── */}
        <section className="border border-line bg-surface-alt/40 p-6">
          <SectionTitle>{t("social.label")}</SectionTitle>
          <p className="-mt-2 mb-4 text-xs text-muted">{t("social.hint")}</p>
          <div className="space-y-2.5">
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
        </section>

        {/* ── Guardar ── */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          {formError && <p className="text-sm text-red-400">{t(`errors.${formError}`)}</p>}
          {state.ok && <p className="text-sm font-medium text-brand-green">{t("saved")}</p>}
          <Button type="submit" size="lg" disabled={isPending || uploading}>
            {isPending ? t("saving") : t("save")}
          </Button>
        </div>
      </form>
    </div>
  )
}
