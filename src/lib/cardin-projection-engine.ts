/**
 * Protocol-v3-backed projection engine.
 *
 * Keeps the existing projection result shape while switching the math source
 * to the Cardin economic protocol: margin, bounded rewards, capped Diamond.
 */

import { computeProtocolSnapshot, getProtocolPreset, mapMerchantTypeToProtocolProfile } from "@/lib/cardin-protocol-v3"
import type { MonthCandle, ParcoursProjectionResult, SeasonProjectionLayers } from "@/lib/cardin-projection-types"

export { type ProjectionPresetOverrideMap } from "@/lib/projection-engine"

export const DEFAULT_SYSTEM_FEE_MONTH = 0

export type CardinProjectionInput = {
  merchantType: string
  monthlyClients: number
  avgTicket: number
  inactivePercent: number
  baseRecoveryPercent: number
  seasonMonths: 3 | 6
  summitMultiplier: number
  lite?: boolean
  rewardCostRate?: number
  diamondCostMonthFull?: number
  systemFeeMonth?: number
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

function computeConfidenceLabel(sigmaSeason: number): string {
  if (sigmaSeason >= 5) return "forte"
  if (sigmaSeason >= 3) return "solide"
  if (sigmaSeason >= 2) return "prudente"
  return "fragile"
}

export function computeCardinFinancialProjection(
  input: CardinProjectionInput,
  _overrides?: unknown,
): ParcoursProjectionResult {
  const profileId = mapMerchantTypeToProtocolProfile(input.merchantType)
  const preset = getProtocolPreset(profileId)
  const recoveryScale = clamp(input.baseRecoveryPercent / 14, 0.7, 1.4)
  const inactivityScale = clamp(input.inactivePercent / 25, 0.8, 1.3)
  const activeUsers = Math.max(12, Math.round(input.monthlyClients * 0.08))
  const deltaVisitsPerMonth = preset.deltaVisitsPerMonth * recoveryScale * inactivityScale * input.summitMultiplier

  const config = {
    ...preset,
    aov: input.avgTicket,
    seasonLengthMonths: input.seasonMonths,
    deltaVisitsPerMonth,
    diamond: {
      ...preset.diamond,
      budget: input.lite ? 0 : preset.diamond.budget,
      tokenCost: input.lite ? 0 : preset.diamond.tokenCost,
      tokenRedemptionRate: input.lite ? 0 : preset.diamond.tokenRedemptionRate,
    },
  }

  const snapshot = computeProtocolSnapshot(
    config,
    {
      activeUsers,
      rawScans: Math.round(activeUsers / Math.max(config.funnel.activationRate, 0.1)),
      midpointUsers: Math.round(activeUsers * config.funnel.midpointRate),
      summitUsers: Math.round(activeUsers * config.funnel.summitRate),
      diamondUsers: input.lite ? 0 : Math.round(activeUsers * config.funnel.diamondRate),
      referralsConverted: input.lite ? 0 : Math.round(activeUsers * config.funnel.diamondRate * config.funnel.maxInvites * config.funnel.conversionRate),
      progressScore: 0.92,
      costScore: 0.6,
      propagationScore: input.lite ? 0 : 0.74,
      engagementRate: 0.82,
      integrityScore: 0.08,
      actualRewardCostSeason: 0,
      actualRewardCostWeek: 0,
      actualRewardCostDay: 0,
      actualDiamondCostSeason: 0,
      actualPropagationCostSeason: 0,
      inheritedDiamondUsers: 0,
    },
    { enabled: true, diamondTokensEnabled: !input.lite, adaptiveHooksEnabled: false },
    profileId,
  )

  const layers: SeasonProjectionLayers = {
    recovery: Math.round(snapshot.projected.GP_direct),
    frequency: Math.round(snapshot.projected.GP_uplift),
    domino: input.lite ? 0 : Math.round(snapshot.projected.GP_prop),
    total: Math.round(snapshot.projected.GP_direct + snapshot.projected.GP_uplift + (input.lite ? 0 : snapshot.projected.GP_prop)),
    activeCardholders: activeUsers,
    dominoNewClients: input.lite ? 0 : Math.round(snapshot.projected.N_ref),
  }

  const rewardCostSeason = input.lite ? snapshot.projected.RC_direct : snapshot.projected.RC_direct + snapshot.projected.RC_prop
  const diamondCostSeason = input.lite ? 0 : snapshot.projected.RC_diamond_season
  const rewardCostMonth = Math.round(rewardCostSeason / input.seasonMonths)
  const diamondCostMonth = Math.round(diamondCostSeason / input.seasonMonths)
  const systemFeeMonth = input.systemFeeMonth ?? DEFAULT_SYSTEM_FEE_MONTH
  const grossMonth = Math.round(snapshot.projected.GP_total / input.seasonMonths)
  const netCardinSeason = Math.max(
    0,
    Math.round(snapshot.projected.GP_total - rewardCostSeason - diamondCostSeason - systemFeeMonth * input.seasonMonths),
  )
  const netCardinMonth = Math.round(netCardinSeason / input.seasonMonths)

  const monthlyAverage = netCardinMonth
  const monthlyLow = Math.round(netCardinMonth * 0.88)
  const monthlyHigh = Math.round(netCardinMonth * 1.12)

  const cumulativeByMonth: number[] = []
  const candles: MonthCandle[] = []
  let prev = 0
  for (let m = 1; m <= input.seasonMonths; m++) {
    const t = m / input.seasonMonths
    const curved = netCardinSeason * Math.pow(t, 1.08)
    cumulativeByMonth.push(Math.round(curved))
    const inc = curved - prev
    const o = inc * 0.96
    const c = inc * 1.04
    candles.push({
      month: m,
      open: Math.round(o),
      high: Math.round(Math.max(o, c) * 1.02),
      low: Math.round(Math.min(o, c) * 0.98),
      close: Math.round(c),
    })
    prev = curved
  }

  return {
    layers,
    grossMonth,
    rewardCostMonth,
    diamondCostMonth,
    systemFeeMonth,
    netCardinMonth,
    netCardinSeason,
    monthlyReturns: Math.max(1, Math.round(snapshot.projected.N * config.deltaVisitsPerMonth)),
    recoveredClientsMonth: Math.max(1, Math.round(snapshot.projected.N_mid / input.seasonMonths)),
    confidenceLabel: computeConfidenceLabel(snapshot.projected.sigma_season),
    monthlyAverage,
    monthlyLow,
    monthlyHigh,
    cumulativeByMonth,
    candles,
    merchantType: input.merchantType,
  }
}
