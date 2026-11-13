"use server"

import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { APP_LOCALE_COOKIE } from "@/lib/app-i18n"
import { cleanHandle, cleanUrl, validateUsername } from "@/lib/profile-validation"
import { joinSelectedClub } from "@/lib/clubs"

export type OnboardingState = {
  error?: {
    field: "username" | "club" | "facebook" | "strava" | "form"
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

  // ── Club (obligatorio): "club:<id>" / "reg:<id>" (lib/clubs), o "none" =
  // "mi club no está en la lista" (termina el onboarding sin club).
  const clubChoice = String(formData.get("club") ?? "")
  if (!clubChoice) {
    return { error: { field: "club", code: "clubRequired" } }
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

  // Username tomado por otra persona → error de campo (antes de la transacción).
  const takenBy = await prisma.user.findUnique({
    where: { username: rawUsername },
    select: { id: true },
  })
  if (takenBy && takenBy.id !== session.user.id) {
    return { error: { field: "username", code: "taken" } }
  }

  const profile = {
    username: rawUsername,
    preferredUnit,
    locale: safeLocale,
    twitterHandle,
    instagramHandle,
    facebookProfileUrl: facebook.url,
    stravaProfileUrl: strava.url,
    onboardingCompletedAt: new Date(),
  } as const

  // Perfil + membresía en una sola transacción: o se guarda todo o nada.
  const save = () =>
    prisma.$transaction(async (tx) => {
      if (clubChoice !== "none") {
        const joined = await joinSelectedClub(tx, session.user.id, clubChoice)
        if (!joined) return "clubUnavailable" as const
      }
      await tx.user.update({ where: { id: session.user.id }, data: profile })
      return "ok" as const
    })

  try {
    let result: Awaited<ReturnType<typeof save>>
    try {
      result = await save()
    } catch (e) {
      // Dos runners creando el mismo club a la vez (unique de registrationId/slug):
      // el segundo reintenta y ya encuentra el club creado.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        result = await save()
      } else {
        throw e
      }
    }
    if (result === "clubUnavailable") {
      return { error: { field: "club", code: "clubUnavailable" } }
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: { field: "username", code: "taken" } }
    }
    console.error("[onboarding] save failed:", e)
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
