import QRCode from "qrcode"
import { NextResponse } from "next/server"

import { createClientSupabaseServer } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

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

  const { data: merchant, error } = await supabase.from("merchants").select("id").eq("id", params.merchantId).single()

  if (error || !merchant) {
    return NextResponse.json({ ok: false, error: "merchant_not_found" }, { status: 404 })
  }

  const origin = new URL(request.url).origin
  const scanUrl = `${origin}/scan/${params.merchantId}`

  const imageBuffer = await QRCode.toBuffer(scanUrl, {
    margin: 2,
    width: 920,
    color: {
      dark: "#173A2E",
      light: "#FDFCF8",
    },
  })

  return new Response(new Uint8Array(imageBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  })
}