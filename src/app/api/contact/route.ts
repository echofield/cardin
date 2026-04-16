import { NextResponse } from "next/server"

import { isEmailConfigured, sendContactEmails } from "@/lib/email"
import { buildContactMailto } from "@/lib/site-contact"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ContactPayload = {
  businessName?: string
  city?: string
  email?: string
  request?: string
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ContactPayload
  const businessName = (payload.businessName ?? "").trim()
  const city = (payload.city ?? "").trim()
  const email = (payload.email ?? "").trim()
  const requestText = (payload.request ?? "").trim() || "Recevoir le recapitulatif marchand et etre recontacte plus tard."

  const fallbackMailto = buildContactMailto(
    "Cardin - demande marchand",
    [
      "Bonjour Cardin,",
      "",
      requestText,
      "",
      `Nom du lieu : ${businessName}`,
      `Ville : ${city}`,
      `E-mail : ${email}`,
    ].join("\r\n"),
  )

  if (!businessName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_payload", fallbackMailto }, { status: 400 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: false, error: "email_not_configured", fallbackMailto }, { status: 503 })
  }

  try {
    await sendContactEmails({
      businessName,
      city,
      email,
      request: requestText,
      origin: new URL(request.url).origin,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "contact_send_failed"
    return NextResponse.json({ ok: false, error: message, fallbackMailto }, { status: 500 })
  }
}