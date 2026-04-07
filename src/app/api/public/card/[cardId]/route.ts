import { NextResponse } from "next/server"

import { canInvite, calculateBranchCapacity } from "@/lib/domino-engine"
import { cardinSeasonLaw } from "@/lib/season-law"
import { getActiveSeason, getCardSeasonProgress, getStepDefinition } from "@/lib/season-progression"
import { buildMidpointView, buildSharedUnlockView, getMidpointMode, getRewardLabel, getTargetVisits } from "@/lib/program-layer"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: { cardId: string } }) {
  try {
    const supabase = createSupabaseServiceClient()

    const { data: card, error } = await supabase
      .from("cards")
      .select("id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at")
      .eq("id", params.cardId)
      .single()

    if (error || !card) {
      return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
    }

    const { data: merchant } = await supabase
      .from("merchants")
      .select(
        "id, name, midpoint_mode, target_visits, reward_label, shared_unlock_enabled, shared_unlock_objective, shared_unlock_window_days, shared_unlock_offer, shared_unlock_active_until, shared_unlock_last_triggered_period"
      )
      .eq("id", card.merchant_id)
      .single()

    const targetVisits = getTargetVisits(card.target_visits ?? merchant?.target_visits)
    const rewardLabel = getRewardLabel(card.reward_label ?? merchant?.reward_label)
    const midpointMode = getMidpointMode(merchant?.midpoint_mode)

    const midpoint = buildMidpointView({
      stamps: card.stamps,
      targetVisits,
      midpointReachedAt: card.midpoint_reached_at,
      midpointMode,
    })

    const sharedUnlock = merchant
      ? await buildSharedUnlockView(supabase, {
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

    const activeSeason = merchant ? await getActiveSeason(supabase, merchant.id) : null
    const seasonProgress = activeSeason ? await getCardSeasonProgress(supabase, card.id, activeSeason.id) : null

    const seasonInfo = activeSeason
      ? {
          id: activeSeason.id,
          number: activeSeason.season_number,
          summitTitle: activeSeason.summit_title,
          daysRemaining: Math.max(0, Math.ceil((new Date(activeSeason.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
          endsAt: activeSeason.ends_at,
        }
      : null

    let invite: {
      enabled: boolean
      reason: string | null
      remainingSlots: number
      branchCapacity: number
    } | null = null

    if (activeSeason && seasonProgress) {
      if (seasonProgress.current_step >= cardinSeasonLaw.dominoStartStep) {
        const result = await canInvite(supabase, card.id, activeSeason.id)
        invite = {
          enabled: result.canInvite,
          reason: result.reason ?? null,
          remainingSlots: result.remainingSlots ?? 0,
          branchCapacity: result.branchCapacity ?? calculateBranchCapacity(seasonProgress),
        }
      } else {
        invite = {
          enabled: false,
          reason: "domino_not_unlocked",
          remainingSlots: 0,
          branchCapacity: 0,
        }
      }
    }

    return NextResponse.json({
      ok: true,
      card: {
        id: card.id,
        customerName: card.customer_name,
        stamps: card.stamps,
        targetVisits,
        rewardLabel,
        midpoint,
        status: card.stamps >= targetVisits ? "reward_ready" : "active",
        seasonProgress: seasonProgress
          ? {
              currentStep: seasonProgress.current_step,
              stepLabel: getStepDefinition(seasonProgress.current_step).label,
              dominoUnlocked: Boolean(seasonProgress.domino_unlocked_at),
              diamondUnlocked: Boolean(seasonProgress.diamond_unlocked_at),
              summitReached: Boolean(seasonProgress.summit_reached_at),
              branchesUsed: seasonProgress.branches_used,
              branchCapacity: calculateBranchCapacity(seasonProgress),
              directInvitationsActivated: seasonProgress.direct_invitations_activated,
            }
          : null,
      },
      merchant: merchant
        ? {
            id: merchant.id,
            businessName: merchant.name,
            businessType: "Commerce",
            sharedUnlock,
          }
        : null,
      season: seasonInfo,
      invite,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
