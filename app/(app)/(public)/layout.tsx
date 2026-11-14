import type { ReactNode } from "react"
import { PublicOrAppShell } from "@/components/app/PublicOrAppShell"

// Public club pages (/clubs/<slug>) are shareable without an account.
export default function PublicClubLayout({ children }: { children: ReactNode }) {
  return <PublicOrAppShell>{children}</PublicOrAppShell>
}
