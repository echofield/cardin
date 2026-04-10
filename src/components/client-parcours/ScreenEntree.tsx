import type { LandingWorldId } from "@/lib/landing-content"
import { getTensionPair } from "@/lib/client-parcours-config"

type Props = {
  worldId: LandingWorldId
  targetVisits: number
}

export function ScreenEntree({ worldId, targetVisits }: Props) {
  const { expireLine, actionLine } = getTensionPair(worldId, "entree")

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Entrée</p>
        <p className="mt-3 text-sm italic leading-7 text-[#556159]">
          Un pas dans le lieu, sans friction — le parcours vous reconnaît.
        </p>
        <p className="mt-4 text-sm leading-7 text-[#2A3F35]">{actionLine}</p>
        <p className="mt-2 text-xs text-[#69736C]">{expireLine}</p>
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
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Réserve</p>
        <p className="mt-3 font-serif text-lg leading-snug text-[#173A2E]/50">
          Une suite se prépare en fin de parcours — le lieu vous la révélera au moment venu.
        </p>
        <p className="mt-2 text-xs text-[#69736C]">
          Aucun détail avant la dernière étape
        </p>
      </div>
    </div>
  )
}
