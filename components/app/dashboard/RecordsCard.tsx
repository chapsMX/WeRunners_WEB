"use client"

import { useTranslations } from "next-intl"
import { formatDuration } from "@/lib/format"
import type { PersonalRecordRow } from "@/lib/dashboard-data"
import { TrophyIcon } from "../icons"

// Distancias destacadas (el enum HALF_MARATHON se muestra como 21K).
// Estilo de las tres columnas del home (WhatIs): verde / azul / navy.
const TARGETS = [
  {
    key: "FIVE_K",
    label: "5K",
    bg: "bg-brand-green",
    iconColor: "text-brand-green",
    titleCls: "text-brand-navy",
    valueCls: "text-brand-navy",
    captionCls: "text-brand-navy/70",
  },
  {
    key: "TEN_K",
    label: "10K",
    bg: "bg-surface-alt",
    iconColor: "text-brand-green",
    titleCls: "text-white",
    valueCls: "text-brand-green",
    captionCls: "text-white/80",
  },
  {
    key: "HALF_MARATHON",
    label: "21K",
    bg: "bg-brand-blue",
    iconColor: "text-brand-blue",
    titleCls: "text-white",
    valueCls: "text-brand-green",
    captionCls: "text-white/80",
  },
] as const

export function RecordsCard({ records }: { records: PersonalRecordRow[] }) {
  const t = useTranslations("dashboard.records")
  const byKey = new Map(records.map((r) => [r.key, r.durationSeconds]))

  return (
    <section>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("title")}
      </h3>
      <p className="mb-3 text-sm text-muted">{t("subtitle")}</p>

      {/* Tres columnas full-bleed estilo home: rompe el padding del wrapper */}
      <div className="-mx-6 grid grid-cols-1 md:grid-cols-3 lg:-mx-8">
        {TARGETS.map((target) => {
          const dur = byKey.get(target.key)
          return (
            <div
              key={target.key}
              className={`${target.bg} flex flex-col gap-6 px-8 py-10`}
            >
              {/* Círculo de ícono — fondo blanco como en el home */}
              <div
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white ${target.iconColor}`}
              >
                <TrophyIcon size={26} />
              </div>

              <h4
                className={`text-3xl font-extrabold uppercase leading-none tracking-wide ${target.titleCls}`}
              >
                {target.label}
              </h4>

              <div>
                <p className={`text-3xl font-extrabold leading-none ${target.valueCls}`}>
                  {dur ? formatDuration(dur) : "—"}
                </p>
                <p className={`mt-2 text-sm ${target.captionCls}`}>
                  {dur ? t("best") : t("none")}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
