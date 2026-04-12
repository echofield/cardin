import { NextResponse } from "next/server"

import { getDemoWorldContent } from "@/lib/demo-content"
import { buildParcoursProjection } from "@/lib/parcours-projection"
import { flattenDefaultProjectionProfiles, buildProjectionOverrideMap, type ProjectionPresetRow } from "@/lib/projection-presets"
import { createSupabaseServiceClient } from "@/lib/supabase/service"
import type { LandingWorldId } from "@/lib/landing-content"

export const dynamic = "force-dynamic"

const WORLDS: LandingWorldId[] = ["cafe", "bar", "restaurant", "beaute", "boutique"]

function parseSummitMultiplier(raw: string | null): number {
  if (!raw) return 1
  const n = Number(raw)
  if (Number.isFinite(n) && n > 0 && n < 5) return n
  return 1
}

/**
 * GET /api/parcours/projection?world=restaurant&summit=1.25
 * Optional: activity=cafe → loads projection_presets overrides from DB when available (same as /api/projection-presets).
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const world = (url.searchParams.get("world") ?? "cafe") as LandingWorldId
  const summitMultiplier = parseSummitMultiplier(url.searchParams.get("summit"))
  const lite =
    url.searchParams.get("lite") === "1" || url.searchParams.get("lite") === "true"

  if (!WORLDS.includes(world)) {
    return NextResponse.json({ ok: false, error: "invalid_world" }, { status: 400 })
  }

  const demo = getDemoWorldContent(world)
  let overrides = undefined
  const service = createSupabaseServiceClient()
  const { data, error } = await service
    .from("projection_presets")
    .select("activity_id, scenario_id, revenue_weight, returns_weight, primary_effect, secondary_effect, scenario_role")
    .eq("is_active", true)
    .eq("activity_id", demo.merchantType)

  if (!error && data && data.length > 0) {
    const rows = data as ProjectionPresetRow[]
    overrides = buildProjectionOverrideMap(rows)
  } else {
    const fallback = flattenDefaultProjectionProfiles(demo.merchantType)
    overrides = buildProjectionOverrideMap(fallback)
  }

  const projection = buildParcoursProjection(
    {
      merchantType: demo.merchantType,
      monthlyClients: demo.monthlyClients,
      avgTicket: demo.avgTicket,
      inactivePercent: demo.inactivePercent,
      baseRecoveryPercent: demo.recoveryPercent,
      seasonMonths: demo.seasonMonths,
      summitMultiplier,
      lite,
    },
    overrides,
  )

  return NextResponse.json({
    ok: true,
    world,
    merchantType: demo.merchantType,
    summitMultiplier,
    lite,
    panierMoyen: demo.avgTicket,
    projection,
  })
}
