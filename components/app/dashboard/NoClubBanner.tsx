"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ClubIcon } from "../icons"

/** Runner without a club: their request is under review, or invite them to register their club. */
export function NoClubBanner({ pendingClubName }: { pendingClubName: string | null }) {
  const t = useTranslations("dashboard.noClub")
  return (
    <div className="flex flex-wrap items-center gap-4 border border-brand-green/40 bg-brand-green/10 px-5 py-4">
      <ClubIcon size={22} className="shrink-0 text-brand-green" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">
          {pendingClubName ? t("pendingTitle", { club: pendingClubName }) : t("title")}
        </p>
        <p className="text-sm text-muted">{pendingClubName ? t("pendingBody") : t("body")}</p>
      </div>
      {!pendingClubName && (
        <Link
          href="/clubs/new"
          className="border border-brand-green bg-brand-green px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90"
        >
          {t("cta")}
        </Link>
      )}
    </div>
  )
}
