// GA4 event helpers — GoogleAnalytics component (next/third-parties) injects
// window.gtag automatically. All calls are no-ops during SSR or if gtag hasn't
// loaded yet, so they're safe to call from any client component.

declare function gtag(
  command: "event",
  action: string,
  params?: Record<string, string>
): void;

// Events fired on mount (e.g. sign_up after onboarding) can run before the GA
// script has defined gtag; retry briefly instead of silently dropping them.
const RETRY_MS = 250;
const MAX_RETRIES = 20; // ~5 s

function track(action: string, params?: Record<string, string>, attempt = 0) {
  if (typeof window === "undefined") return;
  if (typeof gtag === "undefined") {
    if (attempt < MAX_RETRIES) {
      window.setTimeout(() => track(action, params, attempt + 1), RETRY_MS);
    }
    return;
  }
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

  // ── App (app.w3runn3rs.com) ── never send PII (email, name, username).

  /** Fired once, when a new runner finishes onboarding. GA4 recommended event. */
  signUp: (method: SignUpMethod) =>
    track("sign_up", { method }),

  deviceConnectClick: (provider: DeviceProvider) =>
    track("device_connect_click", { provider }),

  /** Outcome of the provider OAuth flow (?garmin=<result> on the dashboard). */
  deviceConnectResult: (provider: DeviceProvider, result: string) =>
    track("device_connect_result", { provider, result }),

  profileUpdate: () =>
    track("profile_update"),

  avatarUpload: () =>
    track("avatar_upload"),
};

export type SignUpMethod = "google" | "email";
export type DeviceProvider = "garmin" | "polar" | "suunto";
