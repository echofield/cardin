export type MerchantProjectionType = "cafe" | "restaurant" | "coiffeur" | "beaute" | "boutique"

export type Proposition = {
  id: string
  title: string
  description: string
  revenueEstimate: string
  frequencyEstimate: string
}

export type ProjectionBundle = {
  featured: Proposition
  options: [Proposition, Proposition, Proposition]
}

export const MERCHANT_IDENTITY_OPTIONS: {
  type: MerchantProjectionType
  label: string
  line: string
}[] = [
  { type: "cafe", label: "Café", line: "passage rapide" },
  { type: "restaurant", label: "Restaurant", line: "entre deux moments" },
  { type: "coiffeur", label: "Coiffeur", line: "retour espacé" },
  { type: "beaute", label: "Beauté", line: "fréquence fragile" },
  { type: "boutique", label: "Boutique", line: "clients irréguliers" },
]

export const projectionByMerchant: Record<MerchantProjectionType, ProjectionBundle> = {
  cafe: {
    featured: {
      id: "rendez-vous-matin",
      title: "Rendez-vous matin",
      description: "Un repère fixe sur votre créneau le plus naturel.",
      revenueEstimate: "+180€ / mois",
      frequencyEstimate: "≈ 1 client en plus par jour",
    },
    options: [
      {
        id: "jour-faible",
        title: "Jour mort → jour fort",
        description: "Concentrer l’attention sur un jour plus calme.",
        revenueEstimate: "+220€ / mois",
        frequencyEstimate: "≈ 1 table en plus ce jour-là",
      },
      {
        id: "defi-court",
        title: "Défi court",
        description: "Plusieurs passages sur une fenêtre courte.",
        revenueEstimate: "+150€ / mois",
        frequencyEstimate: "≈ 1 retour tous les 2 jours",
      },
      {
        id: "moment-mensuel",
        title: "Moment mensuel",
        description: "Un pic attendu dans le mois, sans promo permanente.",
        revenueEstimate: "+200€ / mois",
        frequencyEstimate: "≈ 1 client fidèle en plus / semaine",
      },
    ],
  },
  restaurant: {
    featured: {
      id: "jour-mort-fort",
      title: "Jour mort → jour fort",
      description: "Votre service le plus calme devient un rendez-vous.",
      revenueEstimate: "+320€ / mois",
      frequencyEstimate: "≈ 1 client tous les 2 jours",
    },
    options: [
      {
        id: "defi-court",
        title: "Défi court",
        description: "Relancer la fréquence avant que l’habitude ne se casse.",
        revenueEstimate: "+280€ / mois",
        frequencyEstimate: "≈ 2 couverts en plus / semaine",
      },
      {
        id: "rdv-hebdo",
        title: "Rendez-vous hebdo",
        description: "Un repère clair au milieu de la semaine.",
        revenueEstimate: "+240€ / mois",
        frequencyEstimate: "≈ 1 table réservée en plus / semaine",
      },
      {
        id: "point-depart",
        title: "Point de départ",
        description: "Une boucle simple entre deux occasions.",
        revenueEstimate: "+190€ / mois",
        frequencyEstimate: "≈ 1 retour / semaine régain",
      },
    ],
  },
  coiffeur: {
    featured: {
      id: "double-passage",
      title: "Double passage",
      description: "Deux visites rapprochées pour raccourcir le cycle.",
      revenueEstimate: "+410€ / mois",
      frequencyEstimate: "≈ 1 rendez-vous en plus / semaine",
    },
    options: [
      {
        id: "chemin-rapide",
        title: "Chemin rapide",
        description: "Une trajectoire plus courte pour vos meilleures clientes.",
        revenueEstimate: "+380€ / mois",
        frequencyEstimate: "≈ −5 jours entre deux visites",
      },
      {
        id: "moment-mensuel",
        title: "Moment mensuel",
        description: "Un soin ou une coupe signature dans le mois.",
        revenueEstimate: "+350€ / mois",
        frequencyEstimate: "≈ 1 prestation premium / mois",
      },
      {
        id: "defi-retour",
        title: "Défi retour",
        description: "Réactiver avant que le cycle ne se rompe.",
        revenueEstimate: "+290€ / mois",
        frequencyEstimate: "≈ 2 retours en plus / mois",
      },
    ],
  },
  beaute: {
    featured: {
      id: "rituel-stable",
      title: "Rituel périodique",
      description: "Un retour attendu entre deux séances fragiles.",
      revenueEstimate: "+360€ / mois",
      frequencyEstimate: "≈ 1 séance maintenue / semaine",
    },
    options: [
      {
        id: "moment-exceptionnel",
        title: "Moment exceptionnel",
        description: "Un palier plus désirable sur une période donnée.",
        revenueEstimate: "+420€ / mois",
        frequencyEstimate: "≈ 1 client en plus / semaine",
      },
      {
        id: "acces-reserve",
        title: "Accès réservé",
        description: "Une récompense après un vrai engagement.",
        revenueEstimate: "+310€ / mois",
        frequencyEstimate: "≈ moins d’annulations dernière minute",
      },
      {
        id: "defi-retour",
        title: "Défi retour",
        description: "Rattraper les clientes qui s’espacent.",
        revenueEstimate: "+270€ / mois",
        frequencyEstimate: "≈ 1 retour anticipé / mois",
      },
    ],
  },
  boutique: {
    featured: {
      id: "point-depart",
      title: "Point de départ",
      description: "Une raison simple de repasser entre deux achats.",
      revenueEstimate: "+210€ / mois",
      frequencyEstimate: "≈ 1 passage en plus / semaine",
    },
    options: [
      {
        id: "collection",
        title: "Rendez-vous collection",
        description: "Un moment boutique autour des nouveautés.",
        revenueEstimate: "+260€ / mois",
        frequencyEstimate: "≈ 1 visite planifiée / quinzaine",
      },
      {
        id: "defi-court",
        title: "Défi court",
        description: "Resserrer le délai entre deux passages.",
        revenueEstimate: "+230€ / mois",
        frequencyEstimate: "≈ 1 client réactivé / semaine",
      },
      {
        id: "moment-mensuel",
        title: "Moment mensuel",
        description: "Un temps fort visible dans le mois.",
        revenueEstimate: "+190€ / mois",
        frequencyEstimate: "≈ 1 achat impulsif en plus / mois",
      },
    ],
  },
}

export function isMerchantProjectionType(value: string | null): value is MerchantProjectionType {
  return value === "cafe" || value === "restaurant" || value === "coiffeur" || value === "beaute" || value === "boutique"
}

export function getProjectionBundle(type: MerchantProjectionType): ProjectionBundle {
  return projectionByMerchant[type]
}
