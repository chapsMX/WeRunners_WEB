import type { NextRequest } from "next/server"
import { localImage, ogResponse } from "@/lib/og"
import { getRunCardData, pickPhoto, RunCard } from "@/lib/run-card"

type Params = { params: Promise<{ id: string }> }

// Run share card, landscape 1200×630 (link previews). ?download=1 → attachment.
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  const run = await getRunCardData(id)
  if (!run) return new Response("Not found", { status: 404 })
  const photo = pickPhoto(run.id, "landscape")
  const bg = await localImage(photo.path)
  const download = request.nextUrl.searchParams.has("download")
  return ogResponse(<RunCard run={run} bg={bg} side={photo.side} format="landscape" />, {
    headers: download ? { "Content-Disposition": `attachment; filename="we-runners-run-${run.id}.png"` } : {},
  })
}
