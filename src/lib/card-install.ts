export const CARDIN_INSTALL_ENTRY_KEY = "cardin:install-entry"

export type InstallPlatform = "ios" | "android" | "desktop" | "unknown"

export type CardInstallEntry = {
  url: string
  label?: string | null
  businessName?: string | null
  savedAt: string
}

export function detectInstallPlatform(userAgent: string): InstallPlatform {
  const normalized = userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(normalized)) {
    return "ios"
  }

  if (/android/.test(normalized)) {
    return "android"
  }

  if (normalized) {
    return "desktop"
  }

  return "unknown"
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true
}

export function rememberInstallEntry(entry: Omit<CardInstallEntry, "savedAt">) {
  if (typeof window === "undefined") return

  try {
    const payload: CardInstallEntry = {
      ...entry,
      savedAt: new Date().toISOString(),
    }

    window.localStorage.setItem(CARDIN_INSTALL_ENTRY_KEY, JSON.stringify(payload))
  } catch {
    // no-op: install memory is helpful, not critical
  }
}

export function readInstallEntry(): CardInstallEntry | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(CARDIN_INSTALL_ENTRY_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<CardInstallEntry>
    if (!parsed.url || typeof parsed.url !== "string") return null

    return {
      url: parsed.url,
      label: parsed.label ?? null,
      businessName: parsed.businessName ?? null,
      savedAt: parsed.savedAt ?? new Date(0).toISOString(),
    }
  } catch {
    return null
  }
}
