import type { LandingWorldId } from "@/lib/landing-content"
import { cardinSeasonLaw } from "@/lib/season-law"

export type ClientScreenId = "entree" | "progression" | "activation" | "prochaine-etape" | "domino" | "sommet"

export type ClientScreen = {
  id: ClientScreenId
  title: string
  subtitle: string
}

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
    subtitle: "Quelque chose s'accorde.",
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
  bar: { minDays: 3, maxDays: 7 },
  restaurant: { minDays: 5, maxDays: 10 },
  beaute: { minDays: 10, maxDays: 20 },
  boutique: { minDays: 7, maxDays: 14 },
}

export function getExpirationDays(worldId: LandingWorldId): number {
  const timing = CLIENT_PARCOURS_TIMING[worldId]
  return Math.round((timing.minDays + timing.maxDays) / 2)
}

export type TensionStepKey = "entree" | "progression" | "activation" | "prochaine-etape" | "domino"

export function getTensionPair(
  worldId: LandingWorldId,
  step: TensionStepKey,
): { expireLine: string; actionLine: string } {
  const d = getExpirationDays(worldId)
  const expireLine = `Expire dans ${d} jours`

  const byWorld: Record<LandingWorldId, Record<TensionStepKey, string>> = {
    cafe: {
      entree: "Tant que l'envie est là, le fil tient.",
      progression: "Un souffle, puis la suite.",
      activation: "Sans précipiter, le lieu monte avec vous.",
      "prochaine-etape": "Cette semaine encore : un pas suffit.",
      domino: "La fenêtre reste entrouverte.",
    },
    bar: {
      entree: "Quand la soirée vous appelle, le fil vous retient.",
      progression: "Un créneau clair, puis la suite au comptoir.",
      activation: "Le lieu monte avec vous, sans précipiter.",
      "prochaine-etape": "Encore un passage : le bar se fait prévisible.",
      domino: "La fenêtre du groupe reste ouverte.",
    },
    restaurant: {
      entree: "Glissez un moment dans la semaine.",
      progression: "Le retour fait le rythme.",
      activation: "La table se resserre autour de vous.",
      "prochaine-etape": "Un passage de plus : le fil se tend.",
      domino: "Tant que l'invitation respire.",
    },
    beaute: {
      entree: "Le temps est large, puis il se fait précis.",
      progression: "Doucement : le lieu vous garde.",
      activation: "Le prochain geste compte double.",
      "prochaine-etape": "Avant la fin du mois : le fil vous tire.",
      domino: "Offrir, sans brusquer.",
    },
    boutique: {
      entree: "Quand l'envie se précise, revenez.",
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
  bar: "bar",
  restaurant: "restaurant",
  beaute: "institut-beaute",
  boutique: "boutique",
}

export const WORLD_TARGET_VISITS: Record<LandingWorldId, number> = {
  cafe: 10,
  bar: 8,
  restaurant: 5,
  beaute: 4,
  boutique: 6,
}

export function getScreenForVisits(visits: number, targetVisits: number): number {
  const { dominoStartStep, summitStep } = cardinSeasonLaw
  const dominoVisit = Math.ceil((dominoStartStep / summitStep) * targetVisits)

  if (visits <= 0) return 0
  if (visits === 1) return 1
  if (visits === 2) return 2
  if (visits >= targetVisits) return 5
  if (visits >= dominoVisit) return 4
  return 3
}

export const SOFT_INVITE_MAX = 1

export type TasteStep = "progression" | "activation" | "prochaine-etape"

export function getTasteSignal(worldId: LandingWorldId, step: TasteStep): { eyebrow: string; line: string } {
  const byWorld: Record<LandingWorldId, Record<TasteStep, { eyebrow: string; line: string }>> = {
    cafe: {
      progression: { eyebrow: "Note", line: "Une chaleur qui reste, sans promesse affichée." },
      activation: { eyebrow: "Arôme", line: "Le lieu vous reconnaît ; le geste suit." },
      "prochaine-etape": { eyebrow: "Fil", line: "Chaque retour resserre ce qui vous attend encore." },
    },
    bar: {
      progression: { eyebrow: "Soir", line: "Un créneau qui se répète, sans bruit inutile." },
      activation: { eyebrow: "Comptoir", line: "Le lieu vous reconnaît ; le geste suit." },
      "prochaine-etape": { eyebrow: "Fil", line: "Chaque retour resserre ce qui vous attend encore." },
    },
    restaurant: {
      progression: { eyebrow: "Table", line: "Le silence du premier service vous garde une place." },
      activation: { eyebrow: "Sel", line: "Le rythme du lieu s'accorde au vôtre." },
      "prochaine-etape": { eyebrow: "Suite", line: "Un passage de plus : la carte se fait plus précise." },
    },
    beaute: {
      progression: { eyebrow: "Peau", line: "Quelque chose s'adoucit, avant la forme." },
      activation: { eyebrow: "Rituel", line: "Le soin vous fait entrer dans la durée." },
      "prochaine-etape": { eyebrow: "Cercle", line: "Vous n'êtes plus à la lisière." },
    },
    boutique: {
      progression: { eyebrow: "Ligne", line: "Un objet vous fait signe, sans prix affiché ici." },
      activation: { eyebrow: "Matière", line: "La sélection se resserre autour de vous." },
      "prochaine-etape": { eyebrow: "Vue", line: "Ce qui vous est réservé se profile." },
    },
  }
  return byWorld[worldId][step]
}

export type SummitOption = {
  id: string
  title: string
  description: string
  whisper: string
}

export function getSummitOptions(worldId: LandingWorldId): SummitOption[] {
  const options: Record<LandingWorldId, SummitOption[]> = {
    cafe: [
      { id: "recurrence", title: "Continuer à venir", description: "1 boisson offerte par semaine pendant 1 mois", whisper: "Le rythme vous appartient." },
      { id: "impact", title: "Profiter maintenant", description: "-30 % sur vos 5 prochains passages", whisper: "Un élan, tout de suite." },
      { id: "statut", title: "Accès privilégié", description: "Traitement spécial au comptoir", whisper: "Ce que le lieu réserve à ceux qui restent." },
    ],
    bar: [
      { id: "recurrence", title: "Continuer à venir", description: "1 création ou soft offert par semaine pendant 1 mois", whisper: "Le rythme de soirée vous appartient." },
      { id: "impact", title: "Profiter maintenant", description: "-25 % sur votre prochaine commande au bar", whisper: "Un élan, ce soir." },
      { id: "statut", title: "Accès privilégié", description: "Accès prioritaire au comptoir et création du mois", whisper: "Ce que le bar réserve aux habitués." },
    ],
    restaurant: [
      { id: "recurrence", title: "Continuer à venir", description: "1 dessert offert sur vos 3 prochaines tables", whisper: "La table vous attend encore." },
      { id: "impact", title: "Profiter maintenant", description: "-40 % sur une prochaine réservation", whisper: "Un repas qui marque le calendrier." },
      { id: "statut", title: "Accès privilégié", description: "Accès prioritaire et attention spéciale du chef", whisper: "Ce que la salle ne montre pas à tout le monde." },
    ],
    beaute: [
      { id: "recurrence", title: "Continuer à venir", description: "1 soin offert après 3 rendez-vous", whisper: "Le rythme sculpte dans la durée." },
      { id: "impact", title: "Profiter maintenant", description: "-25 % sur vos 2 prochains rendez-vous", whisper: "Un geste, sans attendre." },
      { id: "statut", title: "Accès privilégié", description: "Accès prioritaire et créneaux réservés", whisper: "Une fenêtre que le lieu n'ouvre pas à tous." },
    ],
    boutique: [
      { id: "recurrence", title: "Continuer à venir", description: "-20 % sur vos 3 prochaines visites", whisper: "La sélection vous accompagne." },
      { id: "impact", title: "Profiter maintenant", description: "-50 € sur votre prochain achat", whisper: "Un objet, une décision." },
      { id: "statut", title: "Accès privilégié", description: "Accès privé aux nouvelles collections", whisper: "Avant les autres, quand la pièce le permet." },
    ],
  }
  return options[worldId]
}

const SUMMIT_OPTION_IDS = new Set(["recurrence", "impact", "statut"])

export function isValidSummitOptionId(id: string): boolean {
  return SUMMIT_OPTION_IDS.has(id)
}

export function normalizeCardinWorld(raw: string | null | undefined): LandingWorldId {
  const v = (raw ?? "cafe").toLowerCase().trim()
  if (v === "restaurant" || v === "beaute" || v === "boutique" || v === "cafe" || v === "bar") {
    return v as LandingWorldId
  }
  return "cafe"
}

export function getSummitUsageInitial(worldId: LandingWorldId, optionId: string): number {
  const key = `${worldId}:${optionId}` as const
  const map: Record<string, number> = {
    "cafe:recurrence": 4,
    "cafe:impact": 5,
    "cafe:statut": 1,
    "bar:recurrence": 4,
    "bar:impact": 4,
    "bar:statut": 1,
    "restaurant:recurrence": 3,
    "restaurant:impact": 1,
    "restaurant:statut": 1,
    "beaute:recurrence": 1,
    "beaute:impact": 2,
    "beaute:statut": 1,
    "boutique:recurrence": 3,
    "boutique:impact": 1,
    "boutique:statut": 1,
  }
  return map[key] ?? 1
}
