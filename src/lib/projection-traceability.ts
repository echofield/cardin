/**
 * Liens explicites entre l’UI parcours et le moteur `computeCardinFinancialProjection` /
 * snapshot protocol (`GP_direct`, `GP_uplift`, `GP_prop`).
 */

import type { ParcoursProjectionResult } from "@/lib/cardin-projection-types"
import type { LandingWorldId } from "@/lib/landing-content"

export type LayerTrace = {
  key: "recovery" | "frequency" | "domino"
  uiLabel: string
  protocolGrossField: "GP_direct" | "GP_uplift" | "GP_prop"
  formulaFr: string
}

export const DEFAULT_LAYER_TRACES: LayerTrace[] = [
  {
    key: "recovery",
    uiLabel: "Récupération",
    protocolGrossField: "GP_direct",
    formulaFr:
      "Visites récupérées sur la base inactive × panier × taux de récupération (échelle moteur + profil commerce).",
  },
  {
    key: "frequency",
    uiLabel: "Fréquence",
    protocolGrossField: "GP_uplift",
    formulaFr: "Porteurs actifs × uplift de visites / panier (delta saison, sommet, inactivité).",
  },
  {
    key: "domino",
    uiLabel: "Domino",
    protocolGrossField: "GP_prop",
    formulaFr: "Nouveaux clients issus de propagation × conversion × panier (GP_prop hors mode lite).",
  },
]

export type ProjectionTraceBundle = {
  layers: LayerTrace[]
  summitMultiplierNote: string
  monthlyEquivalentNote: (seasonMonths: number) => string
  barFeatureNote?: string
}

export function getProjectionTraceBundle(worldId: LandingWorldId): ProjectionTraceBundle {
  const barFeatureNote =
    worldId === "bar"
      ? "Bar : créneaux faibles (ex. mardi), anniversaire groupe, invitations et couche ÉLU influencent surtout la fréquence, la propagation (Domino) et les coûts récompense — pas une ligne séparée « ÉLU » dans ce snapshot (pool rare budgété côté lieu)."
      : undefined

  return {
    layers: DEFAULT_LAYER_TRACES,
    summitMultiplierNote:
      "Multiplicateur sommet choisi dans le parcours marchand : infléchit deltaVisitsPerMonth et donc GP_uplift (et le total net).",
    monthlyEquivalentNote: (seasonMonths: number) =>
      `Équivalent mensuel indicatif = fourchette marché ÷ ${seasonMonths} ; détail net modèle = netCardinSeason ÷ ${seasonMonths}.`,
    barFeatureNote,
  }
}

/** Champs utiles pour « Voir le calcul » sans dupliquer les montants */
export function buildProjectionCalcLines(
  projection: ParcoursProjectionResult,
  summitMultiplier: number,
  seasonMonths: number,
): string[] {
  const { layers, netCardinSeason, monthlyAverage, monthlyReturns, recoveredClientsMonth } = projection
  return [
    `GP_direct (récupération) ≈ ${layers.recovery} € brut saison`,
    `GP_uplift (fréquence) ≈ ${layers.frequency} € brut saison`,
    `GP_prop (domino) ≈ ${layers.domino} € brut saison`,
    `Sommet ×${summitMultiplier.toLocaleString("fr-FR")} appliqué au chemin uplift (delta visites)`,
    `Net saison modèle ≈ ${netCardinSeason.toLocaleString("fr-FR")} € · ~${monthlyAverage.toLocaleString("fr-FR")} €/mois`,
    `Retours projetés ≈ ${monthlyReturns}/mois · clients récupérés ≈ ${recoveredClientsMonth}/mois (ordre de grandeur moteur)`,
  ]
}
