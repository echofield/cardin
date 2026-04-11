import { NextResponse } from "next/server"

import { IDEMPOTENCY_SCOPE_VALIDATE, getCachedIdempotentResponse, saveIdempotentResponse } from "@/lib/merchant-api-idempotency"
import { isWithinMerchantCooldown, runMerchantStamp } from "@/lib/merchant-stamp-core"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type Body = {
  sessionId?: string
  cardId?: string
  idempotencyKey?: string
}

/**
 * Merchant validates reality: one click = one passage (links to active visit session).
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

  const idem = (body.idempotencyKey ?? "").trim()
  if (idem) {
    const cached = await getCachedIdempotentResponse(supabase, user.id, IDEMPOTENCY_SCOPE_VALIDATE, idem)
    if (cached !== null) {
      return NextResponse.json(cached)
    }
  }

  let sessionId: string | null = (body.sessionId ?? "").trim() || null
  let cardId: string | null = (body.cardId ?? "").trim() || null

  if (!sessionId && !cardId) {
    const { data: latest } = await supabase
      .from("visit_sessions")
      .select("id, card_id")
      .eq("merchant_id", user.id)
      .is("validated_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!latest) {
      return NextResponse.json({ ok: false, error: "no_pending_client" }, { status: 400 })
    }
    sessionId = latest.id
    cardId = latest.card_id
  }

  if (!cardId && sessionId) {
    const { data: s } = await supabase
      .from("visit_sessions")
      .select("id, card_id, merchant_id, validated_at")
      .eq("id", sessionId)
      .maybeSingle()

    if (!s || s.merchant_id !== user.id) {
      return NextResponse.json({ ok: false, error: "session_not_found" }, { status: 404 })
    }
    if (s.validated_at) {
      return NextResponse.json({ ok: false, error: "session_already_validated" }, { status: 400 })
    }
    cardId = s.card_id
  }

  if (!cardId) {
    return NextResponse.json({ ok: false, error: "missing_card" }, { status: 400 })
  }

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select(
      "id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at, last_merchant_validation_at",
    )
    .eq("id", cardId)
    .single()

  if (cardError || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  if (card.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  if (isWithinMerchantCooldown(card.last_merchant_validation_at)) {
    return NextResponse.json(
      { ok: false, error: "cooldown_active", message: "Réessayez plus tard (fenêtre courte entre deux validations)." },
      { status: 429 },
    )
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select(
      "id, name, midpoint_mode, target_visits, reward_label, shared_unlock_enabled, shared_unlock_objective, shared_unlock_window_days, shared_unlock_offer, shared_unlock_active_until, shared_unlock_last_triggered_period",
    )
    .eq("id", card.merchant_id)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
  }

  try {
    const result = await runMerchantStamp(supabase, {
      card,
      merchant,
      merchantUserId: user.id,
      action: "stamp",
      source: "merchant_validate",
    })

    const validatedAt = new Date().toISOString()

    if (sessionId) {
      await supabase.from("visit_sessions").update({ validated_at: validatedAt }).eq("id", sessionId)
    }

    const payload = {
      ok: true as const,
      ...result,
      message: "Passage validé",
      sessionId: sessionId ?? null,
      validatedAt,
    }

    if (idem) {
      await saveIdempotentResponse(supabase, user.id, IDEMPOTENCY_SCOPE_VALIDATE, idem, payload)
    }

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "validate_failed" },
      { status: 500 },
    )
  }
}
