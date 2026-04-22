export type SeasonLength = 3 | 6

export type FinaleMode = "weighted_draw"

export type SeasonLaw = {
  stepCount: number
  dominoStartStep: number
  diamondStep: number
  summitStep: number
  directDominoBranches: number
  secondRingBranches: number
  maxReachPerStrongCard: number
  finaleMode: FinaleMode
  finaleEligibility: [string, string, string]
  finaleWeighting: [string, string, string]
}

export type SummitPreset = {
  id: string
  title: string
  promise: string
  annualCost: number
  monthlyRecoveredBoost: number
}

export const cardinSeasonLaw: SeasonLaw = {
  stepCount: 8,
  dominoStartStep: 5,
  diamondStep: 7,
  summitStep: 8,
  directDominoBranches: 2,
  secondRingBranches: 1,
  maxReachPerStrongCard: 5,
  finaleMode: "weighted_draw",
  finaleEligibility: [
    "Atteindre Diamond",
    "Compléter les conditions du parcours",
    "Rester actif jusqu'à la clôture de saison",
  ],
  finaleWeighting: [
    "Diamond atteint = 1 chance",
    "Chaque Domino validé = +1 chance",
    "Activité maintenue jusqu'à la fin = +1 chance",
  ],
}

const summitPresets: Record<string, SummitPreset[]> = {
  cafe: [
    { id: "signature-monthly", title: "Signature mensuelle", promise: "1 boisson signature par mois pendant 1 an", annualCost: 120, monthlyRecoveredBoost: 1 },
    { id: "duo-morning", title: "Duo du matin", promise: "1 duo signature par mois pour la carte la plus haute", annualCost: 180, monthlyRecoveredBoost: 1.16 },
    { id: "hidden-cellar", title: "Privilège caché", promise: "Un privilège réservé au sommet de la saison", annualCost: 140, monthlyRecoveredBoost: 1.08 },
  ],
  bar: [
    { id: "signature-monthly", title: "Création du mois", promise: "1 cocktail ou création signature au bar par mois pendant 1 an", annualCost: 180, monthlyRecoveredBoost: 1.08 },
    { id: "duo-soir", title: "Duo du soir", promise: "1 duo signature par mois pour la carte la plus haute", annualCost: 220, monthlyRecoveredBoost: 1.14 },
    { id: "hidden-bar", title: "Privilège comptoir", promise: "Un privilège réservé au sommet de la saison", annualCost: 160, monthlyRecoveredBoost: 1.06 },
  ],
  restaurant: [
    { id: "table-monthly", title: "Table mensuelle", promise: "1 repas signature par mois pendant 1 an", annualCost: 600, monthlyRecoveredBoost: 1 },
    { id: "chef-table", title: "Table du chef", promise: "Une table chef réservée une fois par mois", annualCost: 720, monthlyRecoveredBoost: 1.18 },
    { id: "secret-menu", title: "Menu secret", promise: "Un privilège caché réservé à la carte la plus haute", annualCost: 480, monthlyRecoveredBoost: 1.07 },
  ],
  coiffeur: [
    { id: "cut-monthly", title: "Coupe mensuelle", promise: "1 coupe ou soin signature par mois pendant 1 an", annualCost: 300, monthlyRecoveredBoost: 1 },
    { id: "ritual-duo", title: "Rituel duo", promise: "1 privilège duo mensuel pour la carte la plus haute", annualCost: 420, monthlyRecoveredBoost: 1.12 },
    { id: "private-ritual", title: "Rituel privé", promise: "Un privilège réservé au sommet de la saison", annualCost: 260, monthlyRecoveredBoost: 1.06 },
  ],
  "institut-beaute": [
    { id: "cut-monthly", title: "Coupe mensuelle", promise: "1 coupe ou soin signature par mois pendant 1 an", annualCost: 300, monthlyRecoveredBoost: 1 },
    { id: "ritual-duo", title: "Rituel duo", promise: "1 privilège duo mensuel pour la carte la plus haute", annualCost: 420, monthlyRecoveredBoost: 1.12 },
    { id: "private-ritual", title: "Rituel privé", promise: "Un privilège réservé au sommet de la saison", annualCost: 260, monthlyRecoveredBoost: 1.06 },
  ],
  boutique: [
    { id: "collection-credit", title: "Crédit collection", promise: "100 EUR de collection par mois pendant 1 an", annualCost: 1200, monthlyRecoveredBoost: 1 },
    { id: "rare-drop", title: "Rare drop mensuel", promise: "Accès prioritaire mensuel à une pièce réservée", annualCost: 800, monthlyRecoveredBoost: 1.15 },
    { id: "private-piece", title: "Pièce cachée", promise: "Une pièce ou accès caché réservé au sommet", annualCost: 650, monthlyRecoveredBoost: 1.08 },
  ],
  boulangerie: [
    { id: "fournee-monthly", title: "Fournée mensuelle", promise: "1 panier de fournée par mois pendant 1 an", annualCost: 180, monthlyRecoveredBoost: 1.16 },
    { id: "samedi-haut", title: "Samedi haut", promise: "1 privilège du samedi pour la carte la plus haute", annualCost: 220, monthlyRecoveredBoost: 1.1 },
    { id: "reserve-quartier", title: "Réserve quartier", promise: "Une réserve cachée au sommet de la saison", annualCost: 160, monthlyRecoveredBoost: 1.05 },
  ],
  caviste: [
    { id: "bouteille-decouverte", title: "Bouteille découverte", promise: "1 bouteille découverte par mois pendant 6 mois", annualCost: 300, monthlyRecoveredBoost: 1.04 },
    { id: "degustation-privee", title: "Dégustation privée", promise: "4 dégustations privées dans l'année", annualCost: 260, monthlyRecoveredBoost: 1.12 },
    { id: "selection-cave", title: "Sélection cave", promise: "Accès à une sélection cave réservée", annualCost: 180, monthlyRecoveredBoost: 1.06 },
  ],
}

export function normalizeSeasonLength(value?: string): SeasonLength {
  return value === "6" ? 6 : 3
}

export function getSummitPresets(templateId: string): SummitPreset[] {
  return summitPresets[templateId] ?? summitPresets.boulangerie
}

export function getSummitPreset(templateId: string, summitId?: string): SummitPreset {
  const presets = getSummitPresets(templateId)
  return presets.find((preset) => preset.id === summitId) ?? presets[0]
}
