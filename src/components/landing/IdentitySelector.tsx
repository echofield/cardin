"use client"

import { useRouter } from "next/navigation"

import { trackEvent } from "@/lib/analytics"
import { MERCHANT_IDENTITY_OPTIONS, type MerchantProjectionType } from "@/lib/projection-scenarios"

export function IdentitySelector() {
  const router = useRouter()

  const go = (type: MerchantProjectionType) => {
    trackEvent("hero_cta", { source: "landing_identity", merchantType: type })
    router.push(`/projection?type=${type}`)
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 sm:max-w-xl">
      {MERCHANT_IDENTITY_OPTIONS.map((item) => (
        <button
          className="group w-full rounded-2xl border border-[#D4D9D0] bg-[#FDFCF8] px-6 py-5 text-left transition hover:border-[#173A2E] hover:bg-[#F4F6F2] active:scale-[0.99]"
          key={item.type}
          onClick={() => go(item.type)}
          type="button"
        >
          <span className="font-serif text-xl text-[#15372B] sm:text-2xl">{item.label}</span>
          <span className="mt-1 block text-sm font-normal text-[#5C655E]">/ {item.line}</span>
        </button>
      ))}
    </div>
  )
}
