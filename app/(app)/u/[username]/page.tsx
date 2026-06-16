import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ProfileStats } from "@/components/app/ProfileStats"

type Params = { username: string }

async function getProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { name: true, image: true, username: true, bio: true },
  })
  if (!user) return null
  const activities = await prisma.activity.count({
    where: { user: { username: user.username } },
  })
  return { user, activities }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { username } = await params
  const data = await getProfile(username)
  if (!data) return { title: "W3Runn3rs" }
  return {
    title: `${data.user.name} (@${data.user.username}) · W3Runn3rs`,
    description: data.user.bio ?? undefined,
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { username } = await params
  const data = await getProfile(username)
  if (!data) notFound()

  const { user, activities } = data
  const name = user.name || "Runner"
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="flex flex-col items-center rounded-2xl border border-line bg-surface-alt/40 p-8 text-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full bg-surface-alt ring-2 ring-line">
            {user.image ? (
              <Image src={user.image} alt={name} fill sizes="112px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-brand-green">
                {initial}
              </span>
            )}
          </div>

          <h1 className="mt-5 text-2xl font-bold text-foreground">{name}</h1>
          <p className="text-sm text-muted">@{user.username}</p>
          {user.bio && <p className="mt-3 max-w-sm text-sm text-muted">{user.bio}</p>}

          <ProfileStats
            stats={{ following: 0, followers: 0, activities }}
            className="mt-6 w-full border-t border-line pt-6"
          />
        </div>
      </div>
    </div>
  )
}
