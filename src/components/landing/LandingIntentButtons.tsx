"use client"

import { type MerchantIntent, INTENT_OPTIONS } from "@/lib/dynamics-library"

type LandingIntentButtonsProps = {
  selectedIntent: MerchantIntent | null
  onSelectIntent: (intent: MerchantIntent) => void
}

export function LandingIntentButtons({ selectedIntent, onSelectIntent }: LandingIntentButtonsProps) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {INTENT_OPTIONS.map((opt) => {
        const isSelected = selectedIntent === opt.id
        return (
          <button
            className={[
              "rounded-2xl border px-4 py-4 text-left text-sm font-medium transition",
              isSelected
                ? "border-[#173A2E] bg-[#173A2E] text-[#FBFAF6] shadow-[0_18px_40px_-28px_rgba(23,58,46,0.75)]"
                : "border-[#C8D1C7] bg-[#FBFCF8] text-[#173A2E] hover:border-[#173A2E] hover:bg-[#F4F7F0]",
            ].join(" ")}
            key={opt.id}
            onClick={() => onSelectIntent(opt.id)}
            type="button"
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
