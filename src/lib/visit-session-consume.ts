import type { SupabaseClient } from "@supabase/supabase-js"

/** After a passage validation, reward consumption must tie to that proof within this window. */
export const VALIDATED_SESSION_FOR_CONSUME_MAX_MS = 2 * 60 * 60 * 1000

export type ValidatedVisitSessionRow = {
  id: string
  validated_at: string
}

/**
 * Finds a visit_session for this merchant+card that was validated recently.
 * If sessionId is passed (from UI after validate), it must match a recent validated row.
 */
export async function findValidatedSessionForConsume(
  supabase: SupabaseClient,
  params: { merchantId: string; cardId: string; sessionId?: string | null },
): Promise<ValidatedVisitSessionRow | null> {
  const { merchantId, cardId, sessionId } = params

  const { data: rows, error } = await supabase
    .from("visit_sessions")
    .select("id, validated_at")
    .eq("merchant_id", merchantId)
    .eq("card_id", cardId)
    .not("validated_at", "is", null)
    .order("validated_at", { ascending: false })
    .limit(8)

  if (error || !rows?.length) return null

  const now = Date.now()

  for (const row of rows) {
    const validatedAt = row.validated_at
    if (!validatedAt) continue
    const t = new Date(validatedAt).getTime()
    if (Number.isNaN(t)) continue
    if (now - t > VALIDATED_SESSION_FOR_CONSUME_MAX_MS) continue

    if (sessionId) {
      if (row.id === sessionId) {
        return { id: row.id, validated_at: validatedAt }
      }
      continue
    }

    return { id: row.id, validated_at: validatedAt }
  }

  return null
}
