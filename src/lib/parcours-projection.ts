/**
 * Parcours / onboarding projection — server-safe, same formulas as SQL-seeded `projection_presets`
 * (see supabase/migrations/002_projection_presets_and_launch_intents.sql).
 *
 * Layers:
 * - Recovery: `projectFamilyImpact` base_return (matches `starting_loop` weights)
 * - Frequency: incremental uplift vs base using `frequency_push` → `short_challenge` weights from DB/code
 * - Domino: propagation from `cardinSeasonLaw` (step 5, 2 branches) × panier moyen, scaled by activity
 */

import { cardinSeasonLaw } from "@/lib/season-law"
import {
  projectFamilyImpact,
  type ProjectionPresetOverrideMap,
} from "@/lib/projection-engine"
export type ParcoursDemoSlice = {
  merchantType: string
  monthlyClients: number
  avgTicket: number
  inactivePercent: number
  /** Template recovery % (same as calculator_recovery_rate * 100) */
  recoveryPercent: number
  seasonMonths: 3 | 6
}

export type SeasonProjectionLayers = {
  recovery: number
  frequency: number
  domino: number
  total: number
  activeCardholders: number
  dominoNewClients: number
}

export type MonthCandle = {
  month: number
  open: number
  high: number
  low: number
  close: number
}

export type ParcoursProjectionResult = {
  layers: SeasonProjectionLayers
  /** Moyenne mensuelle équivalente (total saison / mois) */
  monthlyAverage: number
  /** Fourchette prudente → optimiste sur la moyenne mensuelle */
  monthlyLow: number
  monthlyHigh: number
  cumulativeByMonth: number[]
  candles: MonthCandle[]
  merchantType: string
}

const FAMILY_EFFECTS = {
  base: { primaryEffect: "Recuperation", secondaryEffect: "Base", scenarioRole: "base" },
  freq: { primaryEffect: "Frequence", secondaryEffect: "Relance", scenarioRole: "frequency" },
} as const

/** Domino reach scales with commerce type (panier + rythme). Tuned so totals align with landing orders of magnitude. */
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

function recoveredPool(
  monthlyClients: number,
  inactivePercent: number,
  baseRecoveryPercent: number,
) {
  const inactiveRate = inactivePercent / 100
  const recoveryRate = baseRecoveryPercent / 100
  return monthlyClients * inactiveRate * recoveryRate
}

/**
 * Domino: eligible porteurs × branches × conversion × visites restantes × panier.
 * Grounded in season-law: dominoStartStep 5/8, directDominoBranches 2.
 */
function dominoSeasonEuro(params: {
  merchantType: string
  monthlyClients: number
  activationRate: number
  avgTicket: number
  seasonMonths: 3 | 6
  summitMultiplier: number
}): { domino: number; dominoNewClients: number; activeCardholders: number } {
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

  const domino = Math.round(
    dominoNewClients * avgTicket * visitHorizon * summitMultiplier * 1.08,
  )

  return { domino, dominoNewClients, activeCardholders }
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
    /** Cardin Lite: recovery + frequency only — no Domino propagation layer. */
    lite?: boolean
  },
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

  const recovery = Math.round(monthlyBase * summitMultiplier * seasonMonths)
  const frequency = Math.round(monthlyFreqUplift * summitMultiplier * seasonMonths)

  const dominoBlock = dominoSeasonEuro({
    merchantType,
    monthlyClients,
    activationRate: 0.38,
    avgTicket,
    seasonMonths,
    summitMultiplier,
  })

  const domino = lite ? 0 : dominoBlock.domino
  const dominoNewClients = lite ? 0 : dominoBlock.dominoNewClients
  const activeCardholders = dominoBlock.activeCardholders

  const total = recovery + frequency + domino

  const monthlyAverage = Math.round(total / seasonMonths)
  const monthlyLow = Math.round(monthlyAverage * 0.88)
  const monthlyHigh = Math.round(monthlyAverage * 1.12)

  const cumulativeByMonth: number[] = []
  const candles: MonthCandle[] = []
  let prev = 0
  for (let m = 1; m <= seasonMonths; m++) {
    const t = m / seasonMonths
    const curved = total * Math.pow(t, 1.12)
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
    layers: {
      recovery,
      frequency,
      domino,
      total,
      activeCardholders,
      dominoNewClients,
    },
    monthlyAverage,
    monthlyLow,
    monthlyHigh,
    cumulativeByMonth,
    candles,
    merchantType,
  }
}

/** Pool check helper (exposed for tests / transparency) */
export function parcoursRecoveredPoolEuro(
  monthlyClients: number,
  inactivePercent: number,
  baseRecoveryPercent: number,
  avgTicket: number,
) {
  return recoveredPool(monthlyClients, inactivePercent, baseRecoveryPercent) * avgTicket
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
