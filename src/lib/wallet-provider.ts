export function isWalletTemplateReady(template?: string | null) {
  const value = template?.trim()
  if (!value) return false
  return value.includes("{cardCode}") || value.includes("{cardId}")
}
