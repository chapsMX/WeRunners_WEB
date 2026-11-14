import { escapeHtml } from "./escape";
import { darkEmailLayout, paragraph } from "./layout";

/** To the club's owner/collaborators: a runner asked to join. */
export function joinRequestHtml(opts: { clubName: string; runnerName: string; username: string | null; manageUrl: string }): string {
  const club = escapeHtml(opts.clubName);
  const who = escapeHtml(opts.runnerName) + (opts.username ? ` (@${escapeHtml(opts.username)})` : "");
  return darkEmailLayout({
    title: `New request to join ${club}`,
    emoji: "👋",
    heading: `New request to join ${club}`,
    bodyHtml:
      paragraph(`<strong>${who}</strong> wants to join <strong>${club}</strong> on W3Runn3rs.`) +
      paragraph("Approve or reject the request from your club's management page. Their kilometers count for the club from the moment you approve.", true),
    cta: { href: opts.manageUrl, label: "Review requests →" },
  });
}

export const joinRequestSubject = (clubName: string) => `New request to join ${clubName}`;

/** To the runner: their request was approved or not. */
export function joinDecisionHtml(opts: { clubName: string; name?: string | null; approved: boolean }): string {
  const club = escapeHtml(opts.clubName);
  const first = opts.name?.trim().split(/\s+/)[0];
  const greeting = first ? `Hi ${escapeHtml(first)},` : "Hi,";
  return opts.approved
    ? darkEmailLayout({
        title: `You're in ${club}`,
        emoji: "🎉",
        heading: `You're in ${club}`,
        bodyHtml:
          paragraph(greeting) +
          paragraph(`Your request to join <strong>${club}</strong> was approved. From now on, every kilometer you run counts for the club.`, true),
        cta: { href: "https://app.w3runn3rs.com/dashboard", label: "Go to your dashboard →" },
      })
    : darkEmailLayout({
        title: `About your request to join ${club}`,
        emoji: "🏃",
        heading: `About your request to join ${club}`,
        bodyHtml:
          paragraph(greeting) +
          paragraph(`Your request to join <strong>${club}</strong> wasn't approved this time. You can look for another club — every kilometer counts once you're in one.`, true),
        cta: { href: "https://app.w3runn3rs.com/clubs", label: "Find a club →" },
      });
}

export const joinDecisionSubject = (clubName: string, approved: boolean) =>
  approved ? `You're in ${clubName} 🎉` : `About your request to join ${clubName}`;
