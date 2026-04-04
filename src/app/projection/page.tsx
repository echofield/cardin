import { Suspense } from "react"

import { ProjectionView } from "@/components/landing/ProjectionView"

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
