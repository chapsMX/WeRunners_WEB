// Server-only: health of the device integrations (daily email + Admin ›
// Activity) and the daily summary of new runners and runs (daily email,
// /api/cron/daily). Webhook events are stored first and
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

/** Lost/stuck events or runs to review. */
export function hasProblems(health: OpsHealth): boolean {
  return health.problems.length > 0 || health.paceFlags.length > 0
}

// ── Daily summary (new runners + runs received), for the same email ──

type SummaryDb = Pick<typeof prisma, "user" | "activity">

export type NewUserRow = {
  name: string
  username: string | null
  email: string
  onboarded: boolean
  clubName: string | null
  /** Connected provider (GARMIN, POLAR, …) or null. */
  device: string | null
  createdAt: Date
}

export type RunsSummary = {
  /** Runs received (stored) in the last 24 h, counted or not. */
  received: number
  counted: number
  countedMeters: number
  /** Distinct runners among the runs received. */
  runners: number
  /** Excluded runs by reason (MANUAL, BEFORE_JOIN, …). */
  excluded: Record<string, number>
  /** Runs received by source (GARMIN, POLAR, …). */
  bySource: Record<string, number>
  /** Counted km per club, most km first. */
  byClub: { clubName: string; meters: number; runs: number }[]
}

export type DailySummary = {
  newUsers: NewUserRow[]
  newUsersTotal: number
  runs: RunsSummary
}

export async function getDailySummary(now = new Date(), db: SummaryDb = prisma): Promise<DailySummary> {
  const since = { gte: new Date(now.getTime() - DAY_MS) }
  const [users, newUsersTotal, runs] = await Promise.all([
    db.user.findMany({
      where: { createdAt: since },
      orderBy: { createdAt: "asc" },
      take: PROBLEMS_LIMIT,
      select: {
        name: true,
        username: true,
        email: true,
        onboardingCompletedAt: true,
        connectedProvider: true,
        createdAt: true,
        memberships: { where: { activeUserId: { not: null } }, select: { club: { select: { name: true } } } },
      },
    }),
    db.user.count({ where: { createdAt: since } }),
    db.activity.findMany({
      where: { createdAt: since },
      select: {
        userId: true,
        source: true,
        distanceMeters: true,
        countsForLeaderboard: true,
        exclusionReason: true,
        club: { select: { name: true } },
      },
    }),
  ])

  const excluded: Record<string, number> = {}
  const bySource: Record<string, number> = {}
  const clubs = new Map<string, { meters: number; runs: number }>()
  let counted = 0
  let countedMeters = 0
  for (const r of runs) {
    bySource[r.source] = (bySource[r.source] ?? 0) + 1
    if (r.countsForLeaderboard) {
      counted++
      countedMeters += r.distanceMeters
      const name = r.club?.name ?? "?"
      const c = clubs.get(name) ?? { meters: 0, runs: 0 }
      clubs.set(name, { meters: c.meters + r.distanceMeters, runs: c.runs + 1 })
    } else {
      const reason = r.exclusionReason ?? "UNKNOWN"
      excluded[reason] = (excluded[reason] ?? 0) + 1
    }
  }

  return {
    newUsers: users.map((u) => ({
      name: u.name || "Runner",
      username: u.username,
      email: u.email,
      onboarded: Boolean(u.onboardingCompletedAt),
      clubName: u.memberships[0]?.club.name ?? null,
      device: u.connectedProvider ?? null,
      createdAt: u.createdAt,
    })),
    newUsersTotal,
    runs: {
      received: runs.length,
      counted,
      countedMeters,
      runners: new Set(runs.map((r) => r.userId)).size,
      excluded,
      bySource,
      byClub: [...clubs.entries()]
        .map(([clubName, c]) => ({ clubName, ...c }))
        .sort((a, b) => b.meters - a.meters || a.clubName.localeCompare(b.clubName)),
    },
  }
}

/** Anything at all to report: problems, new runners or runs. A completely quiet day sends nothing. */
export function shouldSendDigest(health: OpsHealth, summary: DailySummary): boolean {
  return hasProblems(health) || summary.newUsersTotal > 0 || summary.runs.received > 0
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
