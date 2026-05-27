import { MetadataRoute } from "next";

const BASE_URL = "https://www.w3runn3rs.com";
const locales = ["en", "es"] as const;

// ─── Rutas estáticas ──────────────────────────────────────────────────────────
// Agrega aquí cualquier nueva ruta que agregues al sitio.
const staticRoutes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "",               changeFrequency: "weekly",  priority: 1.0 },
  { path: "/events",        changeFrequency: "weekly",  priority: 0.9 },
  { path: "/for-clubs",     changeFrequency: "monthly", priority: 0.8 },
  { path: "/ambassadors",   changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog",          changeFrequency: "weekly",  priority: 0.8 },
  { path: "/waitlist",      changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy",    changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-of-service",  changeFrequency: "yearly", priority: 0.3 },
];

// ─── Blog posts dinámicos ─────────────────────────────────────────────────────
// Cuando tengas posts reales, reemplaza esta función con la lectura real de tu
// fuente de contenido (Contentlayer, MDX, CMS, etc.)
async function getBlogSlugs(): Promise<string[]> {
  // TODO: leer slugs reales cuando existan posts
  // Ejemplo con fs:
  // const files = fs.readdirSync(path.join(process.cwd(), 'content/blog'))
  // return files.map(f => f.replace(/\.mdx?$/, ''))
  return [];
}

// ─── Builder de alternates ────────────────────────────────────────────────────
function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }
  languages["x-default"] = `${BASE_URL}/en${path}`;
  return { languages };
}

// ─── Sitemap principal ────────────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // Rutas estáticas — una entrada por locale
  for (const route of staticRoutes) {
    const alternates = buildAlternates(route.path);

    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates,
      });
    }
  }

  // Blog posts dinámicos
  const slugs = await getBlogSlugs();
  for (const slug of slugs) {
    const path = `/blog/${slug}`;
    const alternates = buildAlternates(path);

    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates,
      });
    }
  }

  return entries;
}
