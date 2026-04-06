import type { SupabaseClient } from "@supabase/supabase-js"
import { cardinSeasonLaw } from "./season-law"
import type { CardSeasonProgress, Season } from "./season-progression"
import { getCardSeasonProgress, validateSeasonActive } from "./season-progression"

// ============================================================================
// TYPES
// ============================================================================

export type CardReferral = {
  id: string
  season_id: string
  parent_card_id: string
  child_card_id: string
  invited_at: string
  activation_visit_at: string | null
  is_activated: boolean
  branch_level: number
  created_at: string
}

export type InvitationResult = {
  success: boolean
  childCard?: {
    id: string
    customer_name: string
  }
  referral?: CardReferral
  remainingSlots?: number
  error?: string
}

export type CanInviteResult = {
  canInvite: boolean
  reason?: string
  remainingSlots?: number
  branchCapacity?: number
}

// ============================================================================
// BRANCH CAPACITY CALCULATION
// ============================================================================

/**
 * Calculate branch capacity based on current step and activations
 *
 * Domino (step 5-6): 2 direct slots
 * Diamond (step 7+):  2 direct + 1 per activated child (max 5 total)
 */
export function calculateBranchCapacity(progress: CardSeasonProgress): number {
  const { current_step, direct_invitations_activated } = progress

  if (current_step < cardinSeasonLaw.dominoStartStep) {
    return 0 // Not yet Domino
  }

  if (current_step < cardinSeasonLaw.diamondStep) {
    // Domino level: fixed 2 direct slots
    return cardinSeasonLaw.directDominoBranches
  }

  // Diamond level: 2 direct + 1 per activated child
  const directSlots = cardinSeasonLaw.directDominoBranches
  const secondRingSlots = direct_invitations_activated * cardinSeasonLaw.secondRingBranches

  // Cap at maxReachPerStrongCard from season law
  return Math.min(directSlots + secondRingSlots, cardinSeasonLaw.maxReachPerStrongCard)
}

/**
 * Calculate remaining invitation slots
 */
export function calculateRemainingSlots(progress: CardSeasonProgress): number {
  const capacity = calculateBranchCapacity(progress)
  const used = progress.branches_used
  return Math.max(0, capacity - used)
}

// ============================================================================
// INVITATION VALIDATION
// ============================================================================

/**
 * Check if a card can create invitations
 */
export async function canInvite(
  supabase: SupabaseClient,
  parentCardId: string,
  seasonId: string
): Promise<CanInviteResult> {
  // Get season
  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("*")
    .eq("id", seasonId)
    .single()

  if (seasonError || !season) {
    return { canInvite: false, reason: "season_not_found" }
  }

  // Check season is active
  if (!validateSeasonActive(season as Season)) {
    return { canInvite: false, reason: "season_closed" }
  }

  // Get parent progress
  const progress = await getCardSeasonProgress(supabase, parentCardId, seasonId)

  if (!progress) {
    return { canInvite: false, reason: "progress_not_found" }
  }

  // Check parent has unlocked Domino (step 5+)
  if (progress.current_step < cardinSeasonLaw.dominoStartStep) {
    return { canInvite: false, reason: "domino_not_unlocked" }
  }

  // Check capacity
  const capacity = calculateBranchCapacity(progress)
  const remaining = calculateRemainingSlots(progress)

  if (remaining <= 0) {
    return { canInvite: false, reason: "branch_limit_reached", branchCapacity: capacity }
  }

  return { canInvite: true, remainingSlots: remaining, branchCapacity: capacity }
}

// ============================================================================
// INVITATION CREATION
// ============================================================================

/**
 * Create an invitation (child card + referral record)
 */
export async function createInvitation(
  supabase: SupabaseClient,
  parentCardId: string,
  seasonId: string,
  childCustomerName: string,
  merchantId: string
): Promise<InvitationResult> {
  // Validate parent can invite
  const validation = await canInvite(supabase, parentCardId, seasonId)

  if (!validation.canInvite) {
    return {
      success: false,
      error: validation.reason ?? "unknown_error",
    }
  }

  // Get parent progress to determine branch level
  const parentProgress = await getCardSeasonProgress(supabase, parentCardId, seasonId)
  if (!parentProgress) {
    return { success: false, error: "parent_progress_not_found" }
  }

  // Determine branch level (1 = direct from Diamond, 2 = second ring)
  const branchLevel = 1 // For now, all invitations are direct

  // Create child card
  const { data: season } = await supabase
    .from("seasons")
    .select("merchant_id")
    .eq("id", seasonId)
    .single()

  if (!season) {
    return { success: false, error: "season_not_found" }
  }

  // Get merchant config for default values
  const { data: merchant } = await supabase
    .from("merchants")
    .select("target_visits, reward_label")
    .eq("id", merchantId)
    .single()

  const { data: childCard, error: cardError } = await supabase
    .from("cards")
    .insert({
      merchant_id: merchantId,
      customer_name: childCustomerName,
      stamps: 1, // Initial visit
      target_visits: merchant?.target_visits ?? 10,
      reward_label: merchant?.reward_label ?? "1 recompense offerte",
      current_season_id: seasonId,
    })
    .select()
    .single()

  if (cardError || !childCard) {
    return { success: false, error: `Failed to create card: ${cardError?.message}` }
  }

  // Create initial transaction for child card
  await supabase.from("transactions").insert({
    card_id: childCard.id,
    type: "issued",
    season_id: seasonId,
    step_reached: 1,
  })

  // Create card season progress for child
  await supabase.from("card_season_progress").insert({
    card_id: childCard.id,
    season_id: seasonId,
    current_step: 1,
    step_reached_at: new Date().toISOString(),
  })

  // Create referral record
  const { data: referral, error: referralError } = await supabase
    .from("card_referrals")
    .insert({
      season_id: seasonId,
      parent_card_id: parentCardId,
      child_card_id: childCard.id,
      branch_level: branchLevel,
      is_activated: false,
    })
    .select()
    .single()

  if (referralError || !referral) {
    // Rollback card creation if referral fails
    await supabase.from("cards").delete().eq("id", childCard.id)
    return { success: false, error: `Failed to create referral: ${referralError?.message}` }
  }

  // Increment parent's branch usage
  const { error: updateError } = await supabase
    .from("card_season_progress")
    .update({
      branches_used: parentProgress.branches_used + 1,
      direct_invitations_count: parentProgress.direct_invitations_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("card_id", parentCardId)
    .eq("season_id", seasonId)

  if (updateError) {
    console.error("Failed to update parent branch usage:", updateError)
  }

  // Calculate new remaining slots
  const newRemaining = validation.remainingSlots! - 1

  return {
    success: true,
    childCard: {
      id: childCard.id,
      customer_name: childCard.customer_name,
    },
    referral: referral as CardReferral,
    remainingSlots: newRemaining,
  }
}

// ============================================================================
// ACTIVATION TRACKING
// ============================================================================

/**
 * Check if a card was invited (is a child in referrals)
 */
export async function getReferralByChildCard(
  supabase: SupabaseClient,
  childCardId: string,
  seasonId: string
): Promise<CardReferral | null> {
  const { data, error } = await supabase
    .from("card_referrals")
    .select("*")
    .eq("child_card_id", childCardId)
    .eq("season_id", seasonId)
    .single()

  if (error || !data) {
    return null
  }

  return data as CardReferral
}

/**
 * Activate a referral when child reaches step 2
 * This triggers Domino credit for the parent card
 */
export async function activateReferral(
  supabase: SupabaseClient,
  referralId: string,
  parentCardId: string,
  seasonId: string
): Promise<void> {
  const now = new Date().toISOString()

  // Mark referral as activated
  const { error: referralError } = await supabase
    .from("card_referrals")
    .update({
      is_activated: true,
      activation_visit_at: now,
    })
    .eq("id", referralId)

  if (referralError) {
    console.error("Failed to activate referral:", referralError)
    throw new Error(`Failed to activate referral: ${referralError.message}`)
  }

  // Increment parent's activation count
  const parentProgress = await getCardSeasonProgress(supabase, parentCardId, seasonId)

  if (!parentProgress) {
    console.error("Parent progress not found for activation")
    return
  }

  const newActivatedCount = parentProgress.direct_invitations_activated + 1

  // Update parent progress
  const updates: any = {
    direct_invitations_activated: newActivatedCount,
    updated_at: now,
  }

  // If parent is Diamond, recalculate branch capacity
  if (parentProgress.current_step >= cardinSeasonLaw.diamondStep) {
    // Update branch capacity calculation
    const updatedProgress = { ...parentProgress, direct_invitations_activated: newActivatedCount }
    updates.total_branch_capacity = calculateBranchCapacity(updatedProgress)
  }

  const { error: updateError } = await supabase
    .from("card_season_progress")
    .update(updates)
    .eq("card_id", parentCardId)
    .eq("season_id", seasonId)

  if (updateError) {
    console.error("Failed to update parent activation count:", updateError)
  }
}

/**
 * Check for referral activation on step 2 reach
 * Called from stamp handler when card reaches step 2
 */
export async function checkAndActivateReferral(
  supabase: SupabaseClient,
  childCardId: string,
  seasonId: string,
  newStep: number
): Promise<void> {
  // Only activate when reaching step 2
  if (newStep !== 2) {
    return
  }

  // Check if this card was invited
  const referral = await getReferralByChildCard(supabase, childCardId, seasonId)

  if (!referral) {
    return // Not an invited card
  }

  if (referral.is_activated) {
    return // Already activated
  }

  // Activate the referral
  await activateReferral(supabase, referral.id, referral.parent_card_id, seasonId)
}

// ============================================================================
// BRANCH METRICS
// ============================================================================

/**
 * Get invitation metrics for a season
 */
export async function getSeasonInvitationMetrics(
  supabase: SupabaseClient,
  seasonId: string
): Promise<{
  totalInvitations: number
  activatedInvitations: number
  activationRate: number
}> {
  const { count: totalCount } = await supabase
    .from("card_referrals")
    .select("*", { count: "exact", head: true })
    .eq("season_id", seasonId)

  const { count: activatedCount } = await supabase
    .from("card_referrals")
    .select("*", { count: "exact", head: true })
    .eq("season_id", seasonId)
    .eq("is_activated", true)

  const total = totalCount ?? 0
  const activated = activatedCount ?? 0
  const rate = total > 0 ? activated / total : 0

  return {
    totalInvitations: total,
    activatedInvitations: activated,
    activationRate: rate,
  }
}
