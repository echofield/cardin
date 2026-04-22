import type { MerchantTemplate } from "@/lib/merchant-templates"

export type ObjectiveHintId = "return" | "domino" | "rare"
export type MidpointMode = "recognition_only" | "recognition_plus_boost"

export type ObjectiveScenario = {
  activationDescription: string
  activationTitle: string
  cadenceLabel: string
  description: string
  growthNote: string
  label: string
  midpointMode: MidpointMode
  pointOfDeparture: string
  projectionCaption: string
  recoveryMultiplier: number
  reminderLabel: string
  rewardFieldLabel: string
  rewardLabel: string
  targetVisits: number
}

export const objectiveHints: Record<ObjectiveHintId, { label: string; description: string }> = {
  return: {
    label: "Faire revenir plus souvent",
    description: "On part d'un programme simple qui raccourcit le temps entre deux visites.",
  },
  domino: {
    label: "Faire venir plus de monde",
    description: "On garde une base simple, puis le domino vient accélérer la circulation.",
  },
  rare: {
    label: "Créer quelque chose de rare",
    description: "On commence lisible, puis on monte vers un privilège qui change la perception du lieu.",
  },
}

export function normalizeObjectiveId(value?: string): ObjectiveHintId {
  if (value === "return" || value === "domino" || value === "rare") {
    return value
  }

  return "return"
}

export function applyObjectiveToAssumptions(
  base: { clients: number; avgTicket: number; lossRatePercent: number },
  objective: ObjectiveHintId
) {
  if (objective === "domino") {
    return {
      clients: Math.round(base.clients * 1.08),
      avgTicket: base.avgTicket,
      lossRatePercent: Math.min(80, base.lossRatePercent + 2),
    }
  }

  if (objective === "rare") {
    return {
      clients: base.clients,
      avgTicket: Math.round(base.avgTicket * 1.15),
      lossRatePercent: Math.max(10, base.lossRatePercent - 2),
    }
  }

  return base
}

const scenariosByTemplate: Record<string, Record<ObjectiveHintId, Omit<ObjectiveScenario, "description" | "label">>> = {
  cafe: {
    return: {
      activationDescription: "Cardin lance un rituel simple pour raccourcir le retour et rendre le statut visible au comptoir.",
      activationTitle: "Lancer votre rituel café",
      cadenceLabel: "Rituel court · retour plus fréquemment visible",
      growthNote: "Version rituel : Cardin travaille surtout la récurrence et l'habitude.",
      midpointMode: "recognition_only",
      pointOfDeparture: "5 passages → 1 boisson signature",
      projectionCaption: "Projection de récurrence sur une clientèle de café régulière.",
      recoveryMultiplier: 1.04,
      reminderLabel: "Votre rituel café vous attend",
      rewardFieldLabel: "Privilège affiché sur la carte",
      rewardLabel: "1 boisson signature",
      targetVisits: 5,
    },
    domino: {
      activationDescription: "Cardin lance une version circulation : chaque invité validé renforce l'envie de revenir et de faire venir.",
      activationTitle: "Lancer votre scénario Domino",
      cadenceLabel: "Domino actif · progression accélérée par invitation",
      growthNote: "Version domino : Cardin travaille la propagation et la croissance par invités.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "4 passages → boost si 1 invité validé",
      projectionCaption: "Projection de circulation sur une clientèle café qui se transmet vite.",
      recoveryMultiplier: 1.2,
      reminderLabel: "Un +1 peut accélérer votre carte aujourd'hui",
      rewardFieldLabel: "Boost ou privilège affiché sur la carte",
      rewardLabel: "1 invité validé = boost",
      targetVisits: 4,
    },
    rare: {
      activationDescription: "Cardin lance une carte de prestige : plus lente, plus désirée, orientée privilège exceptionnel.",
      activationTitle: "Lancer votre version rare",
      cadenceLabel: "Rituel précieux · désir plus lent mais plus intense",
      growthNote: "Version rare : Cardin travaille le désir, le statut et la tension autour d'un privilège.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "7 passages → accès Grand Prix Café",
      projectionCaption: "Projection de désir sur un privilège plus rare et plus mémorable.",
      recoveryMultiplier: 1.1,
      reminderLabel: "Le Grand Prix Café commence à se dessiner",
      rewardFieldLabel: "Privilège rare affiché sur la carte",
      rewardLabel: "accès Grand Prix Café",
      targetVisits: 7,
    },
  },
  restaurant: {
    return: {
      activationDescription: "Cardin lance un rendez-vous de retour entre deux services avec un privilège simple à raconter.",
      activationTitle: "Lancer votre retour restaurant",
      cadenceLabel: "Retour moyen · visite relancée entre deux repas",
      growthNote: "Version retour : Cardin travaille la récurrence et les moments faibles du service.",
      midpointMode: "recognition_only",
      pointOfDeparture: "4 visites → dessert secret",
      projectionCaption: "Projection de retour sur une clientèle restaurant à revisite occasionnelle.",
      recoveryMultiplier: 1.05,
      reminderLabel: "Votre dessert secret peut s'ouvrir cette semaine",
      rewardFieldLabel: "Privilège affiché sur la carte",
      rewardLabel: "1 dessert secret",
      targetVisits: 4,
    },
    domino: {
      activationDescription: "Cardin lance une table Domino : un invité validé devient un accélérateur visible dans le parcours client.",
      activationTitle: "Lancer votre table Domino",
      cadenceLabel: "Domino moyen · table et circulation active",
      growthNote: "Version domino : Cardin travaille la venue à plusieurs et la relance par groupe.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "4 visites → boost à table si 1 invité vient",
      projectionCaption: "Projection de circulation sur un restaurant où une personne de plus change la table.",
      recoveryMultiplier: 1.22,
      reminderLabel: "Inviter quelqu'un peut accélérer votre table",
      rewardFieldLabel: "Boost ou privilège affiché sur la carte",
      rewardLabel: "1 invité validé = boost à table",
      targetVisits: 4,
    },
    rare: {
      activationDescription: "Cardin lance une version rare qui met en scène un privilège de table plus exclusif et plus lent.",
      activationTitle: "Lancer votre Grand Prix Table",
      cadenceLabel: "Cycle plus rare · désir de table et privilège signature",
      growthNote: "Version rare : Cardin travaille le désir de table, pas seulement le volume.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "6 visites → accès Grand Prix Table",
      projectionCaption: "Projection de désir sur une expérience de table plus exceptionnelle.",
      recoveryMultiplier: 1.12,
      reminderLabel: "Le Grand Prix Table se rapproche",
      rewardFieldLabel: "Privilège rare affiché sur la carte",
      rewardLabel: "accès Grand Prix Table",
      targetVisits: 6,
    },
  },
  boulangerie: {
    return: {
      activationDescription: "Cardin lance un rituel de quartier qui rend le passage plus fréquent et plus visible dans la semaine.",
      activationTitle: "Lancer votre rituel de quartier",
      cadenceLabel: "Retour court · routine visible dans la semaine",
      growthNote: "Version retour : Cardin travaille surtout la routine et le retour rapide.",
      midpointMode: "recognition_only",
      pointOfDeparture: "5 passages → douceur réservée",
      projectionCaption: "Projection de récurrence sur une clientèle de quartier fréquente.",
      recoveryMultiplier: 1.05,
      reminderLabel: "Votre rituel de fournée vous attend demain",
      rewardFieldLabel: "Privilège affiché sur la carte",
      rewardLabel: "1 douceur réservée",
      targetVisits: 5,
    },
    domino: {
      activationDescription: "Cardin lance un domino de quartier : la rue devient moteur et chaque voisin amené accélère la progression.",
      activationTitle: "Lancer votre domino de quartier",
      cadenceLabel: "Domino court · voisinage et accélération",
      growthNote: "Version domino : Cardin travaille la propagation locale et le passage partagé.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "4 passages → boost si 1 voisin est amené",
      projectionCaption: "Projection de circulation sur un commerce de quartier qui se recommande vite.",
      recoveryMultiplier: 1.18,
      reminderLabel: "Inviter un voisin peut accélérer votre carte",
      rewardFieldLabel: "Boost ou privilège affiché sur la carte",
      rewardLabel: "1 voisin amené = boost",
      targetVisits: 4,
    },
    rare: {
      activationDescription: "Cardin lance une exception rare qui donne une vraie tension au-dessus de la routine hebdomadaire.",
      activationTitle: "Lancer votre version rare",
      cadenceLabel: "Cycle plus précieux · désir local plus intense",
      growthNote: "Version rare : Cardin travaille le désir et la perception du lieu.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "6 passages → accès Grand Tirage Fournée",
      projectionCaption: "Projection de désir sur un privilège rare au-dessus de la routine.",
      recoveryMultiplier: 1.1,
      reminderLabel: "Le Grand Tirage Fournée commence à se dessiner",
      rewardFieldLabel: "Privilège rare affiché sur la carte",
      rewardLabel: "accès Grand Tirage Fournée",
      targetVisits: 6,
    },
  },
  caviste: {
    return: {
      activationDescription: "Cardin lance un rendez-vous cave simple pour remettre la selection dans la boucle entre deux achats.",
      activationTitle: "Lancer votre rendez-vous cave",
      cadenceLabel: "Retour choisi · degustation et visite relancees",
      growthNote: "Version retour : Cardin travaille surtout la revisite et la valeur de selection.",
      midpointMode: "recognition_only",
      pointOfDeparture: "5 passages → 1 dégustation réservée",
      projectionCaption: "Projection de retour sur une clientèle cave qui revient par intention.",
      recoveryMultiplier: 1.04,
      reminderLabel: "Votre prochaine dégustation peut s'ouvrir bientôt",
      rewardFieldLabel: "Privilège affiché sur la carte",
      rewardLabel: "1 dégustation réservée",
      targetVisits: 5,
    },
    domino: {
      activationDescription: "Cardin lance un duo dégustation : un invité validé renforce le retour et la circulation autour de la cave.",
      activationTitle: "Lancer votre duo dégustation",
      cadenceLabel: "Domino choisi · propagation par invitation utile",
      growthNote: "Version domino : Cardin travaille la circulation sociale sans tomber dans la promo brute.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "4 passages → boost si 1 invité valide une dégustation",
      projectionCaption: "Projection de circulation sur un caviste où la recommandation se fait autour d'un vrai moment.",
      recoveryMultiplier: 1.18,
      reminderLabel: "Inviter quelqu'un peut accélérer votre sélection",
      rewardFieldLabel: "Boost ou privilège affiché sur la carte",
      rewardLabel: "1 invité validé = boost cave",
      targetVisits: 4,
    },
    rare: {
      activationDescription: "Cardin lance une version rare qui transforme la cave en accès choisi vers une bouteille ou une dégustation plus exclusive.",
      activationTitle: "Lancer votre cuvée privée",
      cadenceLabel: "Cycle plus rare · desir de selection et acces reserve",
      growthNote: "Version rare : Cardin travaille l'accès, la distinction et la valeur perçue.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "5 passages → accès Cuvée Privée",
      projectionCaption: "Projection de désir sur un privilège de cave plus exceptionnel.",
      recoveryMultiplier: 1.1,
      reminderLabel: "La Cuvée Privée commence à se dessiner",
      rewardFieldLabel: "Privilège rare affiché sur la carte",
      rewardLabel: "accès Cuvée Privée",
      targetVisits: 5,
    },
  },
  coiffeur: {
    return: {
      activationDescription: "Cardin lance un cycle de retour plus lisible pour raccourcir doucement le temps entre deux rendez-vous.",
      activationTitle: "Lancer votre cycle retour",
      cadenceLabel: "Cycle visible · retour entre deux rendez-vous",
      growthNote: "Version retour : Cardin travaille surtout le rythme et la réactivation du cycle.",
      midpointMode: "recognition_only",
      pointOfDeparture: "4 visites → soin signature",
      projectionCaption: "Projection de récurrence sur un cycle coiffeur plus visible.",
      recoveryMultiplier: 1.06,
      reminderLabel: "Votre prochain passage peut arriver plus vite",
      rewardFieldLabel: "Privilège affiché sur la carte",
      rewardLabel: "1 soin signature",
      targetVisits: 4,
    },
    domino: {
      activationDescription: "Cardin lance un domino direct : une invitée validée devient un vrai saut de progression vers Diamond.",
      activationTitle: "Lancer votre version Bring a Friend",
      cadenceLabel: "Domino actif · progression accélérée par invitation",
      growthNote: "Version domino : Cardin travaille la circulation sociale et le saut de statut.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "3 visites → saut si 1 invitée validée",
      projectionCaption: "Projection de circulation sur un lieu où l'invitation peut fortement compter.",
      recoveryMultiplier: 1.22,
      reminderLabel: "Inviter quelqu'un peut vous faire sauter une étape",
      rewardFieldLabel: "Boost ou privilège affiché sur la carte",
      rewardLabel: "1 invitée validée = saut vers Diamond",
      targetVisits: 3,
    },
    rare: {
      activationDescription: "Cardin lance une carte de prestige orientée privilège annuel et désir fort.",
      activationTitle: "Lancer votre Grand Prix Coupe",
      cadenceLabel: "Cycle rare · privilège annuel et statut fort",
      growthNote: "Version rare : Cardin travaille la valeur symbolique du lieu.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "5 visites → accès Grand Prix Coupe",
      projectionCaption: "Projection de désir sur un privilège coiffeur beaucoup plus exceptionnel.",
      recoveryMultiplier: 1.12,
      reminderLabel: "Le Grand Prix Coupe commence à se dessiner",
      rewardFieldLabel: "Privilège rare affiché sur la carte",
      rewardLabel: "accès Grand Prix Coupe",
      targetVisits: 5,
    },
  },
  "institut-beaute": {
    return: {
      activationDescription: "Cardin lance un suivi de rituel qui stabilise la fréquence et rend la progression plus sensible.",
      activationTitle: "Lancer votre rituel beauté",
      cadenceLabel: "Rituel suivi · fréquence plus stable",
      growthNote: "Version retour : Cardin travaille surtout la régularité du soin.",
      midpointMode: "recognition_only",
      pointOfDeparture: "3 visites → geste réservé",
      projectionCaption: "Projection de récurrence sur un suivi beauté plus stable.",
      recoveryMultiplier: 1.06,
      reminderLabel: "Votre rituel peau peut monter cette semaine",
      rewardFieldLabel: "Privilège affiché sur la carte",
      rewardLabel: "1 geste réservé",
      targetVisits: 3,
    },
    domino: {
      activationDescription: "Cardin lance une version duo : venir à deux devient un accélérateur doux mais visible.",
      activationTitle: "Lancer votre Duo Glow",
      cadenceLabel: "Domino doux · duo et accélération de progression",
      growthNote: "Version domino : Cardin travaille la circulation sans agressivité.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "3 visites → boost si 1 duo validé",
      projectionCaption: "Projection de circulation sur un lieu de soin qui se recommande avec douceur.",
      recoveryMultiplier: 1.18,
      reminderLabel: "Un duo peut accélérer votre carte aujourd'hui",
      rewardFieldLabel: "Boost ou privilège affiché sur la carte",
      rewardLabel: "1 duo validé = boost soin",
      targetVisits: 3,
    },
    rare: {
      activationDescription: "Cardin lance une version rare qui met l'accent sur un privilège de soin plus prestigieux.",
      activationTitle: "Lancer votre Diamond Glow",
      cadenceLabel: "Cycle rare · privilège soin et statut",
      growthNote: "Version rare : Cardin travaille l'exception et la désirabilité du soin.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "5 visites → accès Diamond Glow",
      projectionCaption: "Projection de désir sur une expérience soin plus exceptionnelle.",
      recoveryMultiplier: 1.1,
      reminderLabel: "Diamond Glow commence à prendre forme",
      rewardFieldLabel: "Privilège rare affiché sur la carte",
      rewardLabel: "accès Diamond Glow",
      targetVisits: 5,
    },
  },
  boutique: {
    return: {
      activationDescription: "Cardin lance une progression de retour pour donner une raison de repasser entre deux achats.",
      activationTitle: "Lancer votre cercle collection",
      cadenceLabel: "Retour moyen · désir relancé entre deux achats",
      growthNote: "Version retour : Cardin travaille la réactivation et l'envie de repasser.",
      midpointMode: "recognition_only",
      pointOfDeparture: "3 achats → accès preview",
      projectionCaption: "Projection de récurrence sur des retours en boutique plus fréquents.",
      recoveryMultiplier: 1.05,
      reminderLabel: "Votre cercle collection peut monter cette semaine",
      rewardFieldLabel: "Privilège affiché sur la carte",
      rewardLabel: "accès preview réservée",
      targetVisits: 3,
    },
    domino: {
      activationDescription: "Cardin lance un duo d'accès : une invitée validée ouvre plus vite la porte de la prochaine preview.",
      activationTitle: "Lancer votre Duo Accès",
      cadenceLabel: "Domino moyen · circulation et accès accéléré",
      growthNote: "Version domino : Cardin travaille la propagation et l'effet duo.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "3 achats → accès accéléré si 1 invitée vient",
      projectionCaption: "Projection de circulation sur une boutique où l'accès peut se partager.",
      recoveryMultiplier: 1.2,
      reminderLabel: "Un duo peut accélérer votre accès cette semaine",
      rewardFieldLabel: "Boost ou privilège affiché sur la carte",
      rewardLabel: "1 invitée validée = accès accéléré",
      targetVisits: 3,
    },
    rare: {
      activationDescription: "Cardin lance une version rare qui transforme le lieu en porte d'accès vers une pièce ou un drop plus exceptionnel.",
      activationTitle: "Lancer votre Rare Drop",
      cadenceLabel: "Cycle rare · désir d'accès et exclusivité",
      growthNote: "Version rare : Cardin travaille l'accès et la rareté visible.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "5 achats → accès Rare Drop",
      projectionCaption: "Projection de désir sur une expérience boutique plus exclusive.",
      recoveryMultiplier: 1.1,
      reminderLabel: "Un Rare Drop peut s'ouvrir pour les cartes actives",
      rewardFieldLabel: "Privilège rare affiché sur la carte",
      rewardLabel: "accès Rare Drop",
      targetVisits: 5,
    },
  },
}

export function buildObjectiveScenario(template: MerchantTemplate, objective: ObjectiveHintId): ObjectiveScenario {
  const scenario = scenariosByTemplate[template.id]?.[objective] ?? scenariosByTemplate.boulangerie.return

  return {
    ...scenario,
    description: objectiveHints[objective].description,
    label: objectiveHints[objective].label,
  }
}
