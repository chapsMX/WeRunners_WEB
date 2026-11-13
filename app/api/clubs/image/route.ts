import type { NextResponse } from "next/server"
import { profileImageUploadToken } from "@/lib/blob-upload"
import { getManagedClubSlug, isSuperadmin } from "@/lib/club-admin"

// Upload token for club images (logo, banner): superadmin or a club
// owner/collaborator. Which club it's saved to is checked by the save action.
export function POST(request: Request): Promise<NextResponse> {
  return profileImageUploadToken(request, 8 * 1024 * 1024, async (userId) =>
    (await isSuperadmin(userId)) || (await getManagedClubSlug(userId)) !== null
  )
}
