import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect for the root
    "/",
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(en|es)/:path*",
    // Enable redirects that add missing locales
    // Exclude: _next, _vercel, static files, and API routes
    "/((?!_next|_vercel|api|.*\\..*).*)",
  ],
};
