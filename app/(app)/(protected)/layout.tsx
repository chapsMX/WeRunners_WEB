import type { ReactNode } from "react"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { resolveBetaAccess } from "@/lib/beta-access"
import { inviteClubIdFromCookie } from "@/lib/club-invite"
import { AMBASSADOR_INTENT_COOKIE } from "@/lib/ambassador-intent"

// Capa 1 del área protegida: sesión + beta gate.
// El gate de onboarding y el AppShell viven en el grupo (onboarded);
// /onboarding queda fuera de ese grupo para no hacer loop de redirect.
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/auth/sign-in")
  }

  // Beta gate: si betaOpen = true, cualquier usuario registrado pasa; quien
  // llega por el link de invitación de un club (cookie) también.
  // De paso registra en el waitlist a quien entró directo al app.
  const ambassadorIntent = (await cookies()).has(AMBASSADOR_INTENT_COOKIE)
  if (!(await resolveBetaAccess(session.user, await inviteClubIdFromCookie(), ambassadorIntent))) {
    redirect("/auth/waiting")
  }

  return <>{children}</>
}
