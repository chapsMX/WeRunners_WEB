"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { GarminResult } from "@/lib/garmin/results"
import { DeviceIcon } from "../icons"

// Providers shown in the banner. Only Garmin is live; the rest render disabled.
// Text buttons for now — brand logos come later (check each brand's guidelines).
const DEVICES = [
  { id: "garmin", label: "Garmin", href: "/api/integrations/garmin/connect" },
  { id: "polar", label: "Polar", href: null },
  { id: "suunto", label: "Suunto", href: null },
] as const

/** "No device connected" banner with one button per provider. */
export function ConnectDeviceBanner() {
  const t = useTranslations("dashboard.devices")

  return (
    <section className="flex flex-col gap-4 border border-line bg-surface-alt/40 p-5 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-green/10 text-brand-green">
          <DeviceIcon size={18} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("text")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEVICES.map((d) =>
          d.href ? (
            // Plain <a>: the route redirects to Garmin, so we want a full navigation.
            <a
              key={d.id}
              href={d.href}
              className="border border-brand-green bg-brand-green px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90"
            >
              {d.label}
            </a>
          ) : (
            <span
              key={d.id}
              aria-disabled="true"
              title={t("soon")}
              className="flex cursor-not-allowed flex-col items-center border border-line px-4 py-1.5 text-sm font-semibold text-muted"
            >
              {d.label}
              <span className="text-[10px] font-medium uppercase tracking-wide">{t("soon")}</span>
            </span>
          )
        )}
      </div>
    </section>
  )
}

const TONE: Record<GarminResult, "ok" | "warn" | "error"> = {
  connected: "ok",
  connected_no_activity: "warn",
  denied: "warn",
  invalid_state: "error",
  in_use: "error",
  other_provider: "warn",
  failed: "error",
}

/** One-time notice after returning from Garmin (?garmin=<result>). */
export function GarminResultNotice({ result }: { result: GarminResult }) {
  const t = useTranslations("dashboard.devices.result")

  // Drop the query param so a refresh doesn't show the notice again.
  // history.replaceState keeps this render (no Next navigation).
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete("garmin")
    window.history.replaceState(window.history.state, "", url)
  }, [])

  const tone = TONE[result]
  return (
    <p
      role="status"
      className={cn(
        "border px-4 py-3 text-sm",
        tone === "ok" && "border-brand-green/40 bg-brand-green/10 text-brand-green",
        tone === "warn" && "border-yellow-400/40 bg-yellow-400/10 text-yellow-200",
        tone === "error" && "border-red-500/40 bg-red-500/10 text-red-300"
      )}
    >
      {t(result)}
    </p>
  )
}
