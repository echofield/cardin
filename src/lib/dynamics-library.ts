import { type BehaviorScenarioId, type EngineActivityId } from "@/lib/behavior-engine"

export type ProjectionFamily = "base_return" | "frequency_push" | "gap_fill" | "referral" | "collective"

export type MerchantIntent = "return" | "fill_gaps" | "attract" | "strong_moment" | "community"

export const INTENT_OPTIONS: { id: MerchantIntent; label: string }[] = [
  { id: "return", label: "Faire revenir mes clients" },
  { id: "fill_gaps", label: "Remplir les moments creux" },
  { id: "attract", label: "Attirer de nouveaux clients" },
  { id: "strong_moment", label: "Créer un moment fort" },
  { id: "community", label: "Activer la communauté" },
]

export type DynamicId =
  | "point_depart"
  | "defi_court"
  | "jour_mort_jour_fort"
  | "rendez_vous_hebdo"
  | "apporter_quelquun"
  | "moment_exceptionnel"
  | "acces_reserve"
  | "deblocage_collectif"
  | "rituel_saisonnier"
  | "acceleration_invisible"
  | "double_passage"
  | "chemin_rapide"
  | "moment_cache"
  | "moment_mensuel"
  | "passage_membre"

export type DynamicDefinition = {
  id: DynamicId
  cardTitle: string
  cardHook: string
  projectionFamily: ProjectionFamily
  intents: MerchantIntent[]
  showsCapFranchi: boolean
  phase2Only?: boolean
  ceQueCelaDeclenche: string
  quandLUtiliser: string
  commentCelaFonctionne: string
  ceQueCelaPeutChanger: string
  calculatorPrimaryEffect: string
  calculatorSecondaryEffect: string
  scenarioRole: string
}

const DYNAMICS: Record<DynamicId, DynamicDefinition> = {
  point_depart: {
    id: "point_depart",
    cardTitle: "Point de départ",
    cardHook: "Une base claire : vos clients comprennent tout de suite pourquoi revenir.",
    projectionFamily: "base_return",
    intents: ["return", "attract"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Une boucle de retour lisible dès le premier passage, sans jargon ni friction.",
    quandLUtiliser: "Au lancement, quand il faut expliquer vite la carte au comptoir et obtenir les premiers retours.",
    commentCelaFonctionne: "Un objectif de passages simple, une récompense crédible, une progression visible côté client.",
    ceQueCelaPeutChanger: "Moins d'abandon entre deux visites et un premier rythme de retour mesurable.",
    calculatorPrimaryEffect: "Premier rythme de retour plus stable",
    calculatorSecondaryEffect: "Les clients comprennent où ils vont",
    scenarioRole: "Installe la base crédible",
  },
  defi_court: {
    id: "defi_court",
    cardTitle: "Défi court",
    cardHook: "Réactiver la fréquence sur une fenêtre courte — avant que l'habitude ne se casse.",
    projectionFamily: "frequency_push",
    intents: ["return", "fill_gaps"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Un pic d'activité sur quelques jours pour rattraper les clients qui s'espacent.",
    quandLUtiliser: "Après un creux, une saison calme, ou quand la file de passage a besoin d'un coup de fouet.",
    commentCelaFonctionne: "Objectif de passages concentré dans le temps, récompense débloquée si la séquence est tenue.",
    ceQueCelaPeutChanger: "Plus de visites sur la même période sans promo permanente.",
    calculatorPrimaryEffect: "Fréquence relancée rapidement",
    calculatorSecondaryEffect: "Pic court mais net sur la période",
    scenarioRole: "Accélère le retour",
  },
  jour_mort_jour_fort: {
    id: "jour_mort_jour_fort",
    cardTitle: "Jour mort → jour fort",
    cardHook: "Et si votre jour le plus vide devenait le plus désirable ?",
    projectionFamily: "gap_fill",
    intents: ["fill_gaps", "return"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Une raison forte de venir un jour précis de la semaine.",
    quandLUtiliser: "Quand un service ou un créneau structure toute la rentabilité de la semaine.",
    commentCelaFonctionne: "Les passages comptent davantage — ou uniquement — sur ce jour pour débloquer la récompense.",
    ceQueCelaPeutChanger: "Moins de creux, une semaine plus équilibrée, sans casser vos pics existants.",
    calculatorPrimaryEffect: "Un jour faible mieux rempli",
    calculatorSecondaryEffect: "Charge redistribuée dans la semaine",
    scenarioRole: "Travaille un temps faible",
  },
  rendez_vous_hebdo: {
    id: "rendez_vous_hebdo",
    cardTitle: "Rendez-vous hebdo",
    cardHook: "Installer une habitude : un repère fixe dans la semaine.",
    projectionFamily: "gap_fill",
    intents: ["fill_gaps", "return", "community"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Un rythme hebdomadaire que le client peut anticiper.",
    quandLUtiliser: "Cafés, boulangeries, lieux où la routine quotidienne ou hebdo est naturelle.",
    commentCelaFonctionne: "Un passage par semaine (ou équivalent) compte jusqu'à la récompense.",
    ceQueCelaPeutChanger: "Présence plus régulière et prévisible sur vos créneaux clés.",
    calculatorPrimaryEffect: "Habitude hebdomadaire renforcée",
    calculatorSecondaryEffect: "Créneau plus mémorable",
    scenarioRole: "Ancre le rythme",
  },
  apporter_quelquun: {
    id: "apporter_quelquun",
    cardTitle: "Apporter quelqu'un",
    cardHook: "Faire entrer un nouveau visage — et déclencher une chaîne si la personne revient.",
    projectionFamily: "referral",
    intents: ["attract", "community"],
    showsCapFranchi: false,
    ceQueCelaDeclenche: "De la recommandation concrète : un nouveau client, puis une suite si le lien tient.",
    quandLUtiliser: "Quand vous voulez croître sans acheter du trafic, en vous appuyant sur votre base.",
    commentCelaFonctionne: "Le client amène quelqu'un ; si la personne revient, un avantage se débloque.",
    ceQueCelaPeutChanger: "Acquisition organique et bouche-à-oreille mesurable.",
    calculatorPrimaryEffect: "Nouveaux visages amenés par la base",
    calculatorSecondaryEffect: "Croissance sans média payant",
    scenarioRole: "Fait entrer du nouveau",
  },
  moment_exceptionnel: {
    id: "moment_exceptionnel",
    cardTitle: "Moment exceptionnel",
    cardHook: "Un pic d'attraction : seuil plus haut, récompense plus forte.",
    projectionFamily: "frequency_push",
    intents: ["strong_moment", "attract"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Un objectif qui vaut le détour, pour créer l'envie et le partage.",
    quandLUtiliser: "Lancement, événement, saison forte, ou besoin de faire parler de vous.",
    commentCelaFonctionne: "Un palier exigeant mène à une récompense très désirable, annoncée clairement.",
    ceQueCelaPeutChanger: "Plus d'attention, plus de nouveaux essais, sans dévaloriser le quotidien.",
    calculatorPrimaryEffect: "Pic d'attention et d'essais",
    calculatorSecondaryEffect: "Valeur perçue renforcée",
    scenarioRole: "Crée un pic d'attraction",
  },
  acces_reserve: {
    id: "acces_reserve",
    cardTitle: "Accès réservé",
    cardHook: "Certaines choses ne s'ouvrent qu'après un vrai engagement.",
    projectionFamily: "collective",
    intents: ["community", "strong_moment"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "De l'exclusivité : un statut ou un déblocage après X passages.",
    quandLUtiliser: "Positionnement premium, file d'attente, expérience limitée.",
    commentCelaFonctionne: "Une récompense ou un accès réservé aux clients qui ont atteint le cap.",
    ceQueCelaPeutChanger: "Plus de désir, moins de sensation de promo générique.",
    calculatorPrimaryEffect: "Engagement plus qualifié",
    calculatorSecondaryEffect: "Exclusivité qui protège la marque",
    scenarioRole: "Récompense l'engagement",
  },
  deblocage_collectif: {
    id: "deblocage_collectif",
    cardTitle: "Déblocage collectif",
    cardHook: "Quand l'activité monte, tout le monde voit ce qui s'ouvre.",
    projectionFamily: "collective",
    intents: ["community", "attract"],
    showsCapFranchi: false,
    ceQueCelaDeclenche: "Un objectif partagé : les passages cumulés font avancer une récompense commune.",
    quandLUtiliser: "Lieux avec clientèle régulière, effet de groupe, besoin de momentum visible.",
    commentCelaFonctionne: "Un compteur collectif ; à seuil atteint, un avantage pour les participants ou pour tous.",
    ceQueCelaPeutChanger: "Effet de groupe, bouche-à-oreille et engagement renforcés.",
    calculatorPrimaryEffect: "Effet de groupe et momentum",
    calculatorSecondaryEffect: "Visibilité sur l'objectif commun",
    scenarioRole: "Mobilise la communauté",
  },
  rituel_saisonnier: {
    id: "rituel_saisonnier",
    cardTitle: "Rituel saisonnier",
    cardHook: "Un moment attendu dans l'année — pas une promo éternelle.",
    projectionFamily: "frequency_push",
    intents: ["strong_moment", "fill_gaps"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Une boucle limitée dans le temps, calée sur une saison ou une période.",
    quandLUtiliser: "Saisonnalité forte (été, fêtes, rentrée, soldes).",
    commentCelaFonctionne: "Règles claires sur la période ; récompense alignée avec l'ambiance du moment.",
    ceQueCelaPeutChanger: "Anticipation et retour cyclique sans épuiser l'offre.",
    calculatorPrimaryEffect: "Pic saisonnier maîtrisé",
    calculatorSecondaryEffect: "Meilleure régularité d'une saison à l'autre",
    scenarioRole: "Cadre le temps fort",
  },
  acceleration_invisible: {
    id: "acceleration_invisible",
    cardTitle: "Accélération invisible",
    cardHook: "La progression peut accélérer discrètement pour récompenser la constance.",
    projectionFamily: "frequency_push",
    intents: ["return", "strong_moment"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Une surprise positive pour les clients les plus réguliers.",
    quandLUtiliser: "Quand vous voulez fidéliser sans afficher une mécanique agressive.",
    commentCelaFonctionne: "Après une série de passages cohérents, un coup de pouce côté progression ou récompense.",
    ceQueCelaPeutChanger: "Sentiment de générosité perçue et moins d'attrition silencieuse.",
    calculatorPrimaryEffect: "Fidèles mieux récompensés",
    calculatorSecondaryEffect: "Effet wow sans bruit",
    scenarioRole: "Récompense la constance",
  },
  double_passage: {
    id: "double_passage",
    cardTitle: "Double passage",
    cardHook: "Deux visites rapprochées qui changent la suite.",
    projectionFamily: "frequency_push",
    intents: ["return", "fill_gaps"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Compresse le temps entre deux visites pour réinstaller l'habitude.",
    quandLUtiliser: "Fréquence naturellement basse ou après une longue absence.",
    commentCelaFonctionne: "Si deux passages ont lieu dans une fenêtre courte, la progression accélère ou se débloque.",
    ceQueCelaPeutChanger: "Cycle de retour plus court sans harceler.",
    calculatorPrimaryEffect: "Intervalle entre visites réduit",
    calculatorSecondaryEffect: "Réactivation plus rapide",
    scenarioRole: "Resserre le cycle",
  },
  chemin_rapide: {
    id: "chemin_rapide",
    cardTitle: "Chemin rapide",
    cardHook: "Une trajectoire plus courte pour vos meilleurs clients.",
    projectionFamily: "base_return",
    intents: ["return", "attract"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Reconnaissance des clients à forte valeur sans compliquer la carte pour les autres.",
    quandLUtiliser: "Panier élevé, rendez-vous longs, ou clients très réguliers.",
    commentCelaFonctionne: "Un parcours alternatif avec moins d'étapes ou des étapes qui comptent double.",
    ceQueCelaPeutChanger: "Rétention des tops clients et panier mieux protégé.",
    calculatorPrimaryEffect: "Trajet raccourci pour une partie de la base",
    calculatorSecondaryEffect: "Meilleure rétention haut de panier",
    scenarioRole: "Priorise la valeur",
  },
  moment_cache: {
    id: "moment_cache",
    cardTitle: "Moment caché",
    cardHook: "Ceux qui savent, savent — sans affichage bruyant.",
    projectionFamily: "gap_fill",
    intents: ["strong_moment", "community"],
    showsCapFranchi: false,
    ceQueCelaDeclenche: "Du bouche-à-oreille : une condition discrète débloque l'avantage.",
    quandLUtiliser: "Marque qui assume le jeu et veut récompenser l'attention.",
    commentCelaFonctionne: "Condition non affichée partout (jour, comportement, mot-clé) validée au passage.",
    ceQueCelaPeutChanger: "Effet découverte et partage organique.",
    calculatorPrimaryEffect: "Intrigue et recommandation naturelle",
    calculatorSecondaryEffect: "Moins de banalisation de l'offre",
    scenarioRole: "Crée du mystère utile",
  },
  moment_mensuel: {
    id: "moment_mensuel",
    cardTitle: "Moment mensuel",
    cardHook: "Un rendez-vous attendu chaque mois dans votre calendrier.",
    projectionFamily: "collective",
    intents: ["strong_moment", "return"],
    showsCapFranchi: true,
    ceQueCelaDeclenche: "Un pic d'attention récurrent sans tomber dans la promo permanente.",
    quandLUtiliser: "Quand vous voulez un sujet de conversation régulier au comptoir ou en salle.",
    commentCelaFonctionne: "Un objectif ou une récompense mise en avant sur un rythme mensuel.",
    ceQueCelaPeutChanger: "Régularité et désir sur le long terme.",
    calculatorPrimaryEffect: "Rythme mensuel plus lisible",
    calculatorSecondaryEffect: "Sujet de retour récurrent",
    scenarioRole: "Cadre le mois",
  },
  passage_membre: {
    id: "passage_membre",
    cardTitle: "Passage membre",
    cardHook: "D'un client à un membre — accès ou carte évolutive.",
    projectionFamily: "referral",
    intents: ["strong_moment", "community"],
    showsCapFranchi: false,
    phase2Only: true,
    ceQueCelaDeclenche: "Un statut plus fort : adhésion, carte payante ou privilèges durables.",
    quandLUtiliser: "Beauté, sport, clubs, créateurs — quand l'identité et l'accès comptent plus que le tampon.",
    commentCelaFonctionne: "Évolution vers un niveau membre avec règles claires et avantages durables.",
    ceQueCelaPeutChanger: "Rétention plus profonde et valeur vie client.",
    calculatorPrimaryEffect: "Passage à un statut plus engagé",
    calculatorSecondaryEffect: "Modèle plus proche d'un club",
    scenarioRole: "Évolution vers membre",
  },
}

const PRIMARY_DYNAMIC_IDS: DynamicId[] = (Object.keys(DYNAMICS) as DynamicId[]).filter((id) => id !== "passage_membre")

export function dynamicToLegacyScenarioId(dynamicId: DynamicId): BehaviorScenarioId {
  const map: Record<DynamicId, BehaviorScenarioId> = {
    point_depart: "starting_loop",
    chemin_rapide: "starting_loop",
    defi_court: "short_challenge",
    acceleration_invisible: "short_challenge",
    double_passage: "short_challenge",
    apporter_quelquun: "short_challenge",
    jour_mort_jour_fort: "weekly_rendezvous",
    rendez_vous_hebdo: "weekly_rendezvous",
    moment_cache: "weekly_rendezvous",
    moment_exceptionnel: "monthly_gain",
    acces_reserve: "monthly_gain",
    deblocage_collectif: "monthly_gain",
    rituel_saisonnier: "monthly_gain",
    moment_mensuel: "monthly_gain",
    passage_membre: "monthly_gain",
  }
  return map[dynamicId]
}

const DEFAULT_BY_INTENT: Record<MerchantIntent, DynamicId[]> = {
  return: ["point_depart", "defi_court", "double_passage"],
  fill_gaps: ["jour_mort_jour_fort", "rendez_vous_hebdo", "moment_cache"],
  attract: ["apporter_quelquun", "moment_exceptionnel", "point_depart"],
  strong_moment: ["moment_exceptionnel", "rituel_saisonnier", "moment_mensuel"],
  community: ["deblocage_collectif", "acces_reserve", "rendez_vous_hebdo"],
}

const MERCHANT_INTENT_FIRST: Partial<Record<EngineActivityId, Partial<Record<MerchantIntent, DynamicId>>>> = {
  restaurant: {
    fill_gaps: "jour_mort_jour_fort",
    attract: "apporter_quelquun",
    return: "point_depart",
  },
  cafe: {
    return: "rendez_vous_hebdo",
    fill_gaps: "rendez_vous_hebdo",
    strong_moment: "moment_exceptionnel",
  },
  bar: {
    return: "rendez_vous_hebdo",
    fill_gaps: "jour_mort_jour_fort",
    strong_moment: "moment_exceptionnel",
  },
  boulangerie: {
    fill_gaps: "jour_mort_jour_fort",
    return: "point_depart",
  },
  coiffeur: {
    return: "chemin_rapide",
    strong_moment: "moment_mensuel",
    fill_gaps: "double_passage",
  },
  "institut-beaute": {
    return: "double_passage",
    strong_moment: "moment_mensuel",
    attract: "moment_exceptionnel",
  },
  boutique: {
    attract: "moment_exceptionnel",
    return: "point_depart",
    community: "acces_reserve",
  },
}

export function getDynamicDefinition(id: DynamicId): DynamicDefinition {
  return DYNAMICS[id]
}

export function getPrimaryDynamicDefinitions(): DynamicDefinition[] {
  return PRIMARY_DYNAMIC_IDS.map((id) => DYNAMICS[id])
}

export function getExpandedDynamicDefinitions(): DynamicDefinition[] {
  return (Object.keys(DYNAMICS) as DynamicId[]).map((id) => DYNAMICS[id])
}

export function getRecommendedDynamicIds(intent: MerchantIntent, merchantType: string): DynamicId[] {
  const activityId = merchantType as EngineActivityId
  const preferred = MERCHANT_INTENT_FIRST[activityId]?.[intent]
  const pool = [...DEFAULT_BY_INTENT[intent]]

  if (preferred && pool.includes(preferred)) {
    const rest = pool.filter((id) => id !== preferred)
    return [preferred, ...rest].slice(0, 3)
  }

  return pool.slice(0, 3)
}

export function getStrongestRecommendedDynamicId(intent: MerchantIntent, merchantType: string): DynamicId {
  return getRecommendedDynamicIds(intent, merchantType)[0]
}

export function isPhase2Dynamic(id: DynamicId): boolean {
  return DYNAMICS[id].phase2Only === true
}
