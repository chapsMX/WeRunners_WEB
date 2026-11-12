import type { NextResponse } from "next/server"
import { profileImageUploadToken } from "@/lib/blob-upload"

// Upload token for the dashboard banner; the URL is saved by updateBanner().
export function POST(request: Request): Promise<NextResponse> {
  return profileImageUploadToken(request, 8 * 1024 * 1024) // 8 MB
}
