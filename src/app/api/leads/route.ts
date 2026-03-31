import { NextResponse } from "next/server"

import { appendRecord } from "@/lib/server-storage"

type LeadPayload = {
  name?: string
  phone?: string
  businessType?: string
  city?: string
  callbackSlot?: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeadPayload

    const name = (payload.name ?? "").trim()
    const phone = (payload.phone ?? "").trim()
    const businessType = (payload.businessType ?? "").trim()
    const city = (payload.city ?? "").trim()
    const callbackSlot = (payload.callbackSlot ?? "").trim()

    if (!name || !phone || !businessType || !city || !callbackSlot) {
      return NextResponse.json({ ok: false, error: "missing_required_fields" }, { status: 400 })
    }

    const leadId = `LD-${Date.now().toString().slice(-6)}`

    await appendRecord("leads.json", {
      id: leadId,
      name,
      phone,
      businessType,
      city,
      callbackSlot,
      status: "new",
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      leadId,
      confirmation: `Parfait. Nous vous rappelons sur le créneau ${callbackSlot}.`,
    })
  } catch {
    return NextResponse.json({ ok: false, error: "lead_submission_failed" }, { status: 500 })
  }
}
