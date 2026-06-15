"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "./nav"
import { LogoutIcon } from "./icons"
import { LanguageToggle } from "./LanguageToggle"

type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold tracking-tight text-xl", className)}>
      <span className="text-brand-green">W3</span>
      <span className="text-foreground">RUNN3RS</span>
    </span>
  )
}

function NavLinks({ variant = "sidebar" }: { variant?: "sidebar" | "bar" }) {
  const pathname = usePathname()
  const t = useTranslations("app")
  const bar = variant === "bar"
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/")
        const Icon = item.icon
        const label = t(`nav.${item.key}`)

        if (item.soon) {
          return (
            <span
              key={item.href}
              aria-disabled
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted/50 cursor-not-allowed select-none",
                bar && "shrink-0 whitespace-nowrap py-2"
              )}
            >
              <Icon size={20} className="shrink-0" />
              <span className={cn(!bar && "flex-1")}>{label}</span>
              {!bar && (
                <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted/70">
                  {t("soon")}
                </span>
              )}
            </span>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              bar && "shrink-0 whitespace-nowrap py-2",
              active
                ? "bg-brand-green/10 text-brand-green"
                : "text-muted hover:bg-surface-alt hover:text-foreground"
            )}
          >
            <Icon size={20} className="shrink-0" />
            <span className={cn(!bar && "flex-1")}>{label}</span>
            {active && !bar && <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />}
          </Link>
        )
      })}
    </>
  )
}

function UserBlock({ user, compact }: { user: SessionUser; compact?: boolean }) {
  const router = useRouter()
  const t = useTranslations("app")
  const [signingOut, setSigningOut] = useState(false)
  const name = user.name || user.email || "Runner"
  const initial = name.charAt(0).toUpperCase()

  async function handleSignOut() {
    setSigningOut(true)
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  return (
    <div className={cn("flex items-center gap-3", compact ? "" : "w-full")}>
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-alt ring-1 ring-line">
        {user.image ? (
          <Image src={user.image} alt={name} fill sizes="36px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-green">
            {initial}
          </span>
        )}
      </div>
      {!compact && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
      )}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        title={t("signOut")}
        aria-label={t("signOut")}
        className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-alt hover:text-brand-green disabled:opacity-50"
      >
        <LogoutIcon size={18} />
      </button>
    </div>
  )
}

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sidebar fijo (lg+) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface-alt/40 px-4 py-6 lg:flex">
        <Link href="/dashboard" className="px-2">
          <Wordmark />
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          <NavLinks />
        </nav>
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <div className="flex justify-end px-1">
            <LanguageToggle />
          </div>
          <UserBlock user={user} />
        </div>
      </aside>

      {/* ── Top bar móvil (< lg) ── */}
      <header className="sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <UserBlock user={user} compact />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <NavLinks variant="bar" />
        </nav>
      </header>

      {/* ── Contenido ── */}
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
