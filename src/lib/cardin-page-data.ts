import { LANDING_PRICING, LANDING_WORLDS, STRIPE_PAYMENT_LINK, type LandingWorldId } from "@/lib/landing-content"
import { CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"

export type CardinPageState = "projection" | "activation"

export type CardinObservation = {
  label: string
  text: string
}

export type CardinScenario = {
  title: string
  text: string
}

export type CardinMerchantPage = {
  slug: string
  businessName: string
  worldId: LandingWorldId
  subtitle: string
  temporalAnchor: string
  seasonRewardLabel: string
  projectionLabel: string
  projectionLow: number
  projectionHigh: number
  returnProfile: string
  projectionFraming: string
  observations: CardinObservation[]
  scenarios: CardinScenario[]
  paymentLink: string
  contactEmail: string
  humanContact: string
  paidAt: string | null
}

type WorldMerchantTemplate = {
  observations: CardinObservation[]
  scenarios: CardinScenario[]
  returnProfile: string
  projectionFraming: string
}

type MerchantPreset = Partial<CardinMerchantPage> & Pick<CardinMerchantPage, "businessName" | "worldId">

const WORLD_TEMPLATES: Record<LandingWorldId, WorldMerchantTemplate> = {
  cafe: {
    observations: [
      { label: "Moment faible", text: "Le flux retombe après le déjeuner. Le retour utile se joue entre 15 h et 18 h." },
      { label: "Rythme naturel", text: "Un habitué revient vite si le signal repart dans la semaine, pas dans un cycle trop long." },
      { label: "Lecture du lieu", text: "Passages courts, décision rapide, effet régulier avant grand panier." },
    ],
    scenarios: [
      { title: "Mardi 15 h-18 h", text: "Cardin relance avant le creux. Le retour se joue aujourd'hui, pas la semaine prochaine." },
      { title: "Retour à deux", text: "Un habitué revient avec quelqu'un. Le second passage ouvre une vraie propagation." },
      { title: "Moment clé", text: "Anniversaire ou pause trop longue : le lieu envoie un signe, sans casser la valeur." },
      { title: "Montée d'intensité", text: "Plus le client revient, plus la saison devient lisible et désirable." },
    ],
    returnProfile: "Retours courts, même semaine",
    projectionFraming: "Une première saison pensée pour remettre du passage sur les heures molles et faire monter les réguliers.",
  },
  bar: {
    observations: [
      { label: "Moment faible", text: "Le démarrage de soirée fait la différence. Trop tard, l'élan se perd." },
      { label: "Rythme naturel", text: "Le retour utile tient au bon soir, pas à une promesse vague dans un mois." },
      { label: "Lecture du lieu", text: "Le comptoir crée du réseau. Un client convaincu peut en faire revenir deux." },
    ],
    scenarios: [
      { title: "Début de soirée", text: "Cardin remet du monde sur le bon créneau avant que la soirée ne se décide ailleurs." },
      { title: "Venir à deux", text: "Le duo devient un vrai geste de propagation, pas une invitation jetée au hasard." },
      { title: "Soir clé", text: "Un anniversaire, un match, une date forte : le système choisit le bon angle." },
      { title: "Montée de statut", text: "Le régulier sent que sa place change avec ses passages." },
    ],
    returnProfile: "Retour de soirée, réseau vivant",
    projectionFraming: "Une saison qui densifie les bons soirs et transforme les habitués en vrai levier de retour.",
  },
  restaurant: {
    observations: [
      { label: "Moment faible", text: "Entre deux services, le lieu a besoin d'un motif net pour faire revenir." },
      { label: "Rythme naturel", text: "Le retour utile se joue sur quelques semaines, avec table et invitation." },
      { label: "Lecture du lieu", text: "Le duo ou la table à plusieurs compte plus qu'une simple remise." },
    ],
    scenarios: [
      { title: "Mardi service lent", text: "Cardin relance le bon segment pour remplir un service faible sans bruit inutile." },
      { title: "Table à deux", text: "Un retour se transforme en table partagée. La saison gagne en densité." },
      { title: "Moment clé", text: "Anniversaire, date fixe, retour après pause : le lieu répond au bon moment." },
      { title: "Montée de valeur", text: "Les passages répétés rendent le statut plus visible et la table plus attendue." },
    ],
    returnProfile: "Retours posés, table et invitation",
    projectionFraming: "Une première saison qui travaille la récurrence entre deux services et fait monter la valeur de table.",
  },
  beaute: {
    observations: [
      { label: "Moment faible", text: "Le vrai risque n'est pas le premier rendez-vous. C'est l'oubli du suivant." },
      { label: "Rythme naturel", text: "Le retour utile suit un cycle précis. Trop tôt ou trop tard, la traction tombe." },
      { label: "Lecture du lieu", text: "Le lieu tient par confiance, rituel et recommandation maîtrisée." },
    ],
    scenarios: [
      { title: "Retour cadré", text: "Cardin remet la cliente dans un cycle clair avant que l'habitude ne se perde." },
      { title: "Venir à deux", text: "Une cliente convaincue amène quelqu'un au bon moment, sans banaliser le lieu." },
      { title: "Moment personnel", text: "Un anniversaire ou un retour après pause ouvre un geste contextuel." },
      { title: "Montée de privilège", text: "Le statut se construit avec le rythme réel, pas avec une carte passive." },
    ],
    returnProfile: "Cycle régulier, confiance et recommandation",
    projectionFraming: "Une saison qui stabilise les retours, protège la valeur du lieu et cristallise la clientèle.",
  },
  boutique: {
    observations: [
      { label: "Moment faible", text: "Le client aime le lieu, mais l'élan retombe vite si rien ne le rappelle." },
      { label: "Rythme naturel", text: "Le retour utile n'est pas quotidien. Il doit être déclenché au bon moment." },
      { label: "Lecture du lieu", text: "Le désir, le statut et l'accès comptent plus qu'un simple avantage prix." },
    ],
    scenarios: [
      { title: "Créneau faible", text: "Cardin fait revenir sur un moment souple, quand le lieu peut vraiment recevoir." },
      { title: "Retour accompagné", text: "Le client revient avec quelqu'un qui veut voir ce qu'il défend déjà." },
      { title: "Moment de désir", text: "Nouvelle sélection, date spéciale, retour après silence : le système choisit l'ouverture." },
      { title: "Montée de rareté", text: "Le statut s'épaissit avec les passages et fait sentir une vraie place." },
    ],
    returnProfile: "Retour choisi, désir et accès",
    projectionFraming: "Une saison qui remet du désir sur le lieu et transforme les bons clients en présence active.",
  },
}

const MERCHANT_PRESETS: Record<string, MerchantPreset> = {
  "cafe-des-angles": {
    businessName: "Café des Angles",
    worldId: "cafe",
    observations: [
      { label: "Moment faible", text: "Le samedi marche seul. Le mardi et le mercredi ont besoin d'un vrai rappel." },
      { label: "Rythme naturel", text: "Le retour le plus utile se joue entre 3 et 7 jours après le premier passage." },
      { label: "Lecture du lieu", text: "Le lieu tient par habitude, voisinage et effet comptoir." },
    ],
  },
  "maison-sorella": {
    businessName: "Maison Sorella",
    worldId: "boutique",
    observations: [
      { label: "Moment faible", text: "Le trafic spontané existe, mais il ne suffit pas à créer le retour." },
      { label: "Rythme naturel", text: "Le client revient mieux quand le lieu le rappelle par désir, pas par prix." },
      { label: "Lecture du lieu", text: "Le statut visible compte autant que la sélection." },
    ],
  },
  "atelier-souffle": {
    businessName: "Atelier Souffle",
    worldId: "beaute",
    observations: [
      { label: "Moment faible", text: "La première visite convainc. La vraie bataille se joue sur le prochain rendez-vous." },
      { label: "Rythme naturel", text: "Le bon retour se situe dans une fenêtre claire, ni trop tôt ni trop tard." },
      { label: "Lecture du lieu", text: "Le lieu tient par confiance, précision et recommandation bien choisie." },
    ],
  },
}

export function isLandingWorldId(value: string | undefined): value is LandingWorldId {
  return value === "cafe" || value === "bar" || value === "restaurant" || value === "beaute" || value === "boutique"
}

export function humanizeCardinSlug(slug: string): string {
  const cleaned = slug.trim().replace(/[-_]+/g, " ")
  if (!cleaned) return "Votre lieu"

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

export function resolveCardinPageState(paidAt: string | null, requestedState?: string): CardinPageState {
  if (paidAt) return "activation"
  return requestedState === "activation" ? "activation" : "projection"
}

export function resolveCardinMerchantPage(
  slug: string,
  options: {
    businessName?: string
    world?: string
    contactEmail?: string
  } = {},
): CardinMerchantPage {
  const preset = MERCHANT_PRESETS[slug]
  const worldId = isLandingWorldId(options.world) ? options.world : preset?.worldId ?? inferWorldIdFromSlug(slug)
  const world = LANDING_WORLDS[worldId]
  const template = WORLD_TEMPLATES[worldId]

  return {
    slug,
    businessName: options.businessName?.trim() || preset?.businessName || humanizeCardinSlug(slug),
    worldId,
    subtitle: preset?.subtitle || "Un moteur de retour client calibré pour ce lieu.",
    temporalAnchor: preset?.temporalAnchor || `Première saison · ${LANDING_PRICING.seasonLengthMonths} mois`,
    seasonRewardLabel: preset?.seasonRewardLabel || world.summitPromise,
    projectionLabel: preset?.projectionLabel || "Cap de première saison",
    projectionLow: preset?.projectionLow ?? world.seasonRevenueBandEuro.min,
    projectionHigh: preset?.projectionHigh ?? world.seasonRevenueBandEuro.max,
    returnProfile: preset?.returnProfile || template.returnProfile,
    projectionFraming: preset?.projectionFraming || template.projectionFraming,
    observations: preset?.observations || template.observations,
    scenarios: preset?.scenarios || template.scenarios,
    paymentLink: preset?.paymentLink || STRIPE_PAYMENT_LINK,
    contactEmail: options.contactEmail?.trim() || preset?.contactEmail || CARDIN_CONTACT_EMAIL,
    humanContact: preset?.humanContact || "Cardin revient vers vous, lieu par lieu, pour caler la mise en place.",
    paidAt: preset?.paidAt || null,
  }
}

function inferWorldIdFromSlug(slug: string): LandingWorldId {
  const normalized = slug.toLowerCase()

  if (/(bar|cocktail|cave|buvette|pub)/.test(normalized)) return "bar"
  if (/(restaurant|resto|table|bistro|bistrot|brasserie|osteria|cantine)/.test(normalized)) return "restaurant"
  if (/(beaute|beauty|salon|skin|hair|soin)/.test(normalized)) return "beaute"
  if (/(boutique|concept|store|atelier|maison|studio)/.test(normalized)) return "boutique"

  return "cafe"
}
