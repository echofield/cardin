import type { Metadata } from "next"
import { Suspense } from "react"

import { ClientParcoursSimulator } from "@/components/client-parcours/ClientParcoursSimulator"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

function ParcoursClientFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA]">
      <p className="text-sm text-[#556159]">Chargement du parcours client...</p>
    </main>
  )
}

export default function ParcoursClientPage() {
  return (
    <Suspense fallback={<ParcoursClientFallback />}>
      <ClientParcoursSimulator />
    </Suspense>
  )
}
