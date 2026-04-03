import { NextResponse } from "next/server"

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
    .select("id, merchant_id, customer_name, stamps, created_at")
    .eq("id", params.cardId)
    .single()

  if (cardError || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  if (card.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  let payload: StampPayload = {}

  try {
    payload = (await request.json()) as StampPayload
  } catch {
    payload = {}
  }

  const action = payload.action ?? "stamp"
  const nextStamps = action === "redeem" ? 0 : card.stamps + 1

  const { data: updatedCard, error: updateError } = await supabase
    .from("cards")
    .update({ stamps: nextStamps })
    .eq("id", card.id)
    .select("id, merchant_id, customer_name, stamps, created_at")
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

  return NextResponse.json({
    ok: true,
    card: {
      id: updatedCard.id,
      customerName: updatedCard.customer_name,
      stamps: updatedCard.stamps,
      targetVisits: 10,
      rewardLabel: "1 récompense offerte",
      status: updatedCard.stamps >= 10 ? "reward_ready" : "active",
    },
  })
}