import type { LandingWorldId } from "@/lib/landing-content"
import { CLIENT_PARCOURS_TIMING, getExpirationDays } from "@/lib/client-parcours-config"

type Props = {
  worldId: LandingWorldId
  targetVisits: number
  summitLabel: string
}

export function ScreenEntree({ worldId, targetVisits, summitLabel }: Props) {
  const timing = CLIENT_PARCOURS_TIMING[worldId]
  const expDays = getExpirationDays(worldId)

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Entrée</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[#173A2E]">
          Vous êtes entré dans le parcours
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#556159]">
          {timing.actionPhrase}
        </p>
        <p className="mt-2 text-xs text-[#69736C]">
          Expire dans {expDays} jours
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Progression</p>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: targetVisits }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full bg-[#E3E7DF]"
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-[#556159]">
          0 / {targetVisits} passages
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-dashed border-[#D8DED4] bg-[#F8F7F2]/60 p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Sommet — verrouillé</p>
        <p className="mt-3 font-serif text-xl text-[#173A2E]/30">
          {summitLabel}
        </p>
        <p className="mt-2 text-xs text-[#69736C]">
          Atteignez {targetVisits} passages pour débloquer
        </p>
      </div>
    </div>
  )
}
