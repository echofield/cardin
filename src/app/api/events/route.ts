import { randomUUID } from "node:crypto"

import { NextResponse } from "next/server"

import { appendRecord } from "@/lib/server-storage"

type EventPayload = {
  eventName?: string
  properties?: Record<string, unknown>
  pagePath?: string
  timestamp?: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EventPayload

    if (!payload.eventName || typeof payload.eventName !== "string") {
      return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 })
    }

    await appendRecord("events.json", {
      id: randomUUID(),
      eventName: payload.eventName,
      properties: payload.properties ?? {},
      pagePath: payload.pagePath ?? "",
      timestamp: payload.timestamp ?? new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: "event_ingest_failed" }, { status: 500 })
  }
}
