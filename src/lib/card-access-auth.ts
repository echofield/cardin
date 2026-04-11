import type { SupabaseClient } from "@supabase/supabase-js"

export function getBearerToken(request: Request): string | null {
  const h = request.headers.get("authorization")
  if (!h?.toLowerCase().startsWith("bearer ")) return null
  const t = h.slice(7).trim()
  return t.length > 0 ? t : null
}

/** Optional query param for first navigation after scan (then store in sessionStorage). */
export function getAccessTokenFromUrl(request: Request): string | null {
  const url = new URL(request.url)
  const q = url.searchParams.get("access_token")?.trim()
  return q && q.length > 0 ? q : null
}

export async function cardIdMatchesAccessToken(
  supabase: SupabaseClient,
  cardId: string,
  token: string | null,
): Promise<boolean> {
  if (!token) return false
  const { data, error } = await supabase
    .from("cards")
    .select("id")
    .eq("id", cardId)
    .eq("client_access_token", token)
    .maybeSingle()

  if (error || !data) return false
  return true
}

/**
 * GET /api/public/card/* allows unauthenticated read when this is false.
 * Set env `CARDIN_REQUIRE_CARD_BEARER=true` in production once clients send Bearer tokens.
 */
export function isLegacyCardReadAllowed(): boolean {
  return process.env.CARDIN_REQUIRE_CARD_BEARER !== "true" && process.env.CARDIN_REQUIRE_CARD_BEARER !== "1"
}

export async function requireCardBearerForRead(
  request: Request,
  supabase: SupabaseClient,
  cardId: string,
): Promise<{ ok: true } | { ok: false }> {
  if (isLegacyCardReadAllowed()) {
    return { ok: true }
  }
  const token = getBearerToken(request) ?? getAccessTokenFromUrl(request)
  const ok = await cardIdMatchesAccessToken(supabase, cardId, token)
  if (!ok) {
    return { ok: false }
  }
  return { ok: true }
}

export async function requireCardBearerForWrite(
  request: Request,
  supabase: SupabaseClient,
  cardId: string,
): Promise<boolean> {
  const token = getBearerToken(request)
  return cardIdMatchesAccessToken(supabase, cardId, token)
}
