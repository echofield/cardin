import { readRecords, writeRecords } from "@/lib/server-storage"

import type { LoyaltyCardRecord, MerchantRecord, VisitRecord } from "./loyalty"

const MERCHANTS_FILE = "merchants.json"
const CARDS_FILE = "cards.json"
const VISITS_FILE = "visits.json"

export async function listMerchants() {
  return readRecords<MerchantRecord>(MERCHANTS_FILE)
}

export async function getMerchantById(merchantId: string) {
  const merchants = await listMerchants()
  return merchants.find((merchant) => merchant.id === merchantId)
}

export async function upsertMerchant(nextMerchant: MerchantRecord) {
  const merchants = await listMerchants()
  const existingIndex = merchants.findIndex((merchant) => merchant.id === nextMerchant.id)

  if (existingIndex === -1) {
    merchants.push(nextMerchant)
  } else {
    merchants[existingIndex] = nextMerchant
  }

  await writeRecords(MERCHANTS_FILE, merchants)
  return nextMerchant
}

export async function listCards() {
  return readRecords<LoyaltyCardRecord>(CARDS_FILE)
}

export async function getCardById(cardId: string) {
  const cards = await listCards()
  return cards.find((card) => card.id === cardId)
}

export async function listCardsByMerchantId(merchantId: string) {
  const cards = await listCards()
  return cards.filter((card) => card.merchantId === merchantId)
}

export async function upsertCard(nextCard: LoyaltyCardRecord) {
  const cards = await listCards()
  const existingIndex = cards.findIndex((card) => card.id === nextCard.id)

  if (existingIndex === -1) {
    cards.push(nextCard)
  } else {
    cards[existingIndex] = nextCard
  }

  await writeRecords(CARDS_FILE, cards)
  return nextCard
}

export async function addVisit(visit: VisitRecord) {
  const visits = await readRecords<VisitRecord>(VISITS_FILE)
  visits.push(visit)
  await writeRecords(VISITS_FILE, visits)
}

export async function listVisitsByMerchantId(merchantId: string) {
  const visits = await readRecords<VisitRecord>(VISITS_FILE)
  return visits.filter((visit) => visit.merchantId === merchantId)
}
