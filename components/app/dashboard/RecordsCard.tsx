"use client"

import { useTranslations } from "next-intl"
import { formatDuration } from "@/lib/format"
import type { PersonalRecordRow } from "@/lib/dashboard-data"

// Distancias destacadas en este panel (el enum HALF_MARATHON se muestra como 21K).
const TARGETS = [
  { key: "FIVE_K", label: "5K" },
  { key: "TEN_K", label: "10K" },
  { key: "HALF_MARATHON", label: "21K" },
]

export function RecordsCard({ records }: { records: PersonalRecordRow[] }) {
  const t = useTranslations("dashboard.records")
  const byKey = new Map(records.map((r) => [r.key, r.durationSeconds]))

  return (
    <section className="flex h-full flex-col border border-line bg-surface-alt/40 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("title")}</h3>

      <ul className="mt-2 flex flex-1 flex-col divide-y divide-line">
        {TARGETS.map((target) => {
          const dur = byKey.get(target.key)
          return (
            <li key={target.key} className="flex items-center justify-between gap-3 py-4">
              <span className="flex h-10 w-12 items-center justify-center bg-brand-green/10 text-sm font-bold text-brand-green">
                {target.label}
              </span>
              <span className="text-xl font-bold text-foreground">
                {dur ? formatDuration(dur) : "—"}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
