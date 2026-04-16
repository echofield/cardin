export type MerchantProjectionType = "cafe" | "bar" | "restaurant" | "coiffeur" | "beaute" | "boutique"

export type TrafficLevel = "light" | "steady" | "dense"
export type TicketLevel = "small" | "standard" | "premium"
export type FrequencyLevel = "fragile" | "normal" | "strong"

export type AuditSelection = {
  traffic: TrafficLevel
  ticket: TicketLevel
  frequency: FrequencyLevel
}

export type ProjectionAuditOption<T extends string> = {
  id: T
  label: string
  description: string
}

export type ProjectionAuditBlock =
  | {
      id: "traffic"
      label: string
      help: string
      options: ProjectionAuditOption<TrafficLevel>[]
    }
  | {
      id: "ticket"
      label: string
      help: string
      options: ProjectionAuditOption<TicketLevel>[]
    }
  | {
      id: "frequency"
      label: string
      help: string
      options: ProjectionAuditOption<FrequencyLevel>[]
    }

export type ProjectionPassProfile = {
  rewardLabel: string
  notificationLabel: string
  footerLabel: string
  progressDots: number
  activeDots: number
}

export type ProjectionImpactProfile = {
  captureRate: number
  revisitRate: number
  basketLift: number
  retentionLift: number
  confidenceLow: number
  confidenceHigh: number
}

export type ProjectionScenario = {
  id: string
  title: string
  description: string
  summaryLine: string
  startingOffer: string
  customerPromise: string
  triggerHint: string
  defaultAudit: AuditSelection
  pass: ProjectionPassProfile
  impact: ProjectionImpactProfile
}

export type ProjectionBundle = {
  merchantLabel: string
  merchantLine: string
  brandPunchline: string
  auditBlocks: [ProjectionAuditBlock, ProjectionAuditBlock, ProjectionAuditBlock]
  featured: ProjectionScenario
  options: [ProjectionScenario, ProjectionScenario, ProjectionScenario]
}

export type MerchantIdentityOption = {
  type: MerchantProjectionType
  label: string
  line: string
  detail: string
}

export const MERCHANT_IDENTITY_OPTIONS: MerchantIdentityOption[] = [
  { type: "cafe", label: "Café", line: "passage rapide", detail: "habitudes du quotidien" },
  { type: "bar", label: "Bar", line: "soirée & comptoir", detail: "panier plus fort, réseau naturel" },
  { type: "restaurant", label: "Restaurant", line: "entre deux moments", detail: "services inégaux dans la semaine" },
  { type: "coiffeur", label: "Coiffeur", line: "retour espacé", detail: "cycle à raccourcir" },
  { type: "beaute", label: "Beauté", line: "fréquence fragile", detail: "séances à stabiliser" },
  { type: "boutique", label: "Boutique", line: "clients irréguliers", detail: "raison de repasser" },
]

function createScenario(scenario: ProjectionScenario): ProjectionScenario {
  return scenario
}

export const projectionByMerchant: Record<MerchantProjectionType, ProjectionBundle> = {
  cafe: {
    merchantLabel: "Café",
    merchantLine: "Passage rapide et habitudes du quotidien.",
    brandPunchline:
      "Diamond visible comme destination dès le départ : missions sur le parcours, retour et réseau qui montent vers un privilège maîtrisé.",
    auditBlocks: [
      {
        id: "traffic",
        label: "Passage",
        help: "Le rythme de comptoir observé sur vos journées utiles.",
        options: [
          { id: "light", label: "Calme", description: "créneau encore fin" },
          { id: "steady", label: "Régulier", description: "flux déjà installé" },
          { id: "dense", label: "Dense", description: "beaucoup de passages à capter" },
        ],
      },
      {
        id: "ticket",
        label: "Panier",
        help: "Le panier le plus fréquent, pas le meilleur jour.",
        options: [
          { id: "small", label: "Essentiel", description: "café seul" },
          { id: "standard", label: "Classique", description: "boisson + extra" },
          { id: "premium", label: "Formule", description: "ticket plus complet" },
        ],
      },
      {
        id: "frequency",
        label: "Retour",
        help: "La facilité à refaire venir la même personne.",
        options: [
          { id: "fragile", label: "À réveiller", description: "habitude encore faible" },
          { id: "normal", label: "À structurer", description: "retour présent mais irrégulier" },
          { id: "strong", label: "Déjà visible", description: "routine existante" },
        ],
      },
    ],
    featured: createScenario({
      id: "rendez-vous-matin",
      title: "Rendez-vous matin",
      description: "Un repère simple qui ancre votre café dans la semaine.",
      summaryLine: "Faire revenir dans la semaine et ancrer un horaire visible.",
      startingOffer: "6 passages → 1 café signature offert",
      customerPromise: "Le client voit qu'il avance vite, sans attendre des semaines.",
      triggerHint: "Relance douce 5 jours après la dernière visite.",
      defaultAudit: { traffic: "steady", ticket: "standard", frequency: "normal" },
      pass: {
        rewardLabel: "6 passages → café signature",
        notificationLabel: "Votre prochain café se rapproche",
        footerLabel: "CARDIN PASS",
        progressDots: 6,
        activeDots: 2,
      },
      impact: { captureRate: 0.085, revisitRate: 0.24, basketLift: 0.02, retentionLift: 0.03, confidenceLow: 0.84, confidenceHigh: 1.15 },
    }),
    options: [
      createScenario({
        id: "jour-faible",
        title: "Jour mort → jour fort",
        description: "Concentrer l'attention sur votre créneau le plus calme.",
        summaryLine: "Déplacer du trafic existant vers un jour qui mérite d'être rempli.",
        startingOffer: "Mardi actif → 5 passages ce jour-là → boisson offerte",
        customerPromise: "Le client comprend qu'il y a un vrai rendez-vous, pas une promo floue.",
        triggerHint: "Mise en avant discrète 24 h avant le jour cible.",
        defaultAudit: { traffic: "steady", ticket: "standard", frequency: "fragile" },
        pass: {
          rewardLabel: "5 mardis actifs → boisson offerte",
          notificationLabel: "Demain, votre passage compte double",
          footerLabel: "CARDIN PASS",
          progressDots: 5,
          activeDots: 1,
        },
        impact: { captureRate: 0.09, revisitRate: 0.2, basketLift: 0.03, retentionLift: 0.028, confidenceLow: 0.83, confidenceHigh: 1.14 },
      }),
      createScenario({
        id: "defi-court",
        title: "Défi court",
        description: "Plusieurs retours sur une courte fenêtre pour accélérer l'habitude.",
        summaryLine: "Resserrer l'intervalle entre deux passages avant que l'habitude ne casse.",
        startingOffer: "3 visites en 7 jours → pâtisserie maison",
        customerPromise: "Le client sent un mouvement court, facile à comprendre et à finir.",
        triggerHint: "Carte active dès le premier scan pour viser la semaine.",
        defaultAudit: { traffic: "dense", ticket: "small", frequency: "fragile" },
        pass: {
          rewardLabel: "3 visites en 7 jours",
          notificationLabel: "Plus qu'un passage cette semaine",
          footerLabel: "CARDIN PASS",
          progressDots: 3,
          activeDots: 1,
        },
        impact: { captureRate: 0.07, revisitRate: 0.22, basketLift: 0.01, retentionLift: 0.022, confidenceLow: 0.82, confidenceHigh: 1.12 },
      }),
      createScenario({
        id: "moment-mensuel",
        title: "Moment mensuel",
        description: "Faire exister un temps fort attendu sans vivre en promotion.",
        summaryLine: "Installer un mini-événement régulier qui donne une raison claire de repasser.",
        startingOffer: "4 passages dans le mois → création de saison",
        customerPromise: "Le client attend un moment, pas seulement une remise.",
        triggerHint: "Annonce du cap à atteindre au début du mois.",
        defaultAudit: { traffic: "light", ticket: "premium", frequency: "normal" },
        pass: {
          rewardLabel: "4 passages → création du mois",
          notificationLabel: "Votre moment du mois avance",
          footerLabel: "CARDIN PASS",
          progressDots: 4,
          activeDots: 1,
        },
        impact: { captureRate: 0.06, revisitRate: 0.18, basketLift: 0.05, retentionLift: 0.02, confidenceLow: 0.83, confidenceHigh: 1.16 },
      }),
    ],
  },
  bar: {
    merchantLabel: "Bar",
    merchantLine: "Comptoir, soirée et réseau social — ticket plus haut que le café, fréquence à structurer.",
    brandPunchline:
      "Diamond comme horizon dès le premier verre : missions sur le parcours, retour et tables qui montent vers un privilège maîtrisé.",
    auditBlocks: [
      {
        id: "traffic",
        label: "Affluence",
        help: "Le niveau réel sur les soirées et créneaux que vous voulez densifier.",
        options: [
          { id: "light", label: "Calme", description: "soirées encore irrégulières" },
          { id: "steady", label: "Régulier", description: "base installée en semaine" },
          { id: "dense", label: "Dense", description: "forte rotation à capter" },
        ],
      },
      {
        id: "ticket",
        label: "Panier",
        help: "Le ticket moyen le plus fréquent (consos + service).",
        options: [
          { id: "small", label: "Essentiel", description: "consommation courte" },
          { id: "standard", label: "Classique", description: "consos + accompagnement" },
          { id: "premium", label: "Généreux", description: "ticket plus complet" },
        ],
      },
      {
        id: "frequency",
        label: "Retour",
        help: "La facilité à refaire revenir le même client.",
        options: [
          { id: "fragile", label: "À réveiller", description: "clientèle encore peu régulière" },
          { id: "normal", label: "À structurer", description: "retour présent mais irrégulier" },
          { id: "strong", label: "Déjà visible", description: "habitués identifiables" },
        ],
      },
    ],
    featured: createScenario({
      id: "soiree-reguliere",
      title: "Soirée régulière",
      description: "Ancrer un rendez-vous de semaine sans vivre en promotion.",
      summaryLine: "Faire revenir sur un créneau clair et rendre le bar prévisible.",
      startingOffer: "5 passages → 1 consigne signature offerte",
      customerPromise: "Le client voit un cap atteignable en quelques sorties.",
      triggerHint: "Rappel doux 4 jours après la dernière venue.",
      defaultAudit: { traffic: "steady", ticket: "standard", frequency: "normal" },
      pass: {
        rewardLabel: "5 passages → consigne signature",
        notificationLabel: "Votre prochaine soirée compte",
        footerLabel: "CARDIN PASS",
        progressDots: 5,
        activeDots: 2,
      },
      impact: { captureRate: 0.082, revisitRate: 0.22, basketLift: 0.03, retentionLift: 0.028, confidenceLow: 0.84, confidenceHigh: 1.14 },
    }),
    options: [
      createScenario({
        id: "creneau-faible",
        title: "Créneau faible → fort",
        description: "Redistribuer l'attention vers le jour ou la plage la plus calme.",
        summaryLine: "Déplacer du trafic existant vers un moment à renforcer.",
        startingOffer: "Jeudi actif → 4 passages ce soir-là → shot maison offert",
        customerPromise: "Le client comprend un rendez-vous clair, pas une promo floue.",
        triggerHint: "Annonce 24 h avant le créneau cible.",
        defaultAudit: { traffic: "steady", ticket: "standard", frequency: "fragile" },
        pass: {
          rewardLabel: "4 jeudis actifs → shot offert",
          notificationLabel: "Demain, votre passage compte double",
          footerLabel: "CARDIN PASS",
          progressDots: 4,
          activeDots: 1,
        },
        impact: { captureRate: 0.088, revisitRate: 0.19, basketLift: 0.035, retentionLift: 0.026, confidenceLow: 0.83, confidenceHigh: 1.13 },
      }),
      createScenario({
        id: "defi-court-bar",
        title: "Défi court",
        description: "Plusieurs venues sur une courte fenêtre pour accélérer l'habitude.",
        summaryLine: "Resserrer l'intervalle entre deux sorties avant que l'habitude ne casse.",
        startingOffer: "3 visites en 14 jours → tapas offertes",
        customerPromise: "Le client sent un sprint court, facile à finir.",
        triggerHint: "Carte active dès le premier scan pour viser les deux semaines.",
        defaultAudit: { traffic: "dense", ticket: "small", frequency: "fragile" },
        pass: {
          rewardLabel: "3 visites en 14 jours",
          notificationLabel: "Plus qu'une sortie cette quinzaine",
          footerLabel: "CARDIN PASS",
          progressDots: 3,
          activeDots: 1,
        },
        impact: { captureRate: 0.072, revisitRate: 0.21, basketLift: 0.02, retentionLift: 0.024, confidenceLow: 0.82, confidenceHigh: 1.12 },
      }),
      createScenario({
        id: "moment-mensuel-bar",
        title: "Moment mensuel",
        description: "Installer un temps fort attendu sans banaliser l'image du lieu.",
        summaryLine: "Créer un rendez-vous mensuel identifiable.",
        startingOffer: "4 passages dans le mois → création du mois au bar",
        customerPromise: "Le client attend un moment, pas seulement une remise.",
        triggerHint: "Annonce du cap au début du mois.",
        defaultAudit: { traffic: "light", ticket: "premium", frequency: "normal" },
        pass: {
          rewardLabel: "4 passages → création du mois",
          notificationLabel: "Votre moment du mois avance",
          footerLabel: "CARDIN PASS",
          progressDots: 4,
          activeDots: 1,
        },
        impact: { captureRate: 0.065, revisitRate: 0.17, basketLift: 0.06, retentionLift: 0.021, confidenceLow: 0.83, confidenceHigh: 1.15 },
      }),
    ],
  },
  restaurant: {
    merchantLabel: "Restaurant",
    merchantLine: "Entre deux services, avec des jours très inégaux.",
    brandPunchline: "Transformer un service calme en rendez-vous concret et récurrent.",
    auditBlocks: [
      {
        id: "traffic",
        label: "Flux de couverts",
        help: "Le niveau habituel sur les jours que vous voulez renforcer.",
        options: [
          { id: "light", label: "Sélectif", description: "service encore calme" },
          { id: "steady", label: "Régulier", description: "bon niveau de base" },
          { id: "dense", label: "Soutenu", description: "volume déjà présent" },
        ],
      },
      {
        id: "ticket",
        label: "Panier moyen",
        help: "Le ticket réel le plus fréquent sur ce moment.",
        options: [
          { id: "small", label: "Accessible", description: "déj + boisson" },
          { id: "standard", label: "Cœur de carte", description: "plat + boisson" },
          { id: "premium", label: "Plus généreux", description: "entrée/plat ou formule" },
        ],
      },
      {
        id: "frequency",
        label: "Habitude client",
        help: "La facilité à remettre votre restaurant dans la boucle.",
        options: [
          { id: "fragile", label: "Occasionnel", description: "pas encore d'habitude" },
          { id: "normal", label: "Relançable", description: "retour envisageable" },
          { id: "strong", label: "Déjà visible", description: "clientèle récurrente" },
        ],
      },
    ],
    featured: createScenario({
      id: "jour-mort-fort",
      title: "Jour mort → jour fort",
      description: "Votre service le plus calme devient un vrai point de rendez-vous.",
      summaryLine: "Concentrer le trafic existant sur votre point faible pour stabiliser la semaine.",
      startingOffer: "4 passages le mercredi → dessert maison",
      customerPromise: "Le client voit un cap simple et un jour clair à privilégier.",
      triggerHint: "Relance douce la veille du service cible.",
      defaultAudit: { traffic: "steady", ticket: "standard", frequency: "normal" },
      pass: {
        rewardLabel: "4 mercredis → dessert maison",
        notificationLabel: "Demain, votre passage du mercredi avance",
        footerLabel: "CARDIN PASS",
        progressDots: 4,
        activeDots: 1,
      },
      impact: { captureRate: 0.09, revisitRate: 0.25, basketLift: 0.04, retentionLift: 0.032, confidenceLow: 0.85, confidenceHigh: 1.16 },
    }),
    options: [
      createScenario({
        id: "defi-court",
        title: "Défi court",
        description: "Relancer la fréquence avant que l'habitude ne disparaisse.",
        summaryLine: "Recruter plus vite un second passage dans le mois.",
        startingOffer: "2 retours en 15 jours → entrée signée",
        customerPromise: "Le client comprend un petit sprint, simple à finir.",
        triggerHint: "Relance 7 jours après la première visite.",
        defaultAudit: { traffic: "dense", ticket: "small", frequency: "fragile" },
        pass: {
          rewardLabel: "2 retours en 15 jours",
          notificationLabel: "Encore un passage et l'entrée se débloque",
          footerLabel: "CARDIN PASS",
          progressDots: 2,
          activeDots: 1,
        },
        impact: { captureRate: 0.07, revisitRate: 0.22, basketLift: 0.02, retentionLift: 0.026, confidenceLow: 0.83, confidenceHigh: 1.13 },
      }),
      createScenario({
        id: "rdv-hebdo",
        title: "Rendez-vous hebdo",
        description: "Un repère au milieu de la semaine, facile à mémoriser.",
        summaryLine: "Installer un retour presque rituel sur un moment maîtrisé.",
        startingOffer: "1 passage / semaine pendant 3 semaines → table prioritaire",
        customerPromise: "Le client sait exactement quand revenir et pourquoi.",
        triggerHint: "Notification 48 h avant le rendez-vous hebdo.",
        defaultAudit: { traffic: "light", ticket: "standard", frequency: "strong" },
        pass: {
          rewardLabel: "3 semaines de suite",
          notificationLabel: "Votre rendez-vous de la semaine vous attend",
          footerLabel: "CARDIN PASS",
          progressDots: 3,
          activeDots: 1,
        },
        impact: { captureRate: 0.075, revisitRate: 0.2, basketLift: 0.03, retentionLift: 0.024, confidenceLow: 0.84, confidenceHigh: 1.14 },
      }),
      createScenario({
        id: "point-depart",
        title: "Point de départ",
        description: "Une boucle simple entre deux occasions de venue.",
        summaryLine: "Donner une raison concrète de revenir sans alourdir le service.",
        startingOffer: "3 passages → boisson signature",
        customerPromise: "Le client voit une progression visible, immédiate et légère.",
        triggerHint: "Rappel discret après 10 jours d'absence.",
        defaultAudit: { traffic: "steady", ticket: "small", frequency: "normal" },
        pass: {
          rewardLabel: "3 passages → boisson signature",
          notificationLabel: "Votre prochaine étape est proche",
          footerLabel: "CARDIN PASS",
          progressDots: 3,
          activeDots: 1,
        },
        impact: { captureRate: 0.06, revisitRate: 0.18, basketLift: 0.02, retentionLift: 0.02, confidenceLow: 0.84, confidenceHigh: 1.12 },
      }),
    ],
  },
  coiffeur: {
    merchantLabel: "Coiffeur",
    merchantLine: "Retour espacé, panier plus fort, cycle à raccourcir.",
    brandPunchline: "Rendre la prochaine visite visible avant que le cycle ne se perde.",
    auditBlocks: [
      {
        id: "traffic",
        label: "Rendez-vous / jour",
        help: "Le niveau de planning sur votre rythme habituel.",
        options: [
          { id: "light", label: "Sélectif", description: "agenda encore léger" },
          { id: "steady", label: "Posé", description: "agenda stable" },
          { id: "dense", label: "Soutenu", description: "beaucoup de retours à structurer" },
        ],
      },
      {
        id: "ticket",
        label: "Panier",
        help: "Le ticket moyen le plus fréquent en caisse.",
        options: [
          { id: "small", label: "Essentiel", description: "coupe seule" },
          { id: "standard", label: "Classique", description: "coupe + soin" },
          { id: "premium", label: "Signature", description: "service plus complet" },
        ],
      },
      {
        id: "frequency",
        label: "Cycle de retour",
        help: "À quel point le retour actuel est fragile.",
        options: [
          { id: "fragile", label: "Trop long", description: "beaucoup d'écart" },
          { id: "normal", label: "À cadrer", description: "cycle moyen" },
          { id: "strong", label: "Déjà suivi", description: "routine assez stable" },
        ],
      },
    ],
    featured: createScenario({
      id: "double-passage",
      title: "Double passage",
      description: "Deux visites rapprochées pour raccourcir le cycle sans casser le positionnement.",
      summaryLine: "Créer un second rendez-vous utile avant la perte d'habitude.",
      startingOffer: "2 passages en 6 semaines → soin signature",
      customerPromise: "Le client se projette plus vite dans la prochaine étape.",
      triggerHint: "Rappel à mi-cycle pour garder la dynamique.",
      defaultAudit: { traffic: "steady", ticket: "standard", frequency: "fragile" },
      pass: {
        rewardLabel: "2 passages en 6 semaines",
        notificationLabel: "Votre prochain rendez-vous compte déjà",
        footerLabel: "CARDIN PASS",
        progressDots: 5,
        activeDots: 2,
      },
      impact: { captureRate: 0.11, revisitRate: 0.22, basketLift: 0.03, retentionLift: 0.04, confidenceLow: 0.86, confidenceHigh: 1.17 },
    }),
    options: [
      createScenario({
        id: "chemin-rapide",
        title: "Chemin rapide",
        description: "Une trajectoire plus courte pour vos meilleurs profils.",
        summaryLine: "Raccourcir l'intervalle entre deux visites les plus rentables.",
        startingOffer: "5 visites → brushing privilège",
        customerPromise: "Le client voit un parcours premium, pas une promo générique.",
        triggerHint: "Message doux après 4 semaines d'absence.",
        defaultAudit: { traffic: "dense", ticket: "premium", frequency: "normal" },
        pass: {
          rewardLabel: "5 visites → brushing privilège",
          notificationLabel: "Votre progression premium continue",
          footerLabel: "CARDIN PASS",
          progressDots: 5,
          activeDots: 2,
        },
        impact: { captureRate: 0.12, revisitRate: 0.19, basketLift: 0.02, retentionLift: 0.038, confidenceLow: 0.85, confidenceHigh: 1.15 },
      }),
      createScenario({
        id: "moment-mensuel",
        title: "Moment mensuel",
        description: "Un soin ou une coupe signature installé comme rendez-vous.",
        summaryLine: "Donner une forme concrète à une visite premium récurrente.",
        startingOffer: "1 moment / mois pendant 3 mois → avantage soin",
        customerPromise: "Le client visualise un rituel et un statut.",
        triggerHint: "Annonce en début de mois pour garder le cap.",
        defaultAudit: { traffic: "light", ticket: "premium", frequency: "strong" },
        pass: {
          rewardLabel: "3 moments mensuels",
          notificationLabel: "Votre rituel du mois vous attend",
          footerLabel: "CARDIN PASS",
          progressDots: 3,
          activeDots: 1,
        },
        impact: { captureRate: 0.08, revisitRate: 0.17, basketLift: 0.09, retentionLift: 0.028, confidenceLow: 0.84, confidenceHigh: 1.17 },
      }),
      createScenario({
        id: "defi-retour",
        title: "Défi retour",
        description: "Reprendre contact avant que le cycle ne se rompe vraiment.",
        summaryLine: "Réactiver les clientes qui ont déjà glissé hors du bon tempo.",
        startingOffer: "Retour avant 30 jours → mini-soin",
        customerPromise: "Le client sent une relance utile, pas insistante.",
        triggerHint: "Relance après 30 jours sans rendez-vous.",
        defaultAudit: { traffic: "steady", ticket: "small", frequency: "fragile" },
        pass: {
          rewardLabel: "Retour avant 30 jours",
          notificationLabel: "Votre mini-soin est encore accessible",
          footerLabel: "CARDIN PASS",
          progressDots: 4,
          activeDots: 1,
        },
        impact: { captureRate: 0.09, revisitRate: 0.2, basketLift: 0.02, retentionLift: 0.03, confidenceLow: 0.83, confidenceHigh: 1.13 },
      }),
    ],
  },
  beaute: {
    merchantLabel: "Institut / Beauté",
    merchantLine: "Fréquence fragile et valeur élevée à protéger.",
    brandPunchline: "Stabiliser un rituel visible plutôt que subir des retours trop espacés.",
    auditBlocks: [
      {
        id: "traffic",
        label: "Séances / jour",
        help: "Le volume réel sur lequel vous voulez construire le retour.",
        options: [
          { id: "light", label: "Précieux", description: "quelques séances à fort enjeu" },
          { id: "steady", label: "Stable", description: "bonne base de clientèle" },
          { id: "dense", label: "Actif", description: "plusieurs séances à orchestrer" },
        ],
      },
      {
        id: "ticket",
        label: "Panier moyen",
        help: "Le niveau le plus fréquent sur vos soins cœur.",
        options: [
          { id: "small", label: "Entrée", description: "prestation courte" },
          { id: "standard", label: "Cœur de soin", description: "ticket principal" },
          { id: "premium", label: "Rituel", description: "ticket plus fort" },
        ],
      },
      {
        id: "frequency",
        label: "Régularité",
        help: "À quel point la cliente revient déjà naturellement.",
        options: [
          { id: "fragile", label: "Irrégulière", description: "gaps trop longs" },
          { id: "normal", label: "Rattrapable", description: "cycle présent mais instable" },
          { id: "strong", label: "Assez fidèle", description: "rituel déjà engagé" },
        ],
      },
    ],
    featured: createScenario({
      id: "rituel-stable",
      title: "Rituel périodique",
      description: "Un retour attendu entre deux séances fragiles.",
      summaryLine: "Installer un cap visible qui rend la prochaine séance plus naturelle.",
      startingOffer: "4 séances → avantage soin réservé",
      customerPromise: "La cliente comprend qu'elle entre dans un rythme, pas dans une promo.",
      triggerHint: "Notification douce selon l'intervalle idéal du soin.",
      defaultAudit: { traffic: "steady", ticket: "standard", frequency: "fragile" },
      pass: {
        rewardLabel: "4 séances → avantage réservé",
        notificationLabel: "Votre prochaine étape beauté approche",
        footerLabel: "CARDIN PASS",
        progressDots: 4,
        activeDots: 1,
      },
      impact: { captureRate: 0.1, revisitRate: 0.19, basketLift: 0.04, retentionLift: 0.035, confidenceLow: 0.85, confidenceHigh: 1.16 },
    }),
    options: [
      createScenario({
        id: "moment-exceptionnel",
        title: "Moment exceptionnel",
        description: "Un palier plus désirable pour créer un vrai rendez-vous.",
        summaryLine: "Faire exister un moment aspiré, rare mais compréhensible.",
        startingOffer: "3 séances → expérience signature",
        customerPromise: "La cliente se projette dans une récompense qui a de la tenue.",
        triggerHint: "Annonce du moment exceptionnel dès la première séance.",
        defaultAudit: { traffic: "light", ticket: "premium", frequency: "normal" },
        pass: {
          rewardLabel: "3 séances → expérience signature",
          notificationLabel: "Votre moment exceptionnel se rapproche",
          footerLabel: "CARDIN PASS",
          progressDots: 3,
          activeDots: 1,
        },
        impact: { captureRate: 0.08, revisitRate: 0.16, basketLift: 0.1, retentionLift: 0.026, confidenceLow: 0.84, confidenceHigh: 1.17 },
      }),
      createScenario({
        id: "acces-reserve",
        title: "Accès réservé",
        description: "Une récompense qui se mérite après un vrai engagement.",
        summaryLine: "Donner un statut visible à celles qui reviennent vraiment.",
        startingOffer: "5 passages → accès réservé / créneau prioritaire",
        customerPromise: "La cliente sent qu'elle gagne un privilège, pas juste une remise.",
        triggerHint: "Rappel avant ouverture du prochain créneau réservé.",
        defaultAudit: { traffic: "steady", ticket: "premium", frequency: "strong" },
        pass: {
          rewardLabel: "5 passages → accès réservé",
          notificationLabel: "Votre accès réservé se débloque bientôt",
          footerLabel: "CARDIN PASS",
          progressDots: 5,
          activeDots: 2,
        },
        impact: { captureRate: 0.07, revisitRate: 0.15, basketLift: 0.06, retentionLift: 0.024, confidenceLow: 0.84, confidenceHigh: 1.15 },
      }),
      createScenario({
        id: "defi-retour",
        title: "Défi retour",
        description: "Rattraper les clientes qui commencent à s'espacer.",
        summaryLine: "Remettre une date mentale avant que la cliente sorte du cycle.",
        startingOffer: "Retour avant 21 jours → bonus soin",
        customerPromise: "Le retour semble opportun et simple à comprendre.",
        triggerHint: "Relance au moment où la cliente commence à décrocher.",
        defaultAudit: { traffic: "dense", ticket: "small", frequency: "fragile" },
        pass: {
          rewardLabel: "Retour avant 21 jours",
          notificationLabel: "Votre bonus soin est encore disponible",
          footerLabel: "CARDIN PASS",
          progressDots: 4,
          activeDots: 1,
        },
        impact: { captureRate: 0.09, revisitRate: 0.18, basketLift: 0.02, retentionLift: 0.03, confidenceLow: 0.83, confidenceHigh: 1.13 },
      }),
    ],
  },
  boutique: {
    merchantLabel: "Boutique",
    merchantLine: "Passages irréguliers, envie de redonner une raison de revenir.",
    brandPunchline: "Faire repasser entre deux achats sans banaliser l'image de la boutique.",
    auditBlocks: [
      {
        id: "traffic",
        label: "Passage boutique",
        help: "Le nombre de visiteurs réels sur lesquels capitaliser.",
        options: [
          { id: "light", label: "Sélectif", description: "peu mais qualifié" },
          { id: "steady", label: "Régulier", description: "bon passage habituel" },
          { id: "dense", label: "Soutenu", description: "fort trafic à retravailler" },
        ],
      },
      {
        id: "ticket",
        label: "Panier moyen",
        help: "Le panier du quotidien, pas les meilleures ventes.",
        options: [
          { id: "small", label: "Essentiel", description: "achat simple" },
          { id: "standard", label: "Cœur de gamme", description: "panier principal" },
          { id: "premium", label: "Plus désiré", description: "ticket plus fort" },
        ],
      },
      {
        id: "frequency",
        label: "Raison de revenir",
        help: "La facilité à faire repasser la cliente entre deux achats.",
        options: [
          { id: "fragile", label: "À réveiller", description: "retour peu visible" },
          { id: "normal", label: "À installer", description: "retour possible" },
          { id: "strong", label: "Déjà présent", description: "certaines clientes reviennent déjà" },
        ],
      },
    ],
    featured: createScenario({
      id: "point-depart",
      title: "Point de départ",
      description: "Une raison simple de repasser entre deux achats.",
      summaryLine: "Créer un premier niveau de progression qui légitime un nouveau passage.",
      startingOffer: "4 achats → accès nouveauté ou avantage discret",
      customerPromise: "Le client voit qu'il y a un prochain cap à atteindre en boutique.",
      triggerHint: "Relance douce quand la progression s'endort.",
      defaultAudit: { traffic: "steady", ticket: "standard", frequency: "fragile" },
      pass: {
        rewardLabel: "4 achats → accès nouveauté",
        notificationLabel: "Votre prochain passage débloque un avantage",
        footerLabel: "CARDIN PASS",
        progressDots: 4,
        activeDots: 1,
      },
      impact: { captureRate: 0.06, revisitRate: 0.18, basketLift: 0.03, retentionLift: 0.022, confidenceLow: 0.84, confidenceHigh: 1.13 },
    }),
    options: [
      createScenario({
        id: "collection",
        title: "Rendez-vous collection",
        description: "Un moment boutique autour des nouveautés ou d'une capsule.",
        summaryLine: "Donner une raison concrète de repasser sur un moment choisi.",
        startingOffer: "2 venues collection → accès anticipé",
        customerPromise: "Le client ne revient pas pour une réduction, mais pour un moment.",
        triggerHint: "Invitation quelques jours avant l'arrivée de la capsule.",
        defaultAudit: { traffic: "light", ticket: "premium", frequency: "normal" },
        pass: {
          rewardLabel: "2 venues collection → accès anticipé",
          notificationLabel: "La prochaine capsule approche",
          footerLabel: "CARDIN PASS",
          progressDots: 2,
          activeDots: 1,
        },
        impact: { captureRate: 0.07, revisitRate: 0.15, basketLift: 0.07, retentionLift: 0.02, confidenceLow: 0.84, confidenceHigh: 1.16 },
      }),
      createScenario({
        id: "defi-court",
        title: "Défi court",
        description: "Resserrer le délai entre deux passages sans alourdir la promesse.",
        summaryLine: "Relancer vite avant que le client sorte de votre radar.",
        startingOffer: "2 retours en 20 jours → cadeau discret",
        customerPromise: "Le client comprend tout de suite ce qu'il faut faire.",
        triggerHint: "Message court après le premier achat.",
        defaultAudit: { traffic: "dense", ticket: "small", frequency: "fragile" },
        pass: {
          rewardLabel: "2 retours en 20 jours",
          notificationLabel: "Plus qu'un passage pour débloquer l'avantage",
          footerLabel: "CARDIN PASS",
          progressDots: 2,
          activeDots: 1,
        },
        impact: { captureRate: 0.07, revisitRate: 0.19, basketLift: 0.02, retentionLift: 0.024, confidenceLow: 0.83, confidenceHigh: 1.13 },
      }),
      createScenario({
        id: "moment-mensuel",
        title: "Moment mensuel",
        description: "Un temps fort visible dans le mois, sans banaliser l'image.",
        summaryLine: "Installer un rendez-vous boutique attendu et identifiable.",
        startingOffer: "1 passage / mois pendant 3 mois → invitation réservée",
        customerPromise: "Le client visualise une suite logique de visites, pas un one-shot.",
        triggerHint: "Invitation en début de mois avec le prochain cap.",
        defaultAudit: { traffic: "light", ticket: "premium", frequency: "strong" },
        pass: {
          rewardLabel: "3 moments mensuels → invitation réservée",
          notificationLabel: "Votre rendez-vous boutique du mois approche",
          footerLabel: "CARDIN PASS",
          progressDots: 3,
          activeDots: 1,
        },
        impact: { captureRate: 0.05, revisitRate: 0.16, basketLift: 0.08, retentionLift: 0.02, confidenceLow: 0.84, confidenceHigh: 1.17 },
      }),
    ],
  },
}

export function isMerchantProjectionType(value: string | null): value is MerchantProjectionType {
  return (
    value === "cafe" ||
    value === "bar" ||
    value === "restaurant" ||
    value === "coiffeur" ||
    value === "beaute" ||
    value === "boutique"
  )
}

export function getProjectionBundle(type: MerchantProjectionType): ProjectionBundle {
  return projectionByMerchant[type]
}
