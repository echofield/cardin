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
        <h2 className="mt-4 font-serif text-3xl leading-tight">
          Sommet atteint
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#E4E8E2]">
          {selected
            ? "Avantage activé"
            : "Vous avez accès à un avantage ici"}
        </p>
      </div>

      {!selected ? (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">
            Choisissez celui qui vous correspond
          </p>
          {options.map((opt) => (
            <button
              className="w-full rounded-[1.4rem] border border-[#D8DED4] bg-[#FFFEFA] p-5 text-left transition hover:border-[#173A2E]/40 hover:bg-[#F8FAF6]"
              key={opt.id}
              onClick={() => onSelectOption(opt)}
              type="button"
            >
              <p className="font-serif text-xl text-[#173A2E]">{opt.title}</p>
              <p className="mt-1 text-sm text-[#2A3F35]">{opt.description}</p>
              <p className="mt-2 text-xs italic leading-relaxed text-[#69736C]">{opt.whisper}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#EEF3EC] p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#355246]">Votre choix</p>
          <p className="mt-3 font-serif text-2xl text-[#173A2E]">{selected.title}</p>
          <p className="mt-2 text-sm text-[#2A3F35]">{selected.description}</p>
          <p className="mt-3 text-xs italic leading-relaxed text-[#556159]">{selected.whisper}</p>
          <div className="mt-5 rounded-[1.2rem] border border-[#173A2E]/10 bg-[#FFFEFA] px-5 py-4">
            <p className="text-sm font-medium text-[#173A2E]">
              Disponible lors de votre prochain passage
            </p>
          </div>
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
