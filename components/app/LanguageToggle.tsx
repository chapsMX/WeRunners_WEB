"use client"

import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

const LOCALES = ["en", "es"] as const

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function setLocale(next: string) {
    if (next === locale) return
    // Cookie leída por getAppLocale() en el servidor (1 año).
    document.cookie = `app-locale=${next}; path=/; max-age=31536000; samesite=lax`
    startTransition(() => router.refresh())
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-lg border border-line p-0.5"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          disabled={pending}
          aria-pressed={locale === l}
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-semibold uppercase transition-colors disabled:opacity-60",
            locale === l
              ? "bg-brand-green/15 text-brand-green"
              : "text-muted hover:text-foreground"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
