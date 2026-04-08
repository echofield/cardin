import { NextResponse } from "next/server"

import { createInvitation } from "@/lib/domino-engine"
import { getActiveSeason } from "@/lib/season-progression"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

type InvitePayload = {
  customerName?: string
}

export async function POST(request: Request, { params }: { params: { cardId: string } }) {
  const supabase = createSupabaseServiceClient()

  let payload: InvitePayload = {}
  try {
    payload = (await request.json()) as InvitePayload
  } catch {
    payload = {}
  }

  const customerName = (payload.customerName ?? "").trim()
  if (!customerName) {
    return NextResponse.json({ ok: false, error: "customer_name_required" }, { status: 400 })
  }

  const { data: parentCard, error: cardError } = await supabase
    .from("cards")
    .select("id, merchant_id, customer_name")
    .eq("id", params.cardId)
    .single()

  if (cardError || !parentCard) {
    return NextResponse.json({ ok: false, error: "parent_card_not_found" }, { status: 404 })
  }

  const activeSeason = await getActiveSeason(supabase, parentCard.merchant_id)
  if (!activeSeason) {
    return NextResponse.json({ ok: false, error: "season_not_active" }, { status: 400 })
  }

  try {
    const result = await createInvitation(
      supabase,
      parentCard.id,
      activeSeason.id,
      customerName,
      parentCard.merchant_id
    )

    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error ?? "invitation_creation_failed" }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      invitation: {
        parentCardId: parentCard.id,
        childCard: result.childCard,
        referralId: result.referral?.id ?? null,
        remainingSlots: result.remainingSlots ?? 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "internal_server_error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
