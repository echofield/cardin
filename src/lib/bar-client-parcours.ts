/**
 * Bar vertical — explicit mapping between client-parcours screens and engine semantics.
 * Diamond = couche privilège (reconnaissance, accès, social), pas avant tout une remise.
 * ÉLU = couche rare après Diamond (sélection / créneaux limités), distincte du statut Diamond.
 */

import { cardinSeasonLaw } from "@/lib/season-law"

export type BarClientScreenId = "entree" | "progression" | "activation" | "prochaine-etape" | "domino" | "sommet"

export type BarClientScreen = {
  id: BarClientScreenId
  title: string
  subtitle: string
}

export const WORLD_BAR_TARGET_VISITS = 8

export type BarEnginePhase =
  | "path_started"
  | "first_passage"
  | "light_activation"
  | "pull_stronger"
  | "propagation"
  | "diamond_choice"

export type BarClientStepDef = {
  screenIndex: number
  screenId: BarClientScreenId
  phase: BarEnginePhase
  visitsBand: string
  engineMeaning: string
  engineMapping: string
  title: string
  subtitle: string
}

export const BAR_CLIENT_STEPS: BarClientStepDef[] = [
  {
    screenIndex: 0,
    screenId: "entree",
    phase: "path_started",
    visitsBand: "0 passage",
    engineMeaning:
      "Carte créée, premier passage enregistré, fenêtre de retour ouverte sans friction.",
    engineMapping: "Entrée funnel · carte / scan actif · segment = bar",
    title: "Première soirée",
    subtitle: "Votre première visite est enregistrée. Le parcours démarre.",
  },
  {
    screenIndex: 1,
    screenId: "progression",
    phase: "first_passage",
    visitsBand: "1 passage",
    engineMeaning:
      "Premier retour validé: le moteur peut proposer une nouvelle soirée utile, souvent sur un créneau plus faible.",
    engineMapping: `passage_count >= 1 · eligible prompt retour · domino à partir de l'étape ${cardinSeasonLaw.dominoStartStep} (saison 8 pas)`,
    title: "Retour de soirée",
    subtitle: "Le bar commence à vous reconnaître et à vous faire revenir au bon moment.",
  },
  {
    screenIndex: 2,
    screenId: "activation",
    phase: "light_activation",
    visitsBand: "2 passages",
    engineMeaning:
      "Activation légère, coût plafonné: création ciblée, mardi, début de service ou duo court.",
    engineMapping: "off_peak_incentive · budget activation borné · hook temporel (jour faible)",
    title: "Premier déclencheur",
    subtitle: "Un premier avantage peut apparaître, sans promo ouverte.",
  },
  {
    screenIndex: 3,
    screenId: "prochaine-etape",
    phase: "pull_stronger",
    visitsBand: "3–4 passages",
    engineMeaning:
      "Le retour devient plus prévisible, le privilège de soirée se rapproche, le message peut monter d'un cran.",
    engineMapping: "uplift fréquence · traction progression · avant ouverture propagation",
    title: "Privilège en approche",
    subtitle: "Encore un ou deux passages et le niveau Diamond devient concret.",
  },
  {
    screenIndex: 4,
    screenId: "domino",
    phase: "propagation",
    visitsBand: "5–7 passages",
    engineMeaning:
      "Ouverture sociale: invitation, anniversaire, duo ou petit groupe — le réseau commence à travailler pour le lieu.",
    engineMapping: "propagationScore · referrals · GP_prop (domino) · invitation / groupe",
    title: "Inviter quelqu'un",
    subtitle: "Le bar peut maintenant vous laisser faire entrer une autre personne.",
  },
  {
    screenIndex: 5,
    screenId: "sommet",
    phase: "diamond_choice",
    visitsBand: "8+ passages",
    engineMeaning:
      "Couche Diamond: privilège contrôlé d'accès, de création, de statut ou de moment de groupe. La rareté continue après cela.",
    engineMapping: "summitRate / diamondMode · RC_diamond · multiplicateur sommet (parcours marchand)",
    title: "Récompense / privilège",
    subtitle: "Vous pouvez maintenant viser une vraie récompense ou un vrai privilège de soirée.",
  },
]

export type BarEluLayerConfig = {
  enabled: boolean
  giftSlots: number
  selectionPoolNote: string
  headline: string
  body: string
  examples: string[]
}

export const BAR_ELU_LAYER: BarEluLayerConfig = {
  enabled: true,
  giftSlots: 3,
  selectionPoolNote:
    "Les détenteurs Diamond restent en jeu ; les non-sélectionnés gardent Diamond et l'éligibilité future.",
  headline: "Couche ÉLU — activations rares",
  body:
    "Après Diamond, le lieu peut réserver quelques activations très rares à un petit groupe de clients: invitations élargies, mardi activé, moment bouteille ou privilège plus fort. La rareté continue après la récompense visible.",
  examples: [
    "Droits d'invitation supplémentaires",
    "Fenêtre mardi prioritaire",
    "Moment bouteille ou groupe sous plafond coût",
  ],
}

export function getBarClientScreens(): BarClientScreen[] {
  return BAR_CLIENT_STEPS.map((s) => ({
    id: s.screenId,
    title: s.title,
    subtitle: s.subtitle,
  }))
}

export function getBarStepByScreenId(screenId: BarClientScreenId): BarClientStepDef | undefined {
  return BAR_CLIENT_STEPS.find((s) => s.screenId === screenId)
}

export function getBarEngineCaptionForScreenId(screenId: BarClientScreenId): { meaning: string; mapping: string } | null {
  const def = getBarStepByScreenId(screenId)
  if (!def) return null
  return { meaning: def.engineMeaning, mapping: def.engineMapping }
}
