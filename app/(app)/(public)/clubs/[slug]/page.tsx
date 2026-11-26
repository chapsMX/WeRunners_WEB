import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getClubPage, getClubViewerState } from "@/lib/club-page"
import { ClubHero } from "@/components/app/clubs/page/ClubHero"
import { ClubMonthActivities } from "@/components/app/clubs/page/ClubMonthActivities"
import { ClubLeaderboard } from "@/components/app/clubs/page/ClubLeaderboard"
import { ClubMonthStats } from "@/components/app/clubs/page/ClubMonthStats"
import { getClubWorldRank } from "@/lib/leaderboard"
import { shareMetadata } from "@/lib/app-share-metadata"

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getClubPage(slug)
  if (!page) return { title: "We Runners" }
  const title = `${page.club.name} · We Runners`
  const description = page.club.description ?? `${page.club.name} on We Runners, the global hub for running clubs.`
  return {
    title,
    description,
    // Relative → app.w3runn3rs.com (metadataBase); www serves these pages too.
    alternates: { canonical: `/clubs/${page.club.slug}` },
    // Share card: the club banner, logo, name and members.
    ...shareMetadata({ title, description, image: `/api/og/club/${page.club.slug}` }),
  }
}

// Public club page — shareable without an account (see middleware).
export default async function ClubPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const page = await getClubPage(slug)
  if (!page) notFound()

  const session = await auth.api.getSession({ headers: await headers() })
  const [viewer, worldRank] = await Promise.all([
    getClubViewerState(session?.user.id ?? null, page.club.id),
    getClubWorldRank(page.club.id),
  ])

  return (
    <div className="text-foreground">
      <ClubHero club={page.club} faces={page.faces} viewer={viewer} worldRank={worldRank} />
      <div className="space-y-8 px-6 py-8 lg:px-8">
        <ClubMonthStats month={page.month} memberCount={page.club.memberCount} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ClubMonthActivities activities={page.activities} />
          <ClubLeaderboard rows={page.leaderboard} />
        </div>
      </div>
    </div>
  )
}
