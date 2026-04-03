import { NextResponse } from "next/server"

import { buildBehaviorPlan, normalizeEngineActivityId } from "@/lib/behavior-engine"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type EntryMode = "commerce" | "creator" | "experience"

const ENTRY_MODE_LABELS: Record<EntryMode, string> = {
  commerce: "Espace Commerce",
  creator: "Espace Creator / Community",
  experience: "Espace Experience / Brand",
}

export async function POST(request: Request) {
  const supabase = createClientSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const payload = (await request.json()) as { name?: string; entryMode?: string; activityTemplateId?: string }
  const entryMode = normalizeEntryMode(payload.entryMode)
  const activityTemplateId = normalizeEngineActivityId(payload.activityTemplateId)
  const name = (payload.name ?? user.user_metadata?.full_name ?? user.email ?? "Activite").trim()
  const email = user.email ?? ""

  if (!email) {
    return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 })
  }

  const { error } = await supabase.from("merchants").upsert(
    {
      id: user.id,
      name,
      email,
    },
    { onConflict: "id" }
  )

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const origin = new URL(request.url).origin
  const enginePlan = buildBehaviorPlan({ merchantType: activityTemplateId })

  return NextResponse.json({
    ok: true,
    leadId: `LD-${user.id.slice(0, 8)}`,
    merchantId: user.id,
    entryMode,
    confirmation: `${ENTRY_MODE_LABELS[entryMode]} prêt.`,
    dashboardPath: `/merchant/${user.id}`,
    scanPath: `/scan/${user.id}`,
    dashboardUrl: `${origin}/merchant/${user.id}`,
    scanUrl: `${origin}/scan/${user.id}`,
    qrCodeUrl: `${origin}/api/merchant/${user.id}/qr`,
    enginePlan,
  })
}

function normalizeEntryMode(value?: string): EntryMode {
  if (value === "creator" || value === "experience") {
    return value
  }

  return "commerce"
}
