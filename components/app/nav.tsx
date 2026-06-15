import type { ComponentType } from "react"
import {
  ActivityIcon,
  ClubIcon,
  HomeIcon,
  SettingsIcon,
  TrophyIcon,
  UserIcon,
} from "./icons"

export type NavItem = {
  /** Clave dentro del namespace "app.nav" para traducir el label. */
  key: "home" | "activities" | "club" | "leaderboard" | "profile" | "settings"
  href: string
  icon: ComponentType<{ size?: number; className?: string }>
  /** true mientras la pantalla no exista todavía (muestra badge "Pronto", no navega). */
  soon?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", href: "/dashboard", icon: HomeIcon },
  { key: "activities", href: "/activities", icon: ActivityIcon, soon: true },
  { key: "club", href: "/clubs", icon: ClubIcon, soon: true },
  { key: "leaderboard", href: "/leaderboard", icon: TrophyIcon, soon: true },
  { key: "profile", href: "/profile", icon: UserIcon, soon: true },
  { key: "settings", href: "/settings", icon: SettingsIcon, soon: true },
]
