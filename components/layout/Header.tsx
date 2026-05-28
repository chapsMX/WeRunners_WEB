"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const NAV_LINKS = [
  { href: "/waitlist", labelKey: "nav.waitlist" },
  { href: "/events", labelKey: "nav.events" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/ambassadors", labelKey: "nav.ambassadors" },
];

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detect current locale from path
  const locale = pathname.startsWith("/es") ? "es" : "en";
  const otherLocale = locale === "en" ? "es" : "en";
  const localePath = pathname.replace(/^\/(en|es)/, "") || "/";

  const textBase = scrolled ? "text-foreground/80 hover:text-foreground" : "text-white/90 hover:text-white";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-line"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 group"
            aria-label="w3runn3rs — home"
          >
            <Image
              src="/images/logoAzul.png"
              alt="w3runn3rs"
              width={980}
              height={656}
              className="h-14 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
              priority
            />
            <span className={cn("font-extrabold text-xl transition-colors tracking-tight", textBase)}>
              We Runners
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className={cn(
                  "text-base font-medium transition-colors",
                  pathname.includes(href)
                    ? "text-brand-lime"
                    : textBase
                )}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Locale switcher */}
            <Link
              href={`/${otherLocale}${localePath}`}
              className={cn("text-base font-medium transition-colors uppercase", textBase)}
              onClick={() => trackEvent.languageSwitch(otherLocale as "en" | "es")}
            >
              {otherLocale}
            </Link>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => {
                  const next = theme === "dark" ? "light" : "dark";
                  setTheme(next);
                  trackEvent.themeToggle(next as "dark" | "light");
                }}
                className={cn("transition-colors p-1", textBase)}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  // Sun icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                ) : (
                  // Moon icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn("md:hidden transition-colors", textBase)}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-line">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-sm font-medium text-foreground/80 hover:text-brand-lime transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {t(labelKey)}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-2 border-t border-line">
              <Link
                href={`/${otherLocale}${localePath}`}
                className="text-sm font-medium text-muted uppercase"
              >
                {otherLocale}
              </Link>
              {mounted && (
                <button
                  onClick={() => {
                    const next = theme === "dark" ? "light" : "dark";
                    setTheme(next);
                    trackEvent.themeToggle(next as "dark" | "light");
                  }}
                  className="text-muted hover:text-foreground text-sm"
                >
                  {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
