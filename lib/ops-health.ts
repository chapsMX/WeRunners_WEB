// Server-only: health of the device integrations, for the daily ops email
// (/api/cron/daily) and Admin › Activity. Webhook events are stored first and
// processed after the response; anything still unprocessed after the retries
// is a run we could be losing.
import { prisma } from "@/lib/prisma"
import { MAX_EVENT_ATTEMPTS, processGarminEvent } from "@/lib/garmin/events"
import { MAX_POLAR_EVENT_ATTEMPTS, processPolarEvent } from "@/lib/polar/events"

type Db = Pick<typeof prisma, "garminWebhookEvent" | "polarWebhookEvent" | "activity">

export const WEBHOOK_PROVIDERS = ["garmin", "polar"] as const
export type WebhookProvider = (typeof WEBHOOK_PROVIDERS)[number]

const MAX_ATTEMPTS: Record<WebhookProvider, number> = { garmin: MAX_EVENT_ATTEMPTS, polar: MAX_POLAR_EVENT_ATTEMPTS }
const DAY_MS = 24 * 60 * 60 * 1000
/** Unprocessed events younger than this are probably still being processed. */
const STUCK_AFTER_MS = 60 * 60 * 1000
const PROBLEMS_LIMIT = 50

export type ProviderHealth = {
  provider: WebhookProvider
  /** Events received in the last 24 h, and how many of those are processed. */
  received24h: number
  processed24h: number
  /** Unprocessed, retries left (any age). */
  pending: number
  /** Unprocessed, retries exhausted: needs a human. */
  failed: number
}

export type ProblemEvent = {
  provider: WebhookProvider
  id: string
  type: string
  receivedAt: Date
  attempts: number
  error: string | null
  /** Retries exhausted (the cron won't try again). */
  exhausted: boolean
}

export type PaceFlag = {
  id: string
  runner: string
  source: string
  distanceMeters: number
  durationSeconds: number
  avgPaceSecPerKm: number | null
  activityDate: Date
}

export type OpsHealth = {
  generatedAt: Date
  providers: ProviderHealth[]
  /** Unprocessed events older than an hour (newest first). */
  problems: ProblemEvent[]
  /** Runs excluded for implausible pace, received in the last 24 h. */
  paceFlags: PaceFlag[]
}

/** Counts shared by both event tables (same columns for these fields). */
type EventCounter = { count: (args: { where: Record<string, unknown> }) => Promise<number> }

async function providerHealth(provider: WebhookProvider, events: EventCounter, since: Date): Promise<ProviderHealth> {
  const max = MAX_ATTEMPTS[provider]
  const [received24h, processed24h, pending, failed] = await Promise.all([
    events.count({ where: { receivedAt: { gte: since } } }),
    events.count({ where: { receivedAt: { gte: since }, processedAt: { not: null } } }),
    events.count({ where: { processedAt: null, attempts: { lt: max } } }),
    events.count({ where: { processedAt: null, attempts: { gte: max } } }),
  ])
  return { provider, received24h, processed24h, pending, failed }
}

export async function getOpsHealth(now = new Date(), db: Db = prisma): Promise<OpsHealth> {
  const since = new Date(now.getTime() - DAY_MS)
  const stuck = { processedAt: null, receivedAt: { lt: new Date(now.getTime() - STUCK_AFTER_MS) } }
  const pick = { id: true, receivedAt: true, attempts: true, error: true } as const

  const [garmin, polar, garminStuck, polarStuck] = await Promise.all([
    providerHealth("garmin", db.garminWebhookEvent as unknown as EventCounter, since),
    providerHealth("polar", db.polarWebhookEvent as unknown as EventCounter, since),
    db.garminWebhookEvent.findMany({ where: stuck, orderBy: { receivedAt: "desc" }, take: PROBLEMS_LIMIT, select: { ...pick, summaryType: true } }),
    db.polarWebhookEvent.findMany({ where: stuck, orderBy: { receivedAt: "desc" }, take: PROBLEMS_LIMIT, select: { ...pick, eventType: true } }),
  ])

  const problems: ProblemEvent[] = [
    ...garminStuck.map((e) => ({ provider: "garmin" as const, id: e.id, type: e.summaryType, receivedAt: e.receivedAt, attempts: e.attempts, error: e.error, exhausted: e.attempts >= MAX_EVENT_ATTEMPTS })),
    ...polarStuck.map((e) => ({ provider: "polar" as const, id: e.id, type: e.eventType, receivedAt: e.receivedAt, attempts: e.attempts, error: e.error, exhausted: e.attempts >= MAX_POLAR_EVENT_ATTEMPTS })),
  ]
    .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())
    .slice(0, PROBLEMS_LIMIT)

  const flagged = await db.activity.findMany({
    where: { exclusionReason: "IMPLAUSIBLE_PACE", createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: PROBLEMS_LIMIT,
    select: {
      id: true,
      source: true,
      distanceMeters: true,
      durationSeconds: true,
      avgPaceSecPerKm: true,
      activityDate: true,
      user: { select: { username: true, name: true } },
    },
  })

  return {
    generatedAt: now,
    providers: [garmin, polar],
    problems,
    paceFlags: flagged.map((a) => ({
      id: a.id,
      runner: a.user.username ? `@${a.user.username}` : a.user.name || "Runner",
      source: a.source,
      distanceMeters: a.distanceMeters,
      durationSeconds: a.durationSeconds,
      avgPaceSecPerKm: a.avgPaceSecPerKm,
      activityDate: a.activityDate,
    })),
  }
}

/** Worth an email: lost/stuck events or runs to review. A quiet day sends nothing. */
export function hasProblems(health: OpsHealth): boolean {
  return health.problems.length > 0 || health.paceFlags.length > 0
}

/**
 * Admin "Retry": give the event a fresh set of attempts and process it now.
 * Ingest is idempotent, so retrying a half-done event is safe.
 */
export async function retryWebhookEvent(
  provider: WebhookProvider,
  eventId: string
): Promise<{ ok: boolean; error?: string }> {
  if (provider === "garmin") {
    const reset = await prisma.garminWebhookEvent.updateMany({ where: { id: eventId, processedAt: null }, data: { attempts: 0 } })
    if (reset.count === 0) return { ok: false, error: "not_found_or_processed" }
    const r = await processGarminEvent(eventId)
    return { ok: r.ok, error: r.error }
  }
  const reset = await prisma.polarWebhookEvent.updateMany({ where: { id: eventId, processedAt: null }, data: { attempts: 0 } })
  if (reset.count === 0) return { ok: false, error: "not_found_or_processed" }
  const r = await processPolarEvent(eventId)
  return { ok: r.ok, error: r.error }
}
