"use server"

import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { APP_LOCALE_COOKIE } from "@/lib/app-i18n"
import { cleanHandle, cleanUrl, validateUsername } from "@/lib/profile-validation"

export type OnboardingState = {
  error?: {
    field: "username" | "facebook" | "strava" | "form"
    code: string // clave i18n bajo onboarding.errors
  }
}

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
  const usernameError = validateUsername(rawUsername)
  if (usernameError) {
    return { error: { field: "username", code: usernameError } }
  }

  const preferredUnit = unit === "MILES" ? "MILES" : "KM"
  const safeLocale = locale === "es" ? "es" : "en"

  // ── Redes sociales (todas opcionales) ──
  const twitterHandle = cleanHandle(String(formData.get("twitterHandle") ?? ""))
  const instagramHandle = cleanHandle(String(formData.get("instagramHandle") ?? ""))

  const facebook = cleanUrl(String(formData.get("facebookProfileUrl") ?? ""))
  if (facebook.invalid) return { error: { field: "facebook", code: "invalidUrl" } }

  const strava = cleanUrl(String(formData.get("stravaProfileUrl") ?? ""))
  if (strava.invalid) return { error: { field: "strava", code: "invalidUrl" } }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: rawUsername,
        preferredUnit,
        locale: safeLocale,
        twitterHandle,
        instagramHandle,
        facebookProfileUrl: facebook.url,
        stravaProfileUrl: strava.url,
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

  // Analytics: the dashboard fires GA4 `sign_up` once with this method.
  // Better Auth stores email/password accounts with providerId "credential".
  const google = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
    select: { id: true },
  })
  redirect(`/dashboard?signup=${google ? "google" : "email"}`)
}
