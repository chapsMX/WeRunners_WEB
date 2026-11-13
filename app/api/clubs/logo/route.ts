import type { NextResponse } from "next/server"
import { profileImageUploadToken } from "@/lib/blob-upload"
import { getManagedClubSlug, isSuperadmin } from "@/lib/club-admin"

// Upload token for a club logo: superadmin or a club owner/collaborator.
// Which club it's saved to is checked again by the save action.
export function POST(request: Request): Promise<NextResponse> {
  return profileImageUploadToken(request, 5 * 1024 * 1024, async (userId) =>
    (await isSuperadmin(userId)) || (await getManagedClubSlug(userId)) !== null
  )
}
