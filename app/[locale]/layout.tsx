import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Space Grotesk — modern, athletic, geometric
const spaceSans = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "W3Runn3rs — Pick your running club, make it count!",
  description:
    "The global hub for running clubs. Join the platform where running clubs compete, connect and grow. One runner, one club — every kilometer counts.",
  metadataBase: new URL("https://www.w3runn3rs.com"),
  openGraph: {
    title: "W3Runn3rs — Pick your running club, make it count!",
    description: "The global hub for running clubs.",
    url: "https://www.w3runn3rs.com",
    siteName: "W3Runn3rs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@w3runn3rs",
    creator: "@w3runn3rs",
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${spaceSans.variable} ${spaceMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0SQR3G71T8"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0SQR3G71T8');
          `}
        </Script>
      </body>
    </html>
  );
}
