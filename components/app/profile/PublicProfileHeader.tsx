"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"

/** Header for guests on public profiles: brand → landing, and sign in. */
export function PublicProfileHeader() {
  const t = useTranslations("profile.publicHeader")
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-brand-navy text-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="https://www.w3runn3rs.com" className="group flex items-center gap-2.5">
          <Image
            src="/images/logoAzul.png"
            alt="w3runn3rs"
            width={980}
            height={656}
            className="h-9 w-auto opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="text-xl font-bold tracking-tight">We Runners</span>
        </a>
        <Link
          href="/auth/sign-in"
          className="border border-brand-green bg-brand-green px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90"
        >
          {t("signIn")}
        </Link>
      </div>
    </header>
  )
}
