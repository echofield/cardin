import type { LandingWorldId } from "@/lib/landing-content"
import { getBarEngineCaptionForScreenId, getTensionPair } from "@/lib/client-parcours-config"

import { BarEngineNote } from "@/components/client-parcours/BarEngineNote"

type Props = {
  worldId: LandingWorldId
  targetVisits: number
}

export function ScreenEntree({ worldId, targetVisits }: Props) {
  const { expireLine, actionLine } = getTensionPair(worldId, "entree")
  const barCap = worldId === "bar" ? getBarEngineCaptionForScreenId("entree") : null

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[linear-gradient(165deg,#F4F1EA_0%,#E8EDE4_100%)] p-6 shadow-[0_20px_50px_-38px_rgba(23,58,46,0.35)]">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#355246]">Entrée</p>
        <p className="mt-3 text-sm italic leading-7 text-[#556159]">Sans friction — le lieu vous enregistre.</p>
        <p className="mt-4 font-serif text-2xl leading-snug text-[#173A2E]">Votre carte est active.</p>
        <p className="mt-3 text-sm leading-relaxed text-[#556159]">
          Le lieu enregistre votre premier passage. Si vous revenez, la progression démarre et vous pouvez débloquer de vrais avantages.
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Ce qui se passe</p>
        <p className="mt-3 text-sm leading-7 text-[#2A3F35]">{actionLine}</p>
        <p className="mt-2 text-xs text-[#69736C]">{expireLine}</p>
      </div>

      {barCap ? <BarEngineNote mapping={barCap.mapping} meaning={barCap.meaning} /> : null}

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Progression</p>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: targetVisits }).map((_, i) => (
            <div key={i} className="h-2 flex-1 rounded-full bg-[#E3E7DF]" />
          ))}
        </div>
        <p className="mt-3 text-sm text-[#556159]">0 / {targetVisits} passages</p>
      </div>
    </div>
  )
}