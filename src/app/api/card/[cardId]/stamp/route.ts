import { NextResponse } from "next/server"

import { runMerchantStamp } from "@/lib/merchant-stamp-core"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type StampPayload = {
  action?: "stamp" | "redeem"
  idempotencyKey?: string
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

  try {
    const result = await runMerchantStamp(supabase, {
      card,
      merchant,
      merchantUserId: user.id,
      action: payload.action ?? "stamp",
      idempotencyKey: payload.idempotencyKey,
      source: "merchant_panel",
    })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "stamp_failed" },
      { status: 500 },
    )
  }
}
