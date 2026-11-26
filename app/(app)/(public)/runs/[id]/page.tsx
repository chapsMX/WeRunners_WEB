import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { getRunCardData } from "@/lib/run-card"
import { RunCardPage, runMetadata } from "@/components/app/runs/RunCardPage"

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const run = await getRunCardData({ id: (await params).id })
  return run ? runMetadata(run) : { title: "We Runners" }
}

// Long link (internal id): runs with a short code move to /r/<code>, so links
// shared before short codes keep working.
export default async function RunByIdPage({ params }: Params) {
  const run = await getRunCardData({ id: (await params).id })
  if (!run) notFound()
  if (run.shortId) permanentRedirect(`/r/${run.shortId}`)
  return <RunCardPage run={run} />
}
