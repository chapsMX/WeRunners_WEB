"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

/* ─── Icons ──────────────────────────────────────────────── */
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

/* ─── Stats data ─────────────────────────────────────────── */
const STATS = [
  { Icon: UsersIcon,  value: "10K+",  label: "Global Runners"    },
  { Icon: FlagIcon,   value: "25",    label: "Running Clubs"     },
  { Icon: MapPinIcon, value: "10",    label: "Cities Worldwide"  },
  { Icon: BoltIcon,   value: "50K+",  label: "Running Kms"       },
];

/* ─── Component ──────────────────────────────────────────── */
export default function Community() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith("/es") ? "es" : "en";

  return (
    <section id="community" className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">

      {/* Background image */}
      <Image
        src="/images/fondoJoin.webp"
        alt="Runners community"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-brand-navy/65" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-12 px-4 sm:px-6 max-w-5xl mx-auto py-24">

        {/* Headline + subtitle */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
            Ready to run{" "}
            <span className="text-brand-green">with us?</span>
          </h2>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl leading-relaxed">
            {t("community.subtitle")}
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 w-full">
          {STATS.map(({ Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              {/* Frosted icon circle */}
              <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                <Icon className="w-6 h-6" />
              </div>
              {/* Number */}
              <span className="text-4xl sm:text-5xl font-extrabold text-white leading-none">
                {value}
              </span>
              {/* Label */}
              <span className="text-white/60 text-sm sm:text-base font-medium tracking-wide">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          className="text-white"
          onClick={() => {
              trackEvent.joinWaitlist("community");
              window.location.href = `/${locale}/waitlist`;
            }}
        >
          {t("community.cta")}
        </Button>

      </div>
    </section>
  );
}
