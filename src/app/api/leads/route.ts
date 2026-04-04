import { NextResponse } from "next/server"

import { buildBehaviorPlan, normalizeEngineActivityId } from "@/lib/behavior-engine"
import { createClientSupabaseServer } from "@/lib/supabase/server"

type EntryMode = "commerce" | "creator" | "experience"

const ENTRY_MODE_LABELS: Record<EntryMode, string> = {
  commerce: "Espace Commerce",
  creator: "Espace Creator / Community",
  experience: "Espace Experience / Brand",
}

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const supabase = createClientSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const payload = (await request.json()) as {
    name?: string
    entryMode?: string
    activityTemplateId?: string
    sharedUnlockObjective?: number
    sharedUnlockWindowDays?: number
    sharedUnlockOffer?: string
  }

  const entryMode = normalizeEntryMode(payload.entryMode)
  const activityTemplateId = normalizeEngineActivityId(payload.activityTemplateId)

  const name = (payload.name ?? user.user_metadata?.full_name ?? user.email ?? "Activite").trim()
  const email = user.email ?? ""

  if (!email) {
    return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 })
  }

  const sharedUnlockObjective = clampInt(payload.sharedUnlockObjective, 20, 10000, 120)
  const sharedUnlockWindowDays = clampInt(payload.sharedUnlockWindowDays, 3, 30, 7)
  const sharedUnlockOffer = normalizeOffer(payload.sharedUnlockOffer)

  const { error } = await supabase.from("merchants").upsert(
    {
      id: user.id,
      name,
      email,
      midpoint_mode: "recognition_only",
      target_visits: 10,
      reward_label: "1 recompense offerte",
      shared_unlock_enabled: true,
      shared_unlock_objective: sharedUnlockObjective,
      shared_unlock_window_days: sharedUnlockWindowDays,
      shared_unlock_offer: sharedUnlockOffer,
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
    confirmation: `${ENTRY_MODE_LABELS[entryMode]} pret.`,
    dashboardPath: `/merchant/${user.id}`,
    scanPath: `/scan/${user.id}`,
    dashboardUrl: `${origin}/merchant/${user.id}`,
    scanUrl: `${origin}/scan/${user.id}`,
    qrCodeUrl: `${origin}/api/merchant/${user.id}/qr`,
    enginePlan,
    setup: {
      objective: sharedUnlockObjective,
      activeWindowDays: sharedUnlockWindowDays,
      unlockedOffer: sharedUnlockOffer,
      midpointMode: "recognition_only",
    },
  })
}

function normalizeEntryMode(value?: string): EntryMode {
  if (value === "creator" || value === "experience") {
    return value
  }

  return "commerce"
}

function clampInt(value: number | undefined, min: number, max: number, fallback: number): number {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  if (parsed < min) {
    return min
  }

  if (parsed > max) {
    return max
  }

  return Math.round(parsed)
}

function normalizeOffer(value: string | undefined): string {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return "Offre collective de la semaine"
  return trimmed.slice(0, 140)
}
