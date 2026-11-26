import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { APP_URL } from "@/lib/share"

// robots.txt and sitemap.xml for app.w3runn3rs.com. One deployment serves both
// hosts, so app/robots.ts and app/sitemap.ts pick these on the app host and the
// marketing ones (www) everywhere else.

export function isAppHost(host: string | null): boolean {
  return (host ?? "").startsWith("app.")
}

export function appRobots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/og/ = share-card images (X respects robots.txt for og:image).
        allow: ["/", "/api/og/"],
        // Signed-in pages (they redirect to sign-in anyway). The invite link
        // /clubs/<slug>/join stays allowed: X won't fetch its preview otherwise.
        disallow: [
          "/api/",
          "/_next/",
          "/auth/",
          "/dashboard",
          "/settings",
          "/onboarding",
          "/admin",
          "/ambassadors/",
          "/clubs/*/manage",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}

// Public pages: the club directory, the leaderboard, every active club and
// every runner profile. Run cards (/r/) and follower lists are noindex.
export async function appSitemap(): Promise<MetadataRoute.Sitemap> {
  const [clubs, users] = await Promise.all([
    prisma.club.findMany({ where: { active: true }, select: { slug: true, updatedAt: true }, orderBy: { createdAt: "asc" } }),
    prisma.user.findMany({
      where: { username: { not: null } },
      select: { username: true, updatedAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ])
  const now = new Date()

  return [
    { url: `${APP_URL}/clubs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...clubs.map((c) => ({
      url: `${APP_URL}/clubs/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...users.map((u) => ({
      url: `${APP_URL}/u/${u.username}`,
      lastModified: u.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ]
}
