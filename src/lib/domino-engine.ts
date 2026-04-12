import type { SupabaseClient } from "@supabase/supabase-js"

import { hasCardEarnedDiamondRights, maybeLogPropagationCredit, getMerchantProtocolSettings } from "./cardin-protocol-runtime"
import { recomputeCardScoreSnapshot } from "./cardin-scoring"
import { cardinSeasonLaw } from "./season-law"
import type { CardSeasonProgress, Season } from "./season-progression"
import { getCardSeasonProgress, validateSeasonActive } from "./season-progression"
import { insertTransactionEvent } from "./transaction-events"

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

export function calculateBranchCapacity(progress: CardSeasonProgress, maxInvites = 2): number {
  if (progress.current_step < cardinSeasonLaw.dominoStartStep) {
    return 0
  }

  return Math.max(0, maxInvites)
}

export function calculateRemainingSlots(progress: CardSeasonProgress, maxInvites = 2): number {
  const capacity = calculateBranchCapacity(progress, maxInvites)
  return Math.max(0, capacity - progress.branches_used)
}

export async function canInvite(
  supabase: SupabaseClient,
  parentCardId: string,
  seasonId: string,
): Promise<CanInviteResult> {
  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id, merchant_id, closed_at")
    .eq("id", seasonId)
    .single()

  if (seasonError || !season) {
    return { canInvite: false, reason: "season_not_found" }
  }

  if (!validateSeasonActive(season as Season)) {
    return { canInvite: false, reason: "season_closed" }
  }

  const progress = await getCardSeasonProgress(supabase, parentCardId, seasonId)
  if (!progress) {
    return { canInvite: false, reason: "progress_not_found" }
  }

  if (progress.current_step < cardinSeasonLaw.dominoStartStep) {
    return { canInvite: false, reason: "domino_not_unlocked", branchCapacity: 0, remainingSlots: 0 }
  }

  const earnedDiamond = await hasCardEarnedDiamondRights(supabase, parentCardId)
  if (!earnedDiamond) {
    return { canInvite: false, reason: "diamond_not_earned", branchCapacity: 0, remainingSlots: 0 }
  }

  const settings = await getMerchantProtocolSettings(supabase, season.merchant_id)
  const maxInvites = settings?.config.funnel.maxInvites ?? 2
  const capacity = calculateBranchCapacity(progress, maxInvites)
  const remaining = calculateRemainingSlots(progress, maxInvites)

  if (remaining <= 0) {
    return { canInvite: false, reason: "branch_limit_reached", branchCapacity: capacity, remainingSlots: 0 }
  }

  return { canInvite: true, remainingSlots: remaining, branchCapacity: capacity }
}

export async function createInvitation(
  supabase: SupabaseClient,
  parentCardId: string,
  seasonId: string,
  childCustomerName: string,
  merchantId: string,
): Promise<InvitationResult> {
  const validation = await canInvite(supabase, parentCardId, seasonId)
  if (!validation.canInvite) {
    return {
      success: false,
      error: validation.reason ?? "unknown_error",
    }
  }

  const parentProgress = await getCardSeasonProgress(supabase, parentCardId, seasonId)
  if (!parentProgress) {
    return { success: false, error: "parent_progress_not_found" }
  }

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
      stamps: 1,
      target_visits: merchant?.target_visits ?? 10,
      reward_label: merchant?.reward_label ?? "1 recompense offerte",
      current_season_id: seasonId,
    })
    .select()
    .single()

  if (cardError || !childCard) {
    return { success: false, error: `Failed to create card: ${cardError?.message}` }
  }

  await insertTransactionEvent(supabase, {
    cardId: childCard.id,
    legacyType: "issued",
    eventType: "issued",
    seasonId,
    stepReached: 1,
    source: "invite",
    metadata: { invitedBy: parentCardId },
  })

  await supabase.from("card_season_progress").insert({
    card_id: childCard.id,
    season_id: seasonId,
    current_step: 1,
    step_reached_at: new Date().toISOString(),
    total_branch_capacity: validation.branchCapacity ?? 0,
  })

  const { data: referral, error: referralError } = await supabase
    .from("card_referrals")
    .insert({
      season_id: seasonId,
      parent_card_id: parentCardId,
      child_card_id: childCard.id,
      branch_level: 1,
      is_activated: false,
    })
    .select()
    .single()

  if (referralError || !referral) {
    await supabase.from("cards").delete().eq("id", childCard.id)
    return { success: false, error: `Failed to create referral: ${referralError?.message}` }
  }

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

  return {
    success: true,
    childCard: {
      id: childCard.id,
      customer_name: childCard.customer_name,
    },
    referral: referral as CardReferral,
    remainingSlots: Math.max(0, (validation.remainingSlots ?? 0) - 1),
  }
}

export async function getReferralByChildCard(
  supabase: SupabaseClient,
  childCardId: string,
  seasonId: string,
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

export async function activateReferral(
  supabase: SupabaseClient,
  referralId: string,
  parentCardId: string,
  seasonId: string,
): Promise<void> {
  const now = new Date().toISOString()

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

  const parentProgress = await getCardSeasonProgress(supabase, parentCardId, seasonId)
  if (!parentProgress) {
    console.error("Parent progress not found for activation")
    return
  }

  const { data: parentCard } = await supabase.from("cards").select("merchant_id").eq("id", parentCardId).maybeSingle()
  const settings = parentCard ? await getMerchantProtocolSettings(supabase, parentCard.merchant_id) : null
  const maxInvites = settings?.config.funnel.maxInvites ?? 2

  const { error: updateError } = await supabase
    .from("card_season_progress")
    .update({
      direct_invitations_activated: parentProgress.direct_invitations_activated + 1,
      total_branch_capacity: calculateBranchCapacity(parentProgress, maxInvites),
      updated_at: now,
    })
    .eq("card_id", parentCardId)
    .eq("season_id", seasonId)

  if (updateError) {
    console.error("Failed to update parent activation count:", updateError)
  }

  if (parentCard?.merchant_id) {
    await maybeLogPropagationCredit(supabase, {
      merchantId: parentCard.merchant_id,
      seasonId,
      parentCardId,
    })

    try {
      await recomputeCardScoreSnapshot(supabase, parentCardId, { seasonId })
    } catch (error) {
      console.error("Failed to recompute score snapshot after referral activation:", error)
    }
  }
}

export async function checkAndActivateReferral(
  supabase: SupabaseClient,
  childCardId: string,
  seasonId: string,
  newStep: number,
): Promise<void> {
  if (newStep !== 2) {
    return
  }

  const referral = await getReferralByChildCard(supabase, childCardId, seasonId)
  if (!referral || referral.is_activated) {
    return
  }

  await activateReferral(supabase, referral.id, referral.parent_card_id, seasonId)
}

export async function getSeasonInvitationMetrics(
  supabase: SupabaseClient,
  seasonId: string,
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
  return {
    totalInvitations: total,
    activatedInvitations: activated,
    activationRate: total > 0 ? activated / total : 0,
  }
}
