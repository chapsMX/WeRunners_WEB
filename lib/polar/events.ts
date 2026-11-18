// Server-only: processes stored Polar webhook events (PolarWebhookEvent).
// The webhook stores the payload and answers 200; processing runs after the
// response and, for failures, from the retry cron. Ingest is idempotent.
import { prisma } from "@/lib/prisma"
import { decryptToken } from "@/lib/garmin/crypto"
import { describePolarError, getExercise, PolarApiError } from "./client"
import { ingestPolarExercise, type PolarExercise } from "./ingest"

export const MAX_POLAR_EVENT_ATTEMPTS = 5

type ExercisePayload = { event?: string; user_id?: number | string; entity_id?: string; url?: string }

export async function processPolarEvent(eventId: string): Promise<{ ok: boolean; result?: string; error?: string }> {
  const claimed = await prisma.polarWebhookEvent.updateMany({
    where: { id: eventId, processedAt: null, attempts: { lt: MAX_POLAR_EVENT_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  })
  if (claimed.count === 0) return { ok: true }
  const event = await prisma.polarWebhookEvent.findUnique({ where: { id: eventId }, select: { payload: true, eventType: true } })
  if (!event) return { ok: false, error: "event not found" }

  const done = async (result: string) => {
    await prisma.polarWebhookEvent.update({ where: { id: eventId }, data: { processedAt: new Date(), error: null } })
    console.log("[polar/events] processed", event.eventType, result)
    return { ok: true, result }
  }

  try {
    const p = event.payload as ExercisePayload
    if (p?.event !== "EXERCISE" || !p.url || p.user_id == null) return done(`ignored_${p?.event ?? "unknown"}`)
    const polarUserId = String(p.user_id)
    const conn = await prisma.deviceConnectionPolar.findFirst({
      where: { polarUserId, isActive: true },
      select: { accessToken: true },
    })
    if (!conn?.accessToken) return done("unknown_user")

    let exercise: unknown
    try {
      exercise = await getExercise(decryptToken(conn.accessToken), p.url)
    } catch (e) {
      // Gone (deleted, or older than AccessLink's 30-day window) → nothing to do.
      if (e instanceof PolarApiError && (e.status === 404 || e.status === 204)) return done("exercise_gone")
      throw e
    }
    const outcome = await prisma.$transaction((tx) => ingestPolarExercise(tx, polarUserId, exercise as PolarExercise), {
      maxWait: 15_000,
      timeout: 30_000,
    })
    return done(outcome.status === "stored" ? (outcome.counts ? "counted" : `excluded_${outcome.reason}`) : `skipped_${outcome.why}`)
  } catch (e) {
    const message = JSON.stringify(describePolarError(e))
    await prisma.polarWebhookEvent.update({ where: { id: eventId }, data: { error: message.slice(0, 2000) } })
    console.error("[polar/events] failed", eventId, message)
    return { ok: false, error: message }
  }
}

/** Retry anything not processed yet (oldest first). Used by the cron. */
export async function processPendingPolarEvents(limit = 50) {
  const pending = await prisma.polarWebhookEvent.findMany({
    where: { processedAt: null, attempts: { lt: MAX_POLAR_EVENT_ATTEMPTS } },
    orderBy: { receivedAt: "asc" },
    take: limit,
    select: { id: true },
  })
  let ok = 0
  let failed = 0
  for (const { id } of pending) {
    const r = await processPolarEvent(id)
    if (r.ok) ok++
    else failed++
  }
  return { pending: pending.length, ok, failed }
}
