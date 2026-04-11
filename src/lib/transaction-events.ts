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
  visitSessionId?: string | null
  rewardUseIndex?: number | null
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
  visit_session_id: string | null
  reward_use_index: number | null
  created_at: string
}

function normalizeEventType(legacyType: string, eventType?: string): string {
  const trimmed = eventType?.trim()
  if (trimmed) {
    return trimmed
  }

  return legacyType.trim()
}

const SELECT_FIELDS =
  "id, card_id, type, event_type, season_id, step_reached, source, metadata, idempotency_key, created_by, visit_session_id, reward_use_index, created_at"

export async function insertTransactionEvent(
  supabase: SupabaseClient,
  input: TransactionEventInput
): Promise<TransactionEventRecord> {
  const eventType = normalizeEventType(input.legacyType, input.eventType)
  const idempotencyKey = input.idempotencyKey?.trim() || null

  if (idempotencyKey) {
    const { data: existing, error: existingError } = await supabase
      .from("transactions")
      .select(SELECT_FIELDS)
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
    visit_session_id: input.visitSessionId ?? null,
    reward_use_index: input.rewardUseIndex ?? null,
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select(SELECT_FIELDS)
    .single()

  if (!error && data) {
    return data as TransactionEventRecord
  }

  if (error?.code === "23505") {
    if (input.visitSessionId) {
      const { data: existingBySession, error: sessionError } = await supabase
        .from("transactions")
        .select(SELECT_FIELDS)
        .eq("visit_session_id", input.visitSessionId)
        .eq("type", input.legacyType)
        .maybeSingle()

      if (sessionError) {
        throw new Error(`Failed to read unique transaction by session: ${sessionError.message}`)
      }

      if (existingBySession) {
        return existingBySession as TransactionEventRecord
      }
    }

    if (typeof input.rewardUseIndex === "number") {
      const { data: existingByRewardUse, error: rewardError } = await supabase
        .from("transactions")
        .select(SELECT_FIELDS)
        .eq("card_id", input.cardId)
        .eq("reward_use_index", input.rewardUseIndex)
        .eq("type", input.legacyType)
        .maybeSingle()

      if (rewardError) {
        throw new Error(`Failed to read unique transaction by reward use: ${rewardError.message}`)
      }

      if (existingByRewardUse) {
        return existingByRewardUse as TransactionEventRecord
      }
    }
  }

  throw new Error(error?.message ?? "transaction_event_insert_failed")
}
