import type { SupabaseClient } from "@supabase/supabase-js"

import {
  computeProtocolSnapshot,
  getDefaultProtocolFlags,
  mapMerchantTypeToProtocolProfile,
  normalizeProtocolConfig,
  normalizeProtocolFlags,
  type CardinProtocolConfig,
  type CardinProtocolFlags,
  type CardinProtocolSnapshot,
} from "@/lib/cardin-protocol-v3"
import type { MerchantProfileId } from "@/lib/merchant-profile"
import { getActiveSeason, getCardSeasonProgress, type Season } from "@/lib/season-progression"
import { insertTransactionEvent } from "@/lib/transaction-events"

export type ProtocolEventType =
  | "summit_reward_granted"
  | "diamond_token_issued"
  | "diamond_token_consumed"
  | "propagation_credit_granted"
  | "reward_pause_triggered"
  | "diamond_reward_paused"
  | "mission_assigned"
  | "mission_viewed"
  | "mission_completed"
  | "mission_expired"

export type ProtocolEventInput = {
  merchantId: string
  seasonId?: string | null
  cardId?: string | null
  eventType: ProtocolEventType
  costEur?: number
  estimatedValueEur?: number
  state?: string | null
  missionId?: string | null
  visitSessionId?: string | null
  metadata?: Record<string, unknown>
}

export type MerchantProtocolSettings = {
  profileId: MerchantProfileId
  flags: CardinProtocolFlags
  config: CardinProtocolConfig
  merchantName?: string | null
}

export type DiamondTokenRecord = {
  id: string
  merchant_id: string
  card_id: string
  season_id: string
  cycle_index: number
  cycle_started_at: string
  expires_at: string
  status: string
  issued_at: string
  consumed_at: string | null
  consumed_visit_session_id: string | null
  token_cost_eur: number
}

type MerchantRow = {
  id: string
  name?: string | null
  cardin_world?: string | null
  protocol_v3_config?: unknown
  protocol_v3_enabled?: boolean | null
  protocol_diamond_tokens_enabled?: boolean | null
  protocol_adaptive_enabled?: boolean | null
}

type RewardAssessment = {
  allowed: boolean
  blockingReason: string | null
}

function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function sevenDaysAgo(now: Date): Date {
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function sumProtocolCosts(
  supabase: SupabaseClient,
  merchantId: string,
  params: { since?: string; seasonId?: string | null; types?: string[] },
): Promise<number> {
  try {
    let query = supabase
      .from("protocol_events")
      .select("cost_eur")
      .eq("merchant_id", merchantId)

    if (params.seasonId) {
      query = query.eq("season_id", params.seasonId)
    }

    if (params.since) {
      query = query.gte("created_at", params.since)
    }

    if (params.types?.length) {
      query = query.in("event_type", params.types)
    }

    const { data, error } = await query
    if (error || !data) return 0
    return roundCurrency(
      data.reduce((sum, row) => sum + safeNumber((row as { cost_eur?: number }).cost_eur, 0), 0),
    )
  } catch {
    return 0
  }
}

export async function insertProtocolEvent(supabase: SupabaseClient, input: ProtocolEventInput): Promise<void> {
  try {
    await supabase.from("protocol_events").insert({
      merchant_id: input.merchantId,
      season_id: input.seasonId ?? null,
      card_id: input.cardId ?? null,
      event_type: input.eventType,
      cost_eur: roundCurrency(input.costEur ?? 0),
      estimated_value_eur: input.estimatedValueEur != null ? roundCurrency(input.estimatedValueEur) : null,
      state: input.state ?? null,
      mission_id: input.missionId ?? null,
      visit_session_id: input.visitSessionId ?? null,
      metadata: input.metadata ?? {},
    })
  } catch (error) {
    console.error("protocol_event_insert_failed", error)
  }
}

function settingsFromMerchantRow(row: MerchantRow, seasonLengthMonths?: number | null): MerchantProtocolSettings {
  const profileId = mapMerchantTypeToProtocolProfile(row.cardin_world)
  const config = normalizeProtocolConfig(row.protocol_v3_config, profileId, seasonLengthMonths)
  const flags = normalizeProtocolFlags({
    enabled: row.protocol_v3_enabled ?? getDefaultProtocolFlags().enabled,
    diamondTokensEnabled: row.protocol_diamond_tokens_enabled ?? getDefaultProtocolFlags().diamondTokensEnabled,
    adaptiveHooksEnabled: row.protocol_adaptive_enabled ?? getDefaultProtocolFlags().adaptiveHooksEnabled,
  })

  return {
    profileId,
    flags,
    config,
    merchantName: row.name ?? null,
  }
}

export async function getMerchantProtocolSettings(
  supabase: SupabaseClient,
  merchantId: string,
  seasonLengthMonths?: number | null,
): Promise<MerchantProtocolSettings | null> {
  const { data, error } = await supabase
    .from("merchants")
    .select("id, name, cardin_world, protocol_v3_config, protocol_v3_enabled, protocol_diamond_tokens_enabled, protocol_adaptive_enabled")
    .eq("id", merchantId)
    .maybeSingle()

  if (error || !data) return null
  return settingsFromMerchantRow(data as MerchantRow, seasonLengthMonths)
}

export async function buildMerchantProtocolSnapshot(
  supabase: SupabaseClient,
  params: { merchantId: string; season?: Season | null },
): Promise<CardinProtocolSnapshot | null> {
  const season = params.season ?? (await getActiveSeason(supabase, params.merchantId))
  const settings = await getMerchantProtocolSettings(supabase, params.merchantId, season?.season_length ?? null)
  if (!settings) return null

  const { data: cards } = await supabase
    .from("cards")
    .select("id, stamps, midpoint_reached_at, summit_reward_option_id")
    .eq("merchant_id", params.merchantId)

  const cardRows = (cards ?? []) as Array<{ id: string; stamps: number; midpoint_reached_at: string | null; summit_reward_option_id: string | null }>
  const activeUsers = cardRows.length
  const repeatClients = cardRows.filter((card) => card.stamps > 1).length
  const midpointUsers = cardRows.filter((card) => Boolean(card.midpoint_reached_at)).length
  const summitUsers = cardRows.filter((card) => Boolean(card.summit_reward_option_id)).length

  let diamondUsers = 0
  let activatedReferrals = 0
  let averageStep = 0

  if (season) {
    const { data: progressRows } = await supabase
      .from("card_season_progress")
      .select("current_step, diamond_unlocked_at")
      .eq("season_id", season.id)

    const progress = (progressRows ?? []) as Array<{ current_step: number; diamond_unlocked_at: string | null }>
    diamondUsers = progress.filter((row) => Boolean(row.diamond_unlocked_at)).length
    averageStep = progress.length > 0 ? progress.reduce((sum, row) => sum + safeNumber(row.current_step, 1), 0) / progress.length : 0

    const { count } = await supabase
      .from("card_referrals")
      .select("id", { count: "exact", head: true })
      .eq("season_id", season.id)
      .eq("is_activated", true)

    activatedReferrals = count ?? 0
  }

  const now = new Date()
  const rewardCostSeason = await sumProtocolCosts(supabase, params.merchantId, { seasonId: season?.id ?? null })
  const rewardCostWeek = await sumProtocolCosts(supabase, params.merchantId, { since: sevenDaysAgo(now).toISOString() })
  const rewardCostDay = await sumProtocolCosts(supabase, params.merchantId, { since: startOfDay(now).toISOString() })
  const diamondCostSeason = await sumProtocolCosts(supabase, params.merchantId, {
    seasonId: season?.id ?? null,
    types: ["diamond_token_issued"],
  })
  const propagationCostSeason = await sumProtocolCosts(supabase, params.merchantId, {
    seasonId: season?.id ?? null,
    types: ["propagation_credit_granted"],
  })

  const progressScore = clamp(averageStep / 8, 0, 2)
  const propagationScore = clamp(
    activatedReferrals > 0 && diamondUsers > 0 ? activatedReferrals / Math.max(1, diamondUsers * settings.config.funnel.maxInvites) : 0,
    0,
    2,
  )
  const engagementRate = clamp(activeUsers > 0 ? repeatClients / activeUsers : 0, 0, 2)
  const costScore = clamp(settings.config.seasonBudget > 0 ? rewardCostSeason / settings.config.seasonBudget : 0, 0, 3)

  return computeProtocolSnapshot(
    settings.config,
    {
      activeUsers,
      rawScans: activeUsers,
      midpointUsers,
      summitUsers,
      diamondUsers,
      referralsConverted: activatedReferrals,
      engagedVisits: repeatClients,
      progressScore,
      costScore,
      propagationScore,
      engagementRate,
      integrityScore: 0,
      actualRewardCostSeason: rewardCostSeason,
      actualRewardCostWeek: rewardCostWeek,
      actualRewardCostDay: rewardCostDay,
      actualDiamondCostSeason: diamondCostSeason,
      actualPropagationCostSeason: propagationCostSeason,
      inheritedDiamondUsers: 0,
    },
    settings.flags,
    settings.profileId,
  )
}

export async function hasCardEarnedDiamondRights(supabase: SupabaseClient, cardId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id")
    .eq("card_id", cardId)
    .eq("type", "summit_reward_use")
    .limit(1)
    .maybeSingle()

  return !error && Boolean(data)
}

function getCycleIndex(params: { seasonStartedAt: string; cycleDays: number; now?: Date }): number {
  const now = params.now ?? new Date()
  const startedAt = new Date(params.seasonStartedAt)
  if (Number.isNaN(startedAt.getTime())) return 1
  const diffMs = Math.max(0, now.getTime() - startedAt.getTime())
  return Math.floor(diffMs / (params.cycleDays * 24 * 60 * 60 * 1000)) + 1
}

function getCycleBounds(params: { seasonStartedAt: string; seasonEndsAt: string; cycleIndex: number; cycleDays: number }) {
  const seasonStart = new Date(params.seasonStartedAt)
  const startedAt = new Date(seasonStart)
  startedAt.setUTCDate(startedAt.getUTCDate() + (params.cycleIndex - 1) * params.cycleDays)
  const expiresAt = new Date(startedAt)
  expiresAt.setUTCDate(expiresAt.getUTCDate() + params.cycleDays)
  const seasonEndsAt = new Date(params.seasonEndsAt)
  if (!Number.isNaN(seasonEndsAt.getTime()) && expiresAt > seasonEndsAt) {
    return { startedAt, expiresAt: seasonEndsAt }
  }
  return { startedAt, expiresAt }
}

export async function getActiveDiamondTokenForCard(
  supabase: SupabaseClient,
  cardId: string,
  seasonId?: string | null,
): Promise<DiamondTokenRecord | null> {
  let query = supabase
    .from("diamond_experience_tokens")
    .select("id, merchant_id, card_id, season_id, cycle_index, cycle_started_at, expires_at, status, issued_at, consumed_at, consumed_visit_session_id, token_cost_eur")
    .eq("card_id", cardId)
    .eq("status", "available")
    .gt("expires_at", new Date().toISOString())
    .order("cycle_index", { ascending: false })
    .limit(1)

  if (seasonId) {
    query = query.eq("season_id", seasonId)
  }

  const { data, error } = await query.maybeSingle()
  if (error || !data) return null
  return data as DiamondTokenRecord
}

export async function assessRewardGrant(
  snapshot: CardinProtocolSnapshot,
  params: { deltaRewardCost?: number; deltaDiamondCost?: number; deltaPropagationCost?: number; requireDiamondSafety?: boolean },
): Promise<RewardAssessment> {
  if (!snapshot.flags.enabled) {
    return { allowed: true, blockingReason: null }
  }

  const extra = roundCurrency((params.deltaRewardCost ?? 0) + (params.deltaDiamondCost ?? 0) + (params.deltaPropagationCost ?? 0))
  const seasonExposure = snapshot.actual.seasonExposure + extra
  if (Math.max(snapshot.projected.RC_total, seasonExposure) > snapshot.config.seasonBudget) {
    return { allowed: false, blockingReason: "season_budget" }
  }

  if (snapshot.actual.rewardCostWeek + extra > snapshot.projected.B_week) {
    return { allowed: false, blockingReason: "weekly_budget" }
  }

  if (snapshot.actual.rewardCostDay + extra > snapshot.projected.daily_budget_limit) {
    return { allowed: false, blockingReason: "daily_budget" }
  }

  if (snapshot.projected.RC_self > snapshot.projected.GP_self / 3) {
    return { allowed: false, blockingReason: "per_user_safety" }
  }

  if (params.requireDiamondSafety) {
    if (!snapshot.flags.diamondTokensEnabled) {
      return { allowed: false, blockingReason: "diamond_disabled" }
    }

    if (snapshot.projected.OUMEE_diamond > (snapshot.projected.GP_self + snapshot.projected.GP_prop_user) / 3) {
      return { allowed: false, blockingReason: "diamond_user_safety" }
    }

    if (Math.max(snapshot.projected.RC_diamond_season, snapshot.actual.diamondCostSeason + (params.deltaDiamondCost ?? 0)) > snapshot.config.diamond.budget) {
      return { allowed: false, blockingReason: "diamond_budget" }
    }

    if (snapshot.projected.N_diamond > Math.floor(snapshot.projected.N * snapshot.config.maxDiamondRatio)) {
      return { allowed: false, blockingReason: "diamond_saturation" }
    }
  }

  return { allowed: true, blockingReason: null }
}

export async function logRewardPause(
  supabase: SupabaseClient,
  params: {
    merchantId: string
    seasonId?: string | null
    cardId?: string | null
    visitSessionId?: string | null
    state?: string | null
    reason: string
    action: "summit_reward" | "diamond_token" | "propagation" | "mission"
  },
): Promise<void> {
  await insertProtocolEvent(supabase, {
    merchantId: params.merchantId,
    seasonId: params.seasonId ?? null,
    cardId: params.cardId ?? null,
    visitSessionId: params.visitSessionId ?? null,
    eventType: params.action === "diamond_token" ? "diamond_reward_paused" : "reward_pause_triggered",
    state: params.state ?? null,
    metadata: { reason: params.reason, action: params.action },
  })
}

export async function issueDiamondTokenIfEligible(
  supabase: SupabaseClient,
  params: {
    merchantId: string
    cardId: string
    season: Season
  },
): Promise<{ issued: boolean; token?: DiamondTokenRecord; reason?: string }> {
  const settings = await getMerchantProtocolSettings(supabase, params.merchantId, params.season.season_length)
  if (!settings || !settings.flags.enabled || !settings.flags.diamondTokensEnabled) {
    return { issued: false, reason: "diamond_disabled" }
  }

  const progress = await getCardSeasonProgress(supabase, params.cardId, params.season.id)
  if (!progress?.diamond_unlocked_at) {
    return { issued: false, reason: "diamond_not_unlocked" }
  }

  const earned = await hasCardEarnedDiamondRights(supabase, params.cardId)
  if (!earned) {
    return { issued: false, reason: "diamond_not_earned" }
  }

  const snapshot = await buildMerchantProtocolSnapshot(supabase, { merchantId: params.merchantId, season: params.season })
  if (!snapshot) {
    return { issued: false, reason: "protocol_snapshot_failed" }
  }

  const assessment = await assessRewardGrant(snapshot, {
    deltaDiamondCost: settings.config.diamond.tokenCost,
    requireDiamondSafety: true,
  })

  if (!assessment.allowed) {
    await logRewardPause(supabase, {
      merchantId: params.merchantId,
      seasonId: params.season.id,
      cardId: params.cardId,
      state: snapshot.state,
      reason: assessment.blockingReason ?? "diamond_guardrail",
      action: "diamond_token",
    })
    return { issued: false, reason: assessment.blockingReason ?? "diamond_guardrail" }
  }

  const cycleIndex = getCycleIndex({
    seasonStartedAt: params.season.started_at,
    cycleDays: settings.config.diamond.tokenCycleDays,
  })
  const maxSeasonCycles = Math.max(1, Math.floor((settings.config.seasonLengthMonths * 30) / settings.config.diamond.tokenCycleDays))
  if (cycleIndex > Math.min(settings.config.diamond.maxTokenCycles, maxSeasonCycles)) {
    return { issued: false, reason: "diamond_cycle_cap_reached" }
  }

  const { data: existing } = await supabase
    .from("diamond_experience_tokens")
    .select("id, merchant_id, card_id, season_id, cycle_index, cycle_started_at, expires_at, status, issued_at, consumed_at, consumed_visit_session_id, token_cost_eur")
    .eq("card_id", params.cardId)
    .eq("season_id", params.season.id)
    .eq("cycle_index", cycleIndex)
    .maybeSingle()

  if (existing) {
    return { issued: false, token: existing as DiamondTokenRecord, reason: "diamond_token_exists" }
  }

  const bounds = getCycleBounds({
    seasonStartedAt: params.season.started_at,
    seasonEndsAt: params.season.ends_at,
    cycleIndex,
    cycleDays: settings.config.diamond.tokenCycleDays,
  })

  const { data, error } = await supabase
    .from("diamond_experience_tokens")
    .insert({
      merchant_id: params.merchantId,
      card_id: params.cardId,
      season_id: params.season.id,
      cycle_index: cycleIndex,
      cycle_started_at: bounds.startedAt.toISOString(),
      expires_at: bounds.expiresAt.toISOString(),
      status: "available",
      token_cost_eur: settings.config.diamond.tokenCost,
    })
    .select("id, merchant_id, card_id, season_id, cycle_index, cycle_started_at, expires_at, status, issued_at, consumed_at, consumed_visit_session_id, token_cost_eur")
    .single()

  if (error || !data) {
    if (error?.code === "23505") {
      const current = await getActiveDiamondTokenForCard(supabase, params.cardId, params.season.id)
      if (current) {
        return { issued: false, token: current, reason: "diamond_token_exists" }
      }
    }
    return { issued: false, reason: error?.message ?? "diamond_token_issue_failed" }
  }

  await insertProtocolEvent(supabase, {
    merchantId: params.merchantId,
    seasonId: params.season.id,
    cardId: params.cardId,
    eventType: "diamond_token_issued",
    costEur: settings.config.diamond.tokenCost,
    metadata: {
      cycleIndex,
      expiresAt: bounds.expiresAt.toISOString(),
    },
  })

  return { issued: true, token: data as DiamondTokenRecord }
}

export async function consumeDiamondToken(
  supabase: SupabaseClient,
  params: {
    merchantId: string
    cardId: string
    visitSessionId: string
    createdBy: string | null
    idempotencyKey?: string | null
  },
): Promise<
  | { ok: true; token: DiamondTokenRecord }
  | { ok: false; error: "forbidden" | "card_not_found" | "no_active_reward" | "reward_already_consumed_for_session" | "consume_failed" }
> {
  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select("id, merchant_id")
    .eq("id", params.cardId)
    .maybeSingle()

  if (cardError || !card) {
    return { ok: false, error: "card_not_found" }
  }

  if (card.merchant_id !== params.merchantId) {
    return { ok: false, error: "forbidden" }
  }

  const token = await getActiveDiamondTokenForCard(supabase, params.cardId)
  if (!token) {
    return { ok: false, error: "no_active_reward" }
  }

  const { data: updated, error } = await supabase
    .from("diamond_experience_tokens")
    .update({
      status: "consumed",
      consumed_at: new Date().toISOString(),
      consumed_visit_session_id: params.visitSessionId,
    })
    .eq("id", token.id)
    .eq("status", "available")
    .is("consumed_at", null)
    .select("id, merchant_id, card_id, season_id, cycle_index, cycle_started_at, expires_at, status, issued_at, consumed_at, consumed_visit_session_id, token_cost_eur")
    .maybeSingle()

  if (error) {
    return error.code === "23505"
      ? { ok: false, error: "reward_already_consumed_for_session" }
      : { ok: false, error: "consume_failed" }
  }

  if (!updated) {
    return { ok: false, error: "reward_already_consumed_for_session" }
  }

  await insertTransactionEvent(supabase, {
    cardId: params.cardId,
    legacyType: "diamond_token_use",
    eventType: "diamond_token_use",
    seasonId: token.season_id,
    source: "merchant_consume",
    metadata: {
      tokenId: token.id,
      cycleIndex: token.cycle_index,
      expiresAt: token.expires_at,
    },
    idempotencyKey: params.idempotencyKey ?? null,
    createdBy: params.createdBy,
    visitSessionId: params.visitSessionId,
  })

  await insertProtocolEvent(supabase, {
    merchantId: params.merchantId,
    seasonId: token.season_id,
    cardId: params.cardId,
    eventType: "diamond_token_consumed",
    metadata: {
      tokenId: token.id,
      cycleIndex: token.cycle_index,
      visitSessionId: params.visitSessionId,
    },
  })

  return { ok: true, token: updated as DiamondTokenRecord }
}

export async function maybeLogPropagationCredit(
  supabase: SupabaseClient,
  params: { merchantId: string; seasonId: string; parentCardId: string },
): Promise<void> {
  const settings = await getMerchantProtocolSettings(supabase, params.merchantId)
  if (!settings || settings.config.rewardCosts.propagation <= 0) return

  const snapshot = await buildMerchantProtocolSnapshot(supabase, {
    merchantId: params.merchantId,
    season: await getActiveSeason(supabase, params.merchantId),
  })

  if (!snapshot) return

  const assessment = await assessRewardGrant(snapshot, {
    deltaPropagationCost: settings.config.rewardCosts.propagation,
  })

  if (!assessment.allowed) {
    await logRewardPause(supabase, {
      merchantId: params.merchantId,
      seasonId: params.seasonId,
      cardId: params.parentCardId,
      state: snapshot.state,
      reason: assessment.blockingReason ?? "propagation_guardrail",
      action: "propagation",
    })
    return
  }

  await insertProtocolEvent(supabase, {
    merchantId: params.merchantId,
    seasonId: params.seasonId,
    cardId: params.parentCardId,
    eventType: "propagation_credit_granted",
    costEur: settings.config.rewardCosts.propagation,
  })
}




