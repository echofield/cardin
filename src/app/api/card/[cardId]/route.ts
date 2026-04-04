import { NextResponse } from "next/server"

import { buildMidpointView, buildSharedUnlockView, getMidpointMode, getRewardLabel, getTargetVisits } from "@/lib/program-layer"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: { cardId: string } }) {
  const supabase = createClientSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const { data: card, error } = await supabase
    .from("cards")
    .select("id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at")
    .eq("id", params.cardId)
    .single()

  if (error || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  if (card.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
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
    },
    merchant: merchant
      ? {
          id: merchant.id,
          businessName: merchant.name,
          businessType: "Commerce",
          sharedUnlock,
        }
      : null,
  })
}
