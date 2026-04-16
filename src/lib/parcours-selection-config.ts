import type { LandingWorldId } from "@/lib/landing-content"
import type { ParcoursSummitStyleId } from "@/lib/parcours-contract"

// ─── SEASON REWARD (grand attractor — top of pyramid) ────────────────────────

export type SeasonRewardId = string // "{worldId}_{index}" e.g. "cafe_0"

export type SeasonRewardOption = {
  id: SeasonRewardId
  label: string      // bold first line — the prize itself
  sub: string        // lighter second line — context/rarity
}

// Diamond eligibility rates from cardin-protocol-v3.ts presets
// cafe: 0.06, boulangerie: 0.06, salon(→beaute): 0.07, boutique: 0.12, restaurant: 0.08, generic: 0.06
export const DIAMOND_RATE: Record<LandingWorldId, number> = {
  cafe:       0.06,
  bar:        0.06, // maps to generic preset
  restaurant: 0.08,
  beaute:     0.07, // maps to salon preset
  boutique:   0.12,
}

export const SEASON_REWARDS: Record<LandingWorldId, SeasonRewardOption[]> = {
  cafe: [
    { id: "cafe_0", label: "1 café / jour pendant 1 an",          sub: "Un rituel quotidien offert — la récompense qui fidélise pour de vrai" },
    { id: "cafe_1", label: "1 mois de cafés offerts",              sub: "Un mois de pause à volonté — concret, immédiat, mémorable" },
    { id: "cafe_2", label: "Invitation privée + accès illimité",   sub: "Une semaine VIP — réservé aux meilleurs parcours" },
  ],
  bar: [
    { id: "bar_0", label: "1 bouteille / semaine — 3 mois",        sub: "Un privilège de régulier — visible, désirable, partageable" },
    { id: "bar_1", label: "Table réservée + conso offerte",        sub: "Chaque mois pendant une saison — l'expérience au centre" },
    { id: "bar_2", label: "Soirée privée",                         sub: "Un soir pour eux seuls — invitation exclusive, sur liste" },
  ],
  restaurant: [
    { id: "restaurant_0", label: "1 dîner pour 2 / mois — 6 mois", sub: "Le retour qui a de la valeur — offrir une table, pas une réduction" },
    { id: "restaurant_1", label: "Menu dégustation offert × 4",    sub: "Quatre fois dans l'année — un rituel gastronomique personnel" },
    { id: "restaurant_2", label: "Table du chef + accord vins",    sub: "Une seule fois — mais inoubliable. La récompense qui se raconte" },
  ],
  beaute: [
    { id: "beaute_0", label: "Soins illimités — 1 mois",           sub: "Un mois de rituel complet — le privilège de ne pas compter" },
    { id: "beaute_1", label: "Rituel signature × 6 sur l'année",  sub: "Six séances réparties — un rendez-vous que l'on attend" },
    { id: "beaute_2", label: "Accès VIP — résultats garantis",     sub: "Programme personnalisé, suivi prioritaire, accès exclusif" },
  ],
  boutique: [
    { id: "boutique_0", label: "Crédit shopping 300€ en 1 an",     sub: "À utiliser sur la collection de leur choix — liberté totale" },
    { id: "boutique_1", label: "Accès collection privée + 30%",    sub: "Permanent pour la saison — le statut qui se voit et se ressent" },
    { id: "boutique_2", label: "Styling privé + avant-première",   sub: "Avant tout le monde — une expérience, pas une promo" },
  ],
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type RewardTypeId = "direct" | "progression" | "invitation" | "evenement"
export type MomentId = "immediat" | "apres_x" | "creneaux"
export type AccessTypeId = "tous" | "reguliers" | "selectionnes"
export type TriggerTypeId = "passage" | "heure" | "invitation" | "evenement"
export type PropagationTypeId = "individuel" | "duo" | "groupe"

export type RewardTypeOption = {
  id: RewardTypeId
  label: string
  example: string
}

export type IntensiteOption = {
  id: ParcoursSummitStyleId
  label: string
  sub: string
}

export type MomentOption = {
  id: MomentId
  label: string
  sub: string
}

export type AccessOption = {
  id: AccessTypeId
  label: string
  sub: string
}

export type TriggerOption = {
  id: TriggerTypeId
  label: string
  sub: string
}

export type PropagationOption = {
  id: PropagationTypeId
  label: string
  sub: string
}

// ─── BLOCK 1 — TYPE DE RÉCOMPENSE (per vertical) ─────────────────────────────

const REWARD_TYPES_ALL: Record<LandingWorldId, RewardTypeOption[]> = {
  cafe: [
    { id: "direct",      label: "Direct",      example: "1 café offert" },
    { id: "progression", label: "Progression",  example: "5 passages → boisson" },
    { id: "invitation",  label: "Invitation",   example: "Venir à 2" },
    { id: "evenement",   label: "Événement",    example: "Dégustation privée" },
  ],
  bar: [
    { id: "direct",      label: "Direct",      example: "1 verre offert" },
    { id: "progression", label: "Progression",  example: "3 soirs → bouteille" },
    { id: "invitation",  label: "Invitation",   example: "Amener quelqu'un" },
    { id: "evenement",   label: "Événement",    example: "Soirée privée" },
  ],
  restaurant: [
    { id: "direct",      label: "Direct",      example: "1 dessert offert" },
    { id: "progression", label: "Progression",  example: "5 repas → menu dég." },
    { id: "invitation",  label: "Invitation",   example: "Table pour 2" },
    { id: "evenement",   label: "Événement",    example: "Brunch exclusif" },
  ],
  beaute: [
    { id: "direct",      label: "Direct",      example: "1 soin offert" },
    { id: "progression", label: "Progression",  example: "5 RDV → soin premium" },
    { id: "invitation",  label: "Invitation",   example: "Duo beauté" },
    { id: "evenement",   label: "Événement",    example: "Soirée beauté" },
  ],
  boutique: [
    { id: "direct",      label: "Direct",      example: "Accès early sale" },
    { id: "progression", label: "Progression",  example: "3 achats → cadeau" },
    { id: "invitation",  label: "Invitation",   example: "Amener quelqu'un" },
    { id: "evenement",   label: "Événement",    example: "Vente privée" },
  ],
}

// Recommended types per vertical — these appear first in the grid with a subtle indicator
const RECOMMENDED_TYPES: Record<LandingWorldId, RewardTypeId[]> = {
  cafe:       ["direct", "progression"],
  bar:        ["invitation", "evenement"],
  restaurant: ["progression", "evenement"],
  beaute:     ["progression", "direct"],
  boutique:   ["direct", "evenement"],
}

/**
 * Returns reward type options sorted so recommended ones appear first.
 * Recommended set is determined per vertical.
 */
export function getRewardTypesForWorld(worldId: LandingWorldId): Array<RewardTypeOption & { recommended: boolean }> {
  const all = REWARD_TYPES_ALL[worldId]
  const recs = new Set(RECOMMENDED_TYPES[worldId])
  const recommended = all.filter((o) => recs.has(o.id)).map((o) => ({ ...o, recommended: true }))
  const rest = all.filter((o) => !recs.has(o.id)).map((o) => ({ ...o, recommended: false }))
  return [...recommended, ...rest]
}

// ─── BLOCK 2 — INTENSITÉ ──────────────────────────────────────────────────────

export const INTENSITE_OPTIONS: IntensiteOption[] = [
  { id: "visible",   label: "Visible",  sub: "Tout le monde voit" },
  { id: "stronger",  label: "Partagé",  sub: "Incite à venir à plusieurs" },
  { id: "discreet",  label: "Discret",  sub: "Ciblé, contrôlé" },
]

// ─── BLOCK 3 — MOMENT ────────────────────────────────────────────────────────

export const MOMENT_OPTIONS: MomentOption[] = [
  { id: "immediat",  label: "Immédiat",          sub: "Dès le 1er passage" },
  { id: "apres_x",   label: "Après X passages",  sub: "Après 3 passages" },
  { id: "creneaux",  label: "Créneaux faibles",  sub: "Uniquement aux heures creuses" },
]

// ─── ÉTAPE 4 BLOCKS ───────────────────────────────────────────────────────────

export const ACCESS_OPTIONS: AccessOption[] = [
  { id: "tous",         label: "Tous les clients",   sub: "Aucun filtre" },
  { id: "reguliers",    label: "Clients réguliers",  sub: "Déjà venus au moins 2 fois" },
  { id: "selectionnes", label: "Clients choisis",    sub: "Vos meilleurs parcours (top ~10%)" },
]

export const TRIGGER_OPTIONS: TriggerOption[] = [
  { id: "passage",    label: "Passage validé",    sub: "À chaque scan" },
  { id: "heure",      label: "Heure spécifique",  sub: "Créneaux définis" },
  { id: "invitation", label: "Invitation client", sub: "Le client amène quelqu'un" },
  { id: "evenement",  label: "Événement",         sub: "Soirée ou activation" },
]

export const PROPAGATION_OPTIONS: PropagationOption[] = [
  { id: "individuel", label: "Individuel",  sub: "Pour le client seul" },
  { id: "duo",        label: "Duo",         sub: "Le client amène 1 personne" },
  { id: "groupe",     label: "Groupe",      sub: "Plusieurs personnes ensemble" },
]

// ─── SUMMARY BUILDERS ────────────────────────────────────────────────────────
// Lines must always read as concrete operational instructions, never abstract.

const REWARD_SHORT: Record<LandingWorldId, Record<RewardTypeId, string>> = {
  cafe:       { direct: "1 café offert",      progression: "5 passages → boisson gratuite", invitation: "venir à 2",       evenement: "dégustation privée" },
  bar:        { direct: "1 verre offert",     progression: "3 soirs → bouteille offerte",   invitation: "amener quelqu'un", evenement: "soirée privée" },
  restaurant: { direct: "1 dessert offert",   progression: "5 repas → menu dégustation",   invitation: "table pour 2",    evenement: "brunch exclusif" },
  beaute:     { direct: "1 soin offert",      progression: "5 RDV → soin premium",         invitation: "duo beauté",      evenement: "soirée beauté" },
  boutique:   { direct: "accès early sale",   progression: "3 achats → cadeau offert",     invitation: "amener quelqu'un", evenement: "vente privée" },
}

const INTENSITE_SHORT: Record<ParcoursSummitStyleId, string> = {
  visible:  "visible par tous",
  stronger: "à partager à plusieurs",
  discreet: "discret et ciblé",
}

const MOMENT_SHORT: Record<MomentId, string> = {
  immediat: "dès le 1er retour",
  apres_x:  "dès le 3e passage",
  creneaux: "aux heures creuses",
}

const ACCESS_NARRATIVE: Record<AccessTypeId, string> = {
  tous:         "ouvert à tous les clients",
  reguliers:    "réservé aux réguliers",
  selectionnes: "réservé à vos meilleurs clients",
}

const TRIGGER_NARRATIVE: Record<TriggerTypeId, string> = {
  passage:    "déclenché au scan",
  heure:      "activé sur créneaux horaires",
  invitation: "via invitation client",
  evenement:  "lors d'un événement",
}

const PROPAGATION_NARRATIVE: Record<PropagationTypeId, string> = {
  individuel: "pour le client seul",
  duo:        "en duo",
  groupe:     "en groupe",
}

export function buildSummaryLine(
  worldId: LandingWorldId,
  rewardType: RewardTypeId | null,
  summitId: ParcoursSummitStyleId | null,
  moment: MomentId | null,
): string {
  const r = rewardType ? REWARD_SHORT[worldId][rewardType] : "—"
  const i = summitId ? INTENSITE_SHORT[summitId] : "—"
  const m = moment ? MOMENT_SHORT[moment] : "—"
  return `${r} · ${i} · ${m}`
}

export function buildEngineLine(
  accessType: AccessTypeId | null,
  triggerType: TriggerTypeId | null,
  propagationType: PropagationTypeId | null,
): string {
  const a = accessType ? ACCESS_NARRATIVE[accessType] : "—"
  const t = triggerType ? TRIGGER_NARRATIVE[triggerType] : "—"
  const p = propagationType ? PROPAGATION_NARRATIVE[propagationType] : "—"
  return `${a} · ${t} · ${p}`
}

// ─── BEHAVIORAL PREDICTION GENERATOR ─────────────────────────────────────────
// Produces a full sentence describing the next-step behavior for the Activation
// summary bar. Maps cover all valid ID values (verified against type definitions).

const MOMENT_PRED: Record<MomentId, string> = {
  immediat: "Dès le prochain passage,",
  apres_x:  "Au prochain retour utile,",
  creneaux: "Lors d'un créneau calme,",
}

const ACCESS_PRED: Record<AccessTypeId, string> = {
  tous:         "tous les clients",
  reguliers:    "les clients réguliers",
  selectionnes: "vos meilleurs clients",
}

const TRIGGER_PRED: Record<TriggerTypeId, string> = {
  passage:    "peuvent activer l'avantage",
  heure:      "peuvent déclencher l'avantage sur un moment précis",
  invitation: "peuvent déclencher un accès en venant accompagnés",
  evenement:  "peuvent déclencher un moment spécial",
}

const PROPAGATION_PRED: Record<PropagationTypeId, string> = {
  individuel: "",
  duo:        " — possibilité de venir à deux",
  groupe:     " — possibilité de venir à plusieurs",
}

const CONDITION_PRED: Record<MomentId, string> = {
  immediat: " — activation immédiate",
  apres_x:  " — retour nécessaire pour débloquer",
  creneaux: " — uniquement à certains moments",
}

export function generateNextStep(
  moment: MomentId | null,
  accessType: AccessTypeId | null,
  triggerType: TriggerTypeId | null,
  propagationType: PropagationTypeId | null,
): string {
  // Fall back to terse format if not all dimensions are set
  if (!moment || !accessType || !triggerType || !propagationType) {
    return buildEngineLine(accessType, triggerType, propagationType)
  }
  return `${MOMENT_PRED[moment]} ${ACCESS_PRED[accessType]} ${TRIGGER_PRED[triggerType]}${PROPAGATION_PRED[propagationType]}${CONDITION_PRED[moment]}.`
}

// ─── ENGINE METRICS (for EnginePreview visual) ───────────────────────────────

export type PulseColor = "green" | "gold" | "red" | "none"
export type EngineMetrics = {
  sigma: number               // 0–4 clamped display value
  progressionFilled: number[] // node indices (0–4) that should glow
  showTree: boolean
  treeDepth: 1 | 2
  branchAmplified: boolean    // invitation/evenement reward → louder branches
  leafOpacityMod: number      // 1.2 (stronger) | 1.0 (default) | 0.65 (discreet) — opacity only, no radius change
  diamondGlow: boolean        // propagation active
  pulseColor: PulseColor
  pulseWidth: number          // 0–1 fraction for bar fill
  hasAnySelection: boolean    // for track opacity: 0.08 → 0.15
}

// Bases derived from cardin_protocol_v2.md — normalized to 0–4 display scale
const SIGMA_BASE: Record<LandingWorldId, number> = {
  cafe:       3.2,
  bar:        2.8,
  restaurant: 3.0,
  beaute:     3.5,
  boutique:   2.5,
}

const INTENSITE_MOD: Record<ParcoursSummitStyleId, number> = {
  visible:  1.0,
  stronger: 0.92,
  discreet: 1.1,
}

const ACCESS_MOD: Record<AccessTypeId, number> = {
  tous:         0.9,
  reguliers:    1.1,
  selectionnes: 1.15,
}

const MOMENT_MOD: Record<MomentId, number> = {
  immediat: 1.0,
  apres_x:  1.05,
  creneaux: 1.1,
}

const PROP_MOD: Record<PropagationTypeId, number> = {
  individuel: 1.0,
  duo:        0.95,
  groupe:     0.88,
}

const PROGRESSION_NODES: Record<MomentId, number[]> = {
  immediat: [0, 1],
  apres_x:  [2, 3],
  creneaux: [3, 4],
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function computeEngineMetrics(
  worldId: LandingWorldId,
  summitId: ParcoursSummitStyleId | null,
  moment: MomentId | null,
  rewardType: RewardTypeId | null,
  accessType: AccessTypeId | null,
  propagationType: PropagationTypeId | null,
): EngineMetrics {
  const base = SIGMA_BASE[worldId]
  const i = summitId ? INTENSITE_MOD[summitId] : 1.0
  const a = accessType ? ACCESS_MOD[accessType] : 1.0
  const m = moment ? MOMENT_MOD[moment] : 1.0
  const p = propagationType ? PROP_MOD[propagationType] : 1.0

  const sigma = clamp(base * i * a * m * p, 0, 4)

  const progressionFilled = moment ? PROGRESSION_NODES[moment] : []

  const showTree = propagationType !== null && propagationType !== "individuel"
  const treeDepth: 1 | 2 = propagationType === "groupe" ? 2 : 1

  const branchAmplified = rewardType === "invitation" || rewardType === "evenement"

  // Opacity-only modifier for propagation tree leaf nodes (plan: no scale/radius changes)
  const leafOpacityMod = summitId === "stronger" ? 1.2 : summitId === "discreet" ? 0.65 : 1.0

  const diamondGlow = showTree

  const hasAnySelection = !!(summitId || accessType || moment || propagationType)

  let pulseColor: PulseColor = "none"
  if (hasAnySelection) {
    pulseColor = sigma >= 3 ? "green" : sigma >= 2 ? "gold" : "red"
  }

  const pulseWidth = clamp(sigma / 4, 0, 1)

  return { sigma, progressionFilled, showTree, treeDepth, branchAmplified, leafOpacityMod, diamondGlow, pulseColor, pulseWidth, hasAnySelection }
}
