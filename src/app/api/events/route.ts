import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type EventPayload = {
  eventName?: string
}

export async function POST(request: Request) {
  const payload = (await request.json()) as EventPayload

  if (!payload.eventName) {
    return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}