"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { gsap } from "gsap"

import { buttonVariants } from "@/ui"
import { cn } from "@/lib/utils"
import {
  BUSINESS_OPTIONS,
  BASKET_OPTIONS,
  LEAK_OPTIONS,
  RHYTHM_OPTIONS,
  VOLUME_OPTIONS,
  buildLectureProjection,
  buildRecapItems,
  getLeakOption,
  getSeasonPreset,
  isLectureComplete,
} from "@/lib/parcours-v2"
import { useParcoursFlow } from "@/components/parcours-v2/ParcoursFlowProvider"
import { ParcoursParticles } from "@/components/parcours-v2/ParcoursParticles"
import { ParcoursShell } from "@/components/parcours-v2/ParcoursShell"

const PANELS = ["business", "leak", "params", "diagnostic"] as const

export function LectureStepPage() {
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const { state, updateQueryState, updateState, lectureQuery } = useParcoursFlow()
  const [panelIndex, setPanelIndex] = useState(0)
  const [historyStack, setHistoryStack] = useState<number[]>([])
  const [diagnosticReady, setDiagnosticReady] = useState(false)
  const [projection, setProjection] = useState({ min: 0, max: 0 })
  const projectionRef = useRef<{ min: HTMLSpanElement | null; max: HTMLSpanElement | null }>({ min: null, max: null })

  const recapItems = buildRecapItems(state)
  const leak = getLeakOption(state.leak)
  const lectureComplete = isLectureComplete(state)

  useEffect(() => {
    if (lectureComplete) {
      setPanelIndex(3)
      setDiagnosticReady(true)
      setProjection(buildLectureProjection(state))
      return
    }

    if (state.business && state.leak && state.volume && state.basket && state.rhythm) {
      setPanelIndex(2)
      return
    }

    if (state.business && state.leak) {
      setPanelIndex(2)
      return
    }

    if (state.business) {
      setPanelIndex(1)
      return
    }

    setPanelIndex(0)
  }, [lectureComplete, state])

  useEffect(() => {
    if (!diagnosticReady) return

    const target = buildLectureProjection(state)
    setProjection(target)

    const counter = { min: 0, max: 0 }
    const minEl = projectionRef.current.min
    const maxEl = projectionRef.current.max

    if (!minEl || !maxEl) return

    if (reducedMotion) {
      minEl.textContent = `€${Math.round(target.min).toLocaleString("fr-FR")}`
      maxEl.textContent = `€${Math.round(target.max).toLocaleString("fr-FR")}`
      return
    }

    minEl.textContent = "€0"
    maxEl.textContent = "€0"

    const animation = gsap.to(counter, {
      min: target.min,
      max: target.max,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        minEl.textContent = `€${Math.round(counter.min).toLocaleString("fr-FR")}`
        maxEl.textContent = `€${Math.round(counter.max).toLocaleString("fr-FR")}`
      },
    })

    return () => {
      animation.kill()
    }
  }, [diagnosticReady, reducedMotion, state])

  const canShowDiagnostic = !!(state.volume && state.basket && state.rhythm)

  const nextTo = (nextIndex: number) => {
    setHistoryStack((current) => (nextIndex > panelIndex ? [...current, panelIndex] : current))
    setPanelIndex(nextIndex)
  }

  const goBack = () => {
    setHistoryStack((current) => {
      const copy = [...current]
      const previous = copy.pop()
      if (typeof previous === "number") setPanelIndex(previous)
      return copy
    })
  }

  const goToDiagnostic = () => {
    setDiagnosticReady(true)
    nextTo(3)
  }

  const stableHeaderDim = panelIndex === 3
  const panelKey = PANELS[panelIndex]
  const showBack = panelIndex > 0 && panelIndex < 3

  const stepLabel = useMemo(() => {
    if (!leak) return null
    return {
      point: leak.point,
      lever: leak.lever,
      launch: leak.launch,
    }
  }, [leak])

  return (
    <ParcoursShell backHref="/" stepIndex={0}>
      <ParcoursParticles />

      <section className="relative z-[2] mx-auto max-w-[780px] pb-8">
        <div className={`mb-10 text-center transition-opacity duration-700 ${stableHeaderDim ? "opacity-20" : "opacity-100"}`}>
          <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-[#8a8578]">Étape 01 — Lecture</p>
          <h1 className="font-serif text-[clamp(42px,5.6vw,62px)] leading-[1.05] text-[#1a2a22]">
            Votre <em className="italic text-[#0f3d2e]">lecture.</em>
          </h1>
          <p className="mx-auto mt-4 max-w-[520px] font-serif text-[clamp(17px,1.8vw,20px)] italic leading-[1.5] text-[#3d4d43]">
            On lit l&apos;endroit qui casse la boucle, puis on pose une saison de 90 jours autour.
          </p>
        </div>

        <div className="mb-4 flex min-h-7 items-center">
          {showBack ? (
            <button
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8a8578] transition hover:text-[#0f3d2e]"
              onClick={goBack}
              type="button"
            >
              <span aria-hidden="true">←</span>
              <span className="hidden sm:inline">Retour</span>
            </button>
          ) : null}
        </div>

        <div className="relative min-h-[760px] pb-8 sm:min-h-[640px] md:min-h-[520px]">

          <Panel active={panelKey === "business"}>
            <PanelKicker label="Votre cadre" />
            <PanelQuestion question="Quel est votre métier ?" />
            <PanelHint hint="Un choix net suffit pour charger une saison prête à ajuster." />
            <div className="flex flex-wrap gap-2">
              {BUSINESS_OPTIONS.map((option) => (
                <button
                  className={chipClass(state.business === option.key)}
                  key={option.key}
                  onClick={() => {
                    const preset = getSeasonPreset(option.key)
                    updateState({
                      business: option.key,
                      reward: preset.reward,
                      threshold: preset.threshold,
                      who: preset.who,
                      spread: preset.spread,
                      diamond: preset.diamond,
                      decay: preset.decay,
                    })
                    window.setTimeout(() => nextTo(1), 260)
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Panel>

          <Panel active={panelKey === "leak"}>
            <PanelKicker label="Point de fuite" />
            <PanelQuestion question="Où ça se casse ?" />
            <PanelHint hint="Choisissez le point qui ressemble le plus à votre réalité." />
            <div className="flex flex-col gap-3">
              {LEAK_OPTIONS.map((option) => (
                <button
                  className={[
                    "rounded border px-5 py-4 text-left transition",
                    state.leak === option.key
                      ? "border-[#0f3d2e] bg-[rgba(15,61,46,0.04)]"
                      : "border-[#d4cdbd] bg-[#ece6da] hover:border-[#0f3d2e] hover:bg-[rgba(15,61,46,0.025)]",
                  ].join(" ")}
                  key={option.key}
                  onClick={() => {
                    updateQueryState({ leak: option.key })
                    window.setTimeout(() => nextTo(2), 280)
                  }}
                  type="button"
                >
                  <div className={`font-serif text-[19px] leading-tight ${state.leak === option.key ? "text-[#0f3d2e]" : "text-[#1a2a22]"}`}>
                    {option.label}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-[#8a8578]">{option.subtitle}</div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel active={panelKey === "params"}>
            <PanelKicker label="Cadrage" note="3 choix rapides" />
            <PanelQuestion question="Votre ordre de grandeur." />
            <PanelHint hint="Trois paramètres pour cadrer la saison, le rythme et le cap Diamond." />

            <div className="grid gap-5 md:grid-cols-3">
              <ParamBlock label="Volume / passages">
                {VOLUME_OPTIONS.map((option) => (
                  <button
                    className={chipClass(state.volume === option.key, true)}
                    key={option.key}
                    onClick={() => updateQueryState({ volume: option.key })}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </ParamBlock>

              <ParamBlock label="Panier moyen">
                {BASKET_OPTIONS.map((option) => (
                  <button
                    className={chipClass(state.basket === option.key, true)}
                    key={option.key}
                    onClick={() => updateQueryState({ basket: option.key })}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </ParamBlock>

              <ParamBlock label="Rythme de retour">
                {RHYTHM_OPTIONS.map((option) => (
                  <button
                    className={chipClass(state.rhythm === option.key, true)}
                    key={option.key}
                    onClick={() => updateQueryState({ rhythm: option.key })}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </ParamBlock>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                className={[
                  "inline-flex items-center gap-3 rounded-sm border px-6 py-3 text-[11px] uppercase tracking-[0.2em] transition",
                  canShowDiagnostic
                    ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4] hover:border-[#1a2a22] hover:bg-[#1a2a22]"
                    : "pointer-events-none border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4] opacity-45",
                ].join(" ")}
                onClick={goToDiagnostic}
                type="button"
              >
                <span>Voir la lecture</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </Panel>

          <Panel active={panelKey === "diagnostic"}>
            <div className="rounded-md border border-[#0f3d2e] bg-[#f2ede4] px-6 py-8 shadow-[0_20px_60px_rgba(15,61,46,0.09)] sm:px-10">
              <div className="absolute -mt-[38px] bg-[#f2ede4] px-3 text-[10px] uppercase tracking-[0.3em] text-[#0f3d2e]">
                ◇ Votre lecture Cardin
              </div>

              <DiagnosticBlock label="Point de fuite principal" text={stepLabel?.point ?? ""} visible={diagnosticReady} />
              <DiagnosticBlock label="Le bon levier" text={stepLabel?.lever ?? ""} visible={diagnosticReady} delay={0.12} />
              <DiagnosticBlock label="Ce que Cardin lancerait d'abord" text={stepLabel?.launch ?? ""} visible={diagnosticReady} delay={0.24} />

              <div className={`mt-7 border-t border-dashed border-[#d4cdbd] pt-7 text-center transition-all duration-700 ${diagnosticReady ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                <div className="mb-3 flex items-center justify-center gap-4">
                  <span className="h-px w-6 bg-[#b8956a]/60" />
                  <span className="font-serif text-lg text-[#b8956a]">◇</span>
                  <span className="h-px w-6 bg-[#b8956a]/60" />
                </div>
                <p className="mb-4 text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">Projection sur 30 jours</p>
                <div className="inline-flex items-baseline gap-4 font-serif text-[clamp(38px,4.6vw,52px)] font-medium leading-none text-[#0f3d2e]">
                  <span
                    ref={(node) => {
                      projectionRef.current.min = node
                    }}
                  >
                    €0
                  </span>
                  <span className="text-[0.7em] italic text-[#b8956a]/60">—</span>
                  <span
                    ref={(node) => {
                      projectionRef.current.max = node
                    }}
                  >
                    €0
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#8a8578]">récupérables sur votre activité</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#8a8578]">
                  Saison 90 jours · Diamond visible · premier moment inclus
                </p>
              </div>
            </div>

            <div className={`mt-9 flex flex-col items-center gap-3 transition-opacity duration-700 ${diagnosticReady ? "opacity-100" : "opacity-0"}`}>
              <button
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                onClick={() => router.push(`/parcours/configuration${lectureQuery ? `?${lectureQuery}` : ""}`)}
                type="button"
              >
                Passer à la saison
              </button>
              <p className="text-[11px] italic tracking-[0.1em] text-[#8a8578]">Moment · Impact · Offre — 3 étapes.</p>
            </div>
          </Panel>
        </div>

        <div className="mt-8 flex min-h-16 flex-col gap-4 border-t border-[#d4cdbd] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {recapItems.length === 0 ? (
              <span className="text-[10px] uppercase tracking-[0.14em] italic text-[#8a8578]/70">Vos choix apparaîtront ici</span>
            ) : (
              recapItems.map((item) => (
                <span
                  className="rounded-full border border-[#d4cdbd] px-3 py-1.5 text-[10px] uppercase tracking-[0.08em] text-[#8a8578]"
                  key={item.key}
                >
                  {item.label}
                </span>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {PANELS.map((panel, index) => (
              <div
                className={[
                  "transition-all duration-300",
                  index < panelIndex
                    ? "h-1.5 w-1.5 rounded-full bg-[#0f3d2e]"
                    : index === panelIndex
                      ? panelIndex === 3
                        ? "h-2 w-2 rotate-45 rounded-[1px] bg-[#b8956a]"
                        : "h-1.5 w-[18px] rounded-full bg-[#0f3d2e]"
                      : "h-1.5 w-1.5 rounded-full bg-[#d4cdbd]",
                ].join(" ")}
                key={panel}
              />
            ))}
          </div>
        </div>
      </section>
    </ParcoursShell>
  )
}

function Panel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={[
        "absolute inset-0 flex flex-col justify-center transition-all duration-500",
        active ? "pointer-events-auto translate-x-0 opacity-100" : "pointer-events-none translate-x-10 opacity-0",
      ].join(" ")}
    >
      {children}
    </div>
  )
}

function PanelKicker({ label, note }: { label: string; note?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-[#8a8578]">
      <span className="inline-block h-px w-4 bg-[#b8956a]" />
      <span>{label}</span>
      {note ? <span className="ml-auto text-[10px] normal-case italic tracking-[0.12em] text-[#8a8578]">{note}</span> : null}
    </div>
  )
}

function PanelQuestion({ question }: { question: string }) {
  return <h2 className="mb-2 font-serif text-[clamp(28px,3.2vw,36px)] leading-tight text-[#1a2a22]">{question}</h2>
}

function PanelHint({ hint }: { hint: string }) {
  return <p className="mb-7 text-sm leading-6 text-[#8a8578]">{hint}</p>
}

function ParamBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function DiagnosticBlock({
  label,
  text,
  visible,
  delay = 0,
}: {
  label: string
  text: string
  visible: boolean
  delay?: number
}) {
  return (
    <div
      className={`border-t border-[#d4cdbd] py-4 first:border-t-0 first:pt-1 transition-all duration-700 ${visible ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="mb-1 text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">{label}</div>
      <div className="font-serif text-[17px] leading-[1.55] text-[#1a2a22]">{text}</div>
    </div>
  )
}

function chipClass(active: boolean, compact = false) {
  return [
    "rounded-full border transition",
    compact ? "px-4 py-2 text-[10.5px]" : "px-5 py-3 text-[12px]",
    "uppercase tracking-[0.12em]",
    active
      ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4]"
      : "border-[#d4cdbd] text-[#3d4d43] hover:border-[#0f3d2e] hover:text-[#0f3d2e]",
  ].join(" ")
}
