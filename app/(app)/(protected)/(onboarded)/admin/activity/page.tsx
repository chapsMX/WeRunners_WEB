import Image from "next/image"
import Link from "next/link"
import { getAppTranslator } from "@/lib/app-i18n"
import { getActivityOverview, ADMIN_LATEST_ACTIVITIES } from "@/lib/admin-data"
import { formatDistance, formatDuration } from "@/lib/format"
import { AdminStatStrip } from "@/components/app/admin/AdminStatStrip"
import { RetryEventButton } from "@/components/app/admin/RetryEventButton"
import { getOpsHealth } from "@/lib/ops-health"

const SOURCE: Record<string, string> = { GARMIN: "Garmin", POLAR: "Polar", SUUNTO: "Suunto", COROS: "Coros", MANUAL: "Manual" }

// Superadmin › Activity: webhook health (Garmin/Polar), active users and the latest runs received.
export default async function AdminActivityPage() {
  const { t, locale } = await getAppTranslator("clubAdmin.activity")
  const [{ users, totals, latest }, health] = await Promise.all([getActivityOverview(), getOpsHealth()])
  const provider = { garmin: "Garmin", polar: "Polar" } as const
  const date = (d: Date) => d.toLocaleDateString(locale, { dateStyle: "medium" })
  const dateTime = (d: Date) => d.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })

  return (
    <div className="space-y-10">
      <AdminStatStrip
        items={[
          { label: t("active"), value: totals.active },
          { label: t("withClub"), value: totals.withClub },
          { label: t("withDevice"), value: totals.withDevice },
          { label: t("ran30"), value: totals.ranLast30Days },
        ]}
      />

      {/* Webhooks: are we losing runs? */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("webhooks.title")}</h2>
        <div className="border border-line bg-surface-alt/40">
          <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted">
            <span className="flex-1">{t("webhooks.provider")}</span>
            <span className="w-24 text-right">{t("webhooks.received")}</span>
            <span className="w-24 text-right">{t("webhooks.processed")}</span>
            <span className="w-20 text-right">{t("webhooks.pending")}</span>
            <span className="w-20 text-right">{t("webhooks.failed")}</span>
          </div>
          <ul className="divide-y divide-line">
            {health.providers.map((p) => (
              <li key={p.provider} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="flex-1 font-semibold text-foreground">{provider[p.provider]}</span>
                <span className="w-24 text-right text-muted">{p.received24h}</span>
                <span className="w-24 text-right text-muted">{p.processed24h}</span>
                <span className={`w-20 text-right ${p.pending > 0 ? "font-bold text-yellow-300" : "text-muted"}`}>{p.pending}</span>
                <span className={`w-20 text-right ${p.failed > 0 ? "font-bold text-red-400" : "text-muted"}`}>{p.failed}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 text-xs text-muted">{t("webhooks.hint")}</p>

        {health.problems.length === 0 ? (
          <p className="mt-4 border border-dashed border-line bg-surface-alt/30 p-4 text-center text-sm text-muted">{t("webhooks.allClear")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border border-red-500/40 bg-red-500/5">
            {health.problems.map((e) => (
              <li key={`${e.provider}-${e.id}`} className="flex flex-wrap items-start gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {provider[e.provider]} · {e.type}
                    <span className={`ml-2 border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${e.exhausted ? "border-red-500/60 text-red-400" : "border-yellow-300/60 text-yellow-300"}`}>
                      {e.exhausted ? t("webhooks.exhausted") : t("webhooks.stuck")}
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    {t("received", { date: dateTime(e.receivedAt) })} · {t("webhooks.attempts", { count: e.attempts })} · <span className="font-mono">{e.id}</span>
                  </p>
                  {e.error && <p className="mt-1 break-all font-mono text-xs text-red-300">{e.error.slice(0, 300)}</p>}
                </div>
                <RetryEventButton provider={e.provider} eventId={e.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Latest runs received */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("latestTitle", { count: ADMIN_LATEST_ACTIVITIES })}</h2>
        {latest.length === 0 ? (
          <p className="border border-dashed border-line bg-surface-alt/30 p-6 text-center text-sm text-muted">{t("latestEmpty")}</p>
        ) : (
          <ul className="divide-y divide-line border border-line bg-surface-alt/40">
            {latest.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {a.runner.username ? (
                      <Link href={`/u/${a.runner.username}`} className="hover:text-brand-green">
                        @{a.runner.username}
                      </Link>
                    ) : (
                      a.runner.name
                    )}
                    <span className="ml-2 font-normal text-muted">· {a.clubName ?? t("noClub")}</span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    {t("ran", { date: dateTime(a.activityDate) })} · {SOURCE[a.source] ?? a.source}
                    {a.deviceName && a.deviceName !== "unknown" ? ` (${a.deviceName})` : ""} · {t("received", { date: dateTime(a.createdAt) })}
                  </p>
                </div>
                <span
                  className={
                    a.counts
                      ? "border border-brand-green/50 bg-brand-green/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-brand-green"
                      : "border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted"
                  }
                  title={a.exclusionReason ?? undefined}
                >
                  {a.counts ? t("counts") : t(`excluded.${a.exclusionReason ?? "UNKNOWN"}`)}
                </span>
                <span className="w-20 text-right text-sm text-muted">{formatDuration(a.durationSeconds)}</span>
                <span className="w-20 text-right text-sm font-bold text-foreground">{formatDistance(a.distanceMeters)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Active users */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("usersTitle", { count: users.length })}</h2>
        <ul className="divide-y divide-line border border-line bg-surface-alt/40">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
                {u.image ? (
                  <Image src={u.image} alt="" fill sizes="36px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-bold text-brand-green">{u.name.charAt(0).toUpperCase()}</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {u.username ? (
                    <Link href={`/u/${u.username}`} className="hover:text-brand-green">
                      {u.name} <span className="font-normal text-muted">@{u.username}</span>
                    </Link>
                  ) : (
                    u.name
                  )}
                </p>
                <p className="truncate text-xs text-muted">
                  {u.clubSlug ? (
                    <Link href={`/clubs/${u.clubSlug}`} className="hover:text-brand-green">
                      {u.clubName}
                    </Link>
                  ) : (
                    t("noClub")
                  )}{" "}
                  · {u.device ? SOURCE[u.device] ?? u.device : t("noDevice")} · {t("since", { date: date(u.joinedAt) })}
                </p>
              </div>
              <span className="text-right text-xs text-muted">
                <span className="block text-sm font-bold text-foreground">{t("runs", { count: u.activities })}</span>
                {u.lastActivityAt ? t("lastRun", { date: date(u.lastActivityAt) }) : t("noRuns")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
