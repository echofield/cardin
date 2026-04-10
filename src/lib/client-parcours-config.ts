import type { LandingWorldId } from "@/lib/landing-content"
import { cardinSeasonLaw } from "@/lib/season-law"

export type ClientScreenId = "entree" | "progression" | "activation" | "prochaine-etape" | "domino" | "sommet"

export type ClientScreen = {
  id: ClientScreenId
  title: string
  subtitle: string
}

/** Header line + one emotional line (shown under header). */
export const CLIENT_PARCOURS_SCREENS: ClientScreen[] = [
  {
    id: "entree",
    title: "Vous êtes entré dans le parcours",
    subtitle: "Quelque chose de simple commence, et peut durer.",
  },
  {
    id: "progression",
    title: "Premier passage validé",
    subtitle: "Le lieu sait que vous êtes revenu.",
  },
  {
    id: "activation",
    title: "Parcours actif",
    subtitle: "Votre présence compte déjà ici.",
  },
  {
    id: "prochaine-etape",
    title: "Prochaine étape",
    subtitle: "Chaque retour resserre le fil.",
  },
  {
    id: "domino",
    title: "Propagation",
    subtitle: "Le parcours peut s’étendre à quelqu’un d’autre.",
  },
  {
    id: "sommet",
    title: "Sommet atteint",
    subtitle: "Ce qui était réservé devient tangible.",
  },
]

export type WorldTiming = {
  minDays: number
  maxDays: number
}

export const CLIENT_PARCOURS_TIMING: Record<LandingWorldId, WorldTiming> = {
  cafe: { minDays: 2, maxDays: 4 },
  restaurant: { minDays: 5, maxDays: 10 },
  beaute: { minDays: 10, maxDays: 20 },
  boutique: { minDays: 7, maxDays: 14 },
}

export function getExpirationDays(worldId: LandingWorldId): number {
  const timing = CLIENT_PARCOURS_TIMING[worldId]
  return Math.round((timing.minDays + timing.maxDays) / 2)
}

/** Countdown + paired action line — varies by step (not the same “dimanche” everywhere). */
export type TensionStepKey = "entree" | "progression" | "activation" | "prochaine-etape" | "domino"

export function getTensionPair(
  worldId: LandingWorldId,
  step: TensionStepKey,
): { expireLine: string; actionLine: string } {
  const d = getExpirationDays(worldId)
  const expireLine = `Expire dans ${d} jours`

  const byWorld: Record<LandingWorldId, Record<TensionStepKey, string>> = {
    cafe: {
      entree: "Revenez tant que l’envie est fraîche — le parcours garde la mesure.",
      progression: "Un court délai suffit pour confirmer le geste.",
      activation: "Le prochain passage fait monter la suite, sans précipitation.",
      "prochaine-etape": "Choisissez un moment cette semaine : le lieu vous attend.",
      domino: "Tant que la fenêtre est ouverte, la propagation reste possible.",
    },
    restaurant: {
      entree: "Réservez un créneau dans votre semaine avant que la fenêtre ne se referme.",
      progression: "Un retour entre deux services suffit à ancrer l’habitude.",
      activation: "Le prochain passage peut faire évoluer ce qui vous est proposé.",
      "prochaine-etape": "Un passage de plus cette semaine suffit pour avancer.",
      domino: "Partagez tant que l’invitation reste ouverte.",
    },
    beaute: {
      entree: "Prenez rendez-vous avec le lieu tant que la fenêtre est large.",
      progression: "L’intervalle compte : gardez le fil sans le brusquer.",
      activation: "Le prochain soin peut faire basculer la suite du parcours.",
      "prochaine-etape": "Un passage avant la fin du mois suffit souvent pour tenir le cap.",
      domino: "Offrez l’accès tant que la saison le permet.",
    },
    boutique: {
      entree: "Revenez quand l’envie se précise — le parcours patiente avec vous.",
      progression: "Un passage de plus, et la sélection se resserre autour de vous.",
      activation: "Le prochain passage peut ouvrir ce qui vous est réservé.",
      "prochaine-etape": "Passez avant la fin de la fenêtre pour ne pas perdre le fil.",
      domino: "Transmettez tant que l’accès reste disponible.",
    },
  }

  return { expireLine, actionLine: byWorld[worldId][step] }
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

/** Early “soft” invite — one optional gesture before domino amplification. */
export const SOFT_INVITE_MAX = 1
