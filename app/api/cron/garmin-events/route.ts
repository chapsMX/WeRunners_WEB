import { NextResponse, type NextRequest } from "next/server"
import { processPendingGarminEvents } from "@/lib/garmin/events"

// Safety net for Garmin webhook events whose after-response processing failed
// (or never ran). Called by Vercel Cron (vercel.json) with
// `Authorization: Bearer ${CRON_SECRET}`.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const result = await processPendingGarminEvents()
  return NextResponse.json(result)
}
