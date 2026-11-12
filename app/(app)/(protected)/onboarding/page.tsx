import Image from "next/image"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppLocale } from "@/lib/app-i18n"
import { getSelectableClubs } from "@/lib/clubs"
import AppHeader from "@/components/layout/AppHeader"
import AppFooter from "@/components/layout/AppFooter"
import { OnboardingForm } from "./OnboardingForm"

/** Sugiere un username a partir del nombre/email (solo como valor inicial editable). */
function suggestUsername(name?: string | null, email?: string | null): string {
  const base = (name || email?.split("@")[0] || "").toLowerCase()
  const cleaned = base.replace(/[^a-z0-9_]/g, "").slice(0, 20)
  return cleaned.length >= 3 ? cleaned : ""
}

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")

  const [user, clubs, locale] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompletedAt: true, username: true, preferredUnit: true },
    }),
    getSelectableClubs(),
    getAppLocale(),
  ])

  // Ya completó onboarding → directo al dashboard.
  if (user?.onboardingCompletedAt) {
    redirect("/dashboard")
  }

  const suggested = user?.username ?? suggestUsername(session.user.name, session.user.email)

  return (
    <>
      <AppHeader />

      {/* Same look as the sign-in / waiting screens */}
      <main className="relative min-h-screen overflow-hidden">
        <Image
          src="/images/fondoHero.webp"
          alt="W3Runn3rs runners"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-navy/70" />

        <div className="relative z-10 mx-auto w-full max-w-xl px-4 pt-28 pb-16">
          <OnboardingForm
            name={session.user.name ?? null}
            suggestedUsername={suggested}
            defaultUnit={user?.preferredUnit === "MILES" ? "MILES" : "KM"}
            defaultLocale={locale}
            clubs={clubs}
          />
        </div>
      </main>

      <AppFooter />
    </>
  )
}
