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

export type BusinessOption = {
  key: ParcoursBusinessKey
  label: string
  brand: string
  basketByLevel: { bas: number; moyen: number; eleve: number }
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
export const PARCOURS_STEP_LABELS = ["Lecture", "Configuration", "Impact", "Offre", "Paiement"] as const

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

export const BUSINESS_OPTIONS: BusinessOption[] = [
  {
    key: "cafe",
    label: "Café",
    brand: "Le comptoir",
    basketByLevel: { bas: 4, moyen: 7, eleve: 11 },
  },
  {
    key: "bar",
    label: "Bar",
    brand: "La maison",
    basketByLevel: { bas: 8, moyen: 14, eleve: 22 },
  },
  {
    key: "restaurant",
    label: "Restaurant",
    brand: "La table",
    basketByLevel: { bas: 14, moyen: 22, eleve: 38 },
  },
  {
    key: "beaute",
    label: "Beauté",
    brand: "L'institut",
    basketByLevel: { bas: 28, moyen: 48, eleve: 85 },
  },
  {
    key: "boutique",
    label: "Boutique",
    brand: "L'atelier",
    basketByLevel: { bas: 35, moyen: 68, eleve: 140 },
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

export const REWARD_OPTIONS: Array<{ key: ParcoursRewardKey; label: string; phrase: string; multiplier: number }> = [
  { key: "cafe", label: "Café offert", phrase: "1 café offert", multiplier: 1 },
  { key: "credit", label: "5 € de crédit", phrase: "5 € de crédit", multiplier: 1.06 },
  { key: "menu", label: "Menu offert", phrase: "1 menu offert", multiplier: 1.12 },
  { key: "invitation", label: "Invitation", phrase: "une invitation partageable", multiplier: 1.09 },
]

export const WHO_OPTIONS: Array<{ key: ParcoursWhoKey; label: string; phrase: string; multiplier: number }> = [
  { key: "all", label: "Tous", phrase: "tous les clients", multiplier: 0.98 },
  { key: "regular", label: "Réguliers", phrase: "les clients réguliers", multiplier: 1.02 },
  { key: "top", label: "Choisis", phrase: "les clients choisis", multiplier: 0.92 },
]

export const SPREAD_OPTIONS: Array<{ key: ParcoursSpreadKey; label: string; phrase: string; multiplier: number }> = [
  { key: "solo", label: "Individuel", phrase: "en solo", multiplier: 1 },
  { key: "duo", label: "Duo", phrase: "à partager à deux", multiplier: 1.16 },
  { key: "group", label: "Groupe", phrase: "à partager à plusieurs", multiplier: 1.28 },
]

export const DIAMOND_OPTIONS: Array<{ key: ParcoursDiamondKey; label: string; phrase: string; multiplier: number }> = [
  { key: "dinner", label: "1 dîner / mois · 1 an", phrase: "1 dîner/mois pendant 1 an", multiplier: 1 },
  { key: "credit", label: "200 € · 12 mois", phrase: "200 € de crédit sur 12 mois", multiplier: 1.08 },
  { key: "unlimited", label: "Accès illimité · 1 mois", phrase: "accès illimité pendant 1 mois", multiplier: 1.14 },
]

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

export function getLeakOption(key: ParcoursLeakKey | null) {
  return LEAK_OPTIONS.find((option) => option.key === key) ?? null
}

export function getRewardOption(key: ParcoursRewardKey) {
  return REWARD_OPTIONS.find((option) => option.key === key) ?? REWARD_OPTIONS[0]
}

export function getWhoOption(key: ParcoursWhoKey) {
  return WHO_OPTIONS.find((option) => option.key === key) ?? WHO_OPTIONS[0]
}

export function getSpreadOption(key: ParcoursSpreadKey) {
  return SPREAD_OPTIONS.find((option) => option.key === key) ?? SPREAD_OPTIONS[0]
}

export function getDiamondOption(key: ParcoursDiamondKey) {
  return DIAMOND_OPTIONS.find((option) => option.key === key) ?? DIAMOND_OPTIONS[0]
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
  const returnRate = 0.38 * leak.multiplier
  const dailyReturns = volume.value * returnRate * rhythm.multiplier
  const dailyRevenue = dailyReturns * basket

  return {
    min: Math.round((dailyRevenue * 30 * 0.85) / 50) * 50,
    max: Math.round((dailyRevenue * 30 * 1.15) / 50) * 50,
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
  items.push({ key: "reward", label: `Récompense · ${getRewardOption(state.reward).label}` })
  items.push({ key: "threshold", label: `Seuil · ${state.threshold} passages` })
  items.push({ key: "spread", label: `Propagation · ${getSpreadOption(state.spread).label.toLowerCase()}` })
  items.push({ key: "diamond", label: `◊ Diamond · ${getDiamondOption(state.diamond).label}`, warm: true })
  return items
}

export function buildConfigurationPhrase(state: ParcoursConfigurationState) {
  const reward = getRewardOption(state.reward)
  const who = getWhoOption(state.who)
  const spread = getSpreadOption(state.spread)
  const diamond = getDiamondOption(state.diamond)
  const thresholdPart = `dès le ${state.threshold}${state.threshold === 1 ? "er" : "e"} passage`

  return [
    reward.phrase,
    spread.phrase,
    thresholdPart,
    `pour ${who.phrase}`,
    `Diamond : ${diamond.phrase}`,
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
  const reward = getRewardOption(state.reward)
  const who = getWhoOption(state.who)
  const spread = getSpreadOption(state.spread)
  const diamond = getDiamondOption(state.diamond)
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
