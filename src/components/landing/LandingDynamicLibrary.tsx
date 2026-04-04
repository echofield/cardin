"use client"

import { useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import {
  getDynamicDefinition,
  getExpandedDynamicDefinitions,
  getPrimaryDynamicDefinitions,
  getRecommendedDynamicIds,
  isPhase2Dynamic,
  type DynamicDefinition,
  type DynamicId,
  type MerchantIntent,
} from "@/lib/dynamics-library"
import { Card } from "@/ui"

import { DynamicDetailModal } from "@/components/landing/DynamicDetailModal"

type LandingDynamicLibraryProps = {
  intent: MerchantIntent
  merchantType: string
  selectedDynamicId: DynamicId
  onSelectDynamic: (id: DynamicId) => void
}

export function LandingDynamicLibrary({
  intent,
  merchantType,
  selectedDynamicId,
  onSelectDynamic,
}: LandingDynamicLibraryProps) {
  const [expanded, setExpanded] = useState(false)
  const [detailDynamic, setDetailDynamic] = useState<DynamicDefinition | null>(null)

  const recommendedIds = useMemo(() => getRecommendedDynamicIds(intent, merchantType), [intent, merchantType])

  const recommended = useMemo(
    () => recommendedIds.map((id) => getDynamicDefinition(id)),
    [recommendedIds]
  )

  const expandedPrimary = useMemo(() => {
    const primary = getPrimaryDynamicDefinitions()
    return primary.filter((d) => !recommended.some((r) => r.id === d.id))
  }, [recommended])

  const phase2 = useMemo(() => getExpandedDynamicDefinitions().filter((d) => isPhase2Dynamic(d.id)), [])

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Le meilleur mouvement à installer ici</p>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {recommended.map((dyn) => (
          <DynamicCard
            key={dyn.id}
            dynamic={dyn}
            isSelected={selectedDynamicId === dyn.id}
            onOpenDetail={() => {
              setDetailDynamic(dyn)
              trackEvent("landing_dynamic_detail_open", { dynamicId: dyn.id, intent, templateId: merchantType })
            }}
            onSelect={() => {
              onSelectDynamic(dyn.id)
              trackEvent("landing_dynamic_select", { dynamicId: dyn.id, intent, templateId: merchantType })
            }}
          />
        ))}
      </div>

      <button
        className="text-sm font-medium text-[#173A2E] underline-offset-4 hover:underline"
        onClick={() => {
          setExpanded((e) => !e)
          trackEvent("landing_dynamic_expand_toggle", { expanded: !expanded, intent, templateId: merchantType })
        }}
        type="button"
      >
        {expanded ? "Masquer les autres dynamiques" : "Voir d'autres dynamiques"}
      </button>

      {expanded ? (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {expandedPrimary.map((dyn) => (
              <DynamicCard
                key={dyn.id}
                dynamic={dyn}
                isSelected={selectedDynamicId === dyn.id}
                onOpenDetail={() => setDetailDynamic(dyn)}
                onSelect={() => {
                  onSelectDynamic(dyn.id)
                  trackEvent("landing_dynamic_select", { dynamicId: dyn.id, intent, templateId: merchantType })
                }}
              />
            ))}
          </div>

          <Card className="border-dashed border-[#C8D1C7] bg-[#FAFAF7] p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#7A847B]">Évolution · phase 2</p>
            <p className="mt-2 text-sm text-[#556159]">Optionnel — quand vous êtes prêt à passer à un modèle plus engagé.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {phase2.map((dyn) => (
                <DynamicCard
                  key={dyn.id}
                  dynamic={dyn}
                  isSelected={selectedDynamicId === dyn.id}
                  onOpenDetail={() => setDetailDynamic(dyn)}
                  onSelect={() => {
                    onSelectDynamic(dyn.id)
                    trackEvent("landing_dynamic_select", { dynamicId: dyn.id, intent, templateId: merchantType })
                  }}
                />
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      <DynamicDetailModal dynamic={detailDynamic} onClose={() => setDetailDynamic(null)} />
    </div>
  )
}

function DynamicCard({
  dynamic,
  isSelected,
  onSelect,
  onOpenDetail,
}: {
  dynamic: DynamicDefinition
  isSelected: boolean
  onSelect: () => void
  onOpenDetail: () => void
}) {
  return (
    <Card
      className={[
        "flex h-full flex-col p-4 transition",
        isSelected ? "border-[#173A2E] bg-[#EFF4EC] ring-1 ring-[#173A2E]" : "border-[#D8DBD2] bg-[#FFFDF8] hover:border-[#AEB8AB]",
      ].join(" ")}
    >
      <p className="font-serif text-lg text-[#173A2E]">{dynamic.cardTitle}</p>
      <p className="mt-2 flex-1 text-sm text-[#4F5A53]">{dynamic.cardHook}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className={[
            "rounded-full px-4 py-2 text-xs font-medium",
            isSelected ? "bg-[#173A2E] text-[#FBFAF6]" : "border border-[#C8D1C7] bg-[#FBFCF8] text-[#173A2E] hover:border-[#173A2E]",
          ].join(" ")}
          onClick={onSelect}
          type="button"
        >
          {isSelected ? "Sélectionné" : "Choisir"}
        </button>
        <button className="text-xs font-medium text-[#173A2E] underline-offset-2 hover:underline" onClick={onOpenDetail} type="button">
          Détail
        </button>
      </div>
    </Card>
  )
}
