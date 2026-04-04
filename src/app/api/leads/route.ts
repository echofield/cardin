import { NextResponse } from "next/server"

import { buildBehaviorPlan, normalizeEngineActivityId } from "@/lib/behavior-engine"
import { getTemplateById } from "@/lib/merchant-templates"
import { createClientSupabaseServer } from "@/lib/supabase/server"

type EntryMode = "commerce" | "creator" | "experience"
type MidpointMode = "recognition_only" | "recognition_plus_boost"

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
    targetVisits?: number
    rewardLabel?: string
    midpointMode?: string
    sharedUnlockObjective?: number
    sharedUnlockWindowDays?: number
    sharedUnlockOffer?: string
  }

  const entryMode = normalizeEntryMode(payload.entryMode)
  const activityTemplateId = normalizeEngineActivityId(payload.activityTemplateId)
  const templateDefaults = getTemplateById(activityTemplateId).defaults

  const name = (payload.name ?? user.user_metadata?.full_name ?? user.email ?? "Activite").trim()
  const email = user.email ?? ""

  if (!email) {
    return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 })
  }

  const targetVisits = clampInt(payload.targetVisits, 3, 20, templateDefaults.target_visits)
  const rewardLabel = normalizeRewardLabel(payload.rewardLabel, templateDefaults.reward_label)
  const midpointMode = normalizeMidpointMode(payload.midpointMode)
  const sharedUnlockObjective = clampInt(payload.sharedUnlockObjective, 20, 10000, 120)
  const sharedUnlockWindowDays = clampInt(payload.sharedUnlockWindowDays, 3, 30, 7)
  const sharedUnlockOffer = normalizeOffer(payload.sharedUnlockOffer)

  const { error } = await supabase.from("merchants").upsert(
    {
      id: user.id,
      name,
      email,
      midpoint_mode: midpointMode,
      target_visits: targetVisits,
      reward_label: rewardLabel,
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
      targetVisits,
      rewardLabel,
      midpointMode,
      objective: sharedUnlockObjective,
      activeWindowDays: sharedUnlockWindowDays,
      unlockedOffer: sharedUnlockOffer,
    },
  })
}

function normalizeEntryMode(value?: string): EntryMode {
  if (value === "creator" || value === "experience") {
    return value
  }

  return "commerce"
}

function normalizeMidpointMode(value?: string): MidpointMode {
  return value === "recognition_plus_boost" ? "recognition_plus_boost" : "recognition_only"
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

function normalizeRewardLabel(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return fallback
  return trimmed.slice(0, 120)
}
