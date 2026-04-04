"use client"

import { type ProjectionScenario } from "@/lib/projection-scenarios"

type ScenarioCardProps = {
  proposition: ProjectionScenario
  selected: boolean
  onSelect: () => void
}

export function ScenarioCard({ proposition, selected, onSelect }: ScenarioCardProps) {
  return (
    <button
      className={[
        "w-full rounded-2xl border px-5 py-4 text-left transition-all duration-200",
        selected
          ? "border-[#173A2E] bg-[#EFF4EC] shadow-md ring-1 ring-[#173A2E]"
          : "border-[#D4D9D0] bg-[#FDFCF8] shadow-sm hover:border-[#173A2E]/60 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-lg text-[#15372B]">{proposition.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-[#5C655E]">{proposition.description}</p>
        </div>
        {selected ? (
          <span className="rounded-full bg-[#173A2E] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#F6F5F0]">
            Choisi
          </span>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-[#E7EAE4] bg-[#FCFBF7] px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#93A094]">Ce que Cardin declenche</p>
        <p className="mt-2 text-sm text-[#2A3F35]">{proposition.summaryLine}</p>
      </div>
    </button>
  )
}
