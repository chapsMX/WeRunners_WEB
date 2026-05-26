import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";

const PILLARS = [
  {
    icon: "🎽",
    titleKey: "whatis.pillar1_title",
    descKey: "whatis.pillar1_desc",
  },
  {
    icon: "📊",
    titleKey: "whatis.pillar2_title",
    descKey: "whatis.pillar2_desc",
  },
  {
    icon: "🌍",
    titleKey: "whatis.pillar3_title",
    descKey: "whatis.pillar3_desc",
  },
];

export default function WhatIs() {
  const t = useTranslations();

  return (
    <section id="what-is" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
            {t("whatis.headline")}
          </h2>
          <div className="space-y-4 text-slate-400 text-lg leading-relaxed">
            <p>{t("whatis.body1")}</p>
            <p>{t("whatis.body2")}</p>
            <p>{t("whatis.body3")}</p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map(({ icon, titleKey, descKey }) => (
            <Card key={titleKey} variant="highlight">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t(titleKey)}
              </h3>
              <p className="text-slate-400">{t(descKey)}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
