import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { routing } from "@/i18n/routing";
import { LangSetter } from "@/components/LangSetter";
import { AlternateUrlProvider } from "@/components/providers/AlternateUrlProvider";

const BASE_URL = "https://www.w3runn3rs.com";
const TITLE    = "W3Runn3rs — Pick your running club, make it count!";
const DESC     = "The global hub for running clubs. One runner, one club — every kilometer counts exclusively for yours.";
const OG_IMAGE = `${BASE_URL}/images/share.png`;

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(BASE_URL),

    title: TITLE,
    description: DESC,

    icons: {
      icon: [
        { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        { rel: "manifest", url: "/site.webmanifest" },
      ],
    },

    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        "en": `${BASE_URL}/en`,
        "es": `${BASE_URL}/es`,
        "x-default": `${BASE_URL}/en`,
      },
    },

    openGraph: {
      title: TITLE,
      description: DESC,
      url: `${BASE_URL}/${locale}`,
      siteName: "W3Runn3rs",
      type: "website",
      locale: locale === "es" ? "es_MX" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_MX", "es_ES"],
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
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <>
      {/* Aplica lang={locale} al <html> que vive en el root layout */}
      <LangSetter locale={locale} />

      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <NextIntlClientProvider messages={messages}>
          <AlternateUrlProvider>
            {children}
          </AlternateUrlProvider>
        </NextIntlClientProvider>
      </ThemeProvider>

      <Analytics />
      <GoogleAnalytics gaId="G-0SQR3G71T8" />
    </>
  );
}
