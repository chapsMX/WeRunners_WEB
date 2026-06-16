import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/lib/dashboard-data"
import { DashboardView } from "@/components/app/dashboard/DashboardView"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const data = await getDashboardData(session!.user.id)

  const firstName = (session?.user?.name ?? "").split(" ")[0] || "Runner"

  return <DashboardView data={data} firstName={firstName} />
}
