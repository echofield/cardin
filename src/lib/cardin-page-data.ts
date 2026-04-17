import {
  LANDING_PRICING,
  LANDING_WORLD_ORDER,
  LANDING_WORLDS,
  STRIPE_PAYMENT_LINK,
  type LandingWorldId,
} from "@/lib/landing-content"
import { CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"

export type CardinPageState = "projection" | "activation"
export type CardinWeakMomentId =
  | "mardi-apres-midi"
  | "mercredi"
  | "entre-deux-services"
  | "hors-week-end"
  | "debut-de-soiree"
export type CardinReturnRhythmId = "3-7-jours" | "1-2-semaines" | "mensuel"
export type CardinClienteleId = "quartier" | "passage" | "mixte"

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
  merchantId?: string
  businessName: string
  worldId: LandingWorldId
  weakMomentId: CardinWeakMomentId
  weakMomentLabel: string
  returnRhythmId: CardinReturnRhythmId
  returnRhythmLabel: string
  clienteleId: CardinClienteleId
  clienteleLabel: string
  subtitle: string
  temporalAnchor: string
  readingLead: string
  engineLead: string
  seasonLead: string
  seasonSetup: string
  seasonRewardLabel: string
  projectionLabel: string
  projectionLead: string
  projectionLow: number
  projectionHigh: number
  returnProfile: string
  projectionFraming: string
  observations: CardinObservation[]
  scenarios: CardinScenario[]
  paymentLink: string
  contactEmail: string
  humanContact: string
  note: string
  paidAt: string | null
}

export const CARDIN_WORLD_OPTIONS = LANDING_WORLD_ORDER.map((worldId) => ({
  id: worldId,
  label: LANDING_WORLDS[worldId].label,
}))

export const CARDIN_WEAK_MOMENT_OPTIONS: Array<{ id: CardinWeakMomentId; label: string }> = [
  { id: "mardi-apres-midi", label: "mardi après-midi" },
  { id: "mercredi", label: "mercredi" },
  { id: "entre-deux-services", label: "entre deux services" },
  { id: "hors-week-end", label: "hors week-end" },
  { id: "debut-de-soiree", label: "début de soirée" },
]

export const CARDIN_RETURN_RHYTHM_OPTIONS: Array<{ id: CardinReturnRhythmId; label: string }> = [
  { id: "3-7-jours", label: "3 à 7 jours" },
  { id: "1-2-semaines", label: "1 à 2 semaines" },
  { id: "mensuel", label: "mensuel" },
]

export const CARDIN_CLIENTELE_OPTIONS: Array<{ id: CardinClienteleId; label: string }> = [
  { id: "quartier", label: "quartier" },
  { id: "passage", label: "passage" },
  { id: "mixte", label: "mixte" },
]

type CardinGenerationInput = {
  merchantId?: string
  businessName?: string
  world?: string
  weakMoment?: string
  returnRhythm?: string
  clientele?: string
  note?: string
  contactEmail?: string
}

export type CardinMerchantInput = {
  slug: string
  merchantId?: string
  businessName: string
  worldId: LandingWorldId
  weakMomentId: CardinWeakMomentId
  returnRhythmId: CardinReturnRhythmId
  clienteleId: CardinClienteleId
  note?: string
  contactEmail?: string
}

type WeakMomentOption = {
  label: string
  observation: string
  scenarioTitle: string
}

type ReturnRhythmOption = {
  label: string
  observation: string
  returnProfile: string
  projection: string
  intensification: string
  multiplier: number
}

type ClienteleOption = {
  label: string
  observation: string
  propagationTitle: string
  propagation: string
  returnProfile: string
  multiplier: number
}

type WorldReadingConfig = {
  subtitleTail: string
  engineLine: string
  weakScenario: (weakLabel: string, rhythmLabel: string) => string
  keyMoment: string
  seasonLead: string
  seasonSetup: string
  humanContact: string
  projectionTail: string
  weakMomentMultiplier: Partial<Record<CardinWeakMomentId, number>>
}

type MerchantPreset = {
  businessName: string
  worldId: LandingWorldId
  weakMomentId: CardinWeakMomentId
  returnRhythmId: CardinReturnRhythmId
  clienteleId: CardinClienteleId
  observationNote?: string
  paidAt?: string | null
}

const DEFAULT_SELECTIONS: Record<
  LandingWorldId,
  {
    weakMomentId: CardinWeakMomentId
    returnRhythmId: CardinReturnRhythmId
    clienteleId: CardinClienteleId
  }
> = {
  cafe: { weakMomentId: "mardi-apres-midi", returnRhythmId: "3-7-jours", clienteleId: "quartier" },
  bar: { weakMomentId: "debut-de-soiree", returnRhythmId: "1-2-semaines", clienteleId: "mixte" },
  restaurant: { weakMomentId: "entre-deux-services", returnRhythmId: "1-2-semaines", clienteleId: "mixte" },
  beaute: { weakMomentId: "hors-week-end", returnRhythmId: "mensuel", clienteleId: "quartier" },
  boutique: { weakMomentId: "hors-week-end", returnRhythmId: "mensuel", clienteleId: "passage" },
}

const WEAK_MOMENT_MAP: Record<CardinWeakMomentId, WeakMomentOption> = {
  "mardi-apres-midi": {
    label: "mardi après-midi",
    observation: "Cardin lit un creux qui ouvre une reprise nette en milieu de semaine.",
    scenarioTitle: "Mardi après-midi",
  },
  mercredi: {
    label: "mercredi",
    observation: "Cardin lit un milieu de semaine qui demande un motif clair et visible.",
    scenarioTitle: "Mercredi",
  },
  "entre-deux-services": {
    label: "entre deux services",
    observation: "Cardin lit une fenêtre souple entre deux temps forts du lieu.",
    scenarioTitle: "Entre deux services",
  },
  "hors-week-end": {
    label: "hors week-end",
    observation: "Cardin lit une saison qui se gagne dans les jours plus calmes du lieu.",
    scenarioTitle: "Hors week-end",
  },
  "debut-de-soiree": {
    label: "début de soirée",
    observation: "Cardin lit un premier créneau qui décide du reste de la soirée.",
    scenarioTitle: "Début de soirée",
  },
}

const RETURN_RHYTHM_MAP: Record<CardinReturnRhythmId, ReturnRhythmOption> = {
  "3-7-jours": {
    label: "3 à 7 jours",
    observation: "Cardin agit vite et garde le lieu présent dans la même semaine.",
    returnProfile: "retours courts",
    projection: "La saison remet du passage vite et installe une habitude régulière.",
    intensification: "Chaque passage relance le suivant dans la semaine et épaissit la présence du lieu.",
    multiplier: 1.05,
  },
  "1-2-semaines": {
    label: "1 à 2 semaines",
    observation: "Cardin garde le lieu vivant sur quinze jours et choisit le bon rappel.",
    returnProfile: "retours relancés",
    projection: "La saison remet du rythme sur quinze jours et rend le retour plus lisible.",
    intensification: "Chaque passage relance le cycle suivant et rend la saison plus dense.",
    multiplier: 1,
  },
  mensuel: {
    label: "mensuel",
    observation: "Cardin réactive un cycle plus large avec un signe plus marqué.",
    returnProfile: "retours espacés",
    projection: "La saison travaille des retours plus espacés avec une valeur plus visible.",
    intensification: "Chaque passage épaissit le statut et donne plus de poids au prochain retour.",
    multiplier: 0.93,
  },
}

const CLIENTELE_MAP: Record<CardinClienteleId, ClienteleOption> = {
  quartier: {
    label: "quartier",
    observation: "Cardin s'appuie sur le voisinage, l'habitude et la présence régulière.",
    propagationTitle: "Quartier actif",
    propagation: "Cardin fait revenir un habitué avec quelqu'un de son cercle. Le lieu gagne en présence utile.",
    returnProfile: "quartier et régularité",
    multiplier: 1.03,
  },
  passage: {
    label: "passage",
    observation: "Cardin transforme le premier passage en repère puis en retour choisi.",
    propagationTitle: "Passage retenu",
    propagation: "Cardin prolonge un premier passage en deuxième moment, puis en vrai lien avec le lieu.",
    returnProfile: "passage à convertir",
    multiplier: 0.97,
  },
  mixte: {
    label: "mixte",
    observation: "Cardin tient le voisinage et le passage dans le même mouvement de saison.",
    propagationTitle: "Rythme mixte",
    propagation: "Cardin relie les habitués et les nouveaux passages pour garder le lieu vivant toute la semaine.",
    returnProfile: "quartier et passage",
    multiplier: 1,
  },
}

const WORLD_READING: Record<LandingWorldId, WorldReadingConfig> = {
  cafe: {
    subtitleTail: "le retour autour du comptoir",
    engineLine: "Cardin ouvre le retour, le duo, puis un accès rare autour du comptoir.",
    weakScenario: (weakLabel, rhythmLabel) =>
      `Cardin remet du passage sur ${weakLabel}. Le comptoir retrouve du mouvement sur un rythme ${rhythmLabel}.`,
    keyMoment:
      "Cardin choisit un anniversaire, une reprise après pause ou un moment de voisinage pour remettre le lieu au centre.",
    seasonLead:
      "Cardin ouvre une saison légère à distribuer, simple à lire au comptoir, claire pour l'équipe dès les premiers scans.",
    seasonSetup: "QR comptoir, carte digitale, lecture de passage, récompense visible",
    humanContact: "Un échange direct pour cadrer le comptoir, le geste staff et la récompense de saison.",
    projectionTail: "Le café gagne un retour plus serré et une présence plus régulière.",
    weakMomentMultiplier: {
      "mardi-apres-midi": 1.03,
      mercredi: 1.01,
      "hors-week-end": 0.99,
    },
  },
  bar: {
    subtitleTail: "la soirée dès le bon créneau",
    engineLine: "Cardin ouvre la soirée, relance le duo, puis fait monter la rareté.",
    weakScenario: (weakLabel, rhythmLabel) =>
      `Cardin recharge ${weakLabel}. Le lieu retrouve du monde au bon moment, sur un rythme ${rhythmLabel}.`,
    keyMoment:
      "Cardin choisit une date forte, un anniversaire ou une reprise de soirée pour remettre le lieu en tension.",
    seasonLead:
      "Cardin ouvre une saison lisible au comptoir, facile à relancer avant la soirée et simple à faire vivre côté staff.",
    seasonSetup: "QR comptoir, carte digitale, lecture de soirée, récompense visible",
    humanContact: "Un échange direct pour caler le créneau fort, le geste du bar et la récompense visible.",
    projectionTail: "Le bar densifie ses bons soirs et fait monter un réseau plus vivant.",
    weakMomentMultiplier: {
      "debut-de-soiree": 1.04,
      mercredi: 1.01,
    },
  },
  restaurant: {
    subtitleTail: "la table au bon service",
    engineLine: "Cardin ouvre le retour de table, active le duo, puis installe un accès plus rare.",
    weakScenario: (weakLabel, rhythmLabel) =>
      `Cardin densifie ${weakLabel}. Le lieu retrouve une table plus vite, sur un rythme ${rhythmLabel}.`,
    keyMoment:
      "Cardin choisit un anniversaire, un retour après pause ou une date repère pour remettre la table en mouvement.",
    seasonLead:
      "Cardin ouvre une saison qui tient la table, le service et le retour invité avec un cadre simple pour l'équipe.",
    seasonSetup: "QR d'accueil, carte digitale, lecture de table, récompense visible",
    humanContact: "Un échange direct pour caler le service, le geste staff et la récompense de saison.",
    projectionTail: "Le restaurant remet du rythme entre deux services et fait monter la valeur de table.",
    weakMomentMultiplier: {
      "entre-deux-services": 1.04,
      "hors-week-end": 1.01,
    },
  },
  beaute: {
    subtitleTail: "le prochain rendez-vous dans le bon cycle",
    engineLine: "Cardin ouvre le prochain retour, relance la recommandation, puis fait monter le privilège.",
    weakScenario: (weakLabel, rhythmLabel) =>
      `Cardin replace ${weakLabel} dans le cycle. Le prochain rendez-vous revient avec un rythme ${rhythmLabel}.`,
    keyMoment:
      "Cardin choisit un anniversaire, une reprise après silence ou un moment personnel pour remettre le soin au centre.",
    seasonLead:
      "Cardin ouvre une saison qui tient le rythme, protège la valeur du lieu et rend le prochain rendez-vous visible.",
    seasonSetup: "QR d'accueil, carte digitale, lecture de cycle, récompense visible",
    humanContact: "Un échange direct pour caler le rythme, le geste d'accueil et la récompense de saison.",
    projectionTail: "Le lieu gagne une clientèle plus stable et un retour plus net sur le cycle.",
    weakMomentMultiplier: {
      "hors-week-end": 1.02,
      mercredi: 1.01,
    },
  },
  boutique: {
    subtitleTail: "le désir au bon moment",
    engineLine: "Cardin ouvre le retour, garde le désir présent, puis fait monter l'accès rare.",
    weakScenario: (weakLabel, rhythmLabel) =>
      `Cardin rallume ${weakLabel}. Le lieu retrouve du désir sur un rythme ${rhythmLabel}.`,
    keyMoment:
      "Cardin choisit une nouvelle sélection, une date forte ou un retour après silence pour remettre le lieu en tension.",
    seasonLead:
      "Cardin ouvre une saison qui garde le désir vivant, rend l'accès visible et donne une lecture claire à l'équipe.",
    seasonSetup: "QR d'accueil, carte digitale, lecture de saison, accès visible",
    humanContact: "Un échange direct pour cadrer le lieu, l'accueil et l'accès de saison.",
    projectionTail: "La boutique remet du désir sur le lieu et transforme l'intérêt en retour choisi.",
    weakMomentMultiplier: {
      "hors-week-end": 1.02,
      mercredi: 1.01,
    },
  },
}

const MERCHANT_PRESETS: Record<string, MerchantPreset> = {
  "cafe-des-angles": {
    businessName: "Café des Angles",
    worldId: "cafe",
    weakMomentId: "mardi-apres-midi",
    returnRhythmId: "3-7-jours",
    clienteleId: "quartier",
    observationNote: "Le samedi tient déjà seul. Le mardi et le mercredi portent la vraie reprise.",
  },
  "maison-sorella": {
    businessName: "Maison Sorella",
    worldId: "boutique",
    weakMomentId: "hors-week-end",
    returnRhythmId: "mensuel",
    clienteleId: "passage",
    observationNote: "Le désir existe déjà. Cardin lui donne une fenêtre de retour plus nette.",
  },
  "atelier-souffle": {
    businessName: "Atelier Souffle",
    worldId: "beaute",
    weakMomentId: "hors-week-end",
    returnRhythmId: "mensuel",
    clienteleId: "quartier",
    observationNote: "La prochaine venue compte plus que la première. La lecture doit garder le cycle visible.",
  },
}

export function isLandingWorldId(value: string | undefined): value is LandingWorldId {
  return value === "cafe" || value === "bar" || value === "restaurant" || value === "beaute" || value === "boutique"
}

export function isCardinWeakMomentId(value: string | undefined): value is CardinWeakMomentId {
  return value === "mardi-apres-midi" || value === "mercredi" || value === "entre-deux-services" || value === "hors-week-end" || value === "debut-de-soiree"
}

export function isCardinReturnRhythmId(value: string | undefined): value is CardinReturnRhythmId {
  return value === "3-7-jours" || value === "1-2-semaines" || value === "mensuel"
}

export function isCardinClienteleId(value: string | undefined): value is CardinClienteleId {
  return value === "quartier" || value === "passage" || value === "mixte"
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

export function generateMerchantSlug(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || "votre-lieu"
}

export function getDefaultCreateSelection(worldId: LandingWorldId) {
  return DEFAULT_SELECTIONS[worldId]
}

export function buildCardinMerchantHref({
  businessName,
  worldId,
  weakMomentId,
  returnRhythmId,
  clienteleId,
  note,
  state,
}: {
  businessName: string
  worldId: LandingWorldId
  weakMomentId: CardinWeakMomentId
  returnRhythmId: CardinReturnRhythmId
  clienteleId: CardinClienteleId
  note?: string
  state?: CardinPageState
}) {
  const slug = generateMerchantSlug(businessName)
  const params = new URLSearchParams({
    name: businessName.trim(),
    world: worldId,
    weak: weakMomentId,
    rhythm: returnRhythmId,
    clientele: clienteleId,
  })

  if (note?.trim()) {
    params.set("note", note.trim())
  }

  if (state) {
    params.set("state", state)
  }

  return `/cardin/${slug}?${params.toString()}`
}

export function buildCardinMerchantPath(slug: string) {
  return `/cardin/${slug}`
}

export function buildCardinMerchantInput({
  businessName,
  merchantId,
  worldId,
  weakMomentId,
  returnRhythmId,
  clienteleId,
  note,
  contactEmail,
}: {
  businessName: string
  merchantId?: string
  worldId: LandingWorldId
  weakMomentId: CardinWeakMomentId
  returnRhythmId: CardinReturnRhythmId
  clienteleId: CardinClienteleId
  note?: string
  contactEmail?: string
}): CardinMerchantInput {
  return {
    slug: generateMerchantSlug(businessName),
    merchantId: merchantId?.trim() || undefined,
    businessName: businessName.trim(),
    worldId,
    weakMomentId,
    returnRhythmId,
    clienteleId,
    note: note?.trim() || "",
    contactEmail: contactEmail?.trim() || CARDIN_CONTACT_EMAIL,
  }
}

export function resolveCardinPageState(paidAt: string | null, requestedState?: string): CardinPageState {
  if (paidAt) return "activation"
  return requestedState === "activation" ? "activation" : "projection"
}

export function resolveCardinMerchantPage(slug: string, options: CardinGenerationInput = {}): CardinMerchantPage {
  const preset = MERCHANT_PRESETS[slug]
  const worldId = isLandingWorldId(options.world) ? options.world : preset?.worldId ?? inferWorldIdFromSlug(slug)
  const world = LANDING_WORLDS[worldId]
  const defaults = DEFAULT_SELECTIONS[worldId]

  const weakMomentId = isCardinWeakMomentId(options.weakMoment) ? options.weakMoment : preset?.weakMomentId ?? defaults.weakMomentId
  const returnRhythmId = isCardinReturnRhythmId(options.returnRhythm)
    ? options.returnRhythm
    : preset?.returnRhythmId ?? defaults.returnRhythmId
  const clienteleId = isCardinClienteleId(options.clientele) ? options.clientele : preset?.clienteleId ?? defaults.clienteleId
  const businessName = options.businessName?.trim() || preset?.businessName || humanizeCardinSlug(slug)
  const observationNote = normalizeSentence(options.note || preset?.observationNote || "")

  const weakMoment = WEAK_MOMENT_MAP[weakMomentId]
  const returnRhythm = RETURN_RHYTHM_MAP[returnRhythmId]
  const clientele = CLIENTELE_MAP[clienteleId]
  const worldReading = WORLD_READING[worldId]
  const projectionBand = buildProjectionBand(world.seasonRevenueBandEuro, returnRhythm.multiplier, clientele.multiplier, worldReading.weakMomentMultiplier[weakMomentId] ?? 1)

  const subtitle = `Cardin lit ${weakMoment.label}, tient un rythme ${returnRhythm.label} et remet ${worldReading.subtitleTail}.`
  const temporalAnchor = `${weakMoment.label} · retour ${returnRhythm.label}`
  const readingLead = `${weakMoment.observation} ${returnRhythm.observation} ${clientele.observation}`
  const engineLead = `${worldReading.engineLine} Cardin garde ${weakMoment.label} dans le bon tempo.`
  const seasonLead = `${worldReading.seasonLead} La première saison tient ${weakMoment.label} avec un retour ${returnRhythm.label}.`
  const projectionLead = `${returnRhythm.projection} ${worldReading.projectionTail}`
  const observations: CardinObservation[] = [
    {
      label: "Moment faible",
      text: `${weakMoment.observation} ${capitalize(weakMoment.label)} devient un point de retour lisible.`,
    },
    {
      label: "Rythme de retour",
      text: `${returnRhythm.observation} Cardin cadence ce lieu sur ${returnRhythm.label}.`,
    },
    {
      label: "Lecture du lieu",
      text: `${clientele.observation} ${capitalize(clientele.label)} devient une force active de la saison.`,
    },
  ]

  if (observationNote) {
    observations.push({
      label: "Observation du lieu",
      text: observationNote,
    })
  }

  return {
    slug,
    merchantId: options.merchantId?.trim() || undefined,
    businessName,
    worldId,
    weakMomentId,
    weakMomentLabel: weakMoment.label,
    returnRhythmId,
    returnRhythmLabel: returnRhythm.label,
    clienteleId,
    clienteleLabel: clientele.label,
    subtitle,
    temporalAnchor,
    readingLead,
    engineLead,
    seasonLead,
    seasonSetup: worldReading.seasonSetup,
    seasonRewardLabel: world.summitPromise,
    projectionLabel: `Projection de saison sur ${weakMoment.label}`,
    projectionLead,
    projectionLow: projectionBand.min,
    projectionHigh: projectionBand.max,
    returnProfile: `${clientele.returnProfile} · ${returnRhythm.returnProfile}`,
    projectionFraming: `${clientele.propagation} ${projectionLead}`,
    observations,
    scenarios: [
      {
        title: weakMoment.scenarioTitle,
        text: worldReading.weakScenario(weakMoment.label, returnRhythm.label),
      },
      {
        title: clientele.propagationTitle,
        text: clientele.propagation,
      },
      {
        title: "Moment clé",
        text: worldReading.keyMoment,
      },
      {
        title: "Montée de saison",
        text: returnRhythm.intensification,
      },
    ],
    paymentLink: STRIPE_PAYMENT_LINK,
    contactEmail: options.contactEmail?.trim() || CARDIN_CONTACT_EMAIL,
    humanContact: worldReading.humanContact,
    note: observationNote,
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

function buildProjectionBand(
  baseBand: { min: number; max: number },
  rhythmMultiplier: number,
  clienteleMultiplier: number,
  weakMomentMultiplier: number,
) {
  const multiplier = rhythmMultiplier * clienteleMultiplier * weakMomentMultiplier

  return {
    min: roundToHundreds(baseBand.min * multiplier),
    max: roundToHundreds(baseBand.max * (multiplier + 0.02)),
  }
}

function roundToHundreds(value: number) {
  return Math.max(0, Math.round(value / 100) * 100)
}

function normalizeSentence(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ")
  if (!normalized) return ""
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
