// Server-only: processes stored Garmin webhook events (GarminWebhookEvent).
// The webhook stores the raw payload and answers 200 right away; processing
// runs after the response (next/server `after`) and, for anything that failed,
// again from the retry cron. Ingest is idempotent (upserts), so a retry is safe.
import { prisma } from "@/lib/prisma"
import { ingestGarminPayload, type PayloadSummary } from "./ingest"

export const MAX_EVENT_ATTEMPTS = 5

export async function processGarminEvent(
  eventId: string
): Promise<{ ok: boolean; summary?: PayloadSummary; error?: string }> {
  // Claim one attempt (and skip events that are done or exhausted).
  const claimed = await prisma.garminWebhookEvent.updateMany({
    where: { id: eventId, processedAt: null, attempts: { lt: MAX_EVENT_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  })
  if (claimed.count === 0) return { ok: true }

  const event = await prisma.garminWebhookEvent.findUnique({
    where: { id: eventId },
    select: { payload: true, summaryType: true },
  })
  if (!event) return { ok: false, error: "event not found" }

  try {
    const summary = await prisma.$transaction((tx) => ingestGarminPayload(tx, event.payload), {
      maxWait: 15_000, // Neon may need to wake the compute (default is 2 s)
      timeout: 30_000,
    })
    await prisma.garminWebhookEvent.update({
      where: { id: eventId },
      data: { processedAt: new Date(), error: null },
    })
    console.log("[garmin/events] processed", event.summaryType, JSON.stringify(summary))
    return { ok: true, summary }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    await prisma.garminWebhookEvent.update({
      where: { id: eventId },
      data: { error: message.slice(0, 2000) },
    })
    console.error("[garmin/events] failed", eventId, message)
    return { ok: false, error: message }
  }
}

/** Retry anything not processed yet (oldest first). Used by the cron. */
export async function processPendingGarminEvents(limit = 50) {
  const pending = await prisma.garminWebhookEvent.findMany({
    where: { processedAt: null, attempts: { lt: MAX_EVENT_ATTEMPTS } },
    orderBy: { receivedAt: "asc" },
    take: limit,
    select: { id: true },
  })
  let ok = 0
  let failed = 0
  for (const { id } of pending) {
    const r = await processGarminEvent(id)
    if (r.ok) ok++
    else failed++
  }
  return { pending: pending.length, ok, failed }
}
