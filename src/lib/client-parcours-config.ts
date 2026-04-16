import type { LandingWorldId } from "@/lib/landing-content"
import { getBarClientScreens, getBarEngineCaptionForScreenId } from "@/lib/bar-client-parcours"
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

export function getClientParcoursScreen(worldId: LandingWorldId, screenIndex: number): ClientScreen {
  if (worldId === "bar") {
    const barScreens = getBarClientScreens()
    const b = barScreens[screenIndex]
    return (b as ClientScreen) ?? CLIENT_PARCOURS_SCREENS[screenIndex]
  }
  return CLIENT_PARCOURS_SCREENS[screenIndex]
}

// ─── PER-VERTICAL HERO COPY ──────────────────────────────────────────────────
// Overrides for the top card on each client screen. Only eyebrow + italic
// subtitle are overridden per vertical — title/body often interpolate dynamic
// counts and remain centralised in the Screen components. Bar keeps its own
// fully-specific path via getBarClientScreens() + BAR_ELU_LAYER.
// Missing entries fall back to the generic copy already hardcoded in the
// Screen component, so this is additive-only.

export type ScreenHero = {
  eyebrow?: string
  italic?: string
  title?: string
  body?: string
}

const SCREEN_HERO: Record<LandingWorldId, Partial<Record<ClientScreenId, ScreenHero>>> = {
  cafe: {
    entree: {
      italic: "Sans friction — le comptoir vous reconnaît.",
    },
    progression: {
      italic: "Un café compte. Deux cafés tiennent un fil.",
    },
    activation: {
      italic: "Le lieu vous sert, puis vous retient.",
    },
    "prochaine-etape": {
      italic: "Votre café approche d'un autre niveau.",
    },
    domino: {
      italic: "Invitez quelqu'un à votre café du matin.",
    },
    sommet: {
      italic: "Un café rare peut maintenant s'activer.",
    },
  },
  restaurant: {
    entree: {
      italic: "Sans carte ni geste — la maison vous enregistre.",
    },
    progression: {
      italic: "Le premier repas est mémorisé.",
    },
    activation: {
      italic: "La table vous lit — sans vous presser.",
    },
    "prochaine-etape": {
      italic: "Un dressage particulier vous attend.",
    },
    domino: {
      italic: "Ouvrez une table à une personne proche.",
    },
    sommet: {
      italic: "La maison peut ouvrir une table rare.",
    },
  },
  beaute: {
    entree: {
      italic: "Sans friction — le salon retient votre premier passage.",
    },
    progression: {
      italic: "Le geste vous retient — le rituel commence.",
    },
    activation: {
      italic: "Le salon vous lit — un soin plus fin devient possible.",
    },
    "prochaine-etape": {
      italic: "Un soin signature se rapproche.",
    },
    domino: {
      italic: "Offrez une place à une personne que vous aimez.",
    },
    sommet: {
      italic: "Un soin d'exception peut maintenant s'ouvrir.",
    },
  },
  boutique: {
    entree: {
      italic: "Sans carte — la boutique enregistre votre venue.",
    },
    progression: {
      italic: "Votre première visite tient un fil.",
    },
    activation: {
      italic: "La boutique vous lit — un accès discret devient possible.",
    },
    "prochaine-etape": {
      italic: "Une pièce plus rare se rapproche.",
    },
    domino: {
      italic: "Faites entrer une personne proche avant l'ouverture large.",
    },
    sommet: {
      italic: "Une pièce ou un accès privé peut maintenant s'ouvrir.",
    },
  },
  bar: {},
}

export function getScreenHero(worldId: LandingWorldId, screenId: ClientScreenId): ScreenHero | null {
  return SCREEN_HERO[worldId]?.[screenId] ?? null
}

export { getBarEngineCaptionForScreenId }

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
  const expireLine = `Valable encore environ ${d} jours sans nouveau passage.`

  const byWorld: Record<LandingWorldId, Record<TensionStepKey, string>> = {
    cafe: {
      entree: "Votre première visite est enregistrée. Le prochain passage lance le vrai retour.",
      progression: "Revenez une fois de plus pour activer un premier signe utile ou un créneau intéressant.",
      activation: "Le café peut maintenant vous pousser vers un retour plus utile pour vous et pour le lieu.",
      "prochaine-etape": "Encore un passage et vous approchez de la récompense ou du rôle Host.",
      domino: "Le lieu peut vous laisser inviter une personne sur un moment simple et borné.",
    },
    bar: {
      entree: "Votre première soirée est enregistrée. Le prochain retour peut ouvrir une vraie fenêtre de soirée.",
      progression: "Le bar peut maintenant vous reconnaître sur un créneau précis, souvent utile au lieu.",
      activation: "Une activation légère peut apparaître: mardi, début de service, création ciblée ou moment duo.",
      "prochaine-etape": "Encore un passage et le privilège de soirée devient beaucoup plus concret.",
      domino: "Vous pouvez commencer à faire entrer une autre personne sur un moment choisi.",
    },
    restaurant: {
      entree: "Votre première table est enregistrée. Le prochain retour enclenche la vraie progression.",
      progression: "Le restaurant commence à vous reconnaître et peut raccourcir le temps avant votre prochain repas.",
      activation: "Un premier geste peut apparaître pour vous faire revenir entre deux occasions.",
      "prochaine-etape": "Encore un passage et vous approchez d'un niveau VIP ou Organisateur.",
      domino: "Le lieu peut vous laisser ouvrir une prochaine table pour deux ou plus.",
    },
    beaute: {
      entree: "Votre premier rendez-vous est enregistré. Le prochain retour protège déjà votre cycle.",
      progression: "Le lieu peut maintenant vous reconnaître comme cliente régulière.",
      activation: "Un premier signe ou un premier avantage peut apparaître pour sécuriser le prochain rendez-vous.",
      "prochaine-etape": "Encore un passage et vous approchez du niveau de confiance le plus fort.",
      domino: "Le lieu peut vous laisser venir avec une amie ou ouvrir un duo qualifié.",
    },
    boutique: {
      entree: "Votre première visite est enregistrée. Le prochain retour lance la vraie trajectoire.",
      progression: "La boutique commence à vous reconnaître et à vous donner une vraie raison de repasser.",
      activation: "Un premier signal peut apparaître: preview, fitting ou accès plus ciblé.",
      "prochaine-etape": "Encore un passage et vous approchez d'un accès ou d'une récompense plus rare.",
      domino: "Vous pouvez commencer à faire entrer une personne de votre cercle.",
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
      progression: { eyebrow: "Ce que vous voyez", line: "Le café commence à vous reconnaître comme quelqu'un qui revient vraiment." },
      activation: { eyebrow: "Ce qui peut arriver", line: "Un petit déclencheur peut apparaître tôt pour vous faire revenir avant que l'habitude ne retombe." },
      "prochaine-etape": { eyebrow: "Ce qui se prépare", line: "Le prochain retour peut ouvrir un créneau calme, un duo ou une montée vers Host." },
    },
    bar: {
      progression: { eyebrow: "Ce que vous voyez", line: "Le bar peut maintenant vous pousser vers une vraie soirée de retour, souvent sur un soir plus utile." },
      activation: { eyebrow: "Ce qui peut arriver", line: "Mardi, début de service, duo ou création: le premier déclencheur reste court et cadré." },
      "prochaine-etape": { eyebrow: "Ce qui se prépare", line: "Le privilège de soirée se rapproche et le message peut monter d'un cran." },
    },
    restaurant: {
      progression: { eyebrow: "Ce que vous voyez", line: "Le restaurant commence à vous traiter comme un client qui peut revenir entre deux occasions." },
      activation: { eyebrow: "Ce qui peut arriver", line: "Un premier geste peut apparaître pour vous faire reprendre une table plus tôt que prévu." },
      "prochaine-etape": { eyebrow: "Ce qui se prépare", line: "Encore un passage et vous pouvez basculer vers un vrai niveau VIP ou Organisateur." },
    },
    beaute: {
      progression: { eyebrow: "Ce que vous voyez", line: "Le lieu vous traite déjà comme une cliente qui peut reprendre son cycle." },
      activation: { eyebrow: "Ce qui peut arriver", line: "Un premier signe peut apparaître pour sécuriser le prochain rendez-vous ou un créneau plus souple." },
      "prochaine-etape": { eyebrow: "Ce qui se prépare", line: "Vous vous rapprochez d'un niveau de confiance plus élevé et de privilèges mieux ciblés." },
    },
    boutique: {
      progression: { eyebrow: "Ce que vous voyez", line: "La boutique vous donne déjà une vraie raison de repasser, au-delà d'une simple visite." },
      activation: { eyebrow: "Ce qui peut arriver", line: "Preview, fitting ou accès ciblé: un premier signe peut apparaître assez tôt." },
      "prochaine-etape": { eyebrow: "Ce qui se prépare", line: "Encore un passage et un accès plus rare peut devenir disponible." },
    },
  }
  return byWorld[worldId][step]
}

export type SummitOption = {
  id: string
  title: string
  description: string
  whisper: string
  backendInterpretation?: string
}

export function getSummitOptions(worldId: LandingWorldId): SummitOption[] {
  const options: Record<LandingWorldId, SummitOption[]> = {
    cafe: [
      { id: "recurrence", title: "1 café offert chaque semaine", description: "Un rythme simple à comprendre: vous revenez et le café vous récompense dans la durée.", whisper: "Une récompense de rythme, pas un coupon anonyme." },
      { id: "impact", title: "1 petit-déjeuner duo", description: "Le lieu vous ouvre un moment plus fort à deux sur la saison.", whisper: "Un gain visible, fait pour être utilisé vraiment." },
      { id: "statut", title: "Statut Host", description: "Le comptoir vous reconnaît et peut vous laisser ouvrir un petit moment avec une autre personne.", whisper: "Plus qu'une remise: un vrai rôle dans le lieu." },
    ],
    bar: [
      {
        id: "recurrence",
        title: "1 création de bar par mois",
        description: "Un retour de soirée régulier avec une vraie création reconnue au comptoir.",
        whisper: "Une promesse claire, sans transformer le bar en promo permanente.",
        backendInterpretation: "Mode récurrence: budget récompense étalé, GP_uplift dominant, faible choc marge ponctuel.",
      },
      {
        id: "impact",
        title: "1 soirée duo privilégiée",
        description: "Un moment plus fort, plus visible, à activer sur une soirée choisie.",
        whisper: "Un vrai motif de retour, pas une ristourne générale.",
        backendInterpretation: "Mode impact ponctuel: pic RC_direct contrôlé, activation immédiate fenêtre courte.",
      },
      {
        id: "statut",
        title: "Accès privilégié au comptoir",
        description: "Le bar vous reconnaît, vous priorise et vous ouvre certains moments ou certaines créations.",
        whisper: "Du statut, des droits d'accès, et une vraie reconnaissance sociale.",
        backendInterpretation: "Mode statut: coût service / attention, diamond token budgété, effet social > discount.",
      },
      {
        id: "anniversaire",
        title: "Organiser un anniversaire ici",
        description: "Le lieu vous laisse ouvrir un vrai moment de groupe quand les conditions sont réunies.",
        whisper: "Plusieurs consommations, un vrai moment, un coût toujours cadré.",
        backendInterpretation: "Règle groupe_min · nuits_éligibles · reward_cap_eur — propagation + panier moyen bar.",
      },
      {
        id: "mardi",
        title: "Mardi activé",
        description: "Le bar vous pousse sur un soir plus faible avec une raison claire de revenir.",
        whisper: "Le créneau calme devient votre rendez-vous utile.",
        backendInterpretation: "off_peak_day = mardi · hook calendaire · GP_uplift sur slot ciblé, coût activation borné.",
      },
    ],
    restaurant: [
      { id: "recurrence", title: "1 dîner signature dans la saison", description: "Un vrai repas à viser, assez fort pour vous faire revenir entre deux occasions.", whisper: "Le restaurant récompense un vrai retour, pas un simple passage." },
      { id: "impact", title: "Table du chef ou moment fort", description: "Le lieu vous ouvre une expérience plus rare et plus visible sur une date choisie.", whisper: "Une vraie table, pas une promo ouverte." },
      { id: "statut", title: "Statut VIP / Organisateur", description: "Le restaurant vous reconnaît et peut vous laisser réserver pour d'autres.", whisper: "Vous ne revenez plus seul: vous ouvrez une vraie table." },
    ],
    beaute: [
      { id: "recurrence", title: "1 soin offert dans la saison", description: "Le lieu récompense un vrai cycle de retour par un soin qui compte vraiment.", whisper: "Une récompense de confiance, pas un rabais de dernière minute." },
      { id: "impact", title: "Rituel duo ou moment privilégié", description: "Le lieu vous ouvre un soin plus fort ou un duo quand le bon moment arrive.", whisper: "Un vrai bénéfice, visible et assumé." },
      { id: "statut", title: "Accès prioritaire et créneaux réservés", description: "Le lieu vous reconnaît comme cliente de confiance et vous traite différemment.", whisper: "Du statut et de la fluidité, pas juste un prix." },
    ],
    boutique: [
      { id: "recurrence", title: "Crédit collection", description: "Un vrai crédit ou avantage de collection qui donne une raison concrète de repasser.", whisper: "Le retour est lié à la collection, pas à la remise pure." },
      { id: "impact", title: "Drop ou preview prioritaire", description: "Le lieu vous ouvre une pièce ou une fenêtre plus rare sur la saison.", whisper: "Ce qui compte ici, c'est l'accès avant les autres." },
      { id: "statut", title: "Accès privé et cercle curateur", description: "La boutique vous reconnaît et vous laisse voir, essayer et parfois inviter autrement.", whisper: "Du statut de collection, pas du discount." },
    ],
  }
  return options[worldId]
}

const SUMMIT_OPTION_IDS = new Set(["recurrence", "impact", "statut", "anniversaire", "mardi"])

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
    "bar:anniversaire": 2,
    "bar:mardi": 3,
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