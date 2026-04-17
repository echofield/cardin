import type { CardinClienteleId, CardinMerchantInput, CardinReturnRhythmId, CardinWeakMomentId } from "@/lib/cardin-page-data"
import type { LandingWorldId } from "@/lib/landing-content"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

type CardinPageRow = {
  slug: string
  business_name: string
  world_id: LandingWorldId
  reading_payload: {
    merchantId?: string
    weakMomentId?: CardinWeakMomentId
    returnRhythmId?: CardinReturnRhythmId
    clienteleId?: CardinClienteleId
    note?: string
    contactEmail?: string
  } | null
  paid_at: string | null
  stripe_session_id: string | null
}

export type StoredCardinPage = {
  slug: string
  businessName: string
  worldId: LandingWorldId
  merchantId?: string
  weakMomentId?: CardinWeakMomentId
  returnRhythmId?: CardinReturnRhythmId
  clienteleId?: CardinClienteleId
  note?: string
  contactEmail?: string
  paidAt: string | null
  stripeSessionId: string | null
}

export async function getStoredCardinPageBySlug(slug: string): Promise<StoredCardinPage | null> {
  try {
    const supabase = createSupabaseServiceClient()
    const { data, error } = await supabase
      .from("cardin_pages")
      .select("slug,business_name,world_id,reading_payload,paid_at,stripe_session_id")
      .eq("slug", slug)
      .maybeSingle<CardinPageRow>()

    if (error || !data) {
      return null
    }

    return {
      slug: data.slug,
      businessName: data.business_name,
      worldId: data.world_id,
      merchantId: data.reading_payload?.merchantId,
      weakMomentId: data.reading_payload?.weakMomentId,
      returnRhythmId: data.reading_payload?.returnRhythmId,
      clienteleId: data.reading_payload?.clienteleId,
      note: data.reading_payload?.note,
      contactEmail: data.reading_payload?.contactEmail,
      paidAt: data.paid_at,
      stripeSessionId: data.stripe_session_id,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      console.warn("cardin_page_read_failed", message)
    }
    return null
  }
}

export async function upsertCardinPage(input: CardinMerchantInput) {
  const supabase = createSupabaseServiceClient()
  const { data: existing } = await supabase.from("cardin_pages").select("reading_payload").eq("slug", input.slug).maybeSingle<{ reading_payload?: CardinPageRow["reading_payload"] }>()
  const merchantId = input.merchantId || existing?.reading_payload?.merchantId || null
  const { error } = await supabase.from("cardin_pages").upsert(
    {
      slug: input.slug,
      business_name: input.businessName,
      world_id: input.worldId,
      reading_payload: {
        merchantId,
        weakMomentId: input.weakMomentId,
        returnRhythmId: input.returnRhythmId,
        clienteleId: input.clienteleId,
        note: input.note || null,
        contactEmail: input.contactEmail || null,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  )

  if (error) {
    throw new Error(error.message)
  }
}

export async function linkCardinCheckoutSession(slug: string, sessionId: string) {
  const supabase = createSupabaseServiceClient()
  const { error } = await supabase
    .from("cardin_pages")
    .update({
      stripe_session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)

  if (error) {
    throw new Error(error.message)
  }
}

export async function markCardinPagePaid(slug: string, sessionId: string) {
  const supabase = createSupabaseServiceClient()
  const { error } = await supabase
    .from("cardin_pages")
    .update({
      paid_at: new Date().toISOString(),
      stripe_session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)

  if (error) {
    throw new Error(error.message)
  }
}
