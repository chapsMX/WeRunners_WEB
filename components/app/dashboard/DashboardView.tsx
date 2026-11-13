"use client"

import { useTranslations } from "next-intl"
import type { DashboardData } from "@/lib/dashboard-data"
import { DashboardHero } from "./DashboardHero"
import type { GarminResult } from "@/lib/garmin/results"
import { ActivitySharingWarning, ConnectDeviceBanner, GarminResultNotice } from "./DeviceConnect"
import { RankGrid } from "./RankGrid"
import { PersonalStats } from "./PersonalStats"
import { RecordsCard } from "./RecordsCard"
import { ClubFeedCard } from "./ClubFeedCard"
import { RecentActivities } from "./RecentActivities"

export function DashboardView({
  data,
  firstName,
  garminResult,
}: {
  data: DashboardData
  firstName: string
  garminResult?: GarminResult | null
}) {
  const t = useTranslations("dashboard")

  return (
    <div>
      {/* Hero full-bleed: banner editable + saludo + club real */}
      <DashboardHero
        name={firstName}
        membership={data.membership}
        bannerUrl={data.bannerUrl}
      />

      {/* Contenido con margen interior */}
      <div className="space-y-8 px-6 py-8 lg:px-8">
        {/* Resultado al volver de Garmin (?garmin=…) */}
        {garminResult && <GarminResultNotice result={garminResult} />}

        {/* Sin dispositivo: un botón por proveedor que lleva directo a su conexión */}
        {!data.deviceConnected && <ConnectDeviceBanner />}

        {/* Conectado, pero sin permiso de actividades: sus km nunca llegarían */}
        {data.activitySharingOff && <ActivitySharingWarning />}

        {/* Sección 50/50: últimas carreras · ranking (siempre datos reales) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivities activities={data.recent} />
          <RankGrid ranking={data.ranking} />
        </div>

        {/* Lo de abajo sigue con datos de muestra mientras no haya actividades */}
        {data.isSample && (
          <div className="flex justify-end">
            <span className="border border-brand-green/40 bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
              {t("sampleBadge")}
            </span>
          </div>
        )}

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
