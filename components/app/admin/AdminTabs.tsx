"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

const TABS = [
  { key: "clubs", href: "/admin/clubs" },
  { key: "waitlist", href: "/admin/waitlist" },
  { key: "activity", href: "/admin/activity" },
] as const

/** Superadmin panel tabs: Clubs | Waitlist | Activity. */
export function AdminTabs() {
  const t = useTranslations("clubAdmin.tabs")
  const pathname = usePathname()
  return (
    <nav className="flex gap-6 border-b border-line" aria-label="Admin">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "-mb-px border-b-2 border-brand-green pb-3 text-sm font-semibold text-foreground"
                : "pb-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
            }
          >
            {t(tab.key)}
          </Link>
        )
      })}
    </nav>
  )
}
