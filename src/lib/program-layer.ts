import type { SupabaseClient } from "@supabase/supabase-js"

export type MidpointMode = "recognition_only" | "recognition_plus_boost"

type MerchantProgramRecord = {
  id: string
  midpoint_mode: MidpointMode | null
  target_visits: number | null
  reward_label: string | null
  shared_unlock_enabled: boolean | null
  shared_unlock_objective: number | null
  shared_unlock_window_days: number | null
  shared_unlock_offer: string | null
  shared_unlock_active_until: string | null
  shared_unlock_last_triggered_period: string | null
}

export function getTargetVisits(value: number | null | undefined): number {
  const normalized = Number(value ?? 10)
  if (!Number.isFinite(normalized) || normalized < 2) {
    return 10
  }

  return Math.round(normalized)
}

export function getRewardLabel(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim()
  return trimmed.length > 0 ? trimmed : "1 récompense offerte"
}

export function getMidpointMode(value: string | null | undefined): MidpointMode {
  return value === "recognition_plus_boost" ? "recognition_plus_boost" : "recognition_only"
}

export function getMidpointThreshold(targetVisits: number): number {
  return Math.ceil(getTargetVisits(targetVisits) / 2)
}

export function buildMidpointView(params: {
  stamps: number
  targetVisits: number
  midpointReachedAt: string | null
  midpointMode: MidpointMode
}) {
  const targetVisits = getTargetVisits(params.targetVisits)
  const threshold = getMidpointThreshold(targetVisits)
  const reached = Boolean(params.midpointReachedAt) || params.stamps >= threshold

  return {
    mode: params.midpointMode,
    threshold,
    reached,
    reachedAt: params.midpointReachedAt,
    copy: reached
      ? params.midpointMode === "recognition_plus_boost"
        ? "Cap franchi. Avantage de progression appliqué."
        : "Cap franchi. Progression confirmée."
      : "Vous avancez.",
  }
}

export async function buildSharedUnlockView(
  supabase: SupabaseClient,
  merchant: MerchantProgramRecord
): Promise<{
  enabled: boolean
  objective: number
  progress: number
  windowDays: number
  offer: string
  status: "disabled" | "tracking" | "active"
  activeUntil: string | null
  periodKey: string
}> {
  const now = new Date()
  const periodKey = getPeriodKey(now)

  const enabled = Boolean(merchant.shared_unlock_enabled)
  const objective = normalizePositiveInt(merchant.shared_unlock_objective, 120)
  const windowDays = normalizePositiveInt(merchant.shared_unlock_window_days, 7)
  const offer = (merchant.shared_unlock_offer ?? "").trim() || "Offre collective de la semaine"

  if (!enabled) {
    return {
      enabled: false,
      objective,
      progress: 0,
      windowDays,
      offer,
      status: "disabled",
      activeUntil: null,
      periodKey,
    }
  }

  const progress = await countMerchantVisitsForCurrentPeriod(supabase, merchant.id)
  const activeUntil = merchant.shared_unlock_active_until
  const isActive = Boolean(activeUntil && new Date(activeUntil).getTime() > now.getTime())

  return {
    enabled: true,
    objective,
    progress,
    windowDays,
    offer,
    status: isActive ? "active" : "tracking",
    activeUntil,
    periodKey,
  }
}

export async function maybeActivateSharedUnlock(
  supabase: SupabaseClient,
  merchant: MerchantProgramRecord
): Promise<{
  enabled: boolean
  objective: number
  progress: number
  windowDays: number
  offer: string
  status: "disabled" | "tracking" | "active"
  activeUntil: string | null
  periodKey: string
}> {
  const view = await buildSharedUnlockView(supabase, merchant)

  if (!view.enabled) {
    return view
  }

  const currentPeriod = view.periodKey
  const alreadyTriggeredThisPeriod = merchant.shared_unlock_last_triggered_period === currentPeriod

  if (view.progress >= view.objective && !alreadyTriggeredThisPeriod) {
    const now = new Date()
    const activeUntil = new Date(now)
    activeUntil.setDate(now.getDate() + view.windowDays)

    const { error } = await supabase
      .from("merchants")
      .update({
        shared_unlock_active_until: activeUntil.toISOString(),
        shared_unlock_last_triggered_period: currentPeriod,
      })
      .eq("id", merchant.id)

    if (!error) {
      return {
        ...view,
        status: "active",
        activeUntil: activeUntil.toISOString(),
      }
    }
  }

  return view
}

async function countMerchantVisitsForCurrentPeriod(supabase: SupabaseClient, merchantId: string): Promise<number> {
  const periodStart = new Date()
  periodStart.setUTCDate(1)
  periodStart.setUTCHours(0, 0, 0, 0)

  const periodEnd = new Date(periodStart)
  periodEnd.setUTCMonth(periodStart.getUTCMonth() + 1)

  const { data: cards, error: cardsError } = await supabase.from("cards").select("id").eq("merchant_id", merchantId)

  if (cardsError || !cards || cards.length === 0) {
    return 0
  }

  const cardIds = cards.map((card) => card.id)

  const { count } = await supabase
    .from("transactions")
    .select("id", { head: true, count: "exact" })
    .in("card_id", cardIds)
    .in("type", ["issued", "stamp"])
    .gte("created_at", periodStart.toISOString())
    .lt("created_at", periodEnd.toISOString())

  return count ?? 0
}

function getPeriodKey(value: Date): string {
  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function normalizePositiveInt(value: number | null | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return Math.round(parsed)
}
