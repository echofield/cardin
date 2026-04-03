import { NextResponse } from "next/server"

import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

type CreateCardPayload = {
  merchantId?: string
  customerName?: string
  customerPhone?: string
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
      .select("id, name")
      .eq("id", merchantId)
      .single()

    if (merchantError || !merchant) {
      return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
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

    await supabase.from("transactions").insert({
      card_id: card.id,
      type: "issued",
    })

    const origin = new URL(request.url).origin

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
      merchant: {
        id: merchant.id,
        businessName: merchant.name,
        businessType: "Commerce",
      },
      cardUrl: `${origin}/card/${card.id}`,
      appleWalletUrl: `${origin}/api/wallet/apple/${card.id}`,
      googleWalletUrl: `${origin}/api/wallet/google/${card.id}`,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}