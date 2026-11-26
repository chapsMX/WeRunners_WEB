import type { NextRequest } from "next/server"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import { prisma } from "@/lib/prisma"
import { HeroCard, localImage, ogLang, ogResponse } from "@/lib/og"

// Share image for /clubs (?lang=en|es): club photo, title, live club/runner count.
export async function GET(request: NextRequest) {
  const lang = ogLang(request.nextUrl.searchParams.get("lang"))
  const t = (lang === "es" ? es : en).clubDirectory.og
  const [bg, agg] = await Promise.all([
    localImage("/images/fondoClubes.jpg"),
    prisma.club.aggregate({ where: { active: true }, _count: true, _sum: { memberCount: true } }),
  ])
  const stat = t.stat
    .replace("{clubs}", agg._count.toLocaleString(lang))
    .replace("{runners}", (agg._sum.memberCount ?? 0).toLocaleString(lang))
  return ogResponse(<HeroCard bg={bg} eyebrow={t.eyebrow} titleA={t.title} subtitle={stat} footer="app.w3runn3rs.com/clubs" />)
}
