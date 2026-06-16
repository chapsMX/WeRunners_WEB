"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { MenuIcon } from "./icons"
import { LanguageToggle } from "./LanguageToggle"

function SunIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

/** Header de la columna de contenido: hamburguesa (sidebar) + logotipo + idioma + tema. */
export function AppTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const t = useTranslations("app")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-brand-navy text-white">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Izquierda: hamburguesa + logotipo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label={t("expand")}
            title={t("expand")}
            className="rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-brand-green"
          >
            <MenuIcon size={22} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Image
              src="/images/logoAzul.png"
              alt="w3runn3rs"
              width={980}
              height={656}
              className="h-9 w-auto opacity-90 transition-opacity group-hover:opacity-100"
              priority
            />
            <span className="text-xl font-bold tracking-tight text-white">We Runners</span>
          </Link>
        </div>

        {/* Derecha: idioma + tema */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
