import { type BehaviorScenarioId } from "@/lib/behavior-engine"
import { LANDING_WORLDS, type LandingWorldId } from "@/lib/landing-content"
import { getTemplateById } from "@/lib/merchant-templates"
import { projectScenarioImpact } from "@/lib/projection-engine"

export type { ParcoursDemoSlice, ParcoursProjectionResult, SeasonProjectionLayers } from "@/lib/parcours-projection"
export { computeParcoursProjectionFull, computeSeasonProjection } from "@/lib/parcours-projection"

export type DemoWorldContent = {
  businessName: string
  businessTypeLabel: string
  sampleClientName: string
  summitLabel: string
  targetVisits: number
  seasonMonths: 3 | 6
  seasonLabel: string
  invitePrompt: string
  returnPrompt: string
  weakDayPrompt: string
  merchantType: string
  monthlyClients: number
  avgTicket: number
  inactivePercent: number
  recoveryPercent: number
  lostClientsPerMonth: number
  lostRevenuePerMonth: number
  projectedMonthlyRevenue: number
  projectedMonthlyReturns: number
  projectedRecoveredClients: number
  projectedSeasonRevenue: number
  projectedPaybackDays: number
  confidenceLabel: string
}

type DemoWorldAssumptions = {
  businessName: string
  businessTypeLabel: string
  sampleClientName: string
  seasonMonths: 3 | 6
  merchantType: string
  scenarioId: BehaviorScenarioId
  monthlyClients: number
  avgTicket: number
  inactivePercent: number
  invitePrompt: string
  returnPrompt: string
  weakDayPrompt: string
}

const DEMO_WORLD_ASSUMPTIONS: Record<LandingWorldId, DemoWorldAssumptions> = {
  cafe: {
    businessName: "Cafe Brulerie",
    businessTypeLabel: "Cafe",
    sampleClientName: "Marie L.",
    seasonMonths: 3,
    merchantType: "cafe",
    scenarioId: "starting_loop",
    monthlyClients: 420,
    avgTicket: 6.5,
    inactivePercent: 28,
    invitePrompt: "1 invitation restante",
    returnPrompt: "Revenez dans 3 jours",
    weakDayPrompt: "Lundi calme",
  },
  restaurant: {
    businessName: "Maison Serein",
    businessTypeLabel: "Restaurant",
    sampleClientName: "Claire M.",
    seasonMonths: 3,
    merchantType: "restaurant",
    scenarioId: "starting_loop",
    monthlyClients: 185,
    avgTicket: 48,
    inactivePercent: 24,
    invitePrompt: "Invitez une table amie",
    returnPrompt: "Revenez cette semaine",
    weakDayPrompt: "Mardi plus calme",
  },
  beaute: {
    businessName: "Atelier Source",
    businessTypeLabel: "Beaute",
    sampleClientName: "Ines R.",
    seasonMonths: 6,
    merchantType: "institut-beaute",
    scenarioId: "starting_loop",
    monthlyClients: 95,
    avgTicket: 72,
    inactivePercent: 26,
    invitePrompt: "Transmission ouverte",
    returnPrompt: "Votre prochain soin compte",
    weakDayPrompt: "Jeudi plus souple",
  },
  boutique: {
    businessName: "Maison Tissu",
    businessTypeLabel: "Boutique",
    sampleClientName: "Lea D.",
    seasonMonths: 6,
    merchantType: "boutique",
    scenarioId: "starting_loop",
    monthlyClients: 110,
    avgTicket: 56,
    inactivePercent: 24,
    invitePrompt: "Une amie a inviter",
    returnPrompt: "Votre prochaine visite debloque la suite",
    weakDayPrompt: "Mercredi plus calme",
  },
}

export function getDemoWorldContent(worldId: LandingWorldId): DemoWorldContent {
  const world = LANDING_WORLDS[worldId]
  const assumptions = DEMO_WORLD_ASSUMPTIONS[worldId]
  const template = getTemplateById(assumptions.merchantType)
  const projection = projectScenarioImpact({
    merchantType: assumptions.merchantType,
    scenarioId: assumptions.scenarioId,
    monthlyClients: assumptions.monthlyClients,
    avgTicket: assumptions.avgTicket,
    inactivePercent: assumptions.inactivePercent,
    baseRecoveryPercent: Math.round(template.defaults.calculator_recovery_rate * 100),
  })

  const projectedSeasonRevenue = projection.monthlyRevenue * assumptions.seasonMonths
  const lostClientsPerMonth = Math.round(assumptions.monthlyClients * (assumptions.inactivePercent / 100))
  const lostRevenuePerMonth = Math.round(lostClientsPerMonth * assumptions.avgTicket)

  return {
    businessName: assumptions.businessName,
    businessTypeLabel: assumptions.businessTypeLabel,
    sampleClientName: assumptions.sampleClientName,
    summitLabel: world.summitPromise,
    targetVisits: template.defaults.target_visits,
    seasonMonths: assumptions.seasonMonths,
    seasonLabel: assumptions.seasonMonths === 3 ? "Saison courte - 3 mois" : "Saison longue - 6 mois",
    invitePrompt: assumptions.invitePrompt,
    returnPrompt: assumptions.returnPrompt,
    weakDayPrompt: assumptions.weakDayPrompt,
    merchantType: assumptions.merchantType,
    monthlyClients: assumptions.monthlyClients,
    avgTicket: assumptions.avgTicket,
    inactivePercent: assumptions.inactivePercent,
    recoveryPercent: Math.round(template.defaults.calculator_recovery_rate * 100),
    lostClientsPerMonth,
    lostRevenuePerMonth,
    projectedMonthlyRevenue: projection.monthlyRevenue,
    projectedMonthlyReturns: projection.monthlyReturns,
    projectedRecoveredClients: Math.round(projection.recoveredClients),
    projectedSeasonRevenue,
    projectedPaybackDays: projection.paybackDays,
    confidenceLabel: projection.confidenceLabel,
  }
}
