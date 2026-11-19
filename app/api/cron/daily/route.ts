import { NextResponse, type NextRequest } from "next/server"
import { processPendingGarminEvents } from "@/lib/garmin/events"
import { processPendingPolarEvents } from "@/lib/polar/events"
import { getDailySummary, getOpsHealth, shouldSendDigest } from "@/lib/ops-health"
import { sendOpsDigest } from "@/lib/ops-emails"

// The one daily cron (vercel.json): retry pending Garmin and Polar webhook
// events, then email the team the daily report: new runners, runs received and
// anything that needs a look (stuck or failed events, runs flagged for
// implausible pace). A completely quiet day sends nothing. One schedule instead of
// one per provider keeps us within the plan's cron limit.
// /api/cron/garmin-events and /api/cron/polar-events stay for manual runs.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Sequential: one provider's failure must not skip the other or the email.
  const garmin = await processPendingGarminEvents().catch((e) => {
    console.error("[cron/daily] garmin retry failed:", e)
    return { pending: 0, ok: 0, failed: 0 }
  })
  const polar = await processPendingPolarEvents().catch((e) => {
    console.error("[cron/daily] polar retry failed:", e)
    return { pending: 0, ok: 0, failed: 0 }
  })

  const [health, summary] = await Promise.all([getOpsHealth(), getDailySummary()])
  const emailed = shouldSendDigest(health, summary) ? await sendOpsDigest(health, summary, { garmin, polar }) : false

  return NextResponse.json({
    garmin,
    polar,
    problems: health.problems.length,
    paceFlags: health.paceFlags.length,
    newUsers: summary.newUsersTotal,
    runs: summary.runs.received,
    emailed,
  })
}
