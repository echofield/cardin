import type { LandingWorldId } from "@/lib/landing-content"
import { CLIENT_PARCOURS_TIMING } from "@/lib/client-parcours-config"

type Props = {
  worldId: LandingWorldId
  visits: number
  targetVisits: number
}

export function ScreenActivation({ worldId, visits, targetVisits }: Props) {
  const timing = CLIENT_PARCOURS_TIMING[worldId]

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#EEF3EC] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#355246]">Activation</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[#173A2E]">
          Parcours actif
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#2A3F35]">
          Vous avez déjà un avantage ici
        </p>
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
        <p className="text-sm text-[#173A2E]">
          Prochain avantage au prochain passage
        </p>
        <p className="mt-1 text-xs text-[#69736C]">
          {timing.actionPhrase}
        </p>
      </div>
    </div>
  )
}
