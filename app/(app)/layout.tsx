import type { ReactNode } from "react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"
import { GoogleAnalytics } from "@next/third-parties/google"
import { getAppLocale, getAppMessages } from "@/lib/app-i18n"

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
