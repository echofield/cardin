import type { LandingWorldId } from "@/lib/landing-content"

export type MerchantProfileId = "generic" | "cafe" | "boulangerie" | "salon" | "boutique" | "restaurant"

type MetricLabels = {
  trackedClients: string
  unlockedBenefits: string
  traffic: string
  returningClients: string
  progression: string
}

type MerchantProfile = {
  id: MerchantProfileId
  businessTypeLabel: string
  promise: string
  ritualPromise: string
  scan: {
    eyebrow: string
    intro: string
    firstImpressionTitle: string
    firstImpression: readonly [string, string, string]
    ritualTitle: string
    ritualSteps: readonly [string, string, string]
    formIntro: string
    namePlaceholder: string
    phonePlaceholder: string
    submitLabel: string
    submittingLabel: string
    createdTitle: string
    createdBody: string
    openCardLabel: string
    appleWalletLabel: string
    googleWalletLabel: string
    sharedUnlockTitle: string
    sharedUnlockActive: string
    notFound: string
    backHome: string
    loading: string
    createError: string
  }
  card: {
    pageEyebrow: string
    invalidAccess: string
    notFound: string
    loading: string
    signalLabel: string
    progressLabel: string
    activeRewardLabel: string
    summitLabel: string
    summitSubtitle: string
    inviteLabel: string
    inviteEnabled: (remainingSlots: number, branchCapacity: number) => string
    inviteDisabled: string
    invitePlaceholder: string
    inviteAction: string
    inviteNameRequired: string
    inviteCardMissing: string
    inviteSuccess: (remainingSlots: number) => string
    inviteError: string
    sharedUnlockTitle: string
    sharedUnlockActive: string
    seasonSummary: (seasonNumber: number, summitTitle: string, daysRemaining: number) => string
    createAnotherLabel: string
    brandLinkLabel: string
    summitPickError: string
    summitPickNetworkError: string
    status: {
      active: string
      rewardReady: string
      redeemed: string
    }
  }
  staff: {
    eyebrow: string
    title: string
    subtitle: string
    loading: string
    pendingLabel: string
    pendingSincePrefix: string
    activeRewardLabel: string
    noPending: string
    lastValidatedLabel: string
    lastValidatedBody: string
    validateAction: string
    validateLoading: string
    validateSuccess: string
    validateErrors: {
      no_pending_client: string
      session_required: string
      session_not_found: string
      session_already_validated: string
      cooldown_active: string
      network: string
      fallback: string
    }
    consumeAction: string
    consumeLoading: string
    consumeSuccess: (usageRemaining?: number | null) => string
    consumeErrors: {
      no_uses_remaining: string
      no_active_reward: string
      no_recent_validated_session: string
      network: string
      fallback: string
    }
    cooldownNote: string
    dashboardLinkLabel: string
    brandLinkLabel: string
  }
  owner: {
    eyebrow: string
    subtitle: string
    summaryTitle: string
    summaryNarrative: (metrics: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) => string
    metrics: MetricLabels
    seasonTitle: string
    seasonInactive: string
    seasonStartAction: string
    seasonCloseAction: string
    seasonDaysRemainingLabel: string
    seasonEndLabel: string
    winnerPoolLabel: string
    qrTitle: string
    qrDownloadLabel: string
    qrCopyLabel: string
    qrCounterTitle: string
    qrCounterBody: string
    validationTitle: string
    validationBody: string
    validationAction: string
    settingsTitle: string
    mainObjectiveLabel: string
    midpointLabel: string
    collectiveUnlockTitle: string
    collectiveUnlockDisabled: string
    collectiveUnlockStateActive: string
    collectiveUnlockStateTracking: string
    trackedClientsTitle: string
    trackedClientsEmpty: string
    validationOnlyHint: string
    scanLinkPrompt: string
    scanLinkFallbackPrompt: string
    signOutLabel: string
    loading: string
    notFound: string
    seasonMetricLabels: {
      dominoUnlocked: string
      diamond: string
      summitReached: string
      invitations: string
      activatedInvitations: string
      activationRate: string
      stepLabel: string
      stateLabel: string
    }
  }
}

const metricLabels: MetricLabels = {
  trackedClients: "Clients suivis",
  unlockedBenefits: "Avantages prêts",
  traffic: "Fréquentation",
  returningClients: "Clients revenus",
  progression: "Progression activée",
}

const baseProfile = {
  scan: {
    eyebrow: "Carte vivante",
    firstImpressionTitle: "En 3 secondes",
    ritualTitle: "Rituel en caisse",
    ritualSteps: ["Le client scanne.", "La carte apparaît et passe en attente.", "L'équipe valide le passage, puis gère l'avantage si besoin."],
    namePlaceholder: "Votre prénom",
    phonePlaceholder: "Téléphone (optionnel)",
    submitLabel: "Ajouter ma carte",
    submittingLabel: "Création…",
    createdTitle: "Votre carte est prête.",
    openCardLabel: "Ouvrir ma carte sur le téléphone",
    appleWalletLabel: "Ajouter à Apple Wallet",
    googleWalletLabel: "Ajouter à Google Wallet",
    sharedUnlockTitle: "Déblocage collectif",
    sharedUnlockActive: "Déblocage collectif actif.",
    notFound: "Commerce introuvable. Vérifiez le QR code utilisé.",
    backHome: "Retour à l'accueil",
    loading: "Chargement de la carte…",
    createError: "Impossible de créer votre carte pour le moment.",
  },
  card: {
    pageEyebrow: "Votre carte de fidélité",
    invalidAccess: "Accès à la carte refusé. Ouvrez le lien complet depuis le QR ou rescanez depuis le lieu.",
    notFound: "Carte introuvable.",
    loading: "Chargement de votre carte…",
    signalLabel: "Signal du moment",
    progressLabel: "Progression actuelle",
    activeRewardLabel: "Avantage activé",
    summitLabel: "Sommet atteint",
    summitSubtitle: "Choisissez l'avantage qui vous correspond.",
    inviteLabel: "Domino",
    inviteEnabled: (remainingSlots: number, branchCapacity: number) => `Vous pouvez inviter (${remainingSlots} / ${branchCapacity} places restantes).`,
    inviteDisabled: "Invitation verrouillée pour le moment.",
    invitePlaceholder: "Nom de la personne invitée",
    inviteAction: "Inviter",
    inviteNameRequired: "Nom requis pour inviter.",
    inviteCardMissing: "Carte introuvable.",
    inviteSuccess: (remainingSlots: number) => `Invitation créée. Places restantes : ${remainingSlots}.`,
    inviteError: "Invitation impossible pour le moment.",
    sharedUnlockTitle: "Déblocage collectif",
    sharedUnlockActive: "Déblocage collectif actif.",
    seasonSummary: (seasonNumber: number, summitTitle: string, daysRemaining: number) =>
      `Saison ${seasonNumber} — sommet ${summitTitle} — ${daysRemaining} jours restants`,
    createAnotherLabel: "Créer une autre carte",
    brandLinkLabel: "Site Cardin",
    summitPickError: "Choix impossible pour le moment.",
    summitPickNetworkError: "Réseau indisponible.",
    status: {
      active: "Carte active",
      rewardReady: "Avantage disponible",
      redeemed: "Avantage utilisé",
    },
  },
  staff: {
    eyebrow: "Validation",
    title: "Client en attente",
    subtitle: "Le client ne valide pas lui-même : vous confirmez le passage dans le lieu.",
    loading: "Chargement…",
    pendingLabel: "Présence signalée",
    pendingSincePrefix: "Depuis",
    activeRewardLabel: "Avantage actif",
    noPending: "Aucun client en attente de validation pour le moment.",
    lastValidatedLabel: "Dernier passage validé",
    lastValidatedBody: "Le client n'est plus en attente : vous pouvez encore enregistrer une utilisation d'avantage si besoin.",
    validateAction: "Valider le passage",
    validateLoading: "Validation…",
    validateSuccess: "Passage validé, la carte du client se met à jour.",
    validateErrors: {
      no_pending_client: "Aucun client en cours.",
      session_required: "La validation doit partir d'un client en attente.",
      session_not_found: "Session introuvable ou déjà terminée.",
      session_already_validated: "Ce passage a déjà été validé.",
      cooldown_active: "Cette carte est encore dans sa fenêtre courte entre deux validations.",
      network: "Réseau indisponible.",
      fallback: "Validation impossible pour le moment.",
    },
    consumeAction: "Utiliser l'avantage",
    consumeLoading: "Enregistrement…",
    consumeSuccess: (usageRemaining?: number | null) =>
      typeof usageRemaining === "number" ? `Utilisation enregistrée. Reste : ${usageRemaining}.` : "Utilisation enregistrée.",
    consumeErrors: {
      no_uses_remaining: "Plus d'utilisation disponible sur cet avantage.",
      no_active_reward: "Aucun avantage sommet actif sur cette carte.",
      no_recent_validated_session: "Validez d'abord un passage pour ce client.",
      network: "Réseau indisponible.",
      fallback: "Utilisation impossible pour le moment.",
    },
    cooldownNote: "Fenêtre courte entre deux validations sur une même carte pour éviter les doublons.",
    dashboardLinkLabel: "Tableau marchand",
    brandLinkLabel: "Cardin",
  },
  owner: {
    eyebrow: "Tableau marchand",
    summaryTitle: "Lecture du jour",
    summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
      `Vous avez enregistré ${totalVisits} passages, ${repeatClients} clients sont revenus et ${rewardReadyCards} avantages sont prêts à être utilisés.`,
    metrics: metricLabels,
    seasonTitle: "Dynamique de saison",
    seasonInactive: "Aucune saison active pour le moment.",
    seasonStartAction: "Lancer la saison",
    seasonCloseAction: "Clôturer la saison",
    seasonDaysRemainingLabel: "Jours restants",
    seasonEndLabel: "Fin",
    winnerPoolLabel: "Winner pool",
    qrTitle: "QR à afficher",
    qrDownloadLabel: "Télécharger le QR",
    qrCopyLabel: "Copier le lien de scan",
    qrCounterTitle: "Présentoir du sommet",
    qrCounterBody: "Affichage recommandé au comptoir avec le QR actif.",
    validationTitle: "Rituel équipe",
    validationBody: "Ouvrez cette page sur l'iPad ou le téléphone du staff : un clic valide le passage du client présent.",
    validationAction: "Valider un passage",
    settingsTitle: "Cadre du parcours",
    mainObjectiveLabel: "Objectif principal",
    midpointLabel: "Milieu de parcours",
    collectiveUnlockTitle: "Déblocage collectif",
    collectiveUnlockDisabled: "Déblocage collectif non actif.",
    collectiveUnlockStateActive: "actif",
    collectiveUnlockStateTracking: "en suivi",
    trackedClientsTitle: "Clients suivis",
    trackedClientsEmpty: "Aucun client encore. Lancez le QR en caisse.",
    validationOnlyHint: "La progression se valide uniquement depuis la page staff, jamais depuis cette liste.",
    scanLinkPrompt: "Copiez ce lien :",
    scanLinkFallbackPrompt: "Copiez ce lien :",
    signOutLabel: "Se déconnecter",
    loading: "Chargement…",
    notFound: "Commerce introuvable.",
    seasonMetricLabels: {
      dominoUnlocked: "Domino ouverts",
      diamond: "Diamond",
      summitReached: "Sommet atteint",
      invitations: "Invitations",
      activatedInvitations: "Invitations activées",
      activationRate: "Taux d'activation",
      stepLabel: "Étape",
      stateLabel: "État",
    },
  },
} as const

const PROFILES: Record<MerchantProfileId, MerchantProfile> = {
  generic: {
    id: "generic",
    businessTypeLabel: "Commerce",
    promise: "Une carte vivante qui relance la fréquentation, clarifie la progression et donne une raison de revenir.",
    ritualPromise: "Le client scanne, apparaît en attente, puis l'équipe valide le passage.",
    scan: {
      ...baseProfile.scan,
      intro: "Activez votre carte de fidélité en 10 secondes.",
      firstImpression: [
        "Ici, le scan crée votre carte tout de suite.",
        "Chaque passage validé fait avancer votre progression.",
        "L'équipe confirme votre visite, puis gère l'avantage si nécessaire.",
      ],
      formIntro: "Un scan, une carte active, puis le lieu valide chaque passage réel.",
      createdBody: "Votre carte est active. Gardez-la à portée de main : le lieu validera chaque passage réel.",
    },
    card: { ...baseProfile.card },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Fréquentation, retour client et progression visible sans complexité.",
    },
  },
  cafe: {
    id: "cafe",
    businessTypeLabel: "Café",
    promise: "Relancer les heures creuses et installer un vrai rythme de retour.",
    ritualPromise: "Le client scanne au comptoir, l'équipe valide le passage, puis gère l'avantage au bon moment.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Rythme café",
      intro: "Ajoutez votre carte en 10 secondes et revenez au bon moment.",
      firstImpression: [
        "Ce QR active votre carte de café en un geste.",
        "Chaque passage validé compte pour votre rythme de retour.",
        "Le comptoir confirme la visite, puis active l'avantage si besoin.",
      ],
      formIntro: "Le café suit vos retours réels, pas des clics. Vous scannez, le comptoir valide.",
      createdBody: "Votre carte est prête. Le comptoir validera vos passages réels pour faire avancer votre rythme.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte café" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Fréquentation, récurrence et heures creuses relancées.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `Le flux tient : ${totalVisits} passages validés, ${repeatClients} clients revenus et ${rewardReadyCards} avantages prêts au comptoir.`,
    },
  },
  boulangerie: {
    id: "boulangerie",
    businessTypeLabel: "Boulangerie",
    promise: "Installer l'habitude et garder le quartier dans votre rythme quotidien.",
    ritualPromise: "Le client scanne, passe en attente, puis l'équipe valide son vrai passage au comptoir.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Habitude quartier",
      intro: "Ajoutez votre carte en 10 secondes et gardez le fil de vos passages du quotidien.",
      firstImpression: [
        "Ce QR active votre carte de quartier immédiatement.",
        "Chaque passage validé nourrit l'habitude.",
        "L'équipe confirme la visite au comptoir, puis gère l'avantage si besoin.",
      ],
      formIntro: "Une carte pensée pour les retours réels du quotidien, validés sur place.",
      createdBody: "Votre carte est prête. Chaque passage validé par l'équipe renforce votre rythme de retour.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte boulangerie" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Habitude, récurrence et fidélité de quartier.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `L'habitude s'installe : ${totalVisits} passages validés, ${repeatClients} clients revenus et ${rewardReadyCards} avantages prêts en boutique.`,
    },
  },
  salon: {
    id: "salon",
    businessTypeLabel: "Salon",
    promise: "Installer un rythme de visite et reconnaître les clientes qui montent en valeur.",
    ritualPromise: "La cliente scanne, l'équipe valide le rendez-vous réalisé, puis gère l'avantage si nécessaire.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Rythme salon",
      intro: "Ajoutez votre carte en 10 secondes et gardez le rythme de vos visites.",
      firstImpression: [
        "Ce QR active votre carte de salon immédiatement.",
        "Chaque rendez-vous validé fait avancer votre progression.",
        "L'équipe confirme votre passage, puis gère l'avantage si besoin.",
      ],
      formIntro: "Le salon suit les visites réelles et la montée en reconnaissance, pas des points abstraits.",
      createdBody: "Votre carte est prête. Le salon validera chaque visite réelle pour faire monter votre progression.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte salon" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Rythme de visite, retour client et reconnaissance premium.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `Le rythme tient : ${totalVisits} visites validées, ${repeatClients} clientes revenues et ${rewardReadyCards} avantages prêts à être activés.`,
    },
  },
  boutique: {
    id: "boutique",
    businessTypeLabel: "Boutique",
    promise: "Faire revenir les bonnes clientes et donner une vraie identité à la relation.",
    ritualPromise: "La cliente scanne, passe en attente, puis l'équipe valide son passage réel en boutique.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Retour boutique",
      intro: "Ajoutez votre carte en 10 secondes et gardez le lien avec la boutique.",
      firstImpression: [
        "Ce QR active votre carte de boutique immédiatement.",
        "Chaque passage validé garde votre progression vivante.",
        "La boutique confirme la visite, puis gère l'avantage si besoin.",
      ],
      formIntro: "Une carte pensée pour les retours réels et la relation avec la boutique.",
      createdBody: "Votre carte est prête. La boutique validera vos passages réels pour garder votre progression active.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte boutique" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Récurrence, identité client et retours choisis.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `La relation se renforce : ${totalVisits} passages validés, ${repeatClients} clientes revenues et ${rewardReadyCards} avantages prêts à être proposés.`,
    },
  },
  restaurant: {
    id: "restaurant",
    businessTypeLabel: "Restaurant",
    promise: "Faire revenir entre les services et garder la mémoire des bonnes tables.",
    ritualPromise: "Le client scanne, la table passe en attente, puis l'équipe valide le passage réel.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Retour table",
      intro: "Ajoutez votre carte en 10 secondes et gardez le rythme de vos retours à table.",
      firstImpression: [
        "Ce QR active votre carte de restaurant immédiatement.",
        "Chaque table validée nourrit votre progression.",
        "L'équipe confirme la visite, puis gère l'avantage si besoin.",
      ],
      formIntro: "Le restaurant suit les retours réels et les invitations qui comptent.",
      createdBody: "Votre carte est prête. Le restaurant validera chaque passage réel pour garder la table dans votre rythme.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte restaurant" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Retour client, mémoire des tables et récurrence entre les services.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `La salle se retient : ${totalVisits} passages validés, ${repeatClients} clients revenus et ${rewardReadyCards} avantages prêts à être servis.`,
    },
  },
}

export function normalizeMerchantProfileId(raw: string | null | undefined): MerchantProfileId {
  const value = (raw ?? "").trim().toLowerCase()

  switch (value) {
    case "cafe":
      return "cafe"
    case "restaurant":
      return "restaurant"
    case "bar":
      return "cafe"
    case "beaute":
    case "salon":
      return "salon"
    case "boutique":
      return "boutique"
    case "boulangerie":
      return "boulangerie"
    default:
      return "generic"
  }
}

export function getMerchantProfile(profileId: MerchantProfileId): MerchantProfile {
  return PROFILES[profileId] ?? PROFILES.generic
}

export function getMerchantProfileFromRaw(raw: string | null | undefined): MerchantProfile {
  return getMerchantProfile(normalizeMerchantProfileId(raw))
}

export function getLandingWorldForProfile(profileId: MerchantProfileId): LandingWorldId {
  switch (profileId) {
    case "restaurant":
      return "restaurant"
    case "salon":
      return "beaute"
    case "boutique":
      return "boutique"
    case "cafe":
    case "boulangerie":
    case "generic":
    default:
      return "cafe"
  }
}
