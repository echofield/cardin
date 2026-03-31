import { NextResponse } from "next/server"

import { getCardById } from "@/lib/loyalty-storage"

export async function GET(request: Request, { params }: { params: { cardId: string } }) {
  const card = await getCardById(params.cardId)

  if (!card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  const origin = new URL(request.url).origin
  const fallbackUrl = `${origin}/card/${card.id}?wallet=apple`

  const template = process.env.APPLE_WALLET_PASS_URL_TEMPLATE

  if (template && template.includes("{cardId}")) {
    const resolvedUrl = template.replace("{cardId}", card.id)
    return NextResponse.redirect(resolvedUrl)
  }

  return NextResponse.json({
    ok: true,
    provider: "apple",
    walletReady: false,
    fallbackUrl,
    message: "Activez APPLE_WALLET_PASS_URL_TEMPLATE pour la vraie émission Apple Wallet.",
  })
}
