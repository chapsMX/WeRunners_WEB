import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppShell } from "@/components/app/AppShell"

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/auth/sign-in")
  }

  // Beta gate: si betaOpen = true, cualquier usuario registrado pasa
  const config = await prisma.appConfig.findUnique({
    where: { id: "global" },
    select: { betaOpen: true },
  })

  if (!config?.betaOpen) {
    const entry = await prisma.waitlistEntry.findUnique({
      where: { email: session.user.email },
      select: { betaAccess: true },
    })
    if (!entry?.betaAccess) {
      redirect("/auth/waiting")
    }
  }

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    >
      {children}
    </AppShell>
  )
}
