// Emails sent from the superadmin panel. Server-only. They never throw: a
// failed email is logged and reported, but doesn't undo the admin action.
import { resend } from "@/lib/resend"
import { betaAccessHtml, betaAccessSubject } from "@/emails/betaAccess"
import { clubApprovedHtml, clubApprovedSubject } from "@/emails/clubApproved"
import { clubOwnerHtml, clubOwnerSubject } from "@/emails/clubOwner"

const FROM = "w3runn3rs <noreply@w3runn3rs.com>"

async function send(to: string, subject: string, html: string, tag: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) {
      console.error(`[admin-emails] ${tag} failed:`, error)
      return false
    }
    return true
  } catch (e) {
    console.error(`[admin-emails] ${tag} failed:`, e)
    return false
  }
}

export function sendBetaAccessEmail(email: string, name?: string | null) {
  return send(email, betaAccessSubject, betaAccessHtml(email, name), "beta access")
}

export function sendClubApprovedEmail(clubEmail: string, clubName: string) {
  return send(clubEmail, clubApprovedSubject(clubName), clubApprovedHtml(clubName), "club approved")
}

export function sendClubOwnerEmail(opts: {
  email: string
  name?: string | null
  clubName: string
  clubSlug: string
  hasAccount: boolean
}) {
  return send(
    opts.email,
    clubOwnerSubject(opts.clubName),
    clubOwnerHtml({ ...opts, manageUrl: `https://app.w3runn3rs.com/clubs/${opts.clubSlug}/manage` }),
    "club owner"
  )
}
