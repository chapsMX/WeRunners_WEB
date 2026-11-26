// Server-only: processes stored Polar webhook events (PolarWebhookEvent).
// The webhook stores the payload and answers 200; processing runs after the
// response and, for failures, from the retry cron. Ingest is idempotent.
import { prisma } from "@/lib/prisma"
import { decryptToken } from "@/lib/garmin/crypto"
import { describePolarError, getExercise, getExerciseGpx, PolarApiError } from "./client"
import { buildRouteShape, parseGpxPoints, saveActivityRoute } from "@/lib/routes"
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
      select: { accessToken: true, userId: true },
    })
    if (!conn?.accessToken) return done("unknown_user")

    const accessToken = decryptToken(conn.accessToken)
    let exercise: unknown
    try {
      exercise = await getExercise(accessToken, p.url)
    } catch (e) {
      // Gone (deleted, or older than AccessLink's 30-day window) → nothing to do.
      if (e instanceof PolarApiError && (e.status === 404 || e.status === 204)) return done("exercise_gone")
      throw e
    }
    const outcome = await prisma.$transaction((tx) => ingestPolarExercise(tx, polarUserId, exercise as PolarExercise), {
      maxWait: 15_000,
      timeout: 30_000,
    })
    const result = outcome.status === "stored" ? (outcome.counts ? "counted" : `excluded_${outcome.reason}`) : `skipped_${outcome.why}`
    const ex = exercise as PolarExercise
    const route = outcome.status === "stored" && ex.has_route ? await savePolarRoute(accessToken, conn.userId, ex.id) : null
    return done(route ? `${result}+${route}` : result)
  } catch (e) {
    const message = JSON.stringify(describePolarError(e))
    await prisma.polarWebhookEvent.update({ where: { id: eventId }, data: { error: message.slice(0, 2000) } })
    console.error("[polar/events] failed", eventId, message)
    return { ok: false, error: message }
  }
}

/**
 * Route shape for a stored Polar run (has_route): GPX → shape (lib/routes).
 * Never fails the event: the run already counted; the route is a bonus.
 */
export async function savePolarRoute(accessToken: string, userId: string, exerciseId: string): Promise<string> {
  try {
    const activity = await prisma.activity.findUnique({
      where: { userId_source_externalId: { userId, source: "POLAR", externalId: exerciseId } },
      select: { id: true },
    })
    if (!activity) return "route_no_activity"
    const gpx = await getExerciseGpx(accessToken, exerciseId)
    const shape = gpx ? buildRouteShape(parseGpxPoints(gpx)) : null
    if (!shape) return "route_none"
    await prisma.$transaction((tx) => saveActivityRoute(tx, activity.id, "POLAR", shape))
    return "route_saved"
  } catch (e) {
    console.error("[polar/events] route failed", exerciseId, describePolarError(e))
    return "route_failed"
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
