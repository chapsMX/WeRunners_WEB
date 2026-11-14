import type { ReactNode } from "react"
import { PublicOrAppShell } from "@/components/app/PublicOrAppShell"

// Public runner profiles (/u/…) are shareable without an account.
export default function PublicProfileLayout({ children }: { children: ReactNode }) {
  return <PublicOrAppShell>{children}</PublicOrAppShell>
}
