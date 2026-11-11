// Shared by the ambassador form (client) and POST /api/ambassadors (server),
// so both validate against the same rules.
import { cleanHandle } from "@/lib/profile-validation";

export const AMBASSADOR_COUNTRIES = [
  { code: "MX", label: "Mexico" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "JP", label: "Japan" },
  { code: "BR", label: "Brazil" },
  { code: "AU", label: "Australia" },
  { code: "SG", label: "Singapore" },
  { code: "KE", label: "Kenya" },
  { code: "other", label: "Other" },
] as const;

export const AMBASSADOR_LIMITS = {
  nameMax: 100,
  motivationMin: 10,
  motivationMax: 2000,
} as const;

export type AmbassadorInput = {
  fullName: string;
  email: string;
  country: string;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  motivation: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Accepts "@handle", "handle" or a profile URL (TikTok URLs included). */
export function cleanSocialHandle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const withoutTiktok = raw.trim().replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "");
  return cleanHandle(withoutTiktok);
}

/** Returns the normalized application or the first validation error. */
export function parseAmbassadorInput(
  body: Record<string, unknown>
): { data: AmbassadorInput } | { error: string } {
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const country = typeof body.country === "string" ? body.country : "";
  const motivation = typeof body.motivation === "string" ? body.motivation.trim() : "";

  if (!fullName || fullName.length > AMBASSADOR_LIMITS.nameMax) {
    return { error: "Please enter your full name." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!AMBASSADOR_COUNTRIES.some((c) => c.code === country)) {
    return { error: "Please select your country." };
  }
  if (motivation.length < AMBASSADOR_LIMITS.motivationMin) {
    return { error: "Tell us a bit more about why you'd be a great ambassador." };
  }
  if (motivation.length > AMBASSADOR_LIMITS.motivationMax) {
    return { error: `Please keep it under ${AMBASSADOR_LIMITS.motivationMax} characters.` };
  }

  return {
    data: {
      fullName,
      email,
      country,
      instagram: cleanSocialHandle(body.instagram),
      twitter: cleanSocialHandle(body.twitter),
      tiktok: cleanSocialHandle(body.tiktok),
      motivation,
    },
  };
}
