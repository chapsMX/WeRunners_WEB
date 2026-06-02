import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://www.w3runn3rs.com";
const locales  = routing.locales;

/**
 * Genera el bloque `alternates` (canonical + hreflang) para una ruta.
 *
 * @param locale  - El locale activo, ej. "en" o "es"
 * @param path    - La ruta SIN locale, ej. "" | "/events" | "/blog/mi-post"
 */
export function buildAlternates(locale: string, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};

  for (const l of locales) {
    languages[l] = `${BASE_URL}/${l}${path}`;
  }
  languages["x-default"] = `${BASE_URL}/en${path}`;

  return {
    canonical: `${BASE_URL}/${locale}${path}`,
    languages,
  };
}

/**
 * Construye un objeto Metadata con canonical + hreflang listos para Search Console.
 * Mezcla los overrides opcionales sobre la base.
 */
export function buildPageMetadata(
  locale: string,
  path: string,
  overrides: Partial<Metadata> = {}
): Metadata {
  return {
    ...overrides,
    alternates: buildAlternates(locale, path),
  };
}
