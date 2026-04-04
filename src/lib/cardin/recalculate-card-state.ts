/**
 * Recalculate Card State Service
 *
 * Core engine that transforms raw facts into derived state
 * Pure function - no side effects, just computation
 *
 * Philosophy:
 * - Input: Raw behavioral facts
 * - Output: Derived card state
 * - Recalculable at any time
 * - Engine version tracked for migrations
 */

import type {
  CardRawFacts,
  DerivedCardState,
  InternalWeightProfile,
  ScoreBand,
  InternalTier,
  VisualState,
  TensionHint,
  DominoState,
  MerchantStrategyMode,
} from "@/types/cardin-core.types"
import { getWeightProfile, type SectorWeightProfiles } from "./merchant-strategy-profiles"
import { getStatusLabel } from "./status-labels"
import type { ActivityType } from "./status-labels"

const ENGINE_VERSION = "1.0.0"

/**
 * Score component calculators
 * Each returns a value between 0 and 1
 */

function calculateFrequencyScore(facts: CardRawFacts): number {
  const daysSinceCreation = Math.max(
    1,
    Math.floor((Date.now() - new Date(facts.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  )

  // Frequency = visits per day, capped at 1.0
  const frequency = Math.min(1.0, facts.visitsCount / daysSinceCreation)

  // Recent activity matters more
  const recentWeight = facts.visitsLast30d / Math.min(30, daysSinceCreation)

  // Blend historical and recent
  return Math.min(1.0, frequency * 0.6 + recentWeight * 0.4)
}

function calculateSocialScore(facts: CardRawFacts): number {
  // Each referral is worth 0.15, capped at 1.0
  // 7+ referrals = max score
  return Math.min(1.0, facts.referralsCount * 0.15)
}

function calculateValueScore(facts: CardRawFacts, merchantAvgSpend: number): number {
  if (merchantAvgSpend === 0 || facts.spendAverage === 0) {
    return 0.5 // Neutral if no data
  }

  // Ratio of customer spend to merchant average
  // 1.0 = at average (score 0.5)
  // 2.0 = double average (score 1.0)
  const ratio = facts.spendAverage / merchantAvgSpend
  return Math.min(1.0, ratio / 2)
}

function calculateProgressionScore(facts: CardRawFacts): number {
  // Reward consistent progression
  // Streak count indicates consistency
  const maxStreak = 10 // 10+ consecutive visits = max score
  const streakScore = Math.min(1.0, facts.streakCount / maxStreak)

  // Recent activity indicates momentum
  const recentActivity = facts.visitsLast30d > 0 ? 1.0 : 0.0

  // Blend streak and recent activity
  return streakScore * 0.7 + recentActivity * 0.3
}

function calculateTimeScore(facts: CardRawFacts): number {
  if (facts.visitsCount === 0) {
    return 0
  }

  // Weak day visits are valuable for filling gaps
  // If 50%+ of visits are on weak days, score approaches 1.0
  const weakDayRatio = facts.weakDayVisits / facts.visitsCount
  return Math.min(1.0, weakDayRatio * 2)
}

function calculateScarcityScore(facts: CardRawFacts): number {
  const daysSinceCreation = Math.max(
    1,
    Math.floor((Date.now() - new Date(facts.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  )

  // Reward speed - completing visits quickly
  // Target: 30 days for reference
  const targetDays = 30
  if (daysSinceCreation >= targetDays) {
    return 0 // No scarcity bonus if slow
  }

  // Faster = higher score
  return (targetDays - daysSinceCreation) / targetDays
}

/**
 * Calculate total score from components and weights
 */
function calculateTotalScore(
  components: Record<string, number>,
  weights: InternalWeightProfile
): number {
  const total =
    components.frequency * weights.frequency +
    components.social * weights.social +
    components.value * weights.value +
    components.progression * weights.progression +
    components.time * weights.time +
    components.scarcity * weights.scarcity

  return Math.round(total)
}

/**
 * Map score to score band and internal tier
 */
function mapScoreToTier(score: number): { scoreBand: ScoreBand; internalTier: InternalTier } {
  if (score < 20) {
    return { scoreBand: "low", internalTier: 1 }
  } else if (score < 40) {
    return { scoreBand: "warming", internalTier: 2 }
  } else if (score < 60) {
    return { scoreBand: "active", internalTier: 3 }
  } else if (score < 80) {
    return { scoreBand: "rising", internalTier: 4 }
  } else {
    return { scoreBand: "diamond", internalTier: 5 }
  }
}

/**
 * Determine visual state from score band
 */
function getVisualState(scoreBand: ScoreBand): VisualState {
  switch (scoreBand) {
    case "low":
    case "warming":
      return "dormant"
    case "active":
    case "rising":
      return "active"
    case "diamond":
      return "ascending"
  }
}

/**
 * Calculate tension progress and hint
 */
function calculateTension(
  score: number,
  internalTier: InternalTier
): { progressHint: TensionHint; lineProgress: number } {
  // Tier boundaries
  const tierBoundaries: Array<[number, number]> = [
    [0, 20],   // Tier 1
    [20, 40],  // Tier 2
    [40, 60],  // Tier 3
    [60, 80],  // Tier 4
    [80, 100], // Tier 5
  ]

  const [min, max] = tierBoundaries[internalTier - 1]
  const progress = (score - min) / (max - min)

  let progressHint: TensionHint
  if (internalTier === 5) {
    progressHint = "peak"
  } else if (progress >= 0.7) {
    progressHint = "close"
  } else if (progress >= 0.4) {
    progressHint = "mid"
  } else {
    progressHint = "far"
  }

  return {
    progressHint,
    lineProgress: Math.max(0, Math.min(1, progress)),
  }
}

/**
 * Determine domino state based on recent behavior
 */
function calculateDominoState(
  facts: CardRawFacts,
  strategyMode: MerchantStrategyMode
): DominoState {
  const daysSinceLastVisit = facts.lastVisitAt
    ? Math.floor((Date.now() - new Date(facts.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  // Domino activates with recent engagement
  const isRecentlyActive = daysSinceLastVisit <= 3

  // Determine source based on strategy and facts
  let source: DominoState["source"] = null
  let intensity: DominoState["intensity"] = null

  if (isRecentlyActive) {
    // Match domino source to strategy mode
    if (strategyMode === "social" && facts.referralsCount > 0) {
      source = "social"
      intensity = facts.referralsCount >= 3 ? "high" : facts.referralsCount >= 2 ? "medium" : "low"
    } else if (strategyMode === "weak_time" && facts.weakDayVisits > 0) {
      source = "time"
      intensity = facts.weakDayVisits >= 3 ? "high" : "medium"
    } else if (strategyMode === "frequency" && facts.visitsLast30d >= 5) {
      source = "frequency"
      intensity = facts.visitsLast30d >= 10 ? "high" : "medium"
    } else if (strategyMode === "value" && facts.spendAverage > 0) {
      source = "value"
      intensity = "medium"
    }
  }

  return {
    isActive: source !== null,
    source,
    intensity,
    expiresAt: isRecentlyActive ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
  }
}

/**
 * Main recalculation function
 * Pure function - takes raw facts, returns derived state
 */
export function recalculateCardState(
  facts: CardRawFacts,
  activityType: ActivityType,
  strategyMode: MerchantStrategyMode,
  merchantAvgSpend: number = 0
): DerivedCardState {
  // Get weight profile for this merchant
  const sectorType = activityType as keyof SectorWeightProfiles
  const weights = getWeightProfile(sectorType, strategyMode)

  // Calculate score components (each 0-1)
  const components = {
    frequency: calculateFrequencyScore(facts),
    social: calculateSocialScore(facts),
    value: calculateValueScore(facts, merchantAvgSpend),
    progression: calculateProgressionScore(facts),
    time: calculateTimeScore(facts),
    scarcity: calculateScarcityScore(facts),
  }

  // Calculate total score (0-100)
  const totalScore = calculateTotalScore(components, weights)

  // Map to tier and band
  const { scoreBand, internalTier } = mapScoreToTier(totalScore)

  // Get visual state
  const visualState = getVisualState(scoreBand)

  // Get branded status label
  const statusDisplayName = getStatusLabel(activityType, internalTier)

  // Calculate tension
  const tension = calculateTension(totalScore, internalTier)

  // Calculate domino state
  const domino = calculateDominoState(facts, strategyMode)

  // Grand Diamond (Phase 5 - placeholder for now)
  const grandDiamond = {
    state: "none" as const,
    hintLabel: null,
    expiresAt: null,
    claimedAt: null,
  }

  return {
    cardId: facts.cardId,
    engineVersion: ENGINE_VERSION,
    scoreBand,
    internalTier,
    statusDisplayName,
    visualState,
    tension,
    domino,
    grandDiamond,
    computedAt: new Date().toISOString(),
  }
}

/**
 * Helper to check if a snapshot is stale and needs recalculation
 */
export function isSnapshotStale(snapshotCreatedAt: string, maxAgeMinutes: number = 60): boolean {
  const snapshotTime = new Date(snapshotCreatedAt).getTime()
  const now = Date.now()
  const ageMinutes = (now - snapshotTime) / (1000 * 60)

  return ageMinutes > maxAgeMinutes
}
