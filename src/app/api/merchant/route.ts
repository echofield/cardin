import { NextResponse } from "next/server"

import { getActiveMissionForCard, getMerchantMissionMetrics } from "@/lib/cardin-mission-engine"
import { buildMerchantProtocolSnapshot } from "@/lib/cardin-protocol-runtime"
import { calculateBranchCapacity } from "@/lib/domino-engine"
import { getLandingWorldForProfile, getMerchantProfileFromRaw, normalizeMerchantProfileId } from "@/lib/merchant-profile"
import { buildMidpointView, buildSharedUnlockView, getMidpointMode, getRewardLabel, getTargetVisits } from "@/lib/program-layer"
import { getActiveSeason, getStepDefinition } from "@/lib/season-progression"
import { createClientSupabaseServer } from "@/lib/supabase/server"
import { getWinnerPoolMetrics } from "@/lib/winner-selection"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const supabase = createClientSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const merchantId = url.searchParams.get("merchantId") ?? user.id

  if (merchantId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select(
      "id, name, email, cardin_world, midpoint_mode, target_visits, reward_label, shared_unlock_enabled, shared_unlock_objective, shared_unlock_window_days, shared_unlock_offer, shared_unlock_active_until, shared_unlock_last_triggered_period, parcours_selections, parcours_refinement, created_at",
    )
    .eq("id", merchantId)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
  }

  const profileId = normalizeMerchantProfileId(merchant.cardin_world)
  const profile = getMerchantProfileFromRaw(merchant.cardin_world)
  const targetVisits = getTargetVisits(merchant.target_visits)
  const rewardLabel = getRewardLabel(merchant.reward_label)
  const midpointMode = getMidpointMode(merchant.midpoint_mode)

  const { data: cards, error: cardsError } = await supabase
    .from("cards")
    .select(
      "id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at, summit_reward_option_id, summit_reward_title, summit_reward_description, summit_reward_usage_remaining",
    )
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false })

  if (cardsError) {
    return NextResponse.json({ ok: false, error: cardsError.message }, { status: 500 })
  }

  const cardIds = (cards ?? []).map((card) => card.id)
  const { data: transactions } = cardIds.length
    ? await supabase.from("transactions").select("id, card_id, type, created_at").in("card_id", cardIds)
    : { data: [] as Array<{ id: string; card_id: string; type: string; created_at: string }> }

  const midpointReachedCards = (cards ?? []).filter((card) => {
    const cardTargetVisits = getTargetVisits(card.target_visits ?? targetVisits)
    return buildMidpointView({
      stamps: card.stamps,
      targetVisits: cardTargetVisits,
      midpointReachedAt: card.midpoint_reached_at,
      midpointMode,
    }).reached
  }).length

  const rewardReadyCards = (cards ?? []).filter((card) => card.stamps >= getTargetVisits(card.target_visits ?? targetVisits)).length
  const repeatClients = (cards ?? []).filter((card) => card.stamps > 1).length

  const sharedUnlock = await buildSharedUnlockView(supabase, {
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

  const activeSeason = await getActiveSeason(supabase, merchantId)
  const protocolSnapshot = await buildMerchantProtocolSnapshot(supabase, { merchantId, season: activeSeason })
  const missionMetrics = await getMerchantMissionMetrics(supabase, { merchantId, seasonId: activeSeason?.id ?? null })
  let seasonMetrics = null
  const cardSeasonProgress: Map<string, any> = new Map()
  const activeDiamondTokens: Map<string, number> = new Map()
  const activeMissions: Map<string, Awaited<ReturnType<typeof getActiveMissionForCard>>> = new Map()

  if (activeSeason) {
    const winnerMetrics = await getWinnerPoolMetrics(supabase, activeSeason.id)

    const { data: progressRecords } = await supabase
      .from("card_season_progress")
      .select("current_step, card_id, domino_unlocked_at, diamond_unlocked_at, summit_reached_at, branches_used, total_branch_capacity, direct_invitations_activated")
      .eq("season_id", activeSeason.id)

    const stepDistribution = Array.from({ length: 8 }, (_, i) => ({
      step: i + 1,
      count: 0,
    }))

    let dominoUnlockedCount = 0
    let diamondCount = 0
    let summitCount = 0

    ;(progressRecords ?? []).forEach((progress) => {
      stepDistribution[progress.current_step - 1].count++
      if (progress.domino_unlocked_at) dominoUnlockedCount++
      if (progress.diamond_unlocked_at) diamondCount++
      if (progress.summit_reached_at) summitCount++
      cardSeasonProgress.set(progress.card_id, progress)
    })

    const { count: totalInvitations } = await supabase
      .from("card_referrals")
      .select("*", { count: "exact", head: true })
      .eq("season_id", activeSeason.id)

    const { count: activatedInvitations } = await supabase
      .from("card_referrals")
      .select("*", { count: "exact", head: true })
      .eq("season_id", activeSeason.id)
      .eq("is_activated", true)

    const { data: tokens } = await supabase
      .from("diamond_experience_tokens")
      .select("card_id")
      .eq("season_id", activeSeason.id)
      .eq("status", "available")
      .gt("expires_at", new Date().toISOString())

    ;(tokens ?? []).forEach((token) => {
      activeDiamondTokens.set(token.card_id, (activeDiamondTokens.get(token.card_id) ?? 0) + 1)
    })

    for (const cardId of cardIds) {
      const mission = await getActiveMissionForCard(supabase, cardId)
      if (mission) {
        activeMissions.set(cardId, mission)
      }
    }

    const now = new Date()
    const endsAt = new Date(activeSeason.ends_at)
    const daysRemaining = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    seasonMetrics = {
      seasonId: activeSeason.id,
      seasonNumber: activeSeason.season_number,
      summitTitle: activeSeason.summit_title,
      daysRemaining,
      endsAt: activeSeason.ends_at,
      stepDistribution,
      dominoUnlockedCount,
      diamondCount,
      summitCount,
      totalInvitations: totalInvitations ?? 0,
      activatedInvitations: activatedInvitations ?? 0,
      activationRate: totalInvitations && totalInvitations > 0 ? (activatedInvitations ?? 0) / totalInvitations : 0,
      winnerPool: {
        eligibleCount: winnerMetrics.eligibleCount,
        totalWeight: winnerMetrics.totalWeight,
        averageWeight: winnerMetrics.averageWeight,
        hasWinner: winnerMetrics.hasWinner,
        winnerId: winnerMetrics.winnerId,
      },
    }
  }

  return NextResponse.json({
    ok: true,
    merchant: {
      id: merchant.id,
      businessName: merchant.name,
      businessType: profile.businessTypeLabel,
      profileId,
      city: "France",
      cardinWorld: getLandingWorldForProfile(profileId),
      loyaltyConfig: {
        targetVisits,
        rewardLabel,
        midpointMode,
      },
      sharedUnlock,
      parcoursSelections: (merchant as { parcours_selections?: unknown }).parcours_selections ?? null,
      parcoursRefinement: (merchant as { parcours_refinement?: unknown }).parcours_refinement ?? null,
    },
    metrics: {
      totalCards: cards?.length ?? 0,
      rewardReadyCards,
      totalVisits: transactions?.length ?? 0,
      repeatClients,
      midpointReachedCards,
      missionActiveCount: missionMetrics.activeCount,
      missionCompletedCount: missionMetrics.completedCount,
      missionRevenueEstimate: missionMetrics.revenueEstimate,
      season: seasonMetrics,
    },
    protocol: protocolSnapshot
      ? {
          state: protocolSnapshot.state,
          rewardsPaused: protocolSnapshot.rewardsPaused,
          diamondPaused: protocolSnapshot.diamondPaused,
          seasonObjective: protocolSnapshot.narrative.seasonObjective,
          marginLine: protocolSnapshot.narrative.marginLine,
          diamondLine: protocolSnapshot.narrative.diamondLine,
          growthLine: protocolSnapshot.narrative.growthLine,
          budgets: {
            season: {
              current: protocolSnapshot.actual.seasonExposure,
              limit: protocolSnapshot.config.seasonBudget,
            },
            week: {
              current: protocolSnapshot.actual.rewardCostWeek,
              limit: protocolSnapshot.projected.B_week,
            },
            day: {
              current: protocolSnapshot.actual.rewardCostDay,
              limit: protocolSnapshot.projected.daily_budget_limit,
            },
            diamond: {
              current: protocolSnapshot.actual.diamondCostSeason,
              limit: protocolSnapshot.config.diamond.budget,
            },
          },
          projected: {
            profitIncremental: protocolSnapshot.projected.profitIncremental,
            grossProfitTotal: protocolSnapshot.projected.GP_total,
            rewardCostTotal: protocolSnapshot.projected.RC_total,
            sigmaSeason: protocolSnapshot.projected.sigma_season,
            fieldEnergy: protocolSnapshot.scores.fieldEnergy,
          },
        }
      : null,
    cards: (cards ?? []).map((card) => {
      const cardTargetVisits = getTargetVisits(card.target_visits ?? targetVisits)
      const cardRewardLabel = getRewardLabel(card.reward_label ?? rewardLabel)
      const midpoint = buildMidpointView({
        stamps: card.stamps,
        targetVisits: cardTargetVisits,
        midpointReachedAt: card.midpoint_reached_at,
        midpointMode,
      })
      const progress = cardSeasonProgress.get(card.id)
      const seasonProgress = progress
        ? {
            currentStep: progress.current_step,
            stepLabel: getStepDefinition(progress.current_step).label,
            dominoUnlocked: Boolean(progress.domino_unlocked_at),
            diamondUnlocked: Boolean(progress.diamond_unlocked_at),
            summitReached: Boolean(progress.summit_reached_at),
            branchesUsed: progress.branches_used,
            branchCapacity: calculateBranchCapacity(progress),
            directInvitationsActivated: progress.direct_invitations_activated,
          }
        : null

      const summitReward =
        card.summit_reward_option_id &&
        card.summit_reward_title &&
        card.summit_reward_description != null &&
        typeof card.summit_reward_usage_remaining === "number"
          ? {
              optionId: card.summit_reward_option_id,
              title: card.summit_reward_title,
              description: card.summit_reward_description,
              usageRemaining: card.summit_reward_usage_remaining,
            }
          : null

      return {
        id: card.id,
        customerName: card.customer_name,
        stamps: card.stamps,
        targetVisits: cardTargetVisits,
        rewardLabel: cardRewardLabel,
        status: card.stamps >= cardTargetVisits ? "reward_ready" : "active",
        lastVisitAt: card.created_at,
        midpoint,
        seasonProgress,
        summitReward,
        diamondTokenAvailable: (activeDiamondTokens.get(card.id) ?? 0) > 0,
        mission: activeMissions.get(card.id) ?? null,
      }
    }),
  })
}


