import type { Metadata } from "next"
import { Suspense } from "react"

import { ProjectionView } from "@/components/landing/ProjectionView"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProjectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F5F0]" />
      }
    >
      <ProjectionView />
    </Suspense>
  )
}
