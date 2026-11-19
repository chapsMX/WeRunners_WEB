// Server-only: the daily ops email to the team (sent by /api/cron/daily only
// when something needs a look — a quiet day sends nothing).
import { resend } from "@/lib/resend"
import { APP_URL } from "@/lib/share"
import type { OpsHealth } from "@/lib/ops-health"

const FROM = "w3runn3rs <noreply@w3runn3rs.com>"
const TEAM_INBOX = "run@w3runn3rs.com"

export type RetrySummary = { pending: number; ok: number; failed: number }

const PROVIDER = { garmin: "Garmin", polar: "Polar" } as const

function km(meters: number) {
  return `${(meters / 1000).toFixed(2)} km`
}
function pace(sec: number | null) {
  if (!sec) return "–"
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")} /km`
}
function utc(d: Date) {
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`
}

export function opsDigestSubject(health: OpsHealth): string {
  const parts: string[] = []
  const exhausted = health.problems.filter((p) => p.exhausted).length
  const stuck = health.problems.length - exhausted
  if (exhausted) parts.push(`${exhausted} failed event${exhausted === 1 ? "" : "s"}`)
  if (stuck) parts.push(`${stuck} stuck event${stuck === 1 ? "" : "s"}`)
  if (health.paceFlags.length) parts.push(`${health.paceFlags.length} pace flag${health.paceFlags.length === 1 ? "" : "s"}`)
  return `[W3Runn3rs ops] ${parts.join(", ") || "all clear"}`
}

export function opsDigestText(health: OpsHealth, retries: Record<"garmin" | "polar", RetrySummary>): string {
  const lines: string[] = [`Daily ops check · ${utc(health.generatedAt)}`, ""]

  lines.push("Webhooks (last 24 h)")
  for (const p of health.providers) {
    const r = retries[p.provider]
    lines.push(
      `- ${PROVIDER[p.provider]}: ${p.received24h} received, ${p.processed24h} processed · ` +
        `${p.pending} pending, ${p.failed} failed (retries exhausted) · ` +
        `cron retry: ${r.ok} ok, ${r.failed} failed of ${r.pending}`
    )
  }

  if (health.problems.length) {
    lines.push("", "Events not processed (older than 1 h, newest first)")
    for (const e of health.problems) {
      lines.push(
        `- ${PROVIDER[e.provider]} ${e.type} · ${e.id} · received ${utc(e.receivedAt)} · ` +
          `${e.attempts} attempt${e.attempts === 1 ? "" : "s"}${e.exhausted ? " (exhausted)" : ""}`
      )
      if (e.error) lines.push(`  ${e.error.slice(0, 300)}`)
    }
    lines.push("", "Retry them from Admin → Activity → Webhooks.")
  }

  if (health.paceFlags.length) {
    lines.push("", "Runs excluded for implausible pace (last 24 h) — bike recorded as a run?")
    for (const a of health.paceFlags) {
      lines.push(`- ${a.runner} · ${a.source} · ${km(a.distanceMeters)} at ${pace(a.avgPaceSecPerKm)} · ran ${utc(a.activityDate)}`)
    }
  }

  lines.push("", `${APP_URL}/admin/activity`)
  return lines.join("\n")
}

/** Returns whether the email went out (failures are logged, never thrown). */
export async function sendOpsDigest(health: OpsHealth, retries: Record<"garmin" | "polar", RetrySummary>): Promise<boolean> {
  const { error } = await resend.emails
    .send({ from: FROM, to: TEAM_INBOX, subject: opsDigestSubject(health), text: opsDigestText(health, retries) })
    .catch((e: unknown) => ({ error: e }))
  if (error) console.error("[ops] digest email failed:", error)
  return !error
}
