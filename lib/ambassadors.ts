// Shared by the ambassador application form (client) and its server action
// (lib/ambassador-applications), so both validate against the same rules.
import { cleanHandle } from "@/lib/profile-validation";

export const AMBASSADOR_LIMITS = {
  motivationMin: 10,
  motivationMax: 2000,
} as const;

/** Accepts "@handle", "handle" or a profile URL (TikTok URLs included). */
export function cleanSocialHandle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const withoutTiktok = raw.trim().replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "");
  return cleanHandle(withoutTiktok);
}
