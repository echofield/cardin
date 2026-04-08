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
  activationLabel: "Payer ma saison (490 EUR)",
  recurringFee: 49,
  recurringLabel: "49 EUR / mois pendant la saison",
  compactLabel: "490 EUR puis 49 EUR / mois pendant la saison",
  stickyLabel: "Activer Cardin - 490 EUR puis 49 EUR / mois",
} as const

export const LANDING_WORLD_ORDER: LandingWorldId[] = ["cafe", "restaurant", "beaute", "boutique"]

export const LANDING_WORLDS: Record<LandingWorldId, LandingWorldContent> = {
  cafe: {
    label: "Cafe",
    eyebrow: "Volume et frequence",
    claim: "+4k a 6k par saison",
    basket: "Panier moyen 5-8 EUR",
    onboardingLead: "Passage rapide, volume eleve, retour visible tres vite.",
    proofLine: "Passage -> retour structure -> propagation mesuree.",
    summitPromise: "1 boisson signature par mois pendant 1 an.",
    baselineRecoveredPerMonth: 1400,
    baselineTrust: 72,
  },
  restaurant: {
    label: "Restaurant",
    eyebrow: "Panier moyen eleve",
    claim: "+10k a 15k par saison",
    basket: "Panier moyen 40-60 EUR",
    onboardingLead: "Table, invitation et retour espace a reactiver.",
    proofLine: "Table -> retour structure -> propagation par invitation.",
    summitPromise: "1 repas signature par mois pendant 1 an.",
    baselineRecoveredPerMonth: 3800,
    baselineTrust: 76,
  },
  beaute: {
    label: "Beaute",
    eyebrow: "Valeur et selection",
    claim: "+6k a 10k par saison",
    basket: "Valeur client elevee",
    onboardingLead: "Cycle, selection et recommandation qualitative.",
    proofLine: "Cycle -> statut client -> recommandation qualitative.",
    summitPromise: "1 soin signature par mois pendant 1 an.",
    baselineRecoveredPerMonth: 2600,
    baselineTrust: 81,
  },
  boutique: {
    label: "Boutique",
    eyebrow: "Desir et statut",
    claim: "+6k a 10k par saison",
    basket: "Valeur client elevee",
    onboardingLead: "Desir, collection et retour moins frequent mais plus dense.",
    proofLine: "Desir -> trajectoire client -> acces exclusif.",
    summitPromise: "100 EUR collection par mois pendant 1 an.",
    baselineRecoveredPerMonth: 2200,
    baselineTrust: 74,
  },
}

export const LANDING_SECTOR_CARDS: SectorCard[] = [
  {
    label: "Cafe",
    description: `${LANDING_WORLDS.cafe.claim}. Frequence elevee, ${LANDING_WORLDS.cafe.basket}, retour rapide.`,
  },
  {
    label: "Restaurant",
    description: `${LANDING_WORLDS.restaurant.claim}. ${LANDING_WORLDS.restaurant.basket}, table et invitation.`,
  },
  {
    label: "Beaute / Boutique",
    description: `${LANDING_WORLDS.beaute.claim}. Trajectoire, valeur client elevee, selection.`,
  },
]
