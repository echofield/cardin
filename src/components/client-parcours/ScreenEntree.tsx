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
      <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[linear-gradient(165deg,#F4F1EA_0%,#E8EDE4_100%)] p-6 shadow-[0_20px_50px_-38px_rgba(23,58,46,0.35)]">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#355246]">Horizon Cardin</p>
        <p className="mt-4 font-serif text-2xl leading-snug text-[#173A2E]">Débloquez le Diamond</p>
        <p className="mt-3 text-sm leading-relaxed text-[#556159]">
          C’est la couche d’attraction long terme : expériences régulières, statut et privilège contrôlé — pas une réduction
          aléatoire. Vous le voyez dès le début ; le parcours et les missions vous y mènent.
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Entrée</p>
        <p className="mt-3 text-sm italic leading-7 text-[#556159]">Sans friction — le lieu vous enregistre.</p>
        <p className="mt-4 text-sm leading-7 text-[#2A3F35]">{actionLine}</p>
        <p className="mt-2 text-xs text-[#69736C]">{expireLine}</p>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Progression</p>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: targetVisits }).map((_, i) => (
            <div key={i} className="h-2 flex-1 rounded-full bg-[#E3E7DF]" />
          ))}
        </div>
        <p className="mt-3 text-sm text-[#556159]">
          0 / {targetVisits} passages
        </p>
      </div>
    </div>
  )
}
