import { escapeHtml } from "./escape";
import { darkEmailLayout, paragraph } from "./layout";

/** Sent to the club's email when the superadmin approves its registration. */
export function clubApprovedHtml(clubName: string): string {
  const club = escapeHtml(clubName);
  return darkEmailLayout({
    title: `${club} is on W3Runn3rs`,
    emoji: "🏁",
    heading: `${club} is on W3Runn3rs`,
    bodyHtml:
      paragraph(`Good news: <strong>${club}</strong> is now live on W3Runn3rs.`) +
      paragraph(
        "Your runners can choose the club when they join, connect their watch, and every kilometer they run adds up for the club on the weekly and monthly leaderboards."
      ) +
      paragraph("Share the link with your runners so they can get started.", true),
    cta: { href: "https://app.w3runn3rs.com", label: "Open W3Runn3rs →" },
  });
}

export const clubApprovedSubject = (clubName: string) => `${clubName} is live on W3Runn3rs 🏁`;
