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

  if ((body.cardId ?? "").trim() && !(body.sessionId ?? "").trim()) {
    return NextResponse.json({ ok: false, error: "session_required" }, { status: 400 })
  }

  let sessionId = (body.sessionId ?? "").trim()
  if (!sessionId) {
    const { data: latest } = await supabase
      .from("visit_sessions")
      .select("id")
      .eq("merchant_id", user.id)
      .is("validated_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!latest) {
      return NextResponse.json({ ok: false, error: "no_pending_client" }, { status: 400 })
    }

    sessionId = latest.id
  }

  const { data: session, error: sessionError } = await supabase
    .from("visit_sessions")
    .select("id, card_id, merchant_id, validated_at")
    .eq("id", sessionId)
    .maybeSingle()

  if (sessionError || !session || session.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "session_not_found" }, { status: 404 })
  }

  if (session.validated_at) {
    return NextResponse.json({ ok: false, error: "session_already_validated" }, { status: 400 })
  }

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select(
      "id, merchant_id, customer_name, stamps, target_visits, reward_label, midpoint_reached_at, created_at, last_merchant_validation_at",
    )
    .eq("id", session.card_id)
    .single()

  if (cardError || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  if (card.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  if (isWithinMerchantCooldown(card.last_merchant_validation_at)) {
    return NextResponse.json(
      { ok: false, error: "cooldown_active", message: "Réessayez plus tard : cette carte est encore dans la fenêtre courte entre deux validations." },
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

  const validatedAt = new Date().toISOString()
  const { data: lockedSession, error: lockError } = await supabase
    .from("visit_sessions")
    .update({ validated_at: validatedAt })
    .eq("id", session.id)
    .eq("merchant_id", user.id)
    .is("validated_at", null)
    .select("id")
    .maybeSingle()

  if (lockError) {
    return NextResponse.json({ ok: false, error: lockError.message }, { status: 500 })
  }

  if (!lockedSession) {
    return NextResponse.json({ ok: false, error: "session_already_validated" }, { status: 400 })
  }

  try {
    const result = await runMerchantStamp(supabase, {
      card,
      merchant,
      merchantUserId: user.id,
      action: "stamp",
      source: "merchant_validate",
      visitSessionId: session.id,
    })

    const payload = {
      ok: true as const,
      ...result,
      message: "Passage validé",
      sessionId: session.id,
      validatedAt,
    }

    if (idem) {
      await saveIdempotentResponse(supabase, user.id, IDEMPOTENCY_SCOPE_VALIDATE, idem, payload)
    }

    return NextResponse.json(payload)
  } catch (error) {
    await supabase
      .from("visit_sessions")
      .update({ validated_at: null })
      .eq("id", session.id)
      .eq("validated_at", validatedAt)

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "validate_failed" },
      { status: 500 },
    )
  }
}
