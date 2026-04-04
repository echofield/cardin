import type { MerchantProjectionType } from "@/lib/projection-scenarios"

export type SimulationMode = "one_shot" | "recursive" | "amplified"

export type BaseMetrics = {
  traffic_per_day: number
  conversion_rate: number
  avg_ticket: number
  return_rate: number
}

export type SimulateScenarioInput = {
  merchantType: string
  scenarioType: string
  mode: SimulationMode
  baseMetrics: BaseMetrics
  community_multiplier?: number
  creator_multiplier?: number
}

export type SimulateScenarioResult = {
  revenue_estimate: number
  revenue_low: number
  revenue_high: number
  visits_added: number
  retention_gain: number
  monthly_projection: number
}

/** Mock bases tuned per vertical (0–1 rates). */
export const MOCK_BASE_METRICS: Record<MerchantProjectionType, BaseMetrics> = {
  cafe: { traffic_per_day: 110, conversion_rate: 0.44, avg_ticket: 8.5, return_rate: 0.36 },
  restaurant: { traffic_per_day: 48, conversion_rate: 0.52, avg_ticket: 26, return_rate: 0.3 },
  coiffeur: { traffic_per_day: 22, conversion_rate: 0.72, avg_ticket: 45, return_rate: 0.26 },
  beaute: { traffic_per_day: 18, conversion_rate: 0.68, avg_ticket: 62, return_rate: 0.22 },
  boutique: { traffic_per_day: 35, conversion_rate: 0.38, avg_ticket: 38, return_rate: 0.28 },
}

const DAYS_OPEN_PER_MONTH = 26

/** Deterministic weight from scenario id so different propositions diverge slightly. */
function scenarioWeight(scenarioType: string): number {
  let h = 0
  for (let i = 0; i < scenarioType.length; i += 1) {
    h = (h + scenarioType.charCodeAt(i) * (i + 17)) % 997
  }
  return 0.92 + (h % 17) / 100
}

/**
 * Resolves effective simulation mode. When both community and creator boosts apply,
 * use amplified internally for a stronger combined effect (not exposed in UI).
 */
export function resolveSimulationMode(
  requested: SimulationMode,
  communityMultiplier: number,
  creatorMultiplier: number
): SimulationMode {
  if (requested !== "recursive") return requested
  if (communityMultiplier > 1 && creatorMultiplier > 1) return "amplified"
  return "recursive"
}

export function simulateScenario(input: SimulateScenarioInput): SimulateScenarioResult {
  const m = input.baseMetrics
  const comm = input.community_multiplier ?? 1
  const cre = input.creator_multiplier ?? 1
  const mult = comm * cre
  const w = scenarioWeight(input.scenarioType)

  const monthlyVisits = m.traffic_per_day * DAYS_OPEN_PER_MONTH
  const baseRevenue = monthlyVisits * m.conversion_rate * m.avg_ticket

  let revenueMult = w
  let visitsAddedRatio = 0.065
  let retentionGain = 0.028

  switch (input.mode) {
    case "one_shot": {
      revenueMult *= 1.24 + 0.06 * m.conversion_rate
      visitsAddedRatio = 0.1 + 0.05 * m.conversion_rate
      retentionGain = 0.012 + 0.01 * m.return_rate
      break
    }
    case "recursive": {
      revenueMult *= 1 + 0.2 * m.return_rate + 0.05 * m.conversion_rate
      visitsAddedRatio = 0.045 + 0.13 * m.return_rate
      retentionGain = 0.026 + 0.038 * m.return_rate
      revenueMult *= 1 + (mult - 1) * 0.48
      visitsAddedRatio += 0.032 * (comm - 1) + 0.025 * (cre - 1)
      retentionGain += 0.014 * (mult - 1)
      break
    }
    case "amplified": {
      revenueMult *= 1 + 0.16 * m.return_rate
      revenueMult *= mult ** 0.72
      visitsAddedRatio = 0.06 * mult + 0.08 * m.return_rate
      retentionGain = Math.min(0.18, 0.04 + 0.05 * Math.sqrt(mult) * m.return_rate)
      break
    }
  }

  const revenue_estimate = Math.round(baseRevenue * revenueMult)
  const revenue_low = Math.round(revenue_estimate * 0.62)
  const revenue_high = Math.round(revenue_estimate * 1.35)
  const visits_added = Math.round(monthlyVisits * Math.min(0.42, visitsAddedRatio))
  const monthly_projection = revenue_estimate

  return {
    revenue_estimate,
    revenue_low,
    revenue_high,
    visits_added,
    retention_gain: Number(Math.min(0.22, retentionGain).toFixed(4)),
    monthly_projection,
  }
}

export function getMockBaseMetrics(merchantType: MerchantProjectionType): BaseMetrics {
  return { ...MOCK_BASE_METRICS[merchantType] }
}

export const SIM_COMMUNITY_MULTIPLIER = 1.15
export const SIM_CREATOR_MULTIPLIER = 1.12

export function formatSimulationRhythm(visitsAdded: number): string {
  if (visitsAdded <= 0) return "Rythme à caler sur votre fichier client"
  const perDay = visitsAdded / DAYS_OPEN_PER_MONTH
  if (perDay >= 0.75) return "≈ 1 passage en plus par jour ouvré"
  if (perDay >= 0.3) return `≈ ${perDay.toFixed(1)} retours en plus par jour`
  return `≈ ${visitsAdded} visites en plus / mois`
}

export function formatRetentionLine(retentionGain: number): string {
  const pct = Math.round(retentionGain * 1000) / 10
  return `+${pct} pts de rétention (estimé)`
}
