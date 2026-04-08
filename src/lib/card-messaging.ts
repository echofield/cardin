export type CardPrimaryMessage = {
  kind: "collective" | "comeback" | "domino" | "progress" | "summit" | "weak_day"
  title: string
  body: string
}

type BuildCardPrimaryMessageInput = {
  currentStep: number | null
  directInvitationsActivated: number
  inviteEnabled: boolean
  inviteRemainingSlots: number
  lastVisitAt: string | null
  seasonDaysRemaining: number | null
  sharedUnlockStatus: "active" | "disabled" | "tracking" | null
  statusName: string | null
  summitReached: boolean
}

function getDaysSince(dateString: string | null): number | null {
  if (!dateString) {
    return null
  }

  const timestamp = new Date(dateString).getTime()
  if (Number.isNaN(timestamp)) {
    return null
  }

  const elapsed = Date.now() - timestamp
  return Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)))
}

export function buildCardPrimaryMessage(input: BuildCardPrimaryMessageInput): CardPrimaryMessage {
  const daysSinceVisit = getDaysSince(input.lastVisitAt)
  const weekday = new Date().getDay()

  if (input.sharedUnlockStatus === "active") {
    return {
      kind: "collective",
      title: "Offre collective active",
      body: "Le commerce a debloque une offre en ce moment. Passez pendant la fenetre active.",
    }
  }

  if (input.summitReached) {
    return {
      kind: "summit",
      title: "Sommet atteint",
      body: "Votre carte a atteint le sommet de la saison. Gardez-la active jusqu'au grand prix.",
    }
  }

  if (input.inviteEnabled && input.inviteRemainingSlots > 0) {
    return {
      kind: "domino",
      title: "Le domino est ouvert",
      body: `Vous pouvez inviter ${input.inviteRemainingSlots} personne${input.inviteRemainingSlots > 1 ? "s" : ""} pour nourrir votre parcours.`,
    }
  }

  if ((input.currentStep ?? 0) >= 7 && (input.seasonDaysRemaining ?? 999) <= 21) {
    return {
      kind: "summit",
      title: "Vous approchez du sommet",
      body: `Encore un effort pour rester dans la course avant la fin de la saison${input.seasonDaysRemaining !== null ? ` (${input.seasonDaysRemaining} jours)` : ""}.`,
    }
  }

  if (daysSinceVisit !== null && daysSinceVisit >= 3) {
    return {
      kind: "comeback",
      title: "Revenez bientot",
      body: `Votre carte n'a pas bouge depuis ${daysSinceVisit} jours. Revenez cette semaine pour relancer la progression.`,
    }
  }

  if (weekday === 1) {
    return {
      kind: "weak_day",
      title: "Lundi calme",
      body: "C'est souvent le bon moment pour repasser et faire avancer votre carte sans attendre la fin de semaine.",
    }
  }

  return {
    kind: "progress",
    title: input.statusName ? `Statut ${input.statusName}` : "Carte active",
    body:
      input.directInvitationsActivated > 0
        ? `Vous avez deja active ${input.directInvitationsActivated} invitation${input.directInvitationsActivated > 1 ? "s" : ""}. Continuez a faire vivre votre carte.`
        : "Chaque passage compte. Gardez votre carte en mouvement pour ouvrir la suite du parcours.",
  }
}
