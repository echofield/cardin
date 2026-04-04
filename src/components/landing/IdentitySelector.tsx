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
    <div className="mx-auto w-full max-w-3xl grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {MERCHANT_IDENTITY_OPTIONS.map((item) => (
        <button
          className="group w-full rounded-[28px] border border-[#D4D9D0] bg-[#FDFCF8] px-6 py-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#173A2E] hover:shadow-md active:scale-[0.99]"
          key={item.type}
          onClick={() => go(item.type)}
          type="button"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#92A094]">Situation</span>
          <span className="mt-3 block font-serif text-2xl text-[#15372B]">{item.label}</span>
          <span className="mt-2 block text-sm font-medium text-[#2A3F35]">/ {item.line}</span>
          <span className="mt-4 block text-sm leading-relaxed text-[#6B766D]">{item.detail}</span>
        </button>
      ))}
    </div>
  )
}
