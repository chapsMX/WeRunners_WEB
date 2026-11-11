"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function AppHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const textBase = scrolled
    ? "text-foreground/80 hover:text-foreground"
    : "text-white/90 hover:text-white"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-line"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="https://www.w3runn3rs.com"
            className="flex items-center gap-3 group"
            aria-label="w3runn3rs — home"
          >
            <Image
              src="/images/logoAzul.png"
              alt="w3runn3rs"
              width={980}
              height={656}
              className="h-14 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
              priority
            />
            <span className={cn("font-extrabold text-xl tracking-tight transition-colors", textBase)}>
              We Runners
            </span>
          </Link>

          <a
            href="https://www.w3runn3rs.com"
            className={cn("hidden md:block text-sm font-medium transition-colors", textBase)}
          >
            ← Back to w3runn3rs.com
          </a>
        </div>
      </div>
    </header>
  )
}
