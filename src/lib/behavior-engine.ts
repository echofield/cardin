import { getTemplateById, type MerchantTemplate } from "@/lib/merchant-templates"

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

export type BehaviorRecommendation = {
  title: string
  detail: string
}

export type BehaviorPlan = {
  cadence: EngineCadence
  weeklyAnchor: string
  challenge: string
  reward: string
  monthlyEvent: string
  businessNeeds: [string, string]
  pointOfDeparture: string
  evolutionOptions: [string, string, string]
  invitationLayer: string
  movementPromise: string
  launchProjection: [string, string, string]
  recommendations: [BehaviorRecommendation, BehaviorRecommendation, BehaviorRecommendation]
  calculatorRecommendations: [BehaviorRecommendation, BehaviorRecommendation, BehaviorRecommendation]
}

type ActivityProfile = {
  frequency: EngineFrequency
  weeklyAnchor: string
  challenge: string
  reward: string
  monthlyEvent: string
  invitationLayer: string
  movementPromise: string
  weeklyRecommendation: BehaviorRecommendation
  challengeRecommendation: BehaviorRecommendation
  challengeUrgentRecommendation: BehaviorRecommendation
  monthlyRecommendation: BehaviorRecommendation
  monthlyPremiumRecommendation: BehaviorRecommendation
}

const PROFILES: Record<EngineActivityId, ActivityProfile> = {
  boulangerie: {
    frequency: "high",
    weeklyAnchor: "Mardi actif",
    challenge: "Défi court",
    reward: "Produit offert",
    monthlyEvent: "Gain du mois",
    invitationLayer: "Puis une mécanique d'invitation pour faire circuler la carte dans le quartier.",
    movementPromise: "La carte démarre simplement, puis peut relancer un jour creux et créer un pic d'attention chaque mois.",
    weeklyRecommendation: { title: "Jour creux", detail: "Installer un rendez-vous sur une journée plus calme." },
    challengeRecommendation: { title: "Défi court", detail: "Faire revenir plusieurs fois dans la même semaine." },
    challengeUrgentRecommendation: { title: "Défi court", detail: "Réactiver vite les clients qui ont coupé leur routine." },
    monthlyRecommendation: { title: "Gain mensuel", detail: "Créer un sujet de conversation et un passage en plus." },
    monthlyPremiumRecommendation: { title: "Gain mensuel", detail: "Porter une récompense plus désirable sans alourdir la caisse." },
  },
  cafe: {
    frequency: "high",
    weeklyAnchor: "Rendez-vous matin",
    challenge: "Défi express",
    reward: "Boisson signature offerte",
    monthlyEvent: "Gain du mois",
    invitationLayer: "Puis une invitation douce pour faire venir un collègue ou un proche.",
    movementPromise: "La carte installe un rythme visible, puis ajoute des micro-pics de désir dans le mois.",
    weeklyRecommendation: { title: "Rendez-vous hebdo", detail: "Fixer un moment attendu sur un créneau de matinée." },
    challengeRecommendation: { title: "Défi express", detail: "Créer plusieurs retours sur une fenêtre très courte." },
    challengeUrgentRecommendation: { title: "Défi express", detail: "Rebrancher rapidement les passages qui se sont espacés." },
    monthlyRecommendation: { title: "Gain mensuel", detail: "Donner une raison de parler de la carte au comptoir." },
    monthlyPremiumRecommendation: { title: "Gain mensuel", detail: "Créer une récompense signature qui donne envie de revenir." },
  },
  restaurant: {
    frequency: "medium",
    weeklyAnchor: "Rendez-vous hebdo",
    challenge: "Défi court",
    reward: "Dessert offert",
    monthlyEvent: "Gain du mois",
    invitationLayer: "Puis une mécanique d'invitation pour remplir une table et faire circuler la carte.",
    movementPromise: "La carte relance la fréquence, structure un temps fort hebdomadaire et peut monter en désir chaque mois.",
    weeklyRecommendation: { title: "Rendez-vous hebdo", detail: "Remplir un service plus calme avec un repère clair." },
    challengeRecommendation: { title: "Défi court", detail: "Relancer la fréquence entre deux repas ou deux occasions." },
    challengeUrgentRecommendation: { title: "Défi court", detail: "Reprendre vite le lien avec les clients qui s'espacent." },
    monthlyRecommendation: { title: "Gain mensuel", detail: "Créer un pic d'attention sans entrer dans la promo permanente." },
    monthlyPremiumRecommendation: { title: "Gain mensuel", detail: "Mettre en avant un dîner ou une table signature dans le mois." },
  },
  coiffeur: {
    frequency: "low",
    weeklyAnchor: "Rendez-vous cycle",
    challenge: "Défi retour",
    reward: "Soin offert",
    monthlyEvent: "Gain du mois",
    invitationLayer: "Puis une mécanique de recommandation pour faire entrer un proche dans la boucle.",
    movementPromise: "La carte pose un cap visible sur cycle long, puis ajoute des pics de désir pour éviter les trous de retour.",
    weeklyRecommendation: { title: "Rendez-vous cycle", detail: "Créer un repère régulier entre deux rendez-vous espacés." },
    challengeRecommendation: { title: "Défi retour", detail: "Réduire le temps entre deux visites sans pression commerciale." },
    challengeUrgentRecommendation: { title: "Défi retour", detail: "Réengager les clientes absentes avant que le cycle ne casse." },
    monthlyRecommendation: { title: "Gain mensuel", detail: "Créer une envie forte autour d'une prestation plus premium." },
    monthlyPremiumRecommendation: { title: "Gain mensuel", detail: "Mettre en scène une coupe ou un soin signature sur le mois." },
  },
  "institut-beaute": {
    frequency: "low",
    weeklyAnchor: "Rituel périodique",
    challenge: "Défi retour",
    reward: "Avantage beauté",
    monthlyEvent: "Gain du mois",
    invitationLayer: "Puis une invitation ciblée pour faire entrer une amie dans le rythme.",
    movementPromise: "La carte aide à stabiliser la fréquence, puis ajoute un désir mensuel plus premium.",
    weeklyRecommendation: { title: "Rituel périodique", detail: "Créer un retour attendu sur des cycles plus longs." },
    challengeRecommendation: { title: "Défi retour", detail: "Réinstaller une fréquence visible entre deux séances." },
    challengeUrgentRecommendation: { title: "Défi retour", detail: "Relancer vite les clientes qui ont disparu du planning." },
    monthlyRecommendation: { title: "Gain mensuel", detail: "Donner plus de valeur perçue à la carte sans complexité." },
    monthlyPremiumRecommendation: { title: "Gain mensuel", detail: "Mettre en avant un rituel premium qui fait parler." },
  },
  boutique: {
    frequency: "medium",
    weeklyAnchor: "Rendez-vous collection",
    challenge: "Défi court",
    reward: "Accès exclusif",
    monthlyEvent: "Gain du mois",
    invitationLayer: "Puis une invitation douce pour faire venir une amie et élargir le cercle.",
    movementPromise: "La carte remet du passage entre deux achats, puis crée des rendez-vous et des pics de désir dans le mois.",
    weeklyRecommendation: { title: "Rendez-vous collection", detail: "Créer un retour régulier autour d'un moment de boutique." },
    challengeRecommendation: { title: "Défi court", detail: "Raccourcir le délai entre deux achats ou deux passages." },
    challengeUrgentRecommendation: { title: "Défi court", detail: "Réveiller rapidement les clientes devenues silencieuses." },
    monthlyRecommendation: { title: "Gain mensuel", detail: "Créer de l'attention autour d'une pièce ou d'un avantage fort." },
    monthlyPremiumRecommendation: { title: "Gain mensuel", detail: "Donner envie de revenir pour un accès plus désirable." },
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
  const template = getTemplateById(activityId)
  const profile = PROFILES[activityId]
  const frequency = input.avgFrequency ?? profile.frequency
  const cadence = frequencyToCadence(frequency)
  const inactivityRate = input.inactivityRate ?? 0
  const basketValue = input.basketValue ?? 0
  const challengeRecommendation = inactivityRate >= 0.35 ? profile.challengeUrgentRecommendation : profile.challengeRecommendation
  const monthlyRecommendation = basketValue >= 22 ? profile.monthlyPremiumRecommendation : profile.monthlyRecommendation
  const invitationLayer = input.socialProfile ? strengthenInvitation(profile.invitationLayer) : profile.invitationLayer

  return {
    cadence,
    weeklyAnchor: profile.weeklyAnchor,
    challenge: profile.challenge,
    reward: profile.reward,
    monthlyEvent: profile.monthlyEvent,
    businessNeeds: template.needs,
    pointOfDeparture: template.pointOfDeparture,
    evolutionOptions: template.evolvesTo,
    invitationLayer,
    movementPromise: profile.movementPromise,
    launchProjection: [
      `${profile.weeklyRecommendation.title} → ${profile.weeklyRecommendation.detail}`,
      `${challengeRecommendation.title} → ${challengeRecommendation.detail}`,
      `${monthlyRecommendation.title} → ${monthlyRecommendation.detail}`,
    ],
    recommendations: [profile.weeklyRecommendation, challengeRecommendation, monthlyRecommendation],
    calculatorRecommendations: [
      challengeRecommendation,
      profile.weeklyRecommendation,
      monthlyRecommendation,
    ],
  }
}

export function buildSelectionSummary(template: MerchantTemplate, plan: BehaviorPlan): string {
  return `${template.label} · ${template.description}`
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

function strengthenInvitation(invitationLayer: string): string {
  return invitationLayer.replace("Puis", "Ensuite")
}
