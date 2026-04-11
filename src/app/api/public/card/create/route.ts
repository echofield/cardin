import { randomBytes } from "crypto"

import { NextResponse } from "next/server"

import { buildCardGatewayPath } from "@/lib/card-code"
import { recomputeCardScoreSnapshot } from "@/lib/cardin-scoring"
import { getLandingWorldForProfile, getMerchantProfileFromRaw, normalizeMerchantProfileId } from "@/lib/merchant-profile"
import { buildMidpointView, getMidpointMode, getMidpointThreshold, getRewardLabel, getTargetVisits, maybeActivateSharedUnlock } from "@/lib/program-layer"
import { initializeCardForActiveSeason } from "@/lib/season-progression"
import { createSupabaseServiceClient } from "@/lib/supabase/service"
import { insertTransactionEvent } from "@/lib/transaction-events"

export const dynamic = "force-dynamic"

type CreateCardPayload = {
  merchantId?: string
  customerName?: string
  customerPhone?: string
  idempotencyKey?: string
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
        "id, name, cardin_world, midpoint_mode, target_visits, reward_label, shared_unlock_enabled, shared_unlock_objective, shared_unlock_window_days, shared_unlock_offer, shared_unlock_active_until, shared_unlock_last_triggered_period",
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
    const clientAccessToken = randomBytes(24).toString("hex")

    const { data: card, error: cardError } = await supabase
      .from("cards")
      .insert({
        merchant_id: merchantId,
        customer_name: customerName,
        stamps: 1,
        target_visits: targetVisits,
        reward_label: rewardLabel,
        client_access_token: clientAccessToken,
      })
      .select("id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at, card_code")
      .single()

    if (cardError || !card) {
      return NextResponse.json({ ok: false, error: cardError?.message ?? "card_insert_failed" }, { status: 500 })
    }

    const activeSeason = await initializeCardForActiveSeason(supabase, card.id, merchantId)

    await insertTransactionEvent(supabase, {
      cardId: card.id,
      legacyType: "issued",
      eventType: "issued",
      seasonId: activeSeason?.id ?? null,
      stepReached: activeSeason ? 1 : null,
      source: "public_scan",
      metadata: {
        publicCreate: true,
      },
      idempotencyKey: payload.idempotencyKey,
    })

    if (activeSeason) {
      try {
        await recomputeCardScoreSnapshot(supabase, card.id, { seasonId: activeSeason.id })
      } catch (error) {
        console.error("Failed to recompute score snapshot after public card creation:", error)
      }
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
    const cardGatewayPath = buildCardGatewayPath(card.card_code)
    const accessQuery = `access_token=${encodeURIComponent(clientAccessToken)}`

    return NextResponse.json({
      ok: true,
      accessToken: clientAccessToken,
      card: {
        id: card.id,
        code: card.card_code,
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
        businessType: profile.businessTypeLabel,
        profileId,
        cardinWorld: getLandingWorldForProfile(profileId),
        promise: profile.promise,
        loyaltyConfig: {
          targetVisits,
          rewardLabel,
          midpointMode,
          midpointThreshold: getMidpointThreshold(targetVisits),
        },
        sharedUnlock,
      },
      cardUrl: `${origin}${cardGatewayPath}?${accessQuery}`,
      cardLegacyUrl: `${origin}/card/${card.id}?${accessQuery}`,
      appleWalletUrl: `${origin}/api/wallet/apple/${card.id}`,
      googleWalletUrl: `${origin}/api/wallet/google/${card.id}`,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
