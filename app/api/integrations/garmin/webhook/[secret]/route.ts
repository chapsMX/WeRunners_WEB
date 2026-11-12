import { NextResponse, after, type NextRequest } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { processGarminEvent } from "@/lib/garmin/events"
import {
  clientIp,
  isGarminClientId,
  isGarminIp,
  isValidWebhookSecret,
} from "@/lib/garmin/webhook-auth"

// Garmin push notifications (Activity API v2.1, Push service):
// activities, deregistrations, userPermissionsChange — one URL for all, the
// summary type is the payload's top-level key. Garmin needs HTTP 200 within
// 30 s, so we store the raw payload, answer, and process after the response.
// Retries for failures: /api/cron/garmin-events.

const KNOWN_TYPES = ["activities", "deregistrations", "userPermissionsChange"]

type Params = { params: Promise<{ secret: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { secret } = await params

  // Wrong secret → behave like the route doesn't exist.
  if (!isValidWebhookSecret(secret)) {
    return new NextResponse("Not found", { status: 404 })
  }
  if (!isGarminClientId(request.headers.get("garmin-client-id"))) {
    console.warn("[garmin/webhook] rejected: garmin-client-id mismatch")
    return new NextResponse("Unauthorized", { status: 401 })
  }
  // IP allow-list is log-only for now, to avoid dropping real notifications.
  const ip = clientIp(request.headers.get("x-forwarded-for"))
  if (!isGarminIp(ip)) console.warn("[garmin/webhook] request from outside Garmin ranges:", ip)

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return new NextResponse("Bad request", { status: 400 })
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return new NextResponse("Bad request", { status: 400 })
  }

  const keys = Object.keys(payload as Record<string, unknown>)
  const summaryType = keys.filter((k) => KNOWN_TYPES.includes(k)).join(",") || keys.join(",") || "unknown"

  const event = await prisma.garminWebhookEvent.create({
    data: { summaryType, payload: payload as Prisma.InputJsonValue },
    select: { id: true },
  })

  // Process after the 200 goes out; failures stay pending for the cron.
  after(async () => {
    await processGarminEvent(event.id)
  })

  return new NextResponse("OK", { status: 200 })
}
