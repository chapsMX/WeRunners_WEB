import type { ReactNode } from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { isSuperadmin } from "@/lib/club-admin"
import { getAppTranslator } from "@/lib/app-i18n"
import { AdminTabs } from "@/components/app/admin/AdminTabs"

export const metadata: Metadata = { title: "Admin · We Runners", robots: { index: false, follow: false } }

// Superadmin only (User.role = ADMIN). Everyone else gets a 404.
// Tabs: Clubs · Waitlist · Activity (one route each).
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!(await isSuperadmin(session?.user.id))) notFound()
  const { t } = await getAppTranslator("clubAdmin")

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8 lg:px-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">{t("superadmin")}</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{t("panelTitle")}</h1>
      </header>
      <AdminTabs />
      {children}
    </div>
  )
}
