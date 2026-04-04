import { NextResponse } from "next/server"

import { buildMidpointView, getMidpointMode, getMidpointThreshold, getRewardLabel, getTargetVisits, maybeActivateSharedUnlock } from "@/lib/program-layer"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

type CreateCardPayload = {
  merchantId?: string
  customerName?: string
  customerPhone?: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateCardPayload

    const merchantId = (payload.merchantId ?? "").trim()
    const customerName = (payload.customerName ?? "").trim()

    if (!merchantId || !customerName) {
      return NextResponse.json({ ok: false, error: "missing_required_fields" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

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

    await supabase.from("transactions").insert({
      card_id: card.id,
      type: "issued",
    })

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
        customerName: card.customer_name,
        stamps: card.stamps,
        targetVisits,
        rewardLabel,
        midpoint,
        status: card.stamps >= targetVisits ? "reward_ready" : "active",
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
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
