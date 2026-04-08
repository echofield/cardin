/**
 * Cardin Core Type System (Corrected)
 *
 * Philosophy:
 * - Store raw facts, derive state
 * - Engine computes, card suggests, merchant steers
 * - Grand Diamond is eligibility, not tier 10
 * - Never expose internal scoring as customer truth
 */

// ==========================================
// RAW FACTS (Truth Layer)
// ==========================================

/**
 * Raw behavioral facts - the only stable truth
 * Never store derived scores as fundamental truth
 */
export type CardRawFacts = {
  cardId: string
  merchantId: string
  customerId: string
  customerName: string

  // Pure counts
  visitsCount: number
  visitsLast30d: number
  referralsCount: number
  weakDayVisits: number
  streakCount: number

  // Spend aggregates
  spendTotal: number
  spendAverage: number

  // Timestamps
  lastVisitAt: string | null
  createdAt: string
  updatedAt: string
}

// ==========================================
// MERCHANT STRATEGY
// ==========================================

/**
 * Strategic choices merchant can make
 * Merchant steers behavior, Cardin decides weights
 */
export type MerchantStrategyMode =
  | "frequency"    // Amplifier la frÃ©quentation
  | "social"       // Amplifier le bouche-Ã -oreille
  | "weak_time"    // Amplifier les temps faibles
  | "value"        // Amplifier la montÃ©e en gamme

export type MerchantStrategy = {
  merchantId: string
  activityType: "cafe" | "restaurant" | "boulangerie" | "coiffeur" | "institut-beaute" | "boutique" | "createur"
  currentMode: MerchantStrategyMode
  modeActivatedAt: string
}

// ==========================================
// DERIVED ENGINE OUTPUT (Recalculable)
// ==========================================

/**
 * Internal tier - stable, not exposed to client
 */
export type InternalTier = 1 | 2 | 3 | 4 | 5

/**
 * Score band - internal categorization
 */
export type ScoreBand = "low" | "warming" | "active" | "rising" | "diamond"

/**
 * Visual states for card appearance
 */
export type VisualState = "dormant" | "active" | "ascending"

/**
 * Tension progress hints - felt, not counted
 */
export type TensionHint = "far" | "mid" | "close" | "peak"

/**
 * Domino state - acceleration through behavior
 */
export type DominoState = {
  isActive: boolean
  source: "social" | "time" | "frequency" | "value" | null
  intensity: "low" | "medium" | "high" | null
  expiresAt?: string | null
}

/**
 * Grand Diamond state - eligibility gate, not tier
 */
export type GrandDiamondState = {
  state: "none" | "hinted" | "eligible" | "claimed" | "expired"
  hintLabel?: string | null
  expiresAt?: string | null
  claimedAt?: string | null
}

/**
 * Complete derived card state - output of engine
 * This is recalculable from raw facts, not permanent truth
 */
export type DerivedCardState = {
  cardId: string
  engineVersion: string       // Track engine version for migrations

  // Internal categorization
  scoreBand: ScoreBand
  internalTier: InternalTier

  // Display information
  statusDisplayName: string   // e.g., "HabituÃ©", "Cercle", "Diamond Matin"
  visualState: VisualState

  // Tension (felt, not counted)
  tension: {
    progressHint: TensionHint
    lineProgress: number      // 0-1 for visual rendering
  }

  // Domino acceleration
  domino: DominoState

  // Grand Diamond eligibility (separate from tiers)
  grandDiamond: GrandDiamondState

  // Metadata
  computedAt: string
}

// ==========================================
// CLIENT CARD VIEW (What customer sees)
// ==========================================

/**
 * Client card view - pure feeling layer
 * NO scores, NO percentages, NO mechanics visible
 */
export type ClientCardView = {
  cardId: string
  venueName: string           // Venue name, NOT "CardinPass"
  customerName: string

  // Status feeling
  statusLabel: string         // e.g., "HabituÃ©", "Cercle Soir"
  visualState: VisualState

  // Tension feeling
  tensionLabel: string        // e.g., "Proche du prochain palier"
  tensionProgress: number     // 0-1 for tension line

  // Domino feeling
  dominoLabel: string         // e.g., "Domino actif", "Domino endormi"
  dominoActive: boolean

  // Grand Diamond hint (if any)
  grandDiamondLabel?: string | null  // e.g., "Une fenÃªtre rare peut s'ouvrir"

  // Activity
  lastActivityLabel?: string | null  // e.g., "DerniÃ¨re visite il y a 3 jours"
}

// ==========================================
// MERCHANT DASHBOARD VIEW
// ==========================================

/**
 * Distribution categories for merchant view
 */
export type ClientDistributionBucket = {
  label: "dormant" | "active" | "ascending"
  count: number
  percentage: number
}

/**
 * Merchant strategy view - strategic, not analytical
 */
export type MerchantStrategyView = {
  merchantId: string
  currentMode: MerchantStrategyMode
  modeActivatedAt: string

  // Strategic distribution
  distribution: ClientDistributionBucket[]

  // Strategic insights
  nearDiamondCount: number    // Clients close to Diamond status
  activeDominosCount: number  // Clients with active domino
  weakDayRecoveryPotential: number  // Estimated recoverable visits

  // Totals
  totalClients: number
}

// ==========================================
// SECTOR CALCULATORS
// ==========================================

/**
 * Sector types for calculators
 */
export type SectorType = "cafe" | "restaurant" | "local" | "creator" | "boutique"

/**
 * CafÃ© calculator input - natural questions
 */
export type CafeCalculatorInput = {
  emptyDays: string[]           // ["monday", "tuesday"]
  peakTimes: string[]           // ["morning", "afternoon"]
  regularCount: number
}

/**
 * Restaurant calculator input
 */
export type RestaurantCalculatorInput = {
  emptyServices: string[]       // ["tuesday_dinner", "wednesday_lunch"]
  weekendFlow: "full" | "moderate" | "empty"
  avgCoverPrice: number
}

/**
 * Creator calculator input
 */
export type CreatorCalculatorInput = {
  communitySize: number
  avgReturnRate: number
  contentFrequency: "daily" | "weekly" | "monthly"
}
/**
 * Local commerce calculator input
 */
export type LocalCommerceCalculatorInput = {
  clientsPerDay: number
  avgBasket: number
  quietDays: number
  repeatRhythm: "high" | "mixed" | "low"
}


/**
 * Boutique calculator input
 */
export type BoutiqueCalculatorInput = {
  footfall: number
  conversionRate: number
  avgBasket: number
  seasonalPeaks: string[]
}

/**
 * Concrete projection - natural language output
 */
export type ConcreteProjection = {
  problemStatement: string      // Natural language problem description
  volumeRecovered: number       // Concrete number
  revenueImpact: number        // Euros (mid-range or single value)
  revenueImpactLow?: number    // Euros (low estimate) - optional for range
  revenueImpactHigh?: number   // Euros (high estimate) - optional for range
  dominoIntensity: "low" | "medium" | "high"
  timeframe: string            // e.g., "saison (3 mois)"
  concreteMetric: string       // "8 passages supplÃ©mentaires le lundi matin"
}

// ==========================================
// SCORING ENGINE INTERNAL TYPES
// ==========================================

/**
 * Internal weight profile (not exposed to merchant)
 * Merchant chooses strategy, engine applies profile
 */
export type InternalWeightProfile = {
  frequency: number
  social: number
  value: number
  progression: number
  time: number
  scarcity: number
}

/**
 * Sector weight profiles - internal use only
 */
export type SectorWeightProfiles = {
  balanced: InternalWeightProfile
  cafe: InternalWeightProfile
  restaurant: InternalWeightProfile
  beaute: InternalWeightProfile
  createur: InternalWeightProfile
}

/**
 * Strategy mode weight adjustments
 * Applied on top of sector baseline
 */
export type StrategyModeAdjustment = {
  mode: MerchantStrategyMode
  boostComponent: keyof InternalWeightProfile
  boostFactor: number  // e.g., 1.3 for 30% boost
}

// ==========================================
// DATABASE SNAPSHOT TYPES
// ==========================================

/**
 * Derived state snapshot - stored as cache, not truth
 * Can be regenerated from raw facts at any time
 */
export type DerivedStateSnapshot = {
  cardId: string
  merchantId: string

  // Cached derived values
  scoreBand: ScoreBand
  internalTier: InternalTier
  statusDisplayName: string
  visualState: VisualState
  tensionProgress: number
  dominoActive: boolean
  grandDiamondState: GrandDiamondState["state"]

  // Snapshot metadata
  engineVersion: string
  snapshotCreatedAt: string
  validUntil: string | null
}

/**
 * Event for tracking Grand Diamond claims
 */
export type GrandDiamondEvent = {
  eventId: string
  cardId: string
  eventType: "hinted" | "became_eligible" | "claimed" | "expired"
  occurredAt: string
  metadata?: Record<string, any>
}



