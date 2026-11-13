import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppShell } from "@/components/app/AppShell"
import { getShellProps } from "@/lib/app-shell"

// Capa 2 del área protegida: gate de onboarding.
// Si el perfil está incompleto (onboardingCompletedAt = null) → /onboarding.
// Aquí vive el AppShell (sidebar), así que el flujo de onboarding no lo muestra.
export default async function OnboardedLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  // La capa 1 ya garantizó sesión, pero TypeScript no lo sabe.
  if (!session) {
    redirect("/auth/sign-in")
  }

  const shell = await getShellProps(session.user)
  if (!shell) {
    redirect("/onboarding")
  }

  return <AppShell {...shell}>{children}</AppShell>
}
