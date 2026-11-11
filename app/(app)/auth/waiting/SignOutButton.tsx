"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-white/50 hover:text-white text-sm transition-colors"
    >
      Sign out
    </button>
  )
}
