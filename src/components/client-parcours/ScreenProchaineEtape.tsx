import type { LandingWorldId } from "@/lib/landing-content"
import { getBarEngineCaptionForScreenId, getTasteSignal, getTensionPair } from "@/lib/client-parcours-config"

import { BarEngineNote } from "@/components/client-parcours/BarEngineNote"

type Props = {
  worldId: LandingWorldId
  visits: number
  targetVisits: number
}

export function ScreenProchaineEtape({ worldId, visits, targetVisits }: Props) {
  const { expireLine, actionLine } = getTensionPair(worldId, "prochaine-etape")
  const taste = getTasteSignal(worldId, "prochaine-etape")
  const remaining = Math.max(0, targetVisits - visits)
  const barCap = worldId === "bar" ? getBarEngineCaptionForScreenId("prochaine-etape") : null

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Encore un retour</p>
        <p className="mt-3 text-sm leading-7 text-[#556159]">Vous êtes proche du haut du parcours.</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight text-[#173A2E]">La récompense se rapproche.</h2>
        <p className="mt-3 text-sm leading-7 text-[#556159]">Encore {remaining} passage{remaining > 1 ? "s" : ""} utile{remaining > 1 ? "s" : ""} pour débloquer le niveau final.</p>
      </div>

      <div className="rounded-[1.6rem] border border-[#C9D4C4]/80 bg-[#FAFBF8] p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">{taste.eyebrow}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#2A3F35]">{taste.line}</p>
      </div>

      {barCap ? <BarEngineNote mapping={barCap.mapping} meaning={barCap.meaning} /> : null}

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
        <p className="mt-3 text-sm text-[#556159]">{visits} / {targetVisits} · encore {remaining}</p>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#F8FAF6] p-5">
        <p className="text-sm text-[#556159]">{expireLine}</p>
        <p className="mt-2 text-xs leading-relaxed text-[#69736C]">{actionLine}</p>
      </div>
    </div>
  )
}
