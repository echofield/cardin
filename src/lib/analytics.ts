"use client"

type FunnelEventName =
  | "hero_cta"
  | "calculator_change"
  | "calculator_cta"
  | "engine_step_completed"
  | "submit_lead"
  | "download_setup_brief"
  | "scan_card_created"
  | "wallet_button_clicked"
  | "merchant_stamp"

export function trackEvent(eventName: FunnelEventName, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return

  const payload = {
    eventName,
    properties,
    pagePath: window.location.pathname,
    timestamp: new Date().toISOString(),
  }

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
      navigator.sendBeacon("/api/events", blob)
      return
    }

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // no-op on analytics failures
  }
}
