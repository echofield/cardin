import type { LandingWorldId } from "@/lib/landing-content"
import type { ParcoursSummitStyleId } from "@/lib/parcours-contract"

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
  { id: "stronger",  label: "Social",   sub: "Incite à venir à plusieurs" },
  { id: "discreet",  label: "Discret",  sub: "Ciblé, contrôlé" },
]

// ─── BLOCK 3 — MOMENT ────────────────────────────────────────────────────────

export const MOMENT_OPTIONS: MomentOption[] = [
  { id: "immediat",  label: "Immédiat",          sub: "Dès le 1er retour" },
  { id: "apres_x",   label: "Après X passages",  sub: "Dès le 3e passage" },
  { id: "creneaux",  label: "Créneaux faibles",   sub: "Aux heures calmes" },
]

// ─── ÉTAPE 4 BLOCKS ───────────────────────────────────────────────────────────

export const ACCESS_OPTIONS: AccessOption[] = [
  { id: "tous",         label: "Tous les clients",       sub: "Aucun filtre" },
  { id: "reguliers",    label: "Clients réguliers",      sub: "Déjà venus au moins 2 fois" },
  { id: "selectionnes", label: "Clients sélectionnés",   sub: "Profils choisis par le système" },
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
  stronger: "amplifié socialement",
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
  selectionnes: "réservé aux profils sélectionnés",
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
