import { normalizePhone } from "@/lib/phone"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export type ParcoursRecoveryState = "activation" | "projection" | "paid" | null

export type ParcoursRecoveryLookup = {
  cardinPageSlug: string | null
  cardinPageState: ParcoursRecoveryState
  hasPaidCheckout: boolean
  businessName: string | null
}

const EMPTY: ParcoursRecoveryLookup = {
  cardinPageSlug: null,
  cardinPageState: null,
  hasPaidCheckout: false,
  businessName: null,
}

type CardinPageMatch = {
  slug: string
  business_name: string
  paid_at: string | null
  reading_payload: {
    contactEmail?: string | null
    contactPhone?: string | null
  } | null
}

function fromPage(page: CardinPageMatch | null, hasPaidCheckout: boolean): ParcoursRecoveryLookup {
  if (!page) return { ...EMPTY, hasPaidCheckout }
  return {
    cardinPageSlug: page.slug,
    cardinPageState: page.paid_at ? "activation" : "projection",
    hasPaidCheckout: hasPaidCheckout || Boolean(page.paid_at),
    businessName: page.business_name ?? null,
  }
}

export async function lookupParcoursRecoveryByEmail(
  email: string | null | undefined,
): Promise<ParcoursRecoveryLookup> {
  const normalized = typeof email === "string" ? email.trim().toLowerCase() : ""
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return EMPTY
  }

  try {
    const supabase = createSupabaseServiceClient()

    const [pageResult, paymentResult] = await Promise.all([
      supabase
        .from("cardin_pages")
        .select("slug,business_name,paid_at,reading_payload")
        .filter("reading_payload->>contactEmail", "ilike", normalized)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle<CardinPageMatch>(),
      supabase
        .from("stripe_webhook_events")
        .select("status")
        .ilike("customer_email", normalized)
        .eq("status", "processed")
        .limit(1)
        .maybeSingle<{ status: string }>(),
    ])

    return fromPage(pageResult.data ?? null, Boolean(paymentResult.data))
  } catch {
    return EMPTY
  }
}

export async function lookupParcoursRecoveryByPhone(
  phone: string | null | undefined,
): Promise<ParcoursRecoveryLookup> {
  const { canonical, suffix } = normalizePhone(phone)
  if (!canonical && !suffix) {
    return EMPTY
  }

  try {
    const supabase = createSupabaseServiceClient()

    let page: CardinPageMatch | null = null

    if (canonical) {
      const exact = await supabase
        .from("cardin_pages")
        .select("slug,business_name,paid_at,reading_payload")
        .filter("reading_payload->>contactPhone", "eq", canonical)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle<CardinPageMatch>()
      page = exact.data ?? null
    }

    if (!page && suffix) {
      const suffixMatch = await supabase
        .from("cardin_pages")
        .select("slug,business_name,paid_at,reading_payload")
        .filter("reading_payload->>contactPhone", "ilike", `%${suffix}`)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle<CardinPageMatch>()
      page = suffixMatch.data ?? null
    }

    let hasPaidCheckout = false
    if (suffix) {
      const paymentMatch = await supabase
        .from("stripe_webhook_events")
        .select("status,payload")
        .eq("status", "processed")
        .filter("payload->data->object->customer_details->>phone", "ilike", `%${suffix}`)
        .limit(1)
        .maybeSingle<{ status: string }>()
      hasPaidCheckout = Boolean(paymentMatch.data)
    }

    return fromPage(page, hasPaidCheckout)
  } catch {
    return EMPTY
  }
}

export async function lookupParcoursRecovery(input: {
  contactType: "whatsapp" | "email"
  contactValue: string
}): Promise<ParcoursRecoveryLookup> {
  if (input.contactType === "email") {
    return lookupParcoursRecoveryByEmail(input.contactValue)
  }
  return lookupParcoursRecoveryByPhone(input.contactValue)
}
