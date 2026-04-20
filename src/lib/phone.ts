/**
 * Minimal phone normalization. Returns canonical E.164-ish form for matching,
 * plus a suffix key (last 9 digits) that absorbs most formatting noise.
 *
 * We don't ship a full libphonenumber for a matching concern — the goal is a
 * robust enough suffix match to reconcile WhatsApp input against a Stripe
 * session phone.
 */
export type NormalizedPhone = {
  canonical: string | null
  suffix: string | null
}

export function normalizePhone(raw: string | null | undefined): NormalizedPhone {
  if (!raw || typeof raw !== "string") return { canonical: null, suffix: null }

  const trimmed = raw.trim()
  if (!trimmed) return { canonical: null, suffix: null }

  const hasPlus = trimmed.startsWith("+")
  const digits = trimmed.replace(/[^\d]/g, "")
  if (digits.length < 8) return { canonical: null, suffix: null }

  let canonical: string
  if (hasPlus) {
    canonical = `+${digits}`
  } else if (digits.startsWith("00")) {
    canonical = `+${digits.slice(2)}`
  } else if (digits.startsWith("33") && digits.length === 11) {
    canonical = `+${digits}`
  } else if (digits.startsWith("0") && digits.length === 10) {
    canonical = `+33${digits.slice(1)}`
  } else {
    canonical = `+${digits}`
  }

  const suffixDigits = digits.slice(-9)
  const suffix = suffixDigits.length >= 8 ? suffixDigits : null

  return { canonical, suffix }
}
