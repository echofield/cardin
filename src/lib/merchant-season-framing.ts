import type { LandingWorldId } from "@/lib/landing-content"
import type { MerchantProjectionType } from "@/lib/projection-scenarios"

/**
 * Cardin Protocol v5 - cadrage saison marchand.
 * - heroBand : bande visible principale (ambitieuse)
 * - calibratedSubline : objectif prudemment calibre (sous la bande)
 */

export type SeasonEconomicFrame = {
  heroBand: string
  calibratedSubline: string
  floorLabel: string
  upsideLabel: string
  /** Phrase complete pour parcours / recap */
  headlineBand: string
}

export const SEASON_FRAME_BY_PROJECTION_TYPE: Record<MerchantProjectionType, SeasonEconomicFrame> = {
  cafe: {
    heroBand: "+2 000 EUR a +6 000 EUR",
    calibratedSubline: "Objectif calibre - +3 000 EUR a +5 000 EUR",
    floorLabel: "Activation minimale - des ~2 000 EUR",
    upsideLabel: "Reseau active - borne haute de la bande saison (+6 000 EUR)",
    headlineBand: "+2 000 EUR a +6 000 EUR de revenu supplementaire par saison",
  },
  bar: {
    heroBand: "+3 000 EUR a +8 000 EUR",
    calibratedSubline: "Objectif calibre - +4 000 EUR a +6 500 EUR",
    floorLabel: "Activation minimale - des ~3 000 EUR",
    upsideLabel: "Upside reseau - jusqu'a +8 000 EUR",
    headlineBand: "+3 000 EUR a +8 000 EUR de revenu supplementaire par saison",
  },
  boulangerie: {
    heroBand: "+3 000 EUR a +8 000 EUR",
    calibratedSubline: "Objectif calibre - +4 000 EUR a +6 500 EUR",
    floorLabel: "Activation minimale - des ~3 000 EUR",
    upsideLabel: "Routine de quartier - jusqu'a +8 000 EUR",
    headlineBand: "+3 000 EUR a +8 000 EUR de revenu supplementaire par saison",
  },
  restaurant: {
    heroBand: "+4 000 EUR a +10 000 EUR",
    calibratedSubline: "Objectif calibre - +5 500 EUR a +8 500 EUR",
    floorLabel: "Activation minimale - des ~4 000 EUR",
    upsideLabel: "Reseau tables - jusqu'a +10 000 EUR",
    headlineBand: "+4 000 EUR a +10 000 EUR de revenu supplementaire par saison",
  },
  caviste: {
    heroBand: "+4 000 EUR a +9 000 EUR",
    calibratedSubline: "Objectif calibre - +5 000 EUR a +7 500 EUR",
    floorLabel: "Activation minimale - des ~4 000 EUR",
    upsideLabel: "Selection & degustation - jusqu'a +9 000 EUR",
    headlineBand: "+4 000 EUR a +9 000 EUR de revenu supplementaire par saison",
  },
  coiffeur: {
    heroBand: "+3 000 EUR a +7 500 EUR",
    calibratedSubline: "Objectif calibre - +3 500 EUR a +6 000 EUR",
    floorLabel: "Activation minimale - des ~2 500 EUR",
    upsideLabel: "Cycle & recommandation - jusqu'a +7 500 EUR",
    headlineBand: "+3 000 EUR a +7 500 EUR de revenu supplementaire par saison",
  },
  beaute: {
    heroBand: "+4 000 EUR a +10 000 EUR",
    calibratedSubline: "Objectif calibre - +5 000 EUR a +8 500 EUR",
    floorLabel: "Activation minimale - des ~4 000 EUR",
    upsideLabel: "Recurrence & reseau - jusqu'a +10 000 EUR",
    headlineBand: "+4 000 EUR a +10 000 EUR de revenu supplementaire par saison",
  },
  boutique: {
    heroBand: "+5 000 EUR a +12 000 EUR",
    calibratedSubline: "Objectif calibre - +7 000 EUR a +10 500 EUR",
    floorLabel: "Activation minimale - des ~5 000 EUR",
    upsideLabel: "Desir & reseau - jusqu'a +12 000 EUR",
    headlineBand: "+5 000 EUR a +12 000 EUR de revenu supplementaire par saison",
  },
}

export const SEASON_FRAME_BY_LANDING: Record<LandingWorldId, SeasonEconomicFrame> = {
  cafe: SEASON_FRAME_BY_PROJECTION_TYPE.cafe,
  bar: SEASON_FRAME_BY_PROJECTION_TYPE.bar,
  boulangerie: SEASON_FRAME_BY_PROJECTION_TYPE.boulangerie,
  restaurant: SEASON_FRAME_BY_PROJECTION_TYPE.restaurant,
  caviste: SEASON_FRAME_BY_PROJECTION_TYPE.caviste,
  beaute: SEASON_FRAME_BY_PROJECTION_TYPE.beaute,
  boutique: SEASON_FRAME_BY_PROJECTION_TYPE.boutique,
}

/** Aligne les ecrans bases sur `MerchantTemplate.id` (engine, calculateur landing). */
const TEMPLATE_ID_TO_FRAME: Record<string, keyof typeof SEASON_FRAME_BY_PROJECTION_TYPE> = {
  cafe: "cafe",
  bar: "bar",
  restaurant: "restaurant",
  boulangerie: "boulangerie",
  caviste: "caviste",
  coiffeur: "coiffeur",
  "institut-beaute": "beaute",
  boutique: "boutique",
}

export function getSeasonFrameForTemplateId(templateId: string): SeasonEconomicFrame | null {
  const key = TEMPLATE_ID_TO_FRAME[templateId]
  if (!key) return null
  return SEASON_FRAME_BY_PROJECTION_TYPE[key]
}
