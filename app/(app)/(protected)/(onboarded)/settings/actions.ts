"use server"

import { headers, cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { APP_LOCALE_COOKIE } from "@/lib/app-i18n"
import { cleanHandle, cleanUrl, validateUsername } from "@/lib/profile-validation"

export type ProfileState = {
  ok?: boolean
  error?: {
    field: "name" | "username" | "bio" | "facebook" | "strava" | "form"
    code: string // clave i18n bajo settings.errors
  }
}

const MAX_BIO = 280
const MAX_NAME = 60

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: { field: "form", code: "unauthorized" } }

  const name = String(formData.get("name") ?? "").trim()
  const rawUsername = String(formData.get("username") ?? "").trim().toLowerCase()
  const bio = String(formData.get("bio") ?? "").trim()
  const unit = String(formData.get("preferredUnit") ?? "KM")
  const locale = String(formData.get("locale") ?? "en")
  const image = String(formData.get("image") ?? "").trim()

  // ── Validaciones ──
  if (!name || name.length > MAX_NAME) {
    return { error: { field: "name", code: "invalidName" } }
  }
  if (bio.length > MAX_BIO) {
    return { error: { field: "bio", code: "bioTooLong" } }
  }
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
        name,
        username: rawUsername,
        bio: bio || null,
        image: image || null,
        preferredUnit,
        locale: safeLocale,
        twitterHandle,
        instagramHandle,
        facebookProfileUrl: facebook.url,
        stravaProfileUrl: strava.url,
      },
    })
  } catch (e) {
    // P2002 = violación de unique (username ya tomado por otro usuario)
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

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { ok: true }
}
