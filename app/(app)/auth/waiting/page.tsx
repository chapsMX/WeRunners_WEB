import Image from "next/image"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import AppHeader from "@/components/layout/AppHeader"
import AppFooter from "@/components/layout/AppFooter"
import { OnTheListCard, BackArrow } from "@/components/waitlist/OnTheListCard"
import SignOutButton from "./SignOutButton"

export const metadata: Metadata = {
  title: "You're on the list — W3Runn3rs",
  description: "Your account is created. We'll notify you when it's your turn.",
}

// Waiting room for signed-in users without beta access. Same card as the
// landing waitlist success state, plus the signed-in account and Sign out.
export default async function WaitingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user

  return (
    <>
      <AppHeader />

      <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/images/fondoHero.webp"
          alt="W3Runn3rs runners"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-navy/70" />

        <div className="relative z-10 w-full max-w-lg mx-auto px-4 pt-24 pb-16 flex items-center justify-center min-h-screen">
          <div className="w-full">
            <OnTheListCard
              account={
                user ? { email: user.email, name: user.name, image: user.image } : undefined
              }
              backLink={
                <a
                  href="https://www.w3runn3rs.com"
                  className="inline-flex items-center gap-2 text-brand-green font-semibold hover:underline"
                >
                  <BackArrow />
                  Back to w3runn3rs.com
                </a>
              }
              footer={user ? <SignOutButton /> : undefined}
            />
          </div>
        </div>
      </main>

      <AppFooter />
    </>
  )
}
