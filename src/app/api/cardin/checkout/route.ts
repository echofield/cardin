import { NextResponse } from "next/server"

import {
  buildCardinMerchantInput,
  isCardinClienteleId,
  isCardinReturnRhythmId,
  isCardinWeakMomentId,
  isLandingWorldId,
} from "@/lib/cardin-page-data"
import { linkCardinCheckoutSession, upsertCardinPage } from "@/lib/cardin-page-store"
import { LANDING_PRICING, LANDING_WORLDS } from "@/lib/landing-content"
import { getStripeClient } from "@/lib/stripe-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Payload = {
  slug?: string
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
    !payload.slug ||
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

  if (input.slug !== payload.slug) {
    return NextResponse.json({ ok: false, error: "slug_mismatch" }, { status: 400 })
  }

  try {
    await upsertCardinPage(input)

    const origin = process.env.CARDIN_SITE_URL?.trim() || new URL(request.url).origin
    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/cardin/${input.slug}`,
      cancel_url: `${origin}/cardin/${input.slug}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: LANDING_PRICING.activationFee * 100,
            product_data: {
              name: `Saison Cardin — ${input.businessName}`,
              description: `Ouverture Cardin pour ${LANDING_WORLDS[input.worldId].label.toLowerCase()} · mise en place sous 48 h`,
            },
          },
        },
      ],
      metadata: {
        cardin_slug: input.slug,
        business_name: input.businessName,
        world_id: input.worldId,
      },
    })

    await linkCardinCheckoutSession(input.slug, session.id)
    return NextResponse.json({ ok: true, url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "cardin_checkout_failed"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
