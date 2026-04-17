import type { Metadata } from "next"

import { EngineFlow } from "@/components/engine/EngineFlow"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

type EnginePageProps = {
  searchParams?: {
    objective?: string
    season?: string
    summit?: string
    template?: string
  }
}

export default function EnginePage({ searchParams }: EnginePageProps) {
  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#152F25]">
      <EngineFlow
        initialObjectiveId={searchParams?.objective}
        initialSeasonLength={searchParams?.season}
        initialSummitId={searchParams?.summit}
        initialTemplateId={searchParams?.template}
      />
    </main>
  )
}
