import { NextResponse } from "next/server"

import { buildMidpointView, getMidpointMode, getMidpointThreshold, getRewardLabel, getTargetVisits, maybeActivateSharedUnlock } from "@/lib/program-layer"
import { createClientSupabaseServer } from "@/lib/supabase/server"

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
    },
    merchant: {
      id: merchant.id,
      businessName: merchant.name,
      sharedUnlock,
    },
  })
}
