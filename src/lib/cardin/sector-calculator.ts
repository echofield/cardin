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
  const revenueImpact = Math.round(volumeRecovered * 8.5)
  const dominoIntensity: "low" | "medium" | "high" =
    regularCount >= 50 ? "high" : regularCount >= 30 ? "medium" : "low"

  const firstEmptyDay = emptyDays[0] ? dayToFrench(emptyDays[0]) : "jour cible"
  const firstPeakTime = peakTimes[0] ? timeToFrench(peakTimes[0]) : "creneau fort"

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe: "6 semaines",
    concreteMetric: `${volumeRecovered} passages supplementaires ${firstEmptyDay} ${firstPeakTime}`,
  }
}

export function calculateRestaurantProjection(input: RestaurantCalculatorInput): ConcreteProjection {
  const { emptyServices, weekendFlow, avgCoverPrice } = input

  const emptyServicesFr = emptyServices.map(serviceToFrench).join(", ")
  const weekendFlowFr =
    weekendFlow === "full"
      ? "vos weekends sont pleins"
      : weekendFlow === "moderate"
        ? "vos weekends sont moderes"
        : "vos weekends sont vides"
  const problemStatement = `Vos ${emptyServicesFr} sont faibles et ${weekendFlowFr}`

  const recoveryPerService = weekendFlow === "full" ? 10 : weekendFlow === "moderate" ? 8 : 6
  const volumeRecovered = emptyServices.length * recoveryPerService
  const revenueImpact = Math.round(volumeRecovered * avgCoverPrice)
  const dominoIntensity: "low" | "medium" | "high" =
    weekendFlow === "full" ? "high" : weekendFlow === "moderate" ? "medium" : "low"

  const firstService = emptyServices[0] ? serviceToFrench(emptyServices[0]) : "service cible"

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe: "6 semaines",
    concreteMetric: `${volumeRecovered} couverts supplementaires ${firstService}`,
  }
}

export function calculateCreatorProjection(input: CreatorCalculatorInput): ConcreteProjection {
  const { communitySize, avgReturnRate, contentFrequency } = input

  const returnRatePercent = Math.round(avgReturnRate * 100)
  const frequencyFr =
    contentFrequency === "daily" ? "quotidien" : contentFrequency === "weekly" ? "hebdomadaire" : "mensuel"
  const problemStatement = `Vous avez ${communitySize} personnes mais seulement ${returnRatePercent}% reviennent avec un rythme ${frequencyFr}`

  const liftRate = contentFrequency === "daily" ? 0.25 : contentFrequency === "weekly" ? 0.2 : 0.15
  const newReturnRate = Math.min(1, avgReturnRate + liftRate)
  const volumeRecovered = Math.round(communitySize * (newReturnRate - avgReturnRate))
  const revenueImpact = Math.round(volumeRecovered * 15)
  const dominoIntensity: "low" | "medium" | "high" =
    communitySize >= 500 && contentFrequency === "daily" ? "high" : communitySize >= 200 ? "medium" : "low"

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe: "8 semaines",
    concreteMetric: `${volumeRecovered} membres engages supplementaires avec propagation sociale`,
  }
}

export function calculateLocalCommerceProjection(input: LocalCommerceCalculatorInput): ConcreteProjection {
  const { clientsPerDay, avgBasket, quietDays, repeatRhythm } = input

  const repeatLabel =
    repeatRhythm === "high"
      ? "une clientele qui revient deja souvent"
      : repeatRhythm === "mixed"
        ? "un melange d'habitudes et de passages occasionnels"
        : "une clientele encore trop occasionnelle"

  const problemStatement = `Vous voyez environ ${clientsPerDay} clients par jour, avec ${quietDays} jour${quietDays > 1 ? "s" : ""} plus calme${quietDays > 1 ? "s" : ""} et ${repeatLabel}`

  const rhythmFactor = repeatRhythm === "high" ? 0.18 : repeatRhythm === "mixed" ? 0.14 : 0.1
  const volumeRecovered = Math.max(6, Math.round(clientsPerDay * quietDays * rhythmFactor * 1.4))
  const revenueImpact = Math.round(volumeRecovered * avgBasket)
  const dominoIntensity: "low" | "medium" | "high" =
    repeatRhythm === "high" || clientsPerDay >= 55 ? "high" : repeatRhythm === "mixed" || clientsPerDay >= 30 ? "medium" : "low"

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe: "6 semaines",
    concreteMetric: `${volumeRecovered} retours recuperables sur vos ${quietDays} jour${quietDays > 1 ? "s" : ""} les plus calmes`,
  }
}

export function calculateBoutiqueProjection(input: BoutiqueCalculatorInput): ConcreteProjection {
  const { footfall, conversionRate, avgBasket, seasonalPeaks } = input

  const conversionPercent = Math.round(conversionRate * 100)
  const peakCount = seasonalPeaks.length
  const problemStatement = `Vous avez ${footfall} passages par jour avec ${conversionPercent}% de conversion et ${peakCount} pics saisonniers`

  const liftRate = peakCount >= 3 ? 0.12 : peakCount >= 2 ? 0.1 : 0.08
  const newConversionRate = Math.min(1, conversionRate + liftRate)
  const dailyLift = footfall * (newConversionRate - conversionRate)
  const volumeRecovered = Math.round(dailyLift * 26)
  const revenueImpact = Math.round(volumeRecovered * avgBasket)
  const dominoIntensity: "low" | "medium" | "high" =
    footfall >= 50 && peakCount >= 3 ? "high" : footfall >= 30 ? "medium" : "low"

  return {
    problemStatement,
    volumeRecovered,
    revenueImpact,
    dominoIntensity,
    timeframe: "6 semaines",
    concreteMetric: `${volumeRecovered} conversions supplementaires par mois`,
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
