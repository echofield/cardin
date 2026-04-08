"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { getDemoWorldContent } from "@/lib/demo-content"
import { LANDING_PRICING, LANDING_WORLD_ORDER, LANDING_WORLDS, type LandingWorldId } from "@/lib/landing-content"

type StepId = "entry" | "lecture" | "summit" | "mechanics" | "projection" | "activation"
type SummitId = "visible" | "stronger" | "discreet"
type MechanicId = "return" | "surprise" | "domino" | "season"

type Step = { id: StepId; eyebrow: string; title: string; lead: string; cta: string }
type SummitOption = { id: SummitId; label: string; description: string; metric: string; multiplier: number }
type MechanicOption = { id: MechanicId; index: string; title: string; description: string; proof: string }
type Reading = { clientsPerDay: number; lostClientsPerMonth: number; lostRevenuePerMonth: number; currentReturnRate: number; recoverableRate: number }

const STEPS: Step[] = [
  { id: "entry", eyebrow: "Étape 1 — Entrée", title: "Quel lieu connectez-vous ?", lead: "Le système s'adapte au type de commerce. Commencez par le monde réel du lieu.", cta: "Continuer" },
  { id: "lecture", eyebrow: "Étape 2 — Lecture", title: "Ce que le lieu perd aujourd'hui.", lead: "On ne commence pas par une promesse. On commence par le revenu qui s'échappe déjà.", cta: "Activer la lecture" },
  { id: "summit", eyebrow: "Étape 3 — Sommet", title: "Comment déclencher le retour.", lead: "Le grand prix n'est pas décoratif. Son intensité détermine la force du rappel.", cta: "Choisir le sommet" },
  { id: "mechanics", eyebrow: "Étape 4 — Mécanique", title: "Ce qui fait revenir les gens.", lead: "Une progression claire. Un réseau activé. Une saison courte. Rien de plus à expliquer.", cta: "Voir la mécanique" },
  { id: "projection", eyebrow: "Étape 5 — Projection", title: "Impact sur le revenu.", lead: "Le passage, la fréquence et le réseau deviennent un ordre de grandeur crédible.", cta: "Voir la projection" },
  { id: "activation", eyebrow: "Étape 6 — Activation", title: "Le moteur tourne.", lead: "Le lieu repart avec un système actif, une carte client et une lecture simple du revenu récupéré.", cta: "Terminer" },
]

const SUMMIT_OPTIONS: SummitOption[] = [
  { id: "visible", label: "Sommet visible", description: "Le client comprend ce qu'il débloque. Le retour est clair.", metric: "×1,00", multiplier: 1 },
  { id: "stronger", label: "Sommet renforcé", description: "La récompense est plus forte. Le retour et le réseau montent plus vite.", metric: "×1,25", multiplier: 1.25 },
  { id: "discreet", label: "Sommet discret", description: "La promesse reste plus rare. L'effet de surprise est plus sélectif.", metric: "×0,85", multiplier: 0.85 },
]

const MECHANICS: MechanicOption[] = [
  { id: "return", index: "01", title: "Il revient", description: "La progression crée une raison simple de repasser.", proof: "Le retour client devient une habitude, pas un coup de chance." },
  { id: "surprise", index: "02", title: "Il reçoit quelque chose tôt", description: "Le parcours joue avant la dixième visite.", proof: "Une récompense précoce remet de la fréquence sans transformer le lieu en promotion permanente." },
  { id: "domino", index: "03", title: "Le réseau s'active", description: "Une personne invite une personne. Le bouche-à-oreille reste simple.", proof: "Le Domino ajoute de l'affluence sans rendre la carte compliquée à comprendre." },
  { id: "season", index: "04", title: "La saison remet la tension", description: "Le système reste court, lisible et vivant.", proof: "Une saison bornée garde de la valeur et prépare déjà la suivante." },
]

const READINGS: Record<LandingWorldId, Reading> = {
  cafe: { clientsPerDay: 80, lostClientsPerMonth: 312, lostRevenuePerMonth: 1950, currentReturnRate: 25, recoverableRate: 35 },
  restaurant: { clientsPerDay: 50, lostClientsPerMonth: 195, lostRevenuePerMonth: 5070, currentReturnRate: 18, recoverableRate: 35 },
  beaute: { clientsPerDay: 12, lostClientsPerMonth: 47, lostRevenuePerMonth: 3990, currentReturnRate: 20, recoverableRate: 35 },
  boutique: { clientsPerDay: 40, lostClientsPerMonth: 156, lostRevenuePerMonth: 8580, currentReturnRate: 17, recoverableRate: 35 },
}

const formatEuro = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
const clampRange = (value: number, multiplier: number) => ({ low: Math.round(value * multiplier * 0.88), high: Math.round(value * multiplier * 1.14), adjusted: Math.round(value * multiplier) })

export default function ParcoursPage() {
  const [worldId, setWorldId] = useState<LandingWorldId>("cafe")
  const [stepIndex, setStepIndex] = useState(0)
  const [summitId, setSummitId] = useState<SummitId>("stronger")
  const [mechanicId, setMechanicId] = useState<MechanicId>("surprise")

  const step = STEPS[stepIndex]
  const world = LANDING_WORLDS[worldId]
  const reading = READINGS[worldId]
  const summit = SUMMIT_OPTIONS.find((item) => item.id === summitId) ?? SUMMIT_OPTIONS[1]
  const mechanic = MECHANICS.find((item) => item.id === mechanicId) ?? MECHANICS[1]
  const demo = getDemoWorldContent(worldId)
  const monthlyRange = useMemo(() => clampRange(demo.projectedMonthlyRevenue, summit.multiplier), [demo.projectedMonthlyRevenue, summit.multiplier])
  const seasonRange = useMemo(() => clampRange(demo.projectedSeasonRevenue, summit.multiplier), [demo.projectedSeasonRevenue, summit.multiplier])

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#F7F3EA] text-[#18271F]">
      <section className="mx-auto max-w-5xl px-5 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
        <div className="flex items-center justify-between gap-4">
          <Link className="text-[15px] font-medium text-[#173A2E]" href="/landing">← CARDIN</Link>
          <div className="flex items-center gap-2">
            {STEPS.map((item, index) => {
              const active = index < stepIndex
              const current = index === stepIndex
              return (
                <div className="flex items-center gap-2" key={item.id}>
                  <button aria-label={item.title} className={["h-2.5 w-2.5 rounded-full transition-all", active || current ? "bg-[#0F523D]" : "bg-[#D9D5CC]", current ? "scale-125" : "scale-100"].join(" ")} onClick={() => setStepIndex(index)} type="button" />
                  {index < STEPS.length - 1 ? <span className={["h-px w-5", active ? "bg-[#0F523D]" : "bg-[#D9D5CC]"].join(" ")} /> : null}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-3xl lg:mt-14">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#7A817A]">{step.eyebrow}</p>
          <h1 className="mt-4 font-serif text-[clamp(3rem,8vw,5.4rem)] leading-[0.96] text-[#0F523D]">{step.title}</h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-8 text-[#59635C]">{step.lead}</p>

          <div className="mt-10"> 
            {step.id === "entry" ? (
              <div className="space-y-4">
                {LANDING_WORLD_ORDER.map((candidate) => {
                  const active = candidate === worldId
                  const candidateWorld = LANDING_WORLDS[candidate]
                  return (
                    <button
                      className={[
                        "flex w-full items-center justify-between rounded-[1.6rem] border px-5 py-5 text-left transition",
                        active ? "border-[#7EA694] bg-[#EEF4F0] shadow-[0_18px_40px_-34px_rgba(15,82,61,0.35)]" : "border-[#E3DED3] bg-[#FCFBF7] hover:border-[#B8C6BC] hover:bg-[#F6F4ED]",
                      ].join(" ")}
                      key={candidate}
                      onClick={() => setWorldId(candidate)}
                      type="button"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E6E1D8] bg-[#FFFEFA] text-lg text-[#0F523D]">{getWorldGlyph(candidate)}</span>
                        <div>
                          <p className="text-[1.35rem] font-medium text-[#173A2E]">{candidateWorld.label}</p>
                          <p className="mt-1 text-sm text-[#677168]">{candidateWorld.onboardingLead}</p>
                        </div>
                      </div>
                      <span className="text-xl text-[#8A9389]">›</span>
                    </button>
                  )
                })}
              </div>
            ) : null}

            {step.id === "lecture" ? (
              <div className="space-y-5">
                <div className="rounded-[1.9rem] bg-[#0B4F3C] p-7 text-[#FBFAF6] shadow-[0_28px_60px_-38px_rgba(11,79,60,0.45)] sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#AFC7BE]">Clients perdus chaque mois</p>
                  <p className="mt-4 font-serif text-[clamp(3.6rem,9vw,5.6rem)] leading-none">~{reading.lostClientsPerMonth}</p>
                  <p className="mt-3 text-sm text-[#D5E2DC]">soit {formatEuro(reading.lostRevenuePerMonth)} de revenu non capté</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricCard label="Taux de retour actuel" value={`${reading.currentReturnRate}%`} note="sans Cardin" />
                  <MetricCard label="Récupérable" value={`${reading.recoverableRate}%`} note="revenu récupéré possible" />
                </div>
              </div>
            ) : null}

            {step.id === "summit" ? (
              <div className="space-y-4">
                {SUMMIT_OPTIONS.map((item) => {
                  const active = item.id === summitId
                  return (
                    <button
                      className={[
                        "w-full rounded-[1.6rem] border p-5 text-left transition",
                        active ? "border-[#C5A355] bg-[linear-gradient(180deg,#FBF3DB_0%,#F6E8BF_100%)] shadow-[0_18px_40px_-32px_rgba(140,114,34,0.24)]" : "border-[#E3DED3] bg-[#FCFBF7] hover:border-[#D1C17F] hover:bg-[#FBF8EF]",
                      ].join(" ")}
                      key={item.id}
                      onClick={() => setSummitId(item.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xl font-medium text-[#173A2E]">{item.label}</p>
                          <p className="mt-2 text-sm leading-7 text-[#5F665E]">{item.description}</p>
                        </div>
                        <p className="pt-1 text-2xl font-semibold text-[#B38A2D]">{item.metric}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : null}

            {step.id === "mechanics" ? (
              <div className="space-y-3">
                {MECHANICS.map((item) => {
                  const active = item.id === mechanicId
                  return (
                    <button
                      className={[
                        "w-full rounded-[1.45rem] border p-5 text-left transition",
                        active ? "border-[#7EA694] bg-[#F4FAF6]" : "border-[#E3DED3] bg-[#FCFBF7] hover:border-[#C2CCC0]",
                      ].join(" ")}
                      key={item.id}
                      onClick={() => setMechanicId(item.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <span className="pt-1 font-mono text-xs text-[#7A817A]">{item.index}</span>
                          <div>
                            <p className="text-lg font-medium text-[#173A2E]">{item.title}</p>
                            <p className="mt-1 text-sm text-[#5F665E]">{item.description}</p>
                          </div>
                        </div>
                        <span className="text-lg text-[#7A817A]">{active ? "×" : "+"}</span>
                      </div>
                      {active ? <p className="mt-4 border-t border-[#DCE5DE] pt-4 text-sm leading-7 text-[#4F5B54]">{item.proof}</p> : null}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {step.id === "projection" ? (
              <div className="space-y-5">
                <div className="rounded-[1.9rem] bg-[#0B4F3C] p-7 text-[#FBFAF6] shadow-[0_28px_60px_-38px_rgba(11,79,60,0.45)] sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#AFC7BE]">Revenu supplémentaire / mois</p>
                  <p className="mt-4 font-serif text-[clamp(3.2rem,8vw,5.1rem)] leading-none">+{monthlyRange.low.toLocaleString("fr-FR")}–{monthlyRange.high.toLocaleString("fr-FR")} €</p>
                </div>
                <div className="rounded-[1.6rem] border border-[#E3DED3] bg-[#FCFBF7] p-5 sm:p-6">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817A]">Revenu cumulé sur {demo.seasonMonths} mois</p>
                  <div className="mt-5 flex h-44 items-end gap-4 rounded-[1.25rem] border border-[#ECE7DC] bg-[linear-gradient(180deg,#F8F6EF_0%,#F2EEE4_100%)] px-5 pb-5 pt-8">
                    {buildBars(demo.seasonMonths).map((bar) => (
                      <div className="flex-1" key={bar.label}>
                        <div className="flex h-24 items-end">
                          <div className="w-full rounded-t-[1rem] bg-[linear-gradient(180deg,#2B5B48_0%,#0F523D_100%)]" style={{ height: `${bar.height}%` }} />
                        </div>
                        <p className="mt-3 text-center text-xs text-[#677168]">{bar.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <MetricCard label="Réseau" value="×1,15" note="effet domino activé" />
                  <MetricCard label="Sommet" value={summit.metric} note="sélection active" />
                  <MetricCard label="Saison" value={`${Math.round(seasonRange.low / 1000)}–${Math.round(seasonRange.high / 1000)}k`} note={demo.confidenceLabel} />
                </div>
              </div>
            ) : null}

            {step.id === "activation" ? (
              <div className="space-y-5">
                <div className="rounded-[1.9rem] bg-[#0B4F3C] p-7 text-[#FBFAF6] shadow-[0_28px_60px_-38px_rgba(11,79,60,0.45)] sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#AFC7BE]">Ordre de gain mensuel</p>
                  <p className="mt-4 font-serif text-[clamp(3.2rem,8vw,5.1rem)] leading-none">+{monthlyRange.low.toLocaleString("fr-FR")}–{monthlyRange.high.toLocaleString("fr-FR")} €</p>
                  <p className="mt-4 text-sm text-[#D5E2DC]">Estimation basée sur vos paramètres et les moyennes du secteur.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <MetricCard label="Activation" value={`${LANDING_PRICING.activationFee} €`} note={LANDING_PRICING.recurringLabel} />
                  <MetricCard label="Réseau" value="×1,15" note="effet domino activé" />
                  <MetricCard label="Sommet" value={summit.metric} note={world.summitPromise} />
                </div>
                <details className="rounded-[1.5rem] border border-[#E3DED3] bg-[#FCFBF7] p-5 text-[#173A2E]">
                  <summary className="cursor-pointer text-sm font-medium">Voir la configuration</summary>
                  <div className="mt-4 grid gap-3 text-sm text-[#5F665E] sm:grid-cols-2">
                    <p>{world.label} — {world.eyebrow}</p>
                    <p>{demo.seasonLabel}</p>
                    <p>{demo.projectedMonthlyReturns} retours clients projetés / mois</p>
                    <p>{formatEuro(demo.projectedSeasonRevenue)} sur la saison</p>
                  </div>
                </details>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                  <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#FFFEFA] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F6F3EB]" href="/engine">Ajuster le système</Link>
                  <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#0F523D] bg-[#0F523D] px-6 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#1B664F]" href="/demo">Voir la démo client →</Link>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button className="inline-flex h-12 items-center justify-center rounded-full border border-[#D8D4CB] bg-[#F4F1E9] px-6 text-sm font-medium text-[#173A2E] transition disabled:opacity-35" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))} type="button">
              Précédent
            </button>
            <button className="inline-flex h-12 items-center justify-center rounded-full border border-[#0F523D] bg-[#0F523D] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#1B664F]" onClick={() => setStepIndex((value) => Math.min(STEPS.length - 1, value + 1))} type="button">
              {stepIndex === STEPS.length - 1 ? "Revoir le parcours" : step.cta}
            </button>
          </div>
        </div>
      </section>
    </main>
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

function buildBars(months: 3 | 6) {
  return Array.from({ length: months }, (_, index) => ({ label: `M${index + 1}`, height: Math.round(38 + ((index + 1) / months) * 50) }))
}

function getWorldGlyph(worldId: LandingWorldId) {
  if (worldId === "cafe") return "☕"
  if (worldId === "restaurant") return "🍽"
  if (worldId === "beaute") return "✂"
  return "◻"
}
