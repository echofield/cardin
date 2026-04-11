import { NextResponse } from "next/server"

import { requireCardBearerForWrite } from "@/lib/card-access-auth"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

type Body = {
  cardId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const cardId = (body.cardId ?? "").trim()

    if (!cardId) {
      return NextResponse.json({ ok: false, error: "missing_card_id" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const writeOk = await requireCardBearerForWrite(request, supabase, cardId)
    if (!writeOk) {
      return NextResponse.json(
        { ok: false, error: "card_token_required", message: "Autorisation Bearer requise." },
        { status: 401 },
      )
    }

    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id, merchant_id")
      .eq("id", cardId)
      .maybeSingle()

    if (cardError || !card) {
      return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
    }

    const { data: activeSessions, error: activeError } = await supabase
      .from("visit_sessions")
      .select("id, card_id, merchant_id, started_at")
      .eq("card_id", card.id)
      .is("validated_at", null)
      .order("started_at", { ascending: false })
      .limit(8)

    if (activeError) {
      return NextResponse.json({ ok: false, error: activeError.message }, { status: 500 })
    }

    const sessions = activeSessions ?? []
    if (sessions.length > 0) {
      const [active, ...stale] = sessions
      if (stale.length > 0) {
        const staleIds = stale.map((session) => session.id)
        await supabase.from("visit_sessions").delete().in("id", staleIds)
      }

      return NextResponse.json({
        ok: true,
        session: {
          id: active.id,
          cardId: active.card_id,
          merchantId: active.merchant_id,
          startedAt: active.started_at,
        },
      })
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
      if (insertError?.code === "23505") {
        const { data: existing } = await supabase
          .from("visit_sessions")
          .select("id, card_id, merchant_id, started_at")
          .eq("card_id", card.id)
          .is("validated_at", null)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (existing) {
          return NextResponse.json({
            ok: true,
            session: {
              id: existing.id,
              cardId: existing.card_id,
              merchantId: existing.merchant_id,
              startedAt: existing.started_at,
            },
          })
        }
      }

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
