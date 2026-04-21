"use client"

import { useRouter } from "next/navigation"

import { useParcoursFlow } from "@/components/parcours-v2/ParcoursFlowProvider"
import { ParcoursParticles } from "@/components/parcours-v2/ParcoursParticles"
import { ParcoursShell } from "@/components/parcours-v2/ParcoursShell"
import {
  PARCOURS_DECAY_VALUES,
  RESONANCE_DAY_OPTIONS,
  buildConfigurationPhrase,
  buildOfferRecapItems,
  buildParticipationLine,
  buildWeeklyMomentLine,
  computeConfigurationTension,
  getBusinessOption,
  getDiamondOption,
  getDiamondOptions,
  getResonanceDayOption,
  getRewardOption,
  getRewardOptions,
  getSeasonPreset,
  getSpreadOption,
  getWhoOption,
  serializeLectureQuery,
} from "@/lib/parcours-v2"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/ui"

export function ConfigurationStepPage() {
  const router = useRouter()
  const { state, updateState } = useParcoursFlow()

  const business = getBusinessOption(state.business) ?? getBusinessOption("cafe")
  const rewardOptions = getRewardOptions(state.business)
  const reward = getRewardOption(state.reward, state.business)
  const who = getWhoOption(state.who)
  const spread = getSpreadOption(state.spread)
  const diamondOptions = getDiamondOptions(state.business)
  const diamond = getDiamondOption(state.diamond, state.business)
  const preset = getSeasonPreset(state.business)
  const resonanceDay = getResonanceDayOption(state.resonanceDay, state.business)
  const phrase = buildConfigurationPhrase(state)
  const tension = computeConfigurationTension(state)
  const lectureQuery = serializeLectureQuery(state)
  const recapItems = buildOfferRecapItems(state)
  const participationLine = buildParticipationLine(state)
  const weeklyMomentLine = buildWeeklyMomentLine(state)
  const currentStep = Math.min(Math.floor(state.threshold / 2), state.threshold - 1)
  const returnWindowDays = Math.max(1, state.decay - 2)

  return (
    <ParcoursShell backHref={`/parcours/lecture${lectureQuery ? `?${lectureQuery}` : ""}`} stepIndex={1}>
      <ParcoursParticles />

      <section className="relative z-[2] mx-auto max-w-[1280px]">
        <div className="mb-11 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-[#8a8578]">Étape 02 — Saison</p>
          <h1 className="font-serif text-[clamp(38px,5vw,56px)] leading-[1.05] text-[#1a2a22]">
            Votre <em className="italic text-[#0f3d2e]">saison.</em>
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] font-serif text-[clamp(16px,1.8vw,19px)] italic leading-[1.5] text-[#3d4d43]">
            Un premier moment visible. Un Diamond en jeu. Un cadre simple que votre équipe peut tenir.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.95fr)] lg:gap-9 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.95fr)] xl:gap-10">
          <div className="flex flex-col gap-8">
            <section>
              <SectionLabel label="Le moment de la semaine" />
              <div className="border-t border-[#d4cdbd]">
                <Track hint="ce qui tombe cette semaine" index="01" name="Ce qui se passe">
                  <div className="flex flex-wrap gap-2">
                    {rewardOptions.map((option) => (
                      <button
                        className={chipClass(state.reward === option.key)}
                        key={option.key}
                        onClick={() => updateState({ reward: option.key })}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <SelectionHint>{weeklyMomentLine}</SelectionHint>
                </Track>

                <Track hint="le jour qui porte la saison" index="02" name="Jour clé">
                  <div className="flex flex-wrap gap-2">
                    {RESONANCE_DAY_OPTIONS.map((option) => (
                      <button
                        className={chipClass(resonanceDay.key === option.key)}
                        key={option.key}
                        onClick={() => updateState({ resonanceDay: option.key })}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <SelectionHint>
                    Le preset {preset.label.toLowerCase()} démarre sur {resonanceDay.label.toLowerCase()} et garde Diamond visible tout du long.
                  </SelectionHint>
                </Track>

                <Track hint="après combien de passages" index="03" name="Déclencheur">
                  <SliderRow
                    max={10}
                    min={1}
                    onChange={(value) => updateState({ threshold: value })}
                    value={state.threshold}
                    valueLabel="passages"
                  />
                </Track>

                <Track hint="qui peut entrer" index="04" name="Qui entre">
                  <div className="flex flex-wrap gap-2">
                    {(["all", "regular", "top"] as const).map((key) => {
                      const option = getWhoOption(key)

                      return (
                        <button
                          className={chipClass(state.who === key)}
                          key={option.key}
                          onClick={() => updateState({ who: option.key })}
                          type="button"
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                  <SelectionHint>{who.description}</SelectionHint>
                </Track>

                <Track hint="solo, duo ou groupe" index="05" name="Format de participation">
                  <div className="flex flex-wrap gap-2">
                    {(["solo", "duo", "group"] as const).map((key) => {
                      const option = getSpreadOption(key)

                      return (
                        <button
                          className={chipClass(state.spread === key)}
                          key={option.key}
                          onClick={() => updateState({ spread: option.key })}
                          type="button"
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                  <SelectionHint>{spread.description}</SelectionHint>
                </Track>
              </div>
            </section>

            <section>
              <SectionLabel label="Le sommet · ce qui reste en vue" warm />
              <div className="rounded-md border border-[#d4b892] bg-[linear-gradient(to_bottom,rgba(184,149,106,0.04),transparent)] px-5">
                <Track hint="visible au comptoir toute la saison" index="06" name="Diamond" warm>
                  <div className="flex flex-wrap gap-2">
                    {diamondOptions.map((option) => (
                      <button
                        className={warmChipClass(state.diamond === option.key)}
                        key={option.key}
                        onClick={() => updateState({ diamond: option.key })}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <SelectionHint warm>{diamond.phrase}</SelectionHint>
                </Track>

                <Track hint="quand il faut revenir" index="07" name="Délai de retour" warm>
                  <SliderRow
                    marks={[3, 5, 7, 10, 14]}
                    max={14}
                    min={3}
                    onChange={(rawValue) => {
                      const next = PARCOURS_DECAY_VALUES.reduce((closest, current) =>
                        Math.abs(current - rawValue) < Math.abs(closest - rawValue) ? current : closest,
                      )
                      updateState({ decay: next })
                    }}
                    tint="warm"
                    value={state.decay}
                    valueLabel="jours"
                  />
                </Track>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="mb-4 rounded border border-[#d4cdbd] bg-[#f2ede4] px-4 py-4">
              <div className="text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">Preset Cardin</div>
              <div className="mt-2 font-serif text-2xl leading-tight text-[#1a2a22]">{preset.label}</div>
              <p className="mt-2 text-sm leading-6 text-[#556159]">{preset.summary}</p>

              <div className="mt-4 space-y-3 border-t border-[#d4cdbd] pt-4">
                <PreviewMeta label="Pourquoi" value={preset.why} />
                <PreviewMeta label="Jour clé" value={resonanceDay.label} />
                <PreviewMeta label="Cette semaine" value={weeklyMomentLine} />
                <PreviewMeta label="Entrée" value={participationLine} />
                <PreviewMeta label="Diamond" value={diamond.phrase} />
              </div>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded border border-[#d4cdbd] bg-[rgba(15,61,46,0.04)] px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-[#3d4d43]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0f3d2e]" />
              <span className="font-medium">Saison · 90 jours</span>
              <span className="ml-auto font-serif text-xs normal-case italic tracking-[0.02em] text-[#8a8578]">borne claire, pas perpétuelle</span>
            </div>

            <div className="mb-5">
              <div className="mb-3 text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">Côté client</div>
              <div className="flex justify-center">
                <div className="w-full max-w-[260px] rounded-[28px] border border-[#d4cdbd] bg-[#e3dccc] p-3 shadow-[0_20px_48px_rgba(15,61,46,0.08)]">
                  <div className="rounded-[18px] bg-[#f2ede4] px-4 py-6">
                    <div className="border-b border-[#d4cdbd] pb-3 text-center font-serif text-[15px] tracking-[0.25em] text-[#0f3d2e]">
                      {business?.brand}
                    </div>

                    <div className="mt-5 flex items-center">
                      {Array.from({ length: state.threshold }).map((_, index) => (
                        <div className="flex items-center" key={index}>
                          <div
                            className={[
                              "relative h-[14px] w-[14px] rounded-full border",
                              index < currentStep
                                ? "border-[#0f3d2e] bg-[#0f3d2e]"
                                : index === currentStep
                                  ? "border-2 border-[#0f3d2e] shadow-[0_0_0_4px_rgba(15,61,46,0.08)]"
                                  : "border-[#d4cdbd] bg-[#f2ede4]",
                            ].join(" ")}
                          >
                            {index < currentStep ? <span className="absolute inset-[3px] rounded-full bg-[#f2ede4]" /> : null}
                          </div>
                          {index < state.threshold - 1 ? (
                            <div className={`h-px w-7 ${index < currentStep ? "bg-[#0f3d2e]" : "bg-[#d4cdbd]"}`} />
                          ) : null}
                        </div>
                      ))}
                      <div className="h-px w-7 bg-[#d4cdbd]" />
                      <div className="h-3 w-3 rotate-45 rounded-[2px] bg-[#b8956a]" />
                    </div>

                    <div className="mt-5 space-y-3 border-y border-dashed border-[#d4cdbd] py-4 text-sm text-[#3d4d43]">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif italic text-[#b8956a]">→</span>
                        <span>Vous êtes dedans.</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif italic text-[#b8956a]">→</span>
                        <span>{weeklyMomentLine}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif italic text-[#b8956a]">→</span>
                        <span>{participationLine}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif italic text-[#b8956a]">◆</span>
                        <span>Diamond en jeu : {diamond.phrase}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-[#8a8578]">
                        <span>Retour</span>
                        <span className="font-serif normal-case tracking-[0.02em] text-[#8c6a44]">{returnWindowDays} jours</span>
                      </div>
                      <div className="h-[3px] overflow-hidden rounded bg-[#ece6da]">
                        <div
                          className="h-full bg-[linear-gradient(to_right,#0f3d2e_0%,#b8956a_65%,#a8512a_100%)]"
                          style={{ width: `${(returnWindowDays / state.decay) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-5 rounded border border-[#d4cdbd] bg-[#f2ede4] px-5 py-5">
              <div className="mb-3 text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">Au comptoir</div>
              <div className="grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)]">
                <div className="flex h-[88px] items-center justify-center rounded border border-dashed border-[#b8956a] bg-[rgba(184,149,106,0.06)] text-[11px] uppercase tracking-[0.28em] text-[#8c6a44]">
                  QR
                </div>
                <div className="space-y-3">
                  <PreviewMeta label="Cette semaine" value={`${resonanceDay.label} · ${reward.label}`} />
                  <PreviewMeta label="Moment" value={weeklyMomentLine} />
                  <PreviewMeta label="Entrée" value={participationLine} />
                  <PreviewMeta label="Diamond" value={diamond.label} />
                </div>
              </div>
              <div className="mt-4 rounded border border-[#d4cdbd] bg-[#f7f3eb] px-3 py-3 text-[11px] uppercase tracking-[0.18em] text-[#3d4d43]">
                Scannez. Vous êtes dedans.
              </div>
            </div>

            <div className="rounded border border-[#d4cdbd] bg-[#f2ede4] px-5 py-5">
              <div className="mb-3 text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">Tension de saison</div>
              <div className="mb-4 h-[2px] bg-[#ece6da]">
                <div className="relative h-full">
                  <span
                    className={`absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_4px_rgba(15,61,46,0.08)] ${
                      tension.tone === "tight" ? "bg-[#a8512a]" : tension.tone === "balanced" ? "bg-[#0f3d2e]" : "bg-[#8a8578]"
                    }`}
                    style={{ left: `${tension.score}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-[#8a8578]">
                <span className={tension.tone === "loose" ? "font-medium text-[#3d4d43]" : ""}>Lâche</span>
                <span className={tension.tone === "balanced" ? "font-medium text-[#0f3d2e]" : ""}>Équilibrée</span>
                <span className={tension.tone === "tight" ? "font-medium text-[#a8512a]" : ""}>Tendue</span>
              </div>
            </div>

            <div className="mt-5 rounded border border-[#d4cdbd] bg-[#f2ede4] px-5 py-5">
              <div className="mb-3 text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">Votre saison · en une phrase</div>
              <p className="font-serif text-[15px] leading-[1.6] text-[#1a2a22]">
                {phrase.map((fragment, index) => (
                  <span key={fragment}>
                    <span className={index === phrase.length - 1 ? "font-medium text-[#8c6a44]" : ""}>{fragment}</span>
                    {index < phrase.length - 1 ? <span className="px-1 italic text-[#b8956a]/70">·</span> : null}
                  </span>
                ))}
              </p>
            </div>

            <div className="mt-9 flex flex-col items-center gap-3">
              <button
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                onClick={() => router.push(`/parcours/impact${lectureQuery ? `?${lectureQuery}` : ""}`)}
                type="button"
              >
                Voir la saison en chiffres
              </button>
              <p className="text-[11px] italic tracking-[0.1em] text-[#8a8578]">Premier moment inclus · ajustable jusqu'au paiement.</p>
            </div>

            {recapItems.length > 0 ? (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {recapItems.map((item) => (
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.1em]",
                      item.warm ? "border-[#d4b892] text-[#8c6a44]" : "border-[#d4cdbd] text-[#8a8578]",
                    )}
                    key={item.key}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </ParcoursShell>
  )
}

function SectionLabel({ label, warm = false }: { label: string; warm?: boolean }) {
  return (
    <div className={`mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] ${warm ? "text-[#8c6a44]" : "text-[#8a8578]"}`}>
      {warm ? <span className="font-serif text-sm text-[#b8956a]">◆</span> : null}
      <span>{label}</span>
      <span className={`h-px flex-1 ${warm ? "bg-[#d4b892]" : "bg-[#d4cdbd]"}`} />
    </div>
  )
}

function Track({
  children,
  hint,
  index,
  name,
  warm = false,
}: {
  children: React.ReactNode
  hint: string
  index: string
  name: string
  warm?: boolean
}) {
  return (
    <div className={`grid gap-3 border-b py-5 md:grid-cols-[140px_1fr] md:gap-7 ${warm ? "border-[#d4b892]" : "border-[#d4cdbd]"}`}>
      <div className="flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-[0.25em] text-[#8a8578]">{index}</span>
        <span className="font-serif text-xl leading-tight text-[#1a2a22]">{name}</span>
        <span className="text-[11px] italic text-[#8a8578]">{hint}</span>
      </div>
      <div>{children}</div>
    </div>
  )
}

function SelectionHint({ children, warm = false }: { children: React.ReactNode; warm?: boolean }) {
  return <p className={cn("mt-3 text-[11px] italic leading-5", warm ? "text-[#8c6a44]" : "text-[#8a8578]")}>{children}</p>
}

function PreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-[#8a8578]">{label}</div>
      <p className="mt-1 text-sm leading-6 text-[#3d4d43]">{value}</p>
    </div>
  )
}

function SliderRow({
  max,
  min,
  onChange,
  value,
  valueLabel,
  tint = "green",
  marks,
}: {
  max: number
  min: number
  onChange: (value: number) => void
  value: number
  valueLabel: string
  tint?: "green" | "warm"
  marks?: number[]
}) {
  const lineColor = tint === "warm" ? "#b8956a" : "#0f3d2e"
  const normalized = ((value - min) / (max - min)) * 100
  const tickValues = marks ?? Array.from({ length: max - min + 1 }, (_, index) => min + index)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="relative flex-1">
        <input
          className="absolute inset-0 z-10 h-8 w-full cursor-pointer appearance-none bg-transparent opacity-0"
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          step={1}
          type="range"
          value={value}
        />
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#d4cdbd]" />
          <div className="absolute left-0 top-1/2 h-px -translate-y-1/2" style={{ width: `${normalized}%`, backgroundColor: lineColor }} />
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
            {tickValues.map((tick) => (
              <span className="h-1.5 w-px bg-[#d4cdbd]" key={tick} />
            ))}
          </div>
          <span
            className="absolute top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_2px_8px_rgba(15,61,46,0.2)]"
            style={{ left: `${normalized}%`, backgroundColor: lineColor }}
          />
        </div>
      </div>
      <div className={`min-w-[90px] text-left font-serif text-2xl sm:text-right ${tint === "warm" ? "text-[#8c6a44]" : "text-[#0f3d2e]"}`}>
        {value}
        <span className="ml-1 font-sans text-[10px] uppercase tracking-[0.12em] text-[#8a8578]">{valueLabel}</span>
      </div>
    </div>
  )
}

function chipClass(active: boolean) {
  return [
    "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.1em] transition",
    active
      ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4]"
      : "border-[#d4cdbd] text-[#3d4d43] hover:border-[#0f3d2e] hover:text-[#0f3d2e]",
  ].join(" ")
}

function warmChipClass(active: boolean) {
  return [
    "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.08em] transition",
    active
      ? "border-[#b8956a] bg-[#b8956a] text-[#f2ede4]"
      : "border-[#d4b892] text-[#8c6a44] hover:border-[#8c6a44] hover:bg-[rgba(184,149,106,0.08)]",
  ].join(" ")
}
