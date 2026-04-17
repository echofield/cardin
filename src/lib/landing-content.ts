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

/** Paiement activation saison (Stripe Checkout / Payment Link). Override in prod: `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`. */
const DEFAULT_STRIPE_PAYMENT_LINK = "https://buy.stripe.com/7sY5kD4RS66P4Tv7xl9Zm07"
export const STRIPE_PAYMENT_LINK =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim()) || DEFAULT_STRIPE_PAYMENT_LINK

export const LANDING_WORLD_ORDER: LandingWorldId[] = ["cafe", "bar", "restaurant", "beaute", "boutique"]

export const LANDING_WORLDS: Record<LandingWorldId, LandingWorldContent> = {
  cafe: {
    label: "Café",
    eyebrow: "Volume et fréquence",
    claim: "+2 000 € à +6 000 € par saison",
    seasonRevenueBandEuro: { min: 2000, max: 6000 },
    basket: "Panier moyen 5 à 8 €",
    onboardingLead:
      "Le café où l’on revient. Chaque passage compte. La saison fait son travail.",
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
      "Le bar que l’on ramène. Un régulier amène un ami. Le comptoir devient un lieu.",
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
      "La table qu’on se raconte. Le client revient, puis revient à deux. La saison se remplit.",
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
      "Le rituel qui tient. Chaque rendez-vous installe le suivant. La clientèle se cristallise.",
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
      "La boutique qu’on défend. Statut visible, accès privilégié, retour naturel.",
    proofLine: "Désir → retour client → accès et statut maîtrisés.",
    summitPromise: "100 € collection par mois pendant 1 an.",
    baselineRecoveredPerMonth: 3600,
    baselineTrust: 74,
  },
}

export const LANDING_SECTOR_CARDS: SectorCard[] = [
  { label: "Café",       description: "Volume élevé, passages rapides." },
  { label: "Bar",        description: "Soirée, comptoir, réseau naturel." },
  { label: "Restaurant", description: "Table et service, panier fort." },
  { label: "Beauté",     description: "Confiance, régularité, recommandation." },
  { label: "Boutique",   description: "Désir fort, panier élevé." },
]
