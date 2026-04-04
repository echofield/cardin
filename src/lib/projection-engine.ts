import { type BehaviorScenarioId, normalizeEngineActivityId, type EngineActivityId } from "@/lib/behavior-engine"
import { percentToRate } from "@/lib/calculator"
import type { ProjectionFamily } from "@/lib/dynamics-library"

export type ProjectionEngineInput = {
  merchantType: string
  scenarioId: BehaviorScenarioId
  monthlyClients: number
  avgTicket: number
  inactivePercent: number
  baseRecoveryPercent: number
}

export type ProjectionResult = {
  monthlyRevenue: number
  monthlyReturns: number
  recoveredClients: number
  paybackDays: number
  confidenceLabel: string
  primaryEffect: string
  secondaryEffect: string
  scenarioRole: string
}

type ScenarioProjectionProfile = {
  revenueWeight: number
  returnsWeight: number
  primaryEffect: string
  secondaryEffect: string
  scenarioRole: string
}

const PROJECTION_PROFILES: Record<EngineActivityId, Record<BehaviorScenarioId, ScenarioProjectionProfile>> = {
  boulangerie: {
    starting_loop: { revenueWeight: 1, returnsWeight: 1, primaryEffect: "Routine de quartier plus solide", secondaryEffect: "Retour régulier plus visible", scenarioRole: "Installe le premier rythme" },
    weekly_rendezvous: { revenueWeight: 0.84, returnsWeight: 0.78, primaryEffect: "Jour creux mieux rempli", secondaryEffect: "Rendez-vous attendu dans la semaine", scenarioRole: "Travaille un temps faible" },
    short_challenge: { revenueWeight: 1.18, returnsWeight: 1.24, primaryEffect: "Fréquence relancée vite", secondaryEffect: "Plusieurs passages sur une courte fenêtre", scenarioRole: "Accélère le retour" },
    monthly_gain: { revenueWeight: 0.94, returnsWeight: 0.88, primaryEffect: "Sujet du mois plus fort", secondaryEffect: "Désir ajouté à la routine", scenarioRole: "Crée un pic d'attention" },
  },
  cafe: {
    starting_loop: { revenueWeight: 1, returnsWeight: 1, primaryEffect: "Habitude du matin mieux retenue", secondaryEffect: "Premier retour rapide", scenarioRole: "Installe le premier rythme" },
    weekly_rendezvous: { revenueWeight: 0.9, returnsWeight: 0.84, primaryEffect: "Créneau du matin renforcé", secondaryEffect: "Moment hebdo plus mémorable", scenarioRole: "Travaille un temps faible" },
    short_challenge: { revenueWeight: 1.16, returnsWeight: 1.22, primaryEffect: "Séquence de retours rapide", secondaryEffect: "Routine recollée sur quelques jours", scenarioRole: "Accélère le retour" },
    monthly_gain: { revenueWeight: 0.92, returnsWeight: 0.86, primaryEffect: "Sujet signature autour du comptoir", secondaryEffect: "Désir plus fort sans discount", scenarioRole: "Crée un pic d'attention" },
  },
  restaurant: {
    starting_loop: { revenueWeight: 1, returnsWeight: 1, primaryEffect: "Retour entre deux repas", secondaryEffect: "Premier cap simple à expliquer", scenarioRole: "Installe le premier rythme" },
    weekly_rendezvous: { revenueWeight: 0.88, returnsWeight: 0.82, primaryEffect: "Service calme mieux rempli", secondaryEffect: "Repère hebdomadaire plus clair", scenarioRole: "Travaille un temps faible" },
    short_challenge: { revenueWeight: 1.2, returnsWeight: 1.12, primaryEffect: "Fréquence relancée rapidement", secondaryEffect: "Plus de visites sur une même période", scenarioRole: "Accélère le retour" },
    monthly_gain: { revenueWeight: 1.02, returnsWeight: 0.9, primaryEffect: "Pic d'attention autour d'un temps fort", secondaryEffect: "Désir plus élevé sans promo permanente", scenarioRole: "Crée un pic d'attention" },
  },
  coiffeur: {
    starting_loop: { revenueWeight: 1, returnsWeight: 1, primaryEffect: "Cycle de retour plus visible", secondaryEffect: "Cap clair entre deux rendez-vous", scenarioRole: "Installe le premier rythme" },
    weekly_rendezvous: { revenueWeight: 0.76, returnsWeight: 0.72, primaryEffect: "Créneau faible mieux occupé", secondaryEffect: "Repère mensuel plus stable", scenarioRole: "Travaille un temps faible" },
    short_challenge: { revenueWeight: 1.22, returnsWeight: 1.18, primaryEffect: "Réactivation plus rapide des absentes", secondaryEffect: "Cycle raccourci", scenarioRole: "Accélère le retour" },
    monthly_gain: { revenueWeight: 1.08, returnsWeight: 0.94, primaryEffect: "Désir plus premium dans le mois", secondaryEffect: "Conversation autour d'une prestation forte", scenarioRole: "Crée un pic d'attention" },
  },
  "institut-beaute": {
    starting_loop: { revenueWeight: 1, returnsWeight: 1, primaryEffect: "Fréquence mieux stabilisée", secondaryEffect: "Cap visible entre deux séances", scenarioRole: "Installe le premier rythme" },
    weekly_rendezvous: { revenueWeight: 0.78, returnsWeight: 0.74, primaryEffect: "Temps faible mieux rythmé", secondaryEffect: "Retour périodique plus attendu", scenarioRole: "Travaille un temps faible" },
    short_challenge: { revenueWeight: 1.18, returnsWeight: 1.14, primaryEffect: "Réengagement plus rapide", secondaryEffect: "Retour plus tôt que le cycle naturel", scenarioRole: "Accélère le retour" },
    monthly_gain: { revenueWeight: 1.1, returnsWeight: 0.96, primaryEffect: "Désir premium plus fort", secondaryEffect: "Valeur perçue de la carte augmentée", scenarioRole: "Crée un pic d'attention" },
  },
  boutique: {
    starting_loop: { revenueWeight: 1, returnsWeight: 1, primaryEffect: "Raison simple de revenir", secondaryEffect: "Passage réinstallé entre deux achats", scenarioRole: "Installe le premier rythme" },
    weekly_rendezvous: { revenueWeight: 0.86, returnsWeight: 0.8, primaryEffect: "Moment boutique mieux ancré", secondaryEffect: "Temps faible mieux animé", scenarioRole: "Travaille un temps faible" },
    short_challenge: { revenueWeight: 1.14, returnsWeight: 1.08, primaryEffect: "Passage relancé rapidement", secondaryEffect: "Retour resserré entre deux achats", scenarioRole: "Accélère le retour" },
    monthly_gain: { revenueWeight: 1.12, returnsWeight: 0.98, primaryEffect: "Désir plus fort autour d'une pièce", secondaryEffect: "Pic d'attention mensuel plus net", scenarioRole: "Crée un pic d'attention" },
  },
}

export function projectScenarioImpact(input: ProjectionEngineInput): ProjectionResult {
  const activityId = normalizeEngineActivityId(input.merchantType)
  const profile = PROJECTION_PROFILES[activityId][input.scenarioId]
  const monthlyClients = Math.max(0, input.monthlyClients)
  const avgTicket = Math.max(0, input.avgTicket)
  const inactiveRate = percentToRate(input.inactivePercent)
  const baseRecoveryRate = percentToRate(input.baseRecoveryPercent)
  const recoveredClientsBase = monthlyClients * inactiveRate * baseRecoveryRate
  const recoveredClients = recoveredClientsBase * profile.returnsWeight
  const monthlyReturns = Math.round(recoveredClients)
  const monthlyRevenue = Math.round(recoveredClients * avgTicket * profile.revenueWeight)
  const dailyRevenue = monthlyRevenue / 26
  const paybackDays = dailyRevenue > 0 ? Math.max(1, Math.ceil(39 / dailyRevenue)) : 999

  return {
    monthlyRevenue,
    monthlyReturns,
    recoveredClients,
    paybackDays,
    confidenceLabel: buildConfidenceLabel(input.scenarioId),
    primaryEffect: profile.primaryEffect,
    secondaryEffect: profile.secondaryEffect,
    scenarioRole: profile.scenarioRole,
  }
}

function buildConfidenceLabel(scenarioId: BehaviorScenarioId) {
  if (scenarioId === "starting_loop") {
    return "Projection la plus stable"
  }

  if (scenarioId === "short_challenge") {
    return "Projection rapide à court terme"
  }

  if (scenarioId === "weekly_rendezvous") {
    return "Projection ciblée sur le rythme"
  }

  return "Projection plus désirable que mécanique"
}

export type FamilyProjectionInput = {
  merchantType: string
  projectionFamily: ProjectionFamily
  monthlyClients: number
  avgTicket: number
  inactivePercent: number
  baseRecoveryPercent: number
  primaryEffect: string
  secondaryEffect: string
  scenarioRole: string
}

function getFamilyWeights(activityId: EngineActivityId, family: ProjectionFamily): { revenueWeight: number; returnsWeight: number } {
  const row = PROJECTION_PROFILES[activityId]
  switch (family) {
    case "base_return":
      return { revenueWeight: row.starting_loop.revenueWeight, returnsWeight: row.starting_loop.returnsWeight }
    case "frequency_push":
      return { revenueWeight: row.short_challenge.revenueWeight, returnsWeight: row.short_challenge.returnsWeight }
    case "gap_fill":
      return { revenueWeight: row.weekly_rendezvous.revenueWeight, returnsWeight: row.weekly_rendezvous.returnsWeight }
    case "referral": {
      const s = row.short_challenge
      return { revenueWeight: s.revenueWeight * 0.98, returnsWeight: s.returnsWeight * 0.99 }
    }
    case "collective":
      return { revenueWeight: row.monthly_gain.revenueWeight, returnsWeight: row.monthly_gain.returnsWeight }
    default:
      return { revenueWeight: 1, returnsWeight: 1 }
  }
}

export function projectFamilyImpact(input: FamilyProjectionInput): ProjectionResult {
  const activityId = normalizeEngineActivityId(input.merchantType)
  const weights = getFamilyWeights(activityId, input.projectionFamily)
  const monthlyClients = Math.max(0, input.monthlyClients)
  const avgTicket = Math.max(0, input.avgTicket)
  const inactiveRate = percentToRate(input.inactivePercent)
  const baseRecoveryRate = percentToRate(input.baseRecoveryPercent)
  const recoveredClientsBase = monthlyClients * inactiveRate * baseRecoveryRate
  const recoveredClients = recoveredClientsBase * weights.returnsWeight
  const monthlyReturns = Math.round(recoveredClients)
  const monthlyRevenue = Math.round(recoveredClients * avgTicket * weights.revenueWeight)
  const dailyRevenue = monthlyRevenue / 26
  const paybackDays = dailyRevenue > 0 ? Math.max(1, Math.ceil(39 / dailyRevenue)) : 999

  return {
    monthlyRevenue,
    monthlyReturns,
    recoveredClients,
    paybackDays,
    confidenceLabel: buildConfidenceLabelForFamily(input.projectionFamily),
    primaryEffect: input.primaryEffect,
    secondaryEffect: input.secondaryEffect,
    scenarioRole: input.scenarioRole,
  }
}

function buildConfidenceLabelForFamily(family: ProjectionFamily) {
  if (family === "base_return") {
    return "Projection la plus stable"
  }
  if (family === "frequency_push") {
    return "Projection rapide à court terme"
  }
  if (family === "gap_fill") {
    return "Projection ciblée sur le rythme"
  }
  if (family === "referral") {
    return "Projection orientée recommandation"
  }
  return "Projection collective et désir"
}
