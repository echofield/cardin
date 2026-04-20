import { calculateRecovery } from "@/lib/calculator"
import { LANDING_PRICING } from "@/lib/landing-content"

export type ParcoursBusinessKey = "cafe" | "bar" | "restaurant" | "beaute" | "boutique"
export type ParcoursLeakKey = "disparition" | "creuses" | "frequence" | "propagation" | "staff"
export type ParcoursVolumeKey = "faible" | "moyen" | "fort"
export type ParcoursBasketKey = "bas" | "moyen" | "eleve"
export type ParcoursRhythmKey = "rapide" | "hebdo" | "mensuel"
export type ParcoursRewardKey = "cafe" | "credit" | "menu" | "invitation"
export type ParcoursWhoKey = "all" | "regular" | "top"
export type ParcoursSpreadKey = "solo" | "duo" | "group"
export type ParcoursDiamondKey = "dinner" | "credit" | "unlimited"

export type ParcoursQueryState = {
  business: ParcoursBusinessKey | null
  leak: ParcoursLeakKey | null
  volume: ParcoursVolumeKey | null
  basket: ParcoursBasketKey | null
  rhythm: ParcoursRhythmKey | null
}

export type ParcoursConfigurationState = {
  reward: ParcoursRewardKey
  threshold: number
  who: ParcoursWhoKey
  spread: ParcoursSpreadKey
  diamond: ParcoursDiamondKey
  decay: number
}

export type ParcoursFlowState = ParcoursQueryState & ParcoursConfigurationState

export type ParcoursSeasonPreset = {
  key: ParcoursBusinessKey
  label: string
  summary: string
  momentLine: string
} & ParcoursConfigurationState

export type BusinessOption = {
  key: ParcoursBusinessKey
  label: string
  brand: string
  basketByLevel: { bas: number; moyen: number; eleve: number }
  lossRate: number
  recoveryRate: number
}

type RewardOption = {
  key: ParcoursRewardKey
  label: string
  phrase: string
  multiplier: number
}

type DiamondOption = {
  key: ParcoursDiamondKey
  label: string
  phrase: string
  multiplier: number
}

export type LeakOption = {
  key: ParcoursLeakKey
  label: string
  recapLabel: string
  subtitle: string
  point: string
  lever: string
  launch: string
  multiplier: number
}

type ImpactProfile = {
  label: string
  baseLevers: {
    retour: number
    panier: number
    propagation: number
    missions: number
  }
  baseSigma: number
  waves: {
    v1: number
    v2: number
    v3: number
    v4: number
  }
  roles: Record<"retour" | "panier" | "propagation" | "missions", string>
  winwin: Record<"retour" | "panier" | "propagation" | "missions", string>
  cascadeSub: string
}

export const PARCOURS_STORAGE_KEY = "cardin-parcours-v2"
export const PARCOURS_DECAY_VALUES = [3, 5, 7, 10, 14] as const
export const PARCOURS_STEP_LABELS = ["Lecture", "Saison", "Impact", "Offre", "Paiement"] as const

export const DEFAULT_PARCOURS_FLOW_STATE: ParcoursFlowState = {
  business: null,
  leak: null,
  volume: null,
  basket: null,
  rhythm: null,
  reward: "cafe",
  threshold: 3,
  who: "all",
  spread: "solo",
  diamond: "dinner",
  decay: 7,
}

export const SEASON_PRESETS: Record<ParcoursBusinessKey, ParcoursSeasonPreset> = {
  cafe: {
    key: "cafe",
    label: "Retour rapide",
    summary: "Remettre du rythme sur les heures faibles et faire revenir en duo.",
    momentLine: "Mardi 15h–18h · un duo peut déclencher le premier moment.",
    reward: "cafe",
    threshold: 3,
    who: "all",
    spread: "duo",
    diamond: "dinner",
    decay: 5,
  },
  bar: {
    key: "bar",
    label: "Nuit vivante",
    summary: "Faire monter les groupes et donner un vrai rendez-vous au soir creux.",
    momentLine: "Vendredi soir · une table peut être désignée en salle.",
    reward: "menu",
    threshold: 3,
    who: "all",
    spread: "group",
    diamond: "dinner",
    decay: 5,
  },
  restaurant: {
    key: "restaurant",
    label: "Jour plein",
    summary: "Créer une raison de réserver ensemble et de revenir sur la semaine.",
    momentLine: "Mardi ou jeudi · une table de 4+ peut faire basculer le service.",
    reward: "menu",
    threshold: 3,
    who: "all",
    spread: "group",
    diamond: "dinner",
    decay: 7,
  },
  beaute: {
    key: "beaute",
    label: "Retour élégant",
    summary: "Raccourcir le cycle de retour sans abîmer le niveau de service.",
    momentLine: "Cette semaine · un second rendez-vous peut ouvrir le moment.",
    reward: "menu",
    threshold: 4,
    who: "regular",
    spread: "duo",
    diamond: "dinner",
    decay: 14,
  },
  boutique: {
    key: "boutique",
    label: "Désir et jeu",
    summary: "Créer un rendez-vous social autour d'une pièce, d'un duo ou d'un vote.",
    momentLine: "Cette semaine · un duo ou un vote peut déclencher la pièce qui tombe.",
    reward: "credit",
    threshold: 3,
    who: "all",
    spread: "duo",
    diamond: "credit",
    decay: 10,
  },
}

export const BUSINESS_OPTIONS: BusinessOption[] = [
  {
    key: "cafe",
    label: "Café",
    brand: "Le comptoir",
    basketByLevel: { bas: 4, moyen: 7, eleve: 11 },
    lossRate: 0.28,
    recoveryRate: 0.22,
  },
  {
    key: "bar",
    label: "Bar",
    brand: "La maison",
    basketByLevel: { bas: 8, moyen: 14, eleve: 22 },
    lossRate: 0.28,
    recoveryRate: 0.2,
  },
  {
    key: "restaurant",
    label: "Restaurant",
    brand: "La table",
    basketByLevel: { bas: 14, moyen: 22, eleve: 38 },
    lossRate: 0.32,
    recoveryRate: 0.16,
  },
  {
    key: "beaute",
    label: "Beauté",
    brand: "L'institut",
    basketByLevel: { bas: 28, moyen: 48, eleve: 85 },
    lossRate: 0.36,
    recoveryRate: 0.15,
  },
  {
    key: "boutique",
    label: "Boutique",
    brand: "L'atelier",
    basketByLevel: { bas: 35, moyen: 68, eleve: 140 },
    lossRate: 0.32,
    recoveryRate: 0.17,
  },
]

export const LEAK_OPTIONS: LeakOption[] = [
  {
    key: "disparition",
    label: "Les clients viennent une fois puis disparaissent",
    recapLabel: "Clients de passage",
    subtitle: "Le passage existe, mais il n'a pas encore de raison claire de revenir.",
    point: "Le passage existe, mais il n'a pas encore de raison structurée de revenir.",
    lever: "Une récompense progressive visible dès la première visite, pas une remise immédiate.",
    launch: "Un cycle court au comptoir, lisible dès le premier passage, sur une boucle hebdomadaire.",
    multiplier: 1,
  },
  {
    key: "creuses",
    label: "Les heures creuses restent creuses",
    recapLabel: "Heures creuses",
    subtitle: "Le lieu a du volume, mais les temps faibles n'ont pas de déclencheur.",
    point: "Le flux existe, mais vos temps faibles n'ont aucun déclencheur utile.",
    lever: "Une mécanique créneau, activée uniquement aux heures ciblées.",
    launch: "Un cycle à déclenchement horaire, visible en salle, pour remplir les moments creux.",
    multiplier: 0.85,
  },
  {
    key: "frequence",
    label: "La fréquence est trop basse",
    recapLabel: "Fréquence basse",
    subtitle: "Le panier tient, mais le rythme naturel du retour reste trop lent.",
    point: "Le panier tient, mais le rythme du retour reste trop lent pour le lieu.",
    lever: "Une progression visible qui raccourcit l'intervalle entre deux passages.",
    launch: "Un cycle accéléré avec récompense intermédiaire, une raison de revenir cette semaine.",
    multiplier: 1.1,
  },
  {
    key: "propagation",
    label: "Les habitués reviennent, mais n'amènent personne",
    recapLabel: "Pas de propagation",
    subtitle: "Le retour existe, mais il ne se propage pas dans le cercle du client.",
    point: "Le retour existe, mais il ne se propage pas dans le cercle du client.",
    lever: "Une récompense partagée, où l'habitué débloque en amenant quelqu'un.",
    launch: "Un cycle duo ou groupe, où la validation staff amplifie le retour réseau.",
    multiplier: 1.3,
  },
  {
    key: "staff",
    label: "L'équipe n'a rien de simple à proposer",
    recapLabel: "Geste staff manquant",
    subtitle: "Le point de vente manque d'un geste comptoir clair pour provoquer le retour.",
    point: "Le lieu manque d'un geste comptoir clair pour provoquer le prochain passage.",
    lever: "Une validation staff simple et visible, avec récompense lisible côté client.",
    launch: "Un cycle direct au comptoir, dix secondes par client, sans remise libre.",
    multiplier: 0.95,
  },
]

export const VOLUME_OPTIONS: Array<{ key: ParcoursVolumeKey; label: string; value: number }> = [
  { key: "faible", label: "Faible", value: 25 },
  { key: "moyen", label: "Moyen", value: 70 },
  { key: "fort", label: "Fort", value: 180 },
]

export const BASKET_OPTIONS: Array<{ key: ParcoursBasketKey; label: string }> = [
  { key: "bas", label: "Bas" },
  { key: "moyen", label: "Moyen" },
  { key: "eleve", label: "Élevé" },
]

export const RHYTHM_OPTIONS: Array<{ key: ParcoursRhythmKey; label: string; multiplier: number }> = [
  { key: "rapide", label: "Rapide", multiplier: 1.15 },
  { key: "hebdo", label: "Hebdo", multiplier: 1 },
  { key: "mensuel", label: "Mensuel", multiplier: 0.75 },
]

const REWARD_BASE_OPTIONS: Array<{ key: ParcoursRewardKey; multiplier: number }> = [
  { key: "cafe", multiplier: 1 },
  { key: "credit", multiplier: 1.06 },
  { key: "menu", multiplier: 1.12 },
  { key: "invitation", multiplier: 1.09 },
]

const REWARD_COPY: Record<ParcoursRewardKey, Record<ParcoursBusinessKey, { label: string; phrase: string }>> = {
  cafe: {
    cafe: { label: "Café offert", phrase: "1 café offert" },
    bar: { label: "Verre offert", phrase: "1 verre offert" },
    restaurant: { label: "Dessert offert", phrase: "1 dessert offert" },
    beaute: { label: "Soin flash offert", phrase: "1 soin flash offert" },
    boutique: { label: "Accessoire offert", phrase: "1 accessoire offert" },
  },
  credit: {
    cafe: { label: "5 € de crédit", phrase: "5 € de crédit" },
    bar: { label: "8 € de crédit", phrase: "8 € de crédit" },
    restaurant: { label: "12 € de crédit", phrase: "12 € de crédit" },
    beaute: { label: "15 € de crédit", phrase: "15 € de crédit" },
    boutique: { label: "20 € de crédit", phrase: "20 € de crédit" },
  },
  menu: {
    cafe: { label: "Menu offert", phrase: "1 menu offert" },
    bar: { label: "Planche offerte", phrase: "1 planche offerte" },
    restaurant: { label: "Plat offert", phrase: "1 plat offert" },
    beaute: { label: "Soin offert", phrase: "1 soin offert" },
    boutique: { label: "Produit offert", phrase: "1 produit offert" },
  },
  invitation: {
    cafe: { label: "Invitation duo", phrase: "une invitation à deux" },
    bar: { label: "Invitation duo", phrase: "une invitation pour deux" },
    restaurant: { label: "Table duo", phrase: "une table duo à débloquer" },
    beaute: { label: "Invitation soin", phrase: "une invitation soin à partager" },
    boutique: { label: "Invitation preview", phrase: "une invitation preview à partager" },
  },
}

export const WHO_OPTIONS: Array<{ key: ParcoursWhoKey; label: string; phrase: string; multiplier: number }> = [
  { key: "all", label: "Tous", phrase: "tous les clients", multiplier: 0.98 },
  { key: "regular", label: "Réguliers", phrase: "les clients réguliers", multiplier: 1.02 },
  { key: "top", label: "Choisis", phrase: "les clients choisis", multiplier: 0.92 },
]

export const SPREAD_OPTIONS: Array<{ key: ParcoursSpreadKey; label: string; phrase: string; multiplier: number }> = [
  { key: "solo", label: "Seul", phrase: "en solo", multiplier: 1 },
  { key: "duo", label: "Duo", phrase: "à deux", multiplier: 1.16 },
  { key: "group", label: "Groupe", phrase: "à plusieurs", multiplier: 1.28 },
]

const DIAMOND_BASE_OPTIONS: Array<{ key: ParcoursDiamondKey; multiplier: number }> = [
  { key: "dinner", multiplier: 1 },
  { key: "credit", multiplier: 1.08 },
  { key: "unlimited", multiplier: 1.14 },
]

const DIAMOND_COPY: Record<ParcoursDiamondKey, Record<ParcoursBusinessKey, { label: string; phrase: string }>> = {
  dinner: {
    cafe: { label: "Tirage brunch · 1 an", phrase: "entrée au tirage Diamond · 1 brunch/mois pendant 1 an" },
    bar: { label: "Tirage soirée · 1 an", phrase: "entrée au tirage Diamond · 1 soirée/mois pendant 1 an" },
    restaurant: { label: "Tirage dîner · 1 an", phrase: "entrée au tirage Diamond · 1 dîner/mois pendant 1 an" },
    beaute: { label: "Tirage soin signature · 1 an", phrase: "entrée au tirage Diamond · 1 soin signature/trimestre pendant 1 an" },
    boutique: { label: "Tirage preview · 1 an", phrase: "entrée au tirage Diamond · 1 preview/mois pendant 1 an" },
  },
  credit: {
    cafe: { label: "Tirage 200 € crédit", phrase: "entrée au tirage Diamond · 200 € de crédit sur 12 mois" },
    bar: { label: "Tirage 250 € crédit", phrase: "entrée au tirage Diamond · 250 € de crédit sur 12 mois" },
    restaurant: { label: "Tirage 300 € crédit", phrase: "entrée au tirage Diamond · 300 € de crédit sur 12 mois" },
    beaute: { label: "Tirage 300 € crédit", phrase: "entrée au tirage Diamond · 300 € de crédit sur 12 mois" },
    boutique: { label: "Tirage 400 € crédit", phrase: "entrée au tirage Diamond · 400 € de crédit sur 12 mois" },
  },
  unlimited: {
    cafe: { label: "Tirage accès comptoir", phrase: "entrée au tirage Diamond · accès comptoir pendant 1 mois" },
    bar: { label: "Tirage accès maison", phrase: "entrée au tirage Diamond · accès maison pendant 1 mois" },
    restaurant: { label: "Tirage accès chef", phrase: "entrée au tirage Diamond · accès chef pendant 1 mois" },
    beaute: { label: "Tirage accès cabine", phrase: "entrée au tirage Diamond · accès cabine pendant 1 mois" },
    boutique: { label: "Tirage accès privé", phrase: "entrée au tirage Diamond · accès privé pendant 1 mois" },
  },
}

const IMPACT_PROFILES: Record<ParcoursBusinessKey, ImpactProfile> = {
  cafe: {
    label: "Café",
    baseLevers: { retour: 2835, panier: 340, propagation: 32, missions: 176 },
    baseSigma: 50,
    waves: { v1: 200, v2: 180, v3: 130, v4: 70 },
    roles: {
      retour: "Le Visiteur devient Régulier",
      panier: "Le Régulier commande plus",
      propagation: "L'Insider amène les siens",
      missions: "Le Host organise",
    },
    winwin: {
      retour: "<strong>Il gagne</strong> un lieu où on le reconnaît. <span class=\"sep\">·</span> <strong>Vous gagnez</strong> un client qui revient sans rappel.",
      panier: "<strong>Il découvre</strong> ce qu'il n'avait pas essayé. <span class=\"sep\">·</span> <strong>Vous augmentez</strong> la valeur par visite.",
      propagation: "<strong>Il partage</strong> un bon endroit avec ses proches. <span class=\"sep\">·</span> <strong>Vous gagnez</strong> leur entourage, sans acquisition payante.",
      missions: "<strong>Il transforme</strong> un moment en occasion. <span class=\"sep\">·</span> <strong>Vous remplissez</strong> les créneaux silencieux.",
    },
    cascadeSub:
      "Au 3e passage validé, chaque client peut inviter un proche, avec un geste offert au duo. L'invité entre à son tour dans le parcours. Le moteur se propage en vagues.",
  },
  bar: {
    label: "Bar",
    baseLevers: { retour: 3120, panier: 480, propagation: 60, missions: 340 },
    baseSigma: 38,
    waves: { v1: 150, v2: 140, v3: 100, v4: 55 },
    roles: {
      retour: "Le Passant devient Habitué",
      panier: "L'Habitué reste plus longtemps",
      propagation: "Le Fidèle vient accompagné",
      missions: "L'Ambassadeur rassemble",
    },
    winwin: {
      retour: "<strong>Il gagne</strong> un repaire, un accueil qui le reconnaît. <span class=\"sep\">·</span> <strong>Vous gagnez</strong> un pilier de comptoir.",
      panier: "<strong>Il passe</strong> à la deuxième tournée avec plaisir. <span class=\"sep\">·</span> <strong>Vous augmentez</strong> la valeur par soirée.",
      propagation: "<strong>Il vient</strong> avec ses amis, pas seul. <span class=\"sep\">·</span> <strong>Vous remplissez</strong> sans campagne.",
      missions: "<strong>Il organise</strong> son cercle autour de votre bar. <span class=\"sep\">·</span> <strong>Vous remplissez</strong> les soirs creux.",
    },
    cascadeSub:
      "À la 3e visite validée, chaque habitué peut inviter un ami pour un verre offert au duo. L'invité entre à son tour dans le parcours. Le moteur se propage en vagues.",
  },
  restaurant: {
    label: "Restaurant",
    baseLevers: { retour: 2867, panier: 520, propagation: 75, missions: 737 },
    baseSigma: 27,
    waves: { v1: 100, v2: 95, v3: 72, v4: 42 },
    roles: {
      retour: "L'Invité devient Habitué",
      panier: "L'Habitué commande mieux",
      propagation: "Le VIP amène sa table",
      missions: "L'Organisateur rassemble",
    },
    winwin: {
      retour: "<strong>Il gagne</strong> une table qui le reconnaît. <span class=\"sep\">·</span> <strong>Vous gagnez</strong> une réservation récurrente.",
      panier: "<strong>Il ose</strong> le vin, le dessert, l'accord. <span class=\"sep\">·</span> <strong>Vous augmentez</strong> le ticket moyen.",
      propagation: "<strong>Il invite</strong> ses proches à sa table. <span class=\"sep\">·</span> <strong>Vous gagnez</strong> de nouveaux clients par recommandation réelle.",
      missions: "<strong>Il organise</strong> un anniversaire, un dîner. <span class=\"sep\">·</span> <strong>Vous remplissez</strong> des tables entières.",
    },
    cascadeSub:
      "Au 3e repas validé, chaque habitué peut inviter un proche, avec un plat offert à partager. L'invité entre à son tour dans le parcours. Le moteur se propage en vagues.",
  },
  beaute: {
    label: "Beauté",
    baseLevers: { retour: 2780, panier: 620, propagation: 95, missions: 820 },
    baseSigma: 32,
    waves: { v1: 80, v2: 72, v3: 54, v4: 30 },
    roles: {
      retour: "La Cliente devient Régulière",
      panier: "La Régulière élargit ses rendez-vous",
      propagation: "L'Initiée recommande son institut",
      missions: "L'Ambassadrice amène son cercle",
    },
    winwin: {
      retour: "<strong>Elle gagne</strong> un institut qui la connaît. <span class=\"sep\">·</span> <strong>Vous gagnez</strong> un rendez-vous récurrent.",
      panier: "<strong>Elle explore</strong> un nouveau soin, un complément. <span class=\"sep\">·</span> <strong>Vous augmentez</strong> le ticket par visite.",
      propagation: "<strong>Elle partage</strong> son institut avec son cercle. <span class=\"sep\">·</span> <strong>Vous gagnez</strong> des clientes qualifiées sans publicité.",
      missions: "<strong>Elle organise</strong> un moment entre amies. <span class=\"sep\">·</span> <strong>Vous remplissez</strong> les créneaux calmes.",
    },
    cascadeSub:
      "Au 3e rendez-vous validé, chaque cliente peut inviter une proche, avec un soin offert au duo. L'invitée entre à son tour dans le parcours.",
  },
  boutique: {
    label: "Boutique",
    baseLevers: { retour: 2430, panier: 580, propagation: 108, missions: 894 },
    baseSigma: 37,
    waves: { v1: 50, v2: 45, v3: 34, v4: 20 },
    roles: {
      retour: "Le Client devient Initié",
      panier: "L'Initié construit sa collection",
      propagation: "Le Collectionneur influence son cercle",
      missions: "Le Curateur rassemble pour un drop",
    },
    winwin: {
      retour: "<strong>Il gagne</strong> une boutique qui connaît son goût. <span class=\"sep\">·</span> <strong>Vous gagnez</strong> une relation de saison.",
      panier: "<strong>Il construit</strong> sa garde-robe, pas juste un achat. <span class=\"sep\">·</span> <strong>Vous augmentez</strong> le panier par visite.",
      propagation: "<strong>Il amène</strong> ses amis pour les essayages. <span class=\"sep\">·</span> <strong>Vous gagnez</strong> des clients par affinité.",
      missions: "<strong>Il participe</strong> aux drops et previews privés. <span class=\"sep\">·</span> <strong>Vous activez</strong> votre meilleur cercle.",
    },
    cascadeSub:
      "Au 3e passage validé, chaque client peut inviter un proche, avec un accès preview à la prochaine pièce. L'invité entre à son tour dans le parcours.",
  },
}

export function getBusinessOption(key: ParcoursBusinessKey | null) {
  return BUSINESS_OPTIONS.find((option) => option.key === key) ?? null
}

export function getSeasonPreset(businessKey?: ParcoursBusinessKey | null) {
  return SEASON_PRESETS[businessKey ?? "cafe"]
}

export function getLeakOption(key: ParcoursLeakKey | null) {
  return LEAK_OPTIONS.find((option) => option.key === key) ?? null
}

function resolveBusinessKey(key: ParcoursBusinessKey | null | undefined) {
  return key ?? "cafe"
}

export function getRewardOptions(businessKey?: ParcoursBusinessKey | null): RewardOption[] {
  const resolvedBusiness = resolveBusinessKey(businessKey)
  return REWARD_BASE_OPTIONS.map((option) => ({
    ...option,
    ...REWARD_COPY[option.key][resolvedBusiness],
  }))
}

export function getRewardOption(key: ParcoursRewardKey, businessKey?: ParcoursBusinessKey | null) {
  return getRewardOptions(businessKey).find((option) => option.key === key) ?? getRewardOptions(businessKey)[0]
}

export function getWhoOption(key: ParcoursWhoKey) {
  return WHO_OPTIONS.find((option) => option.key === key) ?? WHO_OPTIONS[0]
}

export function getSpreadOption(key: ParcoursSpreadKey) {
  return SPREAD_OPTIONS.find((option) => option.key === key) ?? SPREAD_OPTIONS[0]
}

export function getDiamondOptions(businessKey?: ParcoursBusinessKey | null): DiamondOption[] {
  const resolvedBusiness = resolveBusinessKey(businessKey)
  return DIAMOND_BASE_OPTIONS.map((option) => ({
    ...option,
    ...DIAMOND_COPY[option.key][resolvedBusiness],
  }))
}

export function getDiamondOption(key: ParcoursDiamondKey, businessKey?: ParcoursBusinessKey | null) {
  return getDiamondOptions(businessKey).find((option) => option.key === key) ?? getDiamondOptions(businessKey)[0]
}

export function getVolumeOption(key: ParcoursVolumeKey | null) {
  return VOLUME_OPTIONS.find((option) => option.key === key) ?? null
}

export function getBasketOption(key: ParcoursBasketKey | null) {
  return BASKET_OPTIONS.find((option) => option.key === key) ?? null
}

export function getRhythmOption(key: ParcoursRhythmKey | null) {
  return RHYTHM_OPTIONS.find((option) => option.key === key) ?? null
}

export function buildLectureProjection(state: ParcoursQueryState) {
  const business = getBusinessOption(state.business)
  const leak = getLeakOption(state.leak)
  const volume = getVolumeOption(state.volume)
  const rhythm = getRhythmOption(state.rhythm)

  if (!business || !leak || !volume || !state.basket || !rhythm) {
    return { min: 0, max: 0 }
  }

  const basket = business.basketByLevel[state.basket]
  const projection = calculateRecovery({
    clientsPerDay: volume.value,
    avgTicket: basket,
    daysOpen: 26,
    recoveryRate: Math.min(0.42, business.recoveryRate * leak.multiplier * rhythm.multiplier),
    returnLossRate: business.lossRate,
  })

  const roundProjection = (value: number) => {
    const step = value >= 4000 ? 100 : value >= 1800 ? 50 : 20
    return Math.round(value / step) * step
  }

  return {
    min: roundProjection(projection.extraRevenue * 0.86),
    max: roundProjection(projection.extraRevenue * 1.1),
  }
}

export function buildRecapItems(state: ParcoursQueryState) {
  const items: Array<{ key: string; label: string; warm?: boolean }> = []
  const business = getBusinessOption(state.business)
  const leak = getLeakOption(state.leak)
  const volume = getVolumeOption(state.volume)
  const basket = getBasketOption(state.basket)
  const rhythm = getRhythmOption(state.rhythm)

  if (business) items.push({ key: "business", label: business.label })
  if (leak) items.push({ key: "leak", label: leak.recapLabel })
  if (volume) items.push({ key: "volume", label: `Volume ${volume.label.toLowerCase()}` })
  if (basket) items.push({ key: "basket", label: `Panier ${basket.label.toLowerCase()}` })
  if (rhythm) items.push({ key: "rhythm", label: `Retour ${rhythm.label.toLowerCase()}` })
  return items
}

export function buildOfferRecapItems(state: ParcoursFlowState) {
  const items = buildRecapItems(state)
  items.push({ key: "reward", label: `Moment · ${getRewardOption(state.reward, state.business).label}` })
  items.push({ key: "threshold", label: `Déclencheur · ${state.threshold} passages` })
  items.push({ key: "spread", label: `Cadre · ${getSpreadOption(state.spread).label.toLowerCase()}` })
  items.push({ key: "diamond", label: `◊ Diamond · ${getDiamondOption(state.diamond, state.business).label}`, warm: true })
  return items
}

export function buildConfigurationPhrase(state: ParcoursConfigurationState & Partial<ParcoursQueryState>) {
  const reward = getRewardOption(state.reward, state.business)
  const who = getWhoOption(state.who)
  const spread = getSpreadOption(state.spread)
  const diamond = getDiamondOption(state.diamond, state.business)
  const thresholdPart = `après ${state.threshold} passages`

  return [
    reward.phrase,
    spread.phrase,
    thresholdPart,
    `pour ${who.phrase}`,
    `Diamond en jeu : ${diamond.phrase}`,
  ]
}

export function computeConfigurationTension(state: ParcoursConfigurationState) {
  let score = 50

  if (state.threshold <= 2) score -= 25
  else if (state.threshold >= 8) score -= 15
  else if (state.threshold >= 6) score -= 5

  if (state.decay <= 3) score += 25
  else if (state.decay >= 10) score -= 15

  if (state.who === "top") score -= 10
  else if (state.who === "all") score -= 5

  score = Math.max(10, Math.min(90, score))

  if (score < 35) {
    return { score, label: "Lâche", tone: "loose" as const }
  }

  if (score < 65) {
    return { score, label: "Équilibrée", tone: "balanced" as const }
  }

  return { score, label: "Tendue", tone: "tight" as const }
}

export function computeImpactBreakdown(state: ParcoursFlowState, businessKey?: ParcoursBusinessKey) {
  const key = businessKey ?? state.business ?? "cafe"
  const profile = IMPACT_PROFILES[key]
  const leak = getLeakOption(state.leak)
  const reward = getRewardOption(state.reward, key)
  const who = getWhoOption(state.who)
  const spread = getSpreadOption(state.spread)
  const diamond = getDiamondOption(state.diamond, key)
  const decayIndex = Math.max(0, PARCOURS_DECAY_VALUES.indexOf(state.decay as (typeof PARCOURS_DECAY_VALUES)[number]))

  const thresholdMultiplier =
    state.threshold <= 2 ? 0.92 : state.threshold <= 4 ? 1.06 : state.threshold <= 6 ? 1 : state.threshold <= 8 ? 0.94 : 0.88
  const decayMultiplier = [1.16, 1.1, 1, 0.92, 0.84][decayIndex] ?? 1
  const leakMultiplier = leak?.multiplier ?? 1

  const retour = Math.round(profile.baseLevers.retour * thresholdMultiplier * decayMultiplier * leakMultiplier)
  const panier = Math.round(profile.baseLevers.panier * reward.multiplier * diamond.multiplier)
  const propagation = Math.round(profile.baseLevers.propagation * spread.multiplier * leakMultiplier)
  const missions = Math.round(profile.baseLevers.missions * spread.multiplier * diamond.multiplier * who.multiplier)
  const total = retour + panier + propagation + missions
  const sigma = Math.max(3, Math.round(profile.baseSigma * ((reward.multiplier + spread.multiplier + diamond.multiplier + decayMultiplier) / 4)))
  const maxWave = Math.max(profile.waves.v1, profile.waves.v2, profile.waves.v3, profile.waves.v4)
  const waveMultiplier = spread.multiplier * (leak?.multiplier ?? 1) * 0.82

  return {
    profile,
    levers: {
      retour,
      panier,
      propagation,
      missions,
    },
    total,
    sigma,
    percentages: {
      retour: Math.round((retour / total) * 100),
      panier: Math.round((panier / total) * 100),
      propagation: Math.round((propagation / total) * 100),
      missions: Math.round((missions / total) * 100),
    },
    waves: {
      v1: Math.round(profile.waves.v1 * waveMultiplier),
      v2: Math.round(profile.waves.v2 * waveMultiplier),
      v3: Math.round(profile.waves.v3 * waveMultiplier),
      v4: Math.round(profile.waves.v4 * waveMultiplier),
      max: Math.round(maxWave * waveMultiplier),
    },
  }
}

export function buildOfferProjectionRange(total: number) {
  const min = total * 0.88
  const max = total * 1.08

  const round = (value: number) => {
    const step = value >= 4000 ? 100 : value >= 1500 ? 50 : 20
    return Math.round(value / step) * step
  }

  return {
    min: round(min),
    max: round(max),
  }
}

export function formatEuroCompact(value: number) {
  return `€${Math.round(value).toLocaleString("fr-FR")}`
}

export function serializeLectureQuery(state: ParcoursQueryState) {
  const params = new URLSearchParams()
  if (state.business) params.set("business", state.business)
  if (state.leak) params.set("leak", state.leak)
  if (state.volume) params.set("volume", state.volume)
  if (state.basket) params.set("basket", state.basket)
  if (state.rhythm) params.set("rhythm", state.rhythm)
  return params.toString()
}

export function parseLectureQuery(searchParams: Pick<URLSearchParams, "get">): Partial<ParcoursQueryState> {
  const business = searchParams.get("business")
  const leak = searchParams.get("leak")
  const volume = searchParams.get("volume")
  const basket = searchParams.get("basket")
  const rhythm = searchParams.get("rhythm")
  const parsed: Partial<ParcoursQueryState> = {}

  if (BUSINESS_OPTIONS.some((option) => option.key === business)) {
    parsed.business = business as ParcoursBusinessKey
  }
  if (LEAK_OPTIONS.some((option) => option.key === leak)) {
    parsed.leak = leak as ParcoursLeakKey
  }
  if (VOLUME_OPTIONS.some((option) => option.key === volume)) {
    parsed.volume = volume as ParcoursVolumeKey
  }
  if (BASKET_OPTIONS.some((option) => option.key === basket)) {
    parsed.basket = basket as ParcoursBasketKey
  }
  if (RHYTHM_OPTIONS.some((option) => option.key === rhythm)) {
    parsed.rhythm = rhythm as ParcoursRhythmKey
  }

  return parsed
}

export function isLectureComplete(state: ParcoursQueryState) {
  return !!(state.business && state.leak && state.volume && state.basket && state.rhythm)
}

export function isConfigurationComplete(state: ParcoursFlowState) {
  return isLectureComplete(state) && !!(state.reward && state.threshold && state.who && state.spread && state.diamond && state.decay)
}

export function buildCheckoutMetadata(state: ParcoursFlowState) {
  return {
    parcours_business: state.business ?? "unknown",
    parcours_leak: state.leak ?? "unknown",
    parcours_volume: state.volume ?? "unknown",
    parcours_basket: state.basket ?? "unknown",
    parcours_rhythm: state.rhythm ?? "unknown",
    parcours_reward: state.reward,
    parcours_threshold: String(state.threshold),
    parcours_who: state.who,
    parcours_spread: state.spread,
    parcours_diamond: state.diamond,
    parcours_decay: String(state.decay),
    parcours_price: String(LANDING_PRICING.activationFee),
  }
}
