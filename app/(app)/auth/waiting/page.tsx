import Image from "next/image"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import AppHeader from "@/components/layout/AppHeader"
import AppFooter from "@/components/layout/AppFooter"
import SignOutButton from "./SignOutButton"

export const metadata: Metadata = {
  title: "You're on the list — W3Runn3rs",
  description: "Your account is created. We'll notify you when it's your turn.",
}

export default async function WaitingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <AppHeader />

      <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/fondoHero.webp"
          alt="W3Runn3rs runners"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-brand-navy/70" />

        {/* Card */}
        <div className="relative z-10 w-full max-w-md mx-auto px-6 pt-24 pb-16 flex items-center justify-center min-h-screen">
          <div className="w-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 p-8 space-y-6 text-center">

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-white text-2xl font-bold">You&apos;re on the list</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your account is ready. We&apos;re rolling out access gradually and will notify you as soon as it&apos;s your turn.
              </p>
            </div>

            {/* Registered email */}
            {session?.user?.email && (
              <div className="bg-slate-800/60 border border-slate-700  px-6 py-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Registered account</p>
                <p className="text-white font-medium">{session.user.email}</p>
              </div>
            )}

            {/* In the meantime */}
            <div className="bg-slate-800/60 border border-slate-700  px-6 py-5 text-left space-y-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">In the meantime</p>
              <ul className="space-y-2.5 text-slate-300 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-brand-green">→</span>
                  Follow us on{" "}
                  <a
                    href="https://x.com/w3runn3rs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green hover:text-brand-emerald transition-colors font-medium"
                  >
                    @w3runn3rs
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-green">→</span>
                  Register your club at{" "}
                  <a
                    href="https://www.w3runn3rs.com/en/for-clubs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green hover:text-brand-emerald transition-colors font-medium"
                  >
                    w3runn3rs.com
                  </a>
                </li>
              </ul>
            </div>

            <SignOutButton />
          </div>
        </div>
      </main>

      <AppFooter />
    </>
  )
}
