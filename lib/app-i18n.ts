import { cookies } from "next/headers"

// El área (app) vive fuera del routing [locale] de next-intl, así que el idioma
// se resuelve por cookie. Inglés es el idioma por defecto.

export type AppLocale = "en" | "es"

export const APP_LOCALES: AppLocale[] = ["en", "es"]
export const APP_DEFAULT_LOCALE: AppLocale = "en"
export const APP_LOCALE_COOKIE = "app-locale"

function isAppLocale(value: string | undefined | null): value is AppLocale {
  return value === "en" || value === "es"
}

/** Resuelve el idioma del app: preferencia del usuario → cookie → default (en). */
export async function getAppLocale(userLocale?: string | null): Promise<AppLocale> {
  if (isAppLocale(userLocale)) return userLocale
  const cookieLocale = (await cookies()).get(APP_LOCALE_COOKIE)?.value
  if (isAppLocale(cookieLocale)) return cookieLocale
  return APP_DEFAULT_LOCALE
}

export async function getAppMessages(locale: AppLocale) {
  return (await import(`../messages/${locale}.json`)).default
}
