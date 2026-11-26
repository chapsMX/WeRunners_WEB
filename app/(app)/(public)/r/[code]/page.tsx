import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRunCardData } from "@/lib/run-card"
import { SHORT_ID_RE } from "@/lib/short-id"
import { RunCardPage, runMetadata } from "@/components/app/runs/RunCardPage"

type Params = { params: Promise<{ code: string }> }

async function load(code: string) {
  return SHORT_ID_RE.test(code) ? getRunCardData({ shortId: code }) : null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const run = await load((await params).code)
  return run ? runMetadata(run) : { title: "We Runners" }
}

// Short share link of a run: app.w3runn3rs.com/r/<code>.
export default async function RunByCodePage({ params }: Params) {
  const run = await load((await params).code)
  if (!run) notFound()
  return <RunCardPage run={run} />
}
