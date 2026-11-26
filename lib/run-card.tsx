/* eslint-disable @next/next/no-img-element -- Satori (next/og) renders plain <img>, next/image does not apply */
// Server-only: the run share card — a background photo with the run's route
// (ActivityRoute shape) drawn on top and its stats. Two formats:
// - landscape 1200×630: link previews (X, Farcaster, WhatsApp) and download;
// - story 1080×1920: download for Instagram stories.
// Photos live in public/images/run-cards: left_* keep the content on the
// left, right_* and vert_* on the right (the sticker sits on the other side).
import { prisma } from "@/lib/prisma"

export const STORY_SIZE = { width: 1080, height: 1920 }
const ORANGE = "#ff6a13"

type Side = "left" | "right"
type Photo = { file: string; side: Side }

const LANDSCAPE: Photo[] = [
  { file: "left_01.jpg", side: "left" },
  { file: "left_02.jpg", side: "left" },
  { file: "right_01.jpg", side: "right" },
  { file: "right_02.jpg", side: "right" },
  { file: "right_03.jpg", side: "right" },
  { file: "right_04.jpg", side: "right" },
]
const STORY: Photo[] = [
  { file: "vert_01.jpg", side: "right" },
  { file: "vert_02.jpg", side: "right" },
  { file: "vert_03.jpg", side: "right" },
  { file: "vert_04.jpg", side: "right" },
]

/** Same run → same photo (stable across shares). */
export function pickPhoto(activityId: string, format: "landscape" | "story"): Photo & { path: string } {
  const set = format === "story" ? STORY : LANDSCAPE
  let h = 0
  for (const c of activityId) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const photo = set[h % set.length]
  return { ...photo, path: `/images/run-cards/${photo.file}` }
}

export type RunCardData = {
  id: string
  title: string | null
  distanceMeters: number
  durationSeconds: number
  avgPaceSecPerKm: number | null
  elevationGainMeters: number | null
  activityDate: Date
  runner: { name: string; username: string | null }
  club: { name: string; slug: string } | null
  route: { path: string; width: number; height: number } | null
}

export async function getRunCardData(id: string): Promise<RunCardData | null> {
  const a = await prisma.activity.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      distanceMeters: true,
      durationSeconds: true,
      avgPaceSecPerKm: true,
      elevationGainMeters: true,
      activityDate: true,
      user: { select: { name: true, username: true } },
      club: { select: { name: true, slug: true } },
      route: { select: { path: true, width: true, height: true } },
    },
  })
  if (!a) return null
  return {
    id: a.id,
    title: a.title,
    distanceMeters: a.distanceMeters,
    durationSeconds: a.durationSeconds,
    avgPaceSecPerKm: a.avgPaceSecPerKm,
    elevationGainMeters: a.elevationGainMeters,
    activityDate: a.activityDate,
    runner: { name: a.user.name || "Runner", username: a.user.username },
    club: a.club,
    route: a.route,
  }
}

// ── Stats ───────────────────────────────────────────────────

export function runStats(run: RunCardData): { label: string; value: string }[] {
  const pace = run.avgPaceSecPerKm ?? (run.distanceMeters > 0 ? Math.round(run.durationSeconds / (run.distanceMeters / 1000)) : null)
  const h = Math.floor(run.durationSeconds / 3600)
  const m = Math.floor((run.durationSeconds % 3600) / 60)
  const s = run.durationSeconds % 60
  const time = h > 0 ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, "0")}s`
  const rows = [
    { label: "Distance", value: `${(run.distanceMeters / 1000).toFixed(2)} km` },
    { label: "Pace", value: pace ? `${Math.floor(pace / 60)}:${String(pace % 60).padStart(2, "0")} /km` : "—" },
    { label: "Time", value: time },
  ]
  if (run.elevationGainMeters && run.elevationGainMeters > 0) rows.push({ label: "Elev Gain", value: `${run.elevationGainMeters} m` })
  return rows
}

// ── Card ────────────────────────────────────────────────────

const DOTS = " . ".repeat(80)
const shadow = "0 2px 12px rgba(0,0,0,0.55)"

function Route({ route, maxWidth, maxHeight, strokePx }: { route: NonNullable<RunCardData["route"]>; maxWidth: number; maxHeight: number; strokePx: number }) {
  const scale = Math.min(maxWidth / route.width, maxHeight / route.height)
  const width = Math.round(route.width * scale)
  const height = Math.round(route.height * scale)
  // Same on-screen stroke whatever the box scale; padding keeps round caps inside.
  const stroke = strokePx / scale
  const pad = stroke
  return (
    <svg width={width} height={height} viewBox={`${-pad} ${-pad} ${route.width + pad * 2} ${route.height + pad * 2}`}>
      <path d={route.path} fill="none" stroke={ORANGE} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Stat({ label, value, size }: { label: string; value: string; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", width: "100%", fontSize: size, color: "white", textShadow: shadow }}>
      <span style={{ display: "flex", flexShrink: 0 }}>{label}</span>
      <span style={{ display: "flex", flexGrow: 1, overflow: "hidden", whiteSpace: "nowrap", margin: `0 ${Math.round(size * 0.5)}px 0 ${Math.round(size * 0.3)}px`, opacity: 0.85 }}>{DOTS}</span>
      <span style={{ display: "flex", flexShrink: 0 }}>{value}</span>
    </div>
  )
}

/**
 * The card. `bg` is the photo as a data URI; the content column sits on
 * `side`, over a soft gradient so the text reads on any photo.
 */
export function RunCard({ run, bg, side, format }: { run: RunCardData; bg: string | null; side: Side; format: "landscape" | "story" }) {
  const story = format === "story"
  const W = story ? STORY_SIZE.width : 1200
  const H = story ? STORY_SIZE.height : 630
  // Story photos keep the sticker on the left ~half: the column stays right of it.
  const colWidth = story ? 440 : 560
  const pad = story ? 56 : 48
  const stats = runStats(run)
  const footer = [run.runner.username ? `@${run.runner.username}` : run.runner.name, run.club?.name].filter(Boolean).join(" · ")
  const gradient = `linear-gradient(${side === "left" ? "90deg" : "270deg"}, rgba(8,18,38,0.62) 0%, rgba(8,18,38,0.35) 55%, rgba(8,18,38,0) 100%)`

  return (
    <div style={{ position: "relative", display: "flex", width: W, height: H, background: "#11326e", fontFamily: "Space Grotesk" }}>
      {bg && <img src={bg} width={W} height={H} style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }} alt="" />}
      <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", backgroundImage: gradient }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          [side]: 0,
          width: colWidth + pad * 2,
          height: H,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: pad,
        }}
      >
        <div style={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "center", paddingBottom: story ? 40 : 16 }}>
          {run.route ? (
            <Route route={run.route} maxWidth={colWidth} maxHeight={story ? 820 : 330} strokePx={story ? 11 : 7} />
          ) : (
            <div style={{ display: "flex", fontSize: story ? 96 : 76, fontWeight: 700, color: ORANGE, textShadow: shadow }}>
              {(run.distanceMeters / 1000).toFixed(2)} km
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: story ? 14 : 4 }}>
          {stats.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} size={story ? 38 : 28} />
          ))}
          <div
            style={{
              display: "flex",
              flexDirection: story ? "column" : "row",
              alignItems: story ? "flex-start" : "center",
              justifyContent: "space-between",
              gap: story ? 14 : 0,
              marginTop: story ? 40 : 18,
              fontSize: story ? 28 : 20,
              color: "rgba(255,255,255,0.9)",
              textShadow: shadow,
            }}
          >
            <span style={{ display: "flex" }}>{footer}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "white" }}>
              <span style={{ display: "flex", width: story ? 16 : 11, height: story ? 16 : 11, background: "#63f807" }} />
              We Runners
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
