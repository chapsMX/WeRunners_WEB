import { NextResponse, type NextRequest } from "next/server"
import { processPendingPolarEvents } from "@/lib/polar/events"

// Safety net for Polar webhook events whose after-response processing failed.
// Vercel Schedules (vercel.json) with `Authorization: Bearer ${CRON_SECRET}`.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  return NextResponse.json(await processPendingPolarEvents())
}
