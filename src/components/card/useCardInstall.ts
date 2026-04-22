"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { detectInstallPlatform, isStandaloneDisplay, rememberInstallEntry, type InstallPlatform } from "@/lib/card-install"

type DeferredInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type CardInstallConfig = {
  url?: string | null
  label?: string | null
  businessName?: string | null
}

type InstallResult =
  | { kind: "prompt"; outcome: "accepted" | "dismissed" }
  | { kind: "instructions" }
  | { kind: "error" }

type ShareResult =
  | { kind: "shared" }
  | { kind: "copied" }
  | { kind: "unsupported" }
  | { kind: "error" }

export function useCardInstall({ url, label, businessName }: CardInstallConfig) {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [installStatus, setInstallStatus] = useState<"idle" | "installing" | "installed" | "dismissed" | "error">("idle")
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied" | "error">("idle")

  const platform = useMemo<InstallPlatform>(() => {
    if (typeof window === "undefined") return "unknown"
    return detectInstallPlatform(window.navigator.userAgent)
  }, [])

  const resolvedUrl = useMemo(() => {
    if (url) return url
    if (typeof window === "undefined") return null
    return window.location.href
  }, [url])

  const rememberCurrentEntry = useCallback(() => {
    if (!resolvedUrl) return
    rememberInstallEntry({ url: resolvedUrl, label, businessName })
  }, [businessName, label, resolvedUrl])

  useEffect(() => {
    if (typeof window === "undefined") return

    rememberCurrentEntry()

    const refreshStandalone = () => {
      const active = isStandaloneDisplay()
      setIsStandalone(active)
      if (active) {
        setInstallStatus("installed")
      }
    }

    refreshStandalone()

    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as DeferredInstallPromptEvent
      promptEvent.preventDefault()
      setDeferredPrompt(promptEvent)
    }

    const onInstalled = () => {
      rememberCurrentEntry()
      setDeferredPrompt(null)
      setInstallStatus("installed")
      refreshStandalone()
      trackEvent("card_install_action", { action: "installed", platform, businessName })
    }

    const media = window.matchMedia("(display-mode: standalone)")
    const onMediaChange = () => refreshStandalone()

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener)
    window.addEventListener("appinstalled", onInstalled)
    media.addEventListener?.("change", onMediaChange)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener)
      window.removeEventListener("appinstalled", onInstalled)
      media.removeEventListener?.("change", onMediaChange)
    }
  }, [businessName, platform, rememberCurrentEntry])

  const installCard = useCallback(async (): Promise<InstallResult> => {
    rememberCurrentEntry()
    trackEvent("card_install_action", {
      action: "click_install",
      platform,
      mode: deferredPrompt ? "prompt" : "instructions",
      businessName,
    })

    if (!deferredPrompt) {
      return { kind: "instructions" }
    }

    try {
      setInstallStatus("installing")
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice

      if (choice.outcome === "accepted") {
        setInstallStatus("installed")
        setDeferredPrompt(null)
      } else {
        setInstallStatus("dismissed")
      }

      return { kind: "prompt", outcome: choice.outcome }
    } catch {
      setInstallStatus("error")
      return { kind: "error" }
    }
  }, [businessName, deferredPrompt, platform, rememberCurrentEntry])

  const shareCard = useCallback(async (): Promise<ShareResult> => {
    rememberCurrentEntry()

    if (!resolvedUrl || typeof window === "undefined") {
      setShareStatus("error")
      return { kind: "error" }
    }

    const title = label ?? "Carte Cardin"
    const sharePayload = {
      title,
      text: "Gardez votre carte Cardin sur votre téléphone.",
      url: resolvedUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(sharePayload)
        setShareStatus("shared")
        trackEvent("card_install_action", { action: "share", platform, businessName })
        return { kind: "shared" }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resolvedUrl)
        setShareStatus("copied")
        trackEvent("card_install_action", { action: "copy_link", platform, businessName })
        return { kind: "copied" }
      }

      setShareStatus("error")
      return { kind: "unsupported" }
    } catch {
      setShareStatus("error")
      return { kind: "error" }
    }
  }, [businessName, label, platform, rememberCurrentEntry, resolvedUrl])

  return {
    platform,
    isStandalone,
    canInstallPrompt: Boolean(deferredPrompt),
    supportsShare: typeof navigator !== "undefined" && typeof navigator.share === "function",
    installStatus,
    shareStatus,
    resolvedUrl,
    installCard,
    shareCard,
    rememberCurrentEntry,
  }
}
