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
    id: "season",
    index: "04",
    title: "Vision long terme",
    description: "Cartes limitées. Chaque saison pèse davantage.",
    proof: "La saison structure la valeur et prépare la suite commerciale.",
  },
]

const READINGS: Record<LandingWorldId, Reading> = {
  cafe: { clientsPerDay: 80, lostClientsPerMonth: 312, lostRevenuePerMonth: 1950, currentReturnRate: 25, recoverableRate: 35 },
  restaurant: { clientsPerDay: 50, lostClientsPerMonth: 195, lostRevenuePerMonth: 5070, currentReturnRate: 18, recoverableRate: 35 },
  beaute: { clientsPerDay: 12, lostClientsPerMonth: 47, lostRevenuePerMonth: 3990, currentReturnRate: 20, recoverableRate: 35 },
  boutique: { clientsPerDay: 40, lostClientsPerMonth: 156, lostRevenuePerMonth: 8580, currentReturnRate: 17, recoverableRate: 35 },
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

export default function ParcoursPage() {
  const [worldId, setWorldId] = useState<LandingWorldId>("cafe")
  const [stepIndex, setStepIndex] = useState(0)
  const [summitId, setSummitId] = useState<SummitId>("stronger")
  const [mechanicId, setMechanicId] = useState<MechanicId>("return")

  const step = STEPS[stepIndex]
  const reading = READINGS[worldId]
  const world = LANDING_WORLDS[worldId]
  const summit = SUMMIT_OPTIONS.find((item) => item.id === summitId) ?? SUMMIT_OPTIONS[1]
  const mechanic = MECHANICS.find((item) => item.id === mechanicId) ?? MECHANICS[0]
  const demo = getDemoWorldContent(worldId)

  const monthlyRange = useMemo(() => clampRange(demo.projectedMonthlyRevenue, summit.multiplier), [demo.projectedMonthlyRevenue, summit.multiplier])
  const seasonRange = useMemo(() => clampRange(demo.projectedSeasonRevenue, summit.multiplier), [demo.projectedSeasonRevenue, summit.multiplier])

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#F7F3EA] text-[#18271F]">
      <section className="mx-auto max-w-5xl px-5 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
        <div className="flex items-center justify-between gap-4">
          <Link className="text-[15px] font-medium text-[#173A2E]" href="/landing">
            ← Accueil
          </Link>
          <div className="flex items-center gap-2">
            {STEPS.map((item, index) => {
              const active = index < stepIndex
              const current = index === stepIndex
              return (
                <div className="flex items-center gap-2" key={item.id}>
                  <button
                    aria-label={item.title}
                    className={[
                      "h-2.5 w-2.5 rounded-full transition-all duration-300",
                      active || current ? "bg-[#0F523D]" : "bg-[#D9D5CC]",
                      current ? "scale-125" : "scale-100",
                    ].join(" ")}
                    onClick={() => setStepIndex(index)}
                    type="button"
                  />
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

          <div className="mt-10 animate-rise-in" key={step.id}>
            {step.id === "entry" ? (
              <div className="space-y-4">
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
            ) : null}

            {step.id === "lecture" ? (
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
            ) : null}

            {step.id === "summit" ? (
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
                            revenu estimé: +{scenarioRange.low.toLocaleString("fr-FR")}–{scenarioRange.high.toLocaleString("fr-FR")} € / mois
                          </p>
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
                      {active ? (
                        <div className="mt-4 border-t border-[#DCE5DE] pt-4">
                          <MechanicVisual mechanicId={item.id} />
                          <p className="mt-4 text-sm leading-7 text-[#4F5B54]">{item.proof}</p>
                        </div>
                      ) : null}
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
                          <div className="w-full rounded-t-[1rem] bg-[linear-gradient(180deg,#2B5B48_0%,#0F523D_100%)] transition-all duration-500" style={{ height: `${bar.height}%` }} />
                        </div>
                        <p className="mt-3 text-center text-xs text-[#677168]">{bar.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <MetricCard label="Retours / mois" value={`${demo.projectedMonthlyReturns}`} note="affluence générée" />
                  <MetricCard label="Clients récupérés" value={`${demo.projectedRecoveredClients}`} note="sur la saison" />
                  <MetricCard label="Payback" value={`${demo.projectedPaybackDays} jours`} note="temps d'amortissement" />
                </div>
              </div>
            ) : null}

            {step.id === "activation" ? (
              <div className="space-y-5">
                <div className="rounded-[1.9rem] bg-[#0B4F3C] p-7 text-[#FBFAF6] shadow-[0_28px_60px_-38px_rgba(11,79,60,0.45)] sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#AFC7BE]">Ordre de gain mensuel</p>
                  <p className="mt-4 font-serif text-[clamp(3.2rem,8vw,5.1rem)] leading-none">+{monthlyRange.low.toLocaleString("fr-FR")}–{monthlyRange.high.toLocaleString("fr-FR")} €</p>
                  <p className="mt-4 text-sm text-[#D5E2DC]">{demo.projectedMonthlyReturns} retours clients projetés par mois.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <MetricCard label="Activation" value={`${LANDING_PRICING.activationFee} €`} note="mise en place" />
                  <MetricCard label="Récurrent" value={`${LANDING_PRICING.recurringFee} €`} note="par mois de saison" />
                  <MetricCard label="Saison" value={formatEuro(seasonRange.adjusted)} note={demo.confidenceLabel} />
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
                  <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#FFFEFA] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F6F3EB]" href="/engine">
                    Ajuster le système
                  </Link>
                  <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#0F523D] bg-[#0F523D] px-6 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#1B664F]" href="/demo">
                    Voir la démo client
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#D8D4CB] bg-[#F4F1E9] px-6 text-sm font-medium text-[#173A2E] transition disabled:opacity-35"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
              type="button"
            >
              Précédent
            </button>
            <button
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#0F523D] bg-[#0F523D] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#1B664F]"
              onClick={() => setStepIndex((value) => (value === STEPS.length - 1 ? 0 : value + 1))}
              type="button"
            >
              {step.cta}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

function MechanicVisual({ mechanicId }: { mechanicId: MechanicId }) {
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
        <BarGroup bars={cardin} label="Cardin" sublabel="variable et vivant" highlight />
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

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <MetricCard label="Saison" value="3 mois" note="cycle court" />
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
      <p className={["text-[10px] uppercase tracking-[0.14em]", highlight ? "text-[#173A2E]" : "text-[#899188]"].join(" ")}>{label}</p>
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

function buildBars(months: 3 | 6) {
  return Array.from({ length: months }, (_, index) => ({
    label: `M${index + 1}`,
    height: Math.round(38 + ((index + 1) / months) * 50),
  }))
}
