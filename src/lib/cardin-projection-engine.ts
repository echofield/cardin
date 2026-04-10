/**
 * Single source of truth for Cardin financial projections (parcours, API, demo alignment).
 *
 * Gross layers: recovery + frequency + domino (season totals for UI breakdown).
 * Net: grossMonth − reward − diamond − system fee → netCardinMonth, netCardinSeason.
 *
 * Full mode: Diamond cost 49 €/mo. Lite: domino revenue 0, Diamond cost 0.
 */

import { cardinSeasonLaw } from "@/lib/season-law"
import {
  projectFamilyImpact,
  type ProjectionPresetOverrideMap,
} from "@/lib/projection-engine"

import type { MonthCandle, ParcoursProjectionResult, SeasonProjectionLayers } from "@/lib/cardin-projection-types"

export { type ProjectionPresetOverrideMap } from "@/lib/projection-engine"

export const DEFAULT_REWARD_COST_RATE = 0.12
export const DEFAULT_DIAMOND_COST_MONTH_FULL = 49
export const DEFAULT_SYSTEM_FEE_MONTH = 0

const FAMILY_EFFECTS = {
  base: { primaryEffect: "Recuperation", secondaryEffect: "Base", scenarioRole: "base" },
  freq: { primaryEffect: "Frequence", secondaryEffect: "Relance", scenarioRole: "frequency" },
} as const

const DOMINO_ACTIVITY_COEFF: Record<string, number> = {
  cafe: 1.35,
  restaurant: 1.45,
  boulangerie: 1.3,
  coiffeur: 1.25,
  "institut-beaute": 1.2,
  boutique: 1.28,
}

function dominoCoefficient(merchantType: string): number {
  const id = merchantType.toLowerCase()
  return DOMINO_ACTIVITY_COEFF[id] ?? 1.25
}

function dominoSeasonEuro(params: {
  merchantType: string
  monthlyClients: number
  activationRate: number
  avgTicket: number
  seasonMonths: 3 | 6
  summitMultiplier: number
}): { dominoSeason: number; dominoNewClients: number; activeCardholders: number } {
  const { merchantType, monthlyClients, activationRate, avgTicket, seasonMonths, summitMultiplier } = params
  const activeCardholders = Math.round(monthlyClients * activationRate)
  const coeff = dominoCoefficient(merchantType)

  const reachStep5Rate =
    0.22 * coeff * (cardinSeasonLaw.dominoStartStep / cardinSeasonLaw.stepCount)
  const inviteConversion = 0.52
  const branches = Math.min(cardinSeasonLaw.directDominoBranches, 2)

  const eligible = activeCardholders * reachStep5Rate
  const dominoNewClients = Math.round(eligible * inviteConversion * branches * 0.5)

  const visitHorizon = Math.max(
    2,
    Math.ceil(seasonMonths * (1 - cardinSeasonLaw.dominoStartStep / cardinSeasonLaw.stepCount)),
  )

  const dominoSeason = Math.round(
    dominoNewClients * avgTicket * visitHorizon * summitMultiplier * 1.08,
  )

  return { dominoSeason, dominoNewClients, activeCardholders }
}

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

/**
 * Builds full parcours projection result: gross layers + net headline fields.
 */
export function computeCardinFinancialProjection(
  input: CardinProjectionInput,
  overrides?: ProjectionPresetOverrideMap,
): ParcoursProjectionResult {
  const {
    merchantType,
    monthlyClients,
    avgTicket,
    inactivePercent,
    baseRecoveryPercent,
    seasonMonths,
    summitMultiplier,
    lite = false,
    rewardCostRate = DEFAULT_REWARD_COST_RATE,
    diamondCostMonthFull = DEFAULT_DIAMOND_COST_MONTH_FULL,
    systemFeeMonth = DEFAULT_SYSTEM_FEE_MONTH,
  } = input

  const base = projectFamilyImpact(
    {
      merchantType,
      projectionFamily: "base_return",
      monthlyClients,
      avgTicket,
      inactivePercent,
      baseRecoveryPercent,
      ...FAMILY_EFFECTS.base,
    },
    overrides,
  )

  const freq = projectFamilyImpact(
    {
      merchantType,
      projectionFamily: "frequency_push",
      monthlyClients,
      avgTicket,
      inactivePercent,
      baseRecoveryPercent,
      ...FAMILY_EFFECTS.freq,
    },
    overrides,
  )

  const monthlyBase = base.monthlyRevenue
  const monthlyFreqUplift = Math.max(0, freq.monthlyRevenue - base.monthlyRevenue)

  const recoveryMonthlyGross = monthlyBase * summitMultiplier
  const frequencyMonthlyGross = monthlyFreqUplift * summitMultiplier

  const dominoBlock = dominoSeasonEuro({
    merchantType,
    monthlyClients,
    activationRate: 0.38,
    avgTicket,
    seasonMonths,
    summitMultiplier,
  })

  const dominoSeasonGross = lite ? 0 : dominoBlock.dominoSeason
  const dominoNewClients = lite ? 0 : dominoBlock.dominoNewClients
  const activeCardholders = dominoBlock.activeCardholders

  const dominoMonthlyGross = seasonMonths > 0 ? dominoSeasonGross / seasonMonths : 0

  const grossMonth = recoveryMonthlyGross + frequencyMonthlyGross + dominoMonthlyGross
  const rewardCostMonth = grossMonth * rewardCostRate
  const diamondCostMonth = lite ? 0 : diamondCostMonthFull
  const netCardinMonth = Math.max(0, grossMonth - rewardCostMonth - diamondCostMonth - systemFeeMonth)
  const netCardinSeason = Math.round(netCardinMonth * seasonMonths)

  const recoverySeasonGross = Math.round(recoveryMonthlyGross * seasonMonths)
  const frequencySeasonGross = Math.round(frequencyMonthlyGross * seasonMonths)

  const layers: SeasonProjectionLayers = {
    recovery: recoverySeasonGross,
    frequency: frequencySeasonGross,
    domino: dominoSeasonGross,
    total: recoverySeasonGross + frequencySeasonGross + dominoSeasonGross,
    activeCardholders,
    dominoNewClients,
  }

  const monthlyAverage = Math.round(netCardinMonth)
  const monthlyLow = Math.round(netCardinMonth * 0.88)
  const monthlyHigh = Math.round(netCardinMonth * 1.12)

  const cumulativeByMonth: number[] = []
  const candles: MonthCandle[] = []
  let prev = 0
  const totalNetSeason = netCardinSeason
  for (let m = 1; m <= seasonMonths; m++) {
    const t = m / seasonMonths
    const curved = totalNetSeason * Math.pow(t, 1.12)
    cumulativeByMonth.push(Math.round(curved))
    const inc = curved - prev
    const wobble = 0.04
    const o = inc * (1 - wobble)
    const c = inc * (1 + wobble)
    const high = Math.max(o, c) * 1.025
    const low = Math.min(o, c) * 0.975
    candles.push({
      month: m,
      open: Math.round(o),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(c),
    })
    prev = curved
  }

  return {
    layers,
    grossMonth,
    rewardCostMonth,
    diamondCostMonth,
    systemFeeMonth: systemFeeMonth,
    netCardinMonth: Math.round(netCardinMonth),
    netCardinSeason,
    monthlyReturns: base.monthlyReturns,
    recoveredClientsMonth: Math.round(base.recoveredClients),
    confidenceLabel: base.confidenceLabel,
    monthlyAverage,
    monthlyLow,
    monthlyHigh,
    cumulativeByMonth,
    candles,
    merchantType,
  }
}
