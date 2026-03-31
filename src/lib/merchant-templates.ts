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
  rewardExample: string
  rhythmLabel: string
  defaults: MerchantTemplateDefaults
}

export const merchantTemplates: MerchantTemplate[] = [
  {
    id: "cafe",
    label: "Café",
    description: "Pour les lieux de passage et les habitudes du quotidien.",
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
    id: "restaurant",
    label: "Restaurant",
    description: "Pour faire revenir vos clients entre deux repas ou occasions.",
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
    description: "Pour les achats fréquents et les habitudes de quartier.",
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
    id: "coiffeur",
    label: "Coiffeur",
    description: "Pour entretenir la fréquence de retour sur des cycles plus longs.",
    rewardExample: "5 visites → réduction ou soin offert",
    rhythmLabel: "Rappel long · retour espacé",
    defaults: {
      reward_type: "stamp",
      target_visits: 5,
      reward_label: "réduction ou soin offert",
      reminder_delay_days: 35,
      average_frequency: "low",
      calculator_recovery_rate: 0.14,
    },
  },
  {
    id: "institut-beaute",
    label: "Institut / Beauté",
    description: "Pour encourager la fidélité sur des rendez-vous réguliers.",
    rewardExample: "4 visites → prestation ou avantage offert",
    rhythmLabel: "Rappel long · clientèle suivie",
    defaults: {
      reward_type: "stamp",
      target_visits: 4,
      reward_label: "avantage ou prestation offerte",
      reminder_delay_days: 30,
      average_frequency: "low",
      calculator_recovery_rate: 0.15,
    },
  },
  {
    id: "boutique",
    label: "Boutique",
    description: "Pour créer un réflexe de retour et récompenser les clientes fidèles.",
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
