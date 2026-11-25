// Server-only: the daily ops email to the team (sent by /api/cron/daily).
// New runners, runs received and integration problems of the last 24 h.
// A completely quiet day (no runners, no runs, no problems) sends nothing.
import { resend } from "@/lib/resend"
import { APP_URL } from "@/lib/share"
import type { DailySummary, OpsHealth } from "@/lib/ops-health"

const FROM = "We Runners <noreply@w3runn3rs.com>"
const TEAM_INBOX = "run@w3runn3rs.com"

export type RetrySummary = { pending: number; ok: number; failed: number }
type Retries = Record<"garmin" | "polar", RetrySummary>

const PROVIDER = { garmin: "Garmin", polar: "Polar" } as const
const SOURCE: Record<string, string> = { GARMIN: "Garmin", POLAR: "Polar", SUUNTO: "Suunto", COROS: "Coros", MANUAL: "Manual" }
const REASON: Record<string, string> = {
  MANUAL: "manual",
  WEB_UPLOAD: "web upload",
  NO_CLUB: "no club",
  BEFORE_JOIN: "before joining",
  DUPLICATE: "duplicate",
  IMPLAUSIBLE_PACE: "pace flag",
  UNKNOWN: "other",
}

function km(meters: number, digits = 2) {
  return `${(meters / 1000).toFixed(digits)} km`
}
function pace(sec: number | null) {
  if (!sec) return "–"
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")} /km`
}
function utc(d: Date) {
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`
}
function plural(n: number, one: string, other = `${one}s`) {
  return `${n} ${n === 1 ? one : other}`
}
function counts(rec: Record<string, number>, names: Record<string, string>) {
  return Object.entries(rec)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${n} ${names[k] ?? k}`)
    .join(", ")
}

export function opsDigestSubject(health: OpsHealth, summary: DailySummary): string {
  const parts = [plural(summary.newUsersTotal, "new runner"), plural(summary.runs.received, "run")]
  const exhausted = health.problems.filter((p) => p.exhausted).length
  const stuck = health.problems.length - exhausted
  if (exhausted) parts.push(`⚠ ${plural(exhausted, "failed event")}`)
  if (stuck) parts.push(`⚠ ${plural(stuck, "stuck event")}`)
  if (health.paceFlags.length) parts.push(plural(health.paceFlags.length, "pace flag"))
  return `[We Runners daily] ${parts.join(" · ")}`
}

export function opsDigestText(health: OpsHealth, summary: DailySummary, retries: Retries): string {
  const lines: string[] = [`Daily report · last 24 h · ${utc(health.generatedAt)}`, ""]

  // New runners
  lines.push(`New runners (${summary.newUsersTotal})`)
  if (summary.newUsers.length === 0) lines.push("- none")
  for (const u of summary.newUsers) {
    const status = !u.onboarded ? "onboarding pending" : u.clubName ? `in ${u.clubName}` : "no club"
    lines.push(
      `- ${u.name}${u.username ? ` @${u.username}` : ""} · ${u.email} · ${status} · ` +
        `${u.device ? SOURCE[u.device] ?? u.device : "no device"} · signed up ${utc(u.createdAt)}`
    )
  }
  if (summary.newUsersTotal > summary.newUsers.length) lines.push(`- …and ${summary.newUsersTotal - summary.newUsers.length} more`)

  // Runs
  const r = summary.runs
  lines.push("", `Runs received (${r.received})`)
  if (r.received === 0) {
    lines.push("- none")
  } else {
    lines.push(`- ${r.counted} counted for clubs · ${km(r.countedMeters, 1)} · ${plural(r.runners, "runner")}`)
    if (r.received > r.counted) lines.push(`- ${r.received - r.counted} not counted: ${counts(r.excluded, REASON)}`)
    lines.push(`- by source: ${counts(r.bySource, SOURCE)}`)
    for (const c of r.byClub) lines.push(`- ${c.clubName}: ${km(c.meters, 1)} (${plural(c.runs, "run")})`)
  }

  // Integrations
  lines.push("", "Webhooks (last 24 h)")
  for (const p of health.providers) {
    const rt = retries[p.provider]
    lines.push(
      `- ${PROVIDER[p.provider]}: ${p.received24h} received, ${p.processed24h} processed · ` +
        `${p.pending} pending, ${p.failed} failed (retries exhausted) · ` +
        `cron retry: ${rt.ok} ok, ${rt.failed} failed of ${rt.pending}`
    )
  }

  if (health.problems.length) {
    lines.push("", "⚠ Events not processed (older than 1 h, newest first)")
    for (const e of health.problems) {
      lines.push(
        `- ${PROVIDER[e.provider]} ${e.type} · ${e.id} · received ${utc(e.receivedAt)} · ` +
          `${plural(e.attempts, "attempt")}${e.exhausted ? " (exhausted)" : ""}`
      )
      if (e.error) lines.push(`  ${e.error.slice(0, 300)}`)
    }
    lines.push("", "Retry them from Admin → Activity → Webhooks.")
  }

  if (health.paceFlags.length) {
    lines.push("", "Runs excluded for implausible pace — bike recorded as a run?")
    for (const a of health.paceFlags) {
      lines.push(`- ${a.runner} · ${a.source} · ${km(a.distanceMeters)} at ${pace(a.avgPaceSecPerKm)} · ran ${utc(a.activityDate)}`)
    }
  }

  lines.push("", `${APP_URL}/admin/activity`)
  return lines.join("\n")
}

/** Returns whether the email went out (failures are logged, never thrown). */
export async function sendOpsDigest(health: OpsHealth, summary: DailySummary, retries: Retries): Promise<boolean> {
  const { error } = await resend.emails
    .send({ from: FROM, to: TEAM_INBOX, subject: opsDigestSubject(health, summary), text: opsDigestText(health, summary, retries) })
    .catch((e: unknown) => ({ error: e }))
  if (error) console.error("[ops] digest email failed:", error)
  return !error
}
