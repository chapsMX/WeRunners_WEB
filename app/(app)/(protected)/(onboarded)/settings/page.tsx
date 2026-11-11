import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "./SettingsForm"

// Deriva el segmento editable a partir del valor almacenado y su prefijo
// (inverso de lo que arma SocialInput al enviar).
function stripPrefix(stored: string | null, prefix: string): string {
  if (!stored) return ""
  let v = stored.replace(/^https?:\/\//i, "").replace(/^www\./i, "")
  if (prefix !== "@" && v.toLowerCase().startsWith(prefix.toLowerCase())) {
    v = v.slice(prefix.length)
  }
  return v
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      image: true,
      username: true,
      bio: true,
      preferredUnit: true,
      locale: true,
      twitterHandle: true,
      instagramHandle: true,
      facebookProfileUrl: true,
      stravaProfileUrl: true,
    },
  })
  if (!user) redirect("/auth/sign-in")

  return (
    <SettingsForm
      initial={{
        name: user.name ?? "",
        image: user.image ?? null,
        username: user.username ?? "",
        bio: user.bio ?? "",
        preferredUnit: user.preferredUnit === "MILES" ? "MILES" : "KM",
        locale: user.locale === "es" ? "es" : "en",
        twitter: stripPrefix(user.twitterHandle, "@"),
        instagram: stripPrefix(user.instagramHandle, "@"),
        facebook: stripPrefix(user.facebookProfileUrl, "facebook.com/"),
        strava: stripPrefix(user.stravaProfileUrl, "strava.com/athletes/"),
      }}
    />
  )
}
