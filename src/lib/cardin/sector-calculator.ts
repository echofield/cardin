/**
 * Sector Calculator Backend Logic
 *
 * Transforms natural language inputs into concrete business projections
 * NO percentages, NO abstract weights shown
 * Output is always: problem statement + 3 numbers + concrete metric
 */

import type {
  CafeCalculatorInput,
  RestaurantCalculatorInput,
  CreatorCalculatorInput,
  BoutiqueCalculatorInput,
  ConcreteProjection,
} from "@/types/cardin-core.types"

// ==========================================
// CAFÉ CALCULATOR
// ==========================================

export function calculateCafeProjection(input: CafeCalculatorInput): ConcreteProjection {
  const { emptyDays, peakTimes, regularCount } = input

  // Build problem statement
  const emptyDaysFr = emptyDays.map(dayToFrench).join(", ")
  const peakTimesFr = peakTimes.map(timeToFrench).join(" et ")
  const problemStatement = `Vos ${emptyDaysFr} sont vides et vos habitués viennent ${peakTimesFr}`

  // Calculate volume recovered
  // Each empty day can recover 8-12 visits depending on regular base
  const emptyDayCount = emptyDays.length
  const recoveryPerDay = Math.floor(8 + (regularCount / 50) * 4) // 8-12 range
  const volumeRecovered = emptyDayCount * recoveryPerDay

  // Calculate revenue impact
  // Café average ticket: €8.50
  const avgTicket = 8.5
  const revenueImpact = Math.round(volumeRecovered * avgTicket)

  // Domino intensity based on regular base
  const dominoIntensity: "low" | "medium" | "high" =
    regularCount >= 50 ? "high" : regularCount >= 30 ? "medium" : "low"

  // Timeframe: 6 weeks is standard for frequency-based strategies
  const timeframe = "6 semaines"

  // Concrete metric
  const firstEmptyDay = emptyDays[0] ? dayToFrench(emptyDays[0]) : "jour ciblé"
  const firstPeakTime = peakTimes[0] ? timeToFrench(peakTimes[0]) : "créneau fort"
  const concreteMetric = `${volumeRecovered} passages supplémentaires ${firstEmptyDay} ${firstPeakTime}`

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe,
    concreteMetric,
  }
}

// ==========================================
// RESTAURANT CALCULATOR
// ==========================================

export function calculateRestaurantProjection(
  input: RestaurantCalculatorInput
): ConcreteProjection {
  const { emptyServices, weekendFlow, avgCoverPrice } = input

  // Build problem statement
  const emptyServicesFr = emptyServices.map(serviceToFrench).join(", ")
  const weekendFlowFr =
    weekendFlow === "full"
      ? "vos weekends sont pleins"
      : weekendFlow === "moderate"
      ? "vos weekends sont modérés"
      : "vos weekends sont vides"
  const problemStatement = `Vos ${emptyServicesFr} sont faibles et ${weekendFlowFr}`

  // Calculate volume recovered (covers)
  // Each empty service can recover 6-10 covers
  const emptyServiceCount = emptyServices.length
  const recoveryPerService = weekendFlow === "full" ? 10 : weekendFlow === "moderate" ? 8 : 6
  const volumeRecovered = emptyServiceCount * recoveryPerService

  // Calculate revenue impact
  const revenueImpact = Math.round(volumeRecovered * avgCoverPrice)

  // Domino intensity based on weekend flow strength
  const dominoIntensity: "low" | "medium" | "high" =
    weekendFlow === "full" ? "high" : weekendFlow === "moderate" ? "medium" : "low"

  // Timeframe: 6 weeks for restaurant strategy
  const timeframe = "6 semaines"

  // Concrete metric
  const firstService = emptyServices[0] ? serviceToFrench(emptyServices[0]) : "service ciblé"
  const concreteMetric = `${volumeRecovered} couverts supplémentaires ${firstService}`

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe,
    concreteMetric,
  }
}

// ==========================================
// CREATOR CALCULATOR
// ==========================================

export function calculateCreatorProjection(input: CreatorCalculatorInput): ConcreteProjection {
  const { communitySize, avgReturnRate, contentFrequency } = input

  // Build problem statement
  const returnRatePercent = Math.round(avgReturnRate * 100)
  const frequencyFr =
    contentFrequency === "daily"
      ? "quotidien"
      : contentFrequency === "weekly"
      ? "hebdomadaire"
      : "mensuel"
  const problemStatement = `Vous avez ${communitySize} personnes mais seulement ${returnRatePercent}% reviennent avec un rythme ${frequencyFr}`

  // Calculate volume recovered (engaged members)
  // Cardin can typically lift return rate by 15-25%
  const liftRate =
    contentFrequency === "daily" ? 0.25 : contentFrequency === "weekly" ? 0.20 : 0.15
  const newReturnRate = Math.min(1.0, avgReturnRate + liftRate)
  const volumeRecovered = Math.round(communitySize * (newReturnRate - avgReturnRate))

  // Calculate revenue impact (assuming €15 avg support)
  const avgSupport = 15
  const revenueImpact = Math.round(volumeRecovered * avgSupport)

  // Domino intensity based on community size and frequency
  const dominoIntensity: "low" | "medium" | "high" =
    communitySize >= 500 && contentFrequency === "daily"
      ? "high"
      : communitySize >= 200
      ? "medium"
      : "low"

  // Timeframe: 8 weeks for community building
  const timeframe = "8 semaines"

  // Concrete metric
  const concreteMetric = `${volumeRecovered} membres engagés supplémentaires avec propagation sociale`

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe,
    concreteMetric,
  }
}

// ==========================================
// BOUTIQUE CALCULATOR
// ==========================================

export function calculateBoutiqueProjection(input: BoutiqueCalculatorInput): ConcreteProjection {
  const { footfall, conversionRate, avgBasket, seasonalPeaks } = input

  // Build problem statement
  const conversionPercent = Math.round(conversionRate * 100)
  const peakCount = seasonalPeaks.length
  const problemStatement = `Vous avez ${footfall} passages par jour avec ${conversionPercent}% de conversion et ${peakCount} pics saisonniers`

  // Calculate volume recovered (additional conversions)
  // Cardin can lift conversion by 8-12% through recognition
  const liftRate = peakCount >= 3 ? 0.12 : peakCount >= 2 ? 0.10 : 0.08
  const newConversionRate = Math.min(1.0, conversionRate + liftRate)
  const dailyLift = footfall * (newConversionRate - conversionRate)
  const monthlyLift = Math.round(dailyLift * 26) // 26 open days
  const volumeRecovered = monthlyLift

  // Calculate revenue impact
  const revenueImpact = Math.round(volumeRecovered * avgBasket)

  // Domino intensity based on footfall and peaks
  const dominoIntensity: "low" | "medium" | "high" =
    footfall >= 50 && peakCount >= 3 ? "high" : footfall >= 30 ? "medium" : "low"

  // Timeframe: 6 weeks
  const timeframe = "6 semaines"

  // Concrete metric
  const concreteMetric = `${volumeRecovered} conversions supplémentaires par mois`

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe,
    concreteMetric,
  }
}

// ==========================================
// TRANSLATION HELPERS
// ==========================================

function dayToFrench(day: string): string {
  const map: Record<string, string> = {
    monday: "lundis",
    tuesday: "mardis",
    wednesday: "mercredis",
    thursday: "jeudis",
    friday: "vendredis",
    saturday: "samedis",
    sunday: "dimanches",
  }
  return map[day] || day
}

function timeToFrench(time: string): string {
  const map: Record<string, string> = {
    morning: "le matin",
    noon: "à midi",
    afternoon: "l'après-midi",
    evening: "le soir",
  }
  return map[time] || time
}

function serviceToFrench(service: string): string {
  const map: Record<string, string> = {
    monday_lunch: "lundis midi",
    monday_dinner: "lundis soir",
    tuesday_lunch: "mardis midi",
    tuesday_dinner: "mardis soir",
    wednesday_lunch: "mercredis midi",
    wednesday_dinner: "mercredis soir",
    thursday_lunch: "jeudis midi",
    thursday_dinner: "jeudis soir",
    friday_lunch: "vendredis midi",
    friday_dinner: "vendredis soir",
    saturday_lunch: "samedis midi",
    saturday_dinner: "samedis soir",
    sunday_lunch: "dimanches midi",
    sunday_dinner: "dimanches soir",
  }
  return map[service] || service
}
