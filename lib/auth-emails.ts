// Emails sent by Better Auth hooks (lib/auth.ts). Server-only.
import { resend } from "@/lib/resend"
import { verifyEmailHtml, verifyEmailSubject } from "@/emails/verifyEmail"
import { appWelcomeHtml, appWelcomeSubject } from "@/emails/appWelcome"
import {
  appSignupNotificationHtml,
  appSignupNotificationSubject,
  type SignupMethod,
} from "@/emails/appSignupNotification"

const FROM = "w3runn3rs <noreply@w3runn3rs.com>"
const TEAM_INBOX = "run@w3runn3rs.com"

type MailUser = { email: string; name?: string | null }

/**
 * Verification link for email/password sign-ups. Errors are logged, not
 * thrown: the user can request a new link by signing in (sendOnSignIn).
 */
export async function sendVerificationEmail(user: MailUser, url: string): Promise<void> {
  const { error } = await resend.emails
    .send({ from: FROM, to: user.email, subject: verifyEmailSubject, html: verifyEmailHtml(url, user.name) })
    .catch((e: unknown) => ({ error: e }))
  if (error) console.error("[auth-emails] verification email failed:", error)
}

/**
 * Welcome to the runner + notification to the team. Called once the email is
 * verified (Google sign-up, or after clicking the verification link).
 * Never throws: a failed email must not break sign-up.
 */
export async function sendWelcomeEmails(user: MailUser, method: SignupMethod): Promise<void> {
  const results = await Promise.allSettled([
    resend.emails.send({ from: FROM, to: user.email, subject: appWelcomeSubject, html: appWelcomeHtml(user.name) }),
    resend.emails.send({
      from: FROM,
      to: TEAM_INBOX,
      replyTo: user.email,
      subject: appSignupNotificationSubject(user.email),
      html: appSignupNotificationHtml({ email: user.email, name: user.name, method }),
    }),
  ])
  for (const r of results) {
    if (r.status === "rejected") console.error("[auth-emails] welcome email failed:", r.reason)
    else if (r.value.error) console.error("[auth-emails] welcome email failed:", r.value.error)
  }
}
