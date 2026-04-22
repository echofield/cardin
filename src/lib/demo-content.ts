import { LANDING_PRICING, LANDING_WORLDS, type LandingWorldId } from "@/lib/landing-content"
import { getEngineAlignedAssumptions } from "@/lib/engine-aligned-assumptions"
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
  seasonMonths: 3
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
  merchantType: string
  invitePrompt: string
  returnPrompt: string
  weakDayPrompt: string
}

const DEMO_WORLD_ASSUMPTIONS: Record<LandingWorldId, DemoWorldAssumptions> = {
  cafe: {
    businessName: "Café Brûlerie",
    businessTypeLabel: "Café",
    sampleClientName: "Marie L.",
    merchantType: "cafe",
    invitePrompt: "1 invitation restante",
    returnPrompt: "Revenez dans 3 jours",
    weakDayPrompt: "Lundi calme",
  },
  bar: {
    businessName: "Bar Huit",
    businessTypeLabel: "Bar",
    sampleClientName: "Thomas R.",
    merchantType: "bar",
    invitePrompt: "1 invitation restante",
    returnPrompt: "Revenez ce week-end",
    weakDayPrompt: "Mardi plus calme",
  },
  boulangerie: {
    businessName: "Maison Levain",
    businessTypeLabel: "Boulangerie",
    sampleClientName: "Julie P.",
    merchantType: "boulangerie",
    invitePrompt: "1 invitation quartier",
    returnPrompt: "Revenez dans la semaine",
    weakDayPrompt: "Mardi plus calme",
  },
  restaurant: {
    businessName: "Maison Serein",
    businessTypeLabel: "Restaurant",
    sampleClientName: "Claire M.",
    merchantType: "restaurant",
    invitePrompt: "Invitez une table amie",
    returnPrompt: "Revenez cette semaine",
    weakDayPrompt: "Mardi plus calme",
  },
  caviste: {
    businessName: "Cave des Voisins",
    businessTypeLabel: "Caviste",
    sampleClientName: "Antoine V.",
    merchantType: "caviste",
    invitePrompt: "Invitez quelqu'un à la dégustation",
    returnPrompt: "Revenez pour la prochaine sélection",
    weakDayPrompt: "Mercredi plus calme",
  },
  beaute: {
    businessName: "Atelier Source",
    businessTypeLabel: "Beauté",
    sampleClientName: "Inès R.",
    merchantType: "institut-beaute",
    invitePrompt: "Transmission ouverte",
    returnPrompt: "Votre prochain soin compte",
    weakDayPrompt: "Jeudi plus souple",
  },
  boutique: {
    businessName: "Maison Tissu",
    businessTypeLabel: "Boutique",
    sampleClientName: "Léa D.",
    merchantType: "boutique",
    invitePrompt: "Une amie à inviter",
    returnPrompt: "Votre prochaine visite débloque la suite",
    weakDayPrompt: "Mercredi plus calme",
  },
}

export function getDemoWorldContent(worldId: LandingWorldId): DemoWorldContent {
  const world = LANDING_WORLDS[worldId]
  const assumptions = DEMO_WORLD_ASSUMPTIONS[worldId]
  const template = getTemplateById(assumptions.merchantType)
  const aligned = getEngineAlignedAssumptions(assumptions.merchantType)
  const recoveryPercent = aligned.recoveryPercent
  const seasonMonths = 3 as const

  const engine = computeParcoursProjectionFull(
    {
      merchantType: assumptions.merchantType,
      monthlyClients: aligned.monthlyClients,
      avgTicket: aligned.avgTicket,
      inactivePercent: aligned.inactivePercent,
      recoveryPercent,
      seasonMonths,
    },
    1,
    undefined,
    { lite: false },
  )

  const lostClientsPerMonth = Math.round(aligned.monthlyClients * (aligned.inactivePercent / 100))
  const lostRevenuePerMonth = Math.round(lostClientsPerMonth * aligned.avgTicket)

  const dailyNet = engine.netCardinMonth / 26
  const projectedPaybackDays =
    dailyNet > 0 ? Math.max(1, Math.ceil(LANDING_PRICING.activationFee / dailyNet)) : 999

  return {
    businessName: assumptions.businessName,
    businessTypeLabel: assumptions.businessTypeLabel,
    sampleClientName: assumptions.sampleClientName,
    summitLabel: world.summitPromise,
    targetVisits: template.defaults.target_visits,
    seasonMonths,
    seasonLabel: "Saison — 3 mois",
    invitePrompt: assumptions.invitePrompt,
    returnPrompt: assumptions.returnPrompt,
    weakDayPrompt: assumptions.weakDayPrompt,
    merchantType: assumptions.merchantType,
    monthlyClients: aligned.monthlyClients,
    avgTicket: aligned.avgTicket,
    inactivePercent: aligned.inactivePercent,
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
