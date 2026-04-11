import { NextResponse } from "next/server"

import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

type Body = {
  cardId?: string
}

/**
 * Client opens / refreshes card → registers presence so merchant can validate (Option B).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const cardId = (body.cardId ?? "").trim()

    if (!cardId) {
      return NextResponse.json({ ok: false, error: "missing_card_id" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id, merchant_id")
      .eq("id", cardId)
      .maybeSingle()

    if (cardError || !card) {
      return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
    }

    const { data: session, error: insertError } = await supabase
      .from("visit_sessions")
      .insert({
        card_id: card.id,
        merchant_id: card.merchant_id,
      })
      .select("id, card_id, merchant_id, started_at")
      .single()

    if (insertError || !session) {
      return NextResponse.json({ ok: false, error: insertError?.message ?? "session_insert_failed" }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      session: {
        id: session.id,
        cardId: session.card_id,
        merchantId: session.merchant_id,
        startedAt: session.started_at,
      },
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
