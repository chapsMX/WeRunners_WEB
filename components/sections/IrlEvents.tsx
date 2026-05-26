"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function IrlEvents() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith("/es") ? "es" : "en";

  return (
    <section id="events" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
          {t("events.headline")}
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
          {t("events.subtitle")}
        </p>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="text-center p-8">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t("events.find_title")}
            </h3>
            <p className="text-slate-400 mb-6">{t("events.find_desc")}</p>
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = `/${locale}/events`)
              }
            >
              {t("events.find_cta")}
            </Button>
          </Card>

          <Card className="text-center p-8">
            <div className="text-5xl mb-4">➕</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t("events.create_title")}
            </h3>
            <p className="text-slate-400 mb-6">{t("events.create_desc")}</p>
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = `/${locale}/events`)
              }
            >
              {t("events.create_cta")}
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
