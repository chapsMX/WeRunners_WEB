"use server"

import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { APP_LOCALE_COOKIE } from "@/lib/app-i18n"

export type OnboardingState = {
  error?: {
    field: "username" | "form"
    code: string // clave i18n bajo onboarding.errors
  }
}

const USERNAME_RE = /^[a-z0-9_]{3,20}$/
// Rutas/identificadores que no pueden usarse como username público.
const RESERVED = new Set([
  "admin", "api", "auth", "dashboard", "settings", "profile", "clubs",
  "club", "leaderboard", "onboarding", "w3runn3rs", "runners", "support",
  "about", "help", "me", "new", "edit",
])

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")

  const rawUsername = String(formData.get("username") ?? "").trim().toLowerCase()
  const unit = String(formData.get("preferredUnit") ?? "KM")
  const locale = String(formData.get("locale") ?? "en")

  // ── Validación username ──
  if (!USERNAME_RE.test(rawUsername)) {
    return { error: { field: "username", code: "invalid" } }
  }
  if (RESERVED.has(rawUsername)) {
    return { error: { field: "username", code: "reserved" } }
  }

  const preferredUnit = unit === "MILES" ? "MILES" : "KM"
  const safeLocale = locale === "es" ? "es" : "en"

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: rawUsername,
        preferredUnit,
        locale: safeLocale,
        onboardingCompletedAt: new Date(),
      },
    })
  } catch (e) {
    // P2002 = violación de unique (username ya tomado)
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: { field: "username", code: "taken" } }
    }
    return { error: { field: "form", code: "unknown" } }
  }

  // Persiste el idioma elegido en la cookie que lee el app.
  ;(await cookies()).set(APP_LOCALE_COOKIE, safeLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })

  redirect("/dashboard")
}
