import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { ON_LIST_COOKIE, ON_LIST_DOMAIN, ON_LIST_MAX_AGE, isW3Host } from "./lib/on-list-cookie"
import { routing } from "./i18n/routing"
import { AMBASSADOR_APPLY_PATH, AMBASSADOR_INTENT_COOKIE, AMBASSADOR_INTENT_MAX_AGE } from "./lib/ambassador-intent"

const intlMiddleware = createMiddleware(routing)

// Rutas del app que no requieren sesión activa
// "/u/" = perfiles públicos de corredores (compartibles sin login)
// "/leaderboard" = leaderboard global de clubes (compartible sin login)
// "/runs/" = tarjeta de una corrida (compartible sin login)
const APP_PUBLIC_PATHS = ["/auth/sign-in", "/auth/sign-up", "/auth/waiting", "/u/", "/leaderboard", "/runs/"]

// Public club pages: /clubs/<slug> exactly (not /clubs, /clubs/new or /manage),
// and their invite link /clubs/<slug>/join (handles guests itself).
const PUBLIC_CLUB_PAGE = /^\/clubs\/(?!new\/?$)[^/]+\/?$/
const CLUB_INVITE_LINK = /^\/clubs\/[^/]+\/join\/?$/

function isPublicAppPath(pathname: string): boolean {
  return (
    APP_PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    PUBLIC_CLUB_PAGE.test(pathname) ||
    CLUB_INVITE_LINK.test(pathname)
  )
}

// La cookie de sesión de Better Auth se llama "better-auth.session_token" en
// HTTP (local) y "__Secure-better-auth.session_token" en HTTPS (producción).
// getSessionCookie resuelve ambos nombres.

// Prefijos de rutas que pertenecen al app — se saltan i18n en cualquier host
const APP_PATH_PREFIXES = [
  "/auth/",
  "/onboarding",
  "/dashboard",
  "/u/",
  "/profile",
  "/clubs",
  "/leaderboard",
  "/settings",
  "/admin",
  "/runs/",
  "/ambassadors/", // /ambassadors/apply (the app); /ambassadors itself is the landing (www, i18n)
]

function isAppSubdomain(request: NextRequest): boolean {
  const host = request.headers.get("host") ?? ""
  return host.startsWith("app.")
}

function isAppPath(pathname: string): boolean {
  return APP_PATH_PREFIXES.some((p) => pathname.startsWith(p))
}

function handleAppRequest(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Checa solo la existencia de la cookie — sin DB, edge-compatible.
  // La validación real de sesión + beta gate ocurre en (protected)/layout.tsx
  const hasSession = Boolean(getSessionCookie(request))
  const isPublic = isPublicAppPath(pathname)

  if (!isPublic && !hasSession) {
    const signInUrl = new URL("/auth/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    const redirect = NextResponse.redirect(signInUrl)
    if (isAmbassadorIntent(request)) setAmbassadorIntentCookie(redirect)
    return redirect
  }

  const response = NextResponse.next()
  if (hasSession) setOnListCookie(request, response)
  if (isAmbassadorIntent(request)) setAmbassadorIntentCookie(response)
  return response
}

// Heading to the ambassador application (landing "Apply now" → sign-in with
// callbackUrl=/ambassadors/apply, or the page itself): remember it so the beta
// gate lets them in and onboarding brings them back (lib/ambassador-intent).
function isAmbassadorIntent(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl
  if (pathname.startsWith(AMBASSADOR_APPLY_PATH)) return true
  return pathname.startsWith("/auth/sign-in") && (searchParams.get("callbackUrl") ?? "").startsWith(AMBASSADOR_APPLY_PATH)
}

function setAmbassadorIntentCookie(response: NextResponse) {
  response.cookies.set(AMBASSADOR_INTENT_COOKIE, "1", {
    path: "/",
    maxAge: AMBASSADOR_INTENT_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  })
}

// Signed-in → on the waitlist (every account is). Share that with the landing
// (www) so its waitlist page shows "You're on the list!" instead of the form.
// Also runs on public paths like /auth/waiting.
function setOnListCookie(request: NextRequest, response: NextResponse) {
  if (!isW3Host(request.headers.get("host")) || request.cookies.has(ON_LIST_COOKIE)) return
  response.cookies.set(ON_LIST_COOKIE, "1", {
    domain: ON_LIST_DOMAIN,
    path: "/",
    maxAge: ON_LIST_MAX_AGE,
    sameSite: "lax",
    secure: true,
    httpOnly: false, // read by the landing's client code
  })
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // app.* no tiene página en "/" → al dashboard. Sin sesión, /dashboard
  // a su vez manda al login con callbackUrl=/dashboard.
  if (isAppSubdomain(request) && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Rutas del app: por subdominio (prod) o por path (dev + prod)
  if (isAppSubdomain(request) || isAppPath(pathname)) {
    return handleAppRequest(request)
  }

  // Subdominio marketing (www) — aplicar routing de next-intl
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    "/",
    "/(en|es)/:path*",
    "/((?!_next|_vercel|api|.*\\..*).*)",
  ],
}
