import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  needsPermissionsRecheck,
  recheckGarminPermissions,
  sharingState,
} from "@/lib/garmin/permissions"
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

  const garmin = await prisma.deviceConnectionGarmin.findFirst({
    where: { userId: session.user.id, isActive: true },
    select: {
      connectedAt: true,
      lastSyncAt: true,
      isActive: true,
      permissions: true,
      permissionsUpdatedAt: true,
    },
  })
  // Sharing off/unknown → ask Garmin again (rate-limited) before showing it.
  const fresh = needsPermissionsRecheck(garmin)
    ? await recheckGarminPermissions(session.user.id)
    : null
  const sharing = garmin ? sharingState(fresh ?? garmin) : null
  const device = garmin
    ? {
        provider: "garmin" as const,
        connectedAt: garmin.connectedAt.toISOString(),
        lastSyncAt: garmin.lastSyncAt?.toISOString() ?? null,
        activitySharing: sharing === "unknown" ? null : sharing === "on",
      }
    : null

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
      device={device}
    />
  )
}
