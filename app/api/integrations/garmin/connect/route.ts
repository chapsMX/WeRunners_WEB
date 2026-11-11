import { NextResponse, type NextRequest } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { hasBetaAccess } from "@/lib/beta-access"
import { buildAuthorizeUrl, generatePkce } from "@/lib/garmin/client"
import { GARMIN_OAUTH_COOKIE, cookieOptions } from "@/lib/garmin/oauth-state"

// Step 1 of Garmin OAuth2 PKCE: generate verifier/challenge/state, remember
// them in a short-lived httpOnly cookie and send the user to Garmin's consent page.
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

  const pkce = generatePkce()
  const response = NextResponse.redirect(buildAuthorizeUrl(pkce))
  response.cookies.set(
    GARMIN_OAUTH_COOKIE,
    JSON.stringify({ verifier: pkce.verifier, state: pkce.state, userId: session.user.id }),
    cookieOptions()
  )
  return response
}
