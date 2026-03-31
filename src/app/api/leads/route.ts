import { NextResponse } from "next/server"

import { createClientSupabaseServer } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = createClientSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const payload = (await request.json()) as { name?: string }
  const name = (payload.name ?? user.user_metadata?.full_name ?? user.email ?? "Marchand").trim()
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

  return NextResponse.json({
    ok: true,
    leadId: `LD-${user.id.slice(0, 8)}`,
    merchantId: user.id,
    confirmation: "Compte marchand prêt.",
    dashboardPath: `/merchant/${user.id}`,
    scanPath: `/scan/${user.id}`,
    dashboardUrl: `${origin}/merchant/${user.id}`,
    scanUrl: `${origin}/scan/${user.id}`,
    qrCodeUrl: `${origin}/api/merchant/${user.id}/qr`,
  })
}
