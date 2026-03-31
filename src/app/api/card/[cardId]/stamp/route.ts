import { NextResponse } from "next/server"

import type { CardStatus } from "@/lib/loyalty"
import { addVisit, getCardById, upsertCard } from "@/lib/loyalty-storage"

type StampPayload = {
  action?: "stamp" | "redeem"
}

export async function POST(request: Request, { params }: { params: { cardId: string } }) {
  const card = await getCardById(params.cardId)

  if (!card) {
    return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 })
  }

  let payload: StampPayload = {}

  try {
    payload = (await request.json()) as StampPayload
  } catch {
    payload = {}
  }

  const action = payload.action ?? "stamp"

  if (action === "redeem") {
    const updatedCard = {
      ...card,
      stamps: 0,
      status: "active" as const,
      lastVisitAt: new Date().toISOString(),
    }

    await upsertCard(updatedCard)

    return NextResponse.json({ ok: true, card: updatedCard })
  }

  const nextStamps = card.stamps + 1
  const nextStatus: CardStatus = nextStamps >= card.targetVisits ? "reward_ready" : "active"
  const nowIso = new Date().toISOString()

  const updatedCard = {
    ...card,
    stamps: nextStamps,
    status: nextStatus,
    lastVisitAt: nowIso,
  }

  await upsertCard(updatedCard)
  await addVisit({
    id: `VIS-${Date.now().toString().slice(-8)}`,
    merchantId: card.merchantId,
    cardId: card.id,
    createdAt: nowIso,
  })

  return NextResponse.json({ ok: true, card: updatedCard })
}
