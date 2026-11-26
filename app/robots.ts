import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { appRobots, isAppHost } from "@/lib/app-seo";

const BASE_URL = "https://www.w3runn3rs.com";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // app.w3runn3rs.com has its own robots.txt and sitemap (lib/app-seo).
  if (isAppHost((await headers()).get("host"))) return appRobots();

  return {
    rules: [
      {
        userAgent: "*",
        // /api/og/ = share-card images: X's crawler respects robots.txt when
        // fetching og:image, so they must stay allowed (longest match wins).
        allow: ["/", "/api/og/"],
        // Evitar indexar rutas de API, assets internos o duplicados
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
