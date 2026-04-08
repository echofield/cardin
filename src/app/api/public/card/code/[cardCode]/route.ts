import { NextResponse } from "next/server"

import { normalizeCardCode } from "@/lib/card-code"
import { getPublicCardPayloadByCode } from "@/lib/public-card"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: { cardCode: string } }) {
  try {
    const supabase = createSupabaseServiceClient()
    const payload = await getPublicCardPayloadByCode(supabase, normalizeCardCode(params.cardCode))

    if (!payload) {
      return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
