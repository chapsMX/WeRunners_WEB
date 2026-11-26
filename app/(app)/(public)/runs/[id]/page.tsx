/* eslint-disable @next/next/no-img-element -- the card is a generated PNG (/api/og/run/<id>), not an optimizable asset */
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAppTranslator } from "@/lib/app-i18n"
import { shareMetadata } from "@/lib/app-share-metadata"
import { getRunCardData, runStats } from "@/lib/run-card"
import { APP_URL, shareLinks } from "@/lib/share"
import { ShareButtons } from "@/components/app/ShareButtons"

type Params = { params: Promise<{ id: string }> }

const km = (m: number) => `${(m / 1000).toFixed(2)} km`

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const run = await getRunCardData(id)
  if (!run) return { title: "We Runners" }
  const title = `${km(run.distanceMeters)} · ${run.runner.name} · We Runners`
  const pace = runStats(run).find((s) => s.label === "Pace")?.value
  const description = `${run.runner.name} ran ${km(run.distanceMeters)}${pace && pace !== "—" ? ` at ${pace}` : ""}${run.club ? ` for ${run.club.name}` : ""} on We Runners.`
  return {
    title,
    description,
    robots: { index: false, follow: true }, // one page per run: shareable, not for search
    ...shareMetadata({ title, description, image: `/api/og/run/${run.id}` }),
  }
}

// One run's share card — public by link (the id is long and random).
export default async function RunPage({ params }: Params) {
  const { id } = await params
  const run = await getRunCardData(id)
  if (!run) notFound()
  const { t, locale } = await getAppTranslator("runPage")
  const dist = km(run.distanceMeters)
  const date = run.activityDate.toLocaleDateString(locale, { dateStyle: "long", timeZone: "UTC" })
  const button =
    "inline-flex items-center justify-center border px-4 py-2 text-sm font-semibold transition-colors"

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 text-foreground lg:px-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">{date}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{run.title || t("defaultTitle")}</h1>
        <p className="mt-2 text-sm text-muted">
          {run.runner.username ? (
            <Link href={`/u/${run.runner.username}`} className="font-semibold text-foreground hover:text-brand-green">
              {run.runner.name}
            </Link>
          ) : (
            <span className="font-semibold text-foreground">{run.runner.name}</span>
          )}
          {run.club && (
            <>
              {" · "}
              <Link href={`/clubs/${run.club.slug}`} className="hover:text-brand-green">
                {run.club.name}
              </Link>
            </>
          )}
        </p>
      </header>

      <img
        src={`/api/og/run/${run.id}`}
        alt={t("cardAlt", { dist })}
        width={1200}
        height={630}
        className="block h-auto w-full border border-line bg-surface-alt"
      />

      <div className="flex flex-wrap items-center gap-3">
        <a href={`/api/og/run/${run.id}?download=1`} className={`${button} border-brand-green bg-brand-green text-brand-navy hover:bg-brand-green/90`}>
          {t("download")}
        </a>
        <a href={`/api/og/run/${run.id}/story?download=1`} className={`${button} border-brand-green text-brand-green hover:bg-brand-green hover:text-brand-navy`}>
          {t("downloadStory")}
        </a>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-xs font-medium text-muted">{t("share")}</span>
          <ShareButtons
            links={shareLinks(
              run.club ? t("shareText", { dist, club: run.club.name }) : t("shareTextNoClub", { dist }),
              `${APP_URL}/runs/${run.id}`
            )}
            labels={{ x: t("shareX"), farcaster: t("shareFarcaster") }}
          />
        </span>
      </div>
      {!run.route && <p className="text-xs text-muted">{t("noRoute")}</p>}
    </div>
  )
}
