import { NextResponse } from "next/server"

import {
  buildCardinMerchantInput,
  isCardinClienteleId,
  isCardinReturnRhythmId,
  isCardinWeakMomentId,
  isLandingWorldId,
} from "@/lib/cardin-page-data"
import { upsertCardinPage } from "@/lib/cardin-page-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Payload = {
  businessName?: string
  worldId?: string
  weakMomentId?: string
  returnRhythmId?: string
  clienteleId?: string
  note?: string
  contactEmail?: string
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Payload
  const businessName = (payload.businessName ?? "").trim()

  if (
    !businessName ||
    !isLandingWorldId(payload.worldId) ||
    !isCardinWeakMomentId(payload.weakMomentId) ||
    !isCardinReturnRhythmId(payload.returnRhythmId) ||
    !isCardinClienteleId(payload.clienteleId)
  ) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 })
  }

  const input = buildCardinMerchantInput({
    businessName,
    worldId: payload.worldId,
    weakMomentId: payload.weakMomentId,
    returnRhythmId: payload.returnRhythmId,
    clienteleId: payload.clienteleId,
    note: payload.note,
    contactEmail: payload.contactEmail,
  })

  try {
    await upsertCardinPage(input)
    return NextResponse.json({ ok: true, slug: input.slug, url: `/cardin/${input.slug}` })
  } catch (error) {
    const message = error instanceof Error ? error.message : "cardin_page_create_failed"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
