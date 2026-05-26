import { useTranslations } from "next-intl";

const PHRASES = [
  {
    icon: "🌍",
    titleKey: "movement.phrase1_title",
    bodyKey: "movement.phrase1_body",
  },
  {
    icon: "🏅",
    titleKey: "movement.phrase2_title",
    bodyKey: "movement.phrase2_body",
  },
  {
    icon: "🏃",
    titleKey: "movement.phrase3_title",
    bodyKey: "movement.phrase3_body",
  },
];

export default function TheMovement() {
  const t = useTranslations();

  return (
    <section id="movement" className="py-24 bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-12 text-center">
          {t("movement.headline")}
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Quote block */}
          <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
            <p>{t("movement.body1")}</p>
            <p>{t("movement.body2")}</p>
            <p>{t("movement.body3")}</p>
          </div>

          {/* Impact phrases */}
          <div className="space-y-6">
            {PHRASES.map(({ icon, titleKey, bodyKey }) => (
              <div
                key={titleKey}
                className="flex items-start gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/30"
              >
                <span className="text-4xl">{icon}</span>
                <div>
                  <span className="font-extrabold text-foreground text-xl">
                    {t(titleKey)}
                  </span>{" "}
                  <span className="text-slate-400 text-lg">{t(bodyKey)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
