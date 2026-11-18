import { NextResponse, after, type NextRequest } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { isValidPolarSignature } from "@/lib/polar/client"
import { processPolarEvent } from "@/lib/polar/events"

// Polar AccessLink webhook (one per client, created with scripts/polar-webhook.mjs).
// - PING (on create / URL change / activate) must get 200 — it arrives before
//   we even have the signing key, so it's answered without verification.
// - Everything else is verified with Polar-Webhook-Signature (HMAC-SHA256 of
//   the raw body, key = POLAR_WEBHOOK_SECRET), stored, answered 200, and
//   processed after the response. Retries: /api/cron/polar-events.
export async function POST(request: NextRequest) {
  const eventType = request.headers.get("polar-webhook-event") ?? "unknown"
  const raw = await request.text()
  if (eventType === "PING") return new NextResponse("OK", { status: 200 })

  const secret = process.env.POLAR_WEBHOOK_SECRET
  if (!secret) {
    console.error("[polar/webhook] POLAR_WEBHOOK_SECRET is not set")
    return new NextResponse("Not configured", { status: 503 })
  }
  if (!isValidPolarSignature(raw, request.headers.get("polar-webhook-signature"), secret)) {
    console.warn("[polar/webhook] rejected: bad signature")
    return new NextResponse("Unauthorized", { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return new NextResponse("Bad request", { status: 400 })
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return new NextResponse("Bad request", { status: 400 })
  }

  const event = await prisma.polarWebhookEvent.create({
    data: { eventType, payload: payload as Prisma.InputJsonValue },
    select: { id: true },
  })
  after(async () => {
    await processPolarEvent(event.id)
  })
  return new NextResponse("OK", { status: 200 })
}
