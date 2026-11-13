import { escapeHtml } from "./escape";
import { darkEmailLayout, paragraph } from "./layout";

/** Sent when the superadmin gives someone beta access from /admin. */
export function betaAccessHtml(email: string, name?: string | null): string {
  const first = name?.trim().split(/\s+/)[0];
  const greeting = first ? `Hi ${escapeHtml(first)},` : "Hi runner,";
  return darkEmailLayout({
    title: "You're in — W3Runn3rs beta",
    emoji: "🎉",
    heading: "You're in",
    bodyHtml:
      paragraph(greeting) +
      paragraph(
        "Your access to the W3Runn3rs beta is ready. Pick your running club, connect your watch and every kilometer you run starts counting for your club."
      ) +
      paragraph(
        `Sign in with <strong>${escapeHtml(email)}</strong> — with Google or with a password. Signing in with a different email won't get you in.`,
        true
      ),
    cta: { href: "https://app.w3runn3rs.com/auth/sign-in", label: "Sign in to W3Runn3rs →" },
  });
}

export const betaAccessSubject = "You're in: your W3Runn3rs beta access is ready 🎉";
