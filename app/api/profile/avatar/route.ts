import type { NextResponse } from "next/server"
import { profileImageUploadToken } from "@/lib/blob-upload"

// Upload token for the user's avatar; the URL is saved with the profile form.
export function POST(request: Request): Promise<NextResponse> {
  return profileImageUploadToken(request, 5 * 1024 * 1024) // 5 MB
}
