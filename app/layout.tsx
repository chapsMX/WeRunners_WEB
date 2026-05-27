import type { ReactNode } from "react";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

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

/**
 * Root layout requerido por Next.js 15.
 * Provee <html> y <body> con las fuentes.
 *
 * El locale y los providers (ThemeProvider, NextIntlClientProvider)
 * viven en app/[locale]/layout.tsx.
 * El atributo lang={locale} se aplica vía <LangSetter> client component.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      suppressHydrationWarning  // evita mismatch cuando LangSetter actualiza el lang
    >
      <body
        className={`${spaceSans.variable} ${spaceMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
