"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useMemo, useState } from "react"

import { getDemoWorldContent } from "@/lib/demo-content"
import {
  LANDING_PRICING,
  LANDING_WORLD_ORDER,
  LANDING_WORLDS,
  type LandingWorldId,
} from "@/lib/landing-content"
import { buildParcoursEngineHref, type ParcoursSummitStyleId } from "@/lib/parcours-contract"

/** Six internal steps (single product stack). */
export type ParcoursStepId = "entry" | "lecture" | "summit" | "mechanics" | "projection" | "activation"

type MechanicId = "return" | "surprise" | "domino" | "diamond" | "season"

type StepMeta = { id: ParcoursStepId; eyebrow: string; title: string; lead: string; cta: string }
type SummitOption = {
  id: ParcoursSummitStyleId
  label: string
  description: string
  metric: string
  multiplier: number
}
type MechanicOption = { id: MechanicId; index: string; title: string; description: string; proof: string }
type Reading = {
  clientsPerDay: number
  lostClientsPerMonth: number
  lostRevenuePerMonth: number
  currentReturnRate: number
  recoverableRate: number
}

/** Three external phases shown in chrome (not 6 micro-steps). */
const PARCOURS_PHASES = [
  { id: "setup", label: "Mise en place" },
  { id: "tension", label: "Tension" },
  { id: "decision", label: "Décision" },
] as const

function phaseIndexForStep(stepIndex: number): number {
  if (stepIndex <= 1) return 0
  if (stepIndex <= 4) return 1
  return 2
}

const STEPS: StepMeta[] = [
  {
    id: "entry",
    eyebrow: "Étape 1 — Entrée",
    title: "Quel lieu connectez-vous ?",
    lead: "Le système s'adapte au type de commerce. Commencez par votre monde réel.",
    cta: "Continuer",
  },
  {
    id: "lecture",
    eyebrow: "Étape 2 — Lecture",
    title: "Ce que le lieu perd aujourd'hui.",
    lead: "Avant toute promesse, le manque est visible: passage perdu, retour absent, revenu non capté.",
    cta: "Voir le sommet",
  },
  {
    id: "summit",
    eyebrow: "Étape 3 — Activation",
    title: "Comment déclencher le retour.",
    lead: "Le grand prix définit la force du rappel. Plus il est lisible, plus le retour client monte.",
    cta: "Lire la mécanique",
  },
  {
    id: "mechanics",
    eyebrow: "Étape 4 — Mécanique",
    title: "Ce qui fait revenir les gens.",
    lead: "Le parcours reste simple pour le client, mais précis pour le commerce.",
    cta: "Voir la projection",
  },
  {
    id: "projection",
    eyebrow: "Étape 5 — Projection",
    title: "Impact sur le revenu.",
    lead: "Les chiffres viennent du passage, du retour client et du réseau activé.",
    cta: "Passer à l'activation",
  },
  {
    id: "activation",
    eyebrow: "Étape 6 — Lancement",
    title: "Le moteur tourne.",
    lead: "Le système est actif: QR prêt, carte client en place, et lecture immédiate du revenu récupéré.",
    cta: "Revoir le parcours",
  },
]

const SUMMIT_OPTIONS: SummitOption[] = [
  {
    id: "visible",
    label: "Sommet visible",
    description: "Le client comprend ce qu'il débloque. Objectif clair.",
    metric: "×1,00",
    multiplier: 1,
  },
  {
    id: "stronger",
    label: "Sommet renforcé",
    description: "Récompense amplifiée. Le retour et le réseau montent plus vite.",
    metric: "×1,25",
    multiplier: 1.25,
  },
  {
    id: "discreet",
    label: "Sommet discret",
    description: "Version plus sélective. Surprise forte, communication plus rare.",
    metric: "×0,85",
    multiplier: 0.85,
  },
]

const MECHANICS: MechanicOption[] = [
  {
    id: "return",
    index: "01",
    title: "Il revient",
    description: "La progression crée une raison de repasser.",
    proof: "Il voit où il en est. Il ne veut pas repartir à zéro.",
  },
  {
    id: "surprise",
    index: "02",
    title: "Il reçoit quelque chose tôt",
    description: "Pas à la 10e visite. Variable. Imprévisible.",
    proof: "Une récompense précoce augmente la fréquence sans dégrader la marge en continu.",
  },
  {
    id: "domino",
    index: "03",
    title: "Il amène quelqu'un",
    description: "Une personne en amène une autre. Le réseau s'active.",
    proof: "Le bouche-à-oreille devient mesurable, pas seulement espéré.",
  },
  {
    id: "diamond",
    index: "04",
    title: "Le grand prix compte",
    description: "Le sommet donne une raison nette de revenir.",
    proof: "Le prix final structure le désir et ancre la mémoire du lieu.",
  },
  {
    id: "season",
    index: "05",
    title: "Vision long terme",
    description: "Cartes limitées. Chaque saison pèse davantage.",
    proof: "La saison structure la valeur et prépare la suite commerciale.",
  },
]

const READINGS: Record<LandingWorldId, Reading> = {
  cafe: {
    clientsPerDay: 80,
    lostClientsPerMonth: 312,
    lostRevenuePerMonth: 1950,
    currentReturnRate: 25,
    recoverableRate: 35,
  },
  restaurant: {
    clientsPerDay: 50,
    lostClientsPerMonth: 195,
    lostRevenuePerMonth: 5070,
    currentReturnRate: 18,
    recoverableRate: 35,
  },
  beaute: {
    clientsPerDay: 12,
    lostClientsPerMonth: 47,
    lostRevenuePerMonth: 3990,
    currentReturnRate: 20,
    recoverableRate: 35,
  },
  boutique: {
    clientsPerDay: 40,
    lostClientsPerMonth: 156,
    lostRevenuePerMonth: 8580,
    currentReturnRate: 17,
    recoverableRate: 35,
  },
}

const WORLD_CODES: Record<LandingWorldId, string> = {
  cafe: "CA",
  restaurant: "RE",
  beaute: "BE",
  boutique: "BO",
}

const formatEuro = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

const clampRange = (value: number, multiplier: number) => ({
  low: Math.round(value * multiplier * 0.88),
  high: Math.round(value * multiplier * 1.14),
  adjusted: Math.round(value * multiplier),
})

function buildBars(months: 3 | 6) {
  return Array.from({ length: months }, (_, index) => ({
    label: `M${index + 1}`,
    height: Math.round(38 + ((index + 1) / months) * 50),
  }))
}

const stepTransition = { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] as const }

export type ParcoursOnboardingVariant = "standalone" | "embedded"

type ParcoursOnboardingCoreProps = {
  variant: ParcoursOnboardingVariant
}

export function ParcoursOnboardingCore({ variant }: ParcoursOnboardingCoreProps) {
  const [worldId, setWorldId] = useState<LandingWorldId>("cafe")
  const [stepIndex, setStepIndex] = useState(0)
  const [summitId, setSummitId] = useState<ParcoursSummitStyleId>("stronger")
  const [mechanicId, setMechanicId] = useState<MechanicId>("return")
  /** Season length for CTA and season totals; revenue still from `getDemoWorldContent` monthly × months. */
  const [seasonMonths, setSeasonMonths] = useState<3 | 6>(3)

  const demo = getDemoWorldContent(worldId)
  const step = STEPS[stepIndex]
  const reading = READINGS[worldId]
  const world = LANDING_WORLDS[worldId]
  const summit = SUMMIT_OPTIONS.find((item) => item.id === summitId) ?? SUMMIT_OPTIONS[1]
  const phaseIndex = phaseIndexForStep(stepIndex)

  useEffect(() => {
    setSeasonMonths(demo.seasonMonths)
  }, [worldId, demo.seasonMonths])

  const monthlyRange = useMemo(
    () => clampRange(demo.projectedMonthlyRevenue, summit.multiplier),
    [demo.projectedMonthlyRevenue, summit.multiplier],
  )

  const seasonBase = demo.projectedMonthlyRevenue * seasonMonths
  const seasonRange = useMemo(
    () => clampRange(seasonBase, summit.multiplier),
    [seasonBase, summit.multiplier],
  )

  const recoveredScaled = useMemo(() => {
    const base = demo.projectedRecoveredClients
    return Math.max(1, Math.round((base * seasonMonths) / demo.seasonMonths))
  }, [demo.projectedRecoveredClients, demo.seasonMonths, seasonMonths])

  const engineHref = buildParcoursEngineHref({ worldId, summitStyle: summitId, seasonMonths })

  const goNext = useCallback(() => {
    setStepIndex((value) => (value === STEPS.length - 1 ? 0 : value + 1))
  }, [])

  const goPrev = useCallback(() => {
    setStepIndex((value) => Math.max(0, value - 1))
  }, [])

  const content = (
    <>
      {variant === "standalone" ? (
        <header className="sticky top-0 z-40 border-b border-[#E8E3D9]/80 bg-[#F7F3EA]/92 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 pb-3 pt-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                <Link
                  className="shrink-0 text-[13px] font-medium text-[#173A2E] sm:text-[15px]"
                  href="/landing"
                >
                  ← Accueil
                </Link>
                <div className="hidden h-4 w-px bg-[#D9D5CC] sm:block" />
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                  {PARCOURS_PHASES.map((ph, i) => {
                    const active = i === phaseIndex
                    const done = i < phaseIndex
                    return (
                      <span
                        className={[
                          "truncate text-[10px] uppercase tracking-[0.14em] sm:text-[11px]",
                          active ? "font-semibold text-[#0F523D]" : done ? "text-[#5C665E]" : "text-[#9A9A94]",
                        ].join(" ")}
                        key={ph.id}
                      >
                        {ph.label}
                        {i < PARCOURS_PHASES.length - 1 ? (
                          <span className="hidden text-[#C9C4BC] sm:inline"> · </span>
                        ) : null}
                      </span>
                    )
                  })}
                </div>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-[#7A817A] tabular-nums">
                {stepIndex + 1}/{STEPS.length}
              </span>
            </div>
            <div className="h-[2px] w-full overflow-hidden rounded-full bg-[#E4DFD4]">
              <motion.div
                animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                className="h-full rounded-full bg-[#0F523D]"
                initial={false}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
            <StepDots accent="forest" onSelectStep={setStepIndex} stepIndex={stepIndex} />
          </div>
        </header>
      ) : (
        <div className="border-b border-[#E3DDD0] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Parcours marchand</p>
              <p className="mt-1 text-sm text-[#566159]">
                {PARCOURS_PHASES[phaseIndex].label} — {step.eyebrow.replace(/^Étape \d+ — /, "")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {PARCOURS_PHASES.map((ph, i) => (
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
                    i === phaseIndex ? "bg-[#EEF3EC] text-[#173A2E]" : "text-[#9A9A94]",
                  ].join(" ")}
                  key={ph.id}
                >
                  {ph.label}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 h-[2px] w-full overflow-hidden rounded-full bg-[#E4DFD4]">
            <motion.div
              animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              className="h-full rounded-full bg-[#173A2E]"
              initial={false}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          <div className="mt-3 flex justify-center sm:justify-end">
            <StepDots accent="landing" onSelectStep={setStepIndex} stepIndex={stepIndex} />
          </div>
        </div>
      )}

      <div className={variant === "standalone" ? "mx-auto max-w-5xl px-5 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10" : "px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10"}>
        <div className={variant === "embedded" ? "mx-auto max-w-4xl" : "mx-auto max-w-3xl lg:mt-0"}>
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 14 }}
              key={step.id}
              transition={stepTransition}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7A817A]">{step.eyebrow}</p>
              <h1
                className={
                  variant === "standalone"
                    ? "mt-4 font-serif text-[clamp(2.2rem,7vw,5.4rem)] leading-[0.96] text-[#0F523D]"
                    : "mt-3 font-serif text-[clamp(2rem,6vw,4.7rem)] leading-[0.98] text-[#173328]"
                }
              >
                {step.title}
              </h1>
              <p className="mt-5 max-w-xl text-[1.05rem] leading-8 text-[#59635C]">{step.lead}</p>

              <div className="mt-10">
                <StepBody
                  demo={demo}
                  engineHref={engineHref}
                  mechanicId={mechanicId}
                  monthlyRange={monthlyRange}
                  reading={reading}
                  recoveredScaled={recoveredScaled}
                  seasonMonths={seasonMonths}
                  seasonRange={seasonRange}
                  setMechanicId={setMechanicId}
                  setSeasonMonths={setSeasonMonths}
                  setSummitId={setSummitId}
                  setWorldId={setWorldId}
                  stepId={step.id}
                  summitId={summitId}
                  variant={variant}
                  world={world}
                  worldId={worldId}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              className="inline-flex h-12 min-w-[7rem] items-center justify-center rounded-full border border-[#D8D4CB] bg-[#F4F1E9] px-6 text-sm font-medium text-[#173A2E] transition disabled:opacity-35"
              disabled={stepIndex === 0}
              onClick={goPrev}
              type="button"
            >
              Précédent
            </button>
            <button
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#0F523D] bg-[#0F523D] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#1B664F]"
              onClick={goNext}
              type="button"
            >
              {step.cta}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  if (variant === "standalone") {
    return <main className="min-h-[calc(100vh-56px)] bg-[#F7F3EA] text-[#18271F]">{content}</main>
  }

  return <div className="text-[#18271F]">{content}</div>
}

function StepDots({
  stepIndex,
  onSelectStep,
  accent,
}: {
  stepIndex: number
  onSelectStep: (index: number) => void
  accent: "forest" | "landing"
}) {
  const on = accent === "landing" ? "bg-[#173A2E]" : "bg-[#0F523D]"
  return (
    <div className="flex items-center justify-end gap-2">
      {STEPS.map((item, index) => {
        const active = index < stepIndex
        const current = index === stepIndex
        return (
          <div className="flex items-center gap-2" key={item.id}>
            <button
              aria-label={item.title}
              className={[
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                active || current ? on : "bg-[#D9D5CC]",
                current ? "scale-125" : "scale-100",
              ].join(" ")}
              onClick={() => onSelectStep(index)}
              type="button"
            />
            {index < STEPS.length - 1 ? (
              <span className={["h-px w-4 sm:w-5", active ? on : "bg-[#D9D5CC]"].join(" ")} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

type StepBodyProps = {
  variant: ParcoursOnboardingVariant
  stepId: ParcoursStepId
  worldId: LandingWorldId
  setWorldId: (id: LandingWorldId) => void
  seasonMonths: 3 | 6
  setSeasonMonths: (m: 3 | 6) => void
  reading: Reading
  world: (typeof LANDING_WORLDS)[LandingWorldId]
  summitId: ParcoursSummitStyleId
  setSummitId: (id: ParcoursSummitStyleId) => void
  mechanicId: MechanicId
  setMechanicId: (id: MechanicId) => void
  monthlyRange: { low: number; high: number; adjusted: number }
  seasonRange: { low: number; high: number; adjusted: number }
  demo: ReturnType<typeof getDemoWorldContent>
  recoveredScaled: number
  engineHref: string
}

function StepBody(props: StepBodyProps) {
  const {
    variant,
    stepId,
    worldId,
    setWorldId,
    seasonMonths,
    setSeasonMonths,
    reading,
    world,
    summitId,
    setSummitId,
    mechanicId,
    setMechanicId,
    monthlyRange,
    seasonRange,
    demo,
    recoveredScaled,
    engineHref,
  } = props

  if (stepId === "entry") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {([3, 6] as const).map((m) => (
            <button
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                seasonMonths === m
                  ? "border-[#0F523D] bg-[#EEF4F0] text-[#0F523D]"
                  : "border-[#E3DED3] bg-[#FCFBF7] text-[#59635C] hover:border-[#B8C6BC]",
              ].join(" ")}
              key={m}
              onClick={() => setSeasonMonths(m)}
              type="button"
            >
              Saison {m} mois
            </button>
          ))}
          <span className="self-center text-xs text-[#7A817A]">(prix et cumul saison)</span>
        </div>
        {LANDING_WORLD_ORDER.map((candidate) => {
          const candidateReading = READINGS[candidate]
          const active = candidate === worldId
          return (
            <button
              className={[
                "w-full rounded-[1.6rem] border px-5 py-5 text-left transition duration-300",
                active
                  ? "border-[#7EA694] bg-[#EEF4F0] shadow-[0_18px_40px_-34px_rgba(15,82,61,0.35)]"
                  : "border-[#E3DED3] bg-[#FCFBF7] hover:border-[#B8C6BC] hover:bg-[#F6F4ED]",
              ].join(" ")}
              key={candidate}
              onClick={() => setWorldId(candidate)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E6E1D8] bg-[#FFFEFA] text-[0.75rem] font-semibold tracking-[0.12em] text-[#0F523D]">
                    {WORLD_CODES[candidate]}
                  </span>
                  <div>
                    <p className="text-[1.35rem] font-medium text-[#173A2E]">{LANDING_WORLDS[candidate].label}</p>
                    <p className="mt-1 text-sm text-[#677168]">{LANDING_WORLDS[candidate].onboardingLead}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-[#6E766E]">
                  <p>{candidateReading.clientsPerDay} clients / jour</p>
                  <p className="mt-1">~{candidateReading.lostClientsPerMonth} perdus / mois</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  if (stepId === "lecture") {
    return (
      <div className="space-y-5">
        <div className="rounded-[1.9rem] bg-[#0B4F3C] p-7 text-[#FBFAF6] shadow-[0_28px_60px_-38px_rgba(11,79,60,0.45)] sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#AFC7BE]">Clients perdus chaque mois</p>
          <p className="mt-4 font-serif text-[clamp(3.6rem,9vw,5.6rem)] leading-none">~{reading.lostClientsPerMonth}</p>
          <p className="mt-3 text-sm text-[#D5E2DC]">soit {formatEuro(reading.lostRevenuePerMonth)} de revenu non capté</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Passage" value={`${reading.clientsPerDay}/jour`} note="base de lecture" />
          <MetricCard label="Retour actuel" value={`${reading.currentReturnRate}%`} note="sans Cardin" />
          <MetricCard label="Récupérable" value={`${reading.recoverableRate}%`} note="revenu récupéré possible" />
        </div>
      </div>
    )
  }

  if (stepId === "summit") {
    return (
      <div className="space-y-4">
        {SUMMIT_OPTIONS.map((item) => {
          const active = item.id === summitId
          const scenarioRange = clampRange(demo.projectedMonthlyRevenue, item.multiplier)
          return (
            <button
              className={[
                "w-full rounded-[1.6rem] border p-5 text-left transition duration-300",
                active
                  ? "border-[#C5A355] bg-[linear-gradient(180deg,#FBF3DB_0%,#F6E8BF_100%)] shadow-[0_18px_40px_-32px_rgba(140,114,34,0.24)]"
                  : "border-[#E3DED3] bg-[#FCFBF7] hover:border-[#D1C17F] hover:bg-[#FBF8EF]",
              ].join(" ")}
              key={item.id}
              onClick={() => setSummitId(item.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-medium text-[#173A2E]">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-[#5F665E]">{item.description}</p>
                  <p className="mt-2 text-xs text-[#6F766F]">
                    revenu estimé: +{scenarioRange.low.toLocaleString("fr-FR")}–{scenarioRange.high.toLocaleString("fr-FR")}{" "}
                    € / mois
                  </p>
                </div>
                <p className="pt-1 text-2xl font-semibold text-[#B38A2D]">{item.metric}</p>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  if (stepId === "mechanics") {
    return (
      <div className="space-y-3">
        {MECHANICS.map((item) => {
          const active = item.id === mechanicId
          return (
            <motion.div className="overflow-hidden rounded-[1.45rem] border border-[#E3DED3] bg-[#FCFBF7]" key={item.id} layout>
              <button
                className={[
                  "flex w-full items-start justify-between gap-4 p-5 text-left transition",
                  active ? "bg-[#F4FAF6]" : "hover:bg-[#FAFAF6]",
                ].join(" ")}
                onClick={() => setMechanicId(item.id)}
                type="button"
              >
                <div className="flex items-start gap-4">
                  <span className="pt-1 font-mono text-xs text-[#7A817A]">{item.index}</span>
                  <div>
                    <p className="text-lg font-medium text-[#173A2E]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#5F665E]">{item.description}</p>
                  </div>
                </div>
                <motion.span animate={{ rotate: active ? 45 : 0 }} className="text-lg text-[#7A817A]" transition={{ duration: 0.2 }}>
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {active ? (
                  <motion.div
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <div className="border-t border-[#DCE5DE] px-5 pb-5 pt-0">
                      <div className="pt-4">
                        <MechanicVisual mechanicId={item.id} seasonMonths={seasonMonths} />
                        <p className="mt-4 text-sm leading-7 text-[#4F5B54]">{item.proof}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    )
  }

  if (stepId === "projection") {
    const summitOption = SUMMIT_OPTIONS.find((s) => s.id === summitId) ?? SUMMIT_OPTIONS[1]
    return (
      <ProjectionReveal
        bars={buildBars(seasonMonths)}
        confidenceLabel={demo.confidenceLabel}
        demo={demo}
        monthlyRange={monthlyRange}
        recoveredScaled={recoveredScaled}
        seasonMonths={seasonMonths}
        seasonRange={seasonRange}
        summitMetric={summitOption.metric}
      />
    )
  }

  if (stepId === "activation") {
    return (
      <div className="space-y-5">
        <div className="rounded-[1.9rem] bg-[#0B4F3C] p-7 text-[#FBFAF6] shadow-[0_28px_60px_-38px_rgba(11,79,60,0.45)] sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#AFC7BE]">Ordre de gain mensuel</p>
          <p className="mt-4 font-serif text-[clamp(3.2rem,8vw,5.1rem)] leading-none">
            +{monthlyRange.low.toLocaleString("fr-FR")}–{monthlyRange.high.toLocaleString("fr-FR")} €
          </p>
          <p className="mt-4 text-sm text-[#D5E2DC]">
            {demo.projectedMonthlyReturns} retours / mois · {recoveredScaled} clients récupérés sur {seasonMonths} mois ·
            payback ~{demo.projectedPaybackDays} j
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Revenu saison"
            value={`${seasonRange.low.toLocaleString("fr-FR")}–${seasonRange.high.toLocaleString("fr-FR")} €`}
            note={demo.confidenceLabel}
          />
          <MetricCard label="Activation" value={`${LANDING_PRICING.activationFee} €`} note="mise en place" />
          <MetricCard label="Récurrent" value={`${LANDING_PRICING.recurringFee} €`} note="par mois de saison" />
        </div>
        <motion.details className="rounded-[1.5rem] border border-[#E3DED3] bg-[#FCFBF7] p-5 text-[#173A2E]" initial={false}>
          <summary className="cursor-pointer text-sm font-medium outline-none transition hover:text-[#0F523D]">
            Voir la configuration
          </summary>
          <motion.div
            animate={{ opacity: 1 }}
            className="mt-4 grid gap-3 text-sm text-[#5F665E] sm:grid-cols-2"
            initial={{ opacity: 0.85 }}
            transition={{ duration: 0.2 }}
          >
            <p>
              {world.label} — {world.eyebrow}
            </p>
            <p>
              Saison {seasonMonths} mois · {demo.seasonLabel}
            </p>
            <p>{demo.projectedMonthlyReturns} retours clients projetés / mois</p>
            <p>{formatEuro(demo.projectedMonthlyRevenue * seasonMonths)} revenu saisonnier (base)</p>
          </motion.div>
        </motion.details>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#FFFEFA] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F6F3EB]"
            href={engineHref}
          >
            Ajuster le système
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#24533F]"
            href={variant === "embedded" ? "#methode" : "/landing#methode"}
          >
            Voir le simulateur
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#0F523D] bg-[#0F523D] px-6 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#1B664F]"
            href="/demo"
          >
            Voir la démo client
          </Link>
        </div>
      </div>
    )
  }

  return null
}

function ProjectionReveal({
  monthlyRange,
  seasonRange,
  demo,
  seasonMonths,
  recoveredScaled,
  confidenceLabel,
  summitMetric,
  bars,
}: {
  monthlyRange: { low: number; high: number; adjusted: number }
  seasonRange: { low: number; high: number; adjusted: number }
  demo: ReturnType<typeof getDemoWorldContent>
  seasonMonths: 3 | 6
  recoveredScaled: number
  confidenceLabel: string
  summitMetric: string
  bars: { label: string; height: number }[]
}) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    setStage(0)
    const t1 = window.setTimeout(() => setStage(1), 380)
    const t2 = window.setTimeout(() => setStage(2), 780)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [seasonMonths, demo.projectedMonthlyRevenue, monthlyRange.adjusted])

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#E3DED3] bg-[#FCFBF7] p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817A]">Revenu cumulé sur {seasonMonths} mois</p>
        <div className="mt-5 flex h-44 items-end gap-3 rounded-[1.25rem] border border-[#ECE7DC] bg-[linear-gradient(180deg,#F8F6EF_0%,#F2EEE4_100%)] px-4 pb-5 pt-8 sm:gap-4 sm:px-5">
          {bars.map((bar) => (
            <div className="flex-1" key={bar.label}>
              <div className="flex h-24 items-end">
                <motion.div
                  animate={{ height: stage >= 1 ? `${bar.height}%` : "0%" }}
                  className="w-full rounded-t-[1rem] bg-[linear-gradient(180deg,#2B5B48_0%,#0F523D_100%)]"
                  initial={{ height: "0%" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-3 text-center text-xs text-[#677168]">{bar.label}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage >= 2 ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 16 }}
            key="full"
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="rounded-[1.9rem] bg-[#0B4F3C] p-7 text-[#FBFAF6] shadow-[0_28px_60px_-38px_rgba(11,79,60,0.45)] sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#AFC7BE]">Revenu supplémentaire / mois</p>
              <p className="mt-4 font-serif text-[clamp(3.2rem,8vw,5.1rem)] leading-none">
                +{monthlyRange.low.toLocaleString("fr-FR")}–{monthlyRange.high.toLocaleString("fr-FR")} €
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Retours / mois" value={`${demo.projectedMonthlyReturns}`} note="affluence générée" />
              <MetricCard label="Clients récupérés" value={`${recoveredScaled}`} note={`sur ${seasonMonths} mois`} />
              <MetricCard label="Payback" value={`${demo.projectedPaybackDays} j`} note="amortissement" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Sommet" value={summitMetric} note="sélection" />
              <MetricCard
                label="Saison (plage)"
                value={`${seasonRange.low.toLocaleString("fr-FR")}–${seasonRange.high.toLocaleString("fr-FR")} €`}
                note={confidenceLabel}
              />
              <MetricCard
                label="Revenu saison (base)"
                value={formatEuro(Math.round(demo.projectedMonthlyRevenue * seasonMonths))}
                note="avant sommet marketing"
              />
            </div>
          </motion.div>
        ) : (
          <motion.p
            animate={{ opacity: 1 }}
            className="text-center text-sm text-[#7A817A]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0.6 }}
            key="wait"
          >
            Construction de la courbe…
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function MechanicVisual({ mechanicId, seasonMonths }: { mechanicId: MechanicId; seasonMonths: 3 | 6 }) {
  if (mechanicId === "return") {
    const visits = ["V1", "V2", "V3", "V4", "V5", "Diamond"]
    return (
      <div>
        <div className="flex items-center justify-between gap-2">
          {visits.map((visit, index) => {
            const active = index <= 1
            const isDiamond = visit === "Diamond"
            return (
              <div className="flex flex-col items-center" key={visit}>
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border text-[10px]",
                    active ? "border-[#7EA694] bg-[#DDEFE5] text-[#0F523D]" : "border-[#D8DCD3] bg-[#FBFBF8] text-[#8E948B]",
                    isDiamond ? "border-[#C5A355] text-[#A17D31]" : "",
                  ].join(" ")}
                >
                  {isDiamond ? "D" : "•"}
                </span>
                <span className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[#7D857D]">{visit}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-[#E4E8DF]">
          <div className="h-1.5 w-[37.5%] rounded-full bg-[#8FB1A2]" />
        </div>
        <div className="mt-2 text-right text-xs text-[#7A817A]">3 / 8</div>
      </div>
    )
  }

  if (mechanicId === "surprise") {
    const classic = [14, 14, 14, 14, 14, 14, 14, 14, 14, 56]
    const cardin = [14, 56, 14, 38, 14, 30, 14, 44, 14, 56]
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <BarGroup bars={classic} label="Système classique" sublabel="attendre ×10" />
        <BarGroup bars={cardin} highlight label="Cardin" sublabel="variable et vivant" />
      </div>
    )
  }

  if (mechanicId === "domino") {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Carte A" value="50" note="cartes initiales" />
        <MetricCard label="Carte B" value="+50" note="invitation 1:1" />
        <MetricCard label="Carte C" value="+50" note="deuxième cercle" />
      </div>
    )
  }

  if (mechanicId === "diamond") {
    return (
      <div className="rounded-[1.2rem] border border-[#C5A355]/40 bg-[linear-gradient(180deg,#FBF8EF_0%,#F4EDE0_100%)] p-4">
        <p className="text-sm font-medium text-[#173A2E]">Diamond verrouille le sommet</p>
        <p className="mt-2 text-sm text-[#5F665E]">Le client voit la récompense finale avant la fin de la saison.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <MetricCard label="Saison" value={`${seasonMonths} mois`} note="cycle" />
      <MetricCard label="Cartes" value="50" note="sélectives" />
      <MetricCard label="Traction" value="S2" note="preuve cumulée" />
    </div>
  )
}

function BarGroup({
  bars,
  label,
  sublabel,
  highlight,
}: {
  bars: number[]
  label: string
  sublabel: string
  highlight?: boolean
}) {
  return (
    <div>
      <p className={["text-[10px] uppercase tracking-[0.14em]", highlight ? "text-[#173A2E]" : "text-[#899188]"].join(" ")}>
        {label}
      </p>
      <div className="mt-3 flex h-16 items-end gap-1">
        {bars.map((height, index) => (
          <div
            className={["flex-1 rounded-t-sm", highlight ? "bg-[#AFC4B6]" : "bg-[#E1E7E0]"].join(" ")}
            key={`${label}-${index}`}
            style={{ height }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-[#7A827B]">{sublabel}</p>
    </div>
  )
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[#E3DED3] bg-[#FCFBF7] p-5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817A]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#173A2E]">{value}</p>
      <p className="mt-2 text-xs leading-6 text-[#6E766E]">{note}</p>
    </div>
  )
}
