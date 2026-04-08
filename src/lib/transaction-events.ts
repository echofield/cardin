import type { SupabaseClient } from "@supabase/supabase-js"

export type TransactionEventInput = {
  cardId: string
  legacyType: string
  eventType?: string
  seasonId?: string | null
  stepReached?: number | null
  source?: string
  metadata?: Record<string, unknown>
  idempotencyKey?: string | null
  createdBy?: string | null
}

type TransactionEventRecord = {
  id: string
  card_id: string
  type: string
  event_type: string
  season_id: string | null
  step_reached: number | null
  source: string
  metadata: Record<string, unknown>
  idempotency_key: string | null
  created_by: string | null
  created_at: string
}

function normalizeEventType(legacyType: string, eventType?: string): string {
  const trimmed = eventType?.trim()
  if (trimmed) {
    return trimmed
  }

  return legacyType.trim()
}

export async function insertTransactionEvent(
  supabase: SupabaseClient,
  input: TransactionEventInput
): Promise<TransactionEventRecord> {
  const eventType = normalizeEventType(input.legacyType, input.eventType)
  const idempotencyKey = input.idempotencyKey?.trim() || null

  if (idempotencyKey) {
    const { data: existing, error: existingError } = await supabase
      .from("transactions")
      .select("id, card_id, type, event_type, season_id, step_reached, source, metadata, idempotency_key, created_by, created_at")
      .eq("card_id", input.cardId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle()

    if (existingError) {
      throw new Error(`Failed to read idempotent transaction event: ${existingError.message}`)
    }

    if (existing) {
      return existing as TransactionEventRecord
    }
  }

  const payload = {
    card_id: input.cardId,
    type: input.legacyType,
    event_type: eventType,
    season_id: input.seasonId ?? null,
    step_reached: input.stepReached ?? null,
    source: input.source ?? "app",
    metadata: input.metadata ?? {},
    idempotency_key: idempotencyKey,
    created_by: input.createdBy ?? null,
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select("id, card_id, type, event_type, season_id, step_reached, source, metadata, idempotency_key, created_by, created_at")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "transaction_event_insert_failed")
  }

  return data as TransactionEventRecord
}