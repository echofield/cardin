"use client"

import { useEffect, useMemo, useState } from "react"

import type { MerchantTemplate } from "@/lib/merchant-templates"
import { merchantTemplates } from "@/lib/merchant-templates"
import { Card } from "@/ui/card"

type MerchantTemplateSelectorProps = {
  templates?: MerchantTemplate[]
  selectedTemplateId?: string
  preselectedTemplateId?: string
  onSelect?: (template: MerchantTemplate) => void
}

export function MerchantTemplateSelector({
  templates = merchantTemplates,
  selectedTemplateId,
  preselectedTemplateId,
  onSelect,
}: MerchantTemplateSelectorProps) {
  const initialTemplate = useMemo(() => {
    const requestedId = selectedTemplateId ?? preselectedTemplateId
    return templates.find((template) => template.id === requestedId) ?? templates[0]
  }, [preselectedTemplateId, selectedTemplateId, templates])

  const [internalSelection, setInternalSelection] = useState<string>(initialTemplate.id)

  const activeId = selectedTemplateId ?? internalSelection

  useEffect(() => {
    if (selectedTemplateId) {
      return
    }

    setInternalSelection(initialTemplate.id)
  }, [initialTemplate.id, selectedTemplateId])

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => {
        const isSelected = template.id === activeId

        return (
          <button
            className="text-left"
            key={template.id}
            onClick={() => {
              if (!selectedTemplateId) {
                setInternalSelection(template.id)
              }

              onSelect?.(template)
            }}
            type="button"
          >
            <Card
              className={[
                "h-full p-5 transition-all duration-200",
                isSelected
                  ? "border-[#173A2E] bg-[linear-gradient(180deg,#F4F7F0_0%,#EDF3EC_100%)] shadow-[0_24px_50px_-28px_rgba(23,58,46,0.7)] ring-1 ring-[#173A2E]"
                  : "border-[#D8DBD2] bg-[#FFFDF8] hover:border-[#AEB8AB] hover:shadow-[0_18px_40px_-34px_rgba(23,58,46,0.55)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl text-[#173A2E]">{template.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#4F5A53]">{template.description}</p>
                </div>

                <span
                  className={[
                    "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em]",
                    isSelected ? "border-[#173A2E] bg-[#173A2E] text-[#FBFAF6]" : "border-[#D8DBD2] bg-[#FBFCF8] text-[#637067]",
                  ].join(" ")}
                >
                  {isSelected ? "Actif" : "Choisir"}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#637067]">Ce que Cardin travaille</p>
                  <p className="mt-2 text-sm text-[#203B31]">{template.needs.join(" / ")}</p>
                </div>

                <div className="rounded-2xl border border-[#D8DBD2] bg-[#FBFCF8] p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#637067]">Point de depart</p>
                  <p className="mt-2 text-sm font-medium text-[#173A2E]">{template.pointOfDeparture}</p>
                </div>
              </div>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
