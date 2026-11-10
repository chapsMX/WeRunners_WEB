import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteGarminRegistration, GarminApiError } from "@/lib/garmin/client"
import { getValidAccessToken } from "@/lib/garmin/connection"

// Disconnect Garmin from our side. Garmin requires calling
// DELETE /user/registration whenever the user removes consent through our app.
// We always deactivate locally, even if Garmin is unreachable, so the user is
// never stuck; `garminDeregistered` reports whether Garmin confirmed it.
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const conn = await prisma.deviceConnectionGarmin.findUnique({
    where: { userId: session.user.id },
  })
  if (!conn || !conn.isActive) {
    return NextResponse.json({ error: "not_connected" }, { status: 404 })
  }

  let garminDeregistered = false
  try {
    await deleteGarminRegistration(await getValidAccessToken(conn))
    garminDeregistered = true
  } catch (e) {
    // 401/403: token already revoked on Garmin's side → nothing left to delete.
    if (e instanceof GarminApiError && (e.status === 401 || e.status === 403)) {
      garminDeregistered = true
    } else {
      console.error(
        "[garmin/disconnect] DELETE registration failed",
        e instanceof GarminApiError ? { message: e.message, status: e.status } : String(e)
      )
    }
  }

  await prisma.$transaction([
    prisma.deviceConnectionGarmin.update({
      where: { id: conn.id },
      // Keep the row (garminUserId mapping for audit) but drop the credentials.
      data: { isActive: false, deregisteredAt: new Date(), accessToken: "", refreshToken: "" },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { connectedProvider: null },
    }),
  ])

  return NextResponse.json({ ok: true, garminDeregistered })
}
