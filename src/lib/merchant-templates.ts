export type RewardType = "stamp" | "cashback" | "vip" | "referral"

export type MerchantTemplateDefaults = {
  reward_type: RewardType
  target_visits: number
  reward_label: string
  reminder_delay_days: number
  average_frequency: "high" | "medium" | "low"
  calculator_recovery_rate: number
}

export type MerchantTemplate = {
  id: string
  label: string
  description: string
  needs: [string, string]
  pointOfDeparture: string
  evolvesTo: [string, string, string]
  rewardExample: string
  rhythmLabel: string
  defaults: MerchantTemplateDefaults
}

export const merchantTemplates: MerchantTemplate[] = [
  {
    id: "cafe",
    label: "Café",
    description: "Passage rapide et habitudes du quotidien.",
    needs: ["Faire revenir dans la semaine", "Ancrer un rendez-vous du matin"],
    pointOfDeparture: "10 passages → 1 café offert",
    evolvesTo: ["Rendez-vous matin", "Défi express", "Gain mensuel"],
    rewardExample: "10 passages → 1 café offert",
    rhythmLabel: "Rappel court · clientèle régulière",
    defaults: {
      reward_type: "stamp",
      target_visits: 10,
      reward_label: "1 café offert",
      reminder_delay_days: 10,
      average_frequency: "high",
      calculator_recovery_rate: 0.22,
    },
  },
  {
    id: "bar",
    label: "Bar",
    description: "Soirée, comptoir et réseau social — ticket plus fort, fréquence à structurer.",
    needs: ["Densifier les bons créneaux", "Rendre le retour visible avant la prochaine sortie"],
    pointOfDeparture: "5 passages → 1 consigne signature offerte",
    evolvesTo: ["Soirée régulière", "Créneau faible → fort", "Gain mensuel"],
    rewardExample: "5 passages → consigne signature offerte",
    rhythmLabel: "Rappel court · clientèle de soirée",
    defaults: {
      reward_type: "stamp",
      target_visits: 5,
      reward_label: "1 consigne signature offerte",
      reminder_delay_days: 12,
      average_frequency: "high",
      calculator_recovery_rate: 0.2,
    },
  },
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Entre deux repas et occasions.",
    needs: ["Ramener entre deux repas", "Mieux remplir les moments creux"],
    pointOfDeparture: "5 visites → 1 dessert offert",
    evolvesTo: ["Défi court", "Rendez-vous hebdo", "Gain mensuel"],
    rewardExample: "5 visites → 1 dessert offert",
    rhythmLabel: "Rappel moyen · panier plus élevé",
    defaults: {
      reward_type: "stamp",
      target_visits: 5,
      reward_label: "1 dessert offert",
      reminder_delay_days: 21,
      average_frequency: "medium",
      calculator_recovery_rate: 0.16,
    },
  },
  {
    id: "boulangerie",
    label: "Boulangerie",
    description: "Achat fréquent et routine de quartier.",
    needs: ["Créer plus de retours dans la semaine", "Relancer les jours plus plats"],
    pointOfDeparture: "8 passages → 1 produit offert",
    evolvesTo: ["Mardi actif", "Défi court", "Gain mensuel"],
    rewardExample: "8 passages → 1 produit offert",
    rhythmLabel: "Rappel court · fréquence élevée",
    defaults: {
      reward_type: "stamp",
      target_visits: 8,
      reward_label: "1 produit offert",
      reminder_delay_days: 7,
      average_frequency: "high",
      calculator_recovery_rate: 0.24,
    },
  },
  {
    id: "caviste",
    label: "Caviste",
    description: "Retour choisi, panier moyen à élevé, dégustation et moment social.",
    needs: ["Créer un rendez-vous de cave", "Remettre la sélection dans la boucle entre deux achats"],
    pointOfDeparture: "5 passages → 1 dégustation offerte",
    evolvesTo: ["Rendez-vous cave", "Défi retour", "Sélection du mois"],
    rewardExample: "5 passages → 1 dégustation offerte",
    rhythmLabel: "Rappel moyen · retour choisi",
    defaults: {
      reward_type: "stamp",
      target_visits: 5,
      reward_label: "1 dégustation offerte",
      reminder_delay_days: 21,
      average_frequency: "low",
      calculator_recovery_rate: 0.14,
    },
  },
  {
    id: "coiffeur",
    label: "Coiffeur",
    description: "Retour espacé et panier plus fort.",
    needs: ["Raccourcir le temps entre deux visites", "Rendre le cycle plus visible"],
    pointOfDeparture: "5 visites → 1 soin offert",
    evolvesTo: ["Rendez-vous mensuel", "Défi retour", "Gain mensuel"],
    rewardExample: "5 visites → 1 soin offert",
    rhythmLabel: "Rappel long · retour espacé",
    defaults: {
      reward_type: "stamp",
      target_visits: 5,
      reward_label: "1 soin offert",
      reminder_delay_days: 35,
      average_frequency: "low",
      calculator_recovery_rate: 0.14,
    },
  },
  {
    id: "institut-beaute",
    label: "Institut / Beauté",
    description: "Rendez-vous réguliers et suivi.",
    needs: ["Stabiliser la fréquence", "Donner un cap visible entre deux séances"],
    pointOfDeparture: "4 visites → 1 avantage beauté",
    evolvesTo: ["Rituel périodique", "Défi retour", "Gain mensuel"],
    rewardExample: "4 visites → 1 avantage beauté",
    rhythmLabel: "Rappel long · clientèle suivie",
    defaults: {
      reward_type: "stamp",
      target_visits: 4,
      reward_label: "1 avantage beauté",
      reminder_delay_days: 30,
      average_frequency: "low",
      calculator_recovery_rate: 0.15,
    },
  },
  {
    id: "boutique",
    label: "Boutique",
    description: "Passages irréguliers et achats d'envie.",
    needs: ["Créer une raison de revenir", "Réveiller la clientèle dormante"],
    pointOfDeparture: "6 achats → accès exclusif",
    evolvesTo: ["Rendez-vous collection", "Défi court", "Gain mensuel"],
    rewardExample: "6 achats → avantage exclusif",
    rhythmLabel: "Rappel moyen · fidélité progressive",
    defaults: {
      reward_type: "stamp",
      target_visits: 6,
      reward_label: "avantage exclusif",
      reminder_delay_days: 18,
      average_frequency: "medium",
      calculator_recovery_rate: 0.17,
    },
  },
]

export function getTemplateById(id: string): MerchantTemplate {
  return merchantTemplates.find((template) => template.id === id) ?? merchantTemplates[0]
}
