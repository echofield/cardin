"use client"

import { usePathname } from "next/navigation"

import { SiteHeader } from "@/components/SiteHeader"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideChrome =
    pathname === "/" ||
    pathname === "/commencer" ||
    pathname.startsWith("/commencer/") ||
    pathname === "/parcours" ||
    pathname.startsWith("/parcours/") ||
    pathname === "/presentation" ||
    pathname.startsWith("/presentation/") ||
    pathname === "/terrain" ||
    pathname.startsWith("/terrain/") ||
    pathname === "/revenir" ||
    pathname.startsWith("/revenir/")

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
