// Server-only: client-upload tokens for a signed-in user's profile images
// (avatar, dashboard banner). The browser uploads straight to Vercel Blob
// (no server-action body limit); the resulting URL is saved separately.
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function profileImageUploadToken(
  request: Request,
  maximumSizeInBytes: number
): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session) throw new Error("Unauthorized")
        return {
          allowedContentTypes: PROFILE_IMAGE_TYPES,
          maximumSizeInBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        }
      },
      // Not fired locally (no public URL); the URL is persisted by the caller.
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}

/** Only URLs from our Vercel Blob store are accepted as profile images. */
export function isBlobImageUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com")
  } catch {
    return false
  }
}
