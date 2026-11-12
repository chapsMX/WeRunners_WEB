import { escapeHtml } from "./escape";
import { darkEmailLayout, paragraph } from "./layout";

/** Link that verifies an email/password account (Better Auth verify-email URL). */
export function verifyEmailHtml(url: string, name?: string | null): string {
  const first = name?.trim().split(/\s+/)[0];
  const greeting = first ? `Hey ${escapeHtml(first)}!` : "Hey runner!";
  const safeUrl = escapeHtml(url);

  return darkEmailLayout({
    title: "Verify your W3Runn3rs email",
    emoji: "✉️",
    heading: "Verify your email",
    bodyHtml:
      paragraph(greeting) +
      paragraph("Confirm this is your email to finish creating your W3Runn3rs account.", true),
    cta: { href: safeUrl, label: "Verify my email →" },
    afterCtaHtml: `
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-align:center;line-height:1.6;">
                This link expires in 24 hours. If you didn't create an account, you can ignore this email.
              </p>
              <p style="margin:0 0 28px;font-size:12px;color:#4b5563;text-align:center;line-height:1.6;word-break:break-all;">
                ${safeUrl}
              </p>`,
    showSocials: false,
  });
}

export const verifyEmailSubject = "Verify your W3Runn3rs email";
