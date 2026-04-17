import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { markCardinPagePaid } from "@/lib/cardin-page-store"
import { sendStripeCheckoutEmails } from "@/lib/email"
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe-server"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function claimEvent(event: Stripe.Event) {
  try {
    const supabase = createSupabaseServiceClient()
    const { data: existing } = await supabase
      .from("stripe_webhook_events")
      .select("event_id,status")
      .eq("event_id", event.id)
      .maybeSingle()

    if (existing?.status === "processed") {
      return { shouldProcess: false }
    }

    const session = event.data.object as Partial<Stripe.Checkout.Session>
    await supabase.from("stripe_webhook_events").upsert(
      {
        event_id: event.id,
        event_type: event.type,
        status: "processing",
        checkout_session_id: typeof session.id === "string" ? session.id : null,
        customer_email:
          typeof session.customer_email === "string"
            ? session.customer_email
            : typeof session.customer_details?.email === "string"
              ? session.customer_details.email
              : null,
        payload: event as unknown as Record<string, unknown>,
        last_error: null,
      },
      { onConflict: "event_id" },
    )
  } catch (error) {
    console.warn("stripe_webhook_store_unavailable", error)
  }

  return { shouldProcess: true }
}

async function markEventStatus(eventId: string, status: "processed" | "failed", lastError?: string) {
  try {
    const supabase = createSupabaseServiceClient()
    await supabase
      .from("stripe_webhook_events")
      .update({
        status,
        processed_at: status === "processed" ? new Date().toISOString() : null,
        last_error: lastError ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("event_id", eventId)
  } catch (error) {
    console.warn("stripe_webhook_status_update_failed", error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, origin: string) {
  const cardinSlug = typeof session.metadata?.cardin_slug === "string" ? session.metadata.cardin_slug : null
  if (cardinSlug) {
    await markCardinPagePaid(cardinSlug, session.id)
  }

  await sendStripeCheckoutEmails({
    sessionId: session.id,
    amountTotal: session.amount_total,
    currency: session.currency,
    customerEmail: session.customer_details?.email ?? session.customer_email,
    customerName: session.customer_details?.name ?? null,
    paymentLinkId: typeof session.payment_link === "string" ? session.payment_link : null,
    origin,
  })
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 })
  }

  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(payload, signature, getStripeWebhookSecret())
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_webhook_signature"
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }

  const claim = await claimEvent(event)
  if (!claim.shouldProcess) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, new URL(request.url).origin)
        break
      default:
        break
    }

    await markEventStatus(event.id, "processed")
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "stripe_webhook_handler_failed"
    await markEventStatus(event.id, "failed", message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
