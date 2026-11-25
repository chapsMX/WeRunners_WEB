import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfMonthUtc } from "@/lib/dashboard-data"
import { localImage, ogResponse, ProfileCard, remoteImage } from "@/lib/og"

type Params = { params: Promise<{ username: string }> }

// Share image for /u/<username>: the runner's photo, name, club and km this month.
export async function GET(_request: NextRequest, { params }: Params) {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      memberships: { where: { activeUserId: { not: null } }, select: { club: { select: { name: true } } } },
    },
  })
  const fallbackBg = localImage("/images/fondoHero.jpg")
  if (!user?.username) return ogResponse(<ProfileCard bg={await fallbackBg} avatar={null} name="We Runners" username={username} club={null} />)

  const [bg, avatar, month] = await Promise.all([
    fallbackBg,
    remoteImage(user.image, { width: 480, height: 480 }),
    prisma.activity.aggregate({
      where: { userId: user.id, countsForLeaderboard: true, activityDate: { gte: startOfMonthUtc() } },
      _sum: { distanceMeters: true },
    }),
  ])
  const club = user.memberships[0]?.club.name ?? null
  const meters = month._sum.distanceMeters ?? 0
  const stat = club && meters > 0 ? `${(meters / 1000).toFixed(1)} km for the club this month` : null

  return ogResponse(
    <ProfileCard bg={bg} avatar={avatar} name={user.name || user.username} username={user.username} club={club ? `Runs with ${club}` : null} stat={stat} />
  )
}
