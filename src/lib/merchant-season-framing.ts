import type { LandingWorldId } from "@/lib/landing-content"
import type { MerchantProjectionType } from "@/lib/projection-scenarios"

/**
 * Cardin Protocol v5 — cadrage saison marchand.
 * - heroBand : bande visible principale (ambitieuse)
 * - calibratedSubline : objectif prudemment calibré (sous la bande)
 */

export type SeasonEconomicFrame = {
  heroBand: string
  calibratedSubline: string
  floorLabel: string
  upsideLabel: string
  /** Phrase complète pour parcours / récap */
  headlineBand: string
}

export const SEASON_FRAME_BY_PROJECTION_TYPE: Record<MerchantProjectionType, SeasonEconomicFrame> = {
  cafe: {
    heroBand: "+2 000 € à +6 000 €",
    calibratedSubline: "Objectif calibré · +3 000 € à +5 000 €",
    floorLabel: "Activation minimale · dès ~2 000 €",
    upsideLabel: "Réseau activé · borne haute de la bande saison (+6 000 €)",
    headlineBand: "+2 000 € à +6 000 € de revenu supplémentaire par saison",
  },
  bar: {
    heroBand: "+3 000 € à +8 000 €",
    calibratedSubline: "Objectif calibré · +4 000 € à +6 500 €",
    floorLabel: "Activation minimale · dès ~3 000 €",
    upsideLabel: "Upside réseau · jusqu'à +8 000 €",
    headlineBand: "+3 000 € à +8 000 € de revenu supplémentaire par saison",
  },
  restaurant: {
    heroBand: "+4 000 € à +10 000 €",
    calibratedSubline: "Objectif calibré · +5 500 € à +8 500 €",
    floorLabel: "Activation minimale · dès ~4 000 €",
    upsideLabel: "Réseau tables · jusqu'à +10 000 €",
    headlineBand: "+4 000 € à +10 000 € de revenu supplémentaire par saison",
  },
  coiffeur: {
    heroBand: "+3 000 € à +7 500 €",
    calibratedSubline: "Objectif calibré · +3 500 € à +6 000 €",
    floorLabel: "Activation minimale · dès ~2 500 €",
    upsideLabel: "Cycle & recommandation · jusqu'à +7 500 €",
    headlineBand: "+3 000 € à +7 500 € de revenu supplémentaire par saison",
  },
  beaute: {
    heroBand: "+4 000 € à +10 000 €",
    calibratedSubline: "Objectif calibré · +5 000 € à +8 500 €",
    floorLabel: "Activation minimale · dès ~4 000 €",
    upsideLabel: "Récurrence & réseau · jusqu'à +10 000 €",
    headlineBand: "+4 000 € à +10 000 € de revenu supplémentaire par saison",
  },
  boutique: {
    heroBand: "+5 000 € à +12 000 €",
    calibratedSubline: "Objectif calibré · +7 000 € à +10 500 €",
    floorLabel: "Activation minimale · dès ~5 000 €",
    upsideLabel: "Désir & réseau · jusqu'à +12 000 €",
    headlineBand: "+5 000 € à +12 000 € de revenu supplémentaire par saison",
  },
}

export const SEASON_FRAME_BY_LANDING: Record<LandingWorldId, SeasonEconomicFrame> = {
  cafe: SEASON_FRAME_BY_PROJECTION_TYPE.cafe,
  bar: SEASON_FRAME_BY_PROJECTION_TYPE.bar,
  restaurant: SEASON_FRAME_BY_PROJECTION_TYPE.restaurant,
  beaute: SEASON_FRAME_BY_PROJECTION_TYPE.beaute,
  boutique: SEASON_FRAME_BY_PROJECTION_TYPE.boutique,
}

/** Aligne les écrans basés sur `MerchantTemplate.id` (engine, calculateur landing). */
const TEMPLATE_ID_TO_FRAME: Record<string, keyof typeof SEASON_FRAME_BY_PROJECTION_TYPE> = {
  cafe: "cafe",
  bar: "bar",
  restaurant: "restaurant",
  boulangerie: "cafe",
  coiffeur: "coiffeur",
  "institut-beaute": "beaute",
  boutique: "boutique",
}

export function getSeasonFrameForTemplateId(templateId: string): SeasonEconomicFrame | null {
  const key = TEMPLATE_ID_TO_FRAME[templateId]
  if (!key) return null
  return SEASON_FRAME_BY_PROJECTION_TYPE[key]
}
