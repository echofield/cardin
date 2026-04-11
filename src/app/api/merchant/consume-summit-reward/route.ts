import { NextResponse } from "next/server"

import { insertTransactionEvent } from "@/lib/transaction-events"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type Body = {
  cardId?: string
}

/**
 * Merchant redeems one use of the client's active summit reward (e.g. after service).
 */
export async function POST(request: Request) {
  const supabase = createClientSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  let body: Body = {}
  try {
    body = (await request.json()) as Body
  } catch {
    body = {}
  }

  const cardId = (body.cardId ?? "").trim()
  if (!cardId) {
    return NextResponse.json({ ok: false, error: "missing_card" }, { status: 400 })
  }

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select(
      "id, merchant_id, summit_reward_option_id, summit_reward_title, summit_reward_description, summit_reward_usage_remaining",
    )
    .eq("id", cardId)
    .single()

  if (cardError || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  if (card.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const remaining = card.summit_reward_usage_remaining
  if (remaining === null || card.summit_reward_option_id === null) {
    return NextResponse.json({ ok: false, error: "no_active_reward" }, { status: 400 })
  }

  if (remaining <= 0) {
    return NextResponse.json({ ok: false, error: "no_uses_remaining" }, { status: 400 })
  }

  const next = remaining - 1

  const { error: updateError } = await supabase
    .from("cards")
    .update({ summit_reward_usage_remaining: next })
    .eq("id", card.id)

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 })
  }

  await insertTransactionEvent(supabase, {
    cardId: card.id,
    legacyType: "summit_reward_use",
    eventType: "summit_reward_use",
    source: "merchant_consume",
    metadata: {
      optionId: card.summit_reward_option_id,
      usageAfter: next,
    },
    createdBy: user.id,
  })

  return NextResponse.json({
    ok: true,
    usageRemaining: next,
    title: card.summit_reward_title,
    description: card.summit_reward_description,
  })
}
