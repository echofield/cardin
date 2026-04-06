import { NextResponse } from "next/server"
import { createClientSupabaseServer } from "@/lib/supabase/server"
import { createInvitation, canInvite } from "@/lib/domino-engine"

export const dynamic = "force-dynamic"

type InvitePayload = {
  parentCardId: string
  childCustomerName: string
  seasonId: string
}

/**
 * POST /api/season/invite
 * Create an invitation (Domino/Diamond branching)
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
  let payload: InvitePayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const { parentCardId, childCustomerName, seasonId } = payload

  // Validate required fields
  if (!parentCardId || !childCustomerName || !seasonId) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_required_fields",
        required: ["parentCardId", "childCustomerName", "seasonId"],
      },
      { status: 400 }
    )
  }

  // Validate customer name
  const trimmedName = childCustomerName.trim()
  if (trimmedName.length === 0) {
    return NextResponse.json(
      { ok: false, error: "customer_name_required" },
      { status: 400 }
    )
  }

  // Verify parent card belongs to authenticated merchant
  const { data: parentCard, error: cardError } = await supabase
    .from("cards")
    .select("id, merchant_id, customer_name")
    .eq("id", parentCardId)
    .single()

  if (cardError || !parentCard) {
    return NextResponse.json({ ok: false, error: "parent_card_not_found" }, { status: 404 })
  }

  if (parentCard.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  // Verify season belongs to merchant
  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id, merchant_id, closed_at")
    .eq("id", seasonId)
    .single()

  if (seasonError || !season) {
    return NextResponse.json({ ok: false, error: "season_not_found" }, { status: 404 })
  }

  if (season.merchant_id !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  // Check if parent can invite (eligibility + capacity)
  const validation = await canInvite(supabase, parentCardId, seasonId)

  if (!validation.canInvite) {
    return NextResponse.json(
      {
        ok: false,
        error: validation.reason,
        details: {
          branchCapacity: validation.branchCapacity,
          remainingSlots: validation.remainingSlots,
        },
      },
      { status: 403 }
    )
  }

  // Create the invitation
  try {
    const result = await createInvitation(
      supabase,
      parentCardId,
      seasonId,
      trimmedName,
      user.id
    )

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error ?? "invitation_creation_failed",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      invitation: {
        parentCard: {
          id: parentCardId,
          customerName: parentCard.customer_name,
        },
        childCard: result.childCard,
        referral: {
          id: result.referral?.id,
          invitedAt: result.referral?.invited_at,
          branchLevel: result.referral?.branch_level,
        },
        remainingSlots: result.remainingSlots,
      },
    })
  } catch (error) {
    console.error("Invitation creation error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: "internal_server_error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
