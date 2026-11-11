"use client"

import { useEffect } from "react"
import { trackEvent, type SignUpMethod } from "@/lib/analytics"

/**
 * Fires GA4 `sign_up` once after onboarding (?signup=<method> on the dashboard)
 * and drops the param so a refresh doesn't count it twice.
 */
export function SignUpTracker({ method }: { method: SignUpMethod }) {
  useEffect(() => {
    trackEvent.signUp(method)
    const url = new URL(window.location.href)
    url.searchParams.delete("signup")
    window.history.replaceState(window.history.state, "", url)
  }, [method])

  return null
}
