"use client"

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'

export type BusinessType = 'cafe' | 'restaurant' | 'boulangerie' | 'coiffeur'

export type BusinessConfig = {
  type: BusinessType
  label: string
  visitWord: string
  specialDay: string
  specialDayLabel: string
  deadHour: string
  deadHourLabel: string
  avgTicket: number
  clientsDay: number
  seasonReward: string
  seasonRewardShort: string
  seasonDuration: string
  diamondMeaning: string
  coreMechanics: string[]
  missionTemplates: { label: string; detail: string; icon: string }[]
}

export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  cafe: {
    type: 'cafe',
    label: 'Café',
    visitWord: 'passage',
    specialDay: 'mardi',
    specialDayLabel: 'Mardi fidèle',
    deadHour: '14h–16h',
    deadHourLabel: 'Creux après-midi',
    avgTicket: 6.5,
    clientsDay: 80,
    seasonReward: '1 café offert par jour pendant 1 an',
    seasonRewardShort: '1 café / jour × 1 an',
    seasonDuration: '3 mois',
    diamondMeaning: 'Accès au comptoir privilège — le client devient un habitué reconnu',
    coreMechanics: [
      'Fréquence élevée — le retour se joue en jours, pas en semaines',
      'Activation creux 14h–16h — remplir les heures faibles',
      'Invitation café — "viens prendre un café" est le geste le plus naturel',
    ],
    missionTemplates: [
      { label: 'Mardi faible', detail: '4 clients attendus ce mardi', icon: 'calendar' },
      { label: 'Creux 14h–16h', detail: '2 activations déclenchées', icon: 'clock' },
      { label: 'Anniversaire', detail: '1 cette semaine — Camille B.', icon: 'cake' },
      { label: 'Invitation café', detail: '3 invités en cours via Domino', icon: 'users' },
    ],
  },
  restaurant: {
    type: 'restaurant',
    label: 'Restaurant',
    visitWord: 'couvert',
    specialDay: 'mardi',
    specialDayLabel: 'Mardi découverte',
    deadHour: '14h–18h',
    deadHourLabel: 'Creux service',
    avgTicket: 28,
    clientsDay: 50,
    seasonReward: '1 dîner offert par mois pendant 6 mois',
    seasonRewardShort: '1 dîner / mois × 6 mois',
    seasonDuration: '3 mois',
    diamondMeaning: 'Table réservée — le client organise, il revient avec du monde',
    coreMechanics: [
      'Occasion table — le retour se joue sur l\'envie de partager un moment',
      'Mission groupe — "viens dîner à 4" remplit une table entière',
      'Mardi découverte — remplir le jour le plus faible du service',
    ],
    missionTemplates: [
      { label: 'Mardi découverte', detail: '3 couverts attendus ce mardi', icon: 'calendar' },
      { label: 'Groupe (4 pers)', detail: '2 tables activées cette semaine', icon: 'users' },
      { label: 'Anniversaire table', detail: '1 réservation spéciale — Nathalie R.', icon: 'cake' },
      { label: 'Retour à 2', detail: '5 clients éligibles pour un retour en duo', icon: 'heart' },
    ],
  },
  boulangerie: {
    type: 'boulangerie',
    label: 'Boulangerie',
    visitWord: 'passage',
    specialDay: 'lundi',
    specialDayLabel: 'Lundi gourmand',
    deadHour: '14h–16h',
    deadHourLabel: 'Creux après-midi',
    avgTicket: 8.5,
    clientsDay: 120,
    seasonReward: '1 pâtisserie offerte par semaine pendant 3 mois',
    seasonRewardShort: '1 pâtisserie / sem × 3 mois',
    seasonDuration: '3 mois',
    diamondMeaning: 'Client privilège — reconnu chaque matin, la boulangerie devient son rituel',
    coreMechanics: [
      'Fréquence très élevée — passage quasi-quotidien',
      'Creux après-midi — inciter au goûter',
      'Recommandation de quartier — bouche-à-oreille hyper-local',
    ],
    missionTemplates: [
      { label: 'Lundi gourmand', detail: '6 clients attendus ce lundi', icon: 'calendar' },
      { label: 'Goûter 15h', detail: '3 activations déclenchées', icon: 'clock' },
      { label: 'Anniversaire', detail: '2 cette semaine', icon: 'cake' },
      { label: 'Recommandation', detail: '4 invités via Domino', icon: 'users' },
    ],
  },
  coiffeur: {
    type: 'coiffeur',
    label: 'Coiffeur',
    visitWord: 'rendez-vous',
    specialDay: 'lundi',
    specialDayLabel: 'Lundi coiffure',
    deadHour: 'lundi matin',
    deadHourLabel: 'Creux début de semaine',
    avgTicket: 65,
    clientsDay: 15,
    seasonReward: '1 coupe offerte par mois pendant 6 mois',
    seasonRewardShort: '1 coupe / mois × 6 mois',
    seasonDuration: '3 mois',
    diamondMeaning: 'Client VIP — priorité sur les créneaux, conseil personnalisé',
    coreMechanics: [
      'Rituel retour — fidélité sur la durée',
      'Duo recommandation — amener un ami est naturel',
      'Lundi creux — remplir le jour le plus faible',
    ],
    missionTemplates: [
      { label: 'Lundi coiffure', detail: '2 rendez-vous attendus ce lundi', icon: 'calendar' },
      { label: 'Duo coupe', detail: '1 invitation active', icon: 'users' },
      { label: 'Anniversaire', detail: '1 cette semaine', icon: 'cake' },
      { label: 'Rebooking', detail: '4 clients sans rdv depuis 4 semaines', icon: 'clock' },
    ],
  },
}

export type Client = {
  id: string
  name: string
  initials: string
  level: 'dormant' | 'actif' | 'domino' | 'diamond' | 'sommet'
  visits: number
  totalVisits: number
  lastVisit: string
  birthday?: string
  invitedBy?: string
}

export type Activation = {
  id: string
  label: string
  active: boolean
}

function generateClients(type: BusinessType): Client[] {
  const names: Record<BusinessType, { name: string; initials: string; birthday?: string }[]> = {
    cafe: [
      { name: 'Marie L.', initials: 'ML', birthday: '18/04' },
      { name: 'Julien R.', initials: 'JR' },
      { name: 'Camille B.', initials: 'CB', birthday: '22/04' },
      { name: 'Thomas M.', initials: 'TM' },
      { name: 'Sophie D.', initials: 'SD' },
      { name: 'Lucas P.', initials: 'LP', birthday: '15/05' },
      { name: 'Emma V.', initials: 'EV' },
      { name: 'Antoine G.', initials: 'AG' },
      { name: 'Léa F.', initials: 'LF' },
      { name: 'Hugo C.', initials: 'HC' },
      { name: 'Chloé N.', initials: 'CN', birthday: '03/05' },
      { name: 'Maxime T.', initials: 'MT' },
      { name: 'Inès A.', initials: 'IA' },
      { name: 'Romain K.', initials: 'RK' },
      { name: 'Clara Z.', initials: 'CZ' },
    ],
    restaurant: [
      { name: 'Pierre D.', initials: 'PD', birthday: '20/04' },
      { name: 'Isabelle M.', initials: 'IM' },
      { name: 'François L.', initials: 'FL' },
      { name: 'Nathalie R.', initials: 'NR', birthday: '28/04' },
      { name: 'Jean-Marc B.', initials: 'JB' },
      { name: 'Catherine V.', initials: 'CV' },
      { name: 'Philippe A.', initials: 'PA' },
      { name: 'Sylvie G.', initials: 'SG', birthday: '12/05' },
      { name: 'Laurent T.', initials: 'LT' },
      { name: 'Martine H.', initials: 'MH' },
      { name: 'Olivier P.', initials: 'OP' },
      { name: 'Valérie S.', initials: 'VS' },
    ],
    boulangerie: [
      { name: 'Martine B.', initials: 'MB', birthday: '16/04' },
      { name: 'Jean-Claude R.', initials: 'JR' },
      { name: 'Françoise M.', initials: 'FM' },
      { name: 'André L.', initials: 'AL', birthday: '29/04' },
      { name: 'Monique D.', initials: 'MD' },
      { name: 'Robert V.', initials: 'RV' },
      { name: 'Simone P.', initials: 'SP', birthday: '07/05' },
      { name: 'Georges T.', initials: 'GT' },
      { name: 'Denise H.', initials: 'DH' },
      { name: 'Michel C.', initials: 'MC' },
      { name: 'Jacqueline F.', initials: 'JF', birthday: '11/05' },
      { name: 'Bernard K.', initials: 'BK' },
    ],
    coiffeur: [
      { name: 'Sophie M.', initials: 'SM', birthday: '21/04' },
      { name: 'Caroline L.', initials: 'CL' },
      { name: 'Isabelle D.', initials: 'ID' },
      { name: 'Véronique R.', initials: 'VR', birthday: '02/05' },
      { name: 'Anne-Marie B.', initials: 'AB' },
      { name: 'Christine V.', initials: 'CV' },
      { name: 'Patricia G.', initials: 'PG', birthday: '09/05' },
      { name: 'Sandrine T.', initials: 'ST' },
      { name: 'Nathalie P.', initials: 'NP' },
      { name: 'Laurence H.', initials: 'LH' },
    ],
  }

  const levels: Client['level'][] = ['dormant', 'actif', 'actif', 'actif', 'domino', 'domino', 'diamond', 'sommet']
  const visitsMap: Record<Client['level'], [number, number]> = {
    dormant: [0, 1],
    actif: [2, 4],
    domino: [5, 6],
    diamond: [7, 7],
    sommet: [8, 8],
  }

  const lastVisits = ['Aujourd\'hui', 'Hier', 'Il y a 2j', 'Il y a 3j', 'Il y a 5j', 'Il y a 1 sem', 'Il y a 2 sem']

  return names[type].map((n, i) => {
    const level = levels[i % levels.length]
    const [minV, maxV] = visitsMap[level]
    const visits = minV + Math.floor(Math.random() * (maxV - minV + 1))
    return {
      id: `c${i}`,
      name: n.name,
      initials: n.initials,
      level,
      visits,
      totalVisits: 8,
      lastVisit: lastVisits[i % lastVisits.length],
      birthday: n.birthday,
      invitedBy: i > 6 && i % 3 === 0 ? names[type][0].name : undefined,
    }
  })
}

type StoreCtx = {
  business: BusinessConfig
  setBusiness: (type: BusinessType) => void
  clients: Client[]
  activations: Activation[]
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<BusinessType>('cafe')

  const business = BUSINESS_CONFIGS[type]
  const clients = useMemo(() => generateClients(type), [type])
  const activations = useMemo<Activation[]>(() => [
    { id: 'specialDay', label: business.specialDayLabel, active: true },
    { id: 'deadHour', label: business.deadHourLabel, active: false },
    { id: 'birthday', label: 'Anniversaire', active: true },
    { id: 'invitation', label: 'Invitation Domino', active: true },
  ], [business])

  const setBusiness = (t: BusinessType) => setType(t)

  return (
    <Ctx.Provider value={{ business, setBusiness, clients, activations }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
