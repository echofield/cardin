import { NextResponse } from "next/server"

import { requireCardBearerForRead } from "@/lib/card-access-auth"
import { getPublicCardPayloadById } from "@/lib/public-card"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { cardId: string } }) {
  try {
    const supabase = createSupabaseServiceClient()
    const cardId = params.cardId
    const origin = new URL(request.url).origin

    const auth = await requireCardBearerForRead(request, supabase, cardId)
    if (!auth.ok) {
      return NextResponse.json(
        { ok: false, error: "card_token_required", message: "Jeton carte requis (Authorization: Bearer ou access_token en requête)." },
        { status: 401 },
      )
    }

    const payload = await getPublicCardPayloadById(supabase, cardId)

    if (!payload) {
      return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
    }

    return NextResponse.json({
      ...payload,
      wallet: {
        appleUrl: `${origin}/api/wallet/apple/${payload.card.id}`,
        googleUrl: `${origin}/api/wallet/google/${payload.card.id}`,
        appleReady: Boolean(process.env.APPLE_WALLET_PASS_URL_TEMPLATE),
        googleReady: Boolean(process.env.GOOGLE_WALLET_PASS_URL_TEMPLATE),
      },
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
