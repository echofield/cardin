import { NextResponse } from "next/server"

import { completeIntentMission } from "@/lib/cardin-mission-engine"
import { consumeDiamondToken, getMerchantProtocolSettings } from "@/lib/cardin-protocol-runtime"
import { IDEMPOTENCY_SCOPE_CONSUME, getCachedIdempotentResponse, saveIdempotentResponse } from "@/lib/merchant-api-idempotency"
import { findValidatedSessionForConsume } from "@/lib/visit-session-consume"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type Body = {
  cardId?: string
  sessionId?: string
  missionId?: string
  missionValidation?: {
    groupSize?: number | null
    sameTicketConfirmed?: boolean
    cardholderPresent?: boolean
    singleBillConfirmed?: boolean
    appointmentConfirmed?: boolean
    inStoreConfirmed?: boolean
    timeWindowConfirmed?: boolean
  }
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

  const settings = await getMerchantProtocolSettings(supabase, user.id)
  const maxAgeMs = (settings?.config.attributionWindowDays ?? 1) * 24 * 60 * 60 * 1000
  const sessionId = (body.sessionId ?? "").trim() || null
  const proof = await findValidatedSessionForConsume(supabase, {
    merchantId: user.id,
    cardId,
    sessionId,
    maxAgeMs,
  })

  if (!proof) {
    return NextResponse.json(
      {
        ok: false,
        error: "no_recent_validated_session",
        message: "Validez d'abord un passage recent pour ce client.",
      },
      { status: 400 },
    )
  }

  const missionId = (body.missionId ?? "").trim()
  if (missionId) {
    const mission = await completeIntentMission(supabase, {
      merchantId: user.id,
      cardId,
      missionId,
      visitSessionId: proof.id,
      createdBy: user.id,
      seasonId: null,
      validation: body.missionValidation ?? {},
      idempotencyKey: idem ? `${idem}:mission` : null,
    })

    if (!mission.ok) {
      const status =
        mission.error === "missions_paused" || mission.error === "mission_budget" || mission.error === "season_budget"
          ? 409
          : mission.error === "mission_validation_failed"
            ? 400
            : 400
      return NextResponse.json({ ok: false, error: mission.error }, { status })
    }

    const payload = {
      ok: true as const,
      rewardType: "mission" as const,
      usageRemaining: 0,
      title: mission.reward.title,
      description: mission.reward.description,
      visitSessionId: proof.id,
      mission: mission.mission,
    }

    if (idem) {
      await saveIdempotentResponse(supabase, user.id, IDEMPOTENCY_SCOPE_CONSUME, idem, payload)
    }

    return NextResponse.json(payload)
  }

  const { data: card } = await supabase
    .from("cards")
    .select("summit_reward_option_id, summit_reward_title, summit_reward_description, summit_reward_usage_remaining")
    .eq("id", cardId)
    .maybeSingle()

  const hasActiveSummit = Boolean(
    card?.summit_reward_option_id && typeof card?.summit_reward_usage_remaining === "number" && card.summit_reward_usage_remaining > 0,
  )

  if (hasActiveSummit) {
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
        const payload = {
          ok: true as const,
          rewardType: "summit" as const,
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
      rewardType: "summit" as const,
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

  const diamond = await consumeDiamondToken(supabase, {
    merchantId: user.id,
    cardId,
    visitSessionId: proof.id,
    createdBy: user.id,
    idempotencyKey: idem ? `${idem}:diamond` : null,
  })

  if (!diamond.ok) {
    if (diamond.error === "forbidden") {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
    }
    if (diamond.error === "card_not_found") {
      return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
    }
    if (diamond.error === "reward_already_consumed_for_session") {
      return NextResponse.json({ ok: false, error: "reward_already_consumed_for_session" }, { status: 400 })
    }
    if (diamond.error === "no_active_reward") {
      return NextResponse.json({ ok: false, error: "no_active_reward" }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: "consume_failed" }, { status: 500 })
  }

  const payload = {
    ok: true as const,
    rewardType: "diamond" as const,
    usageRemaining: 0,
    title: "Expérience Diamond",
    description: `Cycle ${diamond.token.cycle_index} utilisé.`,
    visitSessionId: proof.id,
    expiresAt: diamond.token.expires_at,
  }

  if (idem) {
    await saveIdempotentResponse(supabase, user.id, IDEMPOTENCY_SCOPE_CONSUME, idem, payload)
  }

  return NextResponse.json(payload)
}

