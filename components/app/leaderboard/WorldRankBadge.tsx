"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { ClubWorldRank } from "@/lib/leaderboard"
import { TrophyIcon } from "../icons"

/** "#2 of 6 clubs worldwide this month" → /leaderboard (dashboard hero, club page). */
export function WorldRankBadge({ worldRank, tone = "default" }: { worldRank: ClubWorldRank; tone?: "default" | "light" }) {
  const t = useTranslations("worldRank")
  const text =
    worldRank.rank != null ? t("ranked", { rank: worldRank.rank, clubs: worldRank.rankedClubs }) : t("unranked")
  return (
    <Link
      href="/leaderboard"
      title={t("cta")}
      className={cn(
        "inline-flex items-center gap-2 border px-3 py-1.5 text-sm font-semibold transition-colors",
        tone === "light"
          ? "border-white/20 bg-black/20 text-white backdrop-blur-sm hover:border-brand-green"
          : "border-line text-foreground hover:border-brand-green"
      )}
    >
      <TrophyIcon size={16} className="shrink-0 text-brand-green" />
      <span>{text}</span>
      <span aria-hidden className="text-brand-green">→</span>
    </Link>
  )
}
