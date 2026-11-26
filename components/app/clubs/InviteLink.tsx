"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { clubInviteUrl, shareLinks } from "@/lib/share"
import { ShareButtons } from "../ShareButtons"

/**
 * The club's invite link (/clubs/<slug>/join): copy it for the club's group
 * chat, or share it on X / Farcaster. Its link preview is the club card.
 */
export function InviteLink({ slug, clubName, compact = false }: { slug: string; clubName: string; compact?: boolean }) {
  const t = useTranslations("clubInvite")
  const url = clubInviteUrl(slug)
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t("copyPrompt"), url)
    }
  }

  return (
    <div className={compact ? "flex flex-wrap items-center gap-2" : "space-y-3"}>
      {!compact && (
        <div className="flex items-center gap-2 border border-line bg-surface-alt/40 px-3 py-2">
          <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{url}</span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="border border-brand-green px-3 py-1.5 text-sm font-semibold text-brand-green transition-colors hover:bg-brand-green hover:text-brand-navy"
        >
          {copied ? t("copied") : compact ? t("copyInvite") : t("copy")}
        </button>
        <ShareButtons
          links={shareLinks(t("shareText", { club: clubName }), url)}
          labels={{ x: t("shareX"), farcaster: t("shareFarcaster") }}
        />
      </div>
    </div>
  )
}
