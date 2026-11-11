import type { ReactNode } from "react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"
import { getAppLocale, getAppMessages } from "@/lib/app-i18n"

export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const locale = await getAppLocale()
  const messages = await getAppMessages(locale)

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
    </NextIntlClientProvider>
  )
}
