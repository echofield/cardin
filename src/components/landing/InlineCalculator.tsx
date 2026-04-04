"use client"

/**
 * Inline Calculator - Landing Page Transformation
 *
 * Replaces multi-step flow with immediate inline calculation:
 * 1. Select sector → Calculator unfolds
 * 2. Natural inputs → Concrete projection
 * 3. CTA appears below result
 *
 * Timeline: 10 seconds from selection to "of course" moment
 */

import { useState } from "react"
import Link from "next/link"
import { CafeCalculator } from "@/components/calculator/CafeCalculator"
import { RestaurantCalculator } from "@/components/calculator/RestaurantCalculator"
import { CreatorCalculator } from "@/components/calculator/CreatorCalculator"
import { BoutiqueCalculator } from "@/components/calculator/BoutiqueCalculator"
import { ConcreteProjectionResult } from "@/components/calculator/ConcreteProjectionResult"
import type { ConcreteProjection } from "@/types/cardin-core.types"
import { trackEvent } from "@/lib/analytics"

type SectorType = "cafe" | "restaurant" | "creator" | "boutique"

type SectorOption = {
  id: SectorType
  label: string
  icon: string
  description: string
}

const SECTORS: SectorOption[] = [
  {
    id: "cafe",
    label: "Café",
    icon: "☕",
    description: "Transformez vos matins vides en flux régulier",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    description: "Remplissez vos services faibles sans effort",
  },
  {
    id: "creator",
    label: "Créateur",
    icon: "✨",
    description: "Engagez votre communauté qui dort",
  },
  {
    id: "boutique",
    label: "Boutique",
    icon: "🏪",
    description: "Convertissez plus de passages en achats",
  },
]

export function InlineCalculator() {
  const [selectedSector, setSelectedSector] = useState<SectorType | null>(null)
  const [projection, setProjection] = useState<ConcreteProjection | null>(null)

  const handleSectorSelect = (sector: SectorType) => {
    setSelectedSector(sector)
    setProjection(null) // Reset projection when changing sector
    trackEvent("calculator_sector_selected", { sector })
  }

  const handleCalculate = (result: ConcreteProjection) => {
    setProjection(result)
    trackEvent("calculator_result_generated", {
      sector: selectedSector,
      volumeRecovered: result.volumeRecovered,
      revenueImpact: result.revenueImpact,
    })

    // Smooth scroll to result
    setTimeout(() => {
      document.getElementById("projection-result")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }, 100)
  }

  return (
    <div className="w-full">
      {/* Sector Selector */}
      <div className="rounded-2xl border-2 border-[#D4D9D0] bg-white p-6 shadow-lg sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[#5C655E]">
          Votre situation
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-tight text-[#16372C] sm:text-4xl">
          Quel est votre commerce ?
        </h2>
        <p className="mt-2 text-sm text-[#556159]">
          Choisissez votre secteur pour voir ce que Cardin peut ramener
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => handleSectorSelect(sector.id)}
              className={`
                group rounded-xl border-2 p-4 text-left transition-all duration-200
                ${
                  selectedSector === sector.id
                    ? "border-[#173A2E] bg-[#E8F4EF] shadow-sm scale-[1.02]"
                    : "border-[#E0E4DE] bg-white hover:border-[#A0ADA5] hover:-translate-y-0.5"
                }
              `}
              type="button"
            >
              <span className="text-3xl">{sector.icon}</span>
              <p
                className={`mt-2 font-serif text-xl ${
                  selectedSector === sector.id ? "text-[#173A2E]" : "text-[#2A3F35]"
                }`}
              >
                {sector.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#556159]">
                {sector.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Accordion - Unfolds when sector selected */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]
          ${selectedSector ? "mt-6 max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        {selectedSector === "cafe" && <CafeCalculator onCalculate={handleCalculate} />}
        {selectedSector === "restaurant" && <RestaurantCalculator onCalculate={handleCalculate} />}
        {selectedSector === "creator" && <CreatorCalculator onCalculate={handleCalculate} />}
        {selectedSector === "boutique" && <BoutiqueCalculator onCalculate={handleCalculate} />}
      </div>

      {/* Projection Result - Shows after calculation */}
      {projection && selectedSector && (
        <div
          id="projection-result"
          className="mt-6 animate-fadeIn"
          style={{
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <ConcreteProjectionResult projection={projection} sectorType={selectedSector} />

          {/* CTA appears below result */}
          <div className="mt-6 rounded-2xl border-2 border-[#173A2E] bg-gradient-to-br from-[#173A2E] to-[#0F2820] p-6 shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-2xl text-white">
                  Prêt à mettre en place ?
                </p>
                <p className="mt-1 text-sm text-[#B8D4C8]">
                  119€ mise en place · 39€/mois moteur actif
                </p>
              </div>
              <Link href="/auth/signup">
                <button
                  onClick={() =>
                    trackEvent("calculator_cta_clicked", {
                      sector: selectedSector,
                      volumeRecovered: projection.volumeRecovered,
                      revenueImpact: projection.revenueImpact,
                    })
                  }
                  className="whitespace-nowrap rounded-xl bg-white px-6 py-3 font-medium text-[#173A2E] transition-all hover:scale-105 hover:shadow-lg active:scale-100"
                  type="button"
                >
                  Activer Cardin →
                </button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-[#B8D4C8]">
              Activation en 10 minutes · Sans engagement · Support inclus
            </p>
          </div>
        </div>
      )}

      {/* Optional: Add fade-in keyframe if not in global CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
