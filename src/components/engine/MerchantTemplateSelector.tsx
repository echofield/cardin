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
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                  ? "border-[#173A2E] bg-[#F1F4EE] shadow-[0_10px_30px_-20px_rgba(23,58,46,0.8)]"
                  : "border-[#D8DBD2] bg-[#FFFDF8] hover:border-[#AEB8AB]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-serif text-2xl text-[#173A2E]">{template.label}</p>
                {isSelected ? (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-2 text-xs text-[#FBFAF6]">
                    OK
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#4F5A53]">{template.description}</p>

              <div className="mt-5 space-y-2 border-t border-[#D8DBD2] pt-4 text-sm">
                <p className="text-[#173A2E]">{template.rewardExample}</p>
                <p className="text-[#6A726B]">{template.rhythmLabel}</p>
              </div>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
