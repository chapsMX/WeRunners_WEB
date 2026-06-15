"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import type { DashboardData } from "@/lib/dashboard-data"
import { DeviceIcon } from "../icons"
import { ClubContributionHero } from "./ClubContributionHero"
import { ClubRankCard } from "./ClubRankCard"
import { PersonalStats } from "./PersonalStats"
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
      {/* Encabezado */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("greeting", { name: firstName })}
          </h1>
          <p className="text-sm text-muted">{t("subtitle")}</p>
        </div>
        {data.isSample && (
          <span className="rounded-full border border-brand-green/40 bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
            {t("sampleBadge")}
          </span>
        )}
      </header>

      {/* Banner: conectar dispositivo */}
      {!data.deviceConnected && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-alt/40 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
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

      {/* Hero aporte al club + ranking */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClubContributionHero club={data.club} contribution={data.contribution} />
        </div>
        <ClubRankCard club={data.club} />
      </div>

      {/* Stats personales */}
      <PersonalStats personal={data.personal} />

      {/* Actividades recientes */}
      <RecentActivities activities={data.recent} />
    </div>
  )
}
