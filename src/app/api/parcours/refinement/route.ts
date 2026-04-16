import { NextResponse } from "next/server"

import { createClientSupabaseServer } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export type UsageFrame = "free" | "specific_hours" | "reserved" | "accompanied"

export type ParcoursRefinement = {
  productLabel: string
  publicPriceEur: number | null
  costEur: number | null
  usageFrame: UsageFrame
  updatedAt: string
}

function parseMoney(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) return raw
  if (typeof raw === "string") {
    const cleaned = raw.replace(",", ".").trim()
    if (cleaned === "") return null
    const n = Number(cleaned)
    if (Number.isFinite(n) && n >= 0) return n
  }
  return null
}

function isUsageFrame(v: unknown): v is UsageFrame {
  return v === "free" || v === "specific_hours" || v === "reserved" || v === "accompanied"
}

export async function POST(request: Request) {
  const supabase = createClientSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const productLabel = typeof payload.productLabel === "string" ? payload.productLabel.trim() : ""
  const publicPriceEur = parseMoney(payload.publicPriceEur)
  const costEur = parseMoney(payload.costEur)
  const usageFrame = isUsageFrame(payload.usageFrame) ? payload.usageFrame : "free"

  if (!productLabel) {
    return NextResponse.json({ ok: false, error: "product_label_required" }, { status: 400 })
  }

  const refinement: ParcoursRefinement = {
    productLabel: productLabel.slice(0, 120),
    publicPriceEur,
    costEur,
    usageFrame,
    updatedAt: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("merchants")
    .update({ parcours_refinement: refinement })
    .eq("id", user.id)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, refinement })
}
