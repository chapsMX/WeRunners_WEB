// Server-only: everything the AppShell (sidebar) needs for a signed-in runner.
import type { ComponentProps } from "react"
import { prisma } from "@/lib/prisma"
import { getFollowCounts } from "@/lib/follows"
import { getManagedClubSlug, isSuperadmin } from "@/lib/club-admin"
import type { AppShell } from "@/components/app/AppShell"

export type ShellProps = Omit<ComponentProps<typeof AppShell>, "children">

type SessionUser = { id: string; name?: string | null; email?: string | null; image?: string | null }

/** Sidebar props, or null when the runner hasn't finished onboarding. */
export async function getShellProps(sessionUser: SessionUser): Promise<ShellProps | null> {
  const [user, activities, follows, manageClubSlug, superadmin] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { onboardingCompletedAt: true, username: true },
    }),
    prisma.activity.count({ where: { userId: sessionUser.id } }),
    getFollowCounts(sessionUser.id),
    getManagedClubSlug(sessionUser.id),
    isSuperadmin(sessionUser.id),
  ])
  if (!user?.onboardingCompletedAt) return null
  return {
    user: {
      name: sessionUser.name,
      email: sessionUser.email,
      image: sessionUser.image,
      username: user.username,
    },
    stats: { ...follows, activities },
    links: { manageClubSlug, superadmin },
  }
}
