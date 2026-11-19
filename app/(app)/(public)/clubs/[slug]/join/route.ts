import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CLUB_INVITE_COOKIE, CLUB_INVITE_MAX_AGE, clubJoinPath, findInviteClub } from "@/lib/club-invite"

// Club invite link: /clubs/<slug>/join (the "Join" button of the public club
// page for guests and for runners who haven't finished onboarding).
// - remembers the club (cookie) for the beta gate and onboarding;
// - guest → sign-in, coming back here afterwards (Google, email verification);
// - signed in, not onboarded → onboarding with the club preselected;
// - onboarded → the club page (joining there is a button, never a GET).
type Params = { params: Promise<{ slug: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { slug } = await params
  const club = await findInviteClub({ slug })
  if (!club) return NextResponse.redirect(new URL("/clubs", request.url))

  const session = await auth.api.getSession({ headers: request.headers })
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { onboardingCompletedAt: true } })
    : null
  const onboarded = Boolean(user?.onboardingCompletedAt)

  const target = !session
    ? `/auth/sign-in?callbackUrl=${encodeURIComponent(clubJoinPath(club.slug))}`
    : !onboarded
      ? "/onboarding"
      : `/clubs/${encodeURIComponent(club.slug)}`

  const response = NextResponse.redirect(new URL(target, request.url))
  if (!onboarded) {
    response.cookies.set(CLUB_INVITE_COOKIE, club.id, {
      path: "/",
      maxAge: CLUB_INVITE_MAX_AGE,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
  }
  return response
}
