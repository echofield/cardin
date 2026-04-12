import { NextResponse } from "next/server"

import { requireCardBearerForWrite } from "@/lib/card-access-auth"
import { markMissionViewed } from "@/lib/cardin-mission-engine"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

type Body = {
  missionId?: string
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

  const missionId = (body.missionId ?? "").trim()
  if (!missionId) {
    return NextResponse.json({ ok: false, error: "missing_mission" }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()
  const writeOk = await requireCardBearerForWrite(request, supabase, cardId)
  if (!writeOk) {
    return NextResponse.json({ ok: false, error: "card_token_required" }, { status: 401 })
  }

  const { data: card, error } = await supabase.from("cards").select("merchant_id").eq("id", cardId).maybeSingle()
  if (error || !card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  await markMissionViewed(supabase, {
    merchantId: card.merchant_id,
    cardId,
    missionId,
  })

  return NextResponse.json({ ok: true })
}

