import { Suspense } from "react"
import Image from "next/image"
import type { Metadata } from "next"
import AppHeader from "@/components/layout/AppHeader"
import AppFooter from "@/components/layout/AppFooter"
import SignInForm from "./SignInForm"

export const metadata: Metadata = {
  title: "Sign In — W3Runn3rs",
  description: "Sign in to your W3Runn3rs account and track your club's progress.",
}

export default function SignInPage() {
  return (
    <>
      <AppHeader />

      <main className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/fondoHero.webp"
          alt="W3Runn3rs runners"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-brand-navy/65" />

        {/* Two-column layout */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-20 pb-16 flex flex-col lg:flex-row items-center justify-center gap-16 min-h-screen">

          {/* Left: brand messaging — desktop only */}
          <div className="hidden lg:flex flex-1 flex-col justify-center">
            <h1 className="text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-none">
              W3 Runn3rs
            </h1>
            <p className="text-2xl font-semibold text-brand-green mt-4 leading-snug">
              Pick your running club,<br />make it count.
            </p>
            <p className="text-white/65 mt-6 max-w-sm text-lg leading-relaxed">
              The global hub for running clubs. One runner, one club — every kilometer counts exclusively for your team.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Track your club's weekly distance",
                "Compete on global leaderboards",
                "One runner, one club — loyalty counts",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3 text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: sign-in card */}
          <div className="w-full max-w-md">
            <Suspense fallback={<div className="h-96 bg-slate-900/80 rounded-2xl animate-pulse" />}>
              <SignInForm />
            </Suspense>
          </div>
        </div>
      </main>

      <AppFooter />
    </>
  )
}
