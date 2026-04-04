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
    description: "On garde une base simple, puis le domino vient accelerer la circulation.",
  },
  rare: {
    label: "Creer quelque chose de rare",
    description: "On commence lisible, puis on monte vers un privilege qui change la perception du lieu.",
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
      activationTitle: "Lancer votre rituel cafe",
      cadenceLabel: "Rituel court / retour plus frequemment visible",
      growthNote: "Version rituel: Cardin travaille surtout la recurrence et l'habitude.",
      midpointMode: "recognition_only",
      pointOfDeparture: "5 passages -> 1 boisson signature",
      projectionCaption: "Projection de recurrence sur une clientele de cafe reguliere.",
      recoveryMultiplier: 1.04,
      reminderLabel: "Votre rituel cafe vous attend",
      rewardFieldLabel: "Privilege affiche sur la carte",
      rewardLabel: "1 boisson signature",
      targetVisits: 5,
    },
    domino: {
      activationDescription: "Cardin lance une version circulation: chaque invite validee renforce l'envie de revenir et de faire venir.",
      activationTitle: "Lancer votre scenario Domino",
      cadenceLabel: "Domino actif / progression acceleree par invitation",
      growthNote: "Version domino: Cardin travaille la propagation et la croissance par invites.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "4 passages -> boost si 1 invitee validee",
      projectionCaption: "Projection de circulation sur une clientele cafe qui se transmet vite.",
      recoveryMultiplier: 1.2,
      reminderLabel: "Un +1 peut accelerer votre carte aujourd'hui",
      rewardFieldLabel: "Boost ou privilege affiche sur la carte",
      rewardLabel: "1 invitee validee = boost",
      targetVisits: 4,
    },
    rare: {
      activationDescription: "Cardin lance une carte de prestige: plus lente, plus desiree, orientee privilege exceptionnel.",
      activationTitle: "Lancer votre version rare",
      cadenceLabel: "Rituel precieux / desir plus lent mais plus intense",
      growthNote: "Version rare: Cardin travaille le desir, le statut et la tension autour d'un privilege.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "7 passages -> acces Grand Prix Cafe",
      projectionCaption: "Projection de desir sur un privilege plus rare et plus memorable.",
      recoveryMultiplier: 1.1,
      reminderLabel: "Le Grand Prix Cafe commence a se dessiner",
      rewardFieldLabel: "Privilege rare affiche sur la carte",
      rewardLabel: "acces Grand Prix Cafe",
      targetVisits: 7,
    },
  },
  restaurant: {
    return: {
      activationDescription: "Cardin lance un rendez-vous de retour entre deux services avec un privilege simple a raconter.",
      activationTitle: "Lancer votre retour restaurant",
      cadenceLabel: "Retour moyen / visite relancee entre deux repas",
      growthNote: "Version retour: Cardin travaille la recurrence et les moments faibles du service.",
      midpointMode: "recognition_only",
      pointOfDeparture: "4 visites -> dessert secret",
      projectionCaption: "Projection de retour sur une clientele restaurant a revisite occasionnelle.",
      recoveryMultiplier: 1.05,
      reminderLabel: "Votre dessert secret peut s'ouvrir cette semaine",
      rewardFieldLabel: "Privilege affiche sur la carte",
      rewardLabel: "1 dessert secret",
      targetVisits: 4,
    },
    domino: {
      activationDescription: "Cardin lance une table Domino: un invite valide devient un accelerateur visible dans le parcours client.",
      activationTitle: "Lancer votre table Domino",
      cadenceLabel: "Domino moyen / table et circulation active",
      growthNote: "Version domino: Cardin travaille la venue a plusieurs et la relance par groupe.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "4 visites -> boost a table si 1 invitee vient",
      projectionCaption: "Projection de circulation sur un restaurant ou une personne de plus change la table.",
      recoveryMultiplier: 1.22,
      reminderLabel: "Inviter quelqu'un peut accelerer votre table",
      rewardFieldLabel: "Boost ou privilege affiche sur la carte",
      rewardLabel: "1 invitee validee = boost a table",
      targetVisits: 4,
    },
    rare: {
      activationDescription: "Cardin lance une version rare qui met en scene un privilege de table plus exclusif et plus lent.",
      activationTitle: "Lancer votre Grand Prix Table",
      cadenceLabel: "Cycle plus rare / desir de table et privilege signature",
      growthNote: "Version rare: Cardin travaille le desir de table, pas seulement le volume.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "6 visites -> acces Grand Prix Table",
      projectionCaption: "Projection de desir sur une experience de table plus exceptionnelle.",
      recoveryMultiplier: 1.12,
      reminderLabel: "Le Grand Prix Table se rapproche",
      rewardFieldLabel: "Privilege rare affiche sur la carte",
      rewardLabel: "acces Grand Prix Table",
      targetVisits: 6,
    },
  },
  boulangerie: {
    return: {
      activationDescription: "Cardin lance un rituel de quartier qui rend le passage plus frequent et plus visible dans la semaine.",
      activationTitle: "Lancer votre rituel de quartier",
      cadenceLabel: "Retour court / routine visible dans la semaine",
      growthNote: "Version retour: Cardin travaille surtout la routine et le retour rapide.",
      midpointMode: "recognition_only",
      pointOfDeparture: "5 passages -> douceur reservee",
      projectionCaption: "Projection de recurrence sur une clientele de quartier frequente.",
      recoveryMultiplier: 1.05,
      reminderLabel: "Votre rituel de fournee vous attend demain",
      rewardFieldLabel: "Privilege affiche sur la carte",
      rewardLabel: "1 douceur reservee",
      targetVisits: 5,
    },
    domino: {
      activationDescription: "Cardin lance un domino de quartier: la rue devient moteur et chaque voisin amene accelere la progression.",
      activationTitle: "Lancer votre domino de quartier",
      cadenceLabel: "Domino court / voisinage et acceleration",
      growthNote: "Version domino: Cardin travaille la propagation locale et le passage partage.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "4 passages -> boost si 1 voisin est amene",
      projectionCaption: "Projection de circulation sur un commerce de quartier qui se recommande vite.",
      recoveryMultiplier: 1.18,
      reminderLabel: "Inviter un voisin peut accelerer votre carte",
      rewardFieldLabel: "Boost ou privilege affiche sur la carte",
      rewardLabel: "1 voisin amene = boost",
      targetVisits: 4,
    },
    rare: {
      activationDescription: "Cardin lance une exception rare qui donne une vraie tension au-dessus de la routine hebdomadaire.",
      activationTitle: "Lancer votre version rare",
      cadenceLabel: "Cycle plus precieux / desir local plus intense",
      growthNote: "Version rare: Cardin travaille le desir et la perception du lieu.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "6 passages -> acces Grand Tirage Fournee",
      projectionCaption: "Projection de desir sur un privilege rare au-dessus de la routine.",
      recoveryMultiplier: 1.1,
      reminderLabel: "Le Grand Tirage Fournee commence a se dessiner",
      rewardFieldLabel: "Privilege rare affiche sur la carte",
      rewardLabel: "acces Grand Tirage Fournee",
      targetVisits: 6,
    },
  },
  coiffeur: {
    return: {
      activationDescription: "Cardin lance un cycle de retour plus lisible pour raccourcir doucement le temps entre deux rendez-vous.",
      activationTitle: "Lancer votre cycle retour",
      cadenceLabel: "Cycle visible / retour entre deux rendez-vous",
      growthNote: "Version retour: Cardin travaille surtout le rythme et la reactivation du cycle.",
      midpointMode: "recognition_only",
      pointOfDeparture: "4 visites -> soin signature",
      projectionCaption: "Projection de recurrence sur un cycle coiffeur plus visible.",
      recoveryMultiplier: 1.06,
      reminderLabel: "Votre prochain passage peut arriver plus vite",
      rewardFieldLabel: "Privilege affiche sur la carte",
      rewardLabel: "1 soin signature",
      targetVisits: 4,
    },
    domino: {
      activationDescription: "Cardin lance un domino direct: une invitee validee devient un vrai saut de progression vers Diamond.",
      activationTitle: "Lancer votre version Bring a Friend",
      cadenceLabel: "Domino actif / progression acceleree par invitation",
      growthNote: "Version domino: Cardin travaille la circulation sociale et le saut de statut.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "3 visites -> saut si 1 invitee validee",
      projectionCaption: "Projection de circulation sur un lieu ou l'invitation peut fortement compter.",
      recoveryMultiplier: 1.22,
      reminderLabel: "Inviter quelqu'un peut vous faire sauter une etape",
      rewardFieldLabel: "Boost ou privilege affiche sur la carte",
      rewardLabel: "1 invitee validee = saut vers Diamond",
      targetVisits: 3,
    },
    rare: {
      activationDescription: "Cardin lance une carte de prestige orientee privilege annuel et desir fort.",
      activationTitle: "Lancer votre Grand Prix Coupe",
      cadenceLabel: "Cycle rare / privilege annuel et statut fort",
      growthNote: "Version rare: Cardin travaille la valeur symbolique du lieu.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "5 visites -> acces Grand Prix Coupe",
      projectionCaption: "Projection de desir sur un privilege coiffeur beaucoup plus exceptionnel.",
      recoveryMultiplier: 1.12,
      reminderLabel: "Le Grand Prix Coupe commence a se dessiner",
      rewardFieldLabel: "Privilege rare affiche sur la carte",
      rewardLabel: "acces Grand Prix Coupe",
      targetVisits: 5,
    },
  },
  "institut-beaute": {
    return: {
      activationDescription: "Cardin lance un suivi de rituel qui stabilise la frequence et rend la progression plus sensible.",
      activationTitle: "Lancer votre rituel beaute",
      cadenceLabel: "Rituel suivi / frequence plus stable",
      growthNote: "Version retour: Cardin travaille surtout la regularite du soin.",
      midpointMode: "recognition_only",
      pointOfDeparture: "3 visites -> geste reserve",
      projectionCaption: "Projection de recurrence sur un suivi beaute plus stable.",
      recoveryMultiplier: 1.06,
      reminderLabel: "Votre rituel peau peut monter cette semaine",
      rewardFieldLabel: "Privilege affiche sur la carte",
      rewardLabel: "1 geste reserve",
      targetVisits: 3,
    },
    domino: {
      activationDescription: "Cardin lance une version duo: venir a deux devient un accelerateur doux mais visible.",
      activationTitle: "Lancer votre Duo Glow",
      cadenceLabel: "Domino doux / duo et acceleration de progression",
      growthNote: "Version domino: Cardin travaille la circulation sans agressivite.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "3 visites -> boost si 1 duo valide",
      projectionCaption: "Projection de circulation sur un lieu de soin qui se recommande avec douceur.",
      recoveryMultiplier: 1.18,
      reminderLabel: "Un duo peut accelerer votre carte aujourd'hui",
      rewardFieldLabel: "Boost ou privilege affiche sur la carte",
      rewardLabel: "1 duo valide = boost soin",
      targetVisits: 3,
    },
    rare: {
      activationDescription: "Cardin lance une version rare qui met l'accent sur un privilege de soin plus prestigieux.",
      activationTitle: "Lancer votre Diamond Glow",
      cadenceLabel: "Cycle rare / privilege soin et statut",
      growthNote: "Version rare: Cardin travaille l'exception et la desirabilite du soin.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "5 visites -> acces Diamond Glow",
      projectionCaption: "Projection de desir sur une experience soin plus exceptionnelle.",
      recoveryMultiplier: 1.1,
      reminderLabel: "Diamond Glow commence a prendre forme",
      rewardFieldLabel: "Privilege rare affiche sur la carte",
      rewardLabel: "acces Diamond Glow",
      targetVisits: 5,
    },
  },
  boutique: {
    return: {
      activationDescription: "Cardin lance une progression de retour pour donner une raison de repasser entre deux achats.",
      activationTitle: "Lancer votre cercle collection",
      cadenceLabel: "Retour moyen / desir relance entre deux achats",
      growthNote: "Version retour: Cardin travaille la reactivation et l'envie de repasser.",
      midpointMode: "recognition_only",
      pointOfDeparture: "3 achats -> acces preview",
      projectionCaption: "Projection de recurrence sur des retours en boutique plus frequents.",
      recoveryMultiplier: 1.05,
      reminderLabel: "Votre cercle collection peut monter cette semaine",
      rewardFieldLabel: "Privilege affiche sur la carte",
      rewardLabel: "acces preview reservee",
      targetVisits: 3,
    },
    domino: {
      activationDescription: "Cardin lance un duo d'acces: une invitee validee ouvre plus vite la porte de la prochaine preview.",
      activationTitle: "Lancer votre Duo Acces",
      cadenceLabel: "Domino moyen / circulation et acces accelere",
      growthNote: "Version domino: Cardin travaille la propagation et l'effet duo.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "3 achats -> acces accelere si 1 invitee vient",
      projectionCaption: "Projection de circulation sur une boutique ou l'acces peut se partager.",
      recoveryMultiplier: 1.2,
      reminderLabel: "Un duo peut accelerer votre acces cette semaine",
      rewardFieldLabel: "Boost ou privilege affiche sur la carte",
      rewardLabel: "1 invitee validee = acces accelere",
      targetVisits: 3,
    },
    rare: {
      activationDescription: "Cardin lance une version rare qui transforme le lieu en porte d'acces vers une piece ou un drop plus exceptionnel.",
      activationTitle: "Lancer votre Rare Drop",
      cadenceLabel: "Cycle rare / desir d'acces et exclusivite",
      growthNote: "Version rare: Cardin travaille l'acces et la rarete visible.",
      midpointMode: "recognition_plus_boost",
      pointOfDeparture: "5 achats -> acces Rare Drop",
      projectionCaption: "Projection de desir sur une experience boutique plus exclusive.",
      recoveryMultiplier: 1.1,
      reminderLabel: "Un Rare Drop peut s'ouvrir pour les cartes actives",
      rewardFieldLabel: "Privilege rare affiche sur la carte",
      rewardLabel: "acces Rare Drop",
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
