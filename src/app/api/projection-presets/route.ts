import { NextResponse } from "next/server"

import { type BehaviorScenarioId } from "@/lib/behavior-engine"
import {
  buildProjectionOverrideMap,
  flattenDefaultProjectionProfiles,
  normalizePresetEntryInput,
  type ProjectionPresetRow,
} from "@/lib/projection-presets"
import { createClientSupabaseServer } from "@/lib/supabase/server"
import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

type PresetWritePayload = {
  entries?: Array<{
    merchantType: string
    scenarioId: BehaviorScenarioId
    profile: {
      revenueWeight: number
      returnsWeight: number
      primaryEffect: string
      secondaryEffect: string
      scenarioRole: string
    }
    isActive?: boolean
  }>
}

export async function GET(request: Request) {
  const service = createSupabaseServiceClient()
  const url = new URL(request.url)
  const activityFilter = url.searchParams.get("activity") ?? undefined

  const selectQuery = service
    .from("projection_presets")
    .select("activity_id, scenario_id, revenue_weight, returns_weight, primary_effect, secondary_effect, scenario_role")
    .eq("is_active", true)

  const query = activityFilter ? selectQuery.eq("activity_id", activityFilter) : selectQuery
  const { data, error } = await query

  if (error || !data || data.length === 0) {
    const fallbackRows = flattenDefaultProjectionProfiles(activityFilter)
    return NextResponse.json({
      ok: true,
      source: "defaults",
      overrides: buildProjectionOverrideMap(fallbackRows),
      rows: fallbackRows,
    })
  }

  const rows = data as ProjectionPresetRow[]

  return NextResponse.json({
    ok: true,
    source: "database",
    overrides: buildProjectionOverrideMap(rows),
    rows,
  })
}

export async function POST(request: Request) {
  const supabase = createClientSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const allowedAdminEmails = (process.env.CARDIN_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  const userEmail = (user.email ?? "").toLowerCase()
  if (allowedAdminEmails.length > 0 && !allowedAdminEmails.includes(userEmail)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const payload = (await request.json()) as PresetWritePayload
  const entries = payload.entries ?? []

  if (entries.length === 0) {
    return NextResponse.json({ ok: false, error: "entries_required" }, { status: 400 })
  }

  const rows = entries.map((entry) => ({
    ...normalizePresetEntryInput(entry),
    updated_by: user.id,
  }))

  const service = createSupabaseServiceClient()
  const { error } = await service
    .from("projection_presets")
    .upsert(rows, { onConflict: "activity_id,scenario_id" })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, updated: rows.length })
}
