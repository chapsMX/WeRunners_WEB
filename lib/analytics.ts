// GA4 event helpers — GoogleAnalytics component (next/third-parties) injects
// window.gtag automatically. All calls are no-ops during SSR or if gtag hasn't
// loaded yet, so they're safe to call from any client component.

declare function gtag(
  command: "event",
  action: string,
  params?: Record<string, string>
): void;

function track(action: string, params?: Record<string, string>) {
  if (typeof window === "undefined" || typeof gtag === "undefined") return;
  gtag("event", action, params);
}

export const trackEvent = {
  joinWaitlist: (location: "hero" | "community" | "waitlist_page") =>
    track("join_waitlist", { location }),

  registerClub: (location: "hero" | "for_clubs") =>
    track("register_club", { location }),

  ambassadorApply: () =>
    track("ambassador_apply"),

  languageSwitch: (language: "en" | "es") =>
    track("language_switch", { language }),

  themeToggle: (theme: "dark" | "light") =>
    track("theme_toggle", { theme }),
};
