import type { SupabaseClient } from "@supabase/supabase-js"

import { normalizeCardinWorld } from "@/lib/client-parcours-config"
import { buildCardPrimaryMessage } from "@/lib/card-messaging"
import { canInvite, calculateBranchCapacity } from "@/lib/domino-engine"
import { getLandingWorldForProfile, getMerchantProfileFromRaw, normalizeMerchantProfileId } from "@/lib/merchant-profile"
import { buildMidpointView, buildSharedUnlockView, getMidpointMode, getRewardLabel, getTargetVisits, type MidpointMode } from "@/lib/program-layer"
import { cardinSeasonLaw } from "@/lib/season-law"
import { getActiveSeason, getCardSeasonProgress, getStepDefinition } from "@/lib/season-progression"

const VISIT_EVENT_TYPES = new Set(["issued", "stamp", "weak_day_visit"])

type CardRecord = {
  id: string
  merchant_id: string
  customer_name: string
  stamps: number
  target_visits: number | null
  reward_label: string | null
  midpoint_reached_at: string | null
  created_at: string
  card_code: string
  summit_reward_option_id: string | null
  summit_reward_title: string | null
  summit_reward_description: string | null
  summit_reward_usage_remaining: number | null
}

type MerchantRecord = {
  id: string
  name: string
  cardin_world: string | null
  midpoint_mode: MidpointMode | null
  target_visits: number | null
  reward_label: string | null
  shared_unlock_enabled: boolean
  shared_unlock_objective: number
  shared_unlock_window_days: number
  shared_unlock_offer: string
  shared_unlock_active_until: string | null
  shared_unlock_last_triggered_period: string | null
}

type ScoreSnapshotRecord = {
  status_name: string
}

type TransactionRecord = {
  created_at: string
  event_type: string | null
  type: string | null
}

async function buildPublicCardPayload(supabase: SupabaseClient, card: CardRecord) {
  const { data: merchantData } = await supabase
    .from("merchants")
    .select(
      "id, name, cardin_world, midpoint_mode, target_visits, reward_label, shared_unlock_enabled, shared_unlock_objective, shared_unlock_window_days, shared_unlock_offer, shared_unlock_active_until, shared_unlock_last_triggered_period",
    )
    .eq("id", card.merchant_id)
    .single()

  const merchant = (merchantData as MerchantRecord | null) ?? null
  const profileId = normalizeMerchantProfileId(merchant?.cardin_world)
  const profile = getMerchantProfileFromRaw(merchant?.cardin_world)
  const cardinWorld = normalizeCardinWorld(merchant?.cardin_world)
  const targetVisits = getTargetVisits(card.target_visits ?? merchant?.target_visits)

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

  let scoreSnapshot: ScoreSnapshotRecord | null = null
  if (activeSeason) {
    const { data } = await supabase
      .from("score_snapshots")
      .select("status_name")
      .eq("card_id", card.id)
      .eq("season_id", activeSeason.id)
      .maybeSingle()

    scoreSnapshot = (data as ScoreSnapshotRecord | null) ?? null
  }

  const { data: transactionData } = await supabase
    .from("transactions")
    .select("created_at, event_type, type")
    .eq("card_id", card.id)
    .order("created_at", { ascending: false })
    .limit(12)

  const transactions = (transactionData as TransactionRecord[] | null) ?? []
  const lastVisitAt =
    transactions.find((event) => {
      const kind = event.event_type ?? event.type ?? ""
      return VISIT_EVENT_TYPES.has(kind)
    })?.created_at ?? card.created_at

  const message = buildCardPrimaryMessage({
    currentStep: seasonProgress?.current_step ?? null,
    directInvitationsActivated: seasonProgress?.direct_invitations_activated ?? 0,
    inviteEnabled: invite?.enabled ?? false,
    inviteRemainingSlots: invite?.remainingSlots ?? 0,
    lastVisitAt,
    seasonDaysRemaining: seasonInfo?.daysRemaining ?? null,
    sharedUnlockStatus: sharedUnlock?.status ?? null,
    statusName: scoreSnapshot?.status_name ?? null,
    summitReached: Boolean(seasonProgress?.summit_reached_at),
  })

  return {
    ok: true as const,
    card: {
      id: card.id,
      code: card.card_code,
      customerName: card.customer_name,
      stamps: card.stamps,
      targetVisits,
      rewardLabel,
      midpoint,
      status: card.stamps >= targetVisits ? "reward_ready" : "active",
      statusName: scoreSnapshot?.status_name ?? null,
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
      summitReward,
    },
    merchant: merchant
      ? {
          id: merchant.id,
          businessName: merchant.name,
          businessType: profile.businessTypeLabel,
          profileId,
          cardinWorld: getLandingWorldForProfile(profileId) ?? cardinWorld,
          sharedUnlock,
        }
      : null,
    season: seasonInfo,
    invite,
    message,
  }
}

export async function getPublicCardPayloadById(supabase: SupabaseClient, cardId: string) {
  const { data, error } = await supabase
    .from("cards")
    .select(
      "id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at, card_code, summit_reward_option_id, summit_reward_title, summit_reward_description, summit_reward_usage_remaining",
    )
    .eq("id", cardId)
    .single()

  if (error || !data) {
    return null
  }

  return buildPublicCardPayload(supabase, data as CardRecord)
}

export async function getPublicCardPayloadByCode(supabase: SupabaseClient, cardCode: string) {
  const { data, error } = await supabase
    .from("cards")
    .select(
      "id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at, card_code, summit_reward_option_id, summit_reward_title, summit_reward_description, summit_reward_usage_remaining",
    )
    .eq("card_code", cardCode)
    .single()

  if (error || !data) {
    return null
  }

  return buildPublicCardPayload(supabase, data as CardRecord)
}
