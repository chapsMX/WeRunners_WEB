import { useTranslations } from "next-intl";

const STEPS = [
  { step: 1, titleKey: "how.step1_title", descKey: "how.step1_desc" },
  { step: 2, titleKey: "how.step2_title", descKey: "how.step2_desc" },
  { step: 3, titleKey: "how.step3_title", descKey: "how.step3_desc" },
  { step: 4, titleKey: "how.step4_title", descKey: "how.step4_desc" },
];

export default function HowItWorks() {
  const t = useTranslations();

  return (
    <section id="how-it-works" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-16 text-center">
          {t("how.headline")}
        </h2>

        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-lime to-transparent opacity-30" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map(({ step, titleKey, descKey }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div className="w-16 h-16 rounded-full bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center mb-6 relative z-10">
                  <span className="text-brand-lime font-extrabold text-xl">
                    {step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t(titleKey)}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t(descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
