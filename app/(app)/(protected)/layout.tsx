import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { hasBetaAccess } from "@/lib/beta-access"

// Capa 1 del área protegida: sesión + beta gate.
// El gate de onboarding y el AppShell viven en el grupo (onboarded);
// /onboarding queda fuera de ese grupo para no hacer loop de redirect.
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/auth/sign-in")
  }

  // Beta gate: si betaOpen = true, cualquier usuario registrado pasa
  if (!(await hasBetaAccess(session.user.email))) {
    redirect("/auth/waiting")
  }

  return <>{children}</>
}
