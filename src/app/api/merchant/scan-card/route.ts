import { NextResponse } from "next/server"

import { normalizeCardCode } from "@/lib/card-code"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type Body = {
  cardCode?: string
}

function extractCardLookup(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return ""

  try {
    const url = new URL(trimmed)
    const lookupFromPath = url.pathname.match(/\/c\/([^/?#]+)/i)?.[1]
    if (lookupFromPath) {
      return decodeURIComponent(lookupFromPath).trim()
    }
  } catch {
    // not a URL, keep parsing as raw code
  }

  const taggedCode = trimmed.match(/CD[-A-Z0-9]+/i)?.[0]
  return taggedCode ?? trimmed
}

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

  const rawLookup = extractCardLookup(body.cardCode ?? "")
  const cardCode = normalizeCardCode(rawLookup)
  const cardId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawLookup) ? rawLookup : ""

  if (!cardCode && !cardId) {
    return NextResponse.json({ ok: false, error: "missing_card_code" }, { status: 400 })
  }

  const cardQuery = supabase.from("cards").select("id, merchant_id, customer_name, stamps, target_visits, card_code")
  const { data: card, error: cardError } = await (cardCode ? cardQuery.eq("card_code", cardCode) : cardQuery.eq("id", cardId)).maybeSingle()

  if (cardError || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  if (card.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
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
      await supabase
        .from("visit_sessions")
        .delete()
        .in(
          "id",
          stale.map((session) => session.id),
        )
    }

    return NextResponse.json({
      ok: true,
      card: {
        id: card.id,
        code: card.card_code ?? cardCode ?? cardId,
        customerName: card.customer_name,
        stamps: card.stamps,
        targetVisits: card.target_visits,
      },
      session: {
        id: active.id,
        cardId: active.card_id,
        merchantId: active.merchant_id,
        startedAt: active.started_at,
      },
      reused: true,
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
    return NextResponse.json({ ok: false, error: insertError?.message ?? "session_insert_failed" }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    card: {
      id: card.id,
      code: card.card_code ?? cardCode ?? cardId,
      customerName: card.customer_name,
      stamps: card.stamps,
      targetVisits: card.target_visits,
    },
    session: {
      id: session.id,
      cardId: session.card_id,
      merchantId: session.merchant_id,
      startedAt: session.started_at,
    },
    reused: false,
  })
}
