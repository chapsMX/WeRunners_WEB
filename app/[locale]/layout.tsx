import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
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

const BASE_URL = "https://www.w3runn3rs.com";
const TITLE    = "W3Runn3rs — Pick your running club, make it count!";
const DESC     = "The global hub for running clubs. One runner, one club — every kilometer counts exclusively for yours.";
const OG_IMAGE = `${BASE_URL}/images/share.png`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: TITLE,
  description: DESC,

  openGraph: {
    title: TITLE,
    description: DESC,
    url: BASE_URL,
    siteName: "W3Runn3rs",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "W3Runn3rs — Pick your running club, make it count!",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@w3runn3rs",
    creator: "@w3runn3rs",
    title: TITLE,
    description: DESC,
    images: [OG_IMAGE],
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

        <Analytics />
        <GoogleAnalytics gaId="G-0SQR3G71T8" />
      </body>
    </html>
  );
}
