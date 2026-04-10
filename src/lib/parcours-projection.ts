/**
 * Parcours / onboarding projection — delegates to `computeCardinFinancialProjection`
 * (see cardin-projection-engine.ts). DB overrides pass through to projectFamilyImpact.
 */

import { computeCardinFinancialProjection } from "@/lib/cardin-projection-engine"
import type {
  MonthCandle,
  ParcoursProjectionResult,
  SeasonProjectionLayers,
} from "@/lib/cardin-projection-types"
import type { ProjectionPresetOverrideMap } from "@/lib/projection-engine"

export type { MonthCandle, ParcoursProjectionResult, SeasonProjectionLayers } from "@/lib/cardin-projection-types"

export type ParcoursDemoSlice = {
  merchantType: string
  monthlyClients: number
  avgTicket: number
  inactivePercent: number
  /** Template recovery % (same as calculator_recovery_rate * 100) */
  recoveryPercent: number
  seasonMonths: 3 | 6
}

export function buildParcoursProjection(
  input: {
    merchantType: string
    monthlyClients: number
    avgTicket: number
    inactivePercent: number
    baseRecoveryPercent: number
    seasonMonths: 3 | 6
    summitMultiplier: number
    lite?: boolean
  },
  overrides?: ProjectionPresetOverrideMap,
): ParcoursProjectionResult {
  return computeCardinFinancialProjection(
    {
      merchantType: input.merchantType,
      monthlyClients: input.monthlyClients,
      avgTicket: input.avgTicket,
      inactivePercent: input.inactivePercent,
      baseRecoveryPercent: input.baseRecoveryPercent,
      seasonMonths: input.seasonMonths,
      summitMultiplier: input.summitMultiplier,
      lite: input.lite === true,
    },
    overrides,
  )
}

/** Pool check helper (exposed for tests / transparency) */
export function parcoursRecoveredPoolEuro(
  monthlyClients: number,
  inactivePercent: number,
  baseRecoveryPercent: number,
  avgTicket: number,
) {
  const inactiveRate = inactivePercent / 100
  const recoveryRate = baseRecoveryPercent / 100
  return monthlyClients * inactiveRate * recoveryRate * avgTicket
}

export function computeSeasonProjection(
  demo: ParcoursDemoSlice,
  summitMultiplier: number,
  overrides?: ProjectionPresetOverrideMap,
  options?: { lite?: boolean },
): SeasonProjectionLayers {
  return buildParcoursProjection(
    {
      merchantType: demo.merchantType,
      monthlyClients: demo.monthlyClients,
      avgTicket: demo.avgTicket,
      inactivePercent: demo.inactivePercent,
      baseRecoveryPercent: demo.recoveryPercent,
      seasonMonths: demo.seasonMonths,
      summitMultiplier,
      lite: options?.lite === true,
    },
    overrides,
  ).layers
}

export function computeParcoursProjectionFull(
  demo: ParcoursDemoSlice,
  summitMultiplier: number,
  overrides?: ProjectionPresetOverrideMap,
  options?: { lite?: boolean },
): ParcoursProjectionResult {
  return buildParcoursProjection(
    {
      merchantType: demo.merchantType,
      monthlyClients: demo.monthlyClients,
      avgTicket: demo.avgTicket,
      inactivePercent: demo.inactivePercent,
      baseRecoveryPercent: demo.recoveryPercent,
      seasonMonths: demo.seasonMonths,
      summitMultiplier,
      lite: options?.lite === true,
    },
    overrides,
  )
}
