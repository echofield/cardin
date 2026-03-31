import { NextResponse } from "next/server"

import { createClientSupabaseServer } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/landing"

  if (code) {
    const supabase = createClientSupabaseServer()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const redirectUrl = new URL(next, requestUrl.origin)
  return NextResponse.redirect(redirectUrl)
}
