import type { SupabaseClient } from "@supabase/supabase-js"

import { recomputeCardScoreSnapshot } from "@/lib/cardin-scoring"
import { checkAndActivateReferral, calculateBranchCapacity } from "@/lib/domino-engine"
import { buildMidpointView, getMidpointMode, getMidpointThreshold, getRewardLabel, getTargetVisits, maybeActivateSharedUnlock } from "@/lib/program-layer"
import { handleStamp, getStepDefinition } from "@/lib/season-progression"
import { insertTransactionEvent } from "@/lib/transaction-events"

export type MerchantStampSource = "merchant_panel" | "merchant_validate"

export type RunMerchantStampResult = {
  card: {
    id: string
    customerName: string
    stamps: number
    targetVisits: number
    rewardLabel: string
    midpoint: ReturnType<typeof buildMidpointView>
    status: string
    seasonProgress: {
      currentStep: number
      stepLabel: string
      dominoUnlocked: boolean
      diamondUnlocked: boolean
      summitReached: boolean
      branchesUsed: number
      branchCapacity: number
      directInvitationsActivated: number
      stepIncreased: boolean
      seasonClosed: boolean
    } | null
  }
  merchant: {
    id: string
    businessName: string
    sharedUnlock: Awaited<ReturnType<typeof maybeActivateSharedUnlock>> | null
  }
}

type CardRow = {
  id: string
  merchant_id: string
  customer_name: string
  stamps: number
  target_visits: number | null
  reward_label: string | null
  midpoint_reached_at: string | null
  created_at: string
}

/**
 * Core merchant stamp: increments passage, season progression, transaction event.
 * Caller must enforce auth (card.merchant_id === merchantUserId).
 */
export async function runMerchantStamp(
  supabase: SupabaseClient,
  params: {
    card: CardRow
    merchant: {
      id: string
      name: string
      midpoint_mode: string
      target_visits: number
      reward_label: string
      shared_unlock_enabled: boolean
      shared_unlock_objective: number
      shared_unlock_window_days: number
      shared_unlock_offer: string
      shared_unlock_active_until: string | null
      shared_unlock_last_triggered_period: string | null
    }
    merchantUserId: string
    action?: "stamp" | "redeem"
    idempotencyKey?: string | null
    source: MerchantStampSource
  },
): Promise<RunMerchantStampResult> {
  const action = params.action ?? "stamp"
  const { card, merchant, merchantUserId } = params

  const targetVisits = getTargetVisits(card.target_visits ?? merchant.target_visits)
  const rewardLabel = getRewardLabel(card.reward_label ?? merchant.reward_label)
  const midpointMode = getMidpointMode(merchant.midpoint_mode)
  const midpointThreshold = getMidpointThreshold(targetVisits)
  const nowIso = new Date().toISOString()

  let seasonProgress: Awaited<ReturnType<typeof handleStamp>>["progress"] | null = null
  let stepInfo: {
    previousStep: number
    currentStep: number
    stepIncreased: boolean
    seasonClosed: boolean
    seasonId: string | null
  }

  try {
    const result = await handleStamp(supabase, card.id, card.merchant_id)
    seasonProgress = result.progress
    stepInfo = {
      previousStep: result.previousStep,
      currentStep: result.newStep,
      stepIncreased: result.stepIncreased,
      seasonClosed: result.seasonClosed,
      seasonId: result.season.id,
    }
    if (result.stepIncreased) {
      await checkAndActivateReferral(supabase, card.id, result.season.id, result.newStep)
    }
  } catch (error) {
    console.error("Season progression error:", error)
    seasonProgress = null
    stepInfo = { previousStep: 0, currentStep: 0, stepIncreased: false, seasonClosed: false, seasonId: null }
  }

  const nextStamps = action === "redeem" ? 0 : card.stamps + 1
  const nextMidpointReachedAt =
    action === "redeem"
      ? null
      : card.midpoint_reached_at ?? (nextStamps >= midpointThreshold ? nowIso : null)

  const { data: updatedCard, error: updateError } = await supabase
    .from("cards")
    .update({
      stamps: nextStamps,
      midpoint_reached_at: nextMidpointReachedAt,
      last_merchant_validation_at: nowIso,
    })
    .eq("id", card.id)
    .select("id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at")
    .single()

  if (updateError || !updatedCard) {
    throw new Error(updateError?.message ?? "card_update_failed")
  }

  await insertTransactionEvent(supabase, {
    cardId: updatedCard.id,
    legacyType: action,
    eventType: action,
    seasonId: stepInfo.seasonId,
    stepReached: stepInfo.currentStep > 0 ? stepInfo.currentStep : null,
    source: params.source,
    metadata: {
      stepIncreased: stepInfo.stepIncreased,
      seasonClosed: stepInfo.seasonClosed,
    },
    idempotencyKey: params.idempotencyKey,
    createdBy: merchantUserId,
  })

  const sharedUnlock =
    action === "stamp"
      ? await maybeActivateSharedUnlock(supabase, {
          id: merchant.id,
          midpoint_mode: getMidpointMode(merchant.midpoint_mode),
          target_visits: merchant.target_visits,
          reward_label: merchant.reward_label,
          shared_unlock_enabled: merchant.shared_unlock_enabled,
          shared_unlock_objective: merchant.shared_unlock_objective,
          shared_unlock_window_days: merchant.shared_unlock_window_days,
          shared_unlock_offer: merchant.shared_unlock_offer,
          shared_unlock_active_until: merchant.shared_unlock_active_until,
          shared_unlock_last_triggered_period: merchant.shared_unlock_last_triggered_period,
        })
      : null

  try {
    await recomputeCardScoreSnapshot(supabase, updatedCard.id, { seasonId: stepInfo.seasonId })
  } catch (error) {
    console.error("Failed to recompute score snapshot after stamp:", error)
  }

  const midpoint = buildMidpointView({
    stamps: updatedCard.stamps,
    targetVisits,
    midpointReachedAt: updatedCard.midpoint_reached_at,
    midpointMode,
  })

  const seasonProgressResponse = seasonProgress
    ? {
        currentStep: seasonProgress.current_step,
        stepLabel: getStepDefinition(seasonProgress.current_step).label,
        dominoUnlocked: Boolean(seasonProgress.domino_unlocked_at),
        diamondUnlocked: Boolean(seasonProgress.diamond_unlocked_at),
        summitReached: Boolean(seasonProgress.summit_reached_at),
        branchesUsed: seasonProgress.branches_used,
        branchCapacity: calculateBranchCapacity(seasonProgress),
        directInvitationsActivated: seasonProgress.direct_invitations_activated,
        stepIncreased: stepInfo.stepIncreased,
        seasonClosed: stepInfo.seasonClosed,
      }
    : null

  return {
    card: {
      id: updatedCard.id,
      customerName: updatedCard.customer_name,
      stamps: updatedCard.stamps,
      targetVisits,
      rewardLabel,
      midpoint,
      status: updatedCard.stamps >= targetVisits ? "reward_ready" : "active",
      seasonProgress: seasonProgressResponse,
    },
    merchant: {
      id: merchant.id,
      businessName: merchant.name,
      sharedUnlock,
    },
  }
}

/** 2 hours — merchant cannot validate the same card twice inside this window. */
export const MERCHANT_VALIDATION_COOLDOWN_MS = 2 * 60 * 60 * 1000

export function isWithinMerchantCooldown(lastValidationAt: string | null | undefined): boolean {
  if (!lastValidationAt) return false
  const t = new Date(lastValidationAt).getTime()
  if (Number.isNaN(t)) return false
  return Date.now() - t < MERCHANT_VALIDATION_COOLDOWN_MS
}
