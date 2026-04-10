import type { LandingWorldId } from "@/lib/landing-content"
import { SOFT_INVITE_MAX, getTensionPair } from "@/lib/client-parcours-config"

type Props = {
  worldId: LandingWorldId
  visits: number
  targetVisits: number
  softInviteUsed: number
  onSoftInvite: () => void
}

export function ScreenActivation({
  worldId,
  visits,
  targetVisits,
  softInviteUsed,
  onSoftInvite,
}: Props) {
  const { expireLine, actionLine } = getTensionPair(worldId, "activation")
  const canSoftInvite = softInviteUsed < SOFT_INVITE_MAX

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#EEF3EC] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#355246]">Activation</p>
        <p className="mt-3 text-sm italic leading-7 text-[#355246]">
          Ici, votre carte prend sens — le lieu vous lit sans vous presser.
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight text-[#173A2E]">
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

      <div className="rounded-[1.6rem] border border-[#C9D4C4] bg-[#F8FAF6] p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Invitation légère</p>
        <p className="mt-2 text-sm leading-7 text-[#2A3F35]">
          Avant la propagation complète, vous pouvez faire entrer une personne de confiance — un geste discret, sans pression.
        </p>
        {canSoftInvite ? (
          <button
            className="mt-4 w-full rounded-[1.2rem] border border-[#173A2E]/30 bg-[#FFFEFA] px-4 py-3 text-sm font-medium text-[#173A2E] transition hover:border-[#173A2E] hover:bg-[#EEF3EC]"
            onClick={onSoftInvite}
            type="button"
          >
            Proposer un accès
          </button>
        ) : (
          <p className="mt-3 text-sm text-[#355246]">
            Proposition enregistrée — la propagation large viendra à l’étape suivante.
          </p>
        )}
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#F8FAF6] p-5">
        <p className="text-sm text-[#556159]">{expireLine}</p>
        <p className="mt-2 text-xs leading-relaxed text-[#69736C]">{actionLine}</p>
      </div>
    </div>
  )
}
