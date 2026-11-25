"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseApplicationInput, submitAmbassadorApplication, type ApplicationError } from "@/lib/ambassador-applications"
import { sendAmbassadorApplicationEmails } from "@/lib/ambassador-emails"
import { AMBASSADOR_APPLY_PATH, AMBASSADOR_INTENT_COOKIE } from "@/lib/ambassador-intent"

export type ApplyState = { ok?: boolean; error?: ApplicationError | "unknown" }

export async function submitAmbassadorApplicationAction(_prev: ApplyState, form: FormData): Promise<ApplyState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(AMBASSADOR_APPLY_PATH)}`)

  const parsed = parseApplicationInput(Object.fromEntries(form.entries()))
  if ("error" in parsed) return { error: parsed.error }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, username: true } })
    const result = await submitAmbassadorApplication(
      prisma,
      { id: session.user.id, email: session.user.email, name: user?.name ?? session.user.name },
      parsed.data
    )
    if (!result.ok) return { error: result.error }
    await sendAmbassadorApplicationEmails(result.application, user?.username ?? null)
  } catch (e) {
    console.error("[ambassadors] apply failed:", e)
    return { error: "unknown" }
  }

  // The pass did its job (beta access + back to the application).
  ;(await cookies()).delete(AMBASSADOR_INTENT_COOKIE)
  revalidatePath(AMBASSADOR_APPLY_PATH)
  revalidatePath("/admin/ambassadors")
  return { ok: true }
}
