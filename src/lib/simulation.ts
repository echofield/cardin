import { computeCardinFinancialProjection } from "@/lib/cardin-projection-engine"
import { getTemplateById } from "@/lib/merchant-templates"
import { formatEuro } from "@/lib/number-format"
import type {
  AuditSelection,
  FrequencyLevel,
  MerchantProjectionType,
  ProjectionScenario,
  TicketLevel,
  TrafficLevel,
} from "@/lib/projection-scenarios"

const DAYS_OPEN_PER_MONTH = 26

function engineMerchantType(mt: MerchantProjectionType): string {
  if (mt === "beaute") return "institut-beaute"
  if (mt === "bar") return "bar"
  return mt
}

type MerchantBaseModel = {
  traffic: Record<TrafficLevel, number>
  ticket: Record<TicketLevel, number>
  frequency: Record<FrequencyLevel, number>
}

type SimulateScenarioInput = {
  merchantType: MerchantProjectionType
  merchantLabel: string
  scenario: ProjectionScenario
  audit: AuditSelection
}

export type SimulateScenarioResult = {
  revenue_estimate: number
  revenue_low: number
  revenue_high: number
  visits_added: number
  retention_gain: number
  monthly_projection: number
  proofLines: [string, string, string]
  rationale: string
}

const MERCHANT_BASELINES: Record<MerchantProjectionType, MerchantBaseModel> = {
  cafe: {
    traffic: { light: 55, steady: 95, dense: 145 },
    ticket: { small: 5.5, standard: 8.5, premium: 11.5 },
    frequency: { fragile: 0.8, normal: 1, strong: 1.16 },
  },
  bar: {
    traffic: { light: 42, steady: 78, dense: 120 },
    ticket: { small: 8, standard: 14, premium: 22 },
    frequency: { fragile: 0.78, normal: 1, strong: 1.14 },
  },
  restaurant: {
    traffic: { light: 22, steady: 40, dense: 65 },
    ticket: { small: 18, standard: 28, premium: 40 },
    frequency: { fragile: 0.78, normal: 1, strong: 1.14 },
  },
  coiffeur: {
    traffic: { light: 8, steady: 15, dense: 24 },
    ticket: { small: 30, standard: 48, premium: 72 },
    frequency: { fragile: 0.82, normal: 1, strong: 1.15 },
  },
  beaute: {
    traffic: { light: 6, steady: 11, dense: 18 },
    ticket: { small: 40, standard: 65, premium: 95 },
    frequency: { fragile: 0.82, normal: 1, strong: 1.14 },
  },
  boutique: {
    traffic: { light: 12, steady: 22, dense: 38 },
    ticket: { small: 22, standard: 39, premium: 60 },
    frequency: { fragile: 0.8, normal: 1, strong: 1.12 },
  },
}

const TRAFFIC_LABELS: Record<TrafficLevel, string> = {
  light: "flux sélectif",
  steady: "flux régulier",
  dense: "flux dense",
}

const TICKET_LABELS: Record<TicketLevel, string> = {
  small: "ticket essentiel",
  standard: "ticket coeur de vente",
  premium: "ticket premium",
}

const FREQUENCY_LABELS: Record<FrequencyLevel, string> = {
  fragile: "retour fragile",
  normal: "retour à structurer",
  strong: "retour déjà visible",
}

const TRAFFIC_PRESSURE: Record<TrafficLevel, number> = {
  light: 0.88,
  steady: 1,
  dense: 1.12,
}

const TICKET_PRESSURE: Record<TicketLevel, number> = {
  small: 0.94,
  standard: 1,
  premium: 1.1,
}

const FREQUENCY_PRESSURE: Record<FrequencyLevel, number> = {
  fragile: 1.12,
  normal: 1,
  strong: 0.92,
}

export function simulateScenario(input: SimulateScenarioInput): SimulateScenarioResult {
  const merchantBase = MERCHANT_BASELINES[input.merchantType]
  const trafficPerDay = merchantBase.traffic[input.audit.traffic]
  const avgTicket = merchantBase.ticket[input.audit.ticket]
  const frequencyBase = merchantBase.frequency[input.audit.frequency]

  const monthlyTraffic = trafficPerDay * DAYS_OPEN_PER_MONTH
  const engagedCustomers = monthlyTraffic * input.scenario.impact.captureRate * TRAFFIC_PRESSURE[input.audit.traffic]
  const visitsAdded = Math.round(engagedCustomers * input.scenario.impact.revisitRate * FREQUENCY_PRESSURE[input.audit.frequency])
  const upliftedTicket = avgTicket * (1 + input.scenario.impact.basketLift) * TICKET_PRESSURE[input.audit.ticket]
  const retentionGain = Number((input.scenario.impact.retentionLift * frequencyBase).toFixed(4))

  const mt = engineMerchantType(input.merchantType)
  const template = getTemplateById(mt)
  const recoveryPercent = Math.round(template.defaults.calculator_recovery_rate * 100)
  const inactivePercent = 26

  const engine = computeCardinFinancialProjection({
    merchantType: mt,
    monthlyClients: Math.max(1, Math.round(monthlyTraffic)),
    avgTicket: Math.max(0.01, upliftedTicket),
    inactivePercent,
    baseRecoveryPercent: recoveryPercent,
    seasonMonths: 3,
    summitMultiplier: 1,
    lite: false,
  })

  const revenueEstimate = engine.netCardinSeason
  const revenueLow = Math.round(revenueEstimate * input.scenario.impact.confidenceLow)
  const revenueHigh = Math.round(revenueEstimate * input.scenario.impact.confidenceHigh)

  return {
    revenue_estimate: revenueEstimate,
    revenue_low: revenueLow,
    revenue_high: revenueHigh,
    visits_added: visitsAdded,
    retention_gain: retentionGain,
    monthly_projection: engine.netCardinMonth,
    proofLines: [
      `${input.merchantLabel} avec ${TRAFFIC_LABELS[input.audit.traffic]}`,
      `${TICKET_LABELS[input.audit.ticket]} autour de ${formatCompactEuro(avgTicket)}`,
      `${FREQUENCY_LABELS[input.audit.frequency]} sur le scénario choisi`,
    ],
    rationale: `Projection calibrée par marge saisonnière, budget reward borné et Diamond limité pour ${input.scenario.summaryLine.toLowerCase()}`,
  }
}

function formatCompactEuro(value: number): string {
  return formatEuro(value, { maximumFractionDigits: value < 10 ? 1 : 0 })
}

export function formatSimulationRhythm(visitsAdded: number): string {
  if (visitsAdded <= 0) return "Projection à recalibrer selon votre base clients"

  const perWeek = visitsAdded / 4.33
  if (perWeek >= 6) return `≈ ${Math.round(perWeek)} retours en plus / semaine`
  if (perWeek >= 2) return `≈ ${perWeek.toFixed(1)} retours en plus / semaine`
  return `≈ ${visitsAdded} retours en plus / mois`
}

export function formatRetentionLine(retentionGain: number): string {
  const pct = Math.round(retentionGain * 1000) / 10
  return `+${pct} pts de rétention estimée`
}
