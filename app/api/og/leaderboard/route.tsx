import type { NextRequest } from "next/server"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import { getClubLeaderboard } from "@/lib/leaderboard"
import { HeroCard, localImage, ogLang, ogResponse } from "@/lib/og"

// Share image for /leaderboard (?lang=en|es): hero photo, title and this month's top 3.
export async function GET(request: NextRequest) {
  const lang = ogLang(request.nextUrl.searchParams.get("lang"))
  const t = (lang === "es" ? es : en).leaderboard
  const [bg, board] = await Promise.all([localImage("/images/fondoHero.jpg"), getClubLeaderboard("month")])
  const top = board.rows.filter((r) => r.rank != null).slice(0, 3)
  const km = (m: number) => `${Math.round(m / 1000).toLocaleString(lang)} km`

  return ogResponse(
    <HeroCard
      bg={bg}
      eyebrow={t.og.eyebrow}
      titleA={t.title}
      subtitle={top.length ? undefined : `${t.og.subtitle} ${t.og.empty}`}
      footer="app.w3runn3rs.com/leaderboard"
      extra={
        top.length ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 30, gap: 10 }}>
            <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 2 }}>{t.og.top}</div>
            {top.map((r) => (
              <div key={r.club.id} style={{ display: "flex", alignItems: "center", fontSize: 36, color: "white" }}>
                <span style={{ display: "flex", width: 64, color: "#63f807", fontWeight: 700 }}>#{r.rank}</span>
                <span style={{ display: "flex", flexGrow: 1, fontWeight: 700 }}>{r.club.name}</span>
                <span style={{ display: "flex", color: "rgba(255,255,255,0.85)" }}>{km(r.distanceMeters)}</span>
              </div>
            ))}
          </div>
        ) : undefined
      }
    />
  )
}
