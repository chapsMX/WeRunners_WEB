import { escapeHtml } from "./escape";
import { darkEmailLayout, paragraph } from "./layout";

/**
 * Sent when the superadmin makes someone the owner of a club. `hasAccount`
 * false = invitation: they become owner once they sign up with this email.
 */
export function clubOwnerHtml(opts: {
  clubName: string;
  email: string;
  name?: string | null;
  hasAccount: boolean;
  manageUrl: string;
}): string {
  const club = escapeHtml(opts.clubName);
  const first = opts.name?.trim().split(/\s+/)[0];
  const greeting = first ? `Hi ${escapeHtml(first)},` : "Hi,";
  const next = opts.hasAccount
    ? "From your dashboard, open <strong>Manage club</strong> to edit the club profile, add collaborators and look after your members."
    : `Create your account with <strong>${escapeHtml(opts.email)}</strong> (Google or password) — you'll land straight in ${club} as its owner. Signing up with a different email won't link you to the club.`;
  return darkEmailLayout({
    title: `You're the admin of ${club} on W3Runn3rs`,
    emoji: "🏃",
    heading: `You're the admin of ${club}`,
    bodyHtml:
      paragraph(greeting) +
      paragraph(`You're now the owner of <strong>${club}</strong> on W3Runn3rs.`) +
      paragraph(next, true),
    cta: opts.hasAccount
      ? { href: opts.manageUrl, label: "Manage your club →" }
      : { href: "https://app.w3runn3rs.com/auth/sign-in", label: "Create your account →" },
  });
}

export const clubOwnerSubject = (clubName: string) => `You're the admin of ${clubName} on W3Runn3rs`;
