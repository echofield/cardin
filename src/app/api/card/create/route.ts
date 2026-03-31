import { NextResponse } from "next/server"

import { addVisit, getMerchantById, upsertCard } from "@/lib/loyalty-storage"
import type { LoyaltyCardRecord } from "@/lib/loyalty"

type CreateCardPayload = {
  merchantId?: string
  customerName?: string
  customerPhone?: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateCardPayload
    const merchantId = (payload.merchantId ?? "").trim()
    const customerName = (payload.customerName ?? "").trim()
    const customerPhone = (payload.customerPhone ?? "").trim()

    if (!merchantId || !customerName) {
      return NextResponse.json({ ok: false, error: "missing_required_fields" }, { status: 400 })
    }

    const merchant = await getMerchantById(merchantId)

    if (!merchant) {
      return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
    }

    const nowIso = new Date().toISOString()
    const cardId = `CRD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`

    const nextCard: LoyaltyCardRecord = {
      id: cardId,
      merchantId,
      customerName,
      customerPhone: customerPhone || undefined,
      stamps: 1,
      targetVisits: merchant.loyaltyConfig.targetVisits,
      rewardLabel: merchant.loyaltyConfig.rewardLabel,
      status: merchant.loyaltyConfig.targetVisits <= 1 ? "reward_ready" : "active",
      createdAt: nowIso,
      lastVisitAt: nowIso,
    }

    await upsertCard(nextCard)
    await addVisit({
      id: `VIS-${Date.now().toString().slice(-8)}`,
      merchantId,
      cardId: nextCard.id,
      createdAt: nowIso,
    })

    const origin = new URL(request.url).origin

    return NextResponse.json({
      ok: true,
      card: nextCard,
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        businessType: merchant.businessType,
      },
      cardUrl: `${origin}/card/${nextCard.id}`,
      appleWalletUrl: `${origin}/api/wallet/apple/${nextCard.id}`,
      googleWalletUrl: `${origin}/api/wallet/google/${nextCard.id}`,
    })
  } catch {
    return NextResponse.json({ ok: false, error: "card_creation_failed" }, { status: 500 })
  }
}
