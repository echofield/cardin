import { randomUUID } from "node:crypto"

import { NextResponse } from "next/server"

import { merchantTemplates } from "@/lib/merchant-templates"
import { upsertMerchant } from "@/lib/loyalty-storage"
import type { MerchantRecord } from "@/lib/loyalty"
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

    const businessName = (payload.name ?? "").trim()
    const phone = (payload.phone ?? "").trim()
    const businessType = (payload.businessType ?? "").trim()
    const city = (payload.city ?? "").trim()
    const callbackSlot = (payload.callbackSlot ?? "").trim()

    if (!businessName || !phone || !businessType || !city || !callbackSlot) {
      return NextResponse.json({ ok: false, error: "missing_required_fields" }, { status: 400 })
    }

    const leadId = `LD-${Date.now().toString().slice(-6)}`
    const merchantId = `MRC-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`
    const template = merchantTemplates.find((entry) => entry.label === businessType) ?? merchantTemplates[0]

    const merchant: MerchantRecord = {
      id: merchantId,
      businessName,
      phone,
      businessType,
      city,
      callbackSlot,
      status: "active",
      createdAt: new Date().toISOString(),
      loyaltyConfig: {
        rewardType: template.defaults.reward_type,
        targetVisits: template.defaults.target_visits,
        rewardLabel: template.defaults.reward_label,
        reminderDelayDays: template.defaults.reminder_delay_days,
      },
    }

    await upsertMerchant(merchant)

    await appendRecord("leads.json", {
      id: leadId,
      leadToken: randomUUID(),
      merchantId,
      businessName,
      phone,
      businessType,
      city,
      callbackSlot,
      status: "converted_to_merchant",
      createdAt: new Date().toISOString(),
    })

    const origin = new URL(request.url).origin
    const dashboardPath = `/merchant/${merchantId}`
    const scanPath = `/scan/${merchantId}`

    return NextResponse.json({
      ok: true,
      leadId,
      merchantId,
      confirmation: `Parfait. Nous vous rappelons sur le créneau ${callbackSlot}.`,
      dashboardPath,
      scanPath,
      dashboardUrl: `${origin}${dashboardPath}`,
      scanUrl: `${origin}${scanPath}`,
      qrCodeUrl: `${origin}/api/merchant/${merchantId}/qr`,
    })
  } catch {
    return NextResponse.json({ ok: false, error: "lead_submission_failed" }, { status: 500 })
  }
}
