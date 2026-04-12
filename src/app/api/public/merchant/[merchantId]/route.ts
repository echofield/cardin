import { NextResponse } from "next/server"

import { buildMerchantProtocolSnapshot } from "@/lib/cardin-protocol-runtime"
import { getLandingWorldForProfile, getMerchantProfileFromRaw, normalizeMerchantProfileId } from "@/lib/merchant-profile"
import { buildSharedUnlockView, getMidpointMode, getRewardLabel, getTargetVisits } from "@/lib/program-layer"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: { merchantId: string } }) {
  try {
    const supabase = createSupabaseServiceClient()

    const { data: merchant, error } = await supabase
      .from("merchants")
      .select(
        "id, name, cardin_world, midpoint_mode, target_visits, reward_label, shared_unlock_enabled, shared_unlock_objective, shared_unlock_window_days, shared_unlock_offer, shared_unlock_active_until, shared_unlock_last_triggered_period",
      )
      .eq("id", params.merchantId)
      .single()

    if (error || !merchant) {
      return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
    }

    const targetVisits = getTargetVisits(merchant.target_visits)
    const rewardLabel = getRewardLabel(merchant.reward_label)
    const midpointMode = getMidpointMode(merchant.midpoint_mode)
    const profileId = normalizeMerchantProfileId(merchant.cardin_world)
    const profile = getMerchantProfileFromRaw(merchant.cardin_world)
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
    const protocolSnapshot = await buildMerchantProtocolSnapshot(supabase, { merchantId: merchant.id })

    return NextResponse.json({
      ok: true,
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
          midpointThreshold: Math.ceil(targetVisits / 2),
        },
        sharedUnlock,
        protocol: protocolSnapshot
          ? {
              state: protocolSnapshot.state,
              rewardsPaused: protocolSnapshot.rewardsPaused,
              seasonObjective: protocolSnapshot.narrative.seasonObjective,
              diamondLine: protocolSnapshot.narrative.diamondLine,
            }
          : null,
      },
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
