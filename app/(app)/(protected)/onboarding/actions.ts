"use server"

import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { APP_LOCALE_COOKIE } from "@/lib/app-i18n"

export type OnboardingState = {
  error?: {
    field: "username" | "facebook" | "strava" | "form"
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

/**
 * Normaliza un @handle de red social. Acepta que el usuario pegue el handle
 * con o sin `@`, o incluso una URL completa del perfil. Devuelve el handle
 * limpio o null si quedó vacío.
 */
function cleanHandle(raw: string): string | null {
  let v = raw.trim()
  if (!v) return null
  // Si pegaron una URL de perfil, quédate sólo con el último segmento.
  v = v.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com|instagram\.com)\//i, "")
  v = v.replace(/^@/, "").replace(/\/.*$/, "").trim()
  v = v.replace(/[^a-zA-Z0-9_.]/g, "")
  return v.length ? v.slice(0, 30) : null
}

/**
 * Normaliza y valida una URL de perfil. Agrega `https://` si falta el esquema.
 * Devuelve { url } con la URL normalizada, { url: null } si venía vacía, o
 * { invalid: true } si no es parseable.
 */
function cleanUrl(raw: string): { url: string | null; invalid?: boolean } {
  const trimmed = raw.trim()
  if (!trimmed) return { url: null }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const u = new URL(withScheme)
    if (!u.hostname.includes(".")) return { url: null, invalid: true }
    return { url: u.toString() }
  } catch {
    return { url: null, invalid: true }
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
  if (!USERNAME_RE.test(rawUsername)) {
    return { error: { field: "username", code: "invalid" } }
  }
  if (RESERVED.has(rawUsername)) {
    return { error: { field: "username", code: "reserved" } }
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

  redirect("/dashboard")
}
