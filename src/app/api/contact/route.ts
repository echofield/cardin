import { NextResponse } from "next/server"

import { isEmailConfigured, sendContactEmails, type ParcoursSelectionsPayload } from "@/lib/email"
import { buildContactMailto } from "@/lib/site-contact"
import { createClientSupabaseServer } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ContactPayload = {
  businessName?: string
  city?: string
  email?: string
  request?: string
  parcoursSelections?: ParcoursSelectionsPayload | null
}

function buildFallbackBody(
  requestText: string,
  businessName: string,
  city: string,
  email: string,
  selections?: ParcoursSelectionsPayload | null,
): string {
  const lines: string[] = ["Bonjour Cardin,", "", requestText, ""]

  if (selections) {
    lines.push(
      "Configuration Cardin :",
      `- Vertical : ${selections.worldId}`,
      `- Saison : ${selections.seasonRewardId ?? "—"}`,
      `- Récompense : ${selections.summaryLine || "—"}`,
      `- Activation : ${[selections.accessType, selections.triggerType, selections.propagationType]
        .filter(Boolean)
        .join(" · ") || "—"}`,
      `- Comportement : ${selections.nextStepLine || "—"}`,
      "",
    )
  }

  lines.push(`Nom du lieu : ${businessName}`, `Ville : ${city}`, `E-mail : ${email}`)
  return lines.join("\r\n")
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ContactPayload
  const businessName = (payload.businessName ?? "").trim()
  const city = (payload.city ?? "").trim()
  const email = (payload.email ?? "").trim()
  const requestText = (payload.request ?? "").trim() || "Recevoir le recapitulatif marchand et etre recontacte plus tard."
  const parcoursSelections = payload.parcoursSelections ?? null

  const fallbackMailto = buildContactMailto(
    parcoursSelections ? "Cardin - configuration marchand" : "Cardin - demande marchand",
    buildFallbackBody(requestText, businessName, city, email, parcoursSelections),
  )

  if (!businessName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_payload", fallbackMailto }, { status: 400 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: false, error: "email_not_configured", fallbackMailto }, { status: 503 })
  }

  try {
    await sendContactEmails({
      businessName,
      city,
      email,
      request: requestText,
      origin: new URL(request.url).origin,
      parcoursSelections,
    })

    // P2 — Opportunistic DB persistence for authed merchants only.
    // Demo / unauth'd flow silently skips. Email still went out above.
    if (parcoursSelections) {
      try {
        const supabase = createClientSupabaseServer()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id) {
          await supabase
            .from("merchants")
            .update({ parcours_selections: { ...parcoursSelections, submittedAt: new Date().toISOString() } })
            .eq("id", user.id)
        }
      } catch (dbError) {
        // Non-blocking: log but don't fail the request.
        console.warn("parcours_selections_persist_failed", dbError instanceof Error ? dbError.message : dbError)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "contact_send_failed"
    return NextResponse.json({ ok: false, error: message, fallbackMailto }, { status: 500 })
  }
}