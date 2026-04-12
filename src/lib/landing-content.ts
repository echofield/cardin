export type LandingWorldId = "cafe" | "bar" | "restaurant" | "beaute" | "boutique"

type LandingWorldContent = {
  label: string
  eyebrow: string
  claim: string
  /** Même fourchette que `claim` — usage parcours / animations. */
  seasonRevenueBandEuro: { min: number; max: number }
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
  /** Durée standard d’une saison (mois). */
  seasonLengthMonths: 3,
  activationLabel: "Activer Cardin (490 €)",
  /**
   * Équivalent mensuel pour amortir le forfait saison dans les calculateurs (490 € / saisonLengthMonths).
   * Pas un prix affiché « par mois » côté marchand.
   */
  seasonMonthlyEquivalent: Math.round(490 / 3),
  /** Conservé pour compat ; l’offre n’est plus présentée comme un montant mensuel récurrent. */
  recurringFee: 0,
  recurringLabel: "Tarif unique pour la saison — pas d’abonnement mensuel",
  compactLabel: "490 € pour une saison (3 mois)",
  stickyLabel: "Activer Cardin — 490 € (saison 3 mois)",
  /** Montant d’activation pour le parcours simplifié interne (`mode=lite`) — affichage uniquement, sans câblage paiement dédié. */
  liteActivationFee: 300,
  liteActivationLabel: "Activer Cardin (300 €)",
  liteCompactLabel: "300 € pour une saison (3 mois)",
  liteStickyLabel: "Activer Cardin — 300 € (saison 3 mois)",
} as const

export const LANDING_WORLD_ORDER: LandingWorldId[] = ["cafe", "bar", "restaurant", "beaute", "boutique"]

export const LANDING_WORLDS: Record<LandingWorldId, LandingWorldContent> = {
  cafe: {
    label: "Café",
    eyebrow: "Volume et fréquence",
    claim: "+2 000 € à +6 000 € par saison",
    seasonRevenueBandEuro: { min: 2000, max: 6000 },
    basket: "Panier moyen 5 à 8 €",
    onboardingLead:
      "Moteur de revenu saisonnier : Diamond visible dès le départ, missions sur le parcours, retour et recommandation activés.",
    proofLine: "Passage → retour → recommandation et moments activés.",
    summitPromise: "1 boisson signature par mois pendant 1 an.",
    baselineRecoveredPerMonth: 2400,
    baselineTrust: 72,
  },
  bar: {
    label: "Bar",
    eyebrow: "Soirée & comptoir",
    claim: "+3 000 € à +8 000 € par saison",
    seasonRevenueBandEuro: { min: 3000, max: 8000 },
    basket: "Panier moyen 10 à 20 €",
    onboardingLead:
      "Moteur de revenu sur le créneau soir : Diamond visible dès le départ, réseau naturel et créations au comptoir.",
    proofLine: "Passage → retour → habitudes de soirée et invitations.",
    summitPromise: "1 création signature au bar par mois pendant 1 an.",
    baselineRecoveredPerMonth: 3200,
    baselineTrust: 73,
  },
  restaurant: {
    label: "Restaurant",
    eyebrow: "Panier moyen élevé",
    claim: "+4 000 € à +10 000 € par saison",
    seasonRevenueBandEuro: { min: 4000, max: 10000 },
    basket: "Panier moyen 40 à 60 €",
    onboardingLead:
      "Objectif de saison ambitieux : Diamond comme horizon, réseau de tables et récurrence entre deux services.",
    proofLine: "Table → retour client → réseau activé par invitation.",
    summitPromise: "1 repas signature par mois pendant 1 an.",
    baselineRecoveredPerMonth: 4200,
    baselineTrust: 76,
  },
  beaute: {
    label: "Beauté",
    eyebrow: "Valeur et sélection",
    claim: "+4 000 € à +10 000 € par saison",
    seasonRevenueBandEuro: { min: 4000, max: 10000 },
    basket: "Valeur client élevée",
    onboardingLead:
      "Revenu saisonnier calibré : Diamond comme statut long terme, missions qui structurent la récurrence.",
    proofLine: "Cycle → retour → recommandation et privilèges maîtrisés.",
    summitPromise: "1 soin signature par mois pendant 1 an.",
    baselineRecoveredPerMonth: 3200,
    baselineTrust: 81,
  },
  boutique: {
    label: "Boutique",
    eyebrow: "Désir et statut",
    claim: "+5 000 € à +12 000 € par saison",
    seasonRevenueBandEuro: { min: 5000, max: 12000 },
    basket: "Valeur client élevée",
    onboardingLead:
      "Saison orientée désir : Diamond comme expérience régulière, upside fort quand le réseau s’active.",
    proofLine: "Désir → retour client → accès et statut maîtrisés.",
    summitPromise: "100 € collection par mois pendant 1 an.",
    baselineRecoveredPerMonth: 3600,
    baselineTrust: 74,
  },
}

export const LANDING_SECTOR_CARDS: SectorCard[] = [
  {
    label: "Café",
    description: `${LANDING_WORLDS.cafe.claim}. Fréquence élevée, ${LANDING_WORLDS.cafe.basket}, Diamond comme horizon dès l’entrée.`,
  },
  {
    label: "Bar",
    description: `${LANDING_WORLDS.bar.claim}. Soirée et panier plus fort, Diamond comme horizon dès l'entrée.`,
  },
  {
    label: "Restaurant",
    description: `${LANDING_WORLDS.restaurant.claim}. ${LANDING_WORLDS.restaurant.basket}, retour entre deux services, réseau activé par table.`,
  },
  {
    label: "Beauté",
    description: `${LANDING_WORLDS.beaute.claim}. Soins à forte valeur, récurrence pilotée, missions sur le parcours client.`,
  },
  {
    label: "Boutique",
    description: `${LANDING_WORLDS.boutique.claim}. Désir et panier, upside réseau jusqu’au haut de la fourchette saisonnière.`,
  },
]
