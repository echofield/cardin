"use client"

import { type Proposition } from "@/lib/projection-scenarios"

type ScenarioCardProps = {
  proposition: Proposition
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
      <p className="font-serif text-lg text-[#15372B]">{proposition.title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-[#5C655E]">{proposition.description}</p>
    </button>
  )
}
