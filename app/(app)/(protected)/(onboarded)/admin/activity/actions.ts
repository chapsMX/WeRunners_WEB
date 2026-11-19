"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { isSuperadmin } from "@/lib/club-admin"
import { retryWebhookEvent, WEBHOOK_PROVIDERS, type WebhookProvider } from "@/lib/ops-health"

/** Superadmin: process a stuck/failed webhook event again, right now. */
export async function retryWebhookEventAction(
  provider: WebhookProvider,
  eventId: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!(await isSuperadmin(session?.user.id))) return { ok: false, error: "forbidden" }
  if (!WEBHOOK_PROVIDERS.includes(provider) || typeof eventId !== "string") return { ok: false, error: "invalid" }
  const result = await retryWebhookEvent(provider, eventId)
  revalidatePath("/admin/activity")
  return result
}
