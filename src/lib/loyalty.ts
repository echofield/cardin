export type MerchantStatus = "active" | "paused"
export type CardStatus = "active" | "reward_ready" | "redeemed"

export type LoyaltyConfig = {
  rewardType: "stamp" | "cashback" | "vip" | "referral"
  targetVisits: number
  rewardLabel: string
  reminderDelayDays: number
}

export type MerchantRecord = {
  id: string
  businessName: string
  phone: string
  businessType: string
  city: string
  callbackSlot: string
  status: MerchantStatus
  createdAt: string
  loyaltyConfig: LoyaltyConfig
}

export type LoyaltyCardRecord = {
  id: string
  merchantId: string
  customerName: string
  customerPhone?: string
  stamps: number
  targetVisits: number
  rewardLabel: string
  status: CardStatus
  createdAt: string
  lastVisitAt: string
}

export type VisitRecord = {
  id: string
  merchantId: string
  cardId: string
  createdAt: string
}
