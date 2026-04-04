import { NextResponse } from "next/server"

import { buildMidpointView, buildSharedUnlockView, getMidpointMode, getRewardLabel, getTargetVisits } from "@/lib/program-layer"
import { createClientSupabaseServer } from "@/lib/supabase/server"

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
      "id, name, email, midpoint_mode, target_visits, reward_label, shared_unlock_enabled, shared_unlock_objective, shared_unlock_window_days, shared_unlock_offer, shared_unlock_active_until, shared_unlock_last_triggered_period, created_at"
    )
    .eq("id", merchantId)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
  }

  const targetVisits = getTargetVisits(merchant.target_visits)
  const rewardLabel = getRewardLabel(merchant.reward_label)
  const midpointMode = getMidpointMode(merchant.midpoint_mode)

  const { data: cards, error: cardsError } = await supabase
    .from("cards")
    .select("id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at")
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

  return NextResponse.json({
    ok: true,
    merchant: {
      id: merchant.id,
      businessName: merchant.name,
      businessType: "Commerce",
      city: "France",
      loyaltyConfig: {
        targetVisits,
        rewardLabel,
        midpointMode,
      },
      sharedUnlock,
    },
    metrics: {
      totalCards: cards?.length ?? 0,
      rewardReadyCards,
      totalVisits: transactions?.length ?? 0,
      repeatClients,
      midpointReachedCards,
    },
    cards: (cards ?? []).map((card) => {
      const cardTargetVisits = getTargetVisits(card.target_visits ?? targetVisits)
      const cardRewardLabel = getRewardLabel(card.reward_label ?? rewardLabel)
      const midpoint = buildMidpointView({
        stamps: card.stamps,
        targetVisits: cardTargetVisits,
        midpointReachedAt: card.midpoint_reached_at,
        midpointMode,
      })

      return {
        id: card.id,
        customerName: card.customer_name,
        stamps: card.stamps,
        targetVisits: cardTargetVisits,
        rewardLabel: cardRewardLabel,
        status: card.stamps >= cardTargetVisits ? "reward_ready" : "active",
        lastVisitAt: card.created_at,
        midpoint,
      }
    }),
  })
}
