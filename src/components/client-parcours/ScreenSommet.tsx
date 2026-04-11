import type { LandingWorldId } from "@/lib/landing-content"
import { getSummitOptions, type SummitOption } from "@/lib/client-parcours-config"

type Props = {
  worldId: LandingWorldId
  visits: number
  targetVisits: number
  selectedOptionId: string | null
  onSelectOption: (option: SummitOption) => void
}

export function ScreenSommet({ worldId, visits, targetVisits, selectedOptionId, onSelectOption }: Props) {
  const options = getSummitOptions(worldId)
  const selected = options.find((o) => o.id === selectedOptionId) ?? null

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#173A2E] p-6 text-[#FBFAF6]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#C7D2C6]">Sommet</p>
        <p className="mt-3 text-sm italic leading-7 text-[#D4DCD4]">
          Vous y êtes — le lieu vous laisse choisir votre ligne.
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight">
          Sommet atteint
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#E4E8E2]">
          Trois orientations — une seule vous suit
        </p>
      </div>

      {!selected ? (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Votre choix</p>
          {options.map((opt) => (
            <button
              className="w-full rounded-[1.4rem] border border-[#D8DED4] bg-[#FFFEFA] p-5 text-left transition hover:border-[#173A2E]/40 hover:bg-[#F8FAF6]"
              key={opt.id}
              onClick={() => onSelectOption(opt)}
              type="button"
            >
              <p className="font-serif text-xl text-[#173A2E]">{opt.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#556159]">{opt.whisper}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#EEF3EC] p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#355246]">Votre ligne</p>
          <p className="mt-3 font-serif text-2xl text-[#173A2E]">{selected.title}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#2A3F35]">{selected.whisper}</p>
          <p className="mt-4 text-sm italic text-[#556159]">
            À vivre au prochain passage — le lieu confirme le geste.
          </p>
        </div>
      )}

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <div className="flex gap-1">
          {Array.from({ length: targetVisits }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full bg-[#173A2E] transition-colors duration-300"
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-[#556159]">
          {visits} / {targetVisits} — parcours complet
        </p>
      </div>
    </div>
  )
}
