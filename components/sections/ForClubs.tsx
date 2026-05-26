"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

const STEPS = [
  { step: 1, titleKey: "clubs.step1_title", descKey: "clubs.step1_desc" },
  { step: 2, titleKey: "clubs.step2_title", descKey: "clubs.step2_desc" },
  { step: 3, titleKey: "clubs.step3_title", descKey: "clubs.step3_desc" },
  { step: 4, titleKey: "clubs.step4_title", descKey: "clubs.step4_desc" },
];

export default function ForClubs() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith("/es") ? "es" : "en";

  return (
    <section id="for-clubs" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: text */}
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              {t("clubs.headline")}
            </h2>
            <p className="text-slate-400 text-lg mb-8">{t("clubs.body")}</p>
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                (window.location.href = `/${locale}/for-clubs`)
              }
            >
              {t("clubs.cta")}
            </Button>
          </div>

          {/* Right: steps */}
          <div className="space-y-4">
            {STEPS.map(({ step, titleKey, descKey }) => (
              <div
                key={step}
                className="flex gap-4 p-4 rounded-xl border border-slate-800 hover:border-brand-lime/40 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center">
                  <span className="text-brand-lime font-bold text-sm">
                    {step}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    {t(titleKey)}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
