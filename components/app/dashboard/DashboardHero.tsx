"use client"

import Image from "next/image"
import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { upload } from "@vercel/blob/client"
import { useLocale, useTranslations } from "next-intl"
import type { DashboardMembership } from "@/lib/dashboard-data"
import { updateBanner } from "@/app/(app)/(protected)/(onboarded)/dashboard/actions"
import { ClubIcon, ImageIcon, ResetIcon } from "../icons"

const DEFAULT_BANNER = "/images/fondoHero.webp"

/** Hero del dashboard: banner (editable por el corredor) + saludo + club. */
export function DashboardHero({
  name,
  membership,
  bannerUrl,
}: {
  name: string
  membership: DashboardMembership
  bannerUrl: string | null
}) {
  const t = useTranslations("dashboard")
  const locale = useLocale()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, startSaving] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const busy = uploading || saving

  function save(url: string | null) {
    startSaving(async () => {
      const result = await updateBanner(url)
      if (!result.ok) setError(t("banner.error"))
      else router.refresh()
    })
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const blob = await upload(`banners/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/profile/banner",
      })
      save(blob.url)
    } catch {
      setError(t("banner.error"))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const iconButton =
    "flex h-9 w-9 items-center justify-center border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors hover:border-brand-green hover:text-brand-green disabled:opacity-50"

  return (
    <section className="relative overflow-hidden">
      {/* Banner */}
      <Image
        src={bannerUrl ?? DEFAULT_BANNER}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Overlay para legibilidad */}
      <div className="absolute inset-0 bg-brand-navy/70" />

      {/* Cambiar banner */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 lg:right-8">
        {busy && <span className="text-xs font-medium text-white/80">{t("banner.saving")}</span>}
        {bannerUrl && (
          <button
            type="button"
            onClick={() => save(null)}
            disabled={busy}
            aria-label={t("banner.reset")}
            title={t("banner.reset")}
            className={iconButton}
          >
            <ResetIcon size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label={t("banner.change")}
          title={t("banner.change")}
          className={iconButton}
        >
          <ImageIcon size={16} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10 px-6 py-14 sm:py-16 lg:px-8">
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
          {t("greeting", { name })}
        </h1>

        <div className="mt-4 inline-flex items-center gap-3 border border-white/20 bg-black/20 px-3 py-2 text-sm text-white backdrop-blur-sm">
          {membership?.logoUrl ? (
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/30">
              <Image src={membership.logoUrl} alt="" fill sizes="36px" className="object-cover" />
            </span>
          ) : (
            <ClubIcon size={18} className="shrink-0 text-brand-green" />
          )}
          {membership ? (
            <div className="leading-snug">
              <p>
                <span className="text-white/70">{t("heroClub.runningWith")}</span>{" "}
                <span className="font-semibold">{membership.clubName}</span>
              </p>
              <p>
                <span className="text-white/70">{t("heroClub.since")}</span>{" "}
                <span className="font-semibold">
                  {membership.joinedAt.toLocaleDateString(locale, { dateStyle: "medium" })}
                </span>
              </p>
            </div>
          ) : (
            <span className="font-semibold">{t("heroClub.none")}</span>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </div>
    </section>
  )
}
