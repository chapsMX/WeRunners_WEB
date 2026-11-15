"use client"

import { cn } from "@/lib/utils"
import { FarcasterIcon, XIcon } from "@/components/ui/SocialIcons"

/** X + Farcaster share buttons. `tone="light"` for use over images (banner). */
export function ShareButtons({
  links,
  labels,
  tone = "default",
}: {
  links: { x: string; farcaster: string }
  labels: { x: string; farcaster: string }
  tone?: "default" | "light"
}) {
  const cls = cn(
    "flex h-8 w-8 shrink-0 items-center justify-center border transition-colors",
    tone === "light"
      ? "border-white/25 bg-black/30 text-white backdrop-blur-sm hover:border-brand-green hover:text-brand-green"
      : "border-line text-muted hover:border-brand-green hover:text-brand-green"
  )
  return (
    <span className="flex shrink-0 gap-1.5">
      <a href={links.x} target="_blank" rel="noopener noreferrer" aria-label={labels.x} title={labels.x} className={cls}>
        <XIcon size={14} />
      </a>
      <a href={links.farcaster} target="_blank" rel="noopener noreferrer" aria-label={labels.farcaster} title={labels.farcaster} className={cls}>
        <FarcasterIcon size={14} />
      </a>
    </span>
  )
}
