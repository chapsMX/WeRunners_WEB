"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperadmin } from "@/lib/club-admin"
import { setAmbassadorStatus } from "@/lib/ambassador-applications"

/** Superadmin: pending / shortlisted / rejected. */
export async function setAmbassadorStatusAction(id: string, status: string): Promise<{ ok: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!(await isSuperadmin(session?.user.id))) return { ok: false }
  const ok = await setAmbassadorStatus(prisma, id, status)
  revalidatePath("/admin/ambassadors")
  return { ok }
}
