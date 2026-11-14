import type { ComponentType } from "react"
import { ClubIcon, HomeIcon, SettingsIcon } from "./icons"

export type NavItem = {
  /** Clave dentro del namespace "app.nav" para traducir el label. */
  key: "dashboard" | "clubs" | "activities" | "leaderboard" | "settings"
  href: string
  icon: ComponentType<{ size?: number; className?: string }>
  /** true mientras la pantalla no exista todavía (muestra badge "Pronto", no navega). */
  soon?: boolean
}

// Profile se renderiza aparte en el AppShell porque su href es dinámico
// (/u/[username] — perfil público). Activities / Leaderboard vuelven aquí
// cuando existan sus pantallas (soon: true muestra el badge "Soon").
export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: HomeIcon },
  { key: "clubs", href: "/clubs", icon: ClubIcon },
  { key: "settings", href: "/settings", icon: SettingsIcon },
]
