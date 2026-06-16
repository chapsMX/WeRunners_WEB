"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { ClubIcon } from "../icons"

/** Hero del dashboard: imagen de fondo + saludo + club del corredor. */
export function DashboardHero({
  name,
  clubName,
}: {
  name: string
  clubName: string | null
}) {
  const t = useTranslations("dashboard")

  return (
    <section className="relative overflow-hidden">
      {/* Imagen de fondo */}
      <Image
        src="/images/fondoHero.webp"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      {/* Overlay para legibilidad */}
      <div className="absolute inset-0 bg-brand-navy/70" />

      {/* Contenido */}
      <div className="relative z-10 px-6 py-14 sm:py-16 lg:px-8">
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
          {t("greeting", { name })}
        </h1>
        {clubName && (
          <div className="mt-4 inline-flex items-center gap-2 border border-white/20 bg-black/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            <ClubIcon size={16} className="text-brand-green" />
            <span>{t("heroClub", { club: clubName })}</span>
          </div>
        )}
      </div>
    </section>
  )
}
