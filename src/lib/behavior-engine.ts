import { getTemplateById, type MerchantTemplate } from "@/lib/merchant-templates"

export type EngineActivityId =
  | "cafe"
  | "bar"
  | "caviste"
  | "restaurant"
  | "boulangerie"
  | "coiffeur"
  | "institut-beaute"
  | "boutique"
export type EngineFrequency = "high" | "medium" | "low"
export type EngineCadence = "short_loops" | "balanced_loops" | "long_cycles"
export type BehaviorScenarioId = "starting_loop" | "weekly_rendezvous" | "short_challenge" | "monthly_gain"

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

export type BehaviorScenario = {
  id: BehaviorScenarioId
  label: string
  headline: string
  detail: string
  bestFor: string
  stage: "now" | "next" | "later"
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
  scenarios: [BehaviorScenario, BehaviorScenario, BehaviorScenario, BehaviorScenario]
  recommendedScenarioId: BehaviorScenarioId
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
  startingDetail: string
  weeklyBestFor: string
  challengeBestFor: string
  monthlyBestFor: string
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
    startingDetail: "Boucle simple, lisible au comptoir, qui remet la routine en marche.",
    weeklyBestFor: "Relancer un jour plus plat sans promo permanente.",
    challengeBestFor: "Créer plusieurs retours sur une courte fenêtre.",
    monthlyBestFor: "Ajouter du désir et un sujet de quartier chaque mois.",
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
    startingDetail: "Point de départ rapide à comprendre, idéal pour les habitudes du quotidien.",
    weeklyBestFor: "Installer un créneau de matinée attendu chaque semaine.",
    challengeBestFor: "Accélérer les passages sur une courte séquence.",
    monthlyBestFor: "Créer un sujet signature autour du comptoir.",
  },
  bar: {
    frequency: "high",
    weeklyAnchor: "Soirée régulière",
    challenge: "Défi court",
    reward: "Consigne signature offerte",
    monthlyEvent: "Gain du mois",
    invitationLayer: "Puis une invitation ciblée pour faire venir un duo ou un groupe au comptoir.",
    movementPromise:
      "La carte rend le retour visible sur la semaine, puis amplifie le réseau quand les bons profils s'activent.",
    weeklyRecommendation: { title: "Créneau fort", detail: "Installer un rendez-vous attendu sur une soirée à renforcer." },
    challengeRecommendation: { title: "Défi court", detail: "Créer plusieurs venues sur une courte fenêtre." },
    challengeUrgentRecommendation: { title: "Défi court", detail: "Réactiver vite les clients qui ont laissé filer l'habitude." },
    monthlyRecommendation: { title: "Gain mensuel", detail: "Donner une raison de reparler du lieu sans promo permanente." },
    monthlyPremiumRecommendation: { title: "Gain mensuel", detail: "Mettre en avant une consigne ou une expérience signature." },
    startingDetail: "Point de départ lisible au comptoir, adapté aux rotations de soirée.",
    weeklyBestFor: "Densifier un jour ou une plage encore trop calme.",
    challengeBestFor: "Resserrer le délai entre deux sorties.",
    monthlyBestFor: "Créer un moment fort identifiable dans le mois.",
  },
  caviste: {
    frequency: "medium",
    weeklyAnchor: "Rendez-vous cave",
    challenge: "Défi retour",
    reward: "Dégustation offerte",
    monthlyEvent: "Sélection du mois",
    invitationLayer: "Puis une invitation ciblée pour faire revenir un duo ou un petit cercle autour d'une dégustation.",
    movementPromise:
      "La carte remet la cave dans les moments choisis, structure la dégustation et peut faire monter un cercle social plus intentionnel.",
    weeklyRecommendation: { title: "Rendez-vous cave", detail: "Installer une dégustation ou une sélection hebdomadaire lisible." },
    challengeRecommendation: { title: "Défi retour", detail: "Faire revenir avant que le choix de bouteille ne reparte ailleurs." },
    challengeUrgentRecommendation: { title: "Défi retour", detail: "Réactiver vite les clients qui ont coupé leur rituel d'achat." },
    monthlyRecommendation: { title: "Sélection du mois", detail: "Donner une bonne raison de revenir pour une bouteille ou une cave mise en avant." },
    monthlyPremiumRecommendation: { title: "Sélection du mois", detail: "Porter une dégustation ou une cuvée plus désirable sans promo brute." },
    startingDetail: "Première boucle simple à expliquer, parfaite pour remettre une sélection choisie dans la rotation.",
    weeklyBestFor: "Créer un repère de dégustation entre deux achats plus espacés.",
    challengeBestFor: "Réactiver le retour avant qu'il ne sorte du radar du lieu.",
    monthlyBestFor: "Créer un sujet de cave qui donne envie de revenir et d'en parler.",
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
    startingDetail: "Première boucle simple à expliquer, parfaite pour remettre les retours entre deux repas.",
    weeklyBestFor: "Installer un service du milieu de semaine plus solide.",
    challengeBestFor: "Réaccélérer la fréquence sans baisser la valeur perçue.",
    monthlyBestFor: "Créer de l'attention autour d'un moment plus désirable.",
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
    startingDetail: "Point de départ clair pour rendre le cycle visible et mémorisé.",
    weeklyBestFor: "Installer un repère plus stable sur cycle long.",
    challengeBestFor: "Réduire le temps entre deux visites.",
    monthlyBestFor: "Créer un désir plus premium au fil des mois.",
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
    startingDetail: "Premier cap clair pour installer la progression sans alourdir l'expérience.",
    weeklyBestFor: "Créer un repère de retour sur des cycles plus longs.",
    challengeBestFor: "Réactiver les clientes qui ont disparu du rythme.",
    monthlyBestFor: "Porter un rituel plus désirable dans l'année.",
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
    startingDetail: "Point de départ simple qui remet une raison de revenir entre deux achats.",
    weeklyBestFor: "Créer un moment boutique attendu chaque semaine.",
    challengeBestFor: "Réveiller rapidement la clientèle dormante.",
    monthlyBestFor: "Créer une attention plus forte autour d'une pièce ou d'un drop.",
  },
}

const KNOWN_ACTIVITY_IDS = new Set<EngineActivityId>([
  "cafe",
  "bar",
  "caviste",
  "restaurant",
  "boulangerie",
  "coiffeur",
  "institut-beaute",
  "boutique",
])

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
  const recommendedScenarioId = inactivityRate >= 0.35 ? "short_challenge" : "starting_loop"

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
    calculatorRecommendations: [challengeRecommendation, profile.weeklyRecommendation, monthlyRecommendation],
    scenarios: [
      {
        id: "starting_loop",
        label: "Point de départ",
        headline: template.pointOfDeparture,
        detail: profile.startingDetail,
        bestFor: "Démarrer vite avec une carte claire et crédible en boutique.",
        stage: "now",
      },
      {
        id: "weekly_rendezvous",
        label: profile.weeklyRecommendation.title,
        headline: profile.weeklyAnchor,
        detail: profile.weeklyRecommendation.detail,
        bestFor: profile.weeklyBestFor,
        stage: "next",
      },
      {
        id: "short_challenge",
        label: challengeRecommendation.title,
        headline: profile.challenge,
        detail: challengeRecommendation.detail,
        bestFor: profile.challengeBestFor,
        stage: "now",
      },
      {
        id: "monthly_gain",
        label: monthlyRecommendation.title,
        headline: profile.monthlyEvent,
        detail: monthlyRecommendation.detail,
        bestFor: profile.monthlyBestFor,
        stage: "later",
      },
    ],
    recommendedScenarioId,
  }
}

export function findScenario(plan: BehaviorPlan, scenarioId: BehaviorScenarioId) {
  return plan.scenarios.find((scenario) => scenario.id === scenarioId) ?? plan.scenarios[0]
}

export function buildSelectionSummary(template: MerchantTemplate, plan: BehaviorPlan): string {
  return `${template.label} · ${template.description} · ${findScenario(plan, plan.recommendedScenarioId).headline}`
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
