import { Suspense } from "react"
import type { Metadata } from "next"
import SignInForm from "./SignInForm"

export const metadata: Metadata = {
  title: "Sign In — W3Runn3rs",
  description: "Accede a tu cuenta de W3Runn3rs.",
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <SignInForm />
    </Suspense>
  )
}
