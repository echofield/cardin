import { NextResponse } from "next/server"

import { buildMidpointView, getMidpointMode, getMidpointThreshold, getRewardLabel, getTargetVisits, maybeActivateSharedUnlock } from "@/lib/program-layer"
import { createClientSupabaseServer } from "@/lib/supabase/server"
import { handleStamp, getStepDefinition, calculateStep } from "@/lib/season-progression"
import { checkAndActivateReferral, calculateBranchCapacity } from "@/lib/domino-engine"

export const dynamic = "force-dynamic"

type StampPayload = {
  action?: "stamp" | "redeem"
}

export async function POST(request: Request, { params }: { params: { cardId: string } }) {
  const supabase = createClientSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select("id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at")
    .eq("id", params.cardId)
    .single()

  if (cardError || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  if (card.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select(
      "id, name, midpoint_mode, target_visits, reward_label, shared_unlock_enabled, shared_unlock_objective, shared_unlock_window_days, shared_unlock_offer, shared_unlock_active_until, shared_unlock_last_triggered_period"
    )
    .eq("id", card.merchant_id)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
  }

  let payload: StampPayload = {}

  try {
    payload = (await request.json()) as StampPayload
  } catch {
    payload = {}
  }

  const action = payload.action ?? "stamp"
  const targetVisits = getTargetVisits(card.target_visits ?? merchant.target_visits)
  const rewardLabel = getRewardLabel(card.reward_label ?? merchant.reward_label)
  const midpointMode = getMidpointMode(merchant.midpoint_mode)
  const midpointThreshold = getMidpointThreshold(targetVisits)

  const nowIso = new Date().toISOString()

  // Handle season progression (check close, update step, track progress)
  let seasonProgress
  let stepInfo
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

    // Check for referral activation if step increased
    if (result.stepIncreased) {
      await checkAndActivateReferral(supabase, card.id, result.season.id, result.newStep)
    }
  } catch (error) {
    console.error("Season progression error:", error)
    // Continue with legacy stamp logic if season system fails
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
    })
    .eq("id", card.id)
    .select("id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at")
    .single()

  if (updateError || !updatedCard) {
    return NextResponse.json({ ok: false, error: updateError?.message ?? "card_update_failed" }, { status: 500 })
  }

  const { error: txError } = await supabase.from("transactions").insert({
    card_id: updatedCard.id,
    type: action,
    season_id: stepInfo.seasonId,
    step_reached: stepInfo.currentStep > 0 ? stepInfo.currentStep : null,
  })

  if (txError) {
    return NextResponse.json({ ok: false, error: txError.message }, { status: 500 })
  }

  const sharedUnlock = action === "stamp"
    ? await maybeActivateSharedUnlock(supabase, {
        id: merchant.id,
        midpoint_mode: merchant.midpoint_mode,
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

  const midpoint = buildMidpointView({
    stamps: updatedCard.stamps,
    targetVisits,
    midpointReachedAt: updatedCard.midpoint_reached_at,
    midpointMode,
  })

  // Build season progress response
  const seasonProgressResponse = seasonProgress ? {
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
  } : null

  return NextResponse.json({
    ok: true,
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
  })
}
