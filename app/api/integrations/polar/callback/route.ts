import { NextResponse, type NextRequest } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encryptToken } from "@/lib/garmin/crypto"
import { deregisterUser, describePolarError, exchangeCode, registerUser } from "@/lib/polar/client"
import type { PolarResult } from "@/lib/polar/results"
import { POLAR_OAUTH_COOKIE, POLAR_OAUTH_COOKIE_PATH, parsePolarOAuthState } from "@/lib/polar/oauth-state"

function finish(request: NextRequest, result: PolarResult) {
  const url = new URL("/dashboard", request.url)
  url.searchParams.set("polar", result)
  const response = NextResponse.redirect(url)
  response.cookies.delete({ name: POLAR_OAUTH_COOKIE, path: POLAR_OAUTH_COOKIE_PATH })
  return response
}

// Step 2 of Polar OAuth2: validate state, exchange the code, register the user
// with AccessLink (POST /v3/users, required), store the connection.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.redirect(new URL("/auth/sign-in", request.url))

  const params = request.nextUrl.searchParams
  const stored = parsePolarOAuthState(request.cookies.get(POLAR_OAUTH_COOKIE)?.value)
  if (!stored || stored.state !== params.get("state") || stored.userId !== session.user.id) {
    return finish(request, "invalid_state")
  }
  const code = params.get("code")
  if (!code) return finish(request, "denied")

  try {
    const token = await exchangeCode(code)
    const [existing, user] = await Promise.all([
      prisma.deviceConnectionPolar.findUnique({
        where: { polarUserId: token.polarUserId },
        select: { id: true, userId: true, isActive: true },
      }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { connectedProvider: true } }),
    ])

    // One Polar account ↔ one W3Runn3rs account.
    if (existing && existing.userId !== session.user.id && existing.isActive) return finish(request, "in_use")
    // One device provider per runner.
    if (user?.connectedProvider && user.connectedProvider !== "POLAR") {
      await deregisterUser(token.accessToken, token.polarUserId).catch(() => {})
      return finish(request, "other_provider")
    }

    // memberId = our user id (unique per runner; Polar echoes it back).
    const registration = await registerUser(token.accessToken, session.user.id)
    if (registration === "consent_required") return finish(request, "consent_required")

    const now = new Date()
    const data = {
      polarUserId: token.polarUserId,
      memberId: session.user.id,
      accessToken: encryptToken(token.accessToken),
      tokenExpiresAt: token.expiresAt,
      registrationStatus: "REGISTERED" as const,
      registeredAt: now,
      connectedAt: now,
      isActive: true,
      deregisteredAt: null,
    }
    await prisma.$transaction([
      // A stale, inactive link of this Polar account on another W3 user frees it up.
      ...(existing && existing.userId !== session.user.id
        ? [prisma.deviceConnectionPolar.delete({ where: { id: existing.id } })]
        : []),
      prisma.deviceConnectionPolar.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, ...data },
        update: data,
      }),
      prisma.user.update({ where: { id: session.user.id }, data: { connectedProvider: "POLAR" } }),
    ])
    return finish(request, "connected")
  } catch (e) {
    console.error("[polar/callback] failed", describePolarError(e))
    return finish(request, "failed")
  }
}
