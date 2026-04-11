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
  unlockedBenefits: "Avantages pr�ts",
  traffic: "Fr�quentation",
  returningClients: "Clients revenus",
  progression: "Progression activ�e",
}

const baseProfile = {
  scan: {
    eyebrow: "Carte vivante",
    firstImpressionTitle: "En 3 secondes",
    ritualTitle: "Rituel en caisse",
    ritualSteps: ["Le client scanne.", "La carte appara�t et passe en attente.", "L'�quipe valide le passage, puis g�re l'avantage si besoin."],
    namePlaceholder: "Votre pr�nom",
    phonePlaceholder: "T�l�phone (optionnel)",
    submitLabel: "Ajouter ma carte",
    submittingLabel: "Cr�ation����",
    createdTitle: "Votre carte est pr�te.",
    openCardLabel: "Ouvrir ma carte sur le t�l�phone",
    appleWalletLabel: "Ajouter � Apple Wallet",
    googleWalletLabel: "Ajouter � Google Wallet",
    sharedUnlockTitle: "D�blocage collectif",
    sharedUnlockActive: "D�blocage collectif actif.",
    notFound: "Commerce introuvable. V�rifiez le QR code utilis�.",
    backHome: "Retour � l'accueil",
    loading: "Chargement de la carte����",
    createError: "Impossible de cr�er votre carte pour le moment.",
  },
  card: {
    pageEyebrow: "Votre carte de fid�lit�",
    invalidAccess: "Acc�s � la carte refus�. Ouvrez le lien complet depuis le QR ou rescanez depuis le lieu.",
    notFound: "Carte introuvable.",
    loading: "Chargement de votre carte����",
    signalLabel: "Signal du moment",
    progressLabel: "Progression actuelle",
    activeRewardLabel: "Avantage activ�",
    summitLabel: "Sommet atteint",
    summitSubtitle: "Choisissez l'avantage qui vous correspond.",
    inviteLabel: "Domino",
    inviteEnabled: (remainingSlots: number, branchCapacity: number) => `Vous pouvez inviter (${remainingSlots} / ${branchCapacity} places restantes).`,
    inviteDisabled: "Invitation verrouill�e pour le moment.",
    invitePlaceholder: "Nom de la personne invit�e",
    inviteAction: "Inviter",
    inviteNameRequired: "Nom requis pour inviter.",
    inviteCardMissing: "Carte introuvable.",
    inviteSuccess: (remainingSlots: number) => `Invitation cr��e. Places restantes : ${remainingSlots}.`,
    inviteError: "Invitation impossible pour le moment.",
    sharedUnlockTitle: "D�blocage collectif",
    sharedUnlockActive: "D�blocage collectif actif.",
    seasonSummary: (seasonNumber: number, summitTitle: string, daysRemaining: number) => `Saison ${seasonNumber} �� sommet ${summitTitle} �� ${daysRemaining} jours restants`,
    createAnotherLabel: "Cr�er une autre carte",
    brandLinkLabel: "Site Cardin",
    summitPickError: "Choix impossible pour le moment.",
    summitPickNetworkError: "R�seau indisponible.",
    status: {
      active: "Carte active",
      rewardReady: "Avantage disponible",
      redeemed: "Avantage utilis�",
    },
  },
  staff: {
    eyebrow: "Validation",
    title: "Client en attente",
    subtitle: "Le client ne valide pas lui-m�me : vous confirmez le passage dans le lieu.",
    loading: "Chargement����",
    pendingLabel: "Pr�sence signal�e",
    pendingSincePrefix: "Depuis",
    activeRewardLabel: "Avantage actif",
    noPending: "Aucun client en attente de validation pour le moment.",
    lastValidatedLabel: "Dernier passage valid�",
    lastValidatedBody: "Le client n'est plus en attente : vous pouvez encore enregistrer une utilisation d'avantage si besoin.",
    validateAction: "Valider le passage",
    validateLoading: "Validation����",
    validateSuccess: "Passage valid�, la carte du client se met � jour.",
    validateErrors: {
      no_pending_client: "Aucun client en cours.",
      session_required: "La validation doit partir d'un client en attente.",
      session_not_found: "Session introuvable ou d�j� termin�e.",
      session_already_validated: "Ce passage a d�j� �t� valid�.",
      cooldown_active: "Cette carte est encore dans sa fen�tre courte entre deux validations.",
      network: "R�seau indisponible.",
      fallback: "Validation impossible pour le moment.",
    },
    consumeAction: "Utiliser l'avantage",
    consumeLoading: "Enregistrement����",
    consumeSuccess: (usageRemaining?: number | null) =>
      typeof usageRemaining === "number" ? `Utilisation enregistr�e. Reste : ${usageRemaining}.` : "Utilisation enregistr�e.",
    consumeErrors: {
      no_uses_remaining: "Plus d'utilisation disponible sur cet avantage.",
      no_active_reward: "Aucun avantage sommet actif sur cette carte.",
      no_recent_validated_session: "Validez d'abord un passage pour ce client.",
      network: "R�seau indisponible.",
      fallback: "Utilisation impossible pour le moment.",
    },
    cooldownNote: "Fen�tre courte entre deux validations sur une m�me carte pour �viter les doublons.",
    dashboardLinkLabel: "Tableau marchand",
    brandLinkLabel: "Cardin",
  },
  owner: {
    eyebrow: "Tableau marchand",
    summaryTitle: "Lecture du jour",
    summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
      `Vous avez enregistr� ${totalVisits} passages, ${repeatClients} clients sont revenus et ${rewardReadyCards} avantages sont pr�ts � �tre utilis�s.`,
    metrics: metricLabels,
    seasonTitle: "Dynamique de saison",
    seasonInactive: "Aucune saison active pour le moment.",
    seasonStartAction: "Lancer la saison",
    seasonCloseAction: "Cl�turer la saison",
    seasonDaysRemainingLabel: "Jours restants",
    seasonEndLabel: "Fin",
    winnerPoolLabel: "Winner pool",
    qrTitle: "QR � afficher",
    qrDownloadLabel: "T�l�charger le QR",
    qrCopyLabel: "Copier le lien de scan",
    qrCounterTitle: "Pr�sentoir du sommet",
    qrCounterBody: "Affichage recommand� au comptoir avec le QR actif.",
    validationTitle: "Rituel �quipe",
    validationBody: "Ouvrez cette page sur l'iPad ou le t�l�phone du staff : un clic valide le passage du client pr�sent.",
    validationAction: "Valider un passage",
    settingsTitle: "Cadre du parcours",
    mainObjectiveLabel: "Objectif principal",
    midpointLabel: "Milieu de parcours",
    collectiveUnlockTitle: "D�blocage collectif",
    collectiveUnlockDisabled: "D�blocage collectif non actif.",
    collectiveUnlockStateActive: "actif",
    collectiveUnlockStateTracking: "en suivi",
    trackedClientsTitle: "Clients suivis",
    trackedClientsEmpty: "Aucun client encore. Lancez le QR en caisse.",
    validationOnlyHint: "La progression se valide uniquement depuis la page staff, jamais depuis cette liste.",
    scanLinkPrompt: "Copiez ce lien :",
    scanLinkFallbackPrompt: "Copiez ce lien :",
    signOutLabel: "Se d�connecter",
    loading: "Chargement����",
    notFound: "Commerce introuvable.",
    seasonMetricLabels: {
      dominoUnlocked: "Domino ouverts",
      diamond: "Diamond",
      summitReached: "Sommet atteint",
      invitations: "Invitations",
      activatedInvitations: "Invitations activ�es",
      activationRate: "Taux d'activation",
      stepLabel: "�0tape",
      stateLabel: "�0tat",
    },
  },
} as const

const PROFILES: Record<MerchantProfileId, MerchantProfile> = {
  generic: {
    id: "generic",
    businessTypeLabel: "Commerce",
    promise: "Une carte vivante qui relance la fr�quentation, clarifie la progression et donne une raison de revenir.",
    ritualPromise: "Le client scanne, appara�t en attente, puis l'�quipe valide le passage.",
    scan: {
      ...baseProfile.scan,
      intro: "Activez votre carte de fid�lit� en 10 secondes.",
      firstImpression: [
        "Ici, le scan cr�e votre carte tout de suite.",
        "Chaque passage valid� fait avancer votre progression.",
        "L'�quipe confirme votre visite, puis g�re l'avantage si n�cessaire.",
      ],
      formIntro: "Un scan, une carte active, puis le lieu valide chaque passage r�el.",
      createdBody: "Votre carte est active. Gardez-la � port�e de main : le lieu validera chaque passage r�el.",
    },
    card: { ...baseProfile.card },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Fr�quentation, retour client et progression visible sans complexit�.",
    },
  },
  cafe: {
    id: "cafe",
    businessTypeLabel: "Caf�",
    promise: "Relancer les heures creuses et installer un vrai rythme de retour.",
    ritualPromise: "Le client scanne au comptoir, l'�quipe valide le passage, puis g�re l'avantage au bon moment.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Rythme caf�",
      intro: "Ajoutez votre carte en 10 secondes et revenez au bon moment.",
      firstImpression: [
        "Ce QR active votre carte de caf� en un geste.",
        "Chaque passage valid� compte pour votre rythme de retour.",
        "Le comptoir confirme la visite, puis active l'avantage si besoin.",
      ],
      formIntro: "Le caf� suit vos retours r�els, pas des clics. Vous scannez, le comptoir valide.",
      createdBody: "Votre carte est pr�te. Le comptoir validera vos passages r�els pour faire avancer votre rythme.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte caf�" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Fr�quentation, r�currence et heures creuses relanc�es.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `Le flux tient : ${totalVisits} passages valid�s, ${repeatClients} clients revenus et ${rewardReadyCards} avantages pr�ts au comptoir.`,
    },
  },
  boulangerie: {
    id: "boulangerie",
    businessTypeLabel: "Boulangerie",
    promise: "Installer l'habitude et garder le quartier dans votre rythme quotidien.",
    ritualPromise: "Le client scanne, passe en attente, puis l'�quipe valide son vrai passage au comptoir.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Habitude quartier",
      intro: "Ajoutez votre carte en 10 secondes et gardez le fil de vos passages du quotidien.",
      firstImpression: [
        "Ce QR active votre carte de quartier imm�diatement.",
        "Chaque passage valid� nourrit l'habitude.",
        "L'�quipe confirme la visite au comptoir, puis g�re l'avantage si besoin.",
      ],
      formIntro: "Une carte pens�e pour les retours r�els du quotidien, valid�s sur place.",
      createdBody: "Votre carte est pr�te. Chaque passage valid� par l'�quipe renforce votre rythme de retour.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte boulangerie" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Habitude, r�currence et fid�lit� de quartier.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `L'habitude s'installe : ${totalVisits} passages valid�s, ${repeatClients} clients revenus et ${rewardReadyCards} avantages pr�ts en boutique.`,
    },
  },
  salon: {
    id: "salon",
    businessTypeLabel: "Salon",
    promise: "Installer un rythme de visite et reconna�tre les clientes qui montent en valeur.",
    ritualPromise: "La cliente scanne, l'�quipe valide le rendez-vous r�alis�, puis g�re l'avantage si n�cessaire.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Rythme salon",
      intro: "Ajoutez votre carte en 10 secondes et gardez le rythme de vos visites.",
      firstImpression: [
        "Ce QR active votre carte de salon imm�diatement.",
        "Chaque rendez-vous valid� fait avancer votre progression.",
        "L'�quipe confirme votre passage, puis g�re l'avantage si besoin.",
      ],
      formIntro: "Le salon suit les visites r�elles et la mont�e en reconnaissance, pas des points abstraits.",
      createdBody: "Votre carte est pr�te. Le salon validera chaque visite r�elle pour faire monter votre progression.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte salon" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Rythme de visite, retour client et reconnaissance premium.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `Le rythme tient : ${totalVisits} visites valid�es, ${repeatClients} clientes revenues et ${rewardReadyCards} avantages pr�ts � �tre activ�s.`,
    },
  },
  boutique: {
    id: "boutique",
    businessTypeLabel: "Boutique",
    promise: "Faire revenir les bonnes clientes et donner une vraie identit� � la relation.",
    ritualPromise: "La cliente scanne, passe en attente, puis l'�quipe valide son passage r�el en boutique.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Retour boutique",
      intro: "Ajoutez votre carte en 10 secondes et gardez le lien avec la boutique.",
      firstImpression: [
        "Ce QR active votre carte de boutique imm�diatement.",
        "Chaque passage valid� garde votre progression vivante.",
        "La boutique confirme la visite, puis g�re l'avantage si besoin.",
      ],
      formIntro: "Une carte pens�e pour les retours r�els et la relation avec la boutique.",
      createdBody: "Votre carte est pr�te. La boutique validera vos passages r�els pour garder votre progression active.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte boutique" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "R�currence, identit� client et retours choisis.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `La relation se renforce : ${totalVisits} passages valid�s, ${repeatClients} clientes revenues et ${rewardReadyCards} avantages pr�ts � �tre propos�s.`,
    },
  },
  restaurant: {
    id: "restaurant",
    businessTypeLabel: "Restaurant",
    promise: "Faire revenir entre les services et garder la m�moire des bonnes tables.",
    ritualPromise: "Le client scanne, la table passe en attente, puis l'�quipe valide le passage r�el.",
    scan: {
      ...baseProfile.scan,
      eyebrow: "Retour table",
      intro: "Ajoutez votre carte en 10 secondes et gardez le rythme de vos retours � table.",
      firstImpression: [
        "Ce QR active votre carte de restaurant imm�diatement.",
        "Chaque table valid�e nourrit votre progression.",
        "L'�quipe confirme la visite, puis g�re l'avantage si besoin.",
      ],
      formIntro: "Le restaurant suit les retours r�els et les invitations qui comptent.",
      createdBody: "Votre carte est pr�te. Le restaurant validera chaque passage r�el pour garder la table dans votre rythme.",
    },
    card: { ...baseProfile.card, pageEyebrow: "Votre carte restaurant" },
    staff: { ...baseProfile.staff },
    owner: {
      ...baseProfile.owner,
      subtitle: "Retour client, m�moire des tables et r�currence entre les services.",
      summaryNarrative: ({ totalVisits, repeatClients, rewardReadyCards }: { totalVisits: number; repeatClients: number; rewardReadyCards: number }) =>
        `La salle se retient : ${totalVisits} passages valid�s, ${repeatClients} clients revenus et ${rewardReadyCards} avantages pr�ts � �tre servis.`,
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
