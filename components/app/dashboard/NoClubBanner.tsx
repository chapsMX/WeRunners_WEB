"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ClubIcon } from "../icons"

/**
 * Runner without a club: waiting for a club to approve their request, waiting
 * for their own club registration, or invited to find / register a club.
 */
export function NoClubBanner({
  pendingClubName,
  pendingJoinClubName,
}: {
  pendingClubName: string | null
  pendingJoinClubName: string | null
}) {
  const t = useTranslations("dashboard.noClub")
  const [title, body] = pendingJoinClubName
    ? [t("joinPendingTitle", { club: pendingJoinClubName }), t("joinPendingBody")]
    : pendingClubName
      ? [t("pendingTitle", { club: pendingClubName }), t("pendingBody")]
      : [t("title"), t("body")]
  const link =
    "border px-4 py-2 text-sm font-semibold transition-colors"
  return (
    <div className="flex flex-wrap items-center gap-4 border border-brand-green/40 bg-brand-green/10 px-5 py-4">
      <ClubIcon size={22} className="shrink-0 text-brand-green" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted">{body}</p>
      </div>
      {pendingJoinClubName ? (
        <Link href="/clubs" className={`${link} border-line text-foreground hover:border-brand-green hover:text-brand-green`}>
          {t("manageRequest")}
        </Link>
      ) : !pendingClubName ? (
        <div className="flex flex-wrap gap-2">
          <Link href="/clubs" className={`${link} border-brand-green bg-brand-green text-brand-navy hover:bg-brand-green/90`}>
            {t("findClub")}
          </Link>
          <Link href="/clubs/new" className={`${link} border-line text-foreground hover:border-brand-green hover:text-brand-green`}>
            {t("cta")}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
