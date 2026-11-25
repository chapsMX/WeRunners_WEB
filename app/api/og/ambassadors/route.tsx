import type { NextRequest } from "next/server"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import { HeroCard, localImage, ogLang, ogResponse } from "@/lib/og"

// Share image for /ambassadors (?lang=en|es): the landing's hero photo + headline.
export async function GET(request: NextRequest) {
  const lang = ogLang(request.nextUrl.searchParams.get("lang"))
  const t = (lang === "es" ? es : en).ambassadors
  const bg = await localImage("/images/fondoClubes.jpg")
  return ogResponse(
    <HeroCard
      bg={bg}
      eyebrow={t.og.eyebrow}
      titleA={t.hero.titleA}
      titleB={t.hero.titleB}
      footer={`w3runn3rs.com/${lang}/ambassadors`}
    />
  )
}
