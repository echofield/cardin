"use client"

import { useEffect } from "react"

export function PwaBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // no-op: the web card still works without the helper worker
    })
  }, [])

  return null
}
