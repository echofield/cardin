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
    title: "Entrée",
    subtitle: "Vous êtes dans le fil.",
  },
  {
    id: "progression",
    title: "Premier fil",
    subtitle: "Le lieu vous retient.",
  },
  {
    id: "activation",
    title: "Sous tension douce",
    subtitle: "Quelque chose s’accorde.",
  },
  {
    id: "prochaine-etape",
    title: "Plus près",
    subtitle: "Le parcours vous veut encore.",
  },
  {
    id: "domino",
    title: "Ouverture",
    subtitle: "Une porte à tendre.",
  },
  {
    id: "sommet",
    title: "Sommet",
    subtitle: "Choisissez ce qui vous appelle.",
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
      entree: "Tant que l’envie est là, le fil tient.",
      progression: "Un souffle, puis la suite.",
      activation: "Sans précipiter — le lieu monte avec vous.",
      "prochaine-etape": "Cette semaine encore : un pas suffit.",
      domino: "La fenêtre reste entrouverte.",
    },
    restaurant: {
      entree: "Glissez un moment dans la semaine.",
      progression: "Le retour fait le rythme.",
      activation: "La table se resserre autour de vous.",
      "prochaine-etape": "Un passage de plus : le fil se tend.",
      domino: "Tant que l’invitation respire.",
    },
    beaute: {
      entree: "Le temps est large — puis il se fait précis.",
      progression: "Doucement : le lieu vous garde.",
      activation: "Le prochain geste compte double.",
      "prochaine-etape": "Avant la fin du mois : le fil vous tire.",
      domino: "Offrir, sans brusquer.",
    },
    boutique: {
      entree: "Quand l’envie se précise, revenez.",
      progression: "La sélection vous entoure.",
      activation: "Ce qui vous est réservé se rapproche.",
      "prochaine-etape": "Ne laissez pas le fil se couper.",
      domino: "Passer le flambeau, avec mesure.",
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

/** Subtle “taste” signals — not rewards, just atmosphere (steps 2–4). */
export type TasteStep = "progression" | "activation" | "prochaine-etape"

export function getTasteSignal(worldId: LandingWorldId, step: TasteStep): { eyebrow: string; line: string } {
  const byWorld: Record<LandingWorldId, Record<TasteStep, { eyebrow: string; line: string }>> = {
    cafe: {
      progression: { eyebrow: "Note", line: "Une chaleur qui reste — sans promesse affichée." },
      activation: { eyebrow: "Arôme", line: "Le lieu vous reconnaît ; le geste suit." },
      "prochaine-etape": { eyebrow: "Fil", line: "Chaque retour resserre ce qui vous attend encore." },
    },
    restaurant: {
      progression: { eyebrow: "Table", line: "Le silence du premier service vous garde une place." },
      activation: { eyebrow: "Sel", line: "Le rythme du lieu s’accorde au vôtre." },
      "prochaine-etape": { eyebrow: "Suite", line: "Un passage de plus : la carte se fait plus précise." },
    },
    beaute: {
      progression: { eyebrow: "Peau", line: "Quelque chose s’adoucit — avant la forme." },
      activation: { eyebrow: "Rituel", line: "Le soin vous fait entrer dans la durée." },
      "prochaine-etape": { eyebrow: "Cercle", line: "Vous n’êtes plus à la lisière." },
    },
    boutique: {
      progression: { eyebrow: "Ligne", line: "Un objet vous fait signe — sans prix affiché ici." },
      activation: { eyebrow: "Matière", line: "La sélection se resserre autour de vous." },
      "prochaine-etape": { eyebrow: "Vue", line: "Ce qui vous est réservé se profile." },
    },
  }
  return byWorld[worldId][step]
}

export type SummitOption = {
  id: string
  title: string
  whisper: string
}

/** Three directions at the summit — choice, not a single fixed sentence (experiential). */
export function getSummitOptions(worldId: LandingWorldId): SummitOption[] {
  const options: Record<LandingWorldId, SummitOption[]> = {
    cafe: [
      { id: "signature", title: "La signature", whisper: "Un geste qui revient, mois après mois." },
      { id: "duo", title: "Le duo", whisper: "Pour deux — quand le matin le permet." },
      { id: "reserve", title: "La réserve", whisper: "Ce que le lieu ne montre pas à tout le monde." },
    ],
    restaurant: [
      { id: "table", title: "La table", whisper: "Un repas qui marque le calendrier." },
      { id: "chef", title: "Le chef", whisper: "Quand la cuisine se fait plus étroite." },
      { id: "secret", title: "Le secret", whisper: "Un volet que la salle ne crie pas." },
    ],
    beaute: [
      { id: "soin", title: "Le soin", whisper: "Un rythme qui vous sculpte dans la durée." },
      { id: "rituel", title: "Le rituel", whisper: "À deux — quand la confiance est là." },
      { id: "prive", title: "Le privé", whisper: "Une fenêtre rare — le lieu décide quand." },
    ],
    boutique: [
      { id: "collection", title: "La collection", whisper: "Une ligne qui vous suit dans le temps." },
      { id: "priorite", title: "La priorité", whisper: "Avant les autres — quand la pièce le permet." },
      { id: "piece", title: "La pièce", whisper: "Ce qui ne passe pas deux fois." },
    ],
  }
  return options[worldId]
}
