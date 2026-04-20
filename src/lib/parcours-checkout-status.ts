import { createSupabaseServiceClient } from "@/lib/supabase/service"

export type ParcoursCheckoutStatus = {
  state: "processed" | "processing" | "missing" | "failed"
  businessName: string | null
  customerEmail: string | null
  amountPaid: number | null
  currency: string | null
  processedAt: string | null
  lastError: string | null
}

type StripeCustomField = {
  key?: string
  text?: { value?: string | null } | null
}

type StripeCheckoutSessionShape = {
  amount_total?: number | null
  currency?: string | null
  customer_email?: string | null
  customer_details?: { email?: string | null; name?: string | null } | null
  custom_fields?: StripeCustomField[] | null
  metadata?: Record<string, string> | null
}

type StripeEventPayloadShape = {
  data?: { object?: StripeCheckoutSessionShape | null } | null
}

function extractBusinessName(session: StripeCheckoutSessionShape | null | undefined): string | null {
  if (!session) return null
  const fromCustomField = session.custom_fields?.find((field) => field?.key === "business_name")?.text?.value
  if (typeof fromCustomField === "string" && fromCustomField.trim().length > 0) {
    return fromCustomField.trim()
  }
  const fromName = session.customer_details?.name
  if (typeof fromName === "string" && fromName.trim().length > 0) {
    return fromName.trim()
  }
  return null
}

export async function getParcoursCheckoutStatus(
  sessionId: string | null | undefined,
): Promise<ParcoursCheckoutStatus> {
  const empty: ParcoursCheckoutStatus = {
    state: "missing",
    businessName: null,
    customerEmail: null,
    amountPaid: null,
    currency: null,
    processedAt: null,
    lastError: null,
  }

  if (!sessionId || typeof sessionId !== "string" || sessionId.length === 0) {
    return empty
  }

  try {
    const supabase = createSupabaseServiceClient()
    const { data, error } = await supabase
      .from("stripe_webhook_events")
      .select("status,customer_email,payload,processed_at,last_error")
      .eq("checkout_session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return empty
    }

    const payload = (data.payload ?? {}) as StripeEventPayloadShape
    const session = payload.data?.object ?? null

    const status = typeof data.status === "string" ? data.status : "processing"
    const state: ParcoursCheckoutStatus["state"] =
      status === "processed" ? "processed" : status === "failed" ? "failed" : "processing"

    return {
      state,
      businessName: extractBusinessName(session),
      customerEmail: (data.customer_email as string | null) ?? session?.customer_email ?? null,
      amountPaid: typeof session?.amount_total === "number" ? session.amount_total : null,
      currency: typeof session?.currency === "string" ? session.currency : null,
      processedAt: (data.processed_at as string | null) ?? null,
      lastError: (data.last_error as string | null) ?? null,
    }
  } catch {
    return empty
  }
}
