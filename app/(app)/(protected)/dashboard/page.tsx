import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="text-lime-400 font-bold text-4xl tracking-tight">
          W3<span className="text-white">RUNN3RS</span>
        </div>
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400">
          Bienvenido, {session?.user?.name ?? session?.user?.email}
        </p>
        <p className="text-slate-600 text-sm">En construcción — el dashboard llega pronto.</p>
      </div>
    </div>
  )
}
