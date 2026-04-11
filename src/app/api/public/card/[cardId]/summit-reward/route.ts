import { NextResponse } from "next/server"

import {
  getSummitOptions,
  getSummitUsageInitial,
  isValidSummitOptionId,
  normalizeCardinWorld,
} from "@/lib/client-parcours-config"
import { requireCardBearerForWrite } from "@/lib/card-access-auth"
import { getActiveSeason, getCardSeasonProgress } from "@/lib/season-progression"
import { getPublicCardPayloadById } from "@/lib/public-card"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

type Body = {
  optionId?: string
}

export async function POST(request: Request, { params }: { params: { cardId: string } }) {
  const cardId = (params.cardId ?? "").trim()
  if (!cardId) {
    return NextResponse.json({ ok: false, error: "missing_card" }, { status: 400 })
  }

  let body: Body = {}
  try {
    body = (await request.json()) as Body
  } catch {
    body = {}
  }

  const optionId = (body.optionId ?? "").trim()
  if (!isValidSummitOptionId(optionId)) {
    return NextResponse.json({ ok: false, error: "invalid_option" }, { status: 400 })
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
    .select("id, merchant_id, summit_reward_option_id")
    .eq("id", cardId)
    .single()

  if (cardError || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  if (card.summit_reward_option_id) {
    return NextResponse.json({ ok: false, error: "reward_already_chosen" }, { status: 400 })
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("cardin_world")
    .eq("id", card.merchant_id)
    .single()

  const worldId = normalizeCardinWorld(merchant?.cardin_world)
  const options = getSummitOptions(worldId)
  const chosen = options.find((option) => option.id === optionId)
  if (!chosen) {
    return NextResponse.json({ ok: false, error: "option_not_found" }, { status: 400 })
  }

  const activeSeason = await getActiveSeason(supabase, card.merchant_id)
  if (!activeSeason) {
    return NextResponse.json({ ok: false, error: "no_active_season" }, { status: 400 })
  }

  const progress = await getCardSeasonProgress(supabase, card.id, activeSeason.id)
  if (!progress?.summit_reached_at) {
    return NextResponse.json({ ok: false, error: "summit_not_reached" }, { status: 400 })
  }

  const usage = getSummitUsageInitial(worldId, optionId)
  const { data: updatedCard, error: updateError } = await supabase
    .from("cards")
    .update({
      summit_reward_option_id: optionId,
      summit_reward_title: chosen.title,
      summit_reward_description: chosen.description,
      summit_reward_usage_remaining: usage,
    })
    .eq("id", card.id)
    .is("summit_reward_option_id", null)
    .select("id")
    .maybeSingle()

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 })
  }

  if (!updatedCard) {
    return NextResponse.json({ ok: false, error: "reward_already_chosen" }, { status: 400 })
  }

  const payload = await getPublicCardPayloadById(supabase, card.id)
  if (!payload) {
    return NextResponse.json({ ok: false, error: "payload_failed" }, { status: 500 })
  }

  return NextResponse.json(payload)
}
