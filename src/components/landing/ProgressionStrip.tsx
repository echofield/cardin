"use client"

import { type DynamicDefinition } from "@/lib/dynamics-library"

type ProgressionStripProps = {
  dynamic: DynamicDefinition
}

export function ProgressionStrip({ dynamic }: ProgressionStripProps) {
  if (!dynamic.showsCapFranchi) return null

  return (
    <div className="mt-4 rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Progression côté client</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-[#173A2E]">
        <span className="rounded-full bg-[#E8EFE5] px-3 py-1">Entrée</span>
        <span className="text-[#9AA396]">→</span>
        <span className="rounded-full border border-[#173A2E] bg-[#EFF4EC] px-3 py-1">Cap franchi</span>
        <span className="text-[#9AA396]">→</span>
        <span className="rounded-full bg-[#E8EFE5] px-3 py-1">Récompense</span>
      </div>
      <p className="mt-2 text-xs text-[#556159]">Le cap du milieu renforce l&apos;engagement avant la récompense finale.</p>
    </div>
  )
}
