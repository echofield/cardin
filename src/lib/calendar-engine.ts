import { type BehaviorScenarioId, normalizeEngineActivityId, type EngineActivityId } from "@/lib/behavior-engine"

export type CalendarMoment = {
  month: number
  label: string
  reason: string
  scenarioId: BehaviorScenarioId
  priority: "high" | "medium"
}

export type CalendarPlan = {
  currentMoment: CalendarMoment
  nextMoment: CalendarMoment
  annualMoments: CalendarMoment[]
  quietPeriodLabel: string
}

const MONTH_LABELS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
]

const MOMENTS: Record<EngineActivityId, CalendarMoment[]> = {
  boulangerie: [
    { month: 0, label: "Routine d'hiver", reason: "Les habitudes se reforment vite après les fêtes.", scenarioId: "starting_loop", priority: "medium" },
    { month: 7, label: "Août de quartier", reason: "Le mois d'août peut creuser la routine locale s'il n'est pas relancé.", scenarioId: "weekly_rendezvous", priority: "high" },
    { month: 8, label: "Rentrée", reason: "Le retour aux habitudes quotidiennes est un moment très favorable.", scenarioId: "short_challenge", priority: "high" },
    { month: 11, label: "Décembre gourmand", reason: "Le mois porte naturellement les achats plaisir et les gains du mois.", scenarioId: "monthly_gain", priority: "medium" },
  ],
  cafe: [
    { month: 0, label: "Reprise du matin", reason: "Les habitudes café se réinstallent vite en début d'année.", scenarioId: "starting_loop", priority: "medium" },
    { month: 4, label: "Retour des terrasses", reason: "Le moment aide à fixer un rendez-vous plus visible.", scenarioId: "weekly_rendezvous", priority: "medium" },
    { month: 8, label: "Rentrée bureau", reason: "Le retour au bureau relance fortement les routines de passage.", scenarioId: "short_challenge", priority: "high" },
    { month: 10, label: "Temps froid", reason: "Une récompense plus désirable fonctionne mieux quand le rituel reprend du poids.", scenarioId: "monthly_gain", priority: "medium" },
  ],
  bar: [
    { month: 0, label: "Reprise des soirées", reason: "Janvier réinstalle vite les sorties régulières après les fêtes.", scenarioId: "starting_loop", priority: "medium" },
    { month: 4, label: "Terrasses et apéros", reason: "Le printemps densifie les créneaux à structurer.", scenarioId: "weekly_rendezvous", priority: "medium" },
    { month: 6, label: "Été urbain", reason: "La saison porte le réseau et les duos au comptoir.", scenarioId: "short_challenge", priority: "high" },
    { month: 10, label: "Saison indoor", reason: "Les soirées longues favorisent un moment signature mensuel.", scenarioId: "monthly_gain", priority: "medium" },
  ],
  restaurant: [
    { month: 1, label: "Saint-Valentin", reason: "Le moment porte naturellement les offres duo et le panier affectif.", scenarioId: "monthly_gain", priority: "high" },
    { month: 4, label: "Milieu de semaine", reason: "Le printemps est utile pour installer un rendez-vous hebdomadaire.", scenarioId: "weekly_rendezvous", priority: "medium" },
    { month: 7, label: "Août local", reason: "Quand la ville ralentit, il faut recréer une raison de revenir.", scenarioId: "short_challenge", priority: "high" },
    { month: 10, label: "Reprise d'automne", reason: "La fréquence se retravaille bien avant les fêtes.", scenarioId: "starting_loop", priority: "medium" },
  ],
  coiffeur: [
    { month: 2, label: "Avant printemps", reason: "Le changement de saison crée un bon moment de réactivation.", scenarioId: "short_challenge", priority: "medium" },
    { month: 5, label: "Pré-été", reason: "Le besoin de préparation avant l'été augmente la désirabilité.", scenarioId: "monthly_gain", priority: "high" },
    { month: 8, label: "Reprise de septembre", reason: "Le retour de vacances demande une relance nette du cycle.", scenarioId: "short_challenge", priority: "high" },
    { month: 11, label: "Fêtes", reason: "Décembre favorise les prestations plus premium.", scenarioId: "monthly_gain", priority: "high" },
  ],
  "institut-beaute": [
    { month: 2, label: "Retour de saison", reason: "Le moment est utile pour remettre un cap visible avant le printemps.", scenarioId: "starting_loop", priority: "medium" },
    { month: 4, label: "Pré-été", reason: "Le besoin de préparation augmente la fréquence naturelle.", scenarioId: "short_challenge", priority: "medium" },
    { month: 8, label: "Rentrée beauté", reason: "Septembre est propice à la reprise des rituels.", scenarioId: "weekly_rendezvous", priority: "high" },
    { month: 11, label: "Fêtes premium", reason: "Le mois porte mieux les gains du mois et les prestations fortes.", scenarioId: "monthly_gain", priority: "high" },
  ],
  boutique: [
    { month: 1, label: "Après soldes", reason: "Il faut recréer une raison de passer après un moment très transactionnel.", scenarioId: "starting_loop", priority: "medium" },
    { month: 3, label: "Nouvelle collection", reason: "Créer un rendez-vous collection renforce le passage.", scenarioId: "weekly_rendezvous", priority: "medium" },
    { month: 8, label: "Rentrée", reason: "Le retour de saison aide à réveiller la clientèle dormante.", scenarioId: "short_challenge", priority: "high" },
    { month: 10, label: "Période cadeaux", reason: "Le désir et le panier sont plus favorables aux gains du mois.", scenarioId: "monthly_gain", priority: "high" },
  ],
}

const QUIET_PERIODS: Record<EngineActivityId, string> = {
  boulangerie: "Le creux d'août et les jours de semaine plus plats sont les périodes à protéger.",
  cafe: "Les périodes de bureau ralenti et les matinées moins régulières sont les points de vigilance.",
  bar: "Les inter-saisons creuses et les soirées irrégulières sont les moments à structurer avec un repère clair.",
  restaurant: "Les services du milieu de semaine et l'été local sont les moments à travailler.",
  coiffeur: "Les longues périodes sans rendez-vous sont le vrai risque à couvrir.",
  "institut-beaute": "Les trous entre deux séances sont le principal risque de perte.",
  boutique: "Les inter-saisons et les semaines sans nouveauté sont les périodes les plus fragiles.",
}

export function buildCalendarPlan(merchantType: string, preferredScenarioId?: BehaviorScenarioId, referenceDate = new Date()): CalendarPlan {
  const activityId = normalizeEngineActivityId(merchantType)
  const annualMoments = MOMENTS[activityId]
  const currentMonth = referenceDate.getMonth()
  const currentMoment = pickCurrentMoment(annualMoments, currentMonth, preferredScenarioId)
  const nextMoment = pickNextMoment(annualMoments, currentMonth, preferredScenarioId)

  return {
    currentMoment,
    nextMoment,
    annualMoments: annualMoments.map((moment) => ({ ...moment, label: `${capitalizeMonth(moment.month)} · ${moment.label}` })),
    quietPeriodLabel: QUIET_PERIODS[activityId],
  }
}

function pickCurrentMoment(moments: CalendarMoment[], currentMonth: number, preferredScenarioId?: BehaviorScenarioId) {
  const exact = moments.find((moment) => moment.month === currentMonth && (!preferredScenarioId || moment.scenarioId === preferredScenarioId))
  if (exact) return exact

  const nearest = moments.find((moment) => moment.month >= currentMonth) ?? moments[0]
  return nearest
}

function pickNextMoment(moments: CalendarMoment[], currentMonth: number, preferredScenarioId?: BehaviorScenarioId) {
  const ordered = [...moments].sort((a, b) => a.month - b.month)
  const next = ordered.find((moment) => moment.month > currentMonth && (!preferredScenarioId || moment.scenarioId === preferredScenarioId))
  return next ?? ordered[0]
}

function capitalizeMonth(month: number) {
  const label = MONTH_LABELS[month]
  return label.charAt(0).toUpperCase() + label.slice(1)
}
