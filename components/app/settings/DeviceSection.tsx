"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { ConnectDeviceBanner, GARMIN_CONNECT_PATH } from "@/components/app/dashboard/DeviceConnect"
import { DeviceIcon } from "@/components/app/icons"

// Garmin data-sharing settings live in Garmin Connect (we can't change them).
export const GARMIN_PERMISSIONS_URL = "https://connect.garmin.com/modern/settings/accountInformation"

export type DeviceStatus = {
  provider: "garmin"
  connectedAt: string // ISO
  lastSyncAt: string | null // ISO — last activity received
  activitySharing: boolean // ACTIVITY_EXPORT granted
} | null

function relative(iso: string, locale: string): string {
  const diffSec = (new Date(iso).getTime() - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const abs = Math.abs(diffSec)
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute")
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour")
  return rtf.format(Math.round(diffSec / 86400), "day")
}

/** Settings → Device: connection status, Garmin permissions and disconnect. */
export function DeviceSection({ device }: { device: DeviceStatus }) {
  const t = useTranslations("settings.device")
  const locale = useLocale()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function disconnect() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/integrations/garmin/disconnect", { method: "POST" })
      if (!res.ok && res.status !== 404) throw new Error(String(res.status))
      setConfirming(false)
      router.refresh() // server re-reads the (now inactive) connection
    } catch {
      setError(t("disconnectError"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="border border-line bg-surface-alt/40 p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">{t("label")}</h2>

      {!device ? (
        <ConnectDeviceBanner />
      ) : (
        <div className="space-y-5">
          {/* Status */}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-green/10 text-brand-green">
              <DeviceIcon size={18} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t("garminConnected")}</p>
              <p className="text-sm text-muted">
                {t("since", {
                  date: new Date(device.connectedAt).toLocaleDateString(locale, { dateStyle: "medium" }),
                })}
                {" · "}
                {device.lastSyncAt
                  ? t("lastSync", { when: relative(device.lastSyncAt, locale) })
                  : t("noSyncYet")}
              </p>
            </div>
          </div>

          {/* Permissions */}
          <div className="border-t border-line pt-5">
            <p className="text-sm font-semibold text-foreground">{t("permissionsLabel")}</p>
            {device.activitySharing ? (
              <p className="mt-1 text-sm text-brand-green">✓ {t("activitySharingOn")}</p>
            ) : (
              <div className="mt-2 border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
                {t("activitySharingOff")}
              </div>
            )}
            <p className="mt-2 text-xs text-muted">{t("permissionsHint")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={GARMIN_PERMISSIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-line px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand-green/50 hover:text-brand-green"
              >
                {t("manageInGarmin")} ↗
              </a>
              {!device.activitySharing && (
                <a
                  href={GARMIN_CONNECT_PATH}
                  className="border border-brand-green bg-brand-green px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-green/90"
                >
                  {t("reconnect")}
                </a>
              )}
            </div>
          </div>

          {/* Disconnect */}
          <div className="border-t border-line pt-5">
            {confirming ? (
              <div className="space-y-3">
                <p className="text-sm text-foreground">{t("disconnectConfirm")}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={disconnect}
                    disabled={busy}
                    className="border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {busy ? t("disconnecting") : t("disconnectYes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={busy}
                    className="px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-sm font-medium text-muted transition-colors hover:text-red-400"
              >
                {t("disconnect")}
              </button>
            )}
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>
        </div>
      )}
    </section>
  )
}
