import { NextResponse } from "next/server"

import { buildCardGatewayPath } from "@/lib/card-code"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { cardId: string } }) {
  const supabase = createSupabaseServiceClient()
  const { data: card } = await supabase.from("cards").select("id, card_code").eq("id", params.cardId).single()

  if (!card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  const origin = new URL(request.url).origin
  const fallbackUrl = `${origin}${buildCardGatewayPath(card.card_code)}?wallet=google`

  const template = process.env.GOOGLE_WALLET_PASS_URL_TEMPLATE

  if (template?.includes("{cardCode}")) {
    return NextResponse.redirect(template.replace("{cardCode}", card.card_code))
  }

  if (template?.includes("{cardId}")) {
    return NextResponse.redirect(template.replace("{cardId}", card.id))
  }

  return NextResponse.json({
    ok: true,
    provider: "google",
    walletReady: false,
    fallbackUrl,
    message: "Activez GOOGLE_WALLET_PASS_URL_TEMPLATE pour la vraie emission Google Wallet.",
  })
}
