import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppShell } from "@/components/app/AppShell"

// Capa 2 del área protegida: gate de onboarding.
// Si el perfil está incompleto (onboardingCompletedAt = null) → /onboarding.
// Aquí vive el AppShell (sidebar), así que el flujo de onboarding no lo muestra.
export default async function OnboardedLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  // La capa 1 ya garantizó sesión, pero TypeScript no lo sabe.
  if (!session) {
    redirect("/auth/sign-in")
  }

  const [user, activities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompletedAt: true, username: true },
    }),
    prisma.activity.count({ where: { userId: session.user.id } }),
  ])

  if (!user?.onboardingCompletedAt) {
    redirect("/onboarding")
  }

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        username: user.username,
      }}
      // Following/Followers requieren un grafo social (tabla Follow) aún no creado.
      stats={{ following: 0, followers: 0, activities }}
    >
      {children}
    </AppShell>
  )
}
