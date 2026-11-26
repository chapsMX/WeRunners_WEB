// Route shapes for share cards (ActivityRoute). We never keep real
// coordinates: GPS points are projected, simplified and normalized into an SVG
// path inside a box whose longest side is ROUTE_BOX. The shape is drawn over a
// photo, with no map, street or area, so the full track is kept (no trimming).
import type { ActivitySource, Prisma } from "@prisma/client"

type Tx = Prisma.TransactionClient

export const ROUTE_BOX = 1000
const MAX_POINTS = 200
const MIN_EXTENT_METERS = 50

export type LatLon = { lat: number; lon: number }
export type RouteShape = { path: string; width: number; height: number; pointCount: number }

const EARTH_M = 6_371_000
const rad = (d: number) => (d * Math.PI) / 180

function valid(p: LatLon): boolean {
  return (
    Number.isFinite(p.lat) && Number.isFinite(p.lon) &&
    Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180 &&
    !(p.lat === 0 && p.lon === 0) // "no fix" samples
  )
}

type XY = [number, number]

function perpendicular(p: XY, a: XY, b: XY): number {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const len = dx * dx + dy * dy
  if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1])
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

/** Douglas–Peucker (iterative). */
export function simplify(points: XY[], tolerance: number): XY[] {
  if (points.length <= 2) return points
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack: [number, number][] = [[0, points.length - 1]]
  while (stack.length) {
    const [s, e] = stack.pop()!
    let max = 0, idx = -1
    for (let i = s + 1; i < e; i++) {
      const d = perpendicular(points[i], points[s], points[e])
      if (d > max) { max = d; idx = i }
    }
    if (idx >= 0 && max > tolerance) {
      keep[idx] = 1
      stack.push([s, idx], [idx, e])
    }
  }
  return points.filter((_, i) => keep[i])
}

/**
 * GPS track → normalized shape, or null if there's no usable route (treadmill,
 * no GPS, or everything within a few meters).
 */
export function buildRouteShape(raw: LatLon[], opts: { maxPoints?: number } = {}): RouteShape | null {
  const points = raw.filter(valid)
  if (points.length < 2) return null

  // Local equirectangular projection in meters (fine at running scale).
  const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length
  const kx = rad(1) * EARTH_M * Math.cos(rad(lat0))
  const ky = rad(1) * EARTH_M
  const xy: XY[] = points.map((p) => [p.lon * kx, -p.lat * ky])
  const xs = xy.map((p) => p[0]), ys = xy.map((p) => p[1])
  const minX = Math.min(...xs), minY = Math.min(...ys)
  const spanX = Math.max(...xs) - minX, spanY = Math.max(...ys) - minY
  const span = Math.max(spanX, spanY)
  if (span < MIN_EXTENT_METERS) return null

  // Simplify: start fine and coarsen until it fits MAX_POINTS.
  const maxPoints = opts.maxPoints ?? MAX_POINTS
  let tolerance = span * 0.001
  let simple = simplify(xy, tolerance)
  while (simple.length > maxPoints) {
    tolerance *= 1.5
    simple = simplify(xy, tolerance)
  }

  const scale = ROUTE_BOX / span
  const width = Math.max(1, Math.round(spanX * scale))
  const height = Math.max(1, Math.round(spanY * scale))
  const coords = simple.map(([x, y]) => [Math.round((x - minX) * scale), Math.round((y - minY) * scale)])
  const deduped = coords.filter((c, i) => i === 0 || c[0] !== coords[i - 1][0] || c[1] !== coords[i - 1][1])
  if (deduped.length < 2) return null
  const path = deduped.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join("")
  return { path, width, height, pointCount: deduped.length }
}

/** GPX (Polar exports) → points. Only trkpt lat/lon are read. */
export function parseGpxPoints(gpx: string): LatLon[] {
  const out: LatLon[] = []
  const re = /<trkpt\b([^>]*)>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(gpx))) {
    const lat = Number(/\blat="([^"]+)"/.exec(m[1])?.[1])
    const lon = Number(/\blon="([^"]+)"/.exec(m[1])?.[1])
    if (Number.isFinite(lat) && Number.isFinite(lon)) out.push({ lat, lon })
  }
  return out
}

export async function saveActivityRoute(tx: Tx, activityId: string, source: ActivitySource, shape: RouteShape): Promise<void> {
  const data = { source, path: shape.path, width: shape.width, height: shape.height, pointCount: shape.pointCount }
  await tx.activityRoute.upsert({ where: { activityId }, create: { activityId, ...data }, update: data })
}
