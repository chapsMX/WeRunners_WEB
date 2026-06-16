import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

// Rutas del app que no requieren sesión activa
// "/u/" = perfiles públicos de corredores (compartibles sin login)
const APP_PUBLIC_PATHS = ["/auth/sign-in", "/auth/sign-up", "/auth/waiting", "/u/"]

// Cookie que Better Auth escribe al autenticar
const SESSION_COOKIE = "better-auth.session_token"

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

  if (APP_PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Checa solo la existencia de la cookie — sin DB, edge-compatible.
  // La validación real de sesión + beta gate ocurre en (protected)/layout.tsx
  const hasSession = request.cookies.has(SESSION_COOKIE)

  if (!hasSession) {
    const signInUrl = new URL("/auth/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
