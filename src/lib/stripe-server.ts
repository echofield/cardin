import Stripe from "stripe"

let stripeClient: Stripe | null = null

export function getStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY")
  }
  return secretKey
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET")
  }
  return webhookSecret
}

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient

  stripeClient = new Stripe(getStripeSecretKey())
  return stripeClient
}