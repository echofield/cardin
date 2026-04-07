import { NextResponse } from "next/server"

import { getActiveSeason, startNewSeason } from "@/lib/season-progression"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST() {
  const supabase = createClientSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const activeSeason = await getActiveSeason(supabase, user.id)
  if (activeSeason) {
    return NextResponse.json(
      {
        ok: false,
        error: "season_already_active",
        seasonId: activeSeason.id,
        seasonNumber: activeSeason.season_number,
      },
      { status: 400 }
    )
  }

  try {
    const season = await startNewSeason(supabase, user.id)

    return NextResponse.json({
      ok: true,
      season: {
        id: season.id,
        seasonNumber: season.season_number,
        startedAt: season.started_at,
        endsAt: season.ends_at,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "season_start_failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
