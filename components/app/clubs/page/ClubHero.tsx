"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import type { ClubPageData } from "@/lib/club-page"
import type { getClubViewerState } from "@/lib/club-page"
import { countryName } from "@/lib/countries"
import { clubSocialHref, type ClubSocialNetwork } from "@/lib/club-socials"
import { FacebookIcon, InstagramIcon, TikTokIcon, XIcon } from "@/components/ui/SocialIcons"
import { ClubJoinButton } from "./ClubJoinButton"
import { WorldRankBadge } from "../../leaderboard/WorldRankBadge"
import type { ClubWorldRank } from "@/lib/leaderboard"

type Viewer = Awaited<ReturnType<typeof getClubViewerState>>

const SOCIAL_ICON: Record<ClubSocialNetwork, typeof XIcon> = {
  instagram: InstagramIcon,
  x: XIcon,
  tiktok: TikTokIcon,
  facebook: FacebookIcon,
}

/** "https://www.club.com/" → "club.com" for display. */
function websiteLabel(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname === "/" ? "" : u.pathname
    return (u.hostname.replace(/^www\./, "") + path).slice(0, 60)
  } catch {
    return url
  }
}

/** Club banner + logo, name, members (4 faces), description, website, socials and the join action. */
export function ClubHero({
  club,
  faces,
  viewer,
  worldRank,
}: {
  club: ClubPageData["club"]
  faces: ClubPageData["faces"]
  viewer: Viewer
  /** The club on the global leaderboard this month (null if inactive). */
  worldRank: ClubWorldRank | null
}) {
  const t = useTranslations("clubPage")
  const locale = useLocale()
  const place = [club.city, countryName(club.country, locale)].filter(Boolean).join(" · ")
  const socials = (
    [
      ["instagram", club.socials.instagram],
      ["x", club.socials.twitter],
      ["tiktok", club.socials.tiktok],
      ["facebook", club.socials.facebook],
    ] as const
  )
    .map(([network, value]) => ({ network, href: clubSocialHref(network, value) }))
    .filter((s): s is { network: ClubSocialNetwork; href: string } => s.href !== null)

  return (
    <section>
      {/* Banner */}
      <div className="relative h-44 overflow-hidden bg-brand-navy sm:h-60">
        <Image src={club.bannerUrl ?? "/images/fondoHero.webp"} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        {!club.bannerUrl && <div className="absolute inset-0 bg-brand-navy/70" />}
      </div>

      <div className="px-6 lg:px-8">
        {/* Logo overlapping the banner + actions */}
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-16">
          <span className="relative h-24 w-24 overflow-hidden border-4 border-background bg-surface-alt sm:h-32 sm:w-32">
            {club.logoUrl ? (
              <Image src={club.logoUrl} alt={club.name} fill sizes="128px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-extrabold text-brand-green">
                {club.name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {viewer.signedIn && viewer.canManage && (
              <Link
                href={`/clubs/${club.slug}/manage`}
                className="border border-line px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand-green hover:text-brand-green"
              >
                {t("manage")}
              </Link>
            )}
            <ClubJoinButton clubId={club.id} requiresApproval={club.requiresApproval} viewer={viewer} />
          </div>
        </div>

        {/* Name, place, members */}
        <h1 className="mt-4 flex flex-wrap items-center gap-3 text-3xl font-extrabold leading-tight sm:text-4xl">
          {club.name}
          {club.requiresApproval && (
            <span title={t("approvalHint")} className="border border-line px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
              🔒 {t("approval")}
            </span>
          )}
        </h1>
        {place && <p className="mt-1 text-sm text-muted">{place}</p>}
        {worldRank && (
          <div className="mt-3">
            <WorldRankBadge worldRank={worldRank} />
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          {faces.length > 0 && (
            <div className="flex -space-x-2">
              {faces.map((f) => {
                const face = (
                  <span className="relative block h-9 w-9 overflow-hidden rounded-full bg-surface-alt ring-2 ring-background">
                    {f.image ? (
                      <Image src={f.image} alt={f.name} fill sizes="36px" className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-green">{f.name.charAt(0).toUpperCase()}</span>
                    )}
                  </span>
                )
                return f.username ? (
                  <Link key={f.id} href={`/u/${f.username}`} title={f.name}>
                    {face}
                  </Link>
                ) : (
                  <span key={f.id}>{face}</span>
                )
              })}
            </div>
          )}
          <span className="text-sm font-semibold text-foreground">{t("members", { count: club.memberCount })}</span>
        </div>

        {club.description && <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground/90">{club.description}</p>}

        {club.website && (
          <a
            href={club.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-green hover:underline"
          >
            {websiteLabel(club.website)} ↗
          </a>
        )}

        {socials.length > 0 && (
          <ul className="mt-4 flex items-center gap-2">
            {socials.map(({ network, href }) => {
              const Icon = SOCIAL_ICON[network]
              return (
                <li key={network}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={network}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-brand-green/50 hover:text-brand-green"
                  >
                    <Icon size={18} />
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
