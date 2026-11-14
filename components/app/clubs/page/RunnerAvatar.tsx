import Image from "next/image"
import Link from "next/link"
import type { ClubRunner } from "@/lib/club-page"

/** Round runner photo linking to their public profile. */
export function RunnerAvatar({ runner, size = 36 }: { runner: ClubRunner; size?: number }) {
  const body = (
    <span className="relative block overflow-hidden rounded-full bg-surface-alt ring-1 ring-line" style={{ width: size, height: size }}>
      {runner.image ? (
        <Image src={runner.image} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-brand-green">{runner.name.charAt(0).toUpperCase()}</span>
      )}
    </span>
  )
  return runner.username ? (
    <Link href={`/u/${runner.username}`} aria-label={runner.name} className="shrink-0">
      {body}
    </Link>
  ) : (
    <span className="shrink-0">{body}</span>
  )
}

export function RunnerName({ runner }: { runner: ClubRunner }) {
  return runner.username ? (
    <Link href={`/u/${runner.username}`} className="truncate text-sm font-semibold text-foreground hover:text-brand-green">
      @{runner.username}
    </Link>
  ) : (
    <span className="truncate text-sm font-semibold text-foreground">{runner.name}</span>
  )
}
