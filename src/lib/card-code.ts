const CARD_CODE_PREFIX = "CD-"

export function normalizeCardCode(value: string): string {
  const compact = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (!compact) {
    return ""
  }

  const suffix = compact.startsWith("CD") ? compact.slice(2) : compact
  return `${CARD_CODE_PREFIX}${suffix}`
}

export function buildCardGatewayPath(cardCode: string): string {
  return `/c/${encodeURIComponent(normalizeCardCode(cardCode))}`
}
