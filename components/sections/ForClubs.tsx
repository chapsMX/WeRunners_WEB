"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

/* ─── Icons ──────────────────────────────────────────────── */
function ClubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function InviteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  );
}

/* ─── Steps data ─────────────────────────────────────────── */
const STEPS = [
  { Icon: ClubIcon,    titleKey: "clubs.step1_title" as const, descKey: "clubs.step1_desc" as const },
  { Icon: ProfileIcon, titleKey: "clubs.step2_title" as const, descKey: "clubs.step2_desc" as const },
  { Icon: InviteIcon,  titleKey: "clubs.step3_title" as const, descKey: "clubs.step3_desc" as const },
  { Icon: TrophyIcon,  titleKey: "clubs.step4_title" as const, descKey: "clubs.step4_desc" as const },
];

/* ─── Component ──────────────────────────────────────────── */
export default function ForClubs() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith("/es") ? "es" : "en";

  return (
    <section id="for-clubs" className="bg-background">
      <div className="grid lg:grid-cols-2 min-h-[540px]">

        {/* ── Left: headline + body + CTA ── */}
        <div className="flex flex-col items-center justify-center text-center gap-8 px-10 lg:px-16 py-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
            {t("clubs.headline")}
          </h2>
          <p className="text-muted text-lg leading-relaxed max-w-md">
            {t("clubs.body")}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="text-white"
            onClick={() => {
              trackEvent.registerClub("for_clubs");
              window.location.href = `/${locale}/for-clubs`;
            }}
          >
            {t("clubs.cta")}
          </Button>
        </div>

        {/* ── Right: 2×2 hover boxes ── */}
        {/* gap-px + bg-line creates 1px dividers between cells */}
        <div className="grid grid-cols-2 gap-px bg-line">
          {STEPS.map(({ Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="group bg-surface-alt hover:bg-brand-navy transition-colors duration-300
                         flex flex-col items-center justify-center gap-6 p-10 cursor-default"
            >
              {/* Icon */}
              <div className="text-brand-blue group-hover:text-brand-green transition-colors duration-300">
                <Icon className="w-12 h-12" />
              </div>

              {/* Title */}
              <h3 className="text-foreground group-hover:text-white transition-colors duration-300
                             font-extrabold text-lg uppercase tracking-wide text-center leading-tight">
                {t(titleKey)}
              </h3>

              {/* Description — appears on hover */}
              <p className="text-transparent group-hover:text-white/70 transition-colors duration-300
                            text-sm text-center leading-relaxed max-w-[180px]">
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
