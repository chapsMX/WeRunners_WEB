"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { setFollow } from "@/app/(app)/u/[username]/actions"

/**
 * Follow / Following toggle for another runner's profile or a follow list.
 * viewer: "guest" → link to sign in; "self" → link to edit profile.
 */
export function FollowButton({
  username,
  initialFollowing,
  viewer,
  size = "md",
}: {
  username: string
  initialFollowing: boolean
  viewer: "member" | "guest" | "self"
  size?: "md" | "sm"
}) {
  const t = useTranslations("follow")
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState(false)

  const base = cn(
    "inline-flex items-center justify-center border font-semibold transition-colors disabled:opacity-60",
    size === "sm" ? "min-w-24 px-3 py-1.5 text-xs" : "min-w-32 px-5 py-2 text-sm"
  )
  const primary = "border-brand-green bg-brand-green text-brand-navy hover:bg-brand-green/90"
  const outline = "border-line text-foreground hover:border-red-500/60 hover:text-red-400"

  if (viewer === "guest") {
    return (
      <Link href="/auth/sign-in" className={cn(base, primary)}>
        {t("follow")}
      </Link>
    )
  }
  if (viewer === "self") {
    return size === "sm" ? null : (
      <Link href="/settings" className={cn(base, "border-line text-foreground hover:border-brand-green/50 hover:text-brand-green")}>
        {t("editProfile")}
      </Link>
    )
  }

  function toggle() {
    const next = !following
    setError(false)
    setFollowing(next) // optimistic
    startTransition(async () => {
      const result = await setFollow(username, next)
      if (!result.ok) {
        setFollowing(!next)
        setError(true)
      } else {
        router.refresh() // counts
      }
    })
  }

  return (
    <span className="inline-flex flex-col items-center">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={following}
        className={cn(base, "group", following ? outline : primary)}
      >
        {following ? (
          <>
            <span className="group-hover:hidden">{t("following")}</span>
            <span className="hidden group-hover:inline">{t("unfollow")}</span>
          </>
        ) : (
          t("follow")
        )}
      </button>
      {error && <span className="mt-1 text-xs text-red-400">{t("error")}</span>}
    </span>
  )
}
