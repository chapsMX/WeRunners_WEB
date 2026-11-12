"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isBlobImageUrl } from "@/lib/blob-upload"

export type BannerResult = { ok: true } | { ok: false; error: "unauthorized" | "invalid" }

/** Set the dashboard banner to an uploaded Blob image, or null for the default. */
export async function updateBanner(url: string | null): Promise<BannerResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "unauthorized" }
  if (url !== null && !isBlobImageUrl(url)) return { ok: false, error: "invalid" }

  const previous = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bannerUrl: true },
  })
  await prisma.user.update({ where: { id: session.user.id }, data: { bannerUrl: url } })

  // Best effort: don't leave the replaced image in storage.
  const old = previous?.bannerUrl
  if (old && old !== url && isBlobImageUrl(old)) {
    await del(old).catch((e) => console.error("[banner] delete old blob failed", (e as Error).message))
  }

  revalidatePath("/dashboard")
  return { ok: true }
}
