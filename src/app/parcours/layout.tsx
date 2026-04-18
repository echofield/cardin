import { Suspense } from "react"

import { ParcoursFlowProvider } from "@/components/parcours-v2/ParcoursFlowProvider"

export default function ParcoursLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#f2ede4]" />}>
      <ParcoursFlowProvider>{children}</ParcoursFlowProvider>
    </Suspense>
  )
}
