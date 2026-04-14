"use client"

type Props = {
  meaning: string
  mapping: string
}

/** Bloc discret : sens produit + rappel mapping moteur (vertical bar). */
export function BarEngineNote({ meaning, mapping }: Props) {
  return (
    <div className="rounded-[1.2rem] border border-[#173A2E]/15 bg-[#F4F6F2] p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#4A5E52]">Moteur · sens</p>
      <p className="mt-2 text-sm leading-relaxed text-[#2A3F35]">{meaning}</p>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-[#69736C]">{mapping}</p>
    </div>
  )
}
