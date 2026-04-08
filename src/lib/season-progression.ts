import type { SupabaseClient } from "@supabase/supabase-js"
import { buildDefaultSeasonScoringConfig, mapScenarioIdToStrategyMode, normalizeActivityType } from "./cardin-scoring"
import { cardinSeasonLaw } from "./season-law"
// ============================================================================
// TYPES
// ============================================================================

export type StepDefinition = {
  step: number
  minVisits: number
  label: string
  unlocks: string[]
}

export type CardSeasonProgress = {
  id: string
  card_id: string
  season_id: string
  current_step: number
  step_reached_at: string
  domino_unlocked_at: string | null
  direct_invitations_count: number
  direct_invitations_activated: number
  diamond_unlocked_at: string | null
  total_branch_capacity: number
  branches_used: number
  summit_reached_at: string | null
  is_winner_eligible: boolean
  winner_weight: number
  stayed_active_until_close: boolean
  created_at: string
  updated_at: string
}

export type Season = {
  id: string
  merchant_id: string
  season_number: number
  season_length: number
  summit_id: string
  summit_title: string
  started_at: string
  ends_at: string
  closed_at: string | null
  winner_card_id: string | null
  winner_selected_at: string | null
  winner_selection_metadata: any
  scoring_weights: Record<string, unknown> | null
  status_thresholds: Record<string, unknown> | null
  journey_config: Record<string, unknown> | null
  created_at: string
}
// ============================================================================
// STEP DEFINITIONS
// ============================================================================

export const STEP_DEFINITIONS: StepDefinition[] = [
  { step: 1, minVisits: 1, label: "Decouverte", unlocks: [] },
  { step: 2, minVisits: 2, label: "Activation", unlocks: ["Card becomes active", "Referral credit triggers"] },
  { step: 3, minVisits: 3, label: "Engagement", unlocks: [] },
  { step: 4, minVisits: 4, label: "Fidelite", unlocks: [] },
  { step: 5, minVisits: 5, label: "Domino", unlocks: ["Invitation capability (2 slots)"] },
  { step: 6, minVisits: 6, label: "Ambassadeur", unlocks: [] },
  { step: 7, minVisits: 7, label: "Diamond", unlocks: ["Enhanced branching (dynamic slots)"] },
  { step: 8, minVisits: 8, label: "Summit", unlocks: ["Winner pool eligibility"] },
]

// ============================================================================
// STEP CALCULATION
// ============================================================================

/**
 * Calculate step based on visit count in current season
 * Step N requires N visits, capped at 8
 */
export function calculateStep(visitsInSeason: number): number {
  if (!Number.isFinite(visitsInSeason) || visitsInSeason < 1) {
    return 1
  }

  // Find highest step where minVisits requirement is met
  for (let i = STEP_DEFINITIONS.length - 1; i >= 0; i--) {
    if (visitsInSeason >= STEP_DEFINITIONS[i].minVisits) {
      return STEP_DEFINITIONS[i].step
    }
  }

  return 1
}

/**
 * Get step definition by step number
 */
export function getStepDefinition(step: number): StepDefinition {
  return STEP_DEFINITIONS.find((d) => d.step === step) ?? STEP_DEFINITIONS[0]
}

// ============================================================================
// SEASON QUERIES
// ============================================================================

/**
 * Get active season for a merchant
 */
export async function getActiveSeason(
  supabase: SupabaseClient,
  merchantId: string
): Promise<Season | null> {
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("merchant_id", merchantId)
    .is("closed_at", null)
    .order("season_number", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return data as Season
}

/**
 * Get season by ID
 */
export async function getSeason(
  supabase: SupabaseClient,
  seasonId: string
): Promise<Season | null> {
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("id", seasonId)
    .single()

  if (error || !data) {
    return null
  }

  return data as Season
}

/**
 * Check if season should be closed (ends_at has passed)
 */
export function shouldCloseSeason(season: Season): boolean {
  if (season.closed_at) return false // Already closed
  const now = new Date()
  const endsAt = new Date(season.ends_at)
  return now >= endsAt
}

// ============================================================================
// CARD SEASON PROGRESS QUERIES
// ============================================================================

/**
 * Get card season progress
 */
export async function getCardSeasonProgress(
  supabase: SupabaseClient,
  cardId: string,
  seasonId: string
): Promise<CardSeasonProgress | null> {
  const { data, error } = await supabase
    .from("card_season_progress")
    .select("*")
    .eq("card_id", cardId)
    .eq("season_id", seasonId)
    .single()

  if (error || !data) {
    return null
  }

  return data as CardSeasonProgress
}

/**
 * Get or create card season progress
 */
export async function getOrCreateCardSeasonProgress(
  supabase: SupabaseClient,
  cardId: string,
  seasonId: string
): Promise<CardSeasonProgress> {
  // Try to get existing
  let progress = await getCardSeasonProgress(supabase, cardId, seasonId)

  if (progress) {
    return progress
  }

  // Create new progress record
  const { data, error } = await supabase
    .from("card_season_progress")
    .insert({
      card_id: cardId,
      season_id: seasonId,
      current_step: 1,
      step_reached_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to create card season progress: ${error?.message}`)
  }

  return data as CardSeasonProgress
}

/**
 * Count visits for a card in a season
 */
export async function countSeasonVisits(
  supabase: SupabaseClient,
  cardId: string,
  seasonId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("card_id", cardId)
    .eq("season_id", seasonId)
    .in("type", ["issued", "stamp"])

  if (error) {
    console.error("Error counting season visits:", error)
    return 0
  }

  return count ?? 0
}

// ============================================================================
// STEP PROGRESSION LOGIC
// ============================================================================

/**
 * Update card step and trigger unlocks
 */
export async function updateCardStep(
  supabase: SupabaseClient,
  cardId: string,
  seasonId: string,
  newStep: number
): Promise<CardSeasonProgress> {
  const now = new Date().toISOString()

  // Build update object based on step
  const updates: any = {
    current_step: newStep,
    step_reached_at: now,
    updated_at: now,
  }

  // Unlock Domino at step 5
  if (newStep === cardinSeasonLaw.dominoStartStep) {
    updates.domino_unlocked_at = now
    updates.total_branch_capacity = cardinSeasonLaw.directDominoBranches
  }

  // Unlock Diamond at step 7
  if (newStep === cardinSeasonLaw.diamondStep) {
    updates.diamond_unlocked_at = now
    // Branch capacity will be recalculated dynamically
  }

  // Unlock Summit at step 8
  if (newStep === cardinSeasonLaw.summitStep) {
    updates.summit_reached_at = now
  }

  const { data, error } = await supabase
    .from("card_season_progress")
    .update(updates)
    .eq("card_id", cardId)
    .eq("season_id", seasonId)
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to update card step: ${error?.message}`)
  }

  return data as CardSeasonProgress
}

/**
 * Main stamp handler - orchestrates season progression
 */
export async function handleStamp(
  supabase: SupabaseClient,
  cardId: string,
  merchantId: string
): Promise<{
  season: Season
  progress: CardSeasonProgress
  previousStep: number
  newStep: number
  stepIncreased: boolean
  seasonClosed: boolean
}> {
  // Get active season
  let season = await getActiveSeason(supabase, merchantId)

  if (!season) {
    throw new Error("No active season found for merchant")
  }

  // Check if season should close
  let seasonClosed = false
  if (shouldCloseSeason(season)) {
    // Import winner-selection dynamically to avoid circular dependency
    const { closeSeasonAndSelectWinner } = await import("./winner-selection")
    await closeSeasonAndSelectWinner(supabase, season.id)
    seasonClosed = true

    // Start new season
    season = await startNewSeason(supabase, merchantId, season)
  }

  // Get or create progress for this card
  const progress = await getOrCreateCardSeasonProgress(supabase, cardId, season.id)
  const previousStep = progress.current_step

  // Count visits in current season
  const visitsInSeason = await countSeasonVisits(supabase, cardId, season.id)

  // Calculate new step
  const newStep = calculateStep(visitsInSeason)
  const stepIncreased = newStep > previousStep

  // Update step if increased
  let updatedProgress = progress
  if (stepIncreased) {
    updatedProgress = await updateCardStep(supabase, cardId, season.id, newStep)
  }

  return {
    season,
    progress: updatedProgress,
    previousStep,
    newStep,
    stepIncreased,
    seasonClosed,
  }
}

// ============================================================================
// SEASON LIFECYCLE
// ============================================================================

/**
 * Start a new season for a merchant
 */
export async function startNewSeason(
  supabase: SupabaseClient,
  merchantId: string,
  previousSeason?: Season
): Promise<Season> {
  const now = new Date()
  const seasonNumber = previousSeason ? previousSeason.season_number + 1 : 1

  const seasonLength = previousSeason?.season_length ?? 3
  const endsAt = new Date(now)
  endsAt.setMonth(endsAt.getMonth() + seasonLength)

  let summitId = previousSeason?.summit_id ?? "default-summit"
  let summitTitle = previousSeason?.summit_title ?? "Premiere saison"
  let scoringWeights = previousSeason?.scoring_weights ?? null
  let statusThresholds = previousSeason?.status_thresholds ?? null
  let journeyConfig = previousSeason?.journey_config ?? null

  if (!previousSeason) {
    const { data: launchIntent } = await supabase
      .from("merchant_launch_intents")
      .select("activity_template_id, scenario_id, summit_id, summit_title")
      .eq("merchant_id", merchantId)
      .maybeSingle()

    const activityType = normalizeActivityType(launchIntent?.activity_template_id)
    const strategyMode = mapScenarioIdToStrategyMode(launchIntent?.scenario_id)
    const defaults = buildDefaultSeasonScoringConfig(activityType, strategyMode)

    summitId = launchIntent?.summit_id ?? summitId
    summitTitle = launchIntent?.summit_title ?? summitTitle
    scoringWeights = defaults.scoringWeights
    statusThresholds = defaults.statusThresholds
    journeyConfig = defaults.journeyConfig
  }

  const { data, error } = await supabase
    .from("seasons")
    .insert({
      merchant_id: merchantId,
      season_number: seasonNumber,
      season_length: seasonLength,
      summit_id: summitId,
      summit_title: summitTitle,
      started_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
      scoring_weights: scoringWeights ?? {},
      status_thresholds: statusThresholds ?? { warming: 20, active: 40, rising: 60, diamond: 80 },
      journey_config: journeyConfig ?? {
        stepCount: cardinSeasonLaw.stepCount,
        dominoStartStep: cardinSeasonLaw.dominoStartStep,
        diamondStep: cardinSeasonLaw.diamondStep,
        summitStep: cardinSeasonLaw.summitStep,
        activityType: "boulangerie",
        strategyMode: "frequency",
      },
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to create new season: ${error?.message}`)
  }

  const newSeason = data as Season

  // Create fresh progress records for all existing cards
  const { data: cards } = await supabase
    .from("cards")
    .select("id")
    .eq("merchant_id", merchantId)

  if (cards && cards.length > 0) {
    const progressRecords = cards.map((card) => ({
      card_id: card.id,
      season_id: newSeason.id,
      current_step: 1,
      step_reached_at: now.toISOString(),
    }))

    await supabase.from("card_season_progress").insert(progressRecords)
    await supabase.from("cards").update({ current_season_id: newSeason.id }).eq("merchant_id", merchantId)
  }

  // Update merchant's current season
  await supabase
    .from("merchants")
    .update({
      current_season_number: seasonNumber,
    })
    .eq("id", merchantId)

  return newSeason
}

/**
 * Validate season is active (not closed)
 */
export function validateSeasonActive(season: Season): boolean {
  return !season.closed_at
}


/**
 * Attach a card to the current active season when one exists.
 */
export async function initializeCardForActiveSeason(
  supabase: SupabaseClient,
  cardId: string,
  merchantId: string
): Promise<Season | null> {
  const activeSeason = await getActiveSeason(supabase, merchantId)

  if (!activeSeason) {
    return null
  }

  await supabase
    .from("cards")
    .update({ current_season_id: activeSeason.id })
    .eq("id", cardId)

  await getOrCreateCardSeasonProgress(supabase, cardId, activeSeason.id)

  return activeSeason
}