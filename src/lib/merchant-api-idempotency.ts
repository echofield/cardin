import type { SupabaseClient } from "@supabase/supabase-js"

export const IDEMPOTENCY_SCOPE_VALIDATE = "validate_passage"
export const IDEMPOTENCY_SCOPE_CONSUME = "consume_summit"

export async function getCachedIdempotentResponse(
  supabase: SupabaseClient,
  merchantId: string,
  scope: string,
  idempotencyKey: string,
): Promise<unknown | null> {
  const key = idempotencyKey.trim()
  if (!key) return null

  const { data, error } = await supabase
    .from("api_idempotency")
    .select("response_json")
    .eq("merchant_id", merchantId)
    .eq("scope", scope)
    .eq("idempotency_key", key)
    .maybeSingle()

  if (error || !data) return null
  return data.response_json
}

export async function saveIdempotentResponse(
  supabase: SupabaseClient,
  merchantId: string,
  scope: string,
  idempotencyKey: string,
  responseJson: unknown,
): Promise<void> {
  const key = idempotencyKey.trim()
  if (!key) return

  const { error } = await supabase.from("api_idempotency").insert({
    merchant_id: merchantId,
    scope,
    idempotency_key: key,
    response_json: responseJson as object,
  })

  if (error) {
    console.error("api_idempotency insert:", error.message)
  }
}
