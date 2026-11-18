import { NextResponse, type NextRequest } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { hasBetaAccess } from "@/lib/beta-access"
import { buildAuthorizeUrl, newOAuthState } from "@/lib/polar/client"
import { POLAR_OAUTH_COOKIE, polarCookieOptions } from "@/lib/polar/oauth-state"

// Step 1 of Polar OAuth2: remember a random state in a short-lived httpOnly
// cookie and send the user to Polar Flow's consent page.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    const signIn = new URL("/auth/sign-in", request.url)
    signIn.searchParams.set("callbackUrl", "/dashboard")
    return NextResponse.redirect(signIn)
  }
  if (!(await hasBetaAccess(session.user.email))) {
    return NextResponse.redirect(new URL("/auth/waiting", request.url))
  }
  const state = newOAuthState()
  const response = NextResponse.redirect(buildAuthorizeUrl(state))
  response.cookies.set(POLAR_OAUTH_COOKIE, JSON.stringify({ state, userId: session.user.id }), polarCookieOptions())
  return response
}
