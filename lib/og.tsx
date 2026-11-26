/* eslint-disable @next/next/no-img-element -- Satori (next/og) renders plain <img>, next/image does not apply */
// Server-only: share images (Open Graph / X cards, 1200×630) generated with
// next/og. Used by the /api/og/* routes; each page points its metadata there.
// - Fonts: Space Grotesk (the site's font) from Google Fonts, cached per
//   instance; falls back to next/og's built-in font if the fetch fails.
// - Images: Satori can't read WebP, so local and remote images go through
//   sharp (Next's optional dependency) when it's available.
import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 }
const NAVY = "#11326e"
const GREEN = "#63f807"

// ── Fonts ───────────────────────────────────────────────────

type Font = { name: string; data: ArrayBuffer; weight: 500 | 700; style: "normal" }
let fontsPromise: Promise<Font[]> | null = null

async function fetchFont(weight: 500 | 700): Promise<ArrayBuffer> {
  // An old user agent makes the Google Fonts CSS API answer with TTF (Satori can't read WOFF2).
  const css = await fetch(`https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}`, {
    headers: { "User-Agent": "Mozilla/4.0" },
  }).then((r) => r.text())
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1]
  if (!url) throw new Error("font url not found")
  return fetch(url).then((r) => r.arrayBuffer())
}

export function loadFonts(): Promise<Font[]> {
  fontsPromise ??= Promise.all([fetchFont(500), fetchFont(700)])
    .then(([regular, bold]) => [
      { name: "Space Grotesk", data: regular, weight: 500 as const, style: "normal" as const },
      { name: "Space Grotesk", data: bold, weight: 700 as const, style: "normal" as const },
    ])
    .catch((e) => {
      console.error("[og] font load failed, using the default font:", e)
      fontsPromise = null // retry on the next image
      return []
    })
  return fontsPromise
}

// ── Images → data URIs ──────────────────────────────────────

type Sharp = typeof import("sharp")
let sharpPromise: Promise<Sharp | null> | null = null
function getSharp(): Promise<Sharp | null> {
  sharpPromise ??= import("sharp").then((m) => (m.default ?? m) as unknown as Sharp).catch(() => null)
  return sharpPromise
}

async function toDataUri(buffer: Buffer, contentType: string, resize?: { width: number; height: number }): Promise<string | null> {
  const sharp = await getSharp()
  if (sharp) {
    let img = sharp(buffer, { failOn: "none" }).rotate()
    if (resize) img = img.resize(resize.width, resize.height, { fit: "cover" })
    const out = await img.jpeg({ quality: 80 }).toBuffer()
    return `data:image/jpeg;base64,${out.toString("base64")}`
  }
  // No sharp: Satori reads PNG and JPEG as they are.
  if (!/image\/(png|jpe?g)/.test(contentType)) return null
  return `data:${contentType};base64,${buffer.toString("base64")}`
}

/** A file from /public (e.g. "/images/fondoClubes.jpg"), resized to the card. */
export async function localImage(publicPath: string, size: { width: number; height: number } = OG_SIZE): Promise<string | null> {
  try {
    const buffer = await readFile(path.join(process.cwd(), "public", publicPath))
    return await toDataUri(buffer, "image/jpeg", size)
  } catch (e) {
    console.error("[og] local image failed:", publicPath, e)
    return null
  }
}

/** A remote image (avatar, club banner/logo). null if it can't be loaded in time. */
export async function remoteImage(url: string | null | undefined, resize: { width: number; height: number }): Promise<string | null> {
  if (!url || !/^https:\/\//.test(url)) return null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    return await toDataUri(buffer, res.headers.get("content-type") ?? "", resize)
  } catch {
    return null
  }
}

// ── Building blocks ─────────────────────────────────────────

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 700, color: "white" }}>
      <div style={{ display: "flex", width: 14, height: 14, background: GREEN }} />
      We Runners
    </div>
  )
}

function Background({ src }: { src: string | null }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex" }}>
      {src && <img src={src} width={OG_SIZE.width} height={OG_SIZE.height} style={{ objectFit: "cover" }} alt="" />}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", background: "rgba(17,50,110,0.78)" }} />
    </div>
  )
}

function Frame({ bg, children, footer }: { bg: string | null; children: React.ReactNode; footer?: string }) {
  return (
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: NAVY, fontFamily: "Space Grotesk" }}>
      <Background src={bg} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 72px" }}>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>{children}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.7)" }}>{footer ?? "app.w3runn3rs.com"}</div>
          <Brand />
        </div>
      </div>
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: GREEN, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>
      {children}
    </div>
  )
}

function Initial({ name, size }: { name: string; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: size, background: "#081226", color: GREEN, fontSize: size * 0.42, fontWeight: 700, border: "4px solid rgba(255,255,255,0.85)" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  if (!src) return <Initial name={name} size={size} />
  return <img src={src} width={size} height={size} style={{ borderRadius: size, border: "4px solid rgba(255,255,255,0.85)", objectFit: "cover" }} alt="" />
}

// ── Cards ───────────────────────────────────────────────────

/** Hero-style card: background photo, eyebrow, two-tone headline, subtitle. */
export function HeroCard(props: { bg: string | null; eyebrow: string; titleA: string; titleB?: string; subtitle?: string; footer?: string; extra?: React.ReactNode }) {
  return (
    <Frame bg={props.bg} footer={props.footer}>
      <Eyebrow>{props.eyebrow}</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", fontSize: 84, fontWeight: 700, lineHeight: 1.05, color: "white" }}>
        <span style={{ marginRight: 22 }}>{props.titleA}</span>
        {props.titleB && <span style={{ color: GREEN }}>{props.titleB}</span>}
      </div>
      {props.subtitle && <div style={{ display: "flex", marginTop: 24, fontSize: 32, lineHeight: 1.35, color: "rgba(255,255,255,0.82)", maxWidth: 980 }}>{props.subtitle}</div>}
      {props.extra}
    </Frame>
  )
}

/** Runner profile: big round photo, name, @username, club, a stat line. */
export function ProfileCard(props: { bg: string | null; avatar: string | null; name: string; username: string; club: string | null; stat?: string | null }) {
  return (
    <Frame bg={props.bg} footer={`app.w3runn3rs.com/u/${props.username}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
        <Avatar src={props.avatar} name={props.name} size={240} />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.05, color: "white" }}>{props.name}</div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 36, color: "rgba(255,255,255,0.75)" }}>@{props.username}</div>
          {props.club && <div style={{ display: "flex", marginTop: 28, fontSize: 36, fontWeight: 700, color: GREEN }}>{props.club}</div>}
          {props.stat && <div style={{ display: "flex", marginTop: 8, fontSize: 30, color: "rgba(255,255,255,0.82)" }}>{props.stat}</div>}
        </div>
      </div>
    </Frame>
  )
}

/** Club: banner background, logo, name, place, a stat line. */
export function ClubCard(props: { bg: string | null; logo: string | null; name: string; place: string | null; stat?: string | null; slug: string }) {
  return (
    <Frame bg={props.bg} footer={`app.w3runn3rs.com/clubs/${props.slug}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
        <Avatar src={props.logo} name={props.name} size={200} />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.05, color: "white" }}>{props.name}</div>
          {props.place && <div style={{ display: "flex", marginTop: 10, fontSize: 34, color: "rgba(255,255,255,0.78)" }}>{props.place}</div>}
          {props.stat && <div style={{ display: "flex", marginTop: 26, fontSize: 34, fontWeight: 700, color: GREEN }}>{props.stat}</div>}
        </div>
      </div>
    </Frame>
  )
}

/** Render a card. Cached at the edge for an hour (crawlers fetch it once per share anyway). */
export async function ogResponse(
  card: React.ReactElement,
  opts: { size?: { width: number; height: number }; headers?: Record<string, string> } = {}
): Promise<ImageResponse> {
  const fonts = await loadFonts()
  return new ImageResponse(card, {
    ...(opts.size ?? OG_SIZE),
    fonts: fonts.length ? fonts : undefined,
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400", ...opts.headers },
  })
}

export function ogLang(value: string | null | undefined): "en" | "es" {
  return value === "es" ? "es" : "en"
}
