import type { SupabaseClient } from "@supabase/supabase-js"
import { cardinSeasonLaw } from "./season-law"
import type { CardSeasonProgress, Season } from "./season-progression"
import { getSeason } from "./season-progression"

// ============================================================================
// TYPES
// ============================================================================

export type WinnerWeight = {
  cardId: string
  customerName: string
  baseWeight: number // 1 for Diamond
  dominoBonus: number // +1 per activated invitation
  activeBonus: number // +1 if stayed active until close
  totalWeight: number
}

export type WinnerSelectionResult = {
  winnerId: string | null
  eligibleCards: WinnerWeight[]
  selectionMetadata: {
    totalEligible: number
    totalWeight: number
    weights: WinnerWeight[]
    selectedAt: string
    algorithm: string
    reason?: string
  }
}

// ============================================================================
// ELIGIBILITY CHECKING
// ============================================================================

/**
 * Check if a card is eligible for winner pool
 * Requirements:
 * 1. Reached Diamond (step 7+)
 * 2. Completed summit (step 8)
 * 3. Season is closed
 */
export function isEligibleForWinnerPool(
  progress: CardSeasonProgress,
  season: Season
): boolean {
  // Must reach Diamond (step 7)
  if (progress.current_step < cardinSeasonLaw.diamondStep) {
    return false
  }

  // Must reach Summit (step 8)
  if (!progress.summit_reached_at) {
    return false
  }

  // Season must be closed
  if (!season.closed_at) {
    return false
  }

  return true
}

// ============================================================================
// WEIGHT CALCULATION
// ============================================================================

/**
 * Get last visit date for a card in a season
 */
async function getLastVisitDate(
  supabase: SupabaseClient,
  cardId: string,
  seasonId: string
): Promise<Date | null> {
  const { data } = await supabase
    .from("transactions")
    .select("created_at")
    .eq("card_id", cardId)
    .eq("season_id", seasonId)
    .in("type", ["issued", "stamp"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!data) {
    return null
  }

  return new Date(data.created_at)
}

/**
 * Calculate days between two dates
 */
function differenceInDays(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((date1.getTime() - date2.getTime()) / msPerDay)
}

/**
 * Calculate winner weight for a card
 *
 * Formula:
 * Base = 1 (for reaching Diamond + Summit)
 * +1 per activated invitation (child reached step 2)
 * +1 for staying active until season close (visit within 14 days)
 */
export async function calculateWinnerWeight(
  supabase: SupabaseClient,
  cardId: string,
  seasonId: string
): Promise<WinnerWeight | null> {
  // Get progress
  const { data: progress } = await supabase
    .from("card_season_progress")
    .select("*")
    .eq("card_id", cardId)
    .eq("season_id", seasonId)
    .single()

  if (!progress) {
    return null
  }

  // Get season
  const season = await getSeason(supabase, seasonId)
  if (!season) {
    return null
  }

  // Check eligibility
  if (!isEligibleForWinnerPool(progress as CardSeasonProgress, season)) {
    return null
  }

  // Get card name
  const { data: card } = await supabase
    .from("cards")
    .select("customer_name")
    .eq("id", cardId)
    .single()

  const customerName = card?.customer_name ?? "Unknown"

  // Base weight: 1 for Diamond + Summit
  const baseWeight = 1

  // Domino bonus: +1 per activated invitation
  const dominoBonus = progress.direct_invitations_activated ?? 0

  // Active bonus: +1 if last visit within 14 days of season close
  let activeBonus = 0
  if (season.closed_at) {
    const lastVisit = await getLastVisitDate(supabase, cardId, seasonId)
    if (lastVisit) {
      const closedDate = new Date(season.closed_at)
      const daysToClose = differenceInDays(closedDate, lastVisit)
      activeBonus = daysToClose <= 14 ? 1 : 0
    }
  }

  const totalWeight = baseWeight + dominoBonus + activeBonus

  return {
    cardId,
    customerName,
    baseWeight,
    dominoBonus,
    activeBonus,
    totalWeight,
  }
}

// ============================================================================
// WEIGHTED RANDOM DRAW
// ============================================================================

/**
 * Run weighted random draw to select winner
 * Uses cumulative weight method for fairness
 */
export function runWeightedDraw(weights: WinnerWeight[]): string {
  if (weights.length === 0) {
    throw new Error("Cannot run draw with no eligible cards")
  }

  if (weights.length === 1) {
    return weights[0].cardId
  }

  // Calculate total weight
  const totalWeight = weights.reduce((sum, w) => sum + w.totalWeight, 0)

  // Generate random number between 0 and totalWeight
  const random = Math.random() * totalWeight

  // Find winner using cumulative weights
  let cumulative = 0
  for (const weight of weights) {
    cumulative += weight.totalWeight
    if (random <= cumulative) {
      return weight.cardId
    }
  }

  // Fallback (should never reach here)
  return weights[weights.length - 1].cardId
}

// ============================================================================
// SEASON CLOSE & WINNER SELECTION
// ============================================================================

/**
 * Get all eligible cards for a season
 */
async function getEligibleCards(
  supabase: SupabaseClient,
  seasonId: string
): Promise<CardSeasonProgress[]> {
  const { data } = await supabase
    .from("card_season_progress")
    .select("*")
    .eq("season_id", seasonId)
    .gte("current_step", cardinSeasonLaw.diamondStep)
    .not("summit_reached_at", "is", null)

  return (data as CardSeasonProgress[]) ?? []
}

/**
 * Update winner eligibility flags for all eligible cards
 */
async function updateWinnerEligibility(
  supabase: SupabaseClient,
  cardId: string,
  seasonId: string,
  data: {
    is_winner_eligible: boolean
    winner_weight: number
    stayed_active_until_close: boolean
  }
): Promise<void> {
  await supabase
    .from("card_season_progress")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("card_id", cardId)
    .eq("season_id", seasonId)
}

/**
 * Close season and select winner
 * Main orchestration function
 */
export async function closeSeasonAndSelectWinner(
  supabase: SupabaseClient,
  seasonId: string
): Promise<WinnerSelectionResult> {
  const now = new Date().toISOString()

  // Get season
  const season = await getSeason(supabase, seasonId)
  if (!season) {
    throw new Error("Season not found")
  }

  if (season.closed_at) {
    throw new Error("Season already closed")
  }

  // Get all eligible cards
  const eligibleCards = await getEligibleCards(supabase, seasonId)

  // Calculate weights for all eligible cards
  const weights: WinnerWeight[] = []

  for (const card of eligibleCards) {
    const weight = await calculateWinnerWeight(supabase, card.card_id, seasonId)
    if (weight) {
      weights.push(weight)

      // Update eligibility flags for audit
      await updateWinnerEligibility(supabase, card.card_id, seasonId, {
        is_winner_eligible: true,
        winner_weight: weight.totalWeight,
        stayed_active_until_close: weight.activeBonus === 1,
      })
    }
  }

  // Handle case with no eligible cards
  if (weights.length === 0) {
    const metadata = {
      totalEligible: 0,
      totalWeight: 0,
      weights: [],
      selectedAt: now,
      algorithm: "weighted_random",
      reason: "no_eligible_cards",
    }

    // Close season with no winner
    await supabase
      .from("seasons")
      .update({
        closed_at: now,
        winner_selection_metadata: metadata,
      })
      .eq("id", seasonId)

    // Update merchant
    await supabase
      .from("merchants")
      .update({
        last_season_closed_at: now,
      })
      .eq("id", season.merchant_id)

    return {
      winnerId: null,
      eligibleCards: [],
      selectionMetadata: metadata,
    }
  }

  // Run weighted draw
  const winnerId = runWeightedDraw(weights)
  const winnerWeight = weights.find((w) => w.cardId === winnerId)

  // Build metadata for audit
  const metadata = {
    totalEligible: weights.length,
    totalWeight: weights.reduce((sum, w) => sum + w.totalWeight, 0),
    weights: weights,
    selectedAt: now,
    algorithm: "weighted_random",
    winner: {
      cardId: winnerId,
      weight: winnerWeight,
    },
  }

  // Close season and record winner
  await supabase
    .from("seasons")
    .update({
      closed_at: now,
      winner_card_id: winnerId,
      winner_selected_at: now,
      winner_selection_metadata: metadata,
    })
    .eq("id", seasonId)

  // Update merchant
  await supabase
    .from("merchants")
    .update({
      last_season_closed_at: now,
    })
    .eq("id", season.merchant_id)

  return {
    winnerId,
    eligibleCards: weights,
    selectionMetadata: metadata,
  }
}

// ============================================================================
// SEASON METRICS
// ============================================================================

/**
 * Get winner pool metrics for a season
 */
export async function getWinnerPoolMetrics(
  supabase: SupabaseClient,
  seasonId: string
): Promise<{
  eligibleCount: number
  totalWeight: number
  averageWeight: number
  hasWinner: boolean
  winnerId: string | null
}> {
  // Get season
  const season = await getSeason(supabase, seasonId)
  if (!season) {
    return {
      eligibleCount: 0,
      totalWeight: 0,
      averageWeight: 0,
      hasWinner: false,
      winnerId: null,
    }
  }

  // Get eligible cards count
  const { count: eligibleCount } = await supabase
    .from("card_season_progress")
    .select("*", { count: "exact", head: true })
    .eq("season_id", seasonId)
    .eq("is_winner_eligible", true)

  // Get total weight
  const { data: progressRecords } = await supabase
    .from("card_season_progress")
    .select("winner_weight")
    .eq("season_id", seasonId)
    .eq("is_winner_eligible", true)

  const totalWeight = (progressRecords ?? []).reduce((sum, p) => sum + (p.winner_weight ?? 0), 0)
  const averageWeight = eligibleCount && eligibleCount > 0 ? totalWeight / eligibleCount : 0

  return {
    eligibleCount: eligibleCount ?? 0,
    totalWeight,
    averageWeight,
    hasWinner: Boolean(season.winner_card_id),
    winnerId: season.winner_card_id,
  }
}
