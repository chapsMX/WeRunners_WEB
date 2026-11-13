import Image from "next/image"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getFollowCounts, getFollowViewer, isFollowing } from "@/lib/follows"
import { FollowButton } from "@/components/app/profile/FollowButton"
import { getDashboardData } from "@/lib/dashboard-data"
import { ProfileStats } from "@/components/app/ProfileStats"
import {
  ProfileClub,
  ProfileClubStats,
  ProfileRecords,
  ProfileSampleBadge,
} from "@/components/app/profile/PublicProfileClub"
import { FacebookIcon, InstagramIcon, StravaIcon, XIcon } from "@/components/ui/SocialIcons"
import { buildSocialLinks, type SocialNetwork } from "@/lib/social-links"

type Params = { username: string }

const SOCIAL_ICONS: Record<SocialNetwork, typeof XIcon> = {
  x: XIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  strava: StravaIcon,
}

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      name: true,
      image: true,
      username: true,
      bio: true,
      twitterHandle: true,
      instagramHandle: true,
      facebookProfileUrl: true,
      stravaProfileUrl: true,
    },
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { username } = await params
  const user = await getUser(username)
  if (!user) return { title: "W3Runn3rs" }
  return {
    title: `${user.name} (@${user.username}) · W3Runn3rs`,
    description: user.bio ?? undefined,
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { username } = await params
  const user = await getUser(username)
  if (!user) notFound()

  // Same source as the dashboard; only the public subset reaches the page
  // (no recent activities, device status or streak).
  const session = await auth.api.getSession({ headers: await headers() })
  const [stats, activities, follows, viewer] = await Promise.all([
    getDashboardData(user.id),
    prisma.activity.count({ where: { userId: user.id } }),
    getFollowCounts(user.id),
    getFollowViewer(session?.user.id),
  ])
  const viewerRole = !viewer ? "guest" : viewer.id === user.id ? "self" : "member"
  const viewerFollows = viewerRole === "member" ? await isFollowing(viewer!.id, user.id) : false
  const { isSample, club, hero } = stats
  const records = stats.personal.records

  const name = user.name || "Runner"
  const initial = name.charAt(0).toUpperCase()
  const socials = buildSocialLinks(user)

  return (
    <div className="text-foreground">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        {isSample && (
          <div className="flex justify-end">
            <ProfileSampleBadge />
          </div>
        )}

        <header className="flex flex-col items-center border border-line bg-surface-alt/40 p-8 text-center">
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

          <ProfileClub club={club} />

          {user.bio && <p className="mt-4 max-w-sm text-sm text-muted">{user.bio}</p>}

          {socials.length > 0 && (
            <ul className="mt-4 flex items-center gap-2">
              {socials.map(({ network, href, label }) => {
                const Icon = SOCIAL_ICONS[network]
                return (
                  <li key={network}>
                    <a
                      href={href}
                      target="_blank"
                      rel="me noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-brand-green/50 hover:text-brand-green"
                    >
                      <Icon size={18} />
                    </a>
                  </li>
                )
              })}
            </ul>
          )}

          <ProfileStats
            stats={{ ...follows, activities }}
            username={user.username}
            className="mt-6 w-full max-w-sm border-t border-line pt-6"
          />

          <div className="mt-6">
            <FollowButton
              username={user.username!}
              initialFollowing={viewerFollows}
              viewer={viewerRole}
            />
          </div>
        </header>

        {club && <ProfileClubStats club={club} hero={hero} />}

        <ProfileRecords records={records} />
      </div>
    </div>
  )
}
