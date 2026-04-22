import { NextResponse } from "next/server"

import { normalizeCardCode } from "@/lib/card-code"
import { requireCardBearerForRead } from "@/lib/card-access-auth"
import { getPublicCardPayloadByCode } from "@/lib/public-card"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { cardCode: string } }) {
  try {
    const supabase = createSupabaseServiceClient()
    const code = normalizeCardCode(params.cardCode)
    const origin = new URL(request.url).origin

    const { data: row, error: lookupError } = await supabase.from("cards").select("id").eq("card_code", code).maybeSingle()

    if (lookupError || !row) {
      return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
    }

    const auth = await requireCardBearerForRead(request, supabase, row.id)
    if (!auth.ok) {
      return NextResponse.json(
        { ok: false, error: "card_token_required", message: "Jeton carte requis (Authorization: Bearer ou access_token en requête)." },
        { status: 401 },
      )
    }

    const payload = await getPublicCardPayloadByCode(supabase, code)

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
