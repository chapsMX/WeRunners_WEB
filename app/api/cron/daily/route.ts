import { NextResponse, type NextRequest } from "next/server"
import { processPendingGarminEvents } from "@/lib/garmin/events"
import { processPendingPolarEvents } from "@/lib/polar/events"
import { getOpsHealth, hasProblems } from "@/lib/ops-health"
import { sendOpsDigest } from "@/lib/ops-emails"

// The one daily cron (vercel.json): retry pending Garmin and Polar webhook
// events, then email the team only if something still needs a look (stuck or
// failed events, runs flagged for implausible pace). One schedule instead of
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

  const health = await getOpsHealth()
  const alert = hasProblems(health)
  const emailed = alert ? await sendOpsDigest(health, { garmin, polar }) : false

  return NextResponse.json({
    garmin,
    polar,
    problems: health.problems.length,
    paceFlags: health.paceFlags.length,
    emailed,
  })
}
