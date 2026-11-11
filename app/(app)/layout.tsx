import type { ReactNode } from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"
import { GoogleAnalytics } from "@next/third-parties/google"
import { getAppLocale, getAppMessages } from "@/lib/app-i18n"
import { appOpenGraph, appTwitter } from "@/lib/app-share-metadata"

// Base share metadata for every app page (sign-in, waiting, public profiles).
// No og:title/og:description here on purpose: link previews then fall back to
// each page's own <title> and description.
export const metadata: Metadata = {
  metadataBase: new URL("https://app.w3runn3rs.com"),
  openGraph: appOpenGraph,
  twitter: appTwitter,
}

export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const locale = await getAppLocale()
  const messages = await getAppMessages(locale)
  // Same GA4 property as the landing; split reports by hostname (www vs app).
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </NextIntlClientProvider>
  )
}
