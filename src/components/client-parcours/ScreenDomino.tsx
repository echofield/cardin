import type { LandingWorldId } from "@/lib/landing-content"
import { getTensionPair } from "@/lib/client-parcours-config"

type Props = {
  worldId: LandingWorldId
  visits: number
  targetVisits: number
  sharesUsed: number
  maxShares: number
  onShare: () => void
}

export function ScreenDomino({ worldId, visits, targetVisits, sharesUsed, maxShares, onShare }: Props) {
  const { expireLine, actionLine } = getTensionPair(worldId, "domino")
  const canShare = sharesUsed < maxShares
  const remaining = Math.max(0, targetVisits - visits)

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Propagation</p>
        <p className="mt-3 text-sm italic leading-7 text-[#556159]">
          Le parcours s’élargit — un geste, une personne.
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight text-[#173A2E]">
          {maxShares - sharesUsed} entrée{maxShares - sharesUsed > 1 ? "s" : ""} à tendre
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#556159]">
          Celui ou celle que vous choisissez
        </p>
      </div>

      {canShare ? (
        <button
          className="w-full rounded-[1.6rem] border border-[#173A2E] bg-[#173A2E] p-5 text-center text-sm font-medium text-[#FBFAF6] transition hover:bg-[#24533F]"
          onClick={onShare}
          type="button"
        >
          Donner accès
        </button>
      ) : (
        <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#F8FAF6] p-5 text-center">
          <p className="text-sm text-[#556159]">
            {maxShares} accès donnés — amplification complète
          </p>
        </div>
      )}

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
          {visits} / {targetVisits} passages · encore {remaining}
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#F8FAF6] p-5">
        <p className="text-sm text-[#556159]">{expireLine}</p>
        <p className="mt-2 text-xs leading-relaxed text-[#69736C]">{actionLine}</p>
      </div>
    </div>
  )
}
