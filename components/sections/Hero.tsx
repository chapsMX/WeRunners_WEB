"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function Hero() {
  const t = useTranslations("hero");
  const pathname = usePathname();
  const locale = pathname.startsWith("/es") ? "es" : "en";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/fondoHero.jpg"
        alt="W3 Runn3rs hero background"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark overlay so text is readable */}
      <div className="absolute inset-0 bg-brand-navy/60" />

      {/* Content — single centered column */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 px-4 sm:px-6 max-w-4xl mx-auto pt-20">

        {/* Rows 1 + 2 — title & tagline, almost touching */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tight leading-none">
            W3 Runn3rs
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-brand-green leading-tight">
            {t("subtitle")}
          </p>
        </div>

        {/* Row 3 — body text */}
        <p className="text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed">
          {t("body")}
        </p>

        {/* Row 4 — CTAs (both green + white text) */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="text-white"
            onClick={() => (window.location.href = `/${locale}/waitlist`)}
          >
            {t("cta_primary")}
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="text-white"
            onClick={() => (window.location.href = `/${locale}/for-clubs`)}
          >
            {t("cta_secondary")}
          </Button>
        </div>
      </div>

      {/* Scroll-down indicator — bottom-right corner */}
      <div className="absolute bottom-8 right-8 z-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/40 text-white/70 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
