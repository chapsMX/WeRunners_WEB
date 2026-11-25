import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { countryName } from "@/lib/countries"
import { getClubWorldRank } from "@/lib/leaderboard"
import { ClubCard, localImage, ogResponse, OG_SIZE, remoteImage } from "@/lib/og"

type Params = { params: Promise<{ slug: string }> }

// Share image for /clubs/<slug>: the club banner, logo, name, place and members / world rank.
export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params
  const club = await prisma.club.findFirst({
    where: { slug, active: true },
    select: { id: true, name: true, slug: true, city: true, country: true, logoUrl: true, bannerUrl: true, memberCount: true },
  })
  if (!club) {
    return ogResponse(<ClubCard bg={await localImage("/images/fondoClubes.jpg")} logo={null} name="We Runners" place={null} slug={slug} />)
  }

  const [banner, logo, rank] = await Promise.all([
    remoteImage(club.bannerUrl, OG_SIZE),
    remoteImage(club.logoUrl, { width: 400, height: 400 }),
    getClubWorldRank(club.id),
  ])
  const bg = banner ?? (await localImage("/images/fondoClubes.jpg"))
  const place = [club.city, countryName(club.country, "en")].filter(Boolean).join(", ")
  const members = `${club.memberCount} ${club.memberCount === 1 ? "member" : "members"}`
  const stat = rank?.rank ? `${members} · #${rank.rank} worldwide this month` : members

  return ogResponse(<ClubCard bg={bg} logo={logo} name={club.name} place={place || null} stat={stat} slug={club.slug} />)
}
