import type { SupabaseClient } from "@supabase/supabase-js"

import { cardinSeasonLaw } from "@/lib/season-law"
import {
  ENGINE_VERSION,
  calculateDominoState,
  calculateScoreComponents,
  calculateTension,
  calculateTotalScore,
  getVisualState,
} from "@/lib/cardin/recalculate-card-state"
import { getWeightProfile } from "@/lib/cardin/merchant-strategy-profiles"
import type { ActivityType } from "@/lib/cardin/status-labels"
import { getStatusLabel } from "@/lib/cardin/status-labels"
import type { CardRawFacts, InternalTier, MerchantStrategyMode, ScoreBand } from "@/types/cardin-core.types"

type ScoreSnapshotRecord = {
  id: string
  card_id: string
  season_id: string
  total_score: number
  score_band: ScoreBand
  internal_tier: number
  status_name: string
  visual_state: string
  tension_progress: number
  domino_state: Record<string, unknown>
  grand_diamond_state: string
  components: Record<string, unknown>
  engine_version: string
  version: number
  computed_at: string
  created_at: string
  updated_at: string
}

type SeasonRecord = {
  id: string
  merchant_id: string
  scoring_weights: Record<string, unknown> | null
  status_thresholds: Record<string, unknown> | null
  journey_config: Record<string, unknown> | null
}

type LaunchIntentRecord = {
  activity_template_id: string | null
  scenario_id: string | null
}

type CardProgressRecord = {
  current_step: number
  direct_invitations_activated: number
  summit_reached_at: string | null
}

type TransactionRecord = {
  event_type: string | null
  type: string | null
  created_at: string
  metadata: Record<string, unknown> | null
}

export type SeasonScoringWeights = {
  frequency: number
  social: number
  value: number
  progression: number
  time: number
  scarcity: number
}

export type SeasonStatusThresholds = {
  warming: number
  active: number
  rising: number
  diamond: number
}

export type SeasonJourneyConfig = {
  stepCount: number
  dominoStartStep: number
  diamondStep: number
  summitStep: number
  activityType: ActivityType
  strategyMode: MerchantStrategyMode
}

const ACTIVITY_TYPES: ActivityType[] = [
  "cafe",
  "restaurant",
  "boulangerie",
  "coiffeur",
  "institut-beaute",
  "boutique",
  "createur",
]

const STRATEGY_MODES: MerchantStrategyMode[] = ["frequency", "social", "weak_time", "value"]

export const DEFAULT_STATUS_THRESHOLDS: SeasonStatusThresholds = {
  warming: 20,
  active: 40,
  rising: 60,
  diamond: 80,
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function normalizeActivityType(value?: string | null): ActivityType {
  const candidate = (value ?? "").trim().toLowerCase()
  if (candidate === "creator") {
    return "createur"
  }

  if (ACTIVITY_TYPES.includes(candidate as ActivityType)) {
    return candidate as ActivityType
  }

  return "boulangerie"
}

export function mapScenarioIdToStrategyMode(value?: string | null): MerchantStrategyMode {
  const candidate = (value ?? "").trim().toLowerCase()

  if (["domino", "social", "referral"].includes(candidate)) {
    return "social"
  }

  if (["weekly_rendezvous", "weak_time", "gap_fill"].includes(candidate)) {
    return "weak_time"
  }

  if (["monthly_gain", "rare", "value"].includes(candidate)) {
    return "value"
  }

  return "frequency"
}

export function buildDefaultScoringWeights(
  activityType: ActivityType,
  strategyMode: MerchantStrategyMode
): SeasonScoringWeights {
  const profile = getWeightProfile(activityType, strategyMode)
  return {
    frequency: profile.frequency,
    social: profile.social,
    value: profile.value,
    progression: profile.progression,
    time: profile.time,
    scarcity: profile.scarcity,
  }
}

export function buildDefaultJourneyConfig(
  activityType: ActivityType,
  strategyMode: MerchantStrategyMode
): SeasonJourneyConfig {
  return {
    stepCount: cardinSeasonLaw.stepCount,
    dominoStartStep: cardinSeasonLaw.dominoStartStep,
    diamondStep: cardinSeasonLaw.diamondStep,
    summitStep: cardinSeasonLaw.summitStep,
    activityType,
    strategyMode,
  }
}

export function buildDefaultSeasonScoringConfig(
  activityType: ActivityType,
  strategyMode: MerchantStrategyMode
): {
  scoringWeights: SeasonScoringWeights
  statusThresholds: SeasonStatusThresholds
  journeyConfig: SeasonJourneyConfig
} {
  return {
    scoringWeights: buildDefaultScoringWeights(activityType, strategyMode),
    statusThresholds: DEFAULT_STATUS_THRESHOLDS,
    journeyConfig: buildDefaultJourneyConfig(activityType, strategyMode),
  }
}

function resolveJourneyConfig(
  season: SeasonRecord,
  launchIntent: LaunchIntentRecord | null
): SeasonJourneyConfig {
  const journey = isObject(season.journey_config) ? season.journey_config : {}
  const activityType = normalizeActivityType(
    typeof journey.activityType === "string" ? journey.activityType : launchIntent?.activity_template_id
  )
  const strategyMode = STRATEGY_MODES.includes(journey.strategyMode as MerchantStrategyMode)
    ? (journey.strategyMode as MerchantStrategyMode)
    : mapScenarioIdToStrategyMode(launchIntent?.scenario_id)

  return {
    stepCount:
      typeof journey.stepCount === "number" && Number.isFinite(journey.stepCount)
        ? Math.round(journey.stepCount)
        : cardinSeasonLaw.stepCount,
    dominoStartStep:
      typeof journey.dominoStartStep === "number" && Number.isFinite(journey.dominoStartStep)
        ? Math.round(journey.dominoStartStep)
        : cardinSeasonLaw.dominoStartStep,
    diamondStep:
      typeof journey.diamondStep === "number" && Number.isFinite(journey.diamondStep)
        ? Math.round(journey.diamondStep)
        : cardinSeasonLaw.diamondStep,
    summitStep:
      typeof journey.summitStep === "number" && Number.isFinite(journey.summitStep)
        ? Math.round(journey.summitStep)
        : cardinSeasonLaw.summitStep,
    activityType,
    strategyMode,
  }
}

function resolveScoringWeights(
  season: SeasonRecord,
  journeyConfig: SeasonJourneyConfig
): SeasonScoringWeights {
  const candidate = isObject(season.scoring_weights) ? season.scoring_weights : {}
  const keys: Array<keyof SeasonScoringWeights> = ["frequency", "social", "value", "progression", "time", "scarcity"]
  const hasAllKeys = keys.every((key) => typeof candidate[key] === "number" && Number.isFinite(candidate[key] as number))

  if (hasAllKeys) {
    return {
      frequency: Number(candidate.frequency),
      social: Number(candidate.social),
      value: Number(candidate.value),
      progression: Number(candidate.progression),
      time: Number(candidate.time),
      scarcity: Number(candidate.scarcity),
    }
  }

  return buildDefaultScoringWeights(journeyConfig.activityType, journeyConfig.strategyMode)
}

function resolveStatusThresholds(season: SeasonRecord): SeasonStatusThresholds {
  const candidate = isObject(season.status_thresholds) ? season.status_thresholds : {}

  if (
    typeof candidate.warming === "number" &&
    typeof candidate.active === "number" &&
    typeof candidate.rising === "number" &&
    typeof candidate.diamond === "number"
  ) {
    return {
      warming: Number(candidate.warming),
      active: Number(candidate.active),
      rising: Number(candidate.rising),
      diamond: Number(candidate.diamond),
    }
  }

  return DEFAULT_STATUS_THRESHOLDS
}

function mapScoreToTierWithThresholds(
  score: number,
  thresholds: SeasonStatusThresholds
): { scoreBand: ScoreBand; internalTier: InternalTier } {
  if (score < thresholds.warming) {
    return { scoreBand: "low", internalTier: 1 }
  }

  if (score < thresholds.active) {
    return { scoreBand: "warming", internalTier: 2 }
  }

  if (score < thresholds.rising) {
    return { scoreBand: "active", internalTier: 3 }
  }

  if (score < thresholds.diamond) {
    return { scoreBand: "rising", internalTier: 4 }
  }

  return { scoreBand: "diamond", internalTier: 5 }
}

async function resolveSeason(
  supabase: SupabaseClient,
  cardId: string,
  explicitSeasonId?: string | null
): Promise<SeasonRecord | null> {
  if (explicitSeasonId) {
    const { data } = await supabase
      .from("seasons")
      .select("id, merchant_id, scoring_weights, status_thresholds, journey_config")
      .eq("id", explicitSeasonId)
      .single()

    return (data as SeasonRecord | null) ?? null
  }

  const { data: card } = await supabase
    .from("cards")
    .select("current_season_id")
    .eq("id", cardId)
    .single()

  const seasonId = card?.current_season_id
  if (!seasonId) {
    return null
  }

  const { data: season } = await supabase
    .from("seasons")
    .select("id, merchant_id, scoring_weights, status_thresholds, journey_config")
    .eq("id", seasonId)
    .single()

  return (season as SeasonRecord | null) ?? null
}

async function buildRawFacts(
  supabase: SupabaseClient,
  cardId: string,
  season: SeasonRecord
): Promise<{
  facts: CardRawFacts
  progress: CardProgressRecord | null
  journeyConfig: SeasonJourneyConfig
  thresholds: SeasonStatusThresholds
  weights: SeasonScoringWeights
}> {
  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select("id, merchant_id, customer_name, created_at")
    .eq("id", cardId)
    .single()

  if (cardError || !card) {
    throw new Error(cardError?.message ?? "card_not_found")
  }

  const { data: launchIntent } = await supabase
    .from("merchant_launch_intents")
    .select("activity_template_id, scenario_id")
    .eq("merchant_id", card.merchant_id)
    .maybeSingle()

  const journeyConfig = resolveJourneyConfig(season, (launchIntent as LaunchIntentRecord | null) ?? null)
  const thresholds = resolveStatusThresholds(season)
  const weights = resolveScoringWeights(season, journeyConfig)

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("event_type, type, created_at, metadata")
    .eq("card_id", cardId)
    .eq("season_id", season.id)
    .order("created_at", { ascending: false })

  if (transactionsError) {
    throw new Error(transactionsError.message)
  }

  const { data: progress } = await supabase
    .from("card_season_progress")
    .select("current_step, direct_invitations_activated, summit_reached_at")
    .eq("card_id", cardId)
    .eq("season_id", season.id)
    .maybeSingle()

  const events = (transactions as TransactionRecord[] | null) ?? []
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  const visitEvents = events.filter((event) => {
    const kind = event.event_type ?? event.type ?? ""
    return kind === "issued" || kind === "stamp" || kind === "weak_day_visit"
  })

  const weakDayVisits = events.filter((event) => {
    const kind = event.event_type ?? event.type ?? ""
    if (kind === "weak_day_visit") {
      return true
    }

    const metadata = isObject(event.metadata) ? event.metadata : {}
    return metadata.weakDay === true
  }).length

  const visitsLast30d = visitEvents.filter((event) => new Date(event.created_at).getTime() >= thirtyDaysAgo).length
  const lastVisitAt = visitEvents.length > 0 ? visitEvents[0].created_at : null
  const referralsCount = Math.max(0, progress?.direct_invitations_activated ?? 0)
  const streakCount = Math.max(0, progress?.current_step ?? Math.min(visitEvents.length, 1))

  return {
    facts: {
      cardId: card.id,
      merchantId: card.merchant_id,
      customerId: card.id,
      customerName: card.customer_name,
      visitsCount: visitEvents.length,
      visitsLast30d,
      referralsCount,
      weakDayVisits,
      streakCount,
      spendTotal: 0,
      spendAverage: 0,
      lastVisitAt,
      createdAt: card.created_at,
      updatedAt: lastVisitAt ?? card.created_at,
    },
    progress: (progress as CardProgressRecord | null) ?? null,
    journeyConfig,
    thresholds,
    weights,
  }
}

export async function recomputeCardScoreSnapshot(
  supabase: SupabaseClient,
  cardId: string,
  options?: { seasonId?: string | null }
): Promise<ScoreSnapshotRecord | null> {
  const season = await resolveSeason(supabase, cardId, options?.seasonId)
  if (!season) {
    return null
  }

  const { facts, thresholds, journeyConfig, weights } = await buildRawFacts(supabase, cardId, season)
  const components = calculateScoreComponents(facts, 0)
  const totalScore = calculateTotalScore(components, weights)
  const { scoreBand, internalTier } = mapScoreToTierWithThresholds(totalScore, thresholds)
  const visualState = getVisualState(scoreBand)
  const tension = calculateTension(totalScore, internalTier)
  const domino = calculateDominoState(facts, journeyConfig.strategyMode)
  const statusName = getStatusLabel(journeyConfig.activityType, internalTier)
  const computedAt = new Date().toISOString()

  const snapshotPayload = {
    card_id: cardId,
    season_id: season.id,
    total_score: totalScore,
    score_band: scoreBand,
    internal_tier: internalTier,
    status_name: statusName,
    visual_state: visualState,
    tension_progress: tension.lineProgress,
    domino_state: domino,
    grand_diamond_state: "none",
    components,
    engine_version: ENGINE_VERSION,
    computed_at: computedAt,
    updated_at: computedAt,
  }

  const { data: existing, error: existingError } = await supabase
    .from("score_snapshots")
    .select("id, version")
    .eq("card_id", cardId)
    .eq("season_id", season.id)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from("score_snapshots")
      .update({
        ...snapshotPayload,
        version: (existing.version ?? 0) + 1,
      })
      .eq("id", existing.id)
      .select("id, card_id, season_id, total_score, score_band, internal_tier, status_name, visual_state, tension_progress, domino_state, grand_diamond_state, components, engine_version, version, computed_at, created_at, updated_at")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "score_snapshot_update_failed")
    }

    return data as ScoreSnapshotRecord
  }

  const { data, error } = await supabase
    .from("score_snapshots")
    .insert({
      ...snapshotPayload,
      version: 1,
    })
    .select("id, card_id, season_id, total_score, score_band, internal_tier, status_name, visual_state, tension_progress, domino_state, grand_diamond_state, components, engine_version, version, computed_at, created_at, updated_at")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "score_snapshot_insert_failed")
  }

  return data as ScoreSnapshotRecord
}