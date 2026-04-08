"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { getDemoWorldContent } from "@/lib/demo-content"
import { LANDING_PRICING, LANDING_WORLD_ORDER, LANDING_WORLDS, type LandingWorldId } from "@/lib/landing-content"

type OnboardingStepId = "lecture" | "summit" | "mechanics" | "projection" | "activation"
type SummitStyleId = "visible" | "stronger" | "discreet"
type MechanicId = "return" | "surprise" | "domino" | "diamond" | "season"

type Step = { id: OnboardingStepId; eyebrow: string; label: string; cta: string }
type Summit = { id: SummitStyleId; label: string; description: string; metric: string; multiplier: number }
type Mechanic = { id: MechanicId; index: string; title: string; description: string; summary: string }
type Reading = { clientsPerDay: number; lostClientsPerMonth: number; lostRevenuePerMonth: number; currentReturnRate: number; recoverableRate: number }

const STEPS: Step[] = [
  { id: "lecture", eyebrow: "Étape 1", label: "Lecture", cta: "Activer la lecture" },
  { id: "summit", eyebrow: "Étape 2", label: "Sommet", cta: "Choisir le sommet" },
  { id: "mechanics", eyebrow: "Étape 3", label: "Mécanique", cta: "Lire la mécanique" },
  { id: "projection", eyebrow: "Étape 4", label: "Projection", cta: "Voir la projection" },
  { id: "activation", eyebrow: "Étape 5", label: "Activation", cta: "Lancer le système" },
]

const SUMMITS: Summit[] = [
  { id: "visible", label: "Sommet visible", description: "Le client comprend ce qu'il débloque. Le retour devient lisible.", metric: "×1,00", multiplier: 1 },
  { id: "stronger", label: "Sommet renforcé", description: "La récompense est plus forte. Elle accélère le retour client et active davantage le réseau.", metric: "×1,25", multiplier: 1.25 },
  { id: "discreet", label: "Sommet discret", description: "La promesse reste plus rare. L'effet de surprise est plus sélectif.", metric: "×0,85", multiplier: 0.85 },
]

const MECHANICS: Mechanic[] = [
  { id: "return", index: "01", title: "Il revient", description: "La progression crée une raison de repasser.", summary: "Le client ne revient pas pour remplir une carte. Il revient pour continuer un parcours visible." },
  { id: "surprise", index: "02", title: "Il reçoit quelque chose tôt", description: "Le retour se joue avant la dixième visite.", summary: "Dès la deuxième visite, quelque chose peut arriver. La fréquence monte parce que le parcours reste vivant." },
  { id: "domino", index: "03", title: "Le réseau s'active", description: "Une personne invite une personne. Le bouche-à-oreille reste simple.", summary: "Le Domino nourrit le grand prix sans rendre la carte complexe. Une personne en amène une autre, puis le réseau existe." },
  { id: "diamond", index: "04", title: "Le grand prix compte", description: "Le sommet donne une vraie raison de revenir.", summary: "Le grand prix ne ressemble pas à une remise. Il crée du désir, du statut et une mémoire claire du lieu." },
  { id: "season", index: "05", title: "La saison remet la tension", description: "Le temps est borné. Le système reste vivant.", summary: "Une saison courte crée du rythme, relance l'affluence et permet de repartir proprement avec un nouveau cycle." },
]

const READINGS: Record<LandingWorldId, Reading> = {
  cafe: { clientsPerDay: 80, lostClientsPerMonth: 312, lostRevenuePerMonth: 1950, currentReturnRate: 25, recoverableRate: 35 },
  restaurant: { clientsPerDay: 50, lostClientsPerMonth: 195, lostRevenuePerMonth: 5070, currentReturnRate: 18, recoverableRate: 35 },
  beaute: { clientsPerDay: 12, lostClientsPerMonth: 47, lostRevenuePerMonth: 3990, currentReturnRate: 20, recoverableRate: 35 },
  boutique: { clientsPerDay: 40, lostClientsPerMonth: 156, lostRevenuePerMonth: 8580, currentReturnRate: 17, recoverableRate: 35 },
}

const formatEuro = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
const clampRange = (value: number, multiplier: number) => ({ adjusted: Math.round(value * multiplier), low: Math.round(value * multiplier * 0.88), high: Math.round(value * multiplier * 1.14) })
const projectionBars = (seasonMonths: 3 | 6) => Array.from({ length: seasonMonths }, (_, index) => ({ label: `M${index + 1}`, height: Math.round(36 + ((index + 1) / seasonMonths) * 52) }))

export function LandingOnboardingJourney() {
  const [selectedWorldId, setSelectedWorldId] = useState<LandingWorldId>("cafe")
  const [selectedStepId, setSelectedStepId] = useState<OnboardingStepId>("lecture")
  const [selectedSummitId, setSelectedSummitId] = useState<SummitStyleId>("stronger")
  const [selectedMechanicId, setSelectedMechanicId] = useState<MechanicId>("surprise")

  const world = LANDING_WORLDS[selectedWorldId]
  const reading = READINGS[selectedWorldId]
  const demo = getDemoWorldContent(selectedWorldId)
  const step = STEPS.find((item) => item.id === selectedStepId) ?? STEPS[0]
  const stepIndex = STEPS.findIndex((item) => item.id === step.id)
  const summit = SUMMITS.find((item) => item.id === selectedSummitId) ?? SUMMITS[1]
  const mechanic = MECHANICS.find((item) => item.id === selectedMechanicId) ?? MECHANICS[1]
  const engineHref = `/engine?template=${selectedWorldId}&season=${demo.seasonMonths}`
  const monthlyRange = useMemo(() => clampRange(demo.projectedMonthlyRevenue, summit.multiplier), [demo.projectedMonthlyRevenue, summit.multiplier])
  const seasonRange = useMemo(() => clampRange(demo.projectedSeasonRevenue, summit.multiplier), [demo.projectedSeasonRevenue, summit.multiplier])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14" id="onboarding">
      <div className="overflow-hidden rounded-[2rem] border border-[#DED7CA] bg-[linear-gradient(180deg,#FFFDF8_0%,#F4F0E7_100%)] shadow-[0_28px_90px_-54px_rgba(21,47,37,0.38)]">
        <div className="border-b border-[#E3DDD0] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Parcours marchand</p>
              <p className="mt-1 text-sm text-[#566159]">{step.eyebrow} — {step.label}</p>
            </div>
            <div className="flex items-center gap-2">
              {STEPS.map((item, index) => {
                const active = index <= stepIndex
                const current = index === stepIndex
                return (
                  <button aria-label={item.label} className="flex items-center gap-2" key={item.id} onClick={() => setSelectedStepId(item.id)} type="button">
                    <span className={["h-2.5 w-2.5 rounded-full transition-all", active ? "bg-[#173A2E]" : "bg-[#D8D4CB]", current ? "scale-125" : "scale-100"].join(" ")} />
                    {index < STEPS.length - 1 ? <span className={["hidden h-px w-5 sm:block", active ? "bg-[#173A2E]" : "bg-[#D8D4CB]"].join(" ")} /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap gap-2.5">
              {LANDING_WORLD_ORDER.map((worldId) => (
                <button
                  className={[
                    "rounded-full border px-4 py-2.5 text-sm transition",
                    worldId === selectedWorldId ? "border-[#173A2E] bg-[#EEF3EC] text-[#173A2E]" : "border-[#DDD8CE] bg-[#FFFDF8] text-[#556159] hover:border-[#B8C4B8] hover:text-[#173A2E]",
                  ].join(" ")}
                  key={worldId}
                  onClick={() => setSelectedWorldId(worldId)}
                  type="button"
                >
                  {LANDING_WORLDS[worldId].label}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-[#E2DDD2] bg-[#FFFEFA]/90 p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#677168]">{step.eyebrow}</p>
                  <h2 className="mt-3 font-serif text-[clamp(2.5rem,7vw,4.7rem)] leading-[0.98] text-[#173328]">{getStepTitle(selectedStepId)}</h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-[#556159]">{getStepLead(selectedStepId, selectedWorldId)}</p>
                </div>
                <div className="rounded-full border border-[#D8DED4] bg-[#FBFCF8] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#173A2E]">{world.label}</div>
              </div>

              <div className="mt-6 space-y-5">
                {selectedStepId === "lecture" ? <LecturePanel reading={reading} /> : null}
                {selectedStepId === "summit" ? <SummitPanel selectedSummitId={selectedSummitId} setSelectedSummitId={setSelectedSummitId} worldId={selectedWorldId} /> : null}
                {selectedStepId === "mechanics" ? <MechanicsPanel selectedMechanic={mechanic} selectedMechanicId={selectedMechanicId} setSelectedMechanicId={setSelectedMechanicId} /> : null}
                {selectedStepId === "projection" ? <ProjectionPanel confidenceLabel={demo.confidenceLabel} monthlyRange={monthlyRange} seasonMonths={demo.seasonMonths} seasonRange={seasonRange} summitMetric={summit.metric} /> : null}
                {selectedStepId === "activation" ? <ActivationPanel confidenceLabel={demo.confidenceLabel} engineHref={engineHref} projectedReturns={demo.projectedMonthlyReturns} projectedSeasonRevenue={seasonRange.adjusted} /> : null}

                <div className="rounded-[1.45rem] border border-[#E4DED2] bg-[#FBF9F3] p-5 sm:p-6">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#6D776F]">Ce que le commerçant comprend</p>
                  <p className="mt-3 text-lg leading-8 text-[#173A2E] sm:text-xl">{getUnderstandingLine(selectedStepId, selectedWorldId)}</p>
                  <p className="mt-3 text-sm leading-7 text-[#677168]">{getSupportingLine(selectedStepId, selectedWorldId, demo.projectedMonthlyRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#677168]">La démo raconte la logique. La carte active reste sur <span className="font-mono text-[#173A2E]">/c/[cardCode]</span>.</p>
              <div className="flex items-center gap-3">
                <button className="inline-flex h-12 items-center justify-center rounded-full border border-[#DAD4C8] bg-[#F8F5ED] px-5 text-sm font-medium text-[#7A7F78] transition hover:border-[#C8C2B5] hover:text-[#173A2E] disabled:cursor-not-allowed disabled:opacity-45" disabled={stepIndex === 0} onClick={() => setSelectedStepId(STEPS[Math.max(0, stepIndex - 1)].id)} type="button">
                  Précédent
                </button>
                <button className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" onClick={() => setSelectedStepId(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].id)} type="button">
                  {stepIndex === STEPS.length - 1 ? "Revoir" : step.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LecturePanel({ reading }: { reading: Reading }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.65rem] border border-[#173A2E] bg-[#173A2E] p-6 text-[#FBFAF6] shadow-[0_20px_48px_-34px_rgba(23,58,46,0.42)] sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9D4C6]">Clients perdus chaque mois</p>
        <p className="mt-4 font-serif text-[clamp(3rem,8vw,5rem)] leading-none">~{reading.lostClientsPerMonth}</p>
        <p className="mt-3 text-sm text-[#D8E1D4]">soit {formatEuro(reading.lostRevenuePerMonth)} de revenu non capté</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Taux de retour actuel" value={`${reading.currentReturnRate}%`} note="sans Cardin" />
        <StatCard label="Récupérable" value={`${reading.recoverableRate}%`} note="revenu récupéré possible" />
      </div>
    </div>
  )
}

function SummitPanel({ selectedSummitId, setSelectedSummitId, worldId }: { selectedSummitId: SummitStyleId; setSelectedSummitId: (value: SummitStyleId) => void; worldId: LandingWorldId }) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {SUMMITS.map((item) => {
          const active = item.id === selectedSummitId
          return (
            <button className={["w-full rounded-[1.5rem] border p-5 text-left transition-all", active ? "border-[#C9AC55] bg-[linear-gradient(180deg,#FBF3DA_0%,#F5E6B7_100%)] shadow-[0_18px_42px_-34px_rgba(108,84,24,0.32)]" : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#D6C57C] hover:bg-[#FBF8EE]"].join(" ")} key={item.id} onClick={() => setSelectedSummitId(item.id)} type="button">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className={["h-2.5 w-2.5 rounded-full", active ? "bg-[#B38A2D]" : "bg-[#D7D1C4]"].join(" ")} />
                    <p className="text-xl font-medium text-[#173A2E]">{item.label}</p>
                  </div>
                  <p className="mt-3 pl-5 text-sm leading-7 text-[#5E655D]">{item.description}</p>
                </div>
                <div className="pl-5 text-left sm:pl-0 sm:text-right">
                  <p className="text-2xl font-semibold text-[#B38A2D]">{item.metric}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <div className="rounded-[1.45rem] border border-[#E1DBCF] bg-[#FBF9F3] p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Grand prix du monde {LANDING_WORLDS[worldId].label}</p>
        <p className="mt-3 font-serif text-3xl leading-tight text-[#173A2E]">{LANDING_WORLDS[worldId].summitPromise}</p>
      </div>
    </div>
  )
}

function MechanicsPanel({ selectedMechanic, selectedMechanicId, setSelectedMechanicId }: { selectedMechanic: Mechanic; selectedMechanicId: MechanicId; setSelectedMechanicId: (value: MechanicId) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {MECHANICS.map((item) => {
          const active = item.id === selectedMechanicId
          return (
            <button className={["w-full rounded-[1.35rem] border px-5 py-4 text-left transition-all", active ? "border-[#7A9B87] bg-[#F6FBF7]" : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#C4CFC2]"].join(" ")} key={item.id} onClick={() => setSelectedMechanicId(item.id)} type="button">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="pt-1 font-mono text-xs text-[#7B837D]">{item.index}</span>
                  <div>
                    <p className={["text-lg", active ? "font-medium text-[#173A2E]" : "text-[#405246]"].join(" ")}>{item.title}</p>
                    <p className={["mt-1 text-sm", active ? "text-[#556159]" : "text-[#81877F]"].join(" ")}>{item.description}</p>
                  </div>
                </div>
                <span className="pt-1 text-lg leading-none text-[#7A817A]">{active ? "×" : "+"}</span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="rounded-[1.55rem] border border-[#E1DBCF] bg-[#FBF9F3] p-5 sm:p-6">
        <p className="font-serif text-3xl leading-tight text-[#173A2E]">{selectedMechanic.title}</p>
        <p className="mt-3 text-sm leading-7 text-[#556159]">{selectedMechanic.summary}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatCard label="Retour client" value={selectedMechanic.id === "return" ? "Progressif" : selectedMechanic.id === "surprise" ? "Précoce" : "Structuré"} note="effet principal" />
          <StatCard label="Réseau" value={selectedMechanic.id === "domino" ? "Activé" : "Secondaire"} note="bouche-à-oreille" />
          <StatCard label="Affluence" value={selectedMechanic.id === "season" ? "Relancée" : "En hausse"} note="passage dans le lieu" />
        </div>
      </div>
    </div>
  )
}

function ProjectionPanel({ confidenceLabel, monthlyRange, seasonMonths, seasonRange, summitMetric }: { confidenceLabel: string; monthlyRange: { low: number; high: number; adjusted: number }; seasonMonths: 3 | 6; seasonRange: { low: number; high: number; adjusted: number }; summitMetric: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#173A2E] bg-[#173A2E] p-6 text-[#FBFAF6] shadow-[0_20px_48px_-34px_rgba(23,58,46,0.42)] sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9D4C6]">Revenu récupéré / mois</p>
        <p className="mt-4 font-serif text-[clamp(2.8rem,8vw,4.8rem)] leading-none">+{monthlyRange.low.toLocaleString("fr-FR")}–{monthlyRange.high.toLocaleString("fr-FR")} €</p>
      </div>
      <div className="rounded-[1.45rem] border border-[#E1DBCF] bg-[#FFFEFA] p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Revenu cumulé sur {seasonMonths} mois</p>
        <div className="mt-5 flex h-44 items-end gap-4 rounded-[1.2rem] border border-[#E6E0D5] bg-[linear-gradient(180deg,#F9F7F0_0%,#F4F1E8_100%)] px-5 pb-5 pt-8">
          {projectionBars(seasonMonths).map((bar) => (
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
        <StatCard label="Réseau" value="×1,15" note="effet domino activé" />
        <StatCard label="Sommet" value={summitMetric} note="sélection active" />
        <StatCard label="Saison" value={`${Math.round(seasonRange.low / 1000)}–${Math.round(seasonRange.high / 1000)}k`} note={confidenceLabel} />
      </div>
    </div>
  )
}

function ActivationPanel({ confidenceLabel, engineHref, projectedReturns, projectedSeasonRevenue }: { confidenceLabel: string; engineHref: string; projectedReturns: number; projectedSeasonRevenue: number }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#173A2E] bg-[#173A2E] p-6 text-[#FBFAF6] shadow-[0_20px_48px_-34px_rgba(23,58,46,0.42)] sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9D4C6]">Système actif</p>
        <p className="mt-4 font-serif text-[clamp(2.8rem,8vw,4.8rem)] leading-none">{formatEuro(projectedSeasonRevenue)}</p>
        <p className="mt-3 text-sm text-[#D8E1D4]">projection de saison avec {projectedReturns} retours clients par mois</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard title="QR actif" description="Le client entre tout de suite dans le parcours." />
        <FeatureCard title="Carte codée" description="La carte devient l'accès client. Aucun login à ouvrir." />
        <FeatureCard title="Tableau marchand" description="Le lieu lit revenu, réseau et affluence sans tableau lourd." />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Activation" value={`${LANDING_PRICING.activationFee} €`} note={LANDING_PRICING.recurringLabel} />
        <StatCard label="Affluence" value={`${projectedReturns}`} note="retours mensuels projetés" />
        <StatCard label="Confiance" value={confidenceLabel} note="ordre de grandeur" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href="#methode">Voir le simulateur</Link>
        <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]" href="/demo">Voir la démo client</Link>
        <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]" href={engineHref}>Ouvrir l'outil</Link>
      </div>
    </div>
  )
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
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
      <p className="text-xl font-medium text-[#173A2E]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#556159]">{description}</p>
    </div>
  )
}

function getStepTitle(stepId: OnboardingStepId) {
  if (stepId === "lecture") return "Ce que le lieu perd aujourd'hui."
  if (stepId === "summit") return "Comment déclencher le retour."
  if (stepId === "mechanics") return "Ce qui fait revenir les gens."
  if (stepId === "projection") return "Impact sur le revenu."
  return "Le système tourne."
}

function getStepLead(stepId: OnboardingStepId, worldId: LandingWorldId) {
  const world = LANDING_WORLDS[worldId]
  const reading = READINGS[worldId]
  if (stepId === "lecture") return `Base de lecture : ${reading.clientsPerDay} clients par jour. On rend visible le revenu qui s'échappe déjà du ${world.label.toLowerCase()}.`
  if (stepId === "summit") return "Le grand prix n'est pas décoratif. Il donne une raison claire de revenir dans le lieu."
  if (stepId === "mechanics") return "Cardin ne repose pas sur une carte linéaire. Le retour vient d'une progression, d'un réseau activé et d'une saison courte."
  if (stepId === "projection") return "La projection reste lisible : revenu récupéré, réseau activé et affluence générée sur une saison courte."
  return "Le lieu peut démarrer immédiatement. Le QR ouvre la carte et le commerce lit déjà ce qu'il va récupérer."
}

function getUnderstandingLine(stepId: OnboardingStepId, worldId: LandingWorldId) {
  const world = LANDING_WORLDS[worldId]
  if (stepId === "lecture") return `Le ${world.label.toLowerCase()} perd déjà du revenu. On commence par ce manque visible.`
  if (stepId === "summit") return "Le grand prix n'est pas un bonus. C'est la raison concrète de revenir."
  if (stepId === "mechanics") return "Le retour client vient d'une progression, d'un réseau activé et d'une saison courte."
  if (stepId === "projection") return "Le chiffre devient crédible parce que le passage, la fréquence et le réseau ont déjà été expliqués."
  return "Le lieu repart avec un système activable tout de suite. La carte devient l'accès client."
}

function getSupportingLine(stepId: OnboardingStepId, worldId: LandingWorldId, projectedMonthlyRevenue: number) {
  const world = LANDING_WORLDS[worldId]
  if (stepId === "lecture") return `${world.proofLine} On lit le manque avec le même monde et les mêmes paramètres que Cardin.`
  if (stepId === "summit") return `Le grand prix du monde ${world.label} reste ${world.summitPromise.toLowerCase()} et conditionne le revenu récupéré.`
  if (stepId === "mechanics") return "Le Domino reste volontairement simple : une personne invite une personne, et le réseau activé nourrit le grand prix."
  if (stepId === "projection") return `La projection part d'un ordre de grandeur d'environ ${formatEuro(projectedMonthlyRevenue)} de revenu récupéré par mois.`
  return `L'activation garde la formule Cardin : ${LANDING_PRICING.activationFee} € puis ${LANDING_PRICING.recurringLabel.toLowerCase()}.`
}



