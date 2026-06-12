import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import SignOutButton from "./SignOutButton"

export const metadata: Metadata = {
  title: "Lista de espera — W3Runn3rs",
}

export default async function WaitingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center mx-auto">
          <span className="text-3xl">🏃</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-white text-2xl font-bold">Estás en la lista</h1>
          <p className="text-slate-400">
            Tu cuenta está creada. Estamos abriendo el acceso de forma gradual
            y te notificaremos en cuanto sea tu turno.
          </p>
        </div>

        {/* Email */}
        {session?.user?.email && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4">
            <p className="text-slate-500 text-sm">Cuenta registrada</p>
            <p className="text-white font-medium mt-0.5">{session.user.email}</p>
          </div>
        )}

        {/* What's next */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-5 text-left space-y-3">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Mientras tanto</p>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-lime-400 mt-0.5">→</span>
              Síguenos en{" "}
              <a href="https://x.com/w3runn3rs" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">
                @w3runn3rs
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lime-400 mt-0.5">→</span>
              Registra tu club en{" "}
              <a href="https://www.w3runn3rs.com/for-clubs" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">
                www.w3runn3rs.com
              </a>
            </li>
          </ul>
        </div>

        <SignOutButton />
      </div>
    </div>
  )
}
