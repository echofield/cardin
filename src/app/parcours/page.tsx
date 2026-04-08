import { Suspense } from "react"

import { ParcoursOnboardingCore } from "@/components/parcours/ParcoursOnboardingCore"

/**
 * Server-level Suspense: required when a child Client Component uses `useSearchParams`.
 * Some mobile browsers (e.g. Samsung Internet) fail hydration without this boundary.
 */
function ParcoursPageFallback() {
  return (
    <div
      aria-busy
      aria-label="Chargement du parcours"
      className="min-h-screen"
      style={{ backgroundColor: "var(--cardin-bg-cream, #FAF8F2)" }}
    />
  )
}

export default function ParcoursPage() {
  return (
    <Suspense fallback={<ParcoursPageFallback />}>
      <ParcoursOnboardingCore variant="standalone" />
    </Suspense>
  )
}
