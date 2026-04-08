export type LandingWorldId = "cafe" | "restaurant" | "beaute" | "boutique"

type LandingWorldContent = {
  label: string
  eyebrow: string
  claim: string
  basket: string
  onboardingLead: string
  proofLine: string
  summitPromise: string
  baselineRecoveredPerMonth: number
  baselineTrust: number
}

type SectorCard = {
  label: string
  description: string
}

export const LANDING_PRICING = {
  activationFee: 490,
  activationLabel: "Payer ma saison (490 €)",
  recurringFee: 49,
  recurringLabel: "49 € / mois pendant la saison",
  compactLabel: "490 € puis 49 € / mois pendant la saison",
  stickyLabel: "Activer Cardin — 490 € puis 49 € / mois",
} as const

export const LANDING_WORLD_ORDER: LandingWorldId[] = ["cafe", "restaurant", "beaute", "boutique"]

export const LANDING_WORLDS: Record<LandingWorldId, LandingWorldContent> = {
  cafe: {
    label: "Café",
    eyebrow: "Volume et fréquence",
    claim: "+4 k€ à 6 k€ par saison",
    basket: "Panier moyen 5-8 €",
    onboardingLead: "Passage rapide, fréquence élevée, retour client visible très vite.",
    proofLine: "Passage → retour client → réseau activé.",
    summitPromise: "1 boisson signature par mois pendant 1 an.",
    baselineRecoveredPerMonth: 1400,
    baselineTrust: 72,
  },
  restaurant: {
    label: "Restaurant",
    eyebrow: "Panier moyen élevé",
    claim: "+10 k€ à 15 k€ par saison",
    basket: "Panier moyen 40-60 €",
    onboardingLead: "Table, invitation et retour client à réactiver.",
    proofLine: "Table → retour client → réseau activé par invitation.",
    summitPromise: "1 repas signature par mois pendant 1 an.",
    baselineRecoveredPerMonth: 3800,
    baselineTrust: 76,
  },
  beaute: {
    label: "Beauté",
    eyebrow: "Valeur et sélection",
    claim: "+6 k€ à 10 k€ par saison",
    basket: "Valeur client élevée",
    onboardingLead: "Cycle, fréquence et recommandation de confiance.",
    proofLine: "Cycle → retour client → réseau activé par recommandation.",
    summitPromise: "1 soin signature par mois pendant 1 an.",
    baselineRecoveredPerMonth: 2600,
    baselineTrust: 81,
  },
  boutique: {
    label: "Boutique",
    eyebrow: "Désir et statut",
    claim: "+6 k€ à 10 k€ par saison",
    basket: "Valeur client élevée",
    onboardingLead: "Désir, collection et retour client moins fréquent mais plus dense.",
    proofLine: "Désir → retour client → accès exclusif.",
    summitPromise: "100 € collection par mois pendant 1 an.",
    baselineRecoveredPerMonth: 2200,
    baselineTrust: 74,
  },
}

export const LANDING_SECTOR_CARDS: SectorCard[] = [
  {
    label: "Café",
    description: `${LANDING_WORLDS.cafe.claim}. Fréquence élevée, ${LANDING_WORLDS.cafe.basket}, affluence relancée rapidement.`,
  },
  {
    label: "Restaurant",
    description: `${LANDING_WORLDS.restaurant.claim}. ${LANDING_WORLDS.restaurant.basket}, retour client entre deux services et réseau activé par table.`,
  },
  {
    label: "Beauté / Boutique",
    description: `${LANDING_WORLDS.beaute.claim}. Valeur client élevée, fréquence plus rare, revenu récupéré sur une trajectoire plus sélective.`,
  },
]
