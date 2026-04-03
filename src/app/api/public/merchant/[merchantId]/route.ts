import { NextResponse } from "next/server"

import { createSupabaseServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: { merchantId: string } }) {
  try {
    const supabase = createSupabaseServiceClient()

    const { data: merchant, error } = await supabase
      .from("merchants")
      .select("id, name, email, created_at")
      .eq("id", params.merchantId)
      .single()

    if (error || !merchant) {
      return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      merchant: {
        id: merchant.id,
        businessName: merchant.name,
        businessType: "Commerce",
        loyaltyConfig: {
          targetVisits: 10,
          rewardLabel: "1 récompense offerte",
        },
      },
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}