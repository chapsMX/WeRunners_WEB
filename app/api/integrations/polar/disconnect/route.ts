import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decryptToken } from "@/lib/garmin/crypto"
import { deregisterUser, describePolarError, PolarApiError } from "@/lib/polar/client"

// Disconnect Polar from our side: DELETE /v3/users/{id} (revokes the token).
// Always deactivated locally so the user is never stuck.
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const conn = await prisma.deviceConnectionPolar.findUnique({ where: { userId: session.user.id } })
  if (!conn || !conn.isActive) return NextResponse.json({ error: "not_connected" }, { status: 404 })

  let polarDeregistered = false
  try {
    await deregisterUser(decryptToken(conn.accessToken), conn.polarUserId)
    polarDeregistered = true
  } catch (e) {
    if (e instanceof PolarApiError && (e.status === 401 || e.status === 403 || e.status === 404)) polarDeregistered = true
    else console.error("[polar/disconnect] DELETE user failed", describePolarError(e))
  }

  await prisma.$transaction([
    prisma.deviceConnectionPolar.update({
      where: { id: conn.id },
      data: { isActive: false, deregisteredAt: new Date(), accessToken: "" },
    }),
    prisma.user.update({ where: { id: session.user.id }, data: { connectedProvider: null } }),
  ])
  return NextResponse.json({ ok: true, polarDeregistered })
}
