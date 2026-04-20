import { NextResponse } from "next/server"

import { buildContactMailto } from "@/lib/site-contact"
import { isEmailConfigured, sendRevenirCaptureEmails } from "@/lib/email"
import { lookupParcoursRecovery } from "@/lib/parcours-recovery"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RevenirPayload = {
  businessName?: string
  contactType?: string
  contactValue?: string
  source?: string | null
}

function normalizeBusinessName(value?: string) {
  return (value ?? "").trim().slice(0, 140)
}

function normalizeContactType(value?: string): "whatsapp" | "email" {
  return value === "email" ? "email" : "whatsapp"
}

function normalizeContactValue(value?: string) {
  return (value ?? "").trim().slice(0, 160)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPhone(value: string) {
  const digits = value.replace(/[^\d+]/g, "")
  return digits.length >= 8
}

function buildFallbackMailtoForRevenir(
  businessName: string,
  contactType: "whatsapp" | "email",
  contactValue: string,
  source: string | null | undefined,
) {
  const sourceLine = source?.trim() ? source.trim() : "direct"
  return buildContactMailto(
    "Cardin · revenir plus tard",
    [
      "Bonjour Cardin,",
      "",
      "Je souhaite retrouver mon accès Cardin plus tard.",
      "",
      `Nom du lieu : ${businessName}`,
      `${contactType === "whatsapp" ? "WhatsApp" : "E-mail"} : ${contactValue}`,
      `Source : ${sourceLine}`,
    ].join("\r\n"),
  )
}

export async function POST(request: Request) {
  const payload = (await request.json()) as RevenirPayload
  const businessName = normalizeBusinessName(payload.businessName)
  const contactType = normalizeContactType(payload.contactType)
  const contactValue = normalizeContactValue(payload.contactValue)
  const source = payload.source ?? null
  const fallbackMailto = buildFallbackMailtoForRevenir(businessName, contactType, contactValue, source)

  if (!businessName || !contactValue) {
    return NextResponse.json({ ok: false, error: "invalid_payload", fallbackMailto }, { status: 400 })
  }

  if (contactType === "email" && !isValidEmail(contactValue)) {
    return NextResponse.json({ ok: false, error: "invalid_email", fallbackMailto }, { status: 400 })
  }

  if (contactType === "whatsapp" && !isValidPhone(contactValue)) {
    return NextResponse.json({ ok: false, error: "invalid_phone", fallbackMailto }, { status: 400 })
  }

  const recovery = await lookupParcoursRecovery({ contactType, contactValue }).catch((error) => {
    console.warn("parcours_recovery_lookup_failed", error)
    return null
  })

  const recoveryUrl = recovery?.cardinPageSlug
    ? `/cardin/${recovery.cardinPageSlug}${recovery.cardinPageState === "projection" ? "?state=projection" : ""}`
    : null

  let emailSent = false
  let emailError: string | null = null

  if (isEmailConfigured()) {
    try {
      await sendRevenirCaptureEmails({
        businessName,
        contactType,
        contactValue,
        origin: new URL(request.url).origin,
        source,
      })
      emailSent = true
    } catch (error) {
      emailError = error instanceof Error ? error.message : "revenir_send_failed"
      console.warn("revenir_send_failed", error)
    }
  } else {
    emailError = "email_not_configured"
  }

  if (recoveryUrl || emailSent) {
    return NextResponse.json({
      ok: true,
      resumeUrl: "/parcours/lecture",
      offerUrl: "/parcours/offre",
      contactType,
      recoveryUrl,
      recoveryState: recovery?.cardinPageState ?? null,
      hasPaidCheckout: recovery?.hasPaidCheckout ?? false,
      emailSent,
    })
  }

  return NextResponse.json(
    { ok: false, error: emailError ?? "revenir_send_failed", fallbackMailto },
    { status: emailError === "email_not_configured" ? 503 : 500 },
  )
}
