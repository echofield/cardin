import { NextResponse } from "next/server"

import { linkCardinCheckoutSession, upsertParcoursDraft } from "@/lib/cardin-page-store"
import { LANDING_PRICING } from "@/lib/landing-content"
import {
  buildCheckoutMetadata,
  type ParcoursBasketKey,
  type ParcoursBusinessKey,
  type ParcoursDayKey,
  type ParcoursDiamondKey,
  type ParcoursFlowState,
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
  resonanceDay?: ParcoursDayKey | null
  threshold?: number
  who?: ParcoursWhoKey
  spread?: ParcoursSpreadKey
  diamond?: ParcoursDiamondKey
  decay?: number
}

function generateParcoursSlug() {
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `parcours-${uuid.replace(/-/g, "").slice(0, 16)}`
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

    const flowState: ParcoursFlowState = {
      business: payload.business ?? null,
      leak: payload.leak ?? null,
      volume: payload.volume ?? null,
      basket: payload.basket ?? null,
      rhythm: payload.rhythm ?? null,
      reward: payload.reward ?? "cafe",
      resonanceDay: payload.resonanceDay ?? null,
      threshold: clampInt(payload.threshold, 1, 10, 3),
      who: payload.who ?? "all",
      spread: payload.spread ?? "solo",
      diamond: payload.diamond ?? "dinner",
      decay: clampInt(payload.decay, 3, 14, 7),
    }

    const slug = generateParcoursSlug()

    let persistedSlug: string | null = null
    try {
      await upsertParcoursDraft({ slug, state: flowState })
      persistedSlug = slug
    } catch (persistError) {
      console.warn("parcours_draft_persist_failed", persistError)
    }

    const metadata = {
      ...buildCheckoutMetadata(flowState),
      flow: "parcours",
      ...(persistedSlug ? { cardin_slug: persistedSlug } : {}),
    }

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
      client_reference_id: persistedSlug ?? undefined,
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

    if (persistedSlug) {
      try {
        await linkCardinCheckoutSession(persistedSlug, session.id)
      } catch (linkError) {
        console.warn("parcours_draft_link_failed", linkError)
      }
    }

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
