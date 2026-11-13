"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import type { FollowListItem, FollowListKind } from "@/lib/follows"
import { FollowButton } from "./FollowButton"

/** Followers / Following page for a runner. */
export function FollowList({
  owner,
  kind,
  items,
  viewerSignedIn,
}: {
  owner: { name: string; username: string }
  kind: FollowListKind
  items: FollowListItem[]
  viewerSignedIn: boolean
}) {
  const t = useTranslations("followList")

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
      <Link
        href={`/u/${owner.username}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-green"
      >
        ← {owner.name} · @{owner.username}
      </Link>

      <nav className="flex gap-6 border-b border-line">
        {(["followers", "following"] as const).map((k) => (
          <Link
            key={k}
            href={`/u/${owner.username}/${k}`}
            aria-current={k === kind ? "page" : undefined}
            className={
              k === kind
                ? "-mb-px border-b-2 border-brand-green pb-3 text-sm font-semibold text-foreground"
                : "pb-3 text-sm font-medium text-muted hover:text-foreground"
            }
          >
            {t(k)}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="border border-dashed border-line bg-surface-alt/30 p-8 text-center text-sm text-muted">
          {t(kind === "followers" ? "emptyFollowers" : "emptyFollowing")}
        </p>
      ) : (
        <ul className="divide-y divide-line border border-line bg-surface-alt/40">
          {items.map((u) => (
            <li key={u.id} className="flex items-center gap-4 px-4 py-3">
              <Link href={`/u/${u.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
                  {u.image ? (
                    <Image src={u.image} alt="" fill sizes="44px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-bold text-brand-green">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-foreground">{u.name}</span>
                  <span className="block truncate text-xs text-muted">@{u.username}</span>
                </span>
              </Link>
              <FollowButton
                size="sm"
                username={u.username}
                initialFollowing={u.viewerFollows}
                viewer={u.isViewer ? "self" : viewerSignedIn ? "member" : "guest"}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
