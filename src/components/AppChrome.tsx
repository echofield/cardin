"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { SiteHeader } from "@/components/SiteHeader"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
    const media = window.matchMedia("(display-mode: standalone)")
    const refresh = () => {
      setIsStandalone(media.matches || navigatorWithStandalone.standalone === true)
    }

    refresh()
    media.addEventListener?.("change", refresh)

    return () => {
      media.removeEventListener?.("change", refresh)
    }
  }, [])

  const hideChrome =
    isStandalone ||
    pathname === "/" ||
    pathname === "/commencer" ||
    pathname.startsWith("/commencer/") ||
    pathname === "/boulangerie/pompette" ||
    pathname.startsWith("/boulangerie/pompette/") ||
    pathname === "/bar" ||
    pathname.startsWith("/bar/") ||
    pathname === "/caviste" ||
    pathname.startsWith("/caviste/") ||
    pathname === "/mala" ||
    pathname.startsWith("/mala/") ||
    pathname === "/parcours" ||
    pathname.startsWith("/parcours/") ||
    pathname === "/presentation" ||
    pathname.startsWith("/presentation/") ||
    pathname === "/regler" ||
    pathname.startsWith("/regler/") ||
    pathname === "/terrain" ||
    pathname.startsWith("/terrain/") ||
    pathname === "/revenir" ||
    pathname.startsWith("/revenir/") ||
    pathname === "/pass" ||
    pathname.startsWith("/pass/")

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      <SiteHeader />
      <div className="pb-safe min-h-dvh-safe pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">{children}</div>
    </>
  )
}
