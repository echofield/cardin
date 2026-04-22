import { NextResponse } from "next/server"

import { isEmailConfigured, sendFieldCaptureEmail } from "@/lib/email"
import { createFieldCapture, updateFieldCaptureEmailStatus } from "@/lib/field-captures"
import { normalizePhone } from "@/lib/phone"
import { buildContactMailto } from "@/lib/site-contact"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type FieldCapturePayload = {
  businessName?: string
  contactName?: string
  whatsapp?: string
  city?: string
  email?: string
  nextAction?: string
  note?: string
  source?: string | null
}

function clean(value?: string, max = 160) {
  return (value ?? "").trim().slice(0, max)
}

function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function buildFieldCaptureMailto(input: {
  businessName: string
  contactName: string
  whatsapp: string
  city: string
  email: string
  nextAction: string
  note: string
  source: string
}) {
  return buildContactMailto(
    "Cardin · capture terrain",
    [
      "Bonjour Cardin,",
      "",
      "Nouvelle capture terrain.",
      "",
      `Lieu : ${input.businessName}`,
      `Contact : ${input.contactName || "—"}`,
      `WhatsApp : ${input.whatsapp}`,
      `Ville : ${input.city || "—"}`,
      `E-mail : ${input.email || "—"}`,
      `Prochaine étape : ${input.nextAction || "—"}`,
      `Note : ${input.note || "—"}`,
      `Source : ${input.source || "terrain"}`,
    ].join("\r\n"),
  )
}

function buildWhatsappHref(whatsapp: string, businessName: string, nextAction: string) {
  const { canonical } = normalizePhone(whatsapp)
  if (!canonical) return null

  const digits = canonical.replace(/[^\d]/g, "")
  const message = [
    `Bonjour ${businessName},`,
    "ici Cardin.",
    nextAction ? `Comme convenu : ${nextAction}.` : "Je vous recontacte comme convenu.",
  ].join("\n")

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export async function POST(request: Request) {
  const payload = (await request.json()) as FieldCapturePayload
  const businessName = clean(payload.businessName, 140)
  const contactName = clean(payload.contactName, 120)
  const whatsapp = clean(payload.whatsapp, 40)
  const city = clean(payload.city, 120)
  const email = clean(payload.email, 160).toLowerCase()
  const nextAction = clean(payload.nextAction, 160)
  const note = clean(payload.note, 400)
  const source = clean(payload.source ?? "terrain", 60) || "terrain"
  const fallbackMailto = buildFieldCaptureMailto({
    businessName,
    contactName,
    whatsapp,
    city,
    email,
    nextAction,
    note,
    source,
  })

  if (!businessName || !whatsapp) {
    return NextResponse.json({ ok: false, error: "invalid_payload", fallbackMailto }, { status: 400 })
  }

  if (!normalizePhone(whatsapp).canonical) {
    return NextResponse.json({ ok: false, error: "invalid_whatsapp", fallbackMailto }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email", fallbackMailto }, { status: 400 })
  }

  let persisted = false
  let captureId: string | null = null
  let storageKind: "field_captures" | "cardin_pages" | null = null
  let persistenceError: string | null = null

  try {
    const capture = await createFieldCapture({
      businessName,
      contactName,
      whatsapp,
      city,
      email,
      nextAction,
      note,
      source,
    })
    persisted = true
    captureId = capture.id
    storageKind = capture.storageKind
  } catch (error) {
    persistenceError = error instanceof Error ? error.message : "field_capture_persist_failed"
    console.warn("field_capture_persist_failed", persistenceError)
  }

  let emailSent = false
  let emailError: string | null = null

  if (isEmailConfigured()) {
    try {
      await sendFieldCaptureEmail({
        businessName,
        contactName,
        whatsapp,
        city,
        email,
        nextAction,
        note,
        source,
        origin: new URL(request.url).origin,
      })
      emailSent = true
    } catch (error) {
      emailError = error instanceof Error ? error.message : "field_capture_email_failed"
      console.warn("field_capture_email_failed", emailError)
    }
  } else {
    emailError = "email_not_configured"
  }

  if (captureId && storageKind) {
    try {
      await updateFieldCaptureEmailStatus({ id: captureId, storageKind, emailSent, emailError })
    } catch (error) {
      console.warn("field_capture_email_status_update_failed", error)
    }
  }

  if (persisted || emailSent) {
    return NextResponse.json({
      ok: true,
      persisted,
      storageKind,
      emailSent,
      captureId,
      whatsappHref: buildWhatsappHref(whatsapp, businessName, nextAction),
      fallbackMailto,
      persistenceError,
      emailError,
    })
  }

  return NextResponse.json(
    { ok: false, error: persistenceError ?? emailError ?? "field_capture_failed", fallbackMailto },
    { status: 500 },
  )
}
