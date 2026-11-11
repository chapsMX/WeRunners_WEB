import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppLocale } from "@/lib/app-i18n"
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompletedAt: true, username: true, preferredUnit: true },
  })

  // Ya completó onboarding → directo al dashboard.
  if (user?.onboardingCompletedAt) {
    redirect("/dashboard")
  }

  const locale = await getAppLocale()
  const suggested = user?.username ?? suggestUsername(session.user.name, session.user.email)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <OnboardingForm
          name={session.user.name ?? null}
          suggestedUsername={suggested}
          defaultUnit={user?.preferredUnit === "MILES" ? "MILES" : "KM"}
          defaultLocale={locale}
        />
      </div>
    </div>
  )
}
