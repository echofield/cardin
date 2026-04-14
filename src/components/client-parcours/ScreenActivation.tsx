import type { LandingWorldId } from "@/lib/landing-content"
import { SOFT_INVITE_MAX, getBarEngineCaptionForScreenId, getTasteSignal, getTensionPair } from "@/lib/client-parcours-config"

import { BarEngineNote } from "@/components/client-parcours/BarEngineNote"

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
  const taste = getTasteSignal(worldId, "activation")
  const canSoftInvite = softInviteUsed < SOFT_INVITE_MAX
  const barCap = worldId === "bar" ? getBarEngineCaptionForScreenId("activation") : null

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#EEF3EC] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#355246]">Premier déclencheur</p>
        <p className="mt-3 text-sm leading-7 text-[#355246]">Le système peut maintenant vous montrer un vrai signal de retour.</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight text-[#173A2E]">Un avantage peut apparaître.</h2>
        <p className="mt-3 text-sm leading-7 text-[#2A3F35]">Ce n'est pas encore la récompense finale. C'est un premier geste pour vous faire revenir.</p>
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
        <p className="mt-3 text-sm text-[#556159]">{visits} / {targetVisits} passages</p>
      </div>

      <div className="rounded-[1.6rem] border border-[#C9D4C4] bg-[#F8FAF6] p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Invitation légère</p>
        <p className="mt-2 text-sm leading-7 text-[#2A3F35]">Le lieu peut parfois vous autoriser à faire entrer une personne avant l'ouverture large.</p>
        {canSoftInvite ? (
          <button
            className="mt-4 w-full rounded-[1.2rem] border border-[#173A2E]/30 bg-[#FFFEFA] px-4 py-3 text-sm font-medium text-[#173A2E] transition hover:border-[#173A2E] hover:bg-[#EEF3EC]"
            onClick={onSoftInvite}
            type="button"
          >
            Inviter une personne
          </button>
        ) : (
          <p className="mt-3 text-sm text-[#355246]">Une invitation a déjà été utilisée. La suite dépend des prochains passages.</p>
        )}
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#F8FAF6] p-5">
        <p className="text-sm text-[#556159]">{expireLine}</p>
        <p className="mt-2 text-xs leading-relaxed text-[#69736C]">{actionLine}</p>
      </div>
    </div>
  )
}
