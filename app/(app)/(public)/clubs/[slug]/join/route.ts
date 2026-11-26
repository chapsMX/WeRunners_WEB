import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CLUB_INVITE_COOKIE, CLUB_INVITE_MAX_AGE, clubJoinPath, findInviteClub } from "@/lib/club-invite"
import { isLinkPreviewBot, linkPreviewHtml } from "@/lib/link-preview"
import { APP_URL } from "@/lib/share"

// Club invite link: /clubs/<slug>/join (the "Join" button of the public club
// page for guests and for runners who haven't finished onboarding).
// - remembers the club (cookie) for the beta gate and onboarding;
// - guest → sign-in, coming back here afterwards (Google, email verification);
// - signed in, not onboarded → onboarding with the club preselected;
// - onboarded → the club page (joining there is a button, never a GET).
// - link-preview crawlers (X, WhatsApp, Farcaster…) get the club's card
//   instead of the redirect, so a shared invite looks like the club.
type Params = { params: Promise<{ slug: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { slug } = await params
  const club = await findInviteClub({ slug })
  if (!club) return NextResponse.redirect(new URL("/clubs", request.url))

  if (isLinkPreviewBot(request.headers.get("user-agent"))) {
    const extra = await prisma.club.findUnique({ where: { id: club.id }, select: { description: true } })
    const html = linkPreviewHtml({
      title: `Join ${club.name} on We Runners`,
      description: extra?.description ?? `${club.name} is on We Runners, the global hub for running clubs. Join and make every kilometer count for the club.`,
      url: `${APP_URL}${clubJoinPath(club.slug)}`,
      image: `${APP_URL}/api/og/club/${encodeURIComponent(club.slug)}`,
      redirectTo: `${APP_URL}/clubs/${encodeURIComponent(club.slug)}`,
    })
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
  }

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
