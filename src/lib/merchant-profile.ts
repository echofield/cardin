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
    eyebrow: "Carte client",
    firstImpressionTitle: "Comment ça marche",
    ritualTitle: "Au passage",
    ritualSteps: ["Le client scanne.", "La carte apparaît et passe en attente.", "L'équipe valide le passage, puis gère l'avantage si besoin."],
    namePlaceholder: "Votre prénom",
    phonePlaceholder: "Téléphone (optionnel)",
    submitLabel: "Ajouter ma carte",
    submittingLabel: "Création…",
    createdTitle: "Votre carte est active.",
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
    pageEyebrow: "Votre carte client",
    invalidAccess: "Accès à la carte refusé. Ouvrez le lien complet depuis le QR ou rescanez depuis le lieu.",
    notFound: "Carte introuvable.",
    loading: "Chargement de votre carte…",
    signalLabel: "Ce qui se débloque",
    progressLabel: "Passages validés",
    activeRewardLabel: "Avantage en cours",
    summitLabel: "Récompense de saison",
    summitSubtitle: "Choisissez la récompense ou le privilège qui vous correspond.",
    inviteLabel: "Inviter quelqu'un",
    inviteEnabled: (remainingSlots: number, branchCapacity: number) => `Vous pouvez inviter (${remainingSlots} / ${branchCapacity} places restantes pour cette vague).`,
    inviteDisabled: "Invitation indisponible pour le moment.",
    invitePlaceholder: "Nom de la personne invitée",
    inviteAction: "Inviter",
    inviteNameRequired: "Nom requis pour inviter.",
    inviteCardMissing: "Carte introuvable.",
    inviteSuccess: (remainingSlots: number) => `Invitation créée. Places restantes : ${remainingSlots}.`,
    inviteError: "Invitation impossible pour le moment.",
    sharedUnlockTitle: "Déblocage collectif",
    sharedUnlockActive: "Déblocage collectif actif.",
    seasonSummary: (seasonNumber: number, summitTitle: string, daysRemaining: number) =>
      `Saison ${seasonNumber} — récompense ${summitTitle} — ${daysRemaining} jours restants`,
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
      no_active_reward: "Aucun avantage actif sur cette carte.",
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
    qrCounterTitle: "Présentoir récompense",
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
      dominoUnlocked: "Invitations ouvertes",
      diamond: "Diamond",
      summitReached: "Récompense atteinte",
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
    promise: "Une carte client qui fait revenir, rend la progression lisible et donne une vraie raison de revenir.",
    ritualPromise: "Le client scanne, apparaît en attente, puis l'équipe valide le passage.",
    scan: {
      ...baseProfile.scan,
      intro: "Créez votre carte en 10 secondes. Chaque passage réel validé vous rapproche d'un avantage.",
      firstImpression: [
        "Ici, le scan crée votre carte tout de suite.",
        "Chaque passage validé fait avancer votre progression.",
        "L'équipe confirme votre visite, puis gère l'avantage si nécessaire.",
      ],
      formIntro: "Un scan, une carte active, puis le lieu valide chaque passage réel pour faire monter votre progression.",
      createdBody: "Votre carte est active. Gardez-la à portée de main : chaque passage réel validé vous rapproche de votre avantage.",
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
    promise: "Faire revenir plus souvent, remplir les heures creuses et mener vers un vrai gain de saison.",
    ritualPromise: "Le client scanne au comptoir, l'équipe valide le passage, puis gère l'avantage au bon moment.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Rythme café",
      intro: "Ajoutez votre carte en 10 secondes. Chaque passage validé vous rapproche d'un café ou d'un petit-déjeuner offert.",
      firstImpression: [
        "Ce QR active votre carte de café en un geste.",
        "Chaque passage validé compte pour votre rythme de retour.",
        "Le comptoir confirme la visite, puis active l'avantage si besoin.",
      ],
      formIntro: "Le café suit vos retours réels, pas des clics. Vous scannez, le comptoir valide.",
      createdBody: "Votre carte est active. Le comptoir validera vos passages réels pour vous rapprocher de votre gain de saison.",
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
    promise: "Installer l'habitude du quartier et récompenser la régularité.",
    ritualPromise: "Le client scanne, passe en attente, puis l'équipe valide son vrai passage au comptoir.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Habitude quartier",
      intro: "Ajoutez votre carte en 10 secondes. Vos passages du quotidien vous rapprochent d'un vrai avantage.",
      firstImpression: [
        "Ce QR active votre carte de quartier immédiatement.",
        "Chaque passage validé nourrit l'habitude.",
        "L'équipe confirme la visite au comptoir, puis gère l'avantage si besoin.",
      ],
      formIntro: "Une carte pensée pour les retours réels du quotidien, validés sur place.",
      createdBody: "Votre carte est active. Chaque passage validé par l'équipe vous rapproche de votre avantage du quotidien.",
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
    promise: "Faire revenir au bon rythme et donner plus de valeur aux clientes régulières.",
    ritualPromise: "La cliente scanne, l'équipe valide le rendez-vous réalisé, puis gère l'avantage si nécessaire.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Rythme salon",
      intro: "Ajoutez votre carte en 10 secondes. Chaque visite validée vous rapproche d'un soin ou d'un privilège réservé.",
      firstImpression: [
        "Ce QR active votre carte de salon immédiatement.",
        "Chaque rendez-vous validé fait avancer votre progression.",
        "L'équipe confirme votre passage, puis gère l'avantage si besoin.",
      ],
      formIntro: "Le salon suit les visites réelles et la montée en reconnaissance, pas des points abstraits.",
      createdBody: "Votre carte est active. Le salon validera chaque visite réelle pour vous rapprocher de votre soin ou privilège.",
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
    promise: "Faire revenir les bonnes clientes et ouvrir un vrai privilège de saison.",
    ritualPromise: "La cliente scanne, passe en attente, puis l'équipe valide son passage réel en boutique.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Retour boutique",
      intro: "Ajoutez votre carte en 10 secondes. Vos passages validés peuvent ouvrir un accès privé ou un crédit saison.",
      firstImpression: [
        "Ce QR active votre carte de boutique immédiatement.",
        "Chaque passage validé garde votre progression vivante.",
        "La boutique confirme la visite, puis gère l'avantage si besoin.",
      ],
      formIntro: "Une carte pensée pour les retours réels et la relation avec la boutique.",
      createdBody: "Votre carte est active. La boutique validera vos passages réels pour vous rapprocher de votre accès privé ou crédit saison.",
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
    promise: "Faire revenir entre les occasions et conduire certaines tables vers une vraie récompense.",
    ritualPromise: "Le client scanne, la table passe en attente, puis l'équipe valide le passage réel.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Retour table",
      intro: "Ajoutez votre carte en 10 secondes. Vos retours validés peuvent débloquer un dîner ou une table privilège.",
      firstImpression: [
        "Ce QR active votre carte de restaurant immédiatement.",
        "Chaque table validée nourrit votre progression.",
        "L'équipe confirme la visite, puis gère l'avantage si besoin.",
      ],
      formIntro: "Le restaurant suit les retours réels et les invitations qui comptent.",
      createdBody: "Votre carte est active. Le restaurant validera chaque passage réel pour vous rapprocher d'un dîner ou d'une table privilège.",
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


