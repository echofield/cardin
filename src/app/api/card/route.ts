import { NextResponse } from "next/server"

import { createClientSupabaseServer } from "@/lib/supabase/server"

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

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .insert({
      merchant_id: merchantId,
      customer_name: customerName,
      stamps: 1,
    })
    .select("id, merchant_id, customer_name, stamps, created_at")
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

  const origin = new URL(request.url).origin

  return NextResponse.json({
    ok: true,
    card: {
      id: card.id,
      merchantId: card.merchant_id,
      customerName: card.customer_name,
      stamps: card.stamps,
      targetVisits: 10,
      rewardLabel: "1 récompense offerte",
      status: card.stamps >= 10 ? "reward_ready" : "active",
      createdAt: card.created_at,
    },
    cardUrl: `${origin}/card/${card.id}`,
    appleWalletUrl: `${origin}/api/wallet/apple/${card.id}`,
    googleWalletUrl: `${origin}/api/wallet/google/${card.id}`,
  })
}
