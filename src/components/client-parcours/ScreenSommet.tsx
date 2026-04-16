"use client"

import type { LandingWorldId } from "@/lib/landing-content"
import { BAR_ELU_LAYER } from "@/lib/bar-client-parcours"
import { getBarEngineCaptionForScreenId, getScreenHero, getSummitOptions, type SummitOption } from "@/lib/client-parcours-config"

import { BarEngineNote } from "@/components/client-parcours/BarEngineNote"

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
  const barCap = worldId === "bar" ? getBarEngineCaptionForScreenId("sommet") : null
  const showElu = worldId === "bar" && BAR_ELU_LAYER.enabled
  const hero = getScreenHero(worldId, "sommet")

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#173A2E] p-6 text-[#FBFAF6] shadow-[0_24px_60px_-46px_rgba(23,58,46,0.7)]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#C7D2C6]">{hero?.eyebrow ?? "Sommet"}</p>
        <p className="mt-3 text-sm italic leading-7 text-[#E4E8E2]">{hero?.italic ?? "Le lieu peut maintenant ouvrir quelque chose de rare."}</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight">
          {worldId === "bar"
            ? "Un privilège réel peut maintenant s'activer."
            : "La récompense finale peut maintenant prendre forme."}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#E4E8E2]">
          {selected
            ? "Votre préférence est enregistrée. Le lieu garde la main sur le bon moment, le bon budget et la bonne fenêtre d'activation."
            : "Choisissez la forme de récompense ou de privilège qui vous attire le plus. Le cadre reste défini par le lieu."}
        </p>
      </div>

      {barCap ? <BarEngineNote mapping={barCap.mapping} meaning={barCap.meaning} /> : null}

      {!selected ? (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">
            {worldId === "bar" ? "Privilèges possibles" : "Ce qui peut s'ouvrir"}
          </p>
          {options.map((opt) => (
            <button
              className="w-full rounded-[1.45rem] border border-[#D8DED4] bg-[#FFFEFA] p-5 text-left transition hover:border-[#173A2E]/40 hover:bg-[#F8FAF6]"
              key={opt.id}
              onClick={() => onSelectOption(opt)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl text-[#173A2E]">{opt.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#2A3F35]">{opt.description}</p>
                </div>
                <span className="rounded-full border border-[#D8DED4] bg-[#FBFCF8] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#556159]">
                  Choisir
                </span>
              </div>
              {opt.backendInterpretation ? <p className="mt-3 text-[11px] leading-relaxed text-[#69736C]">{opt.backendInterpretation}</p> : null}
              <p className="mt-3 text-xs italic leading-relaxed text-[#69736C]">{opt.whisper}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#EEF3EC] p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#355246]">Votre choix</p>
            <p className="mt-3 font-serif text-2xl text-[#173A2E]">{selected.title}</p>
            <p className="mt-2 text-sm leading-7 text-[#2A3F35]">{selected.description}</p>
            {selected.backendInterpretation ? <p className="mt-2 text-[11px] leading-relaxed text-[#556159]">{selected.backendInterpretation}</p> : null}
            <p className="mt-3 text-xs italic leading-relaxed text-[#556159]">{selected.whisper}</p>
            <div className="mt-5 rounded-[1.2rem] border border-[#173A2E]/10 bg-[#FFFEFA] px-5 py-4">
              <p className="text-sm font-medium leading-7 text-[#173A2E]">Le lieu décide de l'activation réelle selon ses règles, le bon créneau et le budget prévu.</p>
            </div>
          </div>

          {showElu ? (
            <div className="rounded-[1.6rem] border border-[#C4A962]/40 bg-[#FBF8F0] p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A6A3E]">{BAR_ELU_LAYER.headline}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#2A3F35]">{BAR_ELU_LAYER.body}</p>
              <p className="mt-3 text-xs leading-relaxed text-[#556159]">{BAR_ELU_LAYER.selectionPoolNote}</p>
              <ul className="mt-4 list-inside list-disc space-y-1.5 text-sm text-[#2A3F35]">
                {BAR_ELU_LAYER.examples.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7A6A3E]">
                {BAR_ELU_LAYER.giftSlots} activations rares / saison · hors ligne de projection brute
              </p>
            </div>
          ) : null}
        </div>
      )}

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <div className="flex gap-1">
          {Array.from({ length: targetVisits }).map((_, i) => (
            <div key={i} className="h-2 flex-1 rounded-full bg-[#173A2E] transition-colors duration-300" />
          ))}
        </div>
        <p className="mt-3 text-sm text-[#556159]">
          {visits} / {targetVisits} — parcours complet
        </p>
      </div>
    </div>
  )
}