import { NextResponse } from "next/server"

import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const supabase = createClientSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const merchantId = url.searchParams.get("merchantId") ?? user.id

  if (merchantId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select("id, name, email, created_at")
    .eq("id", merchantId)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
  }

  const { data: cards, error: cardsError } = await supabase
    .from("cards")
    .select("id, customer_name, stamps, created_at")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false })

  if (cardsError) {
    return NextResponse.json({ ok: false, error: cardsError.message }, { status: 500 })
  }

  const cardIds = (cards ?? []).map((card) => card.id)
  const { data: transactions } = cardIds.length
    ? await supabase.from("transactions").select("id, card_id, type, created_at").in("card_id", cardIds)
    : { data: [] as Array<{ id: string; card_id: string; type: string; created_at: string }> }

  const rewardReadyCards = (cards ?? []).filter((card) => card.stamps >= 10).length
  const repeatClients = (cards ?? []).filter((card) => card.stamps > 1).length

  return NextResponse.json({
    ok: true,
    merchant: {
      id: merchant.id,
      businessName: merchant.name,
      businessType: "Commerce",
      city: "France",
      loyaltyConfig: {
        targetVisits: 10,
        rewardLabel: "1 récompense offerte",
      },
    },
    metrics: {
      totalCards: cards?.length ?? 0,
      rewardReadyCards,
      totalVisits: transactions?.length ?? 0,
      repeatClients,
    },
    cards: (cards ?? []).map((card) => ({
      id: card.id,
      customerName: card.customer_name,
      stamps: card.stamps,
      targetVisits: 10,
      status: card.stamps >= 10 ? "reward_ready" : "active",
      lastVisitAt: card.created_at,
    })),
  })
}