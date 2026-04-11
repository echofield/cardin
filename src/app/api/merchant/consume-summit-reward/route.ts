import { NextResponse } from "next/server"

import { IDEMPOTENCY_SCOPE_CONSUME, getCachedIdempotentResponse, saveIdempotentResponse } from "@/lib/merchant-api-idempotency"
import { findValidatedSessionForConsume } from "@/lib/visit-session-consume"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type Body = {
  cardId?: string
  sessionId?: string
  idempotencyKey?: string
}

type ConsumeRpcRow = {
  usage_remaining: number
  title: string | null
  description: string | null
  option_id: string | null
  reward_use_index: number
}

function normalizeRpcRow(data: ConsumeRpcRow[] | ConsumeRpcRow | null): ConsumeRpcRow | null {
  if (!data) return null
  return Array.isArray(data) ? data[0] ?? null : data
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
    const cached = await getCachedIdempotentResponse(supabase, user.id, IDEMPOTENCY_SCOPE_CONSUME, idem)
    if (cached !== null) {
      return NextResponse.json(cached)
    }
  }

  const cardId = (body.cardId ?? "").trim()
  if (!cardId) {
    return NextResponse.json({ ok: false, error: "missing_card" }, { status: 400 })
  }

  const sessionId = (body.sessionId ?? "").trim() || null
  const proof = await findValidatedSessionForConsume(supabase, {
    merchantId: user.id,
    cardId,
    sessionId,
  })

  if (!proof) {
    return NextResponse.json(
      {
        ok: false,
        error: "no_recent_validated_session",
        message: "Validez d'abord un passage pour ce client, ou la session est trop ancienne.",
      },
      { status: 400 },
    )
  }

  const idempotencyConsume = idem ? `${idem}:consume` : null
  const { data, error } = await supabase.rpc("consume_summit_reward_atomic", {
    p_card_id: cardId,
    p_merchant_id: user.id,
    p_visit_session_id: proof.id,
    p_created_by: user.id,
    p_idempotency_key: idempotencyConsume,
  })

  if (error) {
    if (error.message.includes("reward_already_consumed_for_session")) {
      const { data: card } = await supabase
        .from("cards")
        .select("summit_reward_title, summit_reward_description, summit_reward_usage_remaining")
        .eq("id", cardId)
        .maybeSingle()

      const payload = {
        ok: true as const,
        usageRemaining: card?.summit_reward_usage_remaining ?? 0,
        title: card?.summit_reward_title ?? null,
        description: card?.summit_reward_description ?? null,
        visitSessionId: proof.id,
      }

      if (idem) {
        await saveIdempotentResponse(supabase, user.id, IDEMPOTENCY_SCOPE_CONSUME, idem, payload)
      }

      return NextResponse.json(payload)
    }

    if (error.message.includes("no_active_reward")) {
      return NextResponse.json({ ok: false, error: "no_active_reward" }, { status: 400 })
    }

    if (error.message.includes("no_uses_remaining")) {
      return NextResponse.json({ ok: false, error: "no_uses_remaining" }, { status: 400 })
    }

    if (error.message.includes("card_not_found")) {
      return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
    }

    if (error.message.includes("forbidden")) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
    }

    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const consumed = normalizeRpcRow(data as ConsumeRpcRow[] | ConsumeRpcRow | null)
  if (!consumed) {
    return NextResponse.json({ ok: false, error: "consume_failed" }, { status: 500 })
  }

  const payload = {
    ok: true as const,
    usageRemaining: consumed.usage_remaining,
    title: consumed.title,
    description: consumed.description,
    visitSessionId: proof.id,
  }

  if (idem) {
    await saveIdempotentResponse(supabase, user.id, IDEMPOTENCY_SCOPE_CONSUME, idem, payload)
  }

  return NextResponse.json(payload)
}
