import { NextResponse } from "next/server"
import { createClientSupabaseServer } from "@/lib/supabase/server"
import { closeSeasonAndSelectWinner } from "@/lib/winner-selection"
import { startNewSeason, getSeason } from "@/lib/season-progression"

export const dynamic = "force-dynamic"

type CloseSeasonPayload = {
  seasonId: string
}

/**
 * POST /api/season/close
 * Manually close a season and select winner
 */
export async function POST(request: Request) {
  const supabase = createClientSupabaseServer()

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  // Parse payload
  let payload: CloseSeasonPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const { seasonId } = payload

  // Validate required fields
  if (!seasonId) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_required_fields",
        required: ["seasonId"],
      },
      { status: 400 }
    )
  }

  // Get season and verify ownership
  const season = await getSeason(supabase, seasonId)

  if (!season) {
    return NextResponse.json({ ok: false, error: "season_not_found" }, { status: 404 })
  }

  if (season.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  // Check if season is already closed
  if (season.closed_at) {
    return NextResponse.json(
      {
        ok: false,
        error: "season_already_closed",
        closedAt: season.closed_at,
        winnerId: season.winner_card_id,
      },
      { status: 400 }
    )
  }

  // Close season and select winner
  try {
    const result = await closeSeasonAndSelectWinner(supabase, seasonId)

    // Start new season
    const newSeason = await startNewSeason(supabase, season.merchant_id, season)

    // Get winner card details if exists
    let winnerCard = null
    if (result.winnerId) {
      const { data: card } = await supabase
        .from("cards")
        .select("id, customer_name")
        .eq("id", result.winnerId)
        .single()

      winnerCard = card
        ? {
            id: card.id,
            customerName: card.customer_name,
          }
        : null
    }

    return NextResponse.json({
      ok: true,
      closedSeason: {
        id: seasonId,
        seasonNumber: season.season_number,
        closedAt: result.selectionMetadata.selectedAt,
        winner: winnerCard
          ? {
              ...winnerCard,
              weight: result.eligibleCards.find((c) => c.cardId === result.winnerId)
                ?.totalWeight,
            }
          : null,
        eligibleCards: result.eligibleCards.length,
        totalWeight: result.selectionMetadata.totalWeight,
      },
      newSeason: {
        id: newSeason.id,
        seasonNumber: newSeason.season_number,
        startedAt: newSeason.started_at,
        endsAt: newSeason.ends_at,
      },
    })
  } catch (error) {
    console.error("Season close error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: "season_close_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
