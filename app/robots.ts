import { MetadataRoute } from "next";

const BASE_URL = "https://www.w3runn3rs.com";

export default function robots(): MetadataRoute.Robots {
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
