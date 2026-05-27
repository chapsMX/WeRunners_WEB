import { useTranslations } from "next-intl";

/* ─── Icon SVGs ─────────────────────────────────────────── */
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6
           11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623
           5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152
           c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75
           C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z
           M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25
           c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625Z
           M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75
           c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747
           M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3
           m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582
           m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918
           m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253
           m0 0A17.919 17.919 0 0 1 12 16.5a17.919 17.919 0 0 1-8.716-2.247
           m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

/* ─── Pillar data ────────────────────────────────────────── */
const PILLARS = [
  {
    Icon: ShieldIcon,
    titleKey: "whatis.pillar1_title" as const,
    descKey:  "whatis.pillar1_desc"  as const,
    bg:           "bg-brand-green",
    iconColor:    "text-brand-green",
    highlightCls: "text-brand-navy",
  },
  {
    Icon: ChartIcon,
    titleKey: "whatis.pillar2_title" as const,
    descKey:  "whatis.pillar2_desc"  as const,
    bg:           "bg-brand-blue",
    iconColor:    "text-brand-blue",
    highlightCls: "text-brand-green",
  },
  {
    Icon: GlobeIcon,
    titleKey: "whatis.pillar3_title" as const,
    descKey:  "whatis.pillar3_desc"  as const,
    bg:           "bg-brand-navy",
    iconColor:    "text-brand-navy",
    highlightCls: "text-brand-green",
  },
];

/* ─── Component ──────────────────────────────────────────── */
export default function WhatIs() {
  const t = useTranslations();

  return (
    <section id="what-is" className="bg-background">

      {/* ── Row 1: headline + body ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 lg:pt-24 pb-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-8 leading-tight text-center">
          {t("whatis.headline")}
        </h2>
        <div className="space-y-4 text-muted text-lg leading-relaxed">
          <p>{t("whatis.body1")}</p>
          <p>{t("whatis.body2")}</p>
          <p>{t("whatis.body3")}</p>
        </div>
      </div>

      {/* ── Row 2: full-bleed 3-column pillars ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 w-full">
        {PILLARS.map(({ Icon, titleKey, descKey, bg, iconColor, highlightCls }) => {
          const fullTitle = t(titleKey);
          const words     = fullTitle.split(" ");
          const highlight = words.pop()!;
          const prefix    = words.join(" ");

          return (
            <div
              key={titleKey}
              className={`${bg} flex flex-col gap-10 px-10 lg:px-14 py-16`}
            >
              {/* Icon in white circle */}
              <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                <Icon className="w-8 h-8" />
              </div>

              {/* Title: prefix (white) + highlight word (accent) */}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-wide leading-tight">
                {prefix && <span>{prefix} </span>}
                <span className={highlightCls}>{highlight}</span>
              </h3>

              {/* Description */}
              <p className="text-white/80 text-base leading-relaxed">
                {t(descKey)}
              </p>
            </div>
          );
        })}
      </div>

    </section>
  );
}
