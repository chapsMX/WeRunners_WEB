"use client"

import { useTranslations } from "next-intl"
import { formatDistance, formatDuration, formatPace } from "@/lib/format"
import type { PersonalSummary } from "@/lib/dashboard-data"
import { ActivityIcon, FlameIcon } from "../icons"

function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string
  hint?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-alt/40 p-4">
      <div className="flex items-center gap-1.5 text-muted">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function PersonalStats({ personal }: { personal: PersonalSummary }) {
  const t = useTranslations("dashboard.personal")

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("title")}
      </h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label={t("week")}
          value={formatDistance(personal.weekDistanceMeters)}
          hint={t("km")}
        />
        <StatTile
          label={t("month")}
          value={formatDistance(personal.monthDistanceMeters)}
          hint={t("km")}
        />
        <StatTile
          label={t("streak")}
          value={`${personal.streakDays} d`}
          hint={t("streakHint")}
          icon={<FlameIcon size={14} className="text-brand-green" />}
        />
        <StatTile
          label={t("pace")}
          value={formatPace(personal.avgPaceSecPerKm)}
          icon={<ActivityIcon size={14} className="text-brand-green" />}
        />
      </div>

      {personal.records.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface-alt/40 p-4">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("records")}
          </span>
          {personal.records.map((r) => (
            <span
              key={r.key}
              className="inline-flex items-baseline gap-1.5 rounded-lg border border-line bg-background/40 px-2.5 py-1 text-sm"
            >
              <span className="font-semibold text-brand-green">{t(`pr.${r.key}`)}</span>
              <span className="text-foreground">{formatDuration(r.durationSeconds)}</span>
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
