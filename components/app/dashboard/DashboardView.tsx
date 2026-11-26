"use client"

import type { DashboardData } from "@/lib/dashboard-data"
import { DashboardHero } from "./DashboardHero"
import type { GarminResult } from "@/lib/garmin/results"
import type { PolarResult } from "@/lib/polar/results"
import { ActivitySharingWarning, ConnectDeviceBanner, DeviceResultNotice } from "./DeviceConnect"
import { RankGrid } from "./RankGrid"
import { PersonalStats } from "./PersonalStats"
import { RecordsCard } from "./RecordsCard"
import { ClubFeedCard } from "./ClubFeedCard"
import { RecentActivities } from "./RecentActivities"
import { NoClubBanner } from "./NoClubBanner"

export function DashboardView({
  data,
  firstName,
  garminResult,
  polarResult,
}: {
  data: DashboardData
  firstName: string
  garminResult?: GarminResult | null
  polarResult?: PolarResult | null
}) {

  return (
    <div>
      {/* Hero full-bleed: banner editable + saludo + club real */}
      <DashboardHero
        name={firstName}
        membership={data.membership}
        bannerUrl={data.bannerUrl}
        worldRank={data.worldRank}
      />

      {/* Contenido con margen interior */}
      <div className="space-y-8 px-6 pt-8 lg:px-8">
        {/* Resultado al volver del proveedor (?garmin=… / ?polar=…) */}
        {garminResult && <DeviceResultNotice provider="garmin" result={garminResult} />}
        {polarResult && <DeviceResultNotice provider="polar" result={polarResult} />}

        {/* Sin dispositivo: un botón por proveedor que lleva directo a su conexión */}
        {!data.deviceConnected && <ConnectDeviceBanner />}

        {/* Conectado, pero sin permiso de actividades: sus km nunca llegarían */}
        {data.activitySharingOff && <ActivitySharingWarning />}

        {/* Sin club: su solicitud en revisión, o registrar su club */}
        {!data.membership && (
          <NoClubBanner
            pendingClubName={data.pendingClubRequest?.clubName ?? null}
            pendingJoinClubName={data.pendingJoinRequest?.clubName ?? null}
          />
        )}

        {/* Fila 1: últimas carreras · ranking mensual en el club */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivities
            activities={data.recent}
            clubName={data.membership?.clubName ?? null}
          />
          <RankGrid monthly={data.monthly} clubName={data.membership?.clubName ?? null} />
        </div>

        {/* Fila 2: tus números (histórico) · últimas carreras del club */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PersonalStats totals={data.totals} />
          <ClubFeedCard
            clubName={data.membership?.clubName ?? null}
            clubSlug={data.membership?.clubSlug ?? null}
            feed={data.clubFeed}
          />
        </div>

        {/* Fila 3: récords personales */}
        <RecordsCard records={data.records} />
      </div>
    </div>
  )
}
