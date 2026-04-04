import { NextResponse } from "next/server"

import { buildMidpointView, getMidpointMode, getMidpointThreshold, getRewardLabel, getTargetVisits, maybeActivateSharedUnlock } from "@/lib/program-layer"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const supabase = createClientSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const payload = (await request.json()) as { customerName?: string; merchantId?: string }
  const customerName = (payload.customerName ?? "").trim()
  const merchantId = payload.merchantId ?? user.id

  if (!customerName) {
    return NextResponse.json({ ok: false, error: "missing_customer_name" }, { status: 400 })
  }

  if (merchantId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select(
      "id, name, midpoint_mode, target_visits, reward_label, shared_unlock_enabled, shared_unlock_objective, shared_unlock_window_days, shared_unlock_offer, shared_unlock_active_until, shared_unlock_last_triggered_period"
    )
    .eq("id", merchantId)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
  }

  const targetVisits = getTargetVisits(merchant.target_visits)
  const rewardLabel = getRewardLabel(merchant.reward_label)
  const midpointMode = getMidpointMode(merchant.midpoint_mode)

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .insert({
      merchant_id: merchantId,
      customer_name: customerName,
      stamps: 1,
      target_visits: targetVisits,
      reward_label: rewardLabel,
    })
    .select("id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at")
    .single()

  if (cardError || !card) {
    return NextResponse.json({ ok: false, error: cardError?.message ?? "card_insert_failed" }, { status: 500 })
  }

  const { error: txError } = await supabase.from("transactions").insert({
    card_id: card.id,
    type: "issued",
  })

  if (txError) {
    return NextResponse.json({ ok: false, error: txError.message }, { status: 500 })
  }

  const sharedUnlock = await maybeActivateSharedUnlock(supabase, {
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

  const midpoint = buildMidpointView({
    stamps: card.stamps,
    targetVisits,
    midpointReachedAt: card.midpoint_reached_at,
    midpointMode,
  })

  const origin = new URL(request.url).origin

  return NextResponse.json({
    ok: true,
    card: {
      id: card.id,
      merchantId: card.merchant_id,
      customerName: card.customer_name,
      stamps: card.stamps,
      targetVisits,
      rewardLabel,
      midpoint,
      status: card.stamps >= targetVisits ? "reward_ready" : "active",
      createdAt: card.created_at,
    },
    merchant: {
      id: merchant.id,
      businessName: merchant.name,
      businessType: "Commerce",
      loyaltyConfig: {
        targetVisits,
        rewardLabel,
        midpointMode,
        midpointThreshold: getMidpointThreshold(targetVisits),
      },
      sharedUnlock,
    },
    cardUrl: `${origin}/card/${card.id}`,
    appleWalletUrl: `${origin}/api/wallet/apple/${card.id}`,
    googleWalletUrl: `${origin}/api/wallet/google/${card.id}`,
  })
}
