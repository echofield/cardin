export type EngineActivityId = "cafe" | "restaurant" | "boulangerie" | "coiffeur" | "institut-beaute" | "boutique"
export type EngineFrequency = "high" | "medium" | "low"
export type EngineCadence = "short_loops" | "balanced_loops" | "long_cycles"

export type BehaviorEngineInput = {
  merchantType: string
  avgFrequency?: EngineFrequency
  basketValue?: number
  inactivityRate?: number
  socialProfile?: boolean
}

export type BehaviorPlan = {
  cadence: EngineCadence
  weeklyAnchor: string
  challenge: string
  reward: string
  monthlyEvent: string
  launchProjection: [string, string, string]
}

type ActivityProfile = {
  frequency: EngineFrequency
  weeklyAnchor: string
  challenge: string
  reward: string
  monthlyEvent: string
}

const DEFAULT_PROFILE: ActivityProfile = {
  frequency: "medium",
  weeklyAnchor: "Rendez-vous hebdo",
  challenge: "Défi court",
  reward: "Avantage boutique",
  monthlyEvent: "Gain mensuel",
}

const PROFILES: Record<EngineActivityId, ActivityProfile> = {
  boulangerie: {
    frequency: "high",
    weeklyAnchor: "Mardi actif",
    challenge: "3 passages en 7 jours",
    reward: "Produit offert",
    monthlyEvent: "Tirage premium mensuel",
  },
  cafe: {
    frequency: "high",
    weeklyAnchor: "Mardi matin actif",
    challenge: "4 passages en 10 jours",
    reward: "Boisson signature offerte",
    monthlyEvent: "Tableau des habitués du mois",
  },
  restaurant: {
    frequency: "medium",
    weeklyAnchor: "Soirée milieu de semaine",
    challenge: "2 passages en 14 jours",
    reward: "Dessert ou avantage maison",
    monthlyEvent: "Menu découverte mensuel",
  },
  coiffeur: {
    frequency: "low",
    weeklyAnchor: "Rendez-vous semaine calme",
    challenge: "2 visites en 8 semaines",
    reward: "Soin offert",
    monthlyEvent: "Upgrade premium mensuel",
  },
  "institut-beaute": {
    frequency: "low",
    weeklyAnchor: "Fenêtre beauté dédiée",
    challenge: "2 passages en 6 semaines",
    reward: "Prestation ciblée offerte",
    monthlyEvent: "Rituel premium mensuel",
  },
  boutique: {
    frequency: "medium",
    weeklyAnchor: "Journée clients actifs",
    challenge: "3 achats en 21 jours",
    reward: "Accès exclusif",
    monthlyEvent: "Drop mensuel réservé",
  },
}

const KNOWN_ACTIVITY_IDS = new Set<EngineActivityId>(["cafe", "restaurant", "boulangerie", "coiffeur", "institut-beaute", "boutique"])

export function normalizeEngineActivityId(value?: string): EngineActivityId {
  if (value && KNOWN_ACTIVITY_IDS.has(value as EngineActivityId)) {
    return value as EngineActivityId
  }

  return "boulangerie"
}

export function buildBehaviorPlan(input: BehaviorEngineInput): BehaviorPlan {
  const activityId = normalizeEngineActivityId(input.merchantType)
  const profile = PROFILES[activityId] ?? DEFAULT_PROFILE
  const frequency = input.avgFrequency ?? profile.frequency

  const cadence = frequencyToCadence(frequency)
  const challenge = input.socialProfile ? "Défi collectif en 7 jours" : profile.challenge
  const monthlyEvent = input.socialProfile ? "Gain mensuel communautaire" : profile.monthlyEvent

  return {
    cadence,
    weeklyAnchor: profile.weeklyAnchor,
    challenge,
    reward: profile.reward,
    monthlyEvent,
    launchProjection: [
      `${profile.weeklyAnchor} -> trafic relancé`,
      `${challenge} -> retour accéléré`,
      `${monthlyEvent} -> engagement collectif`,
    ],
  }
}

function frequencyToCadence(frequency: EngineFrequency): EngineCadence {
  if (frequency === "high") {
    return "short_loops"
  }

  if (frequency === "low") {
    return "long_cycles"
  }

  return "balanced_loops"
}
