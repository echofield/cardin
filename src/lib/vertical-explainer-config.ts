import type { LandingWorldId } from "@/lib/landing-content"
import type { ParcoursSummitStyleId } from "@/lib/parcours-contract"

export type VerticalExplainerLever = "group_events" | "identity" | "frequency" | "basket" | "time_shifting"
export type VerticalExplainerTone = "default" | "blue" | "gold"
export type ProtocolMappingToken =
  | `lever:${VerticalExplainerLever}`
  | `loop:${"entry" | "return" | "propagation" | "activation" | "identity"}`
  | "diamond:architecture"
  | "diamond:bounded_token"
  | "mission:group_event"
  | "mission:time_shift"
  | "role:progression"
  | "identity:factor"
  | "budget:bounded_activation"
  | "revenue:gp_direct"
  | "revenue:gp_uplift"
  | "revenue:gp_prop"
  | "revenue:gp_mission"

export type VerticalExplainerConfig = {
  segment: LandingWorldId
  merchantFacingTopLayerLabel: string
  seasonReward: {
    title: string
    summary: string
    merchantFraming: string
    examples: string[]
    options: Array<{
      id: string
      title: string
      promise: string
      merchantMeaning: string
    }>
  }
  diamondMeaning: { title: string; summary: string; concreteExamples: string[] }
  roleProgressionSummary: { steps: Array<{ label: string; meaning: string }> }
  primaryLevers: VerticalExplainerLever[]
  mechanics: Array<{
    id: string
    title: string
    summary: string
    clientAction: string
    systemAction: string
    merchantMeaning: string
    protocolMapping: ProtocolMappingToken[]
    engineEffect: string
    tone: VerticalExplainerTone
  }>
  timedWindowExamples: string[]
  groupEventExamples: string[]
  identityExamples: string[]
  merchantExplanationCopy: {
    whatSeasonRewardDoes: string
    whatDiamondMeans: string
    rewardVsDiamond: string
    whatMechanicsDo: string
    revenueConnection: string
    budgetConstraint: string
  }
  summitModes: Record<ParcoursSummitStyleId, {
    id: ParcoursSummitStyleId
    badge: string
    title: string
    summary: string
    merchantMeaning: string
    protocolMapping: ProtocolMappingToken[]
    engineEffect: string
    tone: VerticalExplainerTone
  }>
}

const PROTOCOL_LABELS: Record<string, string> = {
  "lever:group_events": "Levier · groupe",
  "lever:identity": "Levier · identité",
  "lever:frequency": "Levier · fréquence",
  "lever:basket": "Levier · panier",
  "lever:time_shifting": "Levier · time-shift",
  "loop:entry": "Boucle · entrée",
  "loop:return": "Boucle · retour",
  "loop:propagation": "Boucle · propagation",
  "loop:activation": "Boucle · activation",
  "loop:identity": "Boucle · identité",
  "diamond:architecture": "Architecture Diamond",
  "diamond:bounded_token": "Token Diamond borné",
  "mission:group_event": "Mission groupe",
  "mission:time_shift": "Mission time-shift",
  "role:progression": "Progression des rôles",
  "identity:factor": "Facteur d'identité",
  "budget:bounded_activation": "Activation bornée",
  "revenue:gp_direct": "GP_direct",
  "revenue:gp_uplift": "GP_uplift",
  "revenue:gp_prop": "GP_prop",
  "revenue:gp_mission": "GP_mission",
}

const LEVER_LABELS: Record<VerticalExplainerLever, string> = {
  group_events: "Événements de groupe",
  identity: "Identité / statut",
  frequency: "Fréquence",
  basket: "Panier moyen",
  time_shifting: "Créneaux faibles",
}

const BASE_CONFIG: Record<Exclude<LandingWorldId, "boulangerie" | "caviste">, VerticalExplainerConfig> = {
  cafe: {
    segment: "cafe",
    merchantFacingTopLayerLabel: "Diamond et récompense de saison",
    seasonReward: {
      title: "Récompense de saison café",
      summary: "Le client voit dès le départ qu'une vraie saison peut mener à un bénéfice rare, visible et rentable pour le lieu.",
      merchantFraming: "La récompense de saison crée le désir. Diamond décide quels clients deviennent éligibles et avec quel niveau de privilège.",
      examples: ["1 café offert / jour pendant 1 an", "1 petit-déjeuner / semaine pendant 1 an"],
      options: [
        { id: "signature-monthly", title: "Café signature", promise: "1 café signature offert par mois pendant 1 an.", merchantMeaning: "Une récompense simple, visible, qui donne une raison nette de revenir sans casser votre marge." },
        { id: "duo-morning", title: "Petit-déjeuner duo", promise: "1 petit-déjeuner duo par mois pendant 1 an.", merchantMeaning: "Une récompense plus sociale qui ouvre le matin calme et la venue à deux." },
        { id: "hidden-cellar", title: "Accès réservé", promise: "Un privilège café réservé aux meilleurs clients sur la saison.", merchantMeaning: "Une version plus discrète, gardée pour les clients déjà engagés." },
      ],
    },
    diamondMeaning: {
      title: "Diamond = Régulier, Insider, puis Host",
      summary: "Dans un café, Diamond ne veut pas dire remise. Cela décrit un client qui revient mieux, accepte des créneaux utiles et peut ouvrir un petit cercle autour du lieu.",
      concreteExamples: ["revient un mardi à 15h", "teste la boisson signature", "invite une personne pour un duo du matin"],
    },
    roleProgressionSummary: {
      steps: [
        { label: "Visiteur", meaning: "premier passage validé" },
        { label: "Régulier", meaning: "revient sans relance lourde" },
        { label: "Insider", meaning: "attend un signe du lieu" },
        { label: "Host", meaning: "peut ouvrir un petit moment à deux" },
      ],
    },
    primaryLevers: ["frequency", "time_shifting", "identity", "group_events"],
    mechanics: [
      {
        id: "first-return",
        title: "Le client revient avant que le parcours refroidisse",
        summary: "Le premier retour est sécurisé tôt, pas laissé au hasard.",
        clientAction: "Le client repasse après une première visite validée.",
        systemAction: "Cardin ouvre une progression dès le premier vrai passage et remet un horizon lisible devant lui.",
        merchantMeaning: "Vous ne laissez plus les nouveaux clients retomber dans l'oubli après l'essai.",
        protocolMapping: ["loop:entry", "loop:return", "lever:frequency", "revenue:gp_direct"],
        engineEffect: "GP_direct ↑",
        tone: "default",
      },
      {
        id: "early-trigger",
        title: "Un petit déclencheur peut arriver tôt",
        summary: "Le client peut recevoir un signe utile avant une longue série de visites.",
        clientAction: "Il sent qu'il peut gagner quelque chose dès le début du parcours.",
        systemAction: "Le moteur place des activations légères et bornées sur les visites précoces.",
        merchantMeaning: "L'attention reste active parce que le parcours n'attend pas la 10e visite pour devenir intéressant.",
        protocolMapping: ["loop:activation", "lever:frequency", "budget:bounded_activation", "revenue:gp_mission"],
        engineEffect: "activation précoce ↑",
        tone: "gold",
      },
      {
        id: "dead-hours",
        title: "Le retour peut remplir un créneau faible",
        summary: "Une partie des retours est déplacée vers les heures moins chargées.",
        clientAction: "Le client revient sur un moment plus calme, utile pour vous.",
        systemAction: "Cardin pousse certaines missions sur 14h-16h ou sur un matin plus lent.",
        merchantMeaning: "Vous lissez l'après-midi sans promo ouverte.",
        protocolMapping: ["lever:time_shifting", "loop:activation", "mission:time_shift", "revenue:gp_mission"],
        engineEffect: "GP_mission ↑",
        tone: "default",
      },
      {
        id: "small-propagation",
        title: "Le client peut amener une personne",
        summary: "La propagation reste courte, utile et contrôlée.",
        clientAction: "Un bon client invite une personne pour un café ou un duo du matin.",
        systemAction: "Le rôle Host ouvre une propagation bornée, jamais massive.",
        merchantMeaning: "Le café gagne un deuxième ticket par le réseau du client, sans perdre la maîtrise.",
        protocolMapping: ["lever:group_events", "loop:propagation", "diamond:architecture", "revenue:gp_prop"],
        engineEffect: "GP_prop ↑",
        tone: "blue",
      },
      {
        id: "host-season",
        title: "Le meilleur client vise Diamond puis la récompense de saison",
        summary: "Le haut du parcours n'est pas abstrait : il mène à l'éligibilité puis à la récompense majeure.",
        clientAction: "Le client comprend qu'il peut monter vers Host puis viser la récompense de saison.",
        systemAction: "La progression des rôles et l'architecture Diamond filtrent les accès et gardent la rareté.",
        merchantMeaning: "Vous créez du désir durable avec un budget borné.",
        protocolMapping: ["loop:identity", "role:progression", "diamond:architecture", "diamond:bounded_token"],
        engineEffect: "valeur perçue ↑",
        tone: "gold",
      },
    ],
    timedWindowExamples: ["14h-16h", "matin calme"],
    groupEventExamples: ["duo du matin", "pause café à deux"],
    identityExamples: ["devenir Régulier", "passer Insider", "débloquer Host"],
    merchantExplanationCopy: {
      whatSeasonRewardDoes: "Dans un café, la saison doit montrer une vraie récompense rare, lisible et facile à raconter. C'est elle qui donne envie de rejouer la carte.",
      whatDiamondMeans: "Diamond désigne ici un rôle de retour et d'invitation légère : Régulier, Insider, puis Host.",
      rewardVsDiamond: "La récompense de saison attire. Diamond décide qui peut y accéder et quand le système ouvre un vrai privilège.",
      whatMechanicsDo: "Le parcours crée un premier retour, garde l'attention active avec de petits déclencheurs, remplit quelques heures faibles et fait monter les meilleurs clients vers Host.",
      revenueConnection: "Le revenu vient de la fréquence récupérée, d'un peu plus de panier et d'une petite propagation bien maîtrisée.",
      budgetConstraint: "Récompense majeure rare, activations légères, invitations plafonnées et budget toujours borné.",
    },
    summitModes: {
      visible: { id: "visible", badge: "Récompense affichée", title: "Le client voit clairement ce qu'il peut viser", summary: "La récompense de saison est expliquée tôt et la progression reste lisible.", merchantMeaning: "Motivation plus directe, retour plus facile à enclencher.", protocolMapping: ["loop:return", "diamond:bounded_token", "lever:identity"], engineEffect: "traction retour ↑", tone: "gold" },
      stronger: { id: "stronger", badge: "Récompense amplifiée", title: "La récompense parle plus fort", summary: "Le message et la récompense sont plus visibles et plus sociaux.", merchantMeaning: "Plus de conversation et plus d'effet duo sur les retours utiles.", protocolMapping: ["lever:group_events", "lever:time_shifting", "loop:activation", "revenue:gp_mission"], engineEffect: "activation sociale ↑", tone: "gold" },
      discreet: { id: "discreet", badge: "Récompense sélective", title: "La récompense reste plus discrète", summary: "Le bénéfice existe mais n'est montré qu'aux bons profils et au bon moment.", merchantMeaning: "Vous gardez la rareté et protégez mieux la marge.", protocolMapping: ["lever:identity", "loop:activation", "budget:bounded_activation"], engineEffect: "budget protégé", tone: "default" },
    },
  },
  bar: {
    segment: "bar",
    merchantFacingTopLayerLabel: "Diamond et récompense de saison",
    seasonReward: {
      title: "Récompense de saison bar",
      summary: "Le client doit voir une vraie promesse de soirée : quelque chose de rare, visible et assez fort pour recréer le rendez-vous.",
      merchantFraming: "La récompense de saison donne envie. Diamond reste la couche d'accès, de sélection et d'activation qui protège la rareté du bar.",
      examples: ["1 bouteille / mois pendant 6 mois", "1 soirée privilège / mois pendant 6 mois"],
      options: [
        { id: "signature-monthly", title: "Création de saison", promise: "1 cocktail ou création signature par mois pendant 1 an.", merchantMeaning: "Une raison claire de revenir au bar sans tomber dans la remise large." },
        { id: "duo-soir", title: "Soirée duo", promise: "1 soirée duo privilégiée par mois pendant 1 an.", merchantMeaning: "Une récompense qui pousse le retour à deux ou en petit groupe sur les bonnes soirées." },
        { id: "hidden-bar", title: "Accès de comptoir", promise: "Un privilège de comptoir réservé aux meilleurs clients sur la saison.", merchantMeaning: "Une version plus discrète, très contrôlée, pensée pour garder la tension sociale." },
      ],
    },
    diamondMeaning: {
      title: "Diamond = accès, statut et droits d'activation",
      summary: "Dans un bar, Diamond correspond à une couche d'accès : fenêtres horaires, privilèges de comptoir, invitations cadrées et activations choisies.",
      concreteExamples: ["mardi soir ciblé", "activation anniversaire", "moment bouteille ou duo borné"],
    },
    roleProgressionSummary: {
      steps: [
        { label: "Passage", meaning: "sortie isolée" },
        { label: "Régulier du soir", meaning: "revient sur un créneau identifié" },
        { label: "Insider comptoir", meaning: "suit les fenêtres utiles" },
        { label: "Host de soirée", meaning: "peut ouvrir un duo ou un petit groupe" },
      ],
    },
    primaryLevers: ["frequency", "time_shifting", "group_events", "identity"],
    mechanics: [
      {
        id: "night-return",
        title: "Le client reprend une habitude de soirée",
        summary: "Le passage isolé redevient un retour reconnu dans la semaine.",
        clientAction: "Il revient sur un soir où vous avez besoin d'activité.",
        systemAction: "Le moteur installe une boucle de retour au lieu de laisser chaque sortie repartir à zéro.",
        merchantMeaning: "Vous recréez un rendez-vous de bar plutôt qu'une visite accidentelle.",
        protocolMapping: ["loop:return", "lever:frequency", "revenue:gp_direct"],
        engineEffect: "GP_direct ↑",
        tone: "default",
      },
      {
        id: "early-night-trigger",
        title: "Une activation légère peut arriver tôt",
        summary: "Le client sent vite qu'il peut gagner quelque chose de réel.",
        clientAction: "Il reçoit tôt un signe du système, pas après une longue attente.",
        systemAction: "Cardin ouvre de petites activations bornées avant que le parcours perde son énergie.",
        merchantMeaning: "L'attention reste active et la conversation commence tôt.",
        protocolMapping: ["loop:activation", "budget:bounded_activation", "lever:identity", "revenue:gp_mission"],
        engineEffect: "attention active ↑",
        tone: "gold",
      },
      {
        id: "timed-window",
        title: "Le système peut remplir un mardi ou un début de service",
        summary: "Les retours sont déplacés vers vos soirs mous.",
        clientAction: "Le client revient sur une fenêtre choisie plutôt qu'uniquement le pic naturel.",
        systemAction: "Le moteur déclenche des fenêtres de time-shift sur les soirs faibles ou les débuts de soirée.",
        merchantMeaning: "Vous redonnez de la densité aux mauvais soirs sans promo ouverte.",
        protocolMapping: ["lever:time_shifting", "loop:activation", "mission:time_shift", "revenue:gp_mission"],
        engineEffect: "GP_mission ↑",
        tone: "default",
      },
      {
        id: "group-night",
        title: "Le client ouvre un duo, un anniversaire ou un petit groupe",
        summary: "Le réseau du bar commence à produire du chiffre, pas juste du bruit.",
        clientAction: "Le bon client vient avec une ou plusieurs personnes sur un moment utile.",
        systemAction: "Diamond active des missions de groupe courtes, cadrées et à coût borné.",
        merchantMeaning: "Un seul bon client peut faire remonter plusieurs consommations sur une soirée choisie.",
        protocolMapping: ["lever:group_events", "loop:activation", "loop:propagation", "mission:group_event", "revenue:gp_prop"],
        engineEffect: "GP_prop ↑",
        tone: "blue",
      },
      {
        id: "diamond-selection",
        title: "Le haut du parcours reste sélectif",
        summary: "Tout le monde ne voit pas tout. C'est ce qui garde la valeur.",
        clientAction: "Le client comprend qu'il peut viser l'accès Diamond puis la récompense de saison.",
        systemAction: "L'architecture Diamond filtre les droits d'activation, les fenêtres et l'éligibilité au récompense majeure.",
        merchantMeaning: "Vous gardez la désirabilité sociale du bar au lieu de banaliser le privilège.",
        protocolMapping: ["loop:identity", "diamond:architecture", "diamond:bounded_token", "role:progression"],
        engineEffect: "rareté protégée",
        tone: "gold",
      },
    ],
    timedWindowExamples: ["mardi soir", "début de service"],
    groupEventExamples: ["duo du soir", "moment anniversaire", "table haute"],
    identityExamples: ["être reconnu au comptoir", "devenir Host de soirée"],
    merchantExplanationCopy: {
      whatSeasonRewardDoes: "Dans un bar, la saison doit montrer une vraie promesse de soirée. Sans attracteur visible, le client n'a aucune raison de réinstaller une habitude.",
      whatDiamondMeans: "Diamond veut dire accès, statut et droits d'activation. Ce n'est pas la récompense elle-même.",
      rewardVsDiamond: "La récompense de saison crée le désir. Diamond décide qui peut ouvrir une fenêtre, un duo, un groupe ou une activation rare.",
      whatMechanicsDo: "Le parcours recrée une habitude de soirée, place des activations tôt, remplit quelques soirs faibles et transforme les bons clients en moteurs de groupe.",
      revenueConnection: "Le revenu vient du retour de soirée, des groupes utiles et d'une propagation qui reste courte et contrôlée.",
      budgetConstraint: "Accès limités, activations choisies, coût de récompense séparé et budget toujours borné.",
    },
    summitModes: {
      visible: { id: "visible", badge: "Récompense affichée", title: "La promesse est claire pour le client", summary: "Le client voit nettement la récompense saisonnière et la progression vers elle.", merchantMeaning: "Motivation plus directe, meilleur retour de semaine.", protocolMapping: ["loop:return", "lever:identity", "diamond:bounded_token"], engineEffect: "retour plus lisible", tone: "gold" },
      stronger: { id: "stronger", badge: "Récompense amplifiée", title: "La promesse pousse plus fort la conversation", summary: "La récompense et son message sont plus sociaux, plus visibles et plus partageables.", merchantMeaning: "Plus d'effet groupe, d'invitations et de conversation autour du bar.", protocolMapping: ["lever:group_events", "lever:time_shifting", "loop:activation", "revenue:gp_mission"], engineEffect: "effet groupe ↑", tone: "gold" },
      discreet: { id: "discreet", badge: "Récompense sélective", title: "La promesse reste réservée", summary: "Le bénéfice existe mais reste montré à peu de profils et à peu de moments.", merchantMeaning: "Vous gardez la tension sociale et protégez mieux la marge.", protocolMapping: ["lever:identity", "loop:activation", "budget:bounded_activation"], engineEffect: "rareté protégée", tone: "default" },
    },
  },
  restaurant: {
    segment: "restaurant",
    merchantFacingTopLayerLabel: "Diamond et récompense de saison",
    seasonReward: {
      title: "Récompense de saison restaurant",
      summary: "Le client doit voir qu'une vraie saison peut mener à une table rare ou à un dîner qui compte vraiment.",
      merchantFraming: "La récompense de saison attire. Diamond décrit les clients reconnus qui deviennent éligibles et capables d'ouvrir des réservations utiles.",
      examples: ["1 dîner offert / mois pendant 6 mois", "1 dîner / semaine pendant 3 mois"],
      options: [
        { id: "table-monthly", title: "Dîner signature", promise: "1 dîner signature par mois pendant 1 an.", merchantMeaning: "Une récompense forte, lisible, qui donne une vraie raison de revenir entre deux occasions." },
        { id: "chef-table", title: "Table du chef", promise: "1 table du chef réservée par mois pendant 1 an.", merchantMeaning: "Une version plus forte, plus sociale, qui pousse la réservation à plusieurs." },
        { id: "secret-menu", title: "Menu réservé", promise: "Un privilège de table ou menu réservé aux meilleurs clients sur la saison.", merchantMeaning: "Une version plus discrète qui garde la rareté et la désirabilité." },
      ],
    },
    diamondMeaning: {
      title: "Diamond = VIP puis Organisateur",
      summary: "Dans un restaurant, Diamond correspond à un client reconnu qui réserve mieux, revient entre deux occasions et finit par organiser des repas pour d'autres.",
      concreteExamples: ["retour un mardi soir", "dîner pour 4", "table ou menu réservé"],
    },
    roleProgressionSummary: {
      steps: [
        { label: "Invité", meaning: "occasion isolée" },
        { label: "Habitué", meaning: "revient entre deux occasions" },
        { label: "VIP", meaning: "attend de la reconnaissance" },
        { label: "Organisateur", meaning: "réserve pour d'autres" },
      ],
    },
    primaryLevers: ["frequency", "identity", "group_events", "time_shifting", "basket"],
    mechanics: [
      {
        id: "return-between-occasions",
        title: "Le client revient entre deux occasions",
        summary: "Le restaurant ne dépend plus uniquement des grandes dates.",
        clientAction: "Le client revient plus tôt qu'avant, sans attendre la prochaine grande occasion.",
        systemAction: "Cardin réduit l'intervalle entre deux repas en gardant une progression vivante.",
        merchantMeaning: "Vous récupérez des tables qui seraient restées silencieuses.",
        protocolMapping: ["loop:return", "lever:frequency", "revenue:gp_direct"],
        engineEffect: "GP_direct ↑",
        tone: "default",
      },
      {
        id: "vip-recognition",
        title: "Le client sent qu'il monte en reconnaissance",
        summary: "Le statut change la qualité du retour et la façon de réserver.",
        clientAction: "Il comprend qu'il n'est plus un simple passage, mais un client attendu.",
        systemAction: "Le moteur fait monter le client en VIP puis en Organisateur, avec un vrai facteur d'identité.",
        merchantMeaning: "La confiance augmente, le panier suit mieux et le client accepte plus facilement vos codes maison.",
        protocolMapping: ["lever:identity", "loop:identity", "role:progression", "identity:factor", "revenue:gp_uplift"],
        engineEffect: "GP_uplift ↑",
        tone: "gold",
      },
      {
        id: "midweek-fill",
        title: "Le système peut remplir un service faible",
        summary: "Une partie des retours se déplace vers mardi ou mercredi.",
        clientAction: "Le client revient sur un service plus calme où vous avez du levier.",
        systemAction: "Cardin place des missions de time-shift sur les services faibles.",
        merchantMeaning: "Vous lissez le milieu de semaine sans brader le restaurant.",
        protocolMapping: ["lever:time_shifting", "loop:activation", "mission:time_shift", "revenue:gp_mission"],
        engineEffect: "service faible ↑",
        tone: "default",
      },
      {
        id: "group-dinner",
        title: "Le client finit par organiser un repas",
        summary: "La propagation passe par une vraie table, pas par du volume vide.",
        clientAction: "Le bon client réserve pour 2, 4 ou un petit groupe sur une occasion réelle.",
        systemAction: "Diamond ouvre des missions de groupe et transforme le meilleur client en Organisateur.",
        merchantMeaning: "Une table de groupe vaut beaucoup plus qu'une simple visite individuelle.",
        protocolMapping: ["lever:group_events", "loop:activation", "loop:propagation", "mission:group_event", "revenue:gp_mission", "revenue:gp_prop"],
        engineEffect: "levier groupe ↑",
        tone: "blue",
      },
      {
        id: "season-reward-access",
        title: "Le haut du parcours mène à l'éligibilité récompense",
        summary: "Le client voit une table ou un dîner fort, mais l'accès reste filtré.",
        clientAction: "Le client sait qu'il peut viser la récompense majeure de la saison.",
        systemAction: "Diamond filtre l'accès, protège le budget et maintient la rareté du restaurant.",
        merchantMeaning: "Vous créez du désir durable sans transformer le lieu en promo permanente.",
        protocolMapping: ["diamond:architecture", "diamond:bounded_token", "budget:bounded_activation", "loop:identity"],
        engineEffect: "valeur perçue ↑",
        tone: "gold",
      },
    ],
    timedWindowExamples: ["mardi soir", "mercredi midi"],
    groupEventExamples: ["dîner pour 4", "table du chef", "occasion anniversaire"],
    identityExamples: ["être reconnu VIP", "passer Organisateur"],
    merchantExplanationCopy: {
      whatSeasonRewardDoes: "Dans un restaurant, la saison doit montrer une vraie table à gagner. Sinon le client ne perçoit pas la valeur de la trajectoire.",
      whatDiamondMeans: "Diamond veut dire VIP puis Organisateur : un client reconnu qui ne revient plus seul.",
      rewardVsDiamond: "La récompense de saison attire. Diamond décide quels clients deviennent éligibles, quand une table s'ouvre et comment la rareté reste défendable.",
      whatMechanicsDo: "Le parcours récupère des retours entre deux occasions, fait monter le client en reconnaissance, remplit certains services faibles et déclenche des repas de groupe.",
      revenueConnection: "Le revenu vient des tables récupérées, d'un panier mieux assumé et des missions Organisateur qui remplissent mieux le planning.",
      budgetConstraint: "Récompense majeure rare, enveloppe bornée, saturation surveillée et progression qui continue même si les rewards se figent.",
    },
    summitModes: {
      visible: { id: "visible", badge: "Récompense affichée", title: "Le client voit clairement la table qu'il peut viser", summary: "La promesse de table ou dîner est lisible dès le départ.", merchantMeaning: "La motivation de retour devient immédiate.", protocolMapping: ["loop:return", "lever:identity", "diamond:bounded_token"], engineEffect: "retour accéléré", tone: "gold" },
      stronger: { id: "stronger", badge: "Récompense amplifiée", title: "La promesse pousse plus fort les réservations", summary: "La récompense est plus forte et plus conversationnelle, donc plus puissante sur les repas organisés.", merchantMeaning: "Plus d'effet groupe et plus de réservations déclenchées.", protocolMapping: ["lever:group_events", "loop:activation", "mission:group_event", "revenue:gp_mission"], engineEffect: "missions groupe ↑", tone: "gold" },
      discreet: { id: "discreet", badge: "Récompense sélective", title: "La promesse reste réservée", summary: "Le client comprend qu'il existe une vraie valeur, mais pas affichée à tout le monde.", merchantMeaning: "Vous gardez la désirabilité et la maîtrise du coût.", protocolMapping: ["lever:identity", "loop:activation", "budget:bounded_activation"], engineEffect: "budget protégé", tone: "default" },
    },
  },
  beaute: {
    segment: "beaute",
    merchantFacingTopLayerLabel: "Diamond et récompense de saison",
    seasonReward: {
      title: "Récompense de saison beauté",
      summary: "La cliente doit sentir qu'une vraie saison peut mener à un soin ou à un privilège important, pas seulement à une promo.",
      merchantFraming: "La récompense de saison donne envie de rester dans le cycle. Diamond décrit la cliente de confiance qui devient éligible à cette couche rare.",
      examples: ["1 soin offert / mois pendant 6 mois", "1 rituel privilégié sur la saison"],
      options: [
        { id: "cut-monthly", title: "Soin signature", promise: "1 soin signature offert par mois pendant 1 an.", merchantMeaning: "Une récompense simple et crédible qui soutient le cycle de retour sans brader le lieu." },
        { id: "ritual-duo", title: "Rituel duo", promise: "1 rituel duo privilégié par mois pendant 1 an.", merchantMeaning: "Une version plus sociale qui transforme la recommandation en vrai rendez-vous." },
        { id: "private-ritual", title: "Accès privé", promise: "Un privilège soin privé réservé aux meilleures clientes sur la saison.", merchantMeaning: "Une version plus discrète qui protège votre meilleur niveau de service." },
      ],
    },
    diamondMeaning: {
      title: "Diamond = cliente de confiance",
      summary: "Dans la beauté, Diamond signifie qu'une cliente suit son cycle, accepte des ouvertures ciblées et peut recommander le lieu sans abîmer son positionnement.",
      concreteExamples: ["prochain rendez-vous repris", "créneau souple accepté", "venue en duo"],
    },
    roleProgressionSummary: {
      steps: [
        { label: "Visage connu", meaning: "reconnue mais encore fragile en fréquence" },
        { label: "Régulière", meaning: "reprend ses rendez-vous" },
        { label: "Cercle beauté", meaning: "fait confiance au lieu" },
        { label: "Diamond Ligne", meaning: "stabilise le cycle et recommande" },
      ],
    },
    primaryLevers: ["frequency", "identity", "time_shifting", "group_events", "basket"],
    mechanics: [
      {
        id: "repeat-booking",
        title: "Le prochain rendez-vous ne casse plus",
        summary: "Le parcours protège le cycle de retour.",
        clientAction: "La cliente reprend son prochain rendez-vous plus vite.",
        systemAction: "Cardin maintient une boucle de retour avant que le cycle ne se rompe.",
        merchantMeaning: "Vous réduisez les trous de planning et les pertes de clientes silencieuses.",
        protocolMapping: ["loop:return", "lever:frequency", "revenue:gp_direct"],
        engineEffect: "GP_direct ↑",
        tone: "default",
      },
      {
        id: "early-beauty-trigger",
        title: "Un signe utile peut arriver tôt",
        summary: "La cliente sent vite que le parcours change sa place dans le lieu.",
        clientAction: "Elle perçoit une petite activation ou un signe de reconnaissance dès les premiers retours.",
        systemAction: "Le moteur place des activations légères et des signaux de statut au début du cycle.",
        merchantMeaning: "L'engagement devient vivant avant que la cliente ne décroche.",
        protocolMapping: ["loop:activation", "loop:identity", "lever:identity", "budget:bounded_activation"],
        engineEffect: "engagement ↑",
        tone: "gold",
      },
      {
        id: "soft-slots",
        title: "Le système peut remplir un créneau plus souple",
        summary: "Une partie des retours se déplace vers les heures plus ouvertes.",
        clientAction: "La cliente accepte un jeudi ou un milieu d'après-midi plus souple.",
        systemAction: "Cardin pousse certains retours sur des fenêtres de planning plus faciles.",
        merchantMeaning: "Vous lissez le planning sans remise frontale.",
        protocolMapping: ["lever:time_shifting", "loop:activation", "mission:time_shift", "revenue:gp_mission"],
        engineEffect: "GP_mission ↑",
        tone: "default",
      },
      {
        id: "duo-referral",
        title: "La confiance devient recommandation réelle",
        summary: "Le réseau passe par un duo ou une venue accompagnée, pas par une promo large.",
        clientAction: "Une cliente reconnue vient avec une amie ou ouvre un duo.",
        systemAction: "Diamond active une propagation courte, qualifiée et alignée avec votre niveau de service.",
        merchantMeaning: "La recommandation se convertit en rendez-vous concret.",
        protocolMapping: ["lever:group_events", "loop:propagation", "revenue:gp_prop"],
        engineEffect: "GP_prop ↑",
        tone: "blue",
      },
      {
        id: "ritual-access",
        title: "Le haut du parcours mène au rituel majeur",
        summary: "La cliente comprend qu'il existe une vraie récompense de saison, mais qu'elle se mérite.",
        clientAction: "Elle vise un soin ou un rituel rare à travers sa progression.",
        systemAction: "Diamond filtre l'accès à la récompense majeure et garde la valeur du lieu.",
        merchantMeaning: "Vous faites monter le désir sans casser votre positionnement premium.",
        protocolMapping: ["diamond:architecture", "diamond:bounded_token", "role:progression", "identity:factor"],
        engineEffect: "valeur perçue ↑",
        tone: "gold",
      },
    ],
    timedWindowExamples: ["jeudi souple", "milieu d'après-midi"],
    groupEventExamples: ["rituel duo", "venir avec une amie"],
    identityExamples: ["devenir Régulière", "entrer dans le Cercle beauté"],
    merchantExplanationCopy: {
      whatSeasonRewardDoes: "Dans la beauté, la saison doit montrer un vrai soin ou un vrai rituel à viser. C'est ce qui rend le cycle désirable.",
      whatDiamondMeans: "Diamond veut dire cliente de confiance : elle suit son cycle, accepte des ouvertures utiles et peut recommander sans vous déclasser.",
      rewardVsDiamond: "La récompense de saison attire. Diamond décrit la cliente devenue éligible et les privilèges qu'elle peut réellement activer.",
      whatMechanicsDo: "Le parcours sécurise le prochain rendez-vous, garde l'attention active, remplit quelques créneaux plus souples et transforme la confiance en recommandation réelle.",
      revenueConnection: "Le revenu vient du cycle qui ne casse plus, d'un panier mieux assumé et d'une recommandation qui se convertit en rendez-vous.",
      budgetConstraint: "Invitations faibles, activations choisies, récompense majeure rare et budget toujours borné.",
    },
    summitModes: {
      visible: { id: "visible", badge: "Récompense affichée", title: "Le rituel à viser est clair", summary: "La cliente comprend tôt qu'un vrai soin ou rituel de saison existe.", merchantMeaning: "Le prochain rendez-vous devient plus désirable.", protocolMapping: ["loop:return", "lever:identity", "diamond:bounded_token"], engineEffect: "cycle stabilisé", tone: "gold" },
      stronger: { id: "stronger", badge: "Récompense amplifiée", title: "La promesse pousse plus fort la recommandation", summary: "La récompense est plus conversationnelle et plus efficace sur la venue accompagnée.", merchantMeaning: "Plus de duo, plus de propagation qualifiée.", protocolMapping: ["lever:group_events", "loop:activation", "loop:propagation", "revenue:gp_prop"], engineEffect: "propagation qualifiée ↑", tone: "gold" },
      discreet: { id: "discreet", badge: "Récompense sélective", title: "La promesse reste privée", summary: "Le bénéfice est peu affiché et garde un vrai sentiment de traitement spécial.", merchantMeaning: "Vous protégez la rareté et la perception haut de gamme.", protocolMapping: ["lever:identity", "loop:activation", "budget:bounded_activation"], engineEffect: "rareté protégée", tone: "default" },
    },
  },
  boutique: {
    segment: "boutique",
    merchantFacingTopLayerLabel: "Diamond et récompense de saison",
    seasonReward: {
      title: "Récompense de saison boutique",
      summary: "La cliente doit voir qu'une saison peut mener à un vrai accès, un vrai crédit ou une vraie expérience, pas simplement à une remise.",
      merchantFraming: "La récompense de saison crée le désir. Diamond décrit les clientes qui gagnent progressivement le droit de voir, d'essayer et d'influencer.",
      examples: ["crédit collection sur la saison", "expérience privée", "accès privilégié aux previews et fittings"],
      options: [
        { id: "collection-credit", title: "Crédit collection", promise: "100 € de crédit collection par mois pendant 1 an.", merchantMeaning: "Une récompense simple et forte qui rend la trajectoire très lisible." },
        { id: "rare-drop", title: "Drop prioritaire", promise: "Un accès prioritaire à une pièce réservée chaque mois.", merchantMeaning: "Une promesse plus désirable qu'une remise, pensée pour le retour et la conversation." },
        { id: "private-piece", title: "Pièce ou accès privé", promise: "Une pièce ou un accès privé réservé aux meilleures clientes sur la saison.", merchantMeaning: "Une version discrète et très statutaire de la récompense de saison." },
      ],
    },
    diamondMeaning: {
      title: "Diamond = Initiée, Collectionneur, puis Curateur",
      summary: "Dans une boutique, Diamond ne veut pas dire remise premium. Il correspond à une cliente qui suit les previews, revient sur les drops et influence son cercle.",
      concreteExamples: ["preview privée", "fitting à deux", "drop réservé"],
    },
    roleProgressionSummary: {
      steps: [
        { label: "Client", meaning: "regarde et compare" },
        { label: "Initiée", meaning: "suit les nouveautés" },
        { label: "Collectionneur", meaning: "achète dans la durée" },
        { label: "Curateur", meaning: "influence son cercle" },
      ],
    },
    primaryLevers: ["identity", "frequency", "group_events", "time_shifting", "basket"],
    mechanics: [
      {
        id: "reason-to-return",
        title: "La cliente a une vraie raison de repasser",
        summary: "Le retour ne dépend plus du hasard ou d'une simple nouvelle vitrine.",
        clientAction: "Elle revient pour un preview, un fitting ou une pièce qu'elle sait possible.",
        systemAction: "Cardin transforme la visite en trajectoire avec une progression lisible.",
        merchantMeaning: "Vous remplacez l'attente passive par un vrai motif de retour.",
        protocolMapping: ["loop:return", "lever:frequency", "revenue:gp_direct"],
        engineEffect: "GP_direct ↑",
        tone: "default",
      },
      {
        id: "status-rise",
        title: "Le statut monte et change la relation à la boutique",
        summary: "La cliente veut être dans le cercle qui voit avant les autres.",
        clientAction: "Elle comprend qu'elle peut monter en statut et accéder à un cercle plus reconnu.",
        systemAction: "Le moteur fait progresser Initiée, Collectionneur puis Curateur, avec un vrai facteur d'identité.",
        merchantMeaning: "Vous créez du désir et de l'adhésion sans passer par la remise.",
        protocolMapping: ["lever:identity", "loop:identity", "role:progression", "identity:factor"],
        engineEffect: "alignement ↑",
        tone: "gold",
      },
      {
        id: "drop-window",
        title: "Le système ouvre des fenêtres précises",
        summary: "Les meilleurs retours se font sur des previews, drops ou créneaux choisis.",
        clientAction: "La cliente revient au bon moment plutôt qu'au hasard.",
        systemAction: "Cardin place des fenêtres de drop et de time-shift selon votre rythme de collection.",
        merchantMeaning: "Vous créez un retour utile et narratif autour des pièces.",
        protocolMapping: ["lever:time_shifting", "loop:activation", "mission:time_shift", "revenue:gp_mission"],
        engineEffect: "GP_mission ↑",
        tone: "default",
      },
      {
        id: "fitting-circle",
        title: "Le style devient propagation qualifiée",
        summary: "La meilleure propagation passe par un fitting ou un petit cercle, pas par le volume.",
        clientAction: "Une cliente revient avec une amie ou partage un moment de fitting ciblé.",
        systemAction: "Diamond active une propagation courte et très qualifiée autour du cercle du lieu.",
        merchantMeaning: "Vous faites entrer de nouveaux profils par affinité réelle.",
        protocolMapping: ["lever:group_events", "loop:propagation", "revenue:gp_prop"],
        engineEffect: "GP_prop ↑",
        tone: "blue",
      },
      {
        id: "reward-access",
        title: "Le haut du parcours mène à une vraie récompense de saison",
        summary: "La cliente voit une valeur forte, mais l'accès reste filtré.",
        clientAction: "Elle vise un crédit, un drop ou une expérience privée réservée aux meilleures clientes.",
        systemAction: "Diamond filtre l'accès au récompense majeure et garde la tension du désir.",
        merchantMeaning: "Vous créez de la valeur perçue sans banaliser les pièces.",
        protocolMapping: ["diamond:architecture", "diamond:bounded_token", "budget:bounded_activation", "lever:basket"],
        engineEffect: "GP_uplift ↑",
        tone: "gold",
      },
    ],
    timedWindowExamples: ["preview en semaine", "fenêtre drop du jeudi"],
    groupEventExamples: ["fitting à deux", "drop partagé"],
    identityExamples: ["devenir Initiée", "passer Collectionneur", "jouer Curateur"],
    merchantExplanationCopy: {
      whatSeasonRewardDoes: "Dans une boutique, la saison doit rendre visible une vraie récompense désirable : crédit, drop, accès privé ou expérience de collection.",
      whatDiamondMeans: "Diamond veut dire Curateur : une cliente qui suit les previews, revient pour des pièces clés et influence son cercle.",
      rewardVsDiamond: "La récompense de saison attire. Diamond décrit la cliente devenue éligible et les droits de preview, fitting ou accès qu'elle peut vraiment activer.",
      whatMechanicsDo: "Le parcours crée un vrai motif de retour, fait monter le statut, ouvre des fenêtres de drop et transforme le style en propagation qualifiée.",
      revenueConnection: "Le revenu vient du retour créé, d'un panier de collection plus fort et d'une propagation très qualifiée.",
      budgetConstraint: "Accès rares, invitations limitées, récompense majeure séparé du budget courant et activation toujours bornée.",
    },
    summitModes: {
      visible: { id: "visible", badge: "Récompense affichée", title: "La promesse est nette et visible", summary: "La cliente voit clairement ce que la saison peut lui ouvrir.", merchantMeaning: "Le désir et le retour deviennent plus faciles à déclencher.", protocolMapping: ["loop:return", "lever:identity", "diamond:bounded_token"], engineEffect: "retour plus probable", tone: "gold" },
      stronger: { id: "stronger", badge: "Récompense amplifiée", title: "La promesse parle plus fort au cercle", summary: "La récompense est plus forte et plus partageable, donc plus utile pour le fitting et le drop.", merchantMeaning: "Plus de conversation et plus de propagation qualifiée.", protocolMapping: ["lever:group_events", "loop:activation", "loop:propagation", "revenue:gp_prop"], engineEffect: "propagation qualifiée ↑", tone: "gold" },
      discreet: { id: "discreet", badge: "Récompense sélective", title: "La promesse reste rare et silencieuse", summary: "Le bénéfice est réservé à peu de clientes et entretient la tension du désir.", merchantMeaning: "Vous gardez la rareté et protégez mieux la marge.", protocolMapping: ["lever:identity", "loop:activation", "budget:bounded_activation"], engineEffect: "rareté protégée", tone: "default" },
    },
  },
}

const CONFIG: Record<LandingWorldId, VerticalExplainerConfig> = {
  ...BASE_CONFIG,
  boulangerie: {
    ...BASE_CONFIG.cafe,
    segment: "boulangerie",
    seasonReward: {
      title: "Récompense de saison boulangerie",
      summary: "Le client voit qu'une vraie routine de quartier peut mener à un bénéfice rare, visible et économiquement tenu.",
      merchantFraming: "La récompense de saison crée le désir. Diamond décide quels clients deviennent éligibles et avec quel niveau de privilège dans la routine.",
      examples: ["1 petit-déjeuner / mois pendant 1 an", "1 fournée signature / mois"],
      options: [
        { id: "monthly-breakfast", title: "Petit-déjeuner mensuel", promise: "1 petit-déjeuner offert par mois pendant 1 an.", merchantMeaning: "Une récompense claire qui renforce un retour du matin sans ouvrir la marge." },
        { id: "duo-matin", title: "Duo du matin", promise: "1 petit-déjeuner duo par mois pendant 1 an.", merchantMeaning: "Une version plus sociale pour faire revenir à deux sur un moment utile." },
        { id: "reserve-fournee", title: "Fournée réservée", promise: "Un privilège boulangerie réservé aux meilleurs clients sur la saison.", merchantMeaning: "Une version plus discrète, gardée pour les profils déjà engagés." },
      ],
    },
    diamondMeaning: {
      title: "Diamond = Habitué, Insider, puis Host de quartier",
      summary: "Dans une boulangerie, Diamond ne veut pas dire remise. Cela décrit un client qui revient mieux, accepte certains moments utiles et peut ouvrir un petit cercle local autour du lieu.",
      concreteExamples: ["revient un mardi matin", "choisit la fournée signature", "invite une personne pour un petit-déjeuner"],
    },
    roleProgressionSummary: {
      steps: [
        { label: "Passage", meaning: "premier retour validé" },
        { label: "Habitué", meaning: "revient dans la semaine" },
        { label: "Insider fournée", meaning: "attend certains moments du lieu" },
        { label: "Host quartier", meaning: "peut ouvrir un petit moment à deux" },
      ],
    },
    primaryLevers: ["frequency", "time_shifting", "identity", "group_events"] as VerticalExplainerLever[],
    mechanics: [
      {
        id: "first-return",
        title: "Le client revient avant que la routine ne retombe",
        summary: "Le premier retour est sécurisé tôt, pas laissé à l'oubli.",
        clientAction: "Le client repasse après une première visite validée.",
        systemAction: "Cardin ouvre une progression dès le premier vrai passage et remet un horizon lisible devant lui.",
        merchantMeaning: "Vous ne laissez plus les nouveaux clients sortir de la boucle après un achat d'essai.",
        protocolMapping: ["loop:entry", "loop:return", "lever:frequency", "revenue:gp_direct"],
        engineEffect: "GP_direct ↑",
        tone: "default",
      },
      {
        id: "early-trigger",
        title: "Un petit déclencheur peut arriver tôt",
        summary: "Le client sent vite qu'il peut gagner quelque chose de réel dans la semaine.",
        clientAction: "Il comprend qu'un retour rapide peut déjà faire avancer sa carte.",
        systemAction: "Le moteur place des activations légères et bornées sur les visites précoces.",
        merchantMeaning: "L'attention reste active parce que le parcours devient lisible avant la lassitude.",
        protocolMapping: ["loop:activation", "lever:frequency", "budget:bounded_activation", "revenue:gp_mission"],
        engineEffect: "activation précoce ↑",
        tone: "gold",
      },
      {
        id: "dead-hours",
        title: "Le retour peut remplir un moment plus plat",
        summary: "Une partie des retours est déplacée vers un matin ou un jour moins dense.",
        clientAction: "Le client revient sur un moment calme, utile pour le lieu.",
        systemAction: "Cardin pousse certaines missions sur mardi, matin calme ou fin de fournée.",
        merchantMeaning: "Vous lissez la semaine sans promotion ouverte.",
        protocolMapping: ["lever:time_shifting", "loop:activation", "mission:time_shift", "revenue:gp_mission"],
        engineEffect: "GP_mission ↑",
        tone: "default",
      },
      {
        id: "small-propagation",
        title: "Le client peut amener une personne",
        summary: "La propagation reste courte, utile et contrôlée.",
        clientAction: "Un bon client invite une personne pour un petit-déjeuner ou une fournée.",
        systemAction: "Le rôle Host ouvre une propagation bornée, jamais massive.",
        merchantMeaning: "La boulangerie gagne un deuxième ticket par le voisinage du client, sans perdre la maîtrise.",
        protocolMapping: ["lever:group_events", "loop:propagation", "diamond:architecture", "revenue:gp_prop"],
        engineEffect: "GP_prop ↑",
        tone: "blue",
      },
      {
        id: "host-season",
        title: "Le meilleur client vise Diamond puis la récompense de saison",
        summary: "Le haut du parcours n'est pas abstrait : il mène à l'éligibilité puis à la récompense majeure.",
        clientAction: "Le client comprend qu'il peut monter vers Host quartier puis viser la récompense de saison.",
        systemAction: "La progression des rôles et l'architecture Diamond filtrent les accès et gardent la rareté.",
        merchantMeaning: "Vous créez du désir durable avec un budget borné.",
        protocolMapping: ["loop:identity", "role:progression", "diamond:architecture", "diamond:bounded_token"],
        engineEffect: "valeur perçue ↑",
        tone: "gold",
      },
    ],
    timedWindowExamples: ["mardi matin", "fin de fournée"],
    groupEventExamples: ["petit-déjeuner à deux", "pause café-viennoiserie"],
    identityExamples: ["devenir Habitué", "passer Insider fournée", "débloquer Host quartier"],
    merchantExplanationCopy: {
      whatSeasonRewardDoes: "Dans une boulangerie, la saison doit montrer une vraie récompense rare, lisible et assez légère pour rester crédible au comptoir.",
      whatDiamondMeans: "Diamond désigne ici un rôle de retour et d'invitation légère : Habitué, Insider fournée, puis Host quartier.",
      rewardVsDiamond: "La récompense de saison attire. Diamond décide qui peut y accéder et quand le système ouvre un vrai privilège local.",
      whatMechanicsDo: "Le parcours crée un premier retour, garde l'attention active avec de petits déclencheurs, remplit quelques moments plus plats et fait monter les meilleurs clients vers Host.",
      revenueConnection: "Le revenu vient surtout de la fréquence récupérée, d'un peu plus de panier et d'une propagation locale bien maîtrisée.",
      budgetConstraint: "Récompense majeure rare, activations légères, invitations plafonnées et budget toujours borné.",
    },
    summitModes: {
      visible: { id: "visible", badge: "Récompense affichée", title: "Le client voit clairement ce qu'il peut viser", summary: "La récompense de saison est expliquée tôt et la progression reste lisible.", merchantMeaning: "Motivation plus directe, retour plus facile à enclencher.", protocolMapping: ["loop:return", "diamond:bounded_token", "lever:identity"], engineEffect: "traction retour ↑", tone: "gold" },
      stronger: { id: "stronger", badge: "Récompense amplifiée", title: "La récompense parle plus fort", summary: "Le message et la récompense sont plus visibles et plus sociaux.", merchantMeaning: "Plus de conversation et plus d'effet duo sur les retours utiles.", protocolMapping: ["lever:group_events", "lever:time_shifting", "loop:activation", "revenue:gp_mission"], engineEffect: "activation sociale ↑", tone: "gold" },
      discreet: { id: "discreet", badge: "Récompense sélective", title: "La récompense reste plus discrète", summary: "Le bénéfice existe mais n'est montré qu'aux bons profils et au bon moment.", merchantMeaning: "Vous gardez la rareté et protégez mieux la marge.", protocolMapping: ["lever:identity", "loop:activation", "budget:bounded_activation"], engineEffect: "budget protégé", tone: "default" },
    },
  },
  caviste: {
    ...BASE_CONFIG.bar,
    segment: "caviste",
    seasonReward: {
      title: "Récompense de saison caviste",
      summary: "Le client voit une vraie promesse de cave : quelque chose de rare, visible et assez fort pour recréer le rendez-vous.",
      merchantFraming: "La récompense de saison donne envie. Diamond reste la couche d'accès, de sélection et d'activation qui protège la rareté du caviste.",
      examples: ["1 bouteille découverte / mois pendant 6 mois", "1 dégustation privée / trimestre"],
      options: [
        { id: "cellar-bottle", title: "Bouteille découverte", promise: "1 bouteille découverte offerte par mois pendant la saison prolongée.", merchantMeaning: "Une raison claire de revenir à la cave sans tomber dans la remise large." },
        { id: "duo-degustation", title: "Dégustation duo", promise: "1 dégustation duo privée sur des moments choisis.", merchantMeaning: "Une récompense qui pousse le retour à deux sur les bonnes fenêtres." },
        { id: "reserved-selection", title: "Sélection réservée", promise: "Un privilège de cave réservé aux meilleurs clients sur la saison.", merchantMeaning: "Une version plus discrète, très contrôlée, pensée pour garder la tension de sélection." },
      ],
    },
    diamondMeaning: {
      title: "Diamond = accès, sélection et droits de dégustation",
      summary: "Chez un caviste, Diamond correspond à une couche d'accès : fenêtres de dégustation, sélections réservées, invitations cadrées et activations choisies.",
      concreteExamples: ["mercredi dégustation ciblé", "duo cave activé", "sélection bouteille réservée"],
    },
    roleProgressionSummary: {
      steps: [
        { label: "Passage", meaning: "achat ou visite isolée" },
        { label: "Régulier cave", meaning: "revient sur une fenêtre identifiée" },
        { label: "Insider sélection", meaning: "suit les moments utiles de la cave" },
        { label: "Host dégustation", meaning: "peut ouvrir un duo ou un petit cercle" },
      ],
    },
    primaryLevers: ["frequency", "group_events", "identity", "basket"] as VerticalExplainerLever[],
    mechanics: [
      {
        id: "night-return",
        title: "Le client reprend une habitude de cave",
        summary: "Le passage isolé redevient un retour reconnu dans la quinzaine ou dans le mois.",
        clientAction: "Il revient sur un moment où vous avez une vraie sélection à montrer.",
        systemAction: "Le moteur installe une boucle de retour au lieu de laisser chaque achat repartir à zéro.",
        merchantMeaning: "Vous recréez un rendez-vous de cave plutôt qu'un achat accidentel.",
        protocolMapping: ["loop:return", "lever:frequency", "revenue:gp_direct"],
        engineEffect: "GP_direct ↑",
        tone: "default",
      },
      {
        id: "early-night-trigger",
        title: "Une activation légère peut arriver tôt",
        summary: "Le client sent vite qu'il peut gagner quelque chose de réel.",
        clientAction: "Il reçoit tôt un signe du système, pas après une longue attente.",
        systemAction: "Cardin ouvre de petites activations bornées avant que le parcours perde son énergie.",
        merchantMeaning: "L'attention reste active et la conversation commence tôt autour de la cave.",
        protocolMapping: ["loop:activation", "budget:bounded_activation", "lever:identity", "revenue:gp_mission"],
        engineEffect: "attention active ↑",
        tone: "gold",
      },
      {
        id: "timed-window",
        title: "Le système ouvre des fenêtres précises",
        summary: "Les meilleurs retours se font sur une dégustation, une sélection ou un moment avant week-end.",
        clientAction: "Le client revient au bon moment plutôt qu'au hasard.",
        systemAction: "Cardin place des fenêtres de dégustation et de sélection selon votre rythme de cave.",
        merchantMeaning: "Vous créez un retour utile et narratif autour des bouteilles.",
        protocolMapping: ["lever:time_shifting", "loop:activation", "mission:time_shift", "revenue:gp_mission"],
        engineEffect: "GP_mission ↑",
        tone: "default",
      },
      {
        id: "cellar-circle",
        title: "Le meilleur retour devient propagation qualifiée",
        summary: "La meilleure propagation passe par un duo cave ou une dégustation privée, pas par le volume.",
        clientAction: "Un bon client revient avec une personne proche pour un moment de cave ciblé.",
        systemAction: "Diamond active une propagation courte et très qualifiée autour du cercle du lieu.",
        merchantMeaning: "Vous faites entrer de nouveaux profils par affinité réelle.",
        protocolMapping: ["lever:group_events", "loop:propagation", "revenue:gp_prop"],
        engineEffect: "GP_prop ↑",
        tone: "blue",
      },
      {
        id: "reward-access",
        title: "Le haut du parcours mène à une vraie récompense de saison",
        summary: "Le client voit une valeur forte, mais l'accès reste filtré.",
        clientAction: "Il vise une bouteille, une dégustation ou une sélection privée réservée aux meilleurs clients.",
        systemAction: "Diamond filtre l'accès à la récompense majeure et garde la tension du désir.",
        merchantMeaning: "Vous créez de la valeur perçue sans banaliser votre sélection.",
        protocolMapping: ["diamond:architecture", "diamond:bounded_token", "budget:bounded_activation", "lever:basket"],
        engineEffect: "GP_uplift ↑",
        tone: "gold",
      },
    ],
    timedWindowExamples: ["mercredi dégustation", "avant week-end"],
    groupEventExamples: ["dégustation duo", "soirée cave à deux"],
    identityExamples: ["devenir Régulier cave", "passer Insider sélection", "jouer Host dégustation"],
    merchantExplanationCopy: {
      whatSeasonRewardDoes: "Chez un caviste, la saison doit rendre visible une vraie récompense désirable : bouteille, dégustation privée, sélection réservée.",
      whatDiamondMeans: "Diamond veut dire accès cave : un client qui suit les sélections, revient pour des moments précis et peut ouvrir un petit cercle.",
      rewardVsDiamond: "La récompense de saison attire. Diamond décrit le client devenu éligible et les droits de dégustation, de sélection ou d'invitation qu'il peut vraiment activer.",
      whatMechanicsDo: "Le parcours crée un vrai motif de retour, ouvre des fenêtres de dégustation et transforme les meilleurs clients en propagation qualifiée.",
      revenueConnection: "Le revenu vient du retour créé, d'un panier mieux tenu et d'une propagation sociale très maîtrisée.",
      budgetConstraint: "Accès rares, invitations limitées, récompense majeure séparée du budget courant et activation toujours bornée.",
    },
    summitModes: {
      visible: { id: "visible", badge: "Récompense affichée", title: "La promesse est nette et visible", summary: "Le client voit clairement ce que la saison peut lui ouvrir.", merchantMeaning: "Le désir et le retour deviennent plus faciles à déclencher.", protocolMapping: ["loop:return", "lever:identity", "diamond:bounded_token"], engineEffect: "retour plus probable", tone: "gold" },
      stronger: { id: "stronger", badge: "Récompense amplifiée", title: "La promesse parle plus fort au cercle", summary: "La récompense est plus forte et plus partageable, donc plus utile pour la dégustation et le duo cave.", merchantMeaning: "Plus de conversation et plus de propagation qualifiée.", protocolMapping: ["lever:group_events", "loop:activation", "loop:propagation", "revenue:gp_prop"], engineEffect: "propagation qualifiée ↑", tone: "gold" },
      discreet: { id: "discreet", badge: "Récompense sélective", title: "La promesse reste rare et silencieuse", summary: "Le bénéfice est réservé à peu de clients et entretient la tension de sélection.", merchantMeaning: "Vous gardez la rareté et protégez mieux la marge.", protocolMapping: ["lever:identity", "loop:activation", "budget:bounded_activation"], engineEffect: "rareté protégée", tone: "default" },
    },
  },
}

export function getVerticalExplainerConfig(worldId: LandingWorldId): VerticalExplainerConfig {
  return CONFIG[worldId]
}

export function getSeasonRewardOption(worldId: LandingWorldId, optionId: string) {
  return CONFIG[worldId].seasonReward.options.find((option) => option.id === optionId)
}

export function getProtocolMappingLabel(token: ProtocolMappingToken): string {
  return PROTOCOL_LABELS[token] ?? token
}

export function getPrimaryLeverLabel(lever: VerticalExplainerLever): string {
  return LEVER_LABELS[lever]
}


