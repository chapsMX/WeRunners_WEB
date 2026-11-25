// Server-only: emails for an ambassador application sent from the app.
// Same templates as the old landing form: confirmation to the runner and the
// internal notification to the team (now with username and club).
import { resend } from "@/lib/resend"
import { ambassadorConfirmationHtml, ambassadorConfirmationSubject } from "@/emails/ambassadorConfirmation"
import { ambassadorNotificationHtml, ambassadorNotificationSubject } from "@/emails/ambassadorNotification"
import type { SubmittedApplication } from "@/lib/ambassador-applications"

const FROM = "w3runn3rs <noreply@w3runn3rs.com>"
const TEAM_INBOX = "run@w3runn3rs.com"

/** Never throws: the application is already saved. */
export async function sendAmbassadorApplicationEmails(app: SubmittedApplication, username: string | null): Promise<void> {
  const results = await Promise.allSettled([
    resend.emails.send({ from: FROM, to: app.email, subject: ambassadorConfirmationSubject, html: ambassadorConfirmationHtml(app.fullName) }),
    resend.emails.send({
      from: FROM,
      to: TEAM_INBOX,
      replyTo: app.email,
      subject: ambassadorNotificationSubject(app.fullName),
      html: ambassadorNotificationHtml({
        ...app,
        username,
        club: { name: app.club.name, pending: app.club.kind === "registration" },
      }),
    }),
  ])
  for (const r of results) {
    if (r.status === "rejected") console.error("[ambassadors] email failed:", r.reason)
    else if (r.value.error) console.error("[ambassadors] email failed:", r.value.error)
  }
}
