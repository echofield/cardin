
"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { getDemoWorldContent } from "@/lib/demo-content"
import { LANDING_PRICING, LANDING_WORLD_ORDER, LANDING_WORLDS, type LandingWorldId } from "@/lib/landing-content"

type OnboardingStepId = "lecture" | "summit" | "mechanics" | "projection" | "activation"
type SummitStyleId = "visible" | "stronger" | "discreet"
type MechanicId = "return" | "surprise" | "domino" | "diamond" | "season"

type OnboardingStep = {
  id: OnboardingStepId
  eyebrow: string
  label: string
  audience: "Commerçant" | "Client" | "Projection"
}

type SummitOption = {
  id: SummitStyleId
  label: string
  description: string
  metric: string
  metricLabel: string
  multiplier: number
}

type MechanicItem = {
  id: MechanicId
  index: string
  title: string
  description: string
  summary: string
}

type WorldReading = {
  clientsPerDay: number
  lostClientsPerMonth: number
  lostRevenuePerMonth: number
  currentReturnRate: number
  recoverableRate: number
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "lecture", eyebrow: "Étape 1", label: "Lecture", audience: "Commerçant" },
  { id: "summit", eyebrow: "Étape 2", label: "Sommet", audience: "Commerçant" },
  { id: "mechanics", eyebrow: "Étape 3", label: "Mécanique", audience: "Commerçant" },
  { id: "projection", eyebrow: "Étape 4", label: "Projection", audience: "Projection" },
  { id: "activation", eyebrow: "Étape 5", label: "Activation", audience: "Commerçant" },
]

const SUMMIT_OPTIONS: SummitOption[] = [
  {
    id: "visible",
    label: "Sommet visible",
    description: "Le client voit sa progression et sait ce qu'il débloque. Le retour devient lisible.",
    metric: "×1,00",
    metricLabel: "base",
    multiplier: 1,
  },
  {
    id: "stronger",
    label: "Sommet renforcé",
    description: "Récompense renforcée. Elle accélère le retour et met le réseau en mouvement.",
    metric: "×1,25",
    metricLabel: "revenu amplifié",
    multiplier: 1.25,
  },
  {
    id: "discreet",
    label: "Sommet discret",
    description: "Réservé aux initiés. L'effet de surprise crée du désir sans promesse affichée.",
    metric: "×0,85",
    metricLabel: "version sélective",
    multiplier: 0.85,
  },
]

const MECHANIC_ITEMS: MechanicItem[] = [
  {
    id: "return",
    index: "01",
    title: "Il revient",
    description: "La progression crée une raison de repasser.",
    summary: "Le client ne revient pas pour finir une ligne. Il revient pour continuer un parcours.",
  },
  {
    id: "surprise",
    index: "02",
    title: "Il reçoit quelque chose tôt",
    description: "Pas à la 10e visite. Variable. Imprévisible.",
    summary: "Dès la 2e visite, quelque chose peut arriver. L'attente reste vivante sans devenir confuse.",
  },
  {
    id: "domino",
    index: "03",
    title: "Il amène quelqu'un",
    description: "Cette personne en amène une autre. Et ainsi de suite.",
    summary: "Le Domino reste simple : une personne invite une personne. Cet accomplissement compte pour le grand prix.",
  },
  {
    id: "diamond",
    index: "04",
    title: "Grand Diamond",
    description: "Le sommet visible dès le début donne une raison claire de revenir.",
    summary: "Le grand prix rend le parcours mémorable. Ce n'est pas une remise. C'est un sommet.",
  },
  {
    id: "season",
    index: "05",
    title: "Vision long terme",
    description: "Cartes limitées. Chaque saison compte davantage.",
    summary: "La saison ferme le système, crée une rareté claire et permet de relancer proprement un nouveau cycle.",
  },
]

const WORLD_READINGS: Record<LandingWorldId, WorldReading> = {
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

function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function clampRange(value: number, multiplier: number) {
  const adjusted = Math.round(value * multiplier)
  return {
    low: Math.round(adjusted * 0.88),
    high: Math.round(adjusted * 1.14),
    adjusted,
  }
}

export function LandingOnboardingJourney() {
  const [selectedWorldId, setSelectedWorldId] = useState<LandingWorldId>("cafe")
  const [selectedStepId, setSelectedStepId] = useState<OnboardingStepId>("lecture")
  const [selectedSummitId, setSelectedSummitId] = useState<SummitStyleId>("stronger")
  const [selectedMechanicId, setSelectedMechanicId] = useState<MechanicId>("surprise")

  const selectedWorld = LANDING_WORLDS[selectedWorldId]
  const reading = WORLD_READINGS[selectedWorldId]
  const demo = getDemoWorldContent(selectedWorldId)
  const selectedStep = ONBOARDING_STEPS.find((step) => step.id === selectedStepId) ?? ONBOARDING_STEPS[0]
  const selectedStepIndex = ONBOARDING_STEPS.findIndex((step) => step.id === selectedStep.id)
  const selectedSummit = SUMMIT_OPTIONS.find((option) => option.id === selectedSummitId) ?? SUMMIT_OPTIONS[1]
  const selectedMechanic = MECHANIC_ITEMS.find((item) => item.id === selectedMechanicId) ?? MECHANIC_ITEMS[1]
  const engineHref = `/engine?template=${selectedWorldId}&season=${demo.seasonMonths}`
  const projectionRange = useMemo(
    () => clampRange(demo.projectedMonthlyRevenue, selectedSummit.multiplier),
    [demo.projectedMonthlyRevenue, selectedSummit.multiplier]
  )
  const seasonRange = useMemo(
    () => clampRange(demo.projectedSeasonRevenue, selectedSummit.multiplier),
    [demo.projectedSeasonRevenue, selectedSummit.multiplier]
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14" id="onboarding">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#DED9CF] bg-[linear-gradient(180deg,#FFFEFA_0%,#F4F0E7_100%)] p-3.5 shadow-[0_32px_90px_-60px_rgba(24,39,31,0.4)] sm:p-6 lg:p-8">
        <div className="absolute left-[-80px] top-[-80px] h-[220px] w-[220px] rounded-full bg-[#EDF1EA] blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-60px] h-[260px] w-[260px] rounded-full bg-[#ECE2C8] blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-4 border-b border-[#E6E0D5] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Parcours marchand</p>
              <h2 className="mt-3 max-w-4xl font-serif text-[clamp(2.6rem,7vw,4.9rem)] leading-[1.02] text-[#173328]">
                Voir le manque. Installer le retour. Activer le réseau.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#556159] sm:text-base">
                Le parcours marchand Cardin part du manque visible, clarifie le sommet, explique la mécanique, puis chiffre le revenu récupérable.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <MetricPill label="Étapes" value="5" note="parcours marchand clair" />
              <MetricPill label="Tarif" value={`${LANDING_PRICING.activationFee} €`} note={LANDING_PRICING.recurringLabel} />
              <MetricPill label="Carte" value="Sans login" note="la carte devient le compte client" />
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            <aside className="rounded-[1.7rem] border border-[#E2DDD2] bg-[#FFFEFA]/90 p-3.5 shadow-[0_1px_0_rgba(27,67,50,0.03)] sm:p-5 lg:sticky lg:top-24">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Monde</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {LANDING_WORLD_ORDER.map((worldId) => {
                  const world = LANDING_WORLDS[worldId]
                  const isActive = worldId === selectedWorldId

                  return (
                    <button
                      className={[
                        "rounded-full border px-4 py-2.5 text-sm transition",
                        isActive
                          ?"border-[#173A2E] bg-[#EEF3EC] text-[#173A2E] shadow-[0_12px_24px_-18px_rgba(23,58,46,0.35)]"
                          : "border-[#DDD8CE] bg-[#FFFDF8] text-[#556159] hover:border-[#B8C4B8] hover:text-[#173A2E]",
                      ].join(" ")}
                      key={worldId}
                      onClick={() => setSelectedWorldId(worldId)}
                      type="button"
                    >
                      {world.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Progression</p>
                  <p className="text-xs text-[#6D776F]">
                    {selectedStepIndex + 1}/{ONBOARDING_STEPS.length}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[#DEE5DD]">
                  <div
                    className="h-2 rounded-full bg-[#173A2E] transition-all"
                    style={{ width: `${((selectedStepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-[1.45rem] border border-[#E2DDD2] bg-[linear-gradient(180deg,#F8FAF7_0%,#F0F4EF_100%)] p-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Projection active</p>
                <p className="mt-3 font-serif text-4xl text-[#173A2E]">{formatEuro(seasonRange.adjusted)}</p>
                <p className="mt-1 text-sm text-[#556159]">sur {demo.seasonMonths} mois</p>
                <p className="mt-4 text-sm leading-7 text-[#556159]">
                  {demo.projectedMonthlyReturns} retours clients projetés par mois. {demo.confidenceLabel}.
                </p>
              </div>

              <div className="mt-4 grid gap-2.5">
                {ONBOARDING_STEPS.map((step, index) => {
                  const isActive = step.id === selectedStepId

                  return (
                    <button
                      className={[
                        "rounded-[1.35rem] border p-3.5 text-left transition-all sm:p-4",
                        isActive
                          ?"border-[#7A9B87] bg-[linear-gradient(180deg,#EDF4F0_0%,#E7F0EA_100%)] shadow-[0_18px_40px_-32px_rgba(23,58,46,0.45)]"
                          : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#C4CFC2] hover:bg-[#FBF9F3]",
                      ].join(" ")}
                      key={step.id}
                      onClick={() => setSelectedStepId(step.id)}
                      type="button"
                    >
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{step.eyebrow}</p>
                      <p className="mt-2.5 font-serif text-[1.55rem] leading-none text-[#173A2E] sm:text-[1.9rem]">{step.label}</p>
                      <p className="mt-2 text-sm uppercase tracking-[0.08em] text-[#6D776F]">{step.audience}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-[#556159]">{index === 0 ?"Lire" : index === ONBOARDING_STEPS.length - 1 ?"Activer" : "Continuer"}</span>
                        <span className="text-xs text-[#6D776F]">0{index + 1}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>

            <div className="rounded-[1.9rem] border border-[#DCD6CA] bg-[#FFFDF8]/95 p-4.5 shadow-[0_1px_0_rgba(27,67,50,0.03)] sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 border-b border-[#E6E0D5] pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#6D776F]">
                    {selectedStep.eyebrow} - {selectedStep.audience}
                  </p>
                  <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">
                    {getStepTitle(selectedStepId)}
                  </h3>
                </div>
                <div className="rounded-full border border-[#D8DED4] bg-[#FBFCF8] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#173A2E]">
                  {selectedWorld.label}
                </div>
              </div>

              <div className="mt-6">
                {selectedStepId === "lecture" ?(
                  <LecturePanel reading={reading} worldId={selectedWorldId} />
                ) : null}
                {selectedStepId === "summit" ?(
                  <SummitPanel selectedSummitId={selectedSummitId} setSelectedSummitId={setSelectedSummitId} worldId={selectedWorldId} />
                ) : null}
                {selectedStepId === "mechanics" ?(
                  <MechanicsPanel selectedMechanic={selectedMechanic} selectedMechanicId={selectedMechanicId} setSelectedMechanicId={setSelectedMechanicId} />
                ) : null}
                {selectedStepId === "projection" ?(
                  <ProjectionPanel
                    confidenceLabel={demo.confidenceLabel}
                    monthlyRange={projectionRange}
                    seasonMonths={demo.seasonMonths}
                    seasonRange={seasonRange}
                    summitMetric={selectedSummit.metric}
                  />
                ) : null}
                {selectedStepId === "activation" ?(
                  <ActivationPanel
                    cardCode="CD-001000"
                    confidenceLabel={demo.confidenceLabel}
                    engineHref={engineHref}
                    projectedReturns={demo.projectedMonthlyReturns}
                    projectedSeasonRevenue={seasonRange.adjusted}
                  />
                ) : null}
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-[#E4DED2] bg-[#FBF9F3] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#6D776F]">Ce que le commerçant voit</p>
                <p className="mt-3 text-xl leading-8 text-[#173A2E]">{getUnderstandingLine(selectedStepId, selectedWorldId)}</p>
                <p className="mt-3 text-sm leading-7 text-[#677168]">{getSupportingLine(selectedStepId, selectedWorldId, demo.projectedMonthlyRevenue)}</p>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[#E6E0D5] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#677168]">La démo raconte la logique. La carte active reste sur <span className="font-mono text-[#173A2E]">/c/[cardCode]</span>.</p>
                <div className="flex items-center gap-3">
                  <button
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#DAD4C8] bg-[#F8F5ED] px-5 text-sm font-medium text-[#7A7F78] transition hover:border-[#C8C2B5] hover:text-[#173A2E] disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={selectedStepIndex === 0}
                    onClick={() => setSelectedStepId(ONBOARDING_STEPS[Math.max(0, selectedStepIndex - 1)].id)}
                    type="button"
                  >
                    Précédent
                  </button>
                  <button
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
                    onClick={() => setSelectedStepId(ONBOARDING_STEPS[Math.min(ONBOARDING_STEPS.length - 1, selectedStepIndex + 1)].id)}
                    type="button"
                  >
                    {selectedStepIndex === ONBOARDING_STEPS.length - 1 ?"Revoir" : "Suivant"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LecturePanel({ reading, worldId }: { reading: WorldReading; worldId: LandingWorldId }) {
  const world = LANDING_WORLDS[worldId]

  return (
    <div className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-base leading-8 text-[#556159]">
          Base de lecture : {reading.clientsPerDay} clients / jour. Avant toute promesse, on rend visible le revenu qui s'échappe déjà.
        </p>
      </div>

      <div className="rounded-[1.65rem] border border-[#173A2E] bg-[#173A2E] p-6 text-[#FBFAF6] shadow-[0_20px_48px_-34px_rgba(23,58,46,0.42)]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9D4C6]">Clients perdus chaque mois</p>
        <p className="mt-4 font-serif text-[clamp(3rem,7vw,4.5rem)] leading-none">~{reading.lostClientsPerMonth}</p>
        <p className="mt-3 text-sm text-[#D8E1D4]">soit {formatEuro(reading.lostRevenuePerMonth)} de revenu non capté</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MiniStat label="Taux de retour actuel" note="sans Cardin" value={`${reading.currentReturnRate}%`} />
        <MiniStat label="Récupérable" note={world.proofLine} value={`${reading.recoverableRate}%`} />
      </div>
    </div>
  )
}

function SummitPanel({
  selectedSummitId,
  setSelectedSummitId,
  worldId,
}: {
  selectedSummitId: SummitStyleId
  setSelectedSummitId: (value: SummitStyleId) => void
  worldId: LandingWorldId
}) {
  const world = LANDING_WORLDS[worldId]

  return (
    <div className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-base leading-8 text-[#556159]">
          Le Sommet est le grand prix du parcours. Plus il est lisible, plus le retour client s'installe et plus le réseau s'active.
        </p>
      </div>

      <div className="space-y-3">
        {SUMMIT_OPTIONS.map((option) => {
          const isActive = option.id === selectedSummitId

          return (
            <button
              className={[
                "w-full rounded-[1.5rem] border p-5 text-left transition-all",
                isActive
                  ?"border-[#C9AC55] bg-[linear-gradient(180deg,#FBF3DA_0%,#F5E6B7_100%)] shadow-[0_18px_42px_-34px_rgba(108,84,24,0.32)]"
                  : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#D6C57C] hover:bg-[#FBF8EE]",
              ].join(" ")}
              key={option.id}
              onClick={() => setSelectedSummitId(option.id)}
              type="button"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className={["h-2.5 w-2.5 rounded-full", isActive ?"bg-[#B38A2D]" : "bg-[#D7D1C4]"].join(" ")} />
                    <p className="text-xl font-medium text-[#173A2E]">{option.label}</p>
                  </div>
                  <p className="mt-3 pl-5 text-sm leading-7 text-[#5E655D]">{option.description}</p>
                </div>
                <div className="pl-5 text-left sm:pl-0 sm:text-right">
                  <p className="text-2xl font-semibold text-[#B38A2D]">{option.metric}</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#8E7B46]">{option.metricLabel}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-[1.45rem] border border-[#E1DBCF] bg-[#FBF9F3] p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Sommet du monde {world.label}</p>
        <p className="mt-3 font-serif text-3xl leading-tight text-[#173A2E]">{world.summitPromise}</p>
      </div>
    </div>
  )
}

function MechanicsPanel({
  selectedMechanic,
  selectedMechanicId,
  setSelectedMechanicId,
}: {
  selectedMechanic: MechanicItem
  selectedMechanicId: MechanicId
  setSelectedMechanicId: (value: MechanicId) => void
}) {
  return (
    <div className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-base leading-8 text-[#556159]">Le moteur ne repose pas sur une carte à tampons. Il structure le retour client, le réseau et la saison.</p>
      </div>

      <div className="space-y-3">
        {MECHANIC_ITEMS.map((item) => {
          const isActive = item.id === selectedMechanicId

          return (
            <button
              className={[
                "w-full rounded-[1.35rem] border px-5 py-4 text-left transition-all",
                isActive ?"border-[#7A9B87] bg-[#F6FBF7]" : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#C4CFC2]",
              ].join(" ")}
              key={item.id}
              onClick={() => setSelectedMechanicId(item.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="pt-1 font-mono text-xs text-[#7B837D]">{item.index}</span>
                  <div>
                    <p className={["text-lg", isActive ?"font-medium text-[#173A2E]" : "text-[#405246]"].join(" ")}>{item.title}</p>
                    <p className={["mt-1 text-sm", isActive ?"text-[#556159]" : "text-[#81877F]"].join(" ")}>{item.description}</p>
                  </div>
                </div>
                <span className="pt-1 text-lg leading-none text-[#7A817A]">{isActive ? "×" : "+"}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-[1.55rem] border border-[#E1DBCF] bg-[#FBF9F3] p-5">
        <p className="font-serif text-3xl leading-tight text-[#173A2E]">{selectedMechanic.title}</p>
        <p className="mt-3 text-sm leading-7 text-[#556159]">{selectedMechanic.summary}</p>
        <div className="mt-5">
          <MechanicDiagram mechanicId={selectedMechanic.id} />
        </div>
      </div>
    </div>
  )
}

function ProjectionPanel({
  confidenceLabel,
  monthlyRange,
  seasonMonths,
  seasonRange,
  summitMetric,
}: {
  confidenceLabel: string
  monthlyRange: { low: number; high: number; adjusted: number }
  seasonMonths: 3 | 6
  seasonRange: { low: number; high: number; adjusted: number }
  summitMetric: string
}) {
  return (
    <div className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-base leading-8 text-[#556159]">Projection fondée sur vos paramètres. Fourchette prudente à optimiste, avec sommet déjà intégré.</p>
      </div>

      <div className="rounded-[1.6rem] border border-[#173A2E] bg-[#173A2E] p-6 text-[#FBFAF6] shadow-[0_20px_48px_-34px_rgba(23,58,46,0.42)]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9D4C6]">Revenu récupéré / mois</p>
        <p className="mt-4 font-serif text-[clamp(2.8rem,7vw,4.6rem)] leading-none">
          +{monthlyRange.low.toLocaleString("fr-FR")}-{monthlyRange.high.toLocaleString("fr-FR")} €
        </p>
      </div>

      <div className="rounded-[1.45rem] border border-[#E1DBCF] bg-[#FFFEFA] p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Revenu cumulé sur {seasonMonths} mois</p>
        <div className="mt-5 flex h-40 items-end gap-4 rounded-[1.2rem] border border-[#E6E0D5] bg-[linear-gradient(180deg,#F9F7F0_0%,#F4F1E8_100%)] px-5 pb-5 pt-8">
          {buildProjectionBars(seasonMonths, seasonRange.adjusted).map((bar) => (
            <div className="flex-1" key={bar.label}>
              <div className="flex h-24 items-end">
                <div className="w-full rounded-t-[1rem] bg-[linear-gradient(180deg,#2B5B48_0%,#173A2E_100%)]" style={{ height: `${bar.height}%` }} />
              </div>
              <p className="mt-3 text-center text-xs text-[#677168]">{bar.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Réseau" note="×1,15 — effet domino activé" value="×1,15" />
        <MiniStat label="Sommet" note="sélection active" value={summitMetric} />
        <MiniStat label="Saison" note={confidenceLabel} value={`${Math.round(seasonRange.low / 1000)}-${Math.round(seasonRange.high / 1000)}k`} />
      </div>
    </div>
  )
}
function ActivationPanel({
  cardCode,
  confidenceLabel,
  engineHref,
  projectedReturns,
  projectedSeasonRevenue,
}: {
  cardCode: string
  confidenceLabel: string
  engineHref: string
  projectedReturns: number
  projectedSeasonRevenue: number
}) {
  return (
    <div className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-base leading-8 text-[#556159]">Le lieu entre dans Cardin immédiatement. Le QR ouvre la carte. Aucun compte client à créer.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard description="Le lieu peut déjà faire entrer un client." title="QR actif" />
        <FeatureCard description={`Chaque carte porte une identité sans login. Exemple : ${cardCode}.`} title="Carte codée" />
        <FeatureCard description="Le marchand voit la progression sans tableau lourd." title="Tableau marchand" />
        <FeatureCard description="48 h en digital, 7 à 10 jours pour les cartes physiques." title="Support physique" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MiniStat label="Activation" note={LANDING_PRICING.recurringLabel} value={`${LANDING_PRICING.activationFee} €`} />
        <MiniStat label="Projection de saison" note={confidenceLabel} value={formatEuro(projectedSeasonRevenue)} />
      </div>

      <div className="rounded-[1.45rem] border border-[#E1DBCF] bg-[#FFFEFA] p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Sortie exploitable</p>
        <p className="mt-3 text-sm leading-7 text-[#556159]">
          Le lieu repart avec un système activable tout de suite, une carte accessible sans login et un ordre de grandeur de {projectedReturns} retours clients par mois.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
            href="#methode"
          >
            Voir le simulateur
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
            href="/demo"
          >
            Voir la démo complète
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
            href={engineHref}
          >
            Ouvrir l’outil
          </Link>
        </div>
      </div>
    </div>
  )
}

function MetricPill({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-[#DFDACC] bg-[#FFFEFA] px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#173A2E]">{value}</p>
      <p className="mt-1 text-xs text-[#6D776F]">{note}</p>
    </div>
  )
}

function MiniStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.35rem] border border-[#E1DBCF] bg-[#FFFEFA] p-5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#173A2E]">{value}</p>
      <p className="mt-2 text-xs leading-6 text-[#6D776F]">{note}</p>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.45rem] border border-[#E1DBCF] bg-[#FFFEFA] p-5">
      <p className="text-2xl font-medium text-[#173A2E]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#556159]">{description}</p>
    </div>
  )
}

function MechanicDiagram({ mechanicId }: { mechanicId: MechanicId }) {
  if (mechanicId === "return") {
    return (
      <div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((visit, index) => (
            <div className="flex items-center gap-2" key={visit}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#CBD5CB] bg-[#FFFEFA] text-sm text-[#173A2E]">
                V{visit}
              </div>
              {index < 4 ?<div className="h-px w-6 bg-[#C8D2C7]" /> : null}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-3 flex-1 rounded-full bg-[#E4EBE3]">
            <div className="h-3 w-[55%] rounded-full bg-[#173A2E]" />
          </div>
          <span className="text-xs text-[#677168]">3 / 8</span>
        </div>
      </div>
    )
  }

  if (mechanicId === "surprise") {
    const classicHeights = [18, 18, 18, 18, 18, 18, 18, 18, 18, 64]
    const cardinHeights = [18, 64, 18, 44, 18, 34, 18, 52, 18, 64]
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <ComparisonBars bars={classicHeights} label="Système classique" sublabel="attendre ×10" />
        <ComparisonBars bars={cardinHeights} highlight label="Cardin" sublabel="variable - imprévisible" />
      </div>
    )
  }

  if (mechanicId === "domino") {
    return (
      <div className="space-y-4">
        <DominoRow accent="green" label="50 cartes initiales" token="D" />
        <DominoRow accent="blue" label="chacun invite 1" token="+1" />
        <DominoRow accent="muted" label="ceux-l? invitent 1" token="+1" />
        <div className="rounded-xl border border-[#D7E2DA] bg-[#F8FBF8] p-4">
          <p className="font-serif text-4xl text-[#173A2E]">150</p>
          <p className="mt-1 text-sm text-[#677168]">parcours actifs depuis 50 cartes initiales</p>
        </div>
      </div>
    )
  }

  if (mechanicId === "diamond") {
    return (
      <div className="overflow-hidden rounded-xl border border-[#E2D7BE]">
        <CostRow headers values={["", "Co?t", "Durée"]} />
        <CostRow values={["Grand Diamond café", "120 € / an", "12 mois"]} />
        <CostRow values={["Grand Diamond beauté", "300 € / an", "12 mois"]} />
        <CostRow values={["Grand Diamond restaurant", "600 € / an", "12 mois"]} />
        <CostRow muted values={["Campagne Instagram", "500 €", "3 jours"]} />
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <MiniStat label="Saison 1" note="cartes initiales" value="50" />
      <MiniStat label="Saison 2" note="impact plus fort" value="S2" />
      <MiniStat label="Grand Diamonds" note="visibles dans le lieu" value="8" />
      <MiniStat label="Parcours actifs" note="à la fin du cycle" value="150" />
    </div>
  )
}

function ComparisonBars({
  bars,
  highlight,
  label,
  sublabel,
}: {
  bars: number[]
  highlight?: boolean
  label: string
  sublabel: string
}) {
  return (
    <div>
      <p className={["text-[10px] uppercase tracking-[0.14em]", highlight ?"text-[#173A2E]" : "text-[#899188]"].join(" ")}>{label}</p>
      <div className="mt-3 flex h-20 items-end gap-1">
        {bars.map((height, index) => (
          <div
            className={["flex-1 rounded-t-sm", highlight ?"bg-[#AFC4B6]" : "bg-[#E1E7E0]"].join(" ")}
            key={`${label}-${index}`}
            style={{ height }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-[#7A827B]">{sublabel}</p>
    </div>
  )
}
function DominoRow({
  accent,
  label,
  token,
}: {
  accent: "green" | "blue" | "muted"
  label: string
  token: string
}) {
  const rowClass =
    accent === "green"
      ?"border-[#A7C0B1] bg-[#F3F8F4] text-[#173A2E]"
      : accent === "blue"
        ?"border-[#C3D4E8] bg-[#F4F8FD] text-[#5879A7]"
        : "border-[#DEE5EB] bg-[#F9FBFD] text-[#94A4B7]"

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-right text-xs leading-5 text-[#7A827B]">{label}</div>
      <div className="flex flex-1 flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className={`flex h-9 w-9 items-center justify-center rounded-md border text-xs ${rowClass}`} key={`${label}-${index}`}>
            {token}
          </div>
        ))}
      </div>
    </div>
  )
}

function CostRow({
  values,
  headers,
  muted,
}: {
  values: [string, string, string]
  headers?: boolean
  muted?: boolean
}) {
  const cellClass = headers
    ?"bg-[#FBF8EE] text-[10px] uppercase tracking-[0.16em] text-[#8F7D53]"
    : muted
      ?"bg-[#FBF9F3] text-[#7B827B]"
      : "bg-[#FFFEFA] text-[#173A2E]"

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_120px_100px]">
      {values.map((value) => (
        <div className={`border-b border-r border-[#E7DFCF] px-4 py-3 text-sm last:border-r-0 ${cellClass}`} key={`${values[0]}-${value}`}>
          {value}
        </div>
      ))}
    </div>
  )
}

function buildProjectionBars(seasonMonths: 3 | 6, totalRevenue: number) {
  return Array.from({ length: seasonMonths }, (_, index) => {
    const ratio = (index + 1) / seasonMonths
    const height = Math.round(36 + ratio * 52)
    return {
      label: `M${index + 1}`,
      value: Math.round(totalRevenue * ratio),
      height,
    }
  })
}

function getStepTitle(stepId: OnboardingStepId) {
  if (stepId === "lecture") {
    return "Ce que le lieu perd aujourd’hui."
  }
  if (stepId === "summit") {
    return "Ce qui donne envie de revenir."
  }
  if (stepId === "mechanics") {
    return "Ce qui remet du passage."
  }
  if (stepId === "projection") {
    return "Impact sur le revenu."
  }
  return "Activation"
}

function getUnderstandingLine(stepId: OnboardingStepId, worldId: LandingWorldId) {
  const world = LANDING_WORLDS[worldId]

  if (stepId === "lecture") {
    return `Le ${world.label.toLowerCase()} perd déjà du revenu aujourd’hui. On commence par ce manque visible.`
  }
  if (stepId === "summit") {
    return "Le Sommet n'est pas un bonus. C'est la raison concrète de revenir."
  }
  if (stepId === "mechanics") {
    return "Le retour client vient d'une progression, d'un réseau activé et d'une saison courte. Pas d'une carte linéaire."
  }
  if (stepId === "projection") {
    return "Le chiffre devient crédible parce que le passage, la fréquence et le réseau ont déjà été expliqués."
  }
  return "Le lieu peut démarrer immédiatement. La carte devient l'accès client."
}

function getSupportingLine(stepId: OnboardingStepId, worldId: LandingWorldId, projectedMonthlyRevenue: number) {
  const world = LANDING_WORLDS[worldId]

  if (stepId === "lecture") {
    return `${world.proofLine} On lit le manque avec le même monde et les mêmes paramètres que Cardin.`
  }
  if (stepId === "summit") {
    return `Le sommet du monde ${world.label} reste ${world.summitPromise.toLowerCase()} et conditionne le revenu récupéré.`
  }
  if (stepId === "mechanics") {
    return "Le Domino reste volontairement simple : une personne invite une personne, et le réseau activé nourrit le grand prix."
  }
  if (stepId === "projection") {
    return `La projection part d'un ordre de grandeur d'environ ${formatEuro(projectedMonthlyRevenue)} de revenu récupéré par mois.`
  }
  return `L'activation garde la formule Cardin : ${LANDING_PRICING.activationFee} € puis ${LANDING_PRICING.recurringLabel.toLowerCase()}.`
}







