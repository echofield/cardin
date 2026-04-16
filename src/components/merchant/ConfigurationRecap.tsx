"use client"

import { Card } from "@/ui"
import {
  ACCESS_OPTIONS,
  INTENSITE_OPTIONS,
  MOMENT_OPTIONS,
  PROPAGATION_OPTIONS,
  SEASON_REWARDS,
  TRIGGER_OPTIONS,
  type AccessTypeId,
  type MomentId,
  type PropagationTypeId,
  type RewardTypeId,
  type SeasonRewardId,
  type TriggerTypeId,
} from "@/lib/parcours-selection-config"
import type { LandingWorldId } from "@/lib/landing-content"
import type { ParcoursSummitStyleId } from "@/lib/parcours-contract"

type Props = {
  selections: {
    worldId: LandingWorldId | string
    seasonRewardId: SeasonRewardId | null
    rewardType: RewardTypeId | null
    intensite: ParcoursSummitStyleId | null
    moment: MomentId | null
    accessType: AccessTypeId | null
    triggerType: TriggerTypeId | null
    propagationType: PropagationTypeId | null
    summaryLine?: string
    nextStepLine?: string
    submittedAt?: string
  }
}

function findLabel<T extends { id: string; label: string }>(list: readonly T[], id: string | null): string {
  if (!id) return "—"
  return list.find((o) => o.id === id)?.label ?? "—"
}

const REWARD_TYPE_LABELS: Record<RewardTypeId, string> = {
  direct: "Direct",
  progression: "Progression",
  invitation: "Invitation",
  evenement: "Événement",
}

export function ConfigurationRecap({ selections }: Props) {
  const seasonLabel =
    selections.seasonRewardId && selections.worldId in SEASON_REWARDS
      ? SEASON_REWARDS[selections.worldId as LandingWorldId]?.find((o) => o.id === selections.seasonRewardId)?.label ?? "—"
      : "—"

  const rows: Array<{ label: string; value: string }> = [
    { label: "Récompense de saison", value: seasonLabel },
    { label: "Type de récompense", value: selections.rewardType ? REWARD_TYPE_LABELS[selections.rewardType] : "—" },
    { label: "Visibilité", value: findLabel(INTENSITE_OPTIONS, selections.intensite) },
    { label: "Quand ça se déclenche", value: findLabel(MOMENT_OPTIONS, selections.moment) },
    { label: "Qui peut accéder", value: findLabel(ACCESS_OPTIONS, selections.accessType) },
    { label: "Propagation", value: findLabel(PROPAGATION_OPTIONS, selections.propagationType) },
  ]

  return (
    <Card className="p-6">
      <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Votre configuration</p>
      <p className="mt-1 text-[11px] text-[#7B8581]">Choisie lors du parcours marchand. Modifiable en nous écrivant.</p>

      <dl className="mt-5 divide-y divide-[#E7E2D6]">
        {rows.map((row) => (
          <div className="flex items-baseline justify-between gap-4 py-2.5" key={row.label}>
            <dt className="text-xs uppercase tracking-[0.08em] text-[#5F6B62]">{row.label}</dt>
            <dd className="text-right text-sm text-[#173A2E]">{row.value}</dd>
          </div>
        ))}
      </dl>

      {selections.nextStepLine ? (
        <div className="mt-5 rounded-2xl border border-[#173A2E]/15 bg-[#EEF3EC] p-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#355246]">Comportement attendu</p>
          <p className="mt-2 text-sm leading-6 text-[#2A3F35]">{selections.nextStepLine}</p>
        </div>
      ) : null}
    </Card>
  )
}
