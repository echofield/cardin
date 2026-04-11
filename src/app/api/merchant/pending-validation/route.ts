import { NextResponse } from "next/server"

import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

/**
 * Latest unvalidated visit session for this merchant (staff sees "client en cours").
 */
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

  if (!session) {
    return NextResponse.json({ ok: true, pending: null })
  }

  const { data: card } = await supabase
    .from("cards")
    .select(
      "customer_name, stamps, target_visits, summit_reward_option_id, summit_reward_title, summit_reward_description, summit_reward_usage_remaining",
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
    },
  })
}
