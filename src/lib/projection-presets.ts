import { type BehaviorScenarioId, normalizeEngineActivityId, type EngineActivityId } from "@/lib/behavior-engine"
import {
  DEFAULT_PROJECTION_PROFILES,
  type ProjectionPresetOverrideMap,
  type ScenarioProjectionProfile,
} from "@/lib/projection-engine"

export type ProjectionPresetRow = {
  activity_id: string
  scenario_id: string
  revenue_weight: number
  returns_weight: number
  primary_effect: string
  secondary_effect: string
  scenario_role: string
}

function isKnownScenarioId(value: string): value is BehaviorScenarioId {
  return value === "starting_loop" || value === "weekly_rendezvous" || value === "short_challenge" || value === "monthly_gain"
}

export function buildProjectionOverrideMap(rows: ProjectionPresetRow[]): ProjectionPresetOverrideMap {
  const map: ProjectionPresetOverrideMap = {}

  for (const row of rows) {
    const activityId = normalizeEngineActivityId(row.activity_id)
    if (!isKnownScenarioId(row.scenario_id)) {
      continue
    }

    if (!map[activityId]) {
      map[activityId] = {}
    }

    map[activityId]![row.scenario_id] = {
      revenueWeight: row.revenue_weight,
      returnsWeight: row.returns_weight,
      primaryEffect: row.primary_effect,
      secondaryEffect: row.secondary_effect,
      scenarioRole: row.scenario_role,
    }
  }

  return map
}

export type ProjectionPresetEntryInput = {
  merchantType: string
  scenarioId: BehaviorScenarioId
  profile: ScenarioProjectionProfile
  isActive?: boolean
}

export function normalizePresetEntryInput(entry: ProjectionPresetEntryInput) {
  const activityId = normalizeEngineActivityId(entry.merchantType)

  return {
    activity_id: activityId,
    scenario_id: entry.scenarioId,
    revenue_weight: entry.profile.revenueWeight,
    returns_weight: entry.profile.returnsWeight,
    primary_effect: entry.profile.primaryEffect,
    secondary_effect: entry.profile.secondaryEffect,
    scenario_role: entry.profile.scenarioRole,
    is_active: entry.isActive ?? true,
  }
}

export function flattenDefaultProjectionProfiles(activityFilter?: string) {
  const filteredActivity = activityFilter ? normalizeEngineActivityId(activityFilter) : null
  const rows: Array<ProjectionPresetRow> = []

  const activityIds = Object.keys(DEFAULT_PROJECTION_PROFILES) as EngineActivityId[]
  for (const activityId of activityIds) {
    if (filteredActivity && activityId !== filteredActivity) {
      continue
    }

    const scenarios = DEFAULT_PROJECTION_PROFILES[activityId]
    const scenarioIds = Object.keys(scenarios) as BehaviorScenarioId[]

    for (const scenarioId of scenarioIds) {
      const profile = scenarios[scenarioId]
      rows.push({
        activity_id: activityId,
        scenario_id: scenarioId,
        revenue_weight: profile.revenueWeight,
        returns_weight: profile.returnsWeight,
        primary_effect: profile.primaryEffect,
        secondary_effect: profile.secondaryEffect,
        scenario_role: profile.scenarioRole,
      })
    }
  }

  return rows
}
