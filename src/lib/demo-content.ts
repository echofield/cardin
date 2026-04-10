import { LANDING_PRICING, LANDING_WORLDS, type LandingWorldId } from "@/lib/landing-content"
import { getTemplateById } from "@/lib/merchant-templates"
import { computeParcoursProjectionFull } from "@/lib/parcours-projection"

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
  /** Net EUR/month after rewards & costs (same engine as parcours, summit ×1) */
  projectedMonthlyRevenue: number
  projectedMonthlyReturns: number
  projectedRecoveredClients: number
  /** Net EUR season (same engine) */
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
  monthlyClients: number
  avgTicket: number
  inactivePercent: number
  invitePrompt: string
  returnPrompt: string
  weakDayPrompt: string
}

const DEMO_WORLD_ASSUMPTIONS: Record<LandingWorldId, DemoWorldAssumptions> = {
  cafe: {
    businessName: "Café Brûlerie",
    businessTypeLabel: "Café",
    sampleClientName: "Marie L.",
    seasonMonths: 3,
    merchantType: "cafe",
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
    monthlyClients: 185,
    avgTicket: 48,
    inactivePercent: 24,
    invitePrompt: "Invitez une table amie",
    returnPrompt: "Revenez cette semaine",
    weakDayPrompt: "Mardi plus calme",
  },
  beaute: {
    businessName: "Atelier Source",
    businessTypeLabel: "Beauté",
    sampleClientName: "Inès R.",
    seasonMonths: 3,
    merchantType: "institut-beaute",
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
    sampleClientName: "Léa D.",
    seasonMonths: 3,
    merchantType: "boutique",
    monthlyClients: 110,
    avgTicket: 56,
    inactivePercent: 24,
    invitePrompt: "Une amie à inviter",
    returnPrompt: "Votre prochaine visite débloque la suite",
    weakDayPrompt: "Mercredi plus calme",
  },
}

export function getDemoWorldContent(worldId: LandingWorldId): DemoWorldContent {
  const world = LANDING_WORLDS[worldId]
  const assumptions = DEMO_WORLD_ASSUMPTIONS[worldId]
  const template = getTemplateById(assumptions.merchantType)
  const recoveryPercent = Math.round(template.defaults.calculator_recovery_rate * 100)

  const engine = computeParcoursProjectionFull(
    {
      merchantType: assumptions.merchantType,
      monthlyClients: assumptions.monthlyClients,
      avgTicket: assumptions.avgTicket,
      inactivePercent: assumptions.inactivePercent,
      recoveryPercent,
      seasonMonths: assumptions.seasonMonths,
    },
    1,
    undefined,
    { lite: false },
  )

  const lostClientsPerMonth = Math.round(assumptions.monthlyClients * (assumptions.inactivePercent / 100))
  const lostRevenuePerMonth = Math.round(lostClientsPerMonth * assumptions.avgTicket)

  const dailyNet = engine.netCardinMonth / 26
  const projectedPaybackDays =
    dailyNet > 0 ? Math.max(1, Math.ceil(LANDING_PRICING.activationFee / dailyNet)) : 999

  return {
    businessName: assumptions.businessName,
    businessTypeLabel: assumptions.businessTypeLabel,
    sampleClientName: assumptions.sampleClientName,
    summitLabel: world.summitPromise,
    targetVisits: template.defaults.target_visits,
    seasonMonths: assumptions.seasonMonths,
    seasonLabel: assumptions.seasonMonths === 3 ? "Saison — 3 mois" : "Saison longue — 6 mois",
    invitePrompt: assumptions.invitePrompt,
    returnPrompt: assumptions.returnPrompt,
    weakDayPrompt: assumptions.weakDayPrompt,
    merchantType: assumptions.merchantType,
    monthlyClients: assumptions.monthlyClients,
    avgTicket: assumptions.avgTicket,
    inactivePercent: assumptions.inactivePercent,
    recoveryPercent,
    lostClientsPerMonth,
    lostRevenuePerMonth,
    projectedMonthlyRevenue: engine.netCardinMonth,
    projectedMonthlyReturns: engine.monthlyReturns,
    projectedRecoveredClients: engine.recoveredClientsMonth,
    projectedSeasonRevenue: engine.netCardinSeason,
    projectedPaybackDays,
    confidenceLabel: engine.confidenceLabel,
  }
}
