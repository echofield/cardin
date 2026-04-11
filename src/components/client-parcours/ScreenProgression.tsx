import type { LandingWorldId } from "@/lib/landing-content"
import { getTasteSignal, getTensionPair } from "@/lib/client-parcours-config"

type Props = {
  worldId: LandingWorldId
  visits: number
  targetVisits: number
}

export function ScreenProgression({ worldId, visits, targetVisits }: Props) {
  const { expireLine, actionLine } = getTensionPair(worldId, "progression")
  const taste = getTasteSignal(worldId, "progression")
  const remaining = Math.max(0, targetVisits - visits)

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Progression</p>
        <p className="mt-3 text-sm italic leading-7 text-[#556159]">
          Le premier geste vous retient.
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight text-[#173A2E]">
          {visits} passage{visits > 1 ? "s" : ""} validé{visits > 1 ? "s" : ""}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#556159]">
          Encore {remaining}
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-[#C9D4C4]/80 bg-[#FAFBF8] p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">{taste.eyebrow}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#2A3F35]">{taste.line}</p>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <div className="flex gap-1">
          {Array.from({ length: targetVisits }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                i < visits ? "bg-[#173A2E]" : "bg-[#E3E7DF]"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-[#556159]">
          {visits} / {targetVisits} passages
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#F8FAF6] p-5">
        <p className="text-sm text-[#556159]">{expireLine}</p>
        <p className="mt-2 text-xs leading-relaxed text-[#69736C]">{actionLine}</p>
      </div>
    </div>
  )
}
