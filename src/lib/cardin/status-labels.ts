/**
 * Status Labels - Sector-Specific Branded Names
 *
 * Internal tiers (1-5) map to branded display names
 * NO Bronze/Silver/Gold - these are generic and lifeless
 * Each sector has its own progression vocabulary
 */

import type { InternalTier } from "@/types/cardin-core.types"

export type ActivityType =
  | "cafe"
  | "restaurant"
  | "boulangerie"
  | "coiffeur"
  | "institut-beaute"
  | "boutique"
  | "createur"

/**
 * Status label mappings per sector
 * Tier 5 is associated with Grand Diamond, but can be shown even before full eligibility
 */
const STATUS_LABELS: Record<ActivityType, Record<InternalTier, string>> = {
  cafe: {
    1: "Passage",
    2: "Habitué",
    3: "Cercle",
    4: "Diamond Matin",
    5: "Cercle Rare",
  },

  restaurant: {
    1: "Table Ouverte",
    2: "Maison",
    3: "Cercle Soir",
    4: "Diamond Soir",
    5: "Table Rare",
  },

  boulangerie: {
    1: "Client",
    2: "Habitué",
    3: "Cercle",
    4: "Diamond Artisan",
    5: "Maison Rare",
  },

  coiffeur: {
    1: "Visage Connu",
    2: "Régulier",
    3: "Cercle",
    4: "Diamond Ligne",
    5: "Aura Rare",
  },

  "institut-beaute": {
    1: "Visage Connu",
    2: "Régulier",
    3: "Cercle Beauté",
    4: "Diamond Ligne",
    5: "Aura Rare",
  },

  boutique: {
    1: "Visiteur",
    2: "Familier",
    3: "Cercle",
    4: "Diamond Collection",
    5: "Collection Rare",
  },

  createur: {
    1: "Présent",
    2: "Cercle",
    3: "Onde",
    4: "Diamond Audience",
    5: "Signal Rare",
  },
}

/**
 * Get branded status label for a given activity type and internal tier
 */
export function getStatusLabel(
  activityType: ActivityType,
  internalTier: InternalTier
): string {
  const labels = STATUS_LABELS[activityType]
  if (!labels) {
    // Fallback to generic if activity type not found
    return `Niveau ${internalTier}`
  }

  return labels[internalTier] || `Niveau ${internalTier}`
}

/**
 * Get tension labels - proximity hints in French
 */
export function getTensionLabel(
  progressHint: "far" | "mid" | "close" | "peak"
): string {
  const labels: Record<string, string> = {
    far: "En progression",
    mid: "À mi-chemin",
    close: "Proche du prochain palier",
    peak: "Au sommet",
  }

  return labels[progressHint] || "En progression"
}

/**
 * Get domino labels - acceleration state in French
 */
export function getDominoLabel(isActive: boolean, intensity?: "low" | "medium" | "high" | null): string {
  if (!isActive) {
    return "Domino dormant"
  }

  if (intensity === "high") {
    return "Domino intense"
  }

  if (intensity === "medium") {
    return "Domino actif"
  }

  return "Domino en cours"
}

/**
 * Get Grand Diamond hint labels
 */
export function getGrandDiamondLabel(
  state: "none" | "hinted" | "eligible" | "claimed" | "expired"
): string | null {
  const labels: Record<string, string | null> = {
    none: null,
    hinted: "Une fenêtre rare peut s'ouvrir",
    eligible: "Éligible cette semaine",
    claimed: "Cercle Rare obtenu",
    expired: "Fenêtre expirée",
  }

  return labels[state] ?? null
}

/**
 * Get last activity label - human-friendly time since last visit
 */
export function getLastActivityLabel(lastVisitAt: string | null): string | null {
  if (!lastVisitAt) {
    return null
  }

  const now = new Date()
  const lastVisit = new Date(lastVisitAt)
  const diffMs = now.getTime() - lastVisit.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 24) {
    if (diffHours === 0) {
      return "Dernière visite aujourd'hui"
    }
    if (diffHours === 1) {
      return "Dernière visite il y a 1 heure"
    }
    return `Dernière visite il y a ${diffHours} heures`
  }

  if (diffDays === 1) {
    return "Dernière visite hier"
  }

  if (diffDays < 7) {
    return `Dernière visite il y a ${diffDays} jours`
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `Dernière visite il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`
  }

  const months = Math.floor(diffDays / 30)
  return `Dernière visite il y a ${months} mois`
}

/**
 * Visual state color palettes
 */
export const VISUAL_STATE_COLORS = {
  dormant: {
    bg: "from-[#2A2A2A] to-[#1A1A1A]",
    text: "text-[#8A8A8A]",
    accent: "text-[#B0B0B0]",
    line: "bg-[#B0B0B0]",
  },
  active: {
    bg: "from-[#173A2E] to-[#0F2820]",
    text: "text-[#E8F4EF]",
    accent: "text-[#7FD9B8]",
    line: "bg-[#7FD9B8]",
  },
  ascending: {
    bg: "from-[#8B6F47] to-[#5C4A2F]",
    text: "text-[#FFF8E7]",
    accent: "text-[#FFD97D]",
    line: "bg-[#FFD97D]",
  },
} as const
