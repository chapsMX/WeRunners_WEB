import type { ReactNode } from "react"
import { PublicOrAppShell } from "@/components/app/PublicOrAppShell"

// Public pages (club directory /clubs, club pages /clubs/<slug>, the club
// leaderboard, run cards) are shareable without an account.
export default function PublicClubLayout({ children }: { children: ReactNode }) {
  return <PublicOrAppShell>{children}</PublicOrAppShell>
}
