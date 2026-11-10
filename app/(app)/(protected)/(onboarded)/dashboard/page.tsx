import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/lib/dashboard-data"
import { DashboardView } from "@/components/app/dashboard/DashboardView"
import { parseGarminResult } from "@/lib/garmin/results"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ garmin?: string | string[] }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const [data, params] = await Promise.all([getDashboardData(session!.user.id), searchParams])

  const firstName = (session?.user?.name ?? "").split(" ")[0] || "Runner"

  return (
    <DashboardView
      data={data}
      firstName={firstName}
      garminResult={parseGarminResult(params.garmin)}
    />
  )
}
