import type { ComponentType } from "react"
import { ActivityIcon, SettingsIcon, TrophyIcon } from "./icons"

export type NavItem = {
  /** Clave dentro del namespace "app.nav" para traducir el label. */
  key: "activities" | "leaderboard" | "settings"
  href: string
  icon: ComponentType<{ size?: number; className?: string }>
  /** true mientras la pantalla no exista todavía (muestra badge "Pronto", no navega). */
  soon?: boolean
}

// Profile se renderiza aparte en el AppShell porque su href es dinámico
// (/u/[username] — perfil público). My club vive en la columna de contenido.
export const NAV_ITEMS: NavItem[] = [
  { key: "activities", href: "/activities", icon: ActivityIcon, soon: true },
  { key: "leaderboard", href: "/leaderboard", icon: TrophyIcon, soon: true },
  { key: "settings", href: "/settings", icon: SettingsIcon },
]
