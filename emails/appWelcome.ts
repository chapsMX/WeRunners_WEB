import { escapeHtml } from "./escape";
import { darkEmailLayout, paragraph } from "./layout";

/** Sent once the account exists and the email is verified (Google or link). */
export function appWelcomeHtml(name?: string | null): string {
  const first = name?.trim().split(/\s+/)[0];
  const greeting = first ? `Welcome, ${escapeHtml(first)}!` : "Welcome, runner!";

  return darkEmailLayout({
    title: "Your We Runners account is ready",
    emoji: "🏃",
    heading: "Your account is ready",
    bodyHtml:
      paragraph(greeting) +
      paragraph(
        "You're on the list. We're rolling out access gradually and we'll email you as soon as it's your turn to pick your running club and make every kilometer count.",
        true
      ),
    cta: { href: "https://app.w3runn3rs.com", label: "Go to We Runners →" },
  });
}

export const appWelcomeSubject = "Your We Runners account is ready 🏃";
