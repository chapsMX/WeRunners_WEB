import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getFollowViewer, listFollows, type FollowListKind } from "@/lib/follows"
import { FollowList } from "@/components/app/profile/FollowList"

// Shared by /u/[username]/followers and /u/[username]/following.

export const followListMetadata: Metadata = { robots: { index: false, follow: true } }

export async function FollowListPage({ username, kind }: { username: string; kind: FollowListKind }) {
  const owner = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, name: true, username: true },
  })
  if (!owner?.username) notFound()

  const session = await auth.api.getSession({ headers: await headers() })
  const viewer = await getFollowViewer(session?.user.id)
  const items = await listFollows(owner.id, kind, viewer?.id ?? null)

  return (
    <div className="text-foreground">
      <FollowList
        owner={{ name: owner.name || "Runner", username: owner.username }}
        kind={kind}
        items={items}
        viewerSignedIn={viewer !== null}
      />
    </div>
  )
}
