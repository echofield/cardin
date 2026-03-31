import { NextResponse } from "next/server"

import { createClientSupabaseServer } from "@/lib/supabase/server"

export async function GET(_: Request, { params }: { params: { cardId: string } }) {
  const supabase = createClientSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const { data: card, error } = await supabase
    .from("cards")
    .select("id, merchant_id, customer_name, stamps, created_at")
    .eq("id", params.cardId)
    .single()

  if (error || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  if (card.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, name")
    .eq("id", card.merchant_id)
    .single()

  return NextResponse.json({
    ok: true,
    card: {
      id: card.id,
      customerName: card.customer_name,
      stamps: card.stamps,
      targetVisits: 10,
      rewardLabel: "1 récompense offerte",
      status: card.stamps >= 10 ? "reward_ready" : "active",
    },
    merchant: merchant
      ? {
          id: merchant.id,
          businessName: merchant.name,
          businessType: "Commerce",
        }
      : null,
  })
}
