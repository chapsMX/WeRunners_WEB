"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";

// Lazy-load the 3D globe (client-only, heavy dependency)
const GlobeScene = dynamic(() => import("@/components/globe/GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-64 h-64 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse" />
    </div>
  ),
});

export default function Hero() {
  const t = useTranslations("hero");
  const pathname = usePathname();
  const locale = pathname.startsWith("/es") ? "es" : "en";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-dark">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#a3e635 1px, transparent 1px), linear-gradient(90deg, #a3e635 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          {/* Left column — 1/3 */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-lime/10 text-brand-lime text-sm font-medium px-4 py-2 rounded-full w-fit">
              <span>🏃</span>
              <span>Global Running Hub</span>
            </div>

            {/* H1 */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              {t("h1")}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-brand-lime font-semibold">
              {t("subtitle")}
            </p>

            {/* Body */}
            <p className="text-slate-400 text-base leading-relaxed">
              {t("body")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() =>
                  (window.location.href = `/${locale}/waitlist`)
                }
              >
                {t("cta_primary")}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() =>
                  (window.location.href = `/${locale}/for-clubs`)
                }
              >
                {t("cta_secondary")}
              </Button>
            </div>
          </div>

          {/* Right column — 2/3: 3D Globe */}
          <div className="lg:col-span-2 h-[500px] lg:h-[600px] flex items-center justify-center">
            <GlobeScene />
          </div>
        </div>
      </div>
    </section>
  );
}
