"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

const SOCIALS = [
  {
    name: "Twitter/X",
    href: "https://x.com/w3runn3rs",
    icon: "𝕏",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/w3runn3rs",
    icon: "📸",
  },
  {
    name: "Farcaster",
    href: "https://farcaster.xyz/w3runn3rs",
    icon: "🟣",
  },
  {
    name: "Strava",
    href: "https://www.strava.com/clubs/runn3rs",
    icon: "🟠",
  },
];

export default function Community() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith("/es") ? "es" : "en";

  return (
    <section id="community" className="py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
          {t("community.headline")}
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
          {t("community.subtitle")}
        </p>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 flex-wrap mb-10">
          {SOCIALS.map(({ name, href, icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 text-slate-300 hover:border-brand-lime hover:text-brand-lime transition-colors text-sm font-medium"
            >
              <span>{icon}</span>
              <span>{name}</span>
            </a>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() =>
            (window.location.href = `/${locale}/waitlist`)
          }
        >
          {t("community.cta")}
        </Button>
      </div>
    </section>
  );
}
