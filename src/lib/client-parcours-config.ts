import type { LandingWorldId } from "@/lib/landing-content"
import { cardinSeasonLaw } from "@/lib/season-law"

export type ClientScreenId = "entree" | "progression" | "activation" | "prochaine-etape" | "domino" | "sommet"

export type ClientScreen = {
  id: ClientScreenId
  title: string
  subtitle: string
}

export const CLIENT_PARCOURS_SCREENS: ClientScreen[] = [
  { id: "entree", title: "Vous êtes entré dans le parcours", subtitle: "Revenez bientôt pour continuer" },
  { id: "progression", title: "1 passage validé", subtitle: "Encore quelques passages pour débloquer" },
  { id: "activation", title: "Parcours actif", subtitle: "Vous avez déjà un avantage ici" },
  { id: "prochaine-etape", title: "Prochaine étape", subtitle: "Passez une fois cette semaine pour avancer" },
  { id: "domino", title: "1 entrée à partager", subtitle: "Donnez accès à une personne de votre choix" },
  { id: "sommet", title: "Sommet atteint", subtitle: "Votre avantage est disponible" },
]

export type WorldTiming = {
  minDays: number
  maxDays: number
  actionPhrase: string
  weekdayTarget: string
}

export const CLIENT_PARCOURS_TIMING: Record<LandingWorldId, WorldTiming> = {
  cafe: {
    minDays: 2,
    maxDays: 4,
    actionPhrase: "Revenez avant dimanche pour continuer",
    weekdayTarget: "dimanche",
  },
  restaurant: {
    minDays: 5,
    maxDays: 10,
    actionPhrase: "Passez avant jeudi pour garder l\u2019avantage",
    weekdayTarget: "jeudi",
  },
  beaute: {
    minDays: 10,
    maxDays: 20,
    actionPhrase: "Votre progression reste ouverte pendant 15 jours",
    weekdayTarget: "la fin du mois",
  },
  boutique: {
    minDays: 7,
    maxDays: 14,
    actionPhrase: "Revenez cette semaine pour avancer",
    weekdayTarget: "samedi",
  },
}

export function getExpirationDays(worldId: LandingWorldId): number {
  const timing = CLIENT_PARCOURS_TIMING[worldId]
  return Math.round((timing.minDays + timing.maxDays) / 2)
}

export const WORLD_MERCHANT_TYPE: Record<LandingWorldId, string> = {
  cafe: "cafe",
  restaurant: "restaurant",
  beaute: "institut-beaute",
  boutique: "boutique",
}

export const WORLD_TARGET_VISITS: Record<LandingWorldId, number> = {
  cafe: 10,
  restaurant: 5,
  beaute: 4,
  boutique: 6,
}

export function getScreenForVisits(
  visits: number,
  targetVisits: number,
): number {
  const { dominoStartStep, summitStep } = cardinSeasonLaw
  const dominoVisit = Math.ceil((dominoStartStep / summitStep) * targetVisits)

  if (visits <= 0) return 0
  if (visits === 1) return 1
  if (visits === 2) return 2
  if (visits >= targetVisits) return 5
  if (visits >= dominoVisit) return 4
  return 3
}
