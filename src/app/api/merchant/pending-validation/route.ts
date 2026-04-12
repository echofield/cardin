import { NextResponse } from "next/server"

import { getActiveMissionForCard } from "@/lib/cardin-mission-engine"
import { buildMerchantProtocolSnapshot, getActiveDiamondTokenForCard } from "@/lib/cardin-protocol-runtime"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = createClientSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const { data: session, error: sessionError } = await supabase
    .from("visit_sessions")
    .select("id, card_id, started_at")
    .eq("merchant_id", user.id)
    .is("validated_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sessionError) {
    return NextResponse.json({ ok: false, error: sessionError.message }, { status: 500 })
  }

  const protocol = await buildMerchantProtocolSnapshot(supabase, { merchantId: user.id })

  if (!session) {
    return NextResponse.json({
      ok: true,
      pending: null,
      protocol: protocol
        ? {
            state: protocol.state,
            rewardsPaused: protocol.rewardsPaused,
            seasonObjective: protocol.narrative.seasonObjective,
          }
        : null,
    })
  }

  const { data: card } = await supabase
    .from("cards")
    .select(
      "customer_name, stamps, target_visits, current_season_id, summit_reward_option_id, summit_reward_title, summit_reward_description, summit_reward_usage_remaining",
    )
    .eq("id", session.card_id)
    .maybeSingle()

  const summitReward =
    card &&
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

  const diamondToken = await getActiveDiamondTokenForCard(supabase, session.card_id, card?.current_season_id ?? null)
  const mission = await getActiveMissionForCard(supabase, session.card_id)

  return NextResponse.json({
    ok: true,
    pending: {
      sessionId: session.id,
      cardId: session.card_id,
      startedAt: session.started_at,
      customerName: card?.customer_name ?? "Client",
      stamps: card?.stamps ?? 0,
      targetVisits: card?.target_visits ?? 10,
      summitReward,
      diamondToken: diamondToken
        ? {
            title: "Expérience Diamond",
            description: `Cycle ${diamondToken.cycle_index} disponible jusqu'au ${new Date(diamondToken.expires_at).toLocaleDateString("fr-FR")}.`,
            expiresAt: diamondToken.expires_at,
          }
        : null,
      mission,
    },
    protocol: protocol
      ? {
          state: protocol.state,
          rewardsPaused: protocol.rewardsPaused,
          seasonObjective: protocol.narrative.seasonObjective,
        }
      : null,
  })
}

