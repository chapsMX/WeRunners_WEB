import type { ReactNode } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getShellProps } from "@/lib/app-shell"
import { AppShell } from "@/components/app/AppShell"
import { PublicProfileHeader } from "@/components/app/profile/PublicProfileHeader"

// Public profiles (/u/…) are shareable without an account. Signed-in runners
// see them inside the app (sidebar + topbar); guests get a simple header.
export default async function PublicProfileLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  const shell = session ? await getShellProps(session.user) : null

  if (shell) return <AppShell {...shell}>{children}</AppShell>

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicProfileHeader />
      {children}
    </div>
  )
}
