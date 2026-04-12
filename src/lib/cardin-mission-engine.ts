import type { SupabaseClient } from "@supabase/supabase-js"

import {
  buildMerchantProtocolSnapshot,
  getActiveDiamondTokenForCard,
  getMerchantProtocolSettings,
  insertProtocolEvent,
  logRewardPause,
} from "@/lib/cardin-protocol-runtime"
import { getCardSeasonProgress, type Season } from "@/lib/season-progression"
import { insertTransactionEvent } from "@/lib/transaction-events"

export type IntentMissionType = "group" | "time_shift" | "aov" | "identity"
export type IntentMissionTriggerStep = 3 | 4 | 5 | "diamond"
export type IntentMissionStatus = "active" | "completed" | "expired"
export type IntentMissionValidationMode = "duo" | "tablee" | "apero" | "fitting"

export type IntentMissionView = {
  id: string
  type: IntentMissionType
  triggerStep: IntentMissionTriggerStep
  roleMin: number
  title: string
  copy: string
  staffHint: string
  status: IntentMissionStatus
  incentiveType: string
  incentiveTitle: string
  incentiveCopy: string
  expiresAt: string
  requiresVisitValidation: boolean
  requiresGroupSize: number | null
  requiresTimeWindow: { label: string; start: string; end: string } | null
  validationMode: IntentMissionValidationMode
  estimatedValueEur: number
  costEur: number
}

export type MissionValidationInput = {
  groupSize?: number | null
  sameTicketConfirmed?: boolean
  cardholderPresent?: boolean
  singleBillConfirmed?: boolean
  appointmentConfirmed?: boolean
  inStoreConfirmed?: boolean
  timeWindowConfirmed?: boolean
}

type MissionCopyPayload = {
  title: string
  body: string
  staffHint: string
  incentiveTitle: string
  incentiveCopy: string
  validationMode: IntentMissionValidationMode
}

type IntentMissionRow = {
  id: string
  merchant_id: string
  card_id: string
  season_id: string | null
  type: IntentMissionType
  trigger_step: string
  role_min: number
  copy: MissionCopyPayload | Record<string, unknown>
  incentive_type: string
  c_mission: number | string
  v_mission: number | string
  estimated_value_eur: number | string
  identity_factor: number | string
  expiry_days: number
  max_active_missions: number
  requires_visit_validation: boolean
  requires_group_size: number | null
  requires_time_window: Record<string, unknown> | null
  template_key: string
  status: IntentMissionStatus
  created_at: string
  expires_at: string
  completed_at: string | null
  completed_visit_session_id: string | null
  completion_data: Record<string, unknown> | null
}

type MissionTemplate = {
  key: string
  title: string
  type: IntentMissionType
  triggerStep: IntentMissionTriggerStep
  roleMin: number
  copy: string
  staffHint: string
  incentiveType: string
  incentiveTitle: string
  incentiveCopy: string
  cMission: number
  vMission: number
  expiryDays: number
  requiresVisitValidation: boolean
  requiresGroupSize?: number
  requiresTimeWindow?: { label: string; start: string; end: string }
  validationMode: IntentMissionValidationMode
}

type MissionAssignmentParams = {
  merchantId: string
  merchantWorld: string | null | undefined
  cardId: string
  visitSessionId: string
  season: Season
  currentStep?: number | null
  diamondUnlockedAt?: string | null
  hasSummitReward?: boolean
}

type MissionCompletionParams = {
  merchantId: string
  cardId: string
  missionId?: string | null
  visitSessionId: string
  createdBy: string | null
  seasonId?: string | null
  validation: MissionValidationInput
  idempotencyKey?: string | null
}

type MissionPauseReason = "season_budget" | "mission_budget" | "mission_sigma" | "state_blocked"

const SELECT_FIELDS =
  "id, merchant_id, card_id, season_id, type, trigger_step, role_min, copy, incentive_type, c_mission, v_mission, estimated_value_eur, identity_factor, expiry_days, max_active_missions, requires_visit_validation, requires_group_size, requires_time_window, template_key, status, created_at, expires_at, completed_at, completed_visit_session_id, completion_data"

const MISSION_TEMPLATES: Record<string, MissionTemplate> = {
  cafe: {
    key: "cafe_le_duo",
    title: "Le Duo",
    type: "group",
    triggerStep: 3,
    roleMin: 1,
    copy: "Revenez à deux sur le même ticket cette semaine pour activer un geste maison léger.",
    staffHint: "2 boissons sur le même ticket, avec le titulaire présent.",
    incentiveType: "upgrade",
    incentiveTitle: "Le Duo activé",
    incentiveCopy: "Le duo peut recevoir l'upgrade prévu au comptoir.",
    cMission: 0.8,
    vMission: 9,
    expiryDays: 7,
    requiresVisitValidation: true,
    requiresGroupSize: 2,
    validationMode: "duo",
  },
  restaurant: {
    key: "restaurant_la_tablee",
    title: "La Tablée",
    type: "group",
    triggerStep: "diamond",
    roleMin: 3,
    copy: "Organisez une table de 4 ou plus sur une seule addition pour débloquer une attention de maison.",
    staffHint: "Table de 4 minimum, une seule addition, client présent.",
    incentiveType: "group_reward",
    incentiveTitle: "La Tablée validée",
    incentiveCopy: "La tablée peut recevoir le partage dessert prévu par le protocole.",
    cMission: 7,
    vMission: 91,
    expiryDays: 14,
    requiresVisitValidation: true,
    requiresGroupSize: 4,
    validationMode: "tablee",
  },
  boutique: {
    key: "boutique_le_fitting",
    title: "Le Fitting",
    type: "identity",
    triggerStep: 4,
    roleMin: 2,
    copy: "Venez à deux pour un fitting ou une visite confirmée en boutique et débloquez un accès privilégié.",
    staffHint: "2 personnes présentes, avec rendez-vous ou confirmation en boutique.",
    incentiveType: "access",
    incentiveTitle: "Le Fitting validé",
    incentiveCopy: "Le fitting peut être activé comme moment privilégié de la saison.",
    cMission: 0,
    vMission: 216,
    expiryDays: 14,
    requiresVisitValidation: true,
    requiresGroupSize: 2,
    validationMode: "fitting",
  },
  bar: {
    key: "bar_l_apero",
    title: "L'Apéro",
    type: "time_shift",
    triggerStep: 3,
    roleMin: 1,
    copy: "Passez sur le créneau apéro avec une personne cette semaine pour activer un avantage léger au bon moment.",
    staffHint: "2 personnes présentes sur le créneau apéro prévu.",
    incentiveType: "upgrade",
    incentiveTitle: "L'Apéro validé",
    incentiveCopy: "L'équipe peut activer l'avantage apéro prévu sur ce passage.",
    cMission: 0.8,
    vMission: 12,
    expiryDays: 7,
    requiresVisitValidation: true,
    requiresGroupSize: 2,
    requiresTimeWindow: {
      label: "Créneau apéro",
      start: "17:00",
      end: "20:00",
    },
    validationMode: "apero",
  },
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clampRoleLevel(value: number): number {
  if (value < 0) return 0
  if (value > 3) return 3
  return value
}

function safeRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function getMissionTemplateForMerchantWorld(raw: string | null | undefined): MissionTemplate | null {
  const value = (raw ?? "").trim().toLowerCase()
  if (value === "bar") return MISSION_TEMPLATES.bar
  if (value === "restaurant") return MISSION_TEMPLATES.restaurant
  if (value === "boutique") return MISSION_TEMPLATES.boutique
  if (value === "cafe") return MISSION_TEMPLATES.cafe
  return null
}

export function getRoleLevel(params: { currentStep?: number | null; diamondUnlockedAt?: string | null }): number {
  if (params.diamondUnlockedAt) return 3
  const step = Math.max(0, Math.round(safeNumber(params.currentStep, 0)))
  if (step >= 4) return 2
  if (step >= 3) return 1
  return 0
}

export function getIdentityFactor(roleLevel: number): number {
  return roundCurrency(1 + clampRoleLevel(roleLevel) * 0.15)
}

function triggerSatisfied(params: {
  triggerStep: IntentMissionTriggerStep
  currentStep: number
  diamondUnlockedAt?: string | null
}): boolean {
  if (params.triggerStep === "diamond") {
    return Boolean(params.diamondUnlockedAt)
  }
  return params.currentStep >= params.triggerStep
}

function normalizeTimeWindow(value: unknown): { label: string; start: string; end: string } | null {
  const source = safeRecord(value)
  const label = typeof source.label === "string" ? source.label : "Créneau"
  const start = typeof source.start === "string" ? source.start : ""
  const end = typeof source.end === "string" ? source.end : ""
  if (!start || !end) return null
  return { label, start, end }
}

function buildCopyPayload(template: MissionTemplate): MissionCopyPayload {
  return {
    title: template.title,
    body: template.copy,
    staffHint: template.staffHint,
    incentiveTitle: template.incentiveTitle,
    incentiveCopy: template.incentiveCopy,
    validationMode: template.validationMode,
  }
}

function parseMissionCopy(value: unknown): MissionCopyPayload {
  const source = safeRecord(value)
  return {
    title: typeof source.title === "string" ? source.title : "Mission",
    body: typeof source.body === "string" ? source.body : "",
    staffHint: typeof source.staffHint === "string" ? source.staffHint : "",
    incentiveTitle: typeof source.incentiveTitle === "string" ? source.incentiveTitle : "Mission validée",
    incentiveCopy: typeof source.incentiveCopy === "string" ? source.incentiveCopy : "L'avantage mission peut être activé.",
    validationMode:
      source.validationMode === "duo" ||
      source.validationMode === "tablee" ||
      source.validationMode === "apero" ||
      source.validationMode === "fitting"
        ? source.validationMode
        : "duo",
  }
}

function normalizeTriggerStep(value: string): IntentMissionTriggerStep {
  if (value === "diamond") return "diamond"
  const numeric = Math.round(safeNumber(value, 3))
  if (numeric === 4) return 4
  if (numeric === 5) return 5
  return 3
}

function serializeMission(row: IntentMissionRow): IntentMissionView {
  const copy = parseMissionCopy(row.copy)
  return {
    id: row.id,
    type: row.type,
    triggerStep: normalizeTriggerStep(row.trigger_step),
    roleMin: Math.max(0, Math.round(safeNumber(row.role_min, 0))),
    title: copy.title,
    copy: copy.body,
    staffHint: copy.staffHint,
    status: row.status,
    incentiveType: row.incentive_type,
    incentiveTitle: copy.incentiveTitle,
    incentiveCopy: copy.incentiveCopy,
    expiresAt: row.expires_at,
    requiresVisitValidation: Boolean(row.requires_visit_validation),
    requiresGroupSize: typeof row.requires_group_size === "number" ? row.requires_group_size : null,
    requiresTimeWindow: normalizeTimeWindow(row.requires_time_window),
    validationMode: copy.validationMode,
    estimatedValueEur: roundCurrency(safeNumber(row.estimated_value_eur, 0)),
    costEur: roundCurrency(safeNumber(row.c_mission, 0)),
  }
}

async function sumMissionCostSeason(supabase: SupabaseClient, merchantId: string, seasonId: string | null): Promise<number> {
  let query = supabase
    .from("protocol_events")
    .select("cost_eur")
    .eq("merchant_id", merchantId)
    .eq("event_type", "mission_completed")

  if (seasonId) {
    query = query.eq("season_id", seasonId)
  }

  const { data, error } = await query
  if (error || !data) return 0
  return roundCurrency(data.reduce((sum, row) => sum + safeNumber((row as { cost_eur?: number | string }).cost_eur, 0), 0))
}

async function expireMissionIfNeeded(
  supabase: SupabaseClient,
  mission: IntentMissionRow,
  reason = "expired",
): Promise<IntentMissionRow | null> {
  if (mission.status !== "active") {
    return mission
  }

  if (new Date(mission.expires_at).getTime() > Date.now()) {
    return mission
  }

  const { data, error } = await supabase
    .from("intent_missions")
    .update({ status: "expired" })
    .eq("id", mission.id)
    .eq("status", "active")
    .select(SELECT_FIELDS)
    .maybeSingle()

  if (error) {
    return null
  }

  if (data) {
    await insertProtocolEvent(supabase, {
      merchantId: mission.merchant_id,
      seasonId: mission.season_id,
      cardId: mission.card_id,
      missionId: mission.id,
      eventType: "mission_expired",
      estimatedValueEur: safeNumber(mission.estimated_value_eur, 0),
      metadata: {
        reason,
      },
    })
    return data as IntentMissionRow
  }

  return null
}

export async function getActiveMissionRecordForCard(supabase: SupabaseClient, cardId: string): Promise<IntentMissionRow | null> {
  const { data, error } = await supabase
    .from("intent_missions")
    .select(SELECT_FIELDS)
    .eq("card_id", cardId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  const active = data as IntentMissionRow
  const normalized = await expireMissionIfNeeded(supabase, active)
  if (!normalized || normalized.status !== "active") return null
  return normalized
}

export async function getActiveMissionForCard(supabase: SupabaseClient, cardId: string): Promise<IntentMissionView | null> {
  const mission = await getActiveMissionRecordForCard(supabase, cardId)
  return mission ? serializeMission(mission) : null
}

export async function getMissionForCardDisplay(supabase: SupabaseClient, cardId: string): Promise<IntentMissionView | null> {
  const active = await getActiveMissionRecordForCard(supabase, cardId)
  if (active) {
    return serializeMission(active)
  }

  const { data, error } = await supabase
    .from("intent_missions")
    .select(SELECT_FIELDS)
    .eq("card_id", cardId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return serializeMission(data as IntentMissionRow)
}

function validateMissionInput(mission: IntentMissionView, input: MissionValidationInput): { ok: true; normalized: Record<string, unknown> } | { ok: false } {
  const groupSize = Math.max(0, Math.round(safeNumber(input.groupSize, 0)))

  if (mission.requiresGroupSize && groupSize < mission.requiresGroupSize) {
    return { ok: false }
  }

  switch (mission.validationMode) {
    case "duo":
      if (!input.sameTicketConfirmed || !input.cardholderPresent) return { ok: false }
      return {
        ok: true,
        normalized: {
          groupSize,
          sameTicketConfirmed: true,
          cardholderPresent: true,
        },
      }
    case "tablee":
      if (!input.singleBillConfirmed) return { ok: false }
      return {
        ok: true,
        normalized: {
          groupSize,
          singleBillConfirmed: true,
        },
      }
    case "apero":
      if (!input.timeWindowConfirmed) return { ok: false }
      return {
        ok: true,
        normalized: {
          groupSize,
          timeWindowConfirmed: true,
        },
      }
    case "fitting":
      if (!input.appointmentConfirmed && !input.inStoreConfirmed) return { ok: false }
      return {
        ok: true,
        normalized: {
          groupSize,
          appointmentConfirmed: Boolean(input.appointmentConfirmed),
          inStoreConfirmed: Boolean(input.inStoreConfirmed),
        },
      }
    default:
      return { ok: false }
  }
}

async function missionBudgetEnvelope(
  supabase: SupabaseClient,
  merchantId: string,
  seasonLengthMonths?: number | null,
): Promise<number> {
  const settings = await getMerchantProtocolSettings(supabase, merchantId, seasonLengthMonths)
  if (!settings) return 0
  return roundCurrency(settings.config.seasonBudget * 0.15)
}

export async function maybeAssignIntentMission(
  supabase: SupabaseClient,
  params: MissionAssignmentParams,
): Promise<{ assigned: boolean; mission: IntentMissionView | null; reason?: string }> {
  const template = getMissionTemplateForMerchantWorld(params.merchantWorld)
  if (!template) {
    return { assigned: false, mission: null, reason: "unsupported_world" }
  }

  if (params.hasSummitReward) {
    return { assigned: false, mission: null, reason: "reward_already_active" }
  }

  const activeDiamondToken = await getActiveDiamondTokenForCard(supabase, params.cardId, params.season.id)
  if (activeDiamondToken) {
    return { assigned: false, mission: null, reason: "diamond_reward_active" }
  }

  const existing = await getActiveMissionRecordForCard(supabase, params.cardId)
  if (existing) {
    return { assigned: false, mission: serializeMission(existing), reason: "mission_already_active" }
  }

  const progress =
    typeof params.currentStep === "number"
      ? { current_step: params.currentStep, diamond_unlocked_at: params.diamondUnlockedAt ?? null }
      : await getCardSeasonProgress(supabase, params.cardId, params.season.id)

  const currentStep = Math.max(0, Math.round(safeNumber(progress?.current_step, 0)))
  const diamondUnlockedAt = progress?.diamond_unlocked_at ?? params.diamondUnlockedAt ?? null
  const roleLevel = getRoleLevel({ currentStep, diamondUnlockedAt })

  if (roleLevel < template.roleMin || !triggerSatisfied({ triggerStep: template.triggerStep, currentStep, diamondUnlockedAt })) {
    return { assigned: false, mission: null, reason: "not_eligible" }
  }

  const snapshot = await buildMerchantProtocolSnapshot(supabase, {
    merchantId: params.merchantId,
    season: params.season,
  })

  if (!snapshot) {
    return { assigned: false, mission: null, reason: "protocol_snapshot_failed" }
  }

  if (snapshot.state === "OVER_BUDGET" || snapshot.state === "SUSPICIOUS") {
    await logRewardPause(supabase, {
      merchantId: params.merchantId,
      seasonId: params.season.id,
      cardId: params.cardId,
      visitSessionId: params.visitSessionId,
      state: snapshot.state,
      reason: "mission_state_blocked",
      action: "mission",
    })
    return { assigned: false, mission: null, reason: "state_blocked" }
  }

  const identityFactor = getIdentityFactor(roleLevel)
  const estimatedValue = roundCurrency(template.vMission * identityFactor)
  const sigmaMission = template.cMission <= 0 ? Number.POSITIVE_INFINITY : estimatedValue / template.cMission
  if (sigmaMission < 3) {
    return { assigned: false, mission: null, reason: "mission_sigma" }
  }

  const missionBudget = await missionBudgetEnvelope(supabase, params.merchantId, params.season.season_length)
  const missionSpend = await sumMissionCostSeason(supabase, params.merchantId, params.season.id)
  if (missionSpend > missionBudget || snapshot.actual.seasonExposure > snapshot.config.seasonBudget) {
    await logRewardPause(supabase, {
      merchantId: params.merchantId,
      seasonId: params.season.id,
      cardId: params.cardId,
      visitSessionId: params.visitSessionId,
      state: snapshot.state,
      reason: missionSpend > missionBudget ? "mission_budget" : "season_budget",
      action: "mission",
    })
    return { assigned: false, mission: null, reason: missionSpend > missionBudget ? "mission_budget" : "season_budget" }
  }

  const expiresAt = new Date()
  expiresAt.setUTCDate(expiresAt.getUTCDate() + template.expiryDays)

  const { data, error } = await supabase
    .from("intent_missions")
    .insert({
      merchant_id: params.merchantId,
      card_id: params.cardId,
      season_id: params.season.id,
      type: template.type,
      trigger_step: String(template.triggerStep),
      role_min: template.roleMin,
      copy: buildCopyPayload(template),
      incentive_type: template.incentiveType,
      c_mission: template.cMission,
      v_mission: template.vMission,
      estimated_value_eur: estimatedValue,
      identity_factor: identityFactor,
      expiry_days: template.expiryDays,
      max_active_missions: 1,
      requires_visit_validation: template.requiresVisitValidation,
      requires_group_size: template.requiresGroupSize ?? null,
      requires_time_window: template.requiresTimeWindow ?? null,
      template_key: template.key,
      status: "active",
      expires_at: expiresAt.toISOString(),
    })
    .select(SELECT_FIELDS)
    .maybeSingle()

  if (error) {
    if (error.code === "23505") {
      const active = await getActiveMissionRecordForCard(supabase, params.cardId)
      return { assigned: false, mission: active ? serializeMission(active) : null, reason: "mission_already_active" }
    }
    return { assigned: false, mission: null, reason: error.message }
  }

  if (!data) {
    return { assigned: false, mission: null, reason: "mission_insert_failed" }
  }

  const mission = data as IntentMissionRow
  await insertProtocolEvent(supabase, {
    merchantId: params.merchantId,
    seasonId: params.season.id,
    cardId: params.cardId,
    missionId: mission.id,
    visitSessionId: params.visitSessionId,
    eventType: "mission_assigned",
    estimatedValueEur: estimatedValue,
    metadata: {
      templateKey: template.key,
      triggerStep: template.triggerStep,
      roleLevel,
      sigmaMission: roundCurrency(sigmaMission),
    },
  })

  return { assigned: true, mission: serializeMission(mission) }
}

export async function completeIntentMission(
  supabase: SupabaseClient,
  params: MissionCompletionParams,
): Promise<
  | {
      ok: true
      mission: IntentMissionView
      reward: { title: string; description: string }
    }
  | {
      ok: false
      error:
        | "no_active_mission"
        | "mission_not_found"
        | "mission_validation_failed"
        | "missions_paused"
        | "mission_budget"
        | "season_budget"
        | "mission_already_completed"
        | "mission_completion_failed"
    }
> {
  const active = await getActiveMissionRecordForCard(supabase, params.cardId)
  if (!active) {
    if (params.missionId) {
      const { data } = await supabase
        .from("intent_missions")
        .select(SELECT_FIELDS)
        .eq("id", params.missionId)
        .maybeSingle()

      const existing = data as IntentMissionRow | null
      if (existing?.status === "completed" && existing.completed_visit_session_id === params.visitSessionId) {
        const view = serializeMission(existing)
        return {
          ok: true,
          mission: view,
          reward: {
            title: view.incentiveTitle,
            description: view.incentiveCopy,
          },
        }
      }
    }
    return { ok: false, error: "no_active_mission" }
  }

  if (params.missionId && active.id !== params.missionId) {
    return { ok: false, error: "mission_not_found" }
  }

  const mission = serializeMission(active)
  const validation = validateMissionInput(mission, params.validation)
  if (!validation.ok) {
    return { ok: false, error: "mission_validation_failed" }
  }

  const snapshot = await buildMerchantProtocolSnapshot(supabase, {
    merchantId: params.merchantId,
    season: active.season_id ? ({ id: active.season_id } as Season) : undefined,
  })

  if (snapshot && snapshot.state === "OVER_BUDGET") {
    await logRewardPause(supabase, {
      merchantId: params.merchantId,
      seasonId: active.season_id,
      cardId: params.cardId,
      visitSessionId: params.visitSessionId,
      state: snapshot.state,
      reason: "mission_over_budget",
      action: "mission",
    })
    return { ok: false, error: "missions_paused" }
  }

  const missionBudget = await missionBudgetEnvelope(supabase, params.merchantId, snapshot?.config.seasonLengthMonths ?? null)
  const missionSpend = await sumMissionCostSeason(supabase, params.merchantId, active.season_id)
  const nextMissionSpend = roundCurrency(missionSpend + mission.costEur)
  const seasonExposure = snapshot?.actual.seasonExposure ?? 0
  if (nextMissionSpend > missionBudget) {
    await logRewardPause(supabase, {
      merchantId: params.merchantId,
      seasonId: active.season_id,
      cardId: params.cardId,
      visitSessionId: params.visitSessionId,
      state: snapshot?.state ?? null,
      reason: "mission_budget",
      action: "mission",
    })
    return { ok: false, error: "mission_budget" }
  }
  if (snapshot && roundCurrency(seasonExposure + mission.costEur) > snapshot.config.seasonBudget) {
    await logRewardPause(supabase, {
      merchantId: params.merchantId,
      seasonId: active.season_id,
      cardId: params.cardId,
      visitSessionId: params.visitSessionId,
      state: snapshot.state,
      reason: "season_budget",
      action: "mission",
    })
    return { ok: false, error: "season_budget" }
  }

  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from("intent_missions")
    .update({
      status: "completed",
      completed_at: nowIso,
      completed_visit_session_id: params.visitSessionId,
      completion_data: validation.normalized,
    })
    .eq("id", active.id)
    .eq("status", "active")
    .select(SELECT_FIELDS)
    .maybeSingle()

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "mission_already_completed" }
    }
    return { ok: false, error: "mission_completion_failed" }
  }

  if (!data) {
    return { ok: false, error: "mission_already_completed" }
  }

  await insertTransactionEvent(supabase, {
    cardId: params.cardId,
    legacyType: "mission_reward_use",
    eventType: "mission_reward_use",
    seasonId: active.season_id,
    source: "merchant_consume",
    metadata: {
      missionId: active.id,
      missionType: active.type,
      incentiveType: active.incentive_type,
      estimatedValueEur: mission.estimatedValueEur,
      validation: validation.normalized,
    },
    idempotencyKey: params.idempotencyKey ?? null,
    createdBy: params.createdBy,
    visitSessionId: params.visitSessionId,
  })

  await insertProtocolEvent(supabase, {
    merchantId: params.merchantId,
    seasonId: active.season_id,
    cardId: params.cardId,
    missionId: active.id,
    visitSessionId: params.visitSessionId,
    eventType: "mission_completed",
    costEur: mission.costEur,
    estimatedValueEur: mission.estimatedValueEur,
    metadata: {
      incentiveType: active.incentive_type,
      validation: validation.normalized,
    },
  })

  const completed = serializeMission(data as IntentMissionRow)
  return {
    ok: true,
    mission: completed,
    reward: {
      title: completed.incentiveTitle,
      description: completed.incentiveCopy,
    },
  }
}

export async function markMissionViewed(
  supabase: SupabaseClient,
  params: { merchantId: string; cardId: string; missionId: string },
): Promise<void> {
  const mission = await getActiveMissionRecordForCard(supabase, params.cardId)
  if (!mission || mission.id !== params.missionId) return

  await insertProtocolEvent(supabase, {
    merchantId: params.merchantId,
    seasonId: mission.season_id,
    cardId: params.cardId,
    missionId: mission.id,
    eventType: "mission_viewed",
    estimatedValueEur: safeNumber(mission.estimated_value_eur, 0),
  })
}

export async function getMerchantMissionMetrics(
  supabase: SupabaseClient,
  params: { merchantId: string; seasonId?: string | null },
): Promise<{ activeCount: number; completedCount: number; revenueEstimate: number }> {
  let activeQuery = supabase
    .from("intent_missions")
    .select("id", { count: "exact", head: true })
    .eq("merchant_id", params.merchantId)
    .eq("status", "active")

  let completedQuery = supabase
    .from("intent_missions")
    .select("id", { count: "exact", head: true })
    .eq("merchant_id", params.merchantId)
    .eq("status", "completed")

  let revenueQuery = supabase
    .from("protocol_events")
    .select("estimated_value_eur")
    .eq("merchant_id", params.merchantId)
    .eq("event_type", "mission_completed")

  if (params.seasonId) {
    activeQuery = activeQuery.eq("season_id", params.seasonId)
    completedQuery = completedQuery.eq("season_id", params.seasonId)
    revenueQuery = revenueQuery.eq("season_id", params.seasonId)
  }

  const [{ count: activeCount }, { count: completedCount }, { data: revenueRows, error: revenueError }] = await Promise.all([
    activeQuery,
    completedQuery,
    revenueQuery,
  ])

  const revenueEstimate = revenueError || !revenueRows
    ? 0
    : roundCurrency(revenueRows.reduce((sum, row) => sum + safeNumber((row as { estimated_value_eur?: number | string }).estimated_value_eur, 0), 0))

  return {
    activeCount: activeCount ?? 0,
    completedCount: completedCount ?? 0,
    revenueEstimate,
  }
}

