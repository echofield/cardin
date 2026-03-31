import { NextResponse } from "next/server"

import { getMerchantById, listCardsByMerchantId, listVisitsByMerchantId } from "@/lib/loyalty-storage"

export async function GET(_: Request, { params }: { params: { merchantId: string } }) {
  const merchant = await getMerchantById(params.merchantId)

  if (!merchant) {
    return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
  }

  const cards = await listCardsByMerchantId(merchant.id)
  const visits = await listVisitsByMerchantId(merchant.id)

  const rewardReadyCards = cards.filter((card) => card.status === "reward_ready").length
  const repeatClients = cards.filter((card) => card.stamps > 1).length

  return NextResponse.json({
    ok: true,
    merchant,
    metrics: {
      totalCards: cards.length,
      rewardReadyCards,
      totalVisits: visits.length,
      repeatClients,
    },
    cards: cards
      .slice()
      .sort((a, b) => (a.lastVisitAt < b.lastVisitAt ? 1 : -1))
      .slice(0, 20),
  })
}
