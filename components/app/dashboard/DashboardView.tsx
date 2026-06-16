"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import type { DashboardData } from "@/lib/dashboard-data"
import { DeviceIcon } from "../icons"
import { HeroStats } from "./HeroStats"
import { PersonalStats } from "./PersonalStats"
import { RecordsCard } from "./RecordsCard"
import { ClubFeedCard } from "./ClubFeedCard"
import { RecentActivities } from "./RecentActivities"

export function DashboardView({
  data,
  firstName,
}: {
  data: DashboardData
  firstName: string
}) {
  const t = useTranslations("dashboard")

  return (
    <div className="space-y-6">
      {data.isSample && (
        <div className="flex justify-end px-6 lg:px-8">
          <span className="border border-brand-green/40 bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
            {t("sampleBadge")}
          </span>
        </div>
      )}

      {/* Hero full-bleed: saludo + 4 tarjetas (ranking, aporte, productividad) */}
      <HeroStats name={firstName} hero={data.hero} hasClub={data.club !== null} />

      {/* Resto del contenido con margen interior */}
      <div className="space-y-6 px-6 lg:px-8">
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

        {/* Actividades recientes */}
        <RecentActivities activities={data.recent} />

        {/* Stats personales — mismo formato de card que el hero */}
        <PersonalStats personal={data.personal} />

        {/* Fila: records (1/3) + actividad del club (2/3) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <RecordsCard records={data.personal.records} />
          </div>
          <div className="lg:col-span-2">
            <ClubFeedCard clubName={data.club?.name ?? null} feed={data.clubFeed} />
          </div>
        </div>
      </div>
    </div>
  )
}
