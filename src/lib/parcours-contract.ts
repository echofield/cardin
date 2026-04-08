import type { LandingWorldId } from "@/lib/landing-content"
import { getSummitPresets } from "@/lib/season-law"

/**
 * Parcours ↔ Cardin backend contract (read-only mapping for URLs and future POST /api/leads).
 *
 * - world: marketing sector → `LandingWorldId`, matches `template` on `/engine` for café / restaurant / beauté / boutique.
 * - summit: marketing style `visible | stronger | discreet` → engine `summit` query must be a real preset id from `getSummitPresets(templateId)`.
 * - season: `3 | 6` → `season` query on `/engine` (normalized in EngineFlow).
 *
 * Optional later: same shape can feed `POST /api/leads` (activityTemplateId, summitId, seasonLength, …) after auth.
 */

/** Marketing summit style (projection multipliers in UI). */
export type ParcoursSummitStyleId = "visible" | "stronger" | "discreet"

/** Engine template id (matches merchant-templates / season-law keys). */
export function landingWorldToEngineTemplateId(worldId: LandingWorldId): string {
  if (worldId === "beaute") return "institut-beaute"
  return worldId
}

/**
 * Maps marketing summit style to the index in `getSummitPresets(templateId)`:
 * - visible → first preset (baseline promise)
 * - stronger → middle preset (higher monthlyRecoveredBoost)
 * - discreet → third preset (more selective / “quieter” promise)
 */
export const PARCOURS_SUMMIT_STYLE_PRESET_INDEX: Record<ParcoursSummitStyleId, number> = {
  visible: 0,
  stronger: 1,
  discreet: 2,
}

export function resolveEngineSummitId(worldId: LandingWorldId, summitStyle: ParcoursSummitStyleId): string {
  const templateId = landingWorldToEngineTemplateId(worldId)
  const presets = getSummitPresets(templateId)
  const index = PARCOURS_SUMMIT_STYLE_PRESET_INDEX[summitStyle]
  const preset = presets[index] ?? presets[0]
  return preset.id
}

/** Final CTA: `/engine?template=…&summit=…&season=…` (Cardin-native query shape). */
export function buildParcoursEngineHref(params: {
  worldId: LandingWorldId
  summitStyle: ParcoursSummitStyleId
  seasonMonths: 3 | 6
}): string {
  const template = landingWorldToEngineTemplateId(params.worldId)
  const summit = resolveEngineSummitId(params.worldId, params.summitStyle)
  const search = new URLSearchParams({
    template,
    summit,
    season: String(params.seasonMonths),
  })
  return `/engine?${search.toString()}`
}
