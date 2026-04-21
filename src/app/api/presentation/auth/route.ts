import { NextResponse } from "next/server"

import { getPresentationToken, PRESENTATION_COOKIE_NAME, verifyPresentationPassword } from "@/lib/presentation-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: "unlock" | "logout"; password?: string }
    const action = body.action ?? "unlock"

    if (action === "logout") {
      const response = NextResponse.json({ ok: true })
      response.cookies.set({
        name: PRESENTATION_COOKIE_NAME,
        value: "",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      })
      return response
    }

    if (!verifyPresentationPassword(body.password ?? "")) {
      return NextResponse.json({ ok: false, error: "Mot de passe invalide." }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set({
      name: PRESENTATION_COOKIE_NAME,
      value: getPresentationToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "presentation_auth_failed"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
