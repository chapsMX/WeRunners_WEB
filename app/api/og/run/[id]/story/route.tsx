import type { NextRequest } from "next/server"
import { localImage, ogResponse } from "@/lib/og"
import { getRunCardData, pickPhoto, RunCard, STORY_SIZE } from "@/lib/run-card"

type Params = { params: Promise<{ id: string }> }

// Run share card, story 1080×1920 (Instagram). ?download=1 → attachment.
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  const run = await getRunCardData(id)
  if (!run) return new Response("Not found", { status: 404 })
  const photo = pickPhoto(run.id, "story")
  const bg = await localImage(photo.path, STORY_SIZE)
  const download = request.nextUrl.searchParams.has("download")
  return ogResponse(<RunCard run={run} bg={bg} side={photo.side} format="story" />, {
    size: STORY_SIZE,
    headers: download ? { "Content-Disposition": `attachment; filename="we-runners-run-${run.id}-story.png"` } : {},
  })
}
