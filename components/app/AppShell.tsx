"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "./nav"
import { LogoutIcon, UserIcon } from "./icons"
import { LanguageToggle } from "./LanguageToggle"
import { ProfileStats, type ProfileStatsData } from "./ProfileStats"
import { AppTopbar } from "./AppTopbar"
import AppFooter from "@/components/layout/AppFooter"

type SidebarUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string | null
}

const STORAGE_KEY = "w3-sidebar-open"

function Avatar({
  user,
  size = 72,
}: {
  user: SidebarUser
  size?: number
}) {
  const name = user.name || user.email || "Runner"
  const initial = name.charAt(0).toUpperCase()
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-surface-alt ring-2 ring-line"
      style={{ width: size, height: size }}
    >
      {user.image ? (
        <Image src={user.image} alt={name} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-bold text-brand-green"
          style={{ fontSize: size * 0.4 }}
        >
          {initial}
        </span>
      )}
    </div>
  )
}

function SidebarContent({
  user,
  stats,
  onNavigate,
}: {
  user: SidebarUser
  stats: ProfileStatsData
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations("app")
  const [signingOut, setSigningOut] = useState(false)

  const name = user.name || user.email || "Runner"
  const profileHref = user.username ? `/u/${user.username}` : "/dashboard"
  const profileActive = pathname.startsWith("/u/")

  async function handleSignOut() {
    setSigningOut(true)
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  return (
    <div className="flex h-full flex-col px-4 py-5">
      {/* ── Header: We Runners + logotipo ── */}
      <div className="relative">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex flex-col items-center pt-1 text-center"
        >
          <span className="mt-1 text-2xl font-bold tracking-tight">
            <span className="text-brand-green">We </span>
            <span className="text-foreground">Runners</span>
          </span>
        </Link>
      </div>

      {/* ── Bloque de perfil ── */}
      <div className="mt-6 flex flex-col items-center border-b border-line pb-6">
        <Link href={profileHref} onClick={onNavigate} aria-label={name}>
          <Avatar user={user} />
        </Link>
        <Link
          href={profileHref}
          onClick={onNavigate}
          className="mt-3 max-w-full truncate text-center text-lg font-bold text-foreground hover:text-brand-green"
        >
          {name}
        </Link>
        {user.username && (
          <span className="text-xs text-muted">@{user.username}</span>
        )}
        <ProfileStats stats={stats} className="mt-4 w-full" />
      </div>

      {/* ── Navegación ── */}
      <nav className="mt-5 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const label = t(`nav.${item.key}`)
          return (
            <span
              key={item.href}
              aria-disabled
              className="flex cursor-not-allowed select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted/50"
            >
              <Icon size={20} className="shrink-0" />
              <span className="flex-1">{label}</span>
              <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted/70">
                {t("soon")}
              </span>
            </span>
          )
        })}

        {/* Profile → perfil público estático */}
        <Link
          href={profileHref}
          onClick={onNavigate}
          aria-current={profileActive ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            profileActive
              ? "bg-brand-green/10 text-brand-green"
              : "text-muted hover:bg-foreground/5 hover:text-foreground"
          )}
        >
          <UserIcon size={20} className="shrink-0" />
          <span className="flex-1">{t("nav.profile")}</span>
        </Link>
      </nav>

      {/* ── Footer ── */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
        <LanguageToggle />
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          title={t("signOut")}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-foreground/5 hover:text-brand-green disabled:opacity-50"
        >
          <LogoutIcon size={18} />
        </button>
      </div>
    </div>
  )
}

export function AppShell({
  user,
  stats,
  children,
}: {
  user: SidebarUser
  stats: ProfileStatsData
  children: ReactNode
}) {
  // SSR: abierto (desktop-first). En cliente ajustamos por viewport + preferencia.
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches
    if (!isDesktop) {
      setOpen(false) // móvil: arranca cerrado
      return
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    setOpen(saved === null ? true : saved === "1")
  }, [])

  function toggle(next: boolean) {
    setOpen(next)
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Backdrop (solo móvil, cuando está abierto) */}
      {open && (
        <div
          onClick={() => toggle(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-line bg-sidebar",
          mounted && "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          user={user}
          stats={stats}
          onNavigate={() => {
            // En móvil, navegar cierra el panel.
            if (window.matchMedia("(max-width: 1023px)").matches) toggle(false)
          }}
        />
      </aside>

      {/* Contenido */}
      <main
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
          open ? "lg:pl-72" : "lg:pl-0"
        )}
      >
        <AppTopbar onToggleSidebar={() => toggle(!open)} />
        <div className="flex-1">{children}</div>
        <AppFooter />
      </main>
    </div>
  )
}
