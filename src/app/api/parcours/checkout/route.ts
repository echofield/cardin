import { NextResponse } from "next/server"

import { LANDING_PRICING } from "@/lib/landing-content"
import {
  buildCheckoutMetadata,
  type ParcoursBasketKey,
  type ParcoursBusinessKey,
  type ParcoursDiamondKey,
  type ParcoursLeakKey,
  type ParcoursRewardKey,
  type ParcoursRhythmKey,
  type ParcoursSpreadKey,
  type ParcoursWhoKey,
  type ParcoursVolumeKey,
} from "@/lib/parcours-v2"
import { getStripeClient } from "@/lib/stripe-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Payload = {
  business?: ParcoursBusinessKey | null
  leak?: ParcoursLeakKey | null
  volume?: ParcoursVolumeKey | null
  basket?: ParcoursBasketKey | null
  rhythm?: ParcoursRhythmKey | null
  reward?: ParcoursRewardKey
  threshold?: number
  who?: ParcoursWhoKey
  spread?: ParcoursSpreadKey
  diamond?: ParcoursDiamondKey
  decay?: number
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload
    const origin = process.env.CARDIN_SITE_URL?.trim() || new URL(request.url).origin
    const priceId =
      process.env.STRIPE_CARDIN_SEASON_PRICE_ID?.trim() ||
      process.env.STRIPE_PRICE_ID_CARDIN?.trim() ||
      process.env.STRIPE_PRICE_ID?.trim() ||
      ""

    const metadata = buildCheckoutMetadata({
      business: payload.business ?? null,
      leak: payload.leak ?? null,
      volume: payload.volume ?? null,
      basket: payload.basket ?? null,
      rhythm: payload.rhythm ?? null,
      reward: payload.reward ?? "cafe",
      threshold: clampInt(payload.threshold, 1, 10, 3),
      who: payload.who ?? "all",
      spread: payload.spread ?? "solo",
      diamond: payload.diamond ?? "dinner",
      decay: clampInt(payload.decay, 3, 14, 7),
    })

    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/parcours/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/parcours/offre`,
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: "business_name",
          label: { type: "custom", custom: "Nom du lieu" },
          type: "text",
        },
      ],
      line_items: priceId
        ? [
            {
              price: priceId,
              quantity: 1,
            },
          ]
        : [
            {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: LANDING_PRICING.activationFee * 100,
                product_data: {
                  name: "Saison Cardin",
                  description: "Saison Cardin · 90 jours · activation digitale sous 48 h",
                },
              },
            },
          ],
      metadata,
    })

    return NextResponse.json({ ok: true, url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "parcours_checkout_failed"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

function clampInt(value: number | undefined, min: number, max: number, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  if (parsed < min) return min
  if (parsed > max) return max
  return Math.round(parsed)
}
