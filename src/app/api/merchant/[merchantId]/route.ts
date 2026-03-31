import { NextResponse } from "next/server"

import { createClientSupabaseServer } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { merchantId: string } }) {
  const supabase = createClientSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  if (params.merchantId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const forwardUrl = new URL(request.url)
  forwardUrl.pathname = "/api/merchant"
  forwardUrl.searchParams.set("merchantId", params.merchantId)

  const res = await fetch(forwardUrl.toString(), {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  })

  const payload = await res.json()
  return NextResponse.json(payload, { status: res.status })
}
