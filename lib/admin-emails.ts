// Emails sent from the superadmin panel. Server-only. They never throw: a
// failed email is logged and reported, but doesn't undo the admin action.
import { resend } from "@/lib/resend"
import { betaAccessHtml, betaAccessSubject } from "@/emails/betaAccess"
import { clubApprovedHtml, clubApprovedSubject } from "@/emails/clubApproved"
import { clubOwnerHtml, clubOwnerSubject } from "@/emails/clubOwner"
import { joinDecisionHtml, joinDecisionSubject, joinRequestHtml, joinRequestSubject } from "@/emails/joinRequest"
import { prisma } from "@/lib/prisma"

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

const TEAM_INBOX = "run@w3runn3rs.com"

/** In-app club request: heads-up to the team + confirmation to the runner (plain text, like the landing form). */
export async function sendClubRequestEmails(opts: {
  clubName: string
  city: string
  country: string
  clubEmail: string
  runners: number | null
  requester: { email: string; username: string | null }
}) {
  const details = [
    `Club name : ${opts.clubName}`,
    `City      : ${opts.city}`,
    `Country   : ${opts.country}`,
    `Email     : ${opts.clubEmail}`,
    `Runners   : ${opts.runners ?? "—"}`,
  ]
  const team = [
    "New club request from the app",
    "",
    ...details,
    `Requested by: @${opts.requester.username ?? "—"} (${opts.requester.email})`,
    "",
    "Review it in https://app.w3runn3rs.com/admin/clubs",
  ].join("\n")
  const runner = [
    `Hi! We received your request to add ${opts.clubName} to W3Runn3rs.`,
    "",
    "We'll review it soon. Once it's approved you'll be the club's owner and your runners can join it.",
    "",
    ...details,
  ].join("\n")
  const results = await Promise.allSettled([
    resend.emails.send({ from: FROM, to: TEAM_INBOX, replyTo: opts.requester.email, subject: `New club request: ${opts.clubName}`, text: team }),
    resend.emails.send({ from: FROM, to: opts.requester.email, subject: `We received your club request: ${opts.clubName}`, text: runner }),
  ])
  for (const r of results) {
    if (r.status === "rejected") console.error("[admin-emails] club request failed:", r.reason)
    else if (r.value.error) console.error("[admin-emails] club request failed:", r.value.error)
  }
}

// ── Join requests (approval clubs) ──────────────────────────


/** Owner + collaborators of a club; the team inbox when nobody manages it yet. */
async function clubStaffEmails(clubId: string): Promise<string[]> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      owner: { select: { email: true } },
      memberships: { where: { activeUserId: { not: null }, role: "ADMIN" }, select: { user: { select: { email: true } } } },
    },
  })
  const emails = new Set<string>()
  if (club?.owner?.email) emails.add(club.owner.email)
  club?.memberships.forEach((m) => emails.add(m.user.email))
  return emails.size > 0 ? [...emails] : [TEAM_INBOX]
}

export async function sendJoinRequestEmails(opts: {
  clubId: string
  clubName: string
  clubSlug: string
  runnerName: string
  username: string | null
}) {
  const to = await clubStaffEmails(opts.clubId)
  const html = joinRequestHtml({ ...opts, manageUrl: `https://app.w3runn3rs.com/clubs/${opts.clubSlug}/manage` })
  const sent = await Promise.all(to.map((email) => send(email, joinRequestSubject(opts.clubName), html, "join request")))
  return sent.every(Boolean)
}

export function sendJoinDecisionEmail(opts: { email: string; name: string | null; clubName: string; approved: boolean }) {
  return send(opts.email, joinDecisionSubject(opts.clubName, opts.approved), joinDecisionHtml(opts), "join decision")
}
