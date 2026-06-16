"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import type { DashboardData } from "@/lib/dashboard-data"
import { DeviceIcon } from "../icons"
import { DashboardHero } from "./DashboardHero"
import { RankGrid } from "./RankGrid"
import { PersonalStats } from "./PersonalStats"
import { RecordsCard } from "./RecordsCard"
import { ClubFeedCard } from "./ClubFeedCard"
import { RecentActivities } from "./RecentActivities"

// Nombre de club simulado mientras no exista una membresía real.
const SIMULATED_CLUB = "Pacers CDMX"

export function DashboardView({
  data,
  firstName,
}: {
  data: DashboardData
  firstName: string
}) {
  const t = useTranslations("dashboard")
  const clubName = data.club?.name ?? SIMULATED_CLUB

  return (
    <div>
      {/* Hero full-bleed: imagen + saludo + club */}
      <DashboardHero name={firstName} clubName={clubName} />

      {/* Contenido con margen interior */}
      <div className="space-y-8 px-6 py-8 lg:px-8">
        {data.isSample && (
          <div className="flex justify-end">
            <span className="border border-brand-green/40 bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
              {t("sampleBadge")}
            </span>
          </div>
        )}

        {/* Banner: conectar dispositivo */}
        {!data.deviceConnected && (
          <div className="flex flex-wrap items-center gap-3 border border-line bg-surface-alt/40 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center bg-brand-green/10 text-brand-green">
              <DeviceIcon size={18} />
            </div>
            <p className="flex-1 text-sm text-foreground">{t("connect.text")}</p>
            <Link
              href="/settings"
              className="text-sm font-semibold text-brand-green hover:underline"
            >
              {t("connect.cta")} →
            </Link>
          </div>
        )}

        {/* Sección 50/50: actividad reciente · ranking */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivities activities={data.recent} />
          <RankGrid hero={data.hero} hasClub={data.club !== null} />
        </div>

        {/* Personal records — contenedor de 3 columnas (estilo home) */}
        <RecordsCard records={data.personal.records} />

        {/* Sección 50/50: tus números (izquierda) · tabla del club (derecha) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PersonalStats personal={data.personal} />
          <ClubFeedCard clubName={data.club?.name ?? null} feed={data.clubFeed} />
        </div>
      </div>
    </div>
  )
}
