import { normalizePhone } from "@/lib/phone"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export type FieldCaptureInput = {
  businessName: string
  contactName?: string | null
  whatsapp: string
  city?: string | null
  email?: string | null
  nextAction?: string | null
  note?: string | null
  source?: string | null
}

type FieldCaptureResult = {
  id: string
  whatsappCanonical: string | null
  storageKind: "field_captures" | "cardin_pages"
}

function buildTerrainSlug() {
  return `terrain-${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16).slice(-6)}`
}

export async function createFieldCapture(input: FieldCaptureInput) {
  const supabase = createSupabaseServiceClient()
  const normalizedPhone = normalizePhone(input.whatsapp)

  try {
    const { data, error } = await supabase
      .from("field_captures")
      .insert({
        business_name: input.businessName,
        contact_name: input.contactName || null,
        whatsapp_raw: input.whatsapp,
        whatsapp_canonical: normalizedPhone.canonical,
        city: input.city || null,
        email: input.email || null,
        next_action: input.nextAction || null,
        note: input.note || null,
        source: input.source || "terrain",
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single<{ id: string }>()

    if (error || !data) {
      throw new Error(error?.message || "field_capture_insert_failed")
    }

    return {
      id: data.id,
      whatsappCanonical: normalizedPhone.canonical,
      storageKind: "field_captures",
    } satisfies FieldCaptureResult
  } catch (error) {
    const slug = buildTerrainSlug()
    const { error: fallbackError } = await supabase.from("cardin_pages").insert({
      slug,
      business_name: input.businessName,
      world_id: "cafe",
      reading_payload: {
        flow: "terrain_capture",
        hidden: true,
        contactName: input.contactName || null,
        contactPhone: normalizedPhone.canonical || input.whatsapp,
        contactPhoneRaw: input.whatsapp,
        contactEmail: input.email || null,
        city: input.city || null,
        nextAction: input.nextAction || null,
        note: input.note || null,
        source: input.source || "terrain",
        fallbackReason: error instanceof Error ? error.message : "field_capture_insert_failed",
      },
      updated_at: new Date().toISOString(),
    })

    if (fallbackError) {
      throw new Error(fallbackError.message)
    }

    return {
      id: slug,
      whatsappCanonical: normalizedPhone.canonical,
      storageKind: "cardin_pages",
    } satisfies FieldCaptureResult
  }
}

export async function updateFieldCaptureEmailStatus(input: {
  id: string
  storageKind: "field_captures" | "cardin_pages"
  emailSent: boolean
  emailError?: string | null
}) {
  const supabase = createSupabaseServiceClient()
  if (input.storageKind === "field_captures") {
    const { error } = await supabase
      .from("field_captures")
      .update({
        email_sent: input.emailSent,
        email_error: input.emailError || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)

    if (error) {
      throw new Error(error.message)
    }
    return
  }

  const { data: existing } = await supabase
    .from("cardin_pages")
    .select("reading_payload")
    .eq("slug", input.id)
    .maybeSingle<{ reading_payload?: Record<string, unknown> | null }>()

  const { error } = await supabase
    .from("cardin_pages")
    .update({
      reading_payload: {
        ...(existing?.reading_payload ?? {}),
        emailSent: input.emailSent,
        emailError: input.emailError || null,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("slug", input.id)

  if (error) {
    throw new Error(error.message)
  }
}
