import { formatEuro } from "@/lib/number-format"
import type { MerchantProfileId } from "@/lib/merchant-profile"

export type CardinProtocolState =
  | "COLD"
  | "HEALTHY"
  | "HOT"
  | "OVER_GENEROUS"
  | "OVER_BUDGET"
  | "DIAMOND_SATURATED"
  | "SUSPICIOUS"

export type CardinProtocolFlags = {
  enabled: boolean
  diamondTokensEnabled: boolean
  adaptiveHooksEnabled: boolean
}

export type CardinProtocolConfig = {
  aov: number
  grossMarginRate: number
  seasonBudget: number
  seasonLengthMonths: number
  baseVisitsPerMonth: number
  deltaVisitsPerMonth: number
  attributionWindowDays: number
  rewardCosts: {
    midpoint: number
    summit: number
    propagation: number
  }
  rewardRedemption: {
    midpoint: number
    summit: number
  }
  incrementality: {
    direct: number
    referral: number
  }
  funnel: {
    activationRate: number
    midpointRate: number
    summitRate: number
    diamondRate: number
    conversionRate: number
    maxInvites: number
    referredIncrementalVisits: number
  }
  basketUplift: {
    engagedVisits: number
    deltaAov: number
  }
  timeControl: {
    peakFactor: number
  }
  minGrossProfit: number
  maxDiamondRatio: number
  diamond: {
    tokenCycleDays: number
    tokenCost: number
    tokenRedemptionRate: number
    maxTokenCycles: number
    budget: number
  }
}

export type CardinProtocolRuntimeMetrics = {
  activeUsers: number
  rawScans?: number | null
  midpointUsers?: number | null
  summitUsers?: number | null
  diamondUsers?: number | null
  referralsConverted?: number | null
  engagedVisits?: number | null
  progressScore?: number | null
  costScore?: number | null
  propagationScore?: number | null
  engagementRate?: number | null
  integrityScore?: number | null
  actualRewardCostSeason?: number | null
  actualRewardCostWeek?: number | null
  actualRewardCostDay?: number | null
  actualDiamondCostSeason?: number | null
  actualPropagationCostSeason?: number | null
  inheritedDiamondUsers?: number | null
}

export type NormalizedCardinProtocolRuntimeMetrics = {
  activeUsers: number
  rawScans: number
  midpointUsers: number
  summitUsers: number
  diamondUsers: number
  referralsConverted: number
  engagedVisits: number
  progressScore: number
  costScore: number
  propagationScore: number
  engagementRate: number
  integrityScore: number
  actualRewardCostSeason: number
  actualRewardCostWeek: number
  actualRewardCostDay: number
  actualDiamondCostSeason: number
  actualPropagationCostSeason: number
  inheritedDiamondUsers: number
}

export type CardinProtocolGuardrail = {
  key:
    | "season_budget"
    | "weekly_budget"
    | "daily_budget"
    | "per_user_safety"
    | "diamond_user_safety"
    | "diamond_budget"
    | "diamond_saturation"
    | "diamond_rights"
  pass: boolean
  current: number
  limit: number
  unit: "eur" | "ratio" | "count"
  message: string
  blocksRewards: boolean
}

export type CardinProtocolSnapshot = {
  flags: CardinProtocolFlags
  config: CardinProtocolConfig
  runtime: NormalizedCardinProtocolRuntimeMetrics
  projected: {
    GPV: number
    IV_self: number
    GP_self: number
    RC_self: number
    GP_direct: number
    RC_direct: number
    GP_uplift: number
    GP_prop: number
    RC_prop: number
    RC_diamond_season: number
    GP_total: number
    RC_total: number
    sigma_self: number
    sigma_season: number
    OUMEE_basic: number
    OUMEE_diamond: number
    GP_prop_user: number
    EV: number
    FE: number
    DP: number
    DGPY: number
    profitIncremental: number
    revenueIncremental: number
    cyclesInSeason: number
    N_scan: number
    N: number
    N_mid: number
    N_sum: number
    N_diamond: number
    N_ref: number
    B_week: number
    B_day: number
    daily_budget_limit: number
  }
  actual: {
    rewardCostSeason: number
    rewardCostWeek: number
    rewardCostDay: number
    diamondCostSeason: number
    propagationCostSeason: number
    seasonExposure: number
  }
  guardrails: CardinProtocolGuardrail[]
  state: CardinProtocolState
  rewardsPaused: boolean
  diamondPaused: boolean
  narrative: {
    seasonObjective: string
    marginLine: string
    diamondLine: string
    growthLine: string
  }
  scores: {
    progress: number
    cost: number
    propagation: number
    engagement: number
    integrity: number
    fieldEnergy: number
  }
}

type ProtocolPreset = Omit<CardinProtocolConfig, "seasonLengthMonths"> & { seasonLengthMonths?: number }

type PartialProtocolConfig = Partial<{
  aov: number
  grossMarginRate: number
  seasonBudget: number
  seasonLengthMonths: number
  baseVisitsPerMonth: number
  deltaVisitsPerMonth: number
  attributionWindowDays: number
  rewardCosts: Partial<CardinProtocolConfig["rewardCosts"]>
  rewardRedemption: Partial<CardinProtocolConfig["rewardRedemption"]>
  incrementality: Partial<CardinProtocolConfig["incrementality"]>
  funnel: Partial<CardinProtocolConfig["funnel"]>
  basketUplift: Partial<CardinProtocolConfig["basketUplift"]>
  timeControl: Partial<CardinProtocolConfig["timeControl"]>
  minGrossProfit: number
  maxDiamondRatio: number
  diamond: Partial<CardinProtocolConfig["diamond"]>
}>

const DEFAULT_FLAGS: CardinProtocolFlags = {
  enabled: true,
  diamondTokensEnabled: true,
  adaptiveHooksEnabled: false,
}

const PRESETS: Record<MerchantProfileId, ProtocolPreset> = {
  generic: {
    aov: 12,
    grossMarginRate: 0.68,
    seasonBudget: 280,
    seasonLengthMonths: 3,
    baseVisitsPerMonth: 2.5,
    deltaVisitsPerMonth: 0.8,
    attributionWindowDays: 7,
    rewardCosts: { midpoint: 0.8, summit: 2.5, propagation: 0 },
    rewardRedemption: { midpoint: 0.3, summit: 0.15 },
    incrementality: { direct: 0.62, referral: 0.58 },
    funnel: {
      activationRate: 0.55,
      midpointRate: 0.3,
      summitRate: 0.14,
      diamondRate: 0.06,
      conversionRate: 0.18,
      maxInvites: 2,
      referredIncrementalVisits: 2.5,
    },
    basketUplift: { engagedVisits: 0, deltaAov: 0 },
    timeControl: { peakFactor: 1.7 },
    minGrossProfit: 10,
    maxDiamondRatio: 0.07,
    diamond: {
      tokenCycleDays: 30,
      tokenCost: 3,
      tokenRedemptionRate: 0.5,
      maxTokenCycles: 12,
      budget: 110,
    },
  },
  cafe: {
    aov: 6,
    grossMarginRate: 0.75,
    seasonBudget: 250,
    seasonLengthMonths: 3,
    baseVisitsPerMonth: 4,
    deltaVisitsPerMonth: 1.5,
    attributionWindowDays: 7,
    rewardCosts: { midpoint: 0.4, summit: 1.2, propagation: 0 },
    rewardRedemption: { midpoint: 0.3, summit: 0.15 },
    incrementality: { direct: 0.7, referral: 0.6 },
    funnel: {
      activationRate: 0.58,
      midpointRate: 0.3,
      summitRate: 0.15,
      diamondRate: 0.06,
      conversionRate: 0.2,
      maxInvites: 2,
      referredIncrementalVisits: 3,
    },
    basketUplift: { engagedVisits: 0, deltaAov: 0 },
    timeControl: { peakFactor: 1.7 },
    minGrossProfit: 8,
    maxDiamondRatio: 0.06,
    diamond: {
      tokenCycleDays: 30,
      tokenCost: 2,
      tokenRedemptionRate: 0.5,
      maxTokenCycles: 12,
      budget: 100,
    },
  },
  boulangerie: {
    aov: 8,
    grossMarginRate: 0.72,
    seasonBudget: 260,
    seasonLengthMonths: 3,
    baseVisitsPerMonth: 4.5,
    deltaVisitsPerMonth: 1.1,
    attributionWindowDays: 7,
    rewardCosts: { midpoint: 0.5, summit: 1.5, propagation: 0 },
    rewardRedemption: { midpoint: 0.32, summit: 0.16 },
    incrementality: { direct: 0.68, referral: 0.58 },
    funnel: {
      activationRate: 0.56,
      midpointRate: 0.31,
      summitRate: 0.15,
      diamondRate: 0.06,
      conversionRate: 0.18,
      maxInvites: 2,
      referredIncrementalVisits: 2.6,
    },
    basketUplift: { engagedVisits: 0, deltaAov: 0 },
    timeControl: { peakFactor: 1.7 },
    minGrossProfit: 10,
    maxDiamondRatio: 0.06,
    diamond: {
      tokenCycleDays: 30,
      tokenCost: 2.5,
      tokenRedemptionRate: 0.48,
      maxTokenCycles: 12,
      budget: 104,
    },
  },
  caviste: {
    aov: 32,
    grossMarginRate: 0.58,
    seasonBudget: 360,
    seasonLengthMonths: 3,
    baseVisitsPerMonth: 1.1,
    deltaVisitsPerMonth: 0.65,
    attributionWindowDays: 18,
    rewardCosts: { midpoint: 2.2, summit: 5.5, propagation: 0 },
    rewardRedemption: { midpoint: 0.28, summit: 0.14 },
    incrementality: { direct: 0.6, referral: 0.58 },
    funnel: {
      activationRate: 0.48,
      midpointRate: 0.28,
      summitRate: 0.14,
      diamondRate: 0.07,
      conversionRate: 0.18,
      maxInvites: 2,
      referredIncrementalVisits: 1.8,
    },
    basketUplift: { engagedVisits: 0, deltaAov: 0 },
    timeControl: { peakFactor: 1.75 },
    minGrossProfit: 18,
    maxDiamondRatio: 0.07,
    diamond: {
      tokenCycleDays: 30,
      tokenCost: 4.8,
      tokenRedemptionRate: 0.45,
      maxTokenCycles: 12,
      budget: 150,
    },
  },
  salon: {
    aov: 45,
    grossMarginRate: 0.62,
    seasonBudget: 420,
    seasonLengthMonths: 3,
    baseVisitsPerMonth: 1.2,
    deltaVisitsPerMonth: 0.8,
    attributionWindowDays: 14,
    rewardCosts: { midpoint: 2.5, summit: 6, propagation: 0 },
    rewardRedemption: { midpoint: 0.3, summit: 0.14 },
    incrementality: { direct: 0.58, referral: 0.55 },
    funnel: {
      activationRate: 0.5,
      midpointRate: 0.28,
      summitRate: 0.14,
      diamondRate: 0.07,
      conversionRate: 0.18,
      maxInvites: 2,
      referredIncrementalVisits: 2.2,
    },
    basketUplift: { engagedVisits: 0, deltaAov: 0 },
    timeControl: { peakFactor: 1.8 },
    minGrossProfit: 22,
    maxDiamondRatio: 0.08,
    diamond: {
      tokenCycleDays: 30,
      tokenCost: 4.5,
      tokenRedemptionRate: 0.5,
      maxTokenCycles: 12,
      budget: 150,
    },
  },
  boutique: {
    aov: 180,
    grossMarginRate: 0.6,
    seasonBudget: 500,
    seasonLengthMonths: 3,
    baseVisitsPerMonth: 0.5,
    deltaVisitsPerMonth: 0.3,
    attributionWindowDays: 21,
    rewardCosts: { midpoint: 5, summit: 12, propagation: 0 },
    rewardRedemption: { midpoint: 0.25, summit: 0.12 },
    incrementality: { direct: 0.5, referral: 0.5 },
    funnel: {
      activationRate: 0.45,
      midpointRate: 0.25,
      summitRate: 0.12,
      diamondRate: 0.12,
      conversionRate: 0.2,
      maxInvites: 2,
      referredIncrementalVisits: 1,
    },
    basketUplift: { engagedVisits: 0, deltaAov: 0 },
    timeControl: { peakFactor: 1.8 },
    minGrossProfit: 40,
    maxDiamondRatio: 0.12,
    diamond: {
      tokenCycleDays: 30,
      tokenCost: 8,
      tokenRedemptionRate: 0.45,
      maxTokenCycles: 12,
      budget: 200,
    },
  },
  restaurant: {
    aov: 35,
    grossMarginRate: 0.65,
    seasonBudget: 400,
    seasonLengthMonths: 3,
    baseVisitsPerMonth: 1.5,
    deltaVisitsPerMonth: 0.7,
    attributionWindowDays: 14,
    rewardCosts: { midpoint: 2.5, summit: 5, propagation: 0 },
    rewardRedemption: { midpoint: 0.3, summit: 0.15 },
    incrementality: { direct: 0.6, referral: 0.55 },
    funnel: {
      activationRate: 0.5,
      midpointRate: 0.3,
      summitRate: 0.15,
      diamondRate: 0.08,
      conversionRate: 0.2,
      maxInvites: 2,
      referredIncrementalVisits: 2,
    },
    basketUplift: { engagedVisits: 0, deltaAov: 0 },
    timeControl: { peakFactor: 1.8 },
    minGrossProfit: 20,
    maxDiamondRatio: 0.08,
    diamond: {
      tokenCycleDays: 30,
      tokenCost: 5,
      tokenRedemptionRate: 0.5,
      maxTokenCycles: 12,
      budget: 160,
    },
  },
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function safeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

function clampUnit(value: unknown, fallback: number): number {
  return clamp(safeNumber(value, fallback), 0, 1)
}

function sanitizeNested<T extends Record<string, number>>(value: unknown, defaults: T, strategy: "unit" | "number" = "number"): T {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {}
  return Object.fromEntries(
    Object.entries(defaults).map(([key, defaultValue]) => {
      const next = raw[key]
      const baseValue = safeNumber(defaultValue, 0)
      const normalized = strategy === "unit" ? clampUnit(next, baseValue) : safeNumber(next, baseValue)
      return [key, normalized]
    }),
  ) as T
}

export function getProtocolPreset(profileId: MerchantProfileId): CardinProtocolConfig {
  return normalizeProtocolConfig(undefined, profileId)
}

export function normalizeProtocolFlags(raw: unknown): CardinProtocolFlags {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  return {
    enabled: typeof source.enabled === "boolean" ? source.enabled : DEFAULT_FLAGS.enabled,
    diamondTokensEnabled:
      typeof source.diamondTokensEnabled === "boolean"
        ? source.diamondTokensEnabled
        : typeof source.diamond_tokens_enabled === "boolean"
          ? Boolean(source.diamond_tokens_enabled)
          : DEFAULT_FLAGS.diamondTokensEnabled,
    adaptiveHooksEnabled:
      typeof source.adaptiveHooksEnabled === "boolean"
        ? source.adaptiveHooksEnabled
        : typeof source.adaptive_hooks_enabled === "boolean"
          ? Boolean(source.adaptive_hooks_enabled)
          : DEFAULT_FLAGS.adaptiveHooksEnabled,
  }
}

export function normalizeProtocolConfig(raw: unknown, profileId: MerchantProfileId, seasonLengthMonths?: number | null): CardinProtocolConfig {
  const preset = PRESETS[profileId] ?? PRESETS.generic
  const source = raw && typeof raw === "object" ? (raw as PartialProtocolConfig) : {}

  const seasonLength = Math.max(1, Math.round(safeNumber(seasonLengthMonths ?? source.seasonLengthMonths, preset.seasonLengthMonths ?? 3)))

  const config: CardinProtocolConfig = {
    aov: safeNumber(source.aov, preset.aov),
    grossMarginRate: clampUnit(source.grossMarginRate, preset.grossMarginRate),
    seasonBudget: safeNumber(source.seasonBudget, preset.seasonBudget),
    seasonLengthMonths: seasonLength,
    baseVisitsPerMonth: safeNumber(source.baseVisitsPerMonth, preset.baseVisitsPerMonth),
    deltaVisitsPerMonth: safeNumber(source.deltaVisitsPerMonth, preset.deltaVisitsPerMonth),
    attributionWindowDays: Math.max(1, Math.round(safeNumber(source.attributionWindowDays, preset.attributionWindowDays))),
    rewardCosts: sanitizeNested(source.rewardCosts, preset.rewardCosts),
    rewardRedemption: sanitizeNested(source.rewardRedemption, preset.rewardRedemption, "unit"),
    incrementality: sanitizeNested(source.incrementality, preset.incrementality, "unit"),
    funnel: {
      activationRate: clampUnit(source.funnel?.activationRate, preset.funnel.activationRate),
      midpointRate: clampUnit(source.funnel?.midpointRate, preset.funnel.midpointRate),
      summitRate: clampUnit(source.funnel?.summitRate, preset.funnel.summitRate),
      diamondRate: clampUnit(source.funnel?.diamondRate, preset.funnel.diamondRate),
      conversionRate: clampUnit(source.funnel?.conversionRate, preset.funnel.conversionRate),
      maxInvites: Math.max(0, Math.round(safeNumber(source.funnel?.maxInvites, preset.funnel.maxInvites))),
      referredIncrementalVisits: safeNumber(source.funnel?.referredIncrementalVisits, preset.funnel.referredIncrementalVisits),
    },
    basketUplift: sanitizeNested(source.basketUplift, preset.basketUplift),
    timeControl: {
      peakFactor: Math.max(1, safeNumber(source.timeControl?.peakFactor, preset.timeControl.peakFactor)),
    },
    minGrossProfit: safeNumber(source.minGrossProfit, preset.minGrossProfit),
    maxDiamondRatio: clampUnit(source.maxDiamondRatio, preset.maxDiamondRatio),
    diamond: {
      tokenCycleDays: Math.max(1, Math.round(safeNumber(source.diamond?.tokenCycleDays, preset.diamond.tokenCycleDays))),
      tokenCost: safeNumber(source.diamond?.tokenCost, preset.diamond.tokenCost),
      tokenRedemptionRate: clampUnit(source.diamond?.tokenRedemptionRate, preset.diamond.tokenRedemptionRate),
      maxTokenCycles: Math.max(1, Math.round(safeNumber(source.diamond?.maxTokenCycles, preset.diamond.maxTokenCycles))),
      budget: safeNumber(source.diamond?.budget, preset.diamond.budget),
    },
  }

  if (config.diamond.budget > config.seasonBudget * 0.4) {
    config.diamond.budget = roundCurrency(config.seasonBudget * 0.4)
  }

  return config
}

function normalizeRuntimeMetrics(input: CardinProtocolRuntimeMetrics): NormalizedCardinProtocolRuntimeMetrics {
  const activeUsers = Math.max(0, Math.round(safeNumber(input.activeUsers, 0)))
  return {
    activeUsers,
    rawScans: Math.max(activeUsers, safeNumber(input.rawScans, activeUsers)),
    midpointUsers: Math.max(0, Math.round(safeNumber(input.midpointUsers, 0))),
    summitUsers: Math.max(0, Math.round(safeNumber(input.summitUsers, 0))),
    diamondUsers: Math.max(0, Math.round(safeNumber(input.diamondUsers, 0))),
    referralsConverted: Math.max(0, Math.round(safeNumber(input.referralsConverted, 0))),
    engagedVisits: Math.max(0, Math.round(safeNumber(input.engagedVisits, 0))),
    progressScore: clamp(safeNumber(input.progressScore, 0), 0, 2),
    costScore: clamp(safeNumber(input.costScore, 0), 0, 3),
    propagationScore: clamp(safeNumber(input.propagationScore, 0), 0, 2),
    engagementRate: clamp(safeNumber(input.engagementRate, 0), 0, 2),
    integrityScore: clamp(safeNumber(input.integrityScore, 0), 0, 2),
    actualRewardCostSeason: Math.max(0, safeNumber(input.actualRewardCostSeason, 0)),
    actualRewardCostWeek: Math.max(0, safeNumber(input.actualRewardCostWeek, 0)),
    actualRewardCostDay: Math.max(0, safeNumber(input.actualRewardCostDay, 0)),
    actualDiamondCostSeason: Math.max(0, safeNumber(input.actualDiamondCostSeason, 0)),
    actualPropagationCostSeason: Math.max(0, safeNumber(input.actualPropagationCostSeason, 0)),
    inheritedDiamondUsers: Math.max(0, Math.round(safeNumber(input.inheritedDiamondUsers, 0))),
  }
}

function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0
  }
  return numerator / denominator
}

export function computeProtocolSnapshot(
  config: CardinProtocolConfig,
  input: CardinProtocolRuntimeMetrics,
  flags: CardinProtocolFlags = DEFAULT_FLAGS,
  profileId: MerchantProfileId = "generic",
): CardinProtocolSnapshot {
  const runtime = normalizeRuntimeMetrics(input)
  const GPV = roundCurrency(config.aov * config.grossMarginRate)
  const IV_self = roundCurrency(config.deltaVisitsPerMonth * config.seasonLengthMonths)
  const GP_self = roundCurrency(IV_self * GPV * config.incrementality.direct)
  const RC_self = roundCurrency(
    config.rewardRedemption.midpoint * config.rewardCosts.midpoint + config.rewardRedemption.summit * config.rewardCosts.summit,
  )

  const projectedActivation = Math.round(runtime.rawScans * config.funnel.activationRate)
  const N = Math.max(runtime.activeUsers, projectedActivation)
  const N_scan = Math.max(runtime.rawScans, Math.round(safeDivide(N, config.funnel.activationRate || 1)))
  const N_mid = runtime.midpointUsers > 0 ? runtime.midpointUsers : Math.round(N * config.funnel.midpointRate)
  const N_sum = runtime.summitUsers > 0 ? runtime.summitUsers : Math.round(N * config.funnel.summitRate)
  const N_diamond = runtime.diamondUsers > 0 ? runtime.diamondUsers : Math.round(N * config.funnel.diamondRate)
  const N_ref = runtime.referralsConverted > 0 ? runtime.referralsConverted : Math.round(N_diamond * config.funnel.maxInvites * config.funnel.conversionRate)

  const GP_direct = roundCurrency(N * GP_self)
  const RC_direct = roundCurrency(
    N_mid * config.rewardRedemption.midpoint * config.rewardCosts.midpoint +
      N_sum * config.rewardRedemption.summit * config.rewardCosts.summit,
  )
  const GP_uplift = roundCurrency(N * config.basketUplift.engagedVisits * config.basketUplift.deltaAov * config.grossMarginRate)
  const GP_prop = roundCurrency(N_ref * config.funnel.referredIncrementalVisits * GPV * config.incrementality.referral)
  const RC_prop = roundCurrency(N_ref * config.rewardCosts.propagation)
  const cyclesInSeason = Math.max(1, Math.floor((config.seasonLengthMonths * 30) / config.diamond.tokenCycleDays))
  const RC_diamond_season = roundCurrency(N_diamond * config.diamond.tokenRedemptionRate * config.diamond.tokenCost * cyclesInSeason)
  const GP_total = roundCurrency(GP_direct + GP_uplift + GP_prop)
  const RC_total = roundCurrency(RC_direct + RC_prop + RC_diamond_season)
  const sigma_self = roundCurrency(safeDivide(GP_self, RC_self))
  const sigma_season = roundCurrency(safeDivide(GP_total, RC_total))
  const GP_prop_user = roundCurrency(
    config.funnel.maxInvites *
      config.funnel.conversionRate *
      config.funnel.referredIncrementalVisits *
      GPV *
      config.incrementality.referral,
  )
  const OUMEE_basic = roundCurrency(RC_self)
  const OUMEE_diamond = roundCurrency(
    RC_self +
      config.diamond.tokenRedemptionRate * config.diamond.tokenCost * cyclesInSeason +
      config.funnel.maxInvites * config.funnel.conversionRate * config.rewardCosts.propagation,
  )
  const revenueIncremental = roundCurrency(
    N * IV_self * config.aov +
      N_ref * config.funnel.referredIncrementalVisits * config.aov +
      N * config.basketUplift.engagedVisits * config.basketUplift.deltaAov,
  )
  const profitIncremental = roundCurrency(revenueIncremental * config.grossMarginRate * config.incrementality.direct - RC_total)
  const EV = roundCurrency(safeDivide(GP_total, config.seasonLengthMonths * Math.max(N, 1)))
  const FE = roundCurrency(0.4 * runtime.progressScore + 0.3 * runtime.propagationScore + 0.3 * runtime.engagementRate)
  const DP = roundCurrency(safeDivide(N_ref, Math.max(N_diamond, 1)))
  const DGPY = roundCurrency(safeDivide(GP_prop, Math.max(N_diamond, 1)))
  const B_week = roundCurrency(config.seasonBudget / (config.seasonLengthMonths * 4))
  const B_day = roundCurrency(config.seasonBudget / (config.seasonLengthMonths * 30))
  const daily_budget_limit = roundCurrency(B_day * config.timeControl.peakFactor)

  const actual = {
    rewardCostSeason: roundCurrency(runtime.actualRewardCostSeason),
    rewardCostWeek: roundCurrency(runtime.actualRewardCostWeek),
    rewardCostDay: roundCurrency(runtime.actualRewardCostDay),
    diamondCostSeason: roundCurrency(runtime.actualDiamondCostSeason),
    propagationCostSeason: roundCurrency(runtime.actualPropagationCostSeason),
    seasonExposure: roundCurrency(runtime.actualRewardCostSeason + runtime.actualDiamondCostSeason + runtime.actualPropagationCostSeason),
  }

  const seasonExposureForBudget = Math.max(RC_total, actual.seasonExposure)
  const diamondExposureForBudget = Math.max(RC_diamond_season, actual.diamondCostSeason)

  const guardrails: CardinProtocolGuardrail[] = [
    {
      key: "season_budget",
      pass: seasonExposureForBudget <= config.seasonBudget,
      current: roundCurrency(seasonExposureForBudget),
      limit: config.seasonBudget,
      unit: "eur",
      message: "Le budget saison reste borne.",
      blocksRewards: true,
    },
    {
      key: "weekly_budget",
      pass: actual.rewardCostWeek <= B_week,
      current: actual.rewardCostWeek,
      limit: B_week,
      unit: "eur",
      message: "Le rail hebdomadaire reste sous controle.",
      blocksRewards: true,
    },
    {
      key: "daily_budget",
      pass: actual.rewardCostDay <= daily_budget_limit,
      current: actual.rewardCostDay,
      limit: daily_budget_limit,
      unit: "eur",
      message: "Le plafond journalier n'est pas depasse.",
      blocksRewards: true,
    },
    {
      key: "per_user_safety",
      pass: RC_self <= GP_self / 3,
      current: RC_self,
      limit: roundCurrency(GP_self / 3),
      unit: "eur",
      message: "Le cout direct reste sous un tiers de la marge directe.",
      blocksRewards: true,
    },
    {
      key: "diamond_user_safety",
      pass: OUMEE_diamond <= (GP_self + GP_prop_user) / 3,
      current: OUMEE_diamond,
      limit: roundCurrency((GP_self + GP_prop_user) / 3),
      unit: "eur",
      message: "L'exposition Diamond par utilisateur reste soutenable.",
      blocksRewards: true,
    },
    {
      key: "diamond_budget",
      pass: diamondExposureForBudget <= config.diamond.budget,
      current: roundCurrency(diamondExposureForBudget),
      limit: config.diamond.budget,
      unit: "eur",
      message: "L'enveloppe Diamond reste bornée.",
      blocksRewards: true,
    },
    {
      key: "diamond_saturation",
      pass: N_diamond <= Math.floor(N * config.maxDiamondRatio),
      current: N_diamond,
      limit: Math.max(0, Math.floor(N * config.maxDiamondRatio)),
      unit: "count",
      message: "La part de clients Diamond reste sous le cap de saturation.",
      blocksRewards: true,
    },
    {
      key: "diamond_rights",
      pass: runtime.inheritedDiamondUsers <= 0,
      current: runtime.inheritedDiamondUsers,
      limit: 0,
      unit: "count",
      message: "Les droits Diamond restent strictement gagnes.",
      blocksRewards: true,
    },
  ]

  let state: CardinProtocolState
  if (runtime.integrityScore > 1) {
    state = "SUSPICIOUS"
  } else if (!guardrails.find((rule) => rule.key === "weekly_budget")?.pass || !guardrails.find((rule) => rule.key === "season_budget")?.pass) {
    state = "OVER_BUDGET"
  } else if (runtime.costScore > 1.2 && runtime.progressScore < 1) {
    state = "OVER_GENEROUS"
  } else if (FE < 0.6 || GP_self < config.minGrossProfit) {
    state = "COLD"
  } else if (!guardrails.find((rule) => rule.key === "diamond_saturation")?.pass) {
    state = "DIAMOND_SATURATED"
  } else if (FE > 1.2) {
    state = "HOT"
  } else {
    state = "HEALTHY"
  }

  const rewardsPaused = guardrails.some((rule) => rule.blocksRewards && !rule.pass)
  const diamondPaused = rewardsPaused || !flags.diamondTokensEnabled

  const seasonTargetLine = getSeasonObjectiveLine(profileId, profitIncremental)
  const marginLine = `Projection de marge saison: ~${formatEuro(profitIncremental)} pour ${formatEuro(RC_total)} de cout reward attendu.`
  const diamondLine = `Diamond reste borne: jusqu'a 1 experience tous les ${config.diamond.tokenCycleDays} jours, si l'activite continue et si le budget le permet.`
  const growthLine = `Croissance controlee: max ${config.funnel.maxInvites} invitations par Diamond, plafond journalier ${formatEuro(daily_budget_limit)}.`

  return {
    flags,
    config,
    runtime,
    projected: {
      GPV,
      IV_self,
      GP_self,
      RC_self,
      GP_direct,
      RC_direct,
      GP_uplift,
      GP_prop,
      RC_prop,
      RC_diamond_season,
      GP_total,
      RC_total,
      sigma_self,
      sigma_season,
      OUMEE_basic,
      OUMEE_diamond,
      GP_prop_user,
      EV,
      FE,
      DP,
      DGPY,
      profitIncremental,
      revenueIncremental,
      cyclesInSeason,
      N_scan,
      N,
      N_mid,
      N_sum,
      N_diamond,
      N_ref,
      B_week,
      B_day,
      daily_budget_limit,
    },
    actual,
    guardrails,
    state,
    rewardsPaused,
    diamondPaused,
    narrative: {
      seasonObjective: seasonTargetLine,
      marginLine,
      diamondLine,
      growthLine,
    },
    scores: {
      progress: runtime.progressScore,
      cost: runtime.costScore,
      propagation: runtime.propagationScore,
      engagement: runtime.engagementRate,
      integrity: runtime.integrityScore,
      fieldEnergy: FE,
    },
  }
}

function getSeasonObjectiveLine(profileId: MerchantProfileId, profitIncremental: number): string {
  const rounded = formatEuro(profitIncremental)
  switch (profileId) {
    case "cafe":
    case "boulangerie":
      return `Objectif de saison: recuperer du rythme sur les heures et jours faibles pour viser ${rounded} de marge additionnelle.`
    case "caviste":
      return `Objectif de saison: remettre la cave dans les retours choisis, les degustations et viser ${rounded} de marge additionnelle.`
    case "restaurant":
      return `Objectif de saison: recranter le retour entre les services et viser ${rounded} de marge additionnelle.`
    case "salon":
      return `Objectif de saison: raccourcir le cycle de visite sans casser la marge, cible ${rounded}.`
    case "boutique":
      return `Objectif de saison: transformer desir et retour choisi en ${rounded} de marge incrementale.`
    case "generic":
    default:
      return `Objectif de saison: garder la marge sous controle tout en visant ${rounded} de marge additionnelle.`
  }
}


/** Maps DB `cardin_world` / template id to protocol preset. Bar shares café economics until a dedicated bar preset exists. */
export function mapMerchantTypeToProtocolProfile(raw: string | null | undefined): MerchantProfileId {
  const value = (raw ?? "").trim().toLowerCase()
  if (value === "cafe") return "cafe"
  if (value === "restaurant") return "restaurant"
  if (value === "bar") return "cafe"
  if (value === "caviste") return "caviste"
  if (value === "boutique") return "boutique"
  if (value === "boulangerie") return "boulangerie"
  if (value === "salon" || value === "beaute" || value === "coiffeur" || value === "institut-beaute") return "salon"
  return "generic"
}

export function getDefaultProtocolFlags(): CardinProtocolFlags {
  return { ...DEFAULT_FLAGS }
}






