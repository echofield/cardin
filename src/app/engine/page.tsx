import { EngineFlow } from "@/components/engine/EngineFlow"

type EnginePageProps = {
  searchParams?: {
    objective?: string
    template?: string
  }
}

export default function EnginePage({ searchParams }: EnginePageProps) {
  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#152F25]">
      <EngineFlow initialObjectiveId={searchParams?.objective} initialTemplateId={searchParams?.template} />
    </main>
  )
}
