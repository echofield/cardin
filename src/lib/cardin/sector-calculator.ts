/**
 * Sector Calculator Backend Logic
 *
 * Transforms natural language inputs into concrete business projections.
 */

import type {
  BoutiqueCalculatorInput,
  CafeCalculatorInput,
  ConcreteProjection,
  CreatorCalculatorInput,
  LocalCommerceCalculatorInput,
  RestaurantCalculatorInput,
} from "@/types/cardin-core.types"

export function calculateCafeProjection(input: CafeCalculatorInput): ConcreteProjection {
  const { emptyDays, peakTimes, regularCount } = input

  const emptyDaysFr = emptyDays.map(dayToFrench).join(", ")
  const peakTimesFr = peakTimes.map(timeToFrench).join(" et ")
  const problemStatement = `Vos ${emptyDaysFr} sont vides et vos habitues viennent ${peakTimesFr}`

  const emptyDayCount = emptyDays.length
  const recoveryPerDay = Math.floor(8 + (regularCount / 50) * 4)
  const volumeRecovered = emptyDayCount * recoveryPerDay

  // Seasonal calculation (3 months = ~13 weeks = ~90 days)
  const weeklyRevenue = Math.round(volumeRecovered * 8.5)
  const seasonalRevenueMid = weeklyRevenue * 13
  const seasonalRevenueLow = Math.round(seasonalRevenueMid * 0.85)
  const seasonalRevenueHigh = Math.round(seasonalRevenueMid * 1.15)

  const dominoIntensity: "low" | "medium" | "high" =
    regularCount >= 50 ? "high" : regularCount >= 30 ? "medium" : "low"

  const firstEmptyDay = emptyDays[0] ? dayToFrench(emptyDays[0]) : "jour cible"
  const firstPeakTime = peakTimes[0] ? timeToFrench(peakTimes[0]) : "creneau fort"

  return {
    problemStatement,
    volumeRecovered: volumeRecovered * 13, // Weekly volume over season
    revenueImpact: seasonalRevenueMid,
    revenueImpactLow: seasonalRevenueLow,
    revenueImpactHigh: seasonalRevenueHigh,
    dominoIntensity,
    timeframe: "saison (3 mois)",
    concreteMetric: `${volumeRecovered} passages/semaine recuperes`,
  }
}

export function calculateRestaurantProjection(input: RestaurantCalculatorInput): ConcreteProjection {
  const { emptyServices, weekendFlow, avgCoverPrice } = input

  const emptyServicesFr = emptyServices.map(serviceToFrench).join(", ")
  const weekendFlowFr =
    weekendFlow === "full"
      ? "weekends complets"
      : weekendFlow === "moderate"
        ? "weekends moderes"
        : "weekends faibles"
  const problemStatement = `Services faibles: ${emptyServicesFr}. Weekends: ${weekendFlowFr}. Panier moyen: ${avgCoverPrice}EUR`

  const recoveryPerService = weekendFlow === "full" ? 12 : weekendFlow === "moderate" ? 9 : 7
  const weeklyCovers = emptyServices.length * recoveryPerService

  // Seasonal calculation (3 months = ~13 weeks)
  const seasonalCovers = weeklyCovers * 13
  const seasonalRevenueMid = Math.round(seasonalCovers * avgCoverPrice)
  const seasonalRevenueLow = Math.round(seasonalRevenueMid * 0.88)
  const seasonalRevenueHigh = Math.round(seasonalRevenueMid * 1.12)

  const dominoIntensity: "low" | "medium" | "high" =
    weekendFlow === "full" ? "high" : weekendFlow === "moderate" ? "medium" : "low"

  return {
    problemStatement,
    volumeRecovered: seasonalCovers,
    revenueImpact: seasonalRevenueMid,
    revenueImpactLow: seasonalRevenueLow,
    revenueImpactHigh: seasonalRevenueHigh,
    dominoIntensity,
    timeframe: "saison (3 mois)",
    concreteMetric: `${weeklyCovers} couverts/semaine recuperables`,
  }
}

export function calculateCreatorProjection(input: CreatorCalculatorInput): ConcreteProjection {
  const { communitySize, avgReturnRate, contentFrequency } = input

  const returnRatePercent = Math.round(avgReturnRate * 100)
  const problemStatement = `${communitySize} membres, ${returnRatePercent}% retour actuel`

  // Simplified: focus on engagement lift
  const engagementLift = 0.18 // Fixed lift rate
  const volumeRecovered = Math.round(communitySize * engagementLift)
  const revenueImpact = Math.round(volumeRecovered * 12) // Simplified value per member
  const dominoIntensity: "low" | "medium" | "high" =
    communitySize >= 400 ? "high" : communitySize >= 150 ? "medium" : "low"

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe: "2 mois",
    concreteMetric: `${volumeRecovered} membres engages supplementaires`,
  }
}

export function calculateLocalCommerceProjection(input: LocalCommerceCalculatorInput): ConcreteProjection {
  const { clientsPerDay, avgBasket, quietDays, repeatRhythm } = input

  const repeatLabel =
    repeatRhythm === "high" ? "bon retour" : repeatRhythm === "mixed" ? "retour mixte" : "faible retour"

  const problemStatement = `${clientsPerDay} clients/jour, ${quietDays} jour${quietDays > 1 ? "s" : ""} calme${quietDays > 1 ? "s" : ""}, ${repeatLabel}`

  // Simplified: focus on repeat improvement
  const baseRecovery = Math.round(clientsPerDay * 0.15)
  const volumeRecovered = baseRecovery * quietDays
  const revenueImpact = Math.round(volumeRecovered * avgBasket)
  const dominoIntensity: "low" | "medium" | "high" =
    clientsPerDay >= 50 ? "high" : clientsPerDay >= 25 ? "medium" : "low"

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe: "6 semaines",
    concreteMetric: `${volumeRecovered} retours supplementaires`,
  }
}

export function calculateBoutiqueProjection(input: BoutiqueCalculatorInput): ConcreteProjection {
  const { footfall, conversionRate, avgBasket, seasonalPeaks } = input

  const returnPercent = Math.round(conversionRate * 100)
  const collectionCount = seasonalPeaks.length
  const problemStatement = `${footfall} clientes actives/mois, ${returnPercent}% de retour, ${collectionCount} collection${collectionCount > 1 ? "s" : ""} forte${collectionCount > 1 ? "s" : ""}`

  // Focus on repeat purchase trajectory
  const trajectoryLift = collectionCount >= 3 ? 0.18 : collectionCount >= 2 ? 0.14 : 0.10
  const newReturnRate = Math.min(1, conversionRate + trajectoryLift)
  const monthlyReturns = footfall * (newReturnRate - conversionRate)

  // Seasonal calculation (3 months)
  const seasonalReturns = Math.round(monthlyReturns * 3)
  const seasonalRevenueMid = Math.round(seasonalReturns * avgBasket)
  const seasonalRevenueLow = Math.round(seasonalRevenueMid * 0.82)
  const seasonalRevenueHigh = Math.round(seasonalRevenueMid * 1.18)

  const dominoIntensity: "low" | "medium" | "high" =
    footfall >= 40 && collectionCount >= 3 ? "high" : footfall >= 25 ? "medium" : "low"

  return {
    problemStatement,
    volumeRecovered: seasonalReturns,
    revenueImpact: seasonalRevenueMid,
    revenueImpactLow: seasonalRevenueLow,
    revenueImpactHigh: seasonalRevenueHigh,
    dominoIntensity,
    timeframe: "saison (3 mois)",
    concreteMetric: `${Math.round(monthlyReturns)} retours supplementaires/mois`,
  }
}

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
    noon: "a midi",
    afternoon: "l'apres-midi",
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
