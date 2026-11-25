import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/lib/dashboard-data"
import { DashboardView } from "@/components/app/dashboard/DashboardView"
import { parseGarminResult } from "@/lib/garmin/results"
import { parsePolarResult } from "@/lib/polar/results"
import { SignUpTracker } from "@/components/app/SignUpTracker"

export const metadata: Metadata = {
  title: "Dashboard · We Runners",
  description: "Your runs, your club's monthly ranking and your numbers on We Runners.",
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ garmin?: string | string[]; polar?: string | string[]; signup?: string | string[] }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const [data, params] = await Promise.all([getDashboardData(session!.user.id), searchParams])

  const firstName = (session?.user?.name ?? "").split(" ")[0] || "Runner"

  const signUpMethod =
    params.signup === "google" || params.signup === "email" ? params.signup : null

  return (
    <>
      {signUpMethod && <SignUpTracker method={signUpMethod} />}
      <DashboardView
        data={data}
        firstName={firstName}
        garminResult={parseGarminResult(params.garmin)}
        polarResult={parsePolarResult(params.polar)}
      />
    </>
  )
}
