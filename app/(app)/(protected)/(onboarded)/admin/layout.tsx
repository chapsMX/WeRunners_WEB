import type { ReactNode } from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { isSuperadmin } from "@/lib/club-admin"

export const metadata: Metadata = { robots: { index: false, follow: false } }

// Superadmin only (User.role = ADMIN). Everyone else gets a 404.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!(await isSuperadmin(session?.user.id))) notFound()
  return <>{children}</>
}
