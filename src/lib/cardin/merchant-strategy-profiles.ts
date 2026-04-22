/**
 * Merchant Strategy Profiles
 *
 * Philosophy:
 * - Merchant chooses WHAT to amplify (strategy)
 * - Cardin decides HOW (weight profiles)
 * - NO free weight override for merchants
 * - Profiles are sector-adapted and strategy-adjusted
 */

import type {
  InternalWeightProfile,
  SectorWeightProfiles,
  MerchantStrategyMode,
} from "@/types/cardin-core.types"

/**
 * Base weight profiles per sector
 * These reflect the natural behavior patterns of each sector
 */
export const SECTOR_BASE_WEIGHTS: SectorWeightProfiles = {
  balanced: {
    frequency: 25,
    social: 25,
    value: 15,
    progression: 15,
    time: 10,
    scarcity: 10,
  },

  cafe: {
    frequency: 35,  // Cafés thrive on daily frequency
    social: 20,     // Morning regulars bring friends
    value: 10,      // Ticket is lower priority
    progression: 15,
    time: 15,       // Morning/afternoon peaks matter
    scarcity: 5,
  },

  restaurant: {
    value: 30,      // Restaurants care about spending
    social: 25,     // Strong referral culture
    frequency: 15,  // Less frequent than cafés
    progression: 15,
    time: 10,       // Some time sensitivity
    scarcity: 5,
  },

  beaute: {
    frequency: 30,  // Regular appointments
    progression: 25, // Consistency is key
    social: 20,     // Referrals matter
    value: 15,      // Premium services
    time: 5,        // Less time-sensitive
    scarcity: 5,
  },

  createur: {
    social: 35,     // Community is everything
    progression: 25, // Consistent engagement
    frequency: 15,  // Moderate frequency
    value: 15,      // Support level
    scarcity: 10,   // FOMO and exclusivity
    time: 0,        // No specific time windows
  },
}

/**
 * Strategy mode adjustments
 * When merchant selects a strategy, we boost the relevant component
 */
const STRATEGY_BOOSTS: Record<MerchantStrategyMode, { component: keyof InternalWeightProfile; factor: number }> = {
  frequency: {
    component: "frequency",
    factor: 1.4, // +40% to frequency weight
  },
  social: {
    component: "social",
    factor: 1.4, // +40% to social weight
  },
  weak_time: {
    component: "time",
    factor: 1.5, // +50% to time weight (strong boost for weak day focus)
  },
  value: {
    component: "value",
    factor: 1.4, // +40% to value weight
  },
}

/**
 * Map ActivityType to weight profile key
 * Groups similar business models together
 */
function mapActivityTypeToWeightKey(activityType: string): keyof SectorWeightProfiles {
  const mapping: Record<string, keyof SectorWeightProfiles> = {
    cafe: "cafe",
    boulangerie: "cafe", // Similar daily frequency model
    caviste: "restaurant",
    restaurant: "restaurant",
    coiffeur: "beaute",
    "institut-beaute": "beaute",
    boutique: "balanced", // Generic retail
    createur: "createur",
  }

  return mapping[activityType] || "balanced"
}

/**
 * Get weight profile for a merchant
 * Combines sector baseline + strategy boost
 */
export function getWeightProfile(
  activityType: string,
  strategyMode: MerchantStrategyMode
): InternalWeightProfile {
  const sectorType = mapActivityTypeToWeightKey(activityType)
  // Get sector baseline
  const baseProfile = SECTOR_BASE_WEIGHTS[sectorType] || SECTOR_BASE_WEIGHTS.balanced

  // Apply strategy boost
  const boost = STRATEGY_BOOSTS[strategyMode]
  const boostedProfile = { ...baseProfile }

  // Boost the target component
  const originalValue = boostedProfile[boost.component]
  const boostedValue = originalValue * boost.factor

  // Calculate the excess we need to redistribute
  const excess = boostedValue - originalValue
  boostedProfile[boost.component] = boostedValue

  // Reduce other components proportionally to keep sum = 100
  const otherComponents = (Object.keys(boostedProfile) as Array<keyof InternalWeightProfile>)
    .filter((key) => key !== boost.component)

  const totalOthers = otherComponents.reduce((sum, key) => sum + boostedProfile[key], 0)

  for (const key of otherComponents) {
    const proportion = boostedProfile[key] / totalOthers
    boostedProfile[key] = boostedProfile[key] - excess * proportion
  }

  // Validate and normalize to exactly 100
  return normalizeWeights(boostedProfile)
}

/**
 * Normalize weights to sum exactly to 100
 * Handles floating point rounding
 */
function normalizeWeights(profile: InternalWeightProfile): InternalWeightProfile {
  const sum = Object.values(profile).reduce((acc, val) => acc + val, 0)

  if (Math.abs(sum - 100) < 0.01) {
    // Already close enough
    return profile
  }

  // Normalize proportionally
  const factor = 100 / sum
  const normalized: InternalWeightProfile = {
    frequency: profile.frequency * factor,
    social: profile.social * factor,
    value: profile.value * factor,
    progression: profile.progression * factor,
    time: profile.time * factor,
    scarcity: profile.scarcity * factor,
  }

  return normalized
}

/**
 * Validate that weights sum to 100 (within tolerance)
 */
export function validateWeights(profile: InternalWeightProfile): boolean {
  const sum = Object.values(profile).reduce((acc, val) => acc + val, 0)
  return Math.abs(sum - 100) < 0.01
}

/**
 * Get strategy mode description for merchant UI
 */
export function getStrategyModeDescription(mode: MerchantStrategyMode): {
  label: string
  description: string
} {
  const descriptions: Record<MerchantStrategyMode, { label: string; description: string }> = {
    frequency: {
      label: "Fréquentation",
      description: "Amplifier les passages rapprochés et la régularité",
    },
    social: {
      label: "Bouche-à-oreille",
      description: "Amplifier les recommandations et l'effet réseau",
    },
    weak_time: {
      label: "Temps faibles",
      description: "Remplir les créneaux et jours creux",
    },
    value: {
      label: "Montée en gamme",
      description: "Amplifier le panier moyen et la valeur",
    },
  }

  return descriptions[mode]
}
