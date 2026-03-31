import { NextResponse } from "next/server"

import { getCardById, getMerchantById } from "@/lib/loyalty-storage"

export async function GET(_: Request, { params }: { params: { cardId: string } }) {
  const card = await getCardById(params.cardId)

  if (!card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  const merchant = await getMerchantById(card.merchantId)

  return NextResponse.json({
    ok: true,
    card,
    merchant: merchant
      ? {
          id: merchant.id,
          businessName: merchant.businessName,
          businessType: merchant.businessType,
        }
      : null,
  })
}
