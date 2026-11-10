import { NextResponse, type NextRequest } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  ACTIVITY_EXPORT,
  deleteGarminRegistration,
  exchangeCode,
  GarminApiError,
  getGarminPermissions,
  getGarminUserId,
} from "@/lib/garmin/client"
import { encryptedTokenFields } from "@/lib/garmin/connection"
import type { GarminResult } from "@/lib/garmin/results"
import {
  GARMIN_OAUTH_COOKIE,
  GARMIN_OAUTH_COOKIE_PATH,
  parseOAuthState,
} from "@/lib/garmin/oauth-state"

function finish(request: NextRequest, result: GarminResult) {
  const url = new URL("/dashboard", request.url)
  url.searchParams.set("garmin", result)
  const response = NextResponse.redirect(url)
  response.cookies.delete({ name: GARMIN_OAUTH_COOKIE, path: GARMIN_OAUTH_COOKIE_PATH })
  return response
}

// Step 2 of Garmin OAuth2 PKCE: validate state, exchange the code server-side,
// resolve the stable Garmin user id + permissions, store the connection.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }

  const params = request.nextUrl.searchParams
  const stored = parseOAuthState(request.cookies.get(GARMIN_OAUTH_COOKIE)?.value)
  if (!stored || stored.state !== params.get("state") || stored.userId !== session.user.id) {
    return finish(request, "invalid_state")
  }

  const code = params.get("code")
  if (!code) return finish(request, "denied")

  try {
    const tokens = await exchangeCode(code, stored.verifier)
    const garminUserId = await getGarminUserId(tokens.accessToken)

    let permissions: string[] = []
    try {
      permissions = await getGarminPermissions(tokens.accessToken)
    } catch (e) {
      console.error("[garmin/callback] permissions lookup failed", describe(e))
    }

    const [existing, user] = await Promise.all([
      prisma.deviceConnectionGarmin.findUnique({
        where: { garminUserId },
        select: { id: true, userId: true, isActive: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { connectedProvider: true },
      }),
    ])

    // One Garmin account ↔ one W3Runn3rs account. Don't DELETE the registration
    // here: it belongs to the other user's active link.
    if (existing && existing.userId !== session.user.id && existing.isActive) {
      return finish(request, "in_use")
    }

    // One device provider per runner.
    if (user?.connectedProvider && user.connectedProvider !== "GARMIN") {
      await deleteGarminRegistration(tokens.accessToken).catch((e) =>
        console.error("[garmin/callback] cleanup DELETE registration failed", describe(e))
      )
      return finish(request, "other_provider")
    }

    const now = new Date()
    const connectionData = {
      garminUserId,
      ...encryptedTokenFields(tokens),
      permissions,
      permissionsUpdatedAt: now,
      isActive: true,
      deregisteredAt: null,
    }

    await prisma.$transaction([
      // A stale, inactive link of this Garmin account on another W3 user frees it up.
      ...(existing && existing.userId !== session.user.id
        ? [prisma.deviceConnectionGarmin.delete({ where: { id: existing.id } })]
        : []),
      prisma.deviceConnectionGarmin.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, connectedAt: now, ...connectionData },
        update: { connectedAt: now, ...connectionData },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { connectedProvider: "GARMIN" },
      }),
    ])

    return finish(
      request,
      permissions.includes(ACTIVITY_EXPORT) ? "connected" : "connected_no_activity"
    )
  } catch (e) {
    console.error("[garmin/callback] failed", describe(e))
    return finish(request, "failed")
  }
}

/** Log-safe error summary (never includes tokens or response bodies). */
function describe(e: unknown) {
  if (e instanceof GarminApiError) return { message: e.message, status: e.status }
  if (e instanceof Error) return { message: e.message }
  return { message: String(e) }
}
