"use client"

/**
 * Creator Calculator
 *
 * Natural language inputs for creators:
 * - Community size?
 * - What % come back?
 * - Content frequency?
 */

import { useState } from "react"
import type { CreatorCalculatorInput, ConcreteProjection } from "@/types/cardin-core.types"
import { calculateCreatorProjection } from "@/lib/cardin/sector-calculator"

type Props = {
  onCalculate: (result: ConcreteProjection) => void
}

const CONTENT_FREQUENCIES: Array<{ id: "daily" | "weekly" | "monthly"; label: string; description: string }> = [
  { id: "daily", label: "Quotidien", description: "Vous publiez tous les jours" },
  { id: "weekly", label: "Hebdomadaire", description: "1-3 fois par semaine" },
  { id: "monthly", label: "Mensuel", description: "Quelques fois par mois" },
]

export function CreatorCalculator({ onCalculate }: Props) {
  const [communitySize, setCommunitySize] = useState(250)
  const [avgReturnRate, setAvgReturnRate] = useState(0.30) // 30%
  const [contentFrequency, setContentFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")

  const handleCalculate = () => {
    const input: CreatorCalculatorInput = {
      communitySize,
      avgReturnRate,
      contentFrequency,
    }

    const projection = calculateCreatorProjection(input)
    onCalculate(projection)
  }

  const canCalculate = communitySize > 0 && avgReturnRate > 0

  const returnRatePercent = Math.round(avgReturnRate * 100)

  return (
    <div className="rounded-2xl border-2 border-[#173A2E] bg-white p-6">
      <h3 className="font-serif text-2xl text-[#173A2E]">Calculateur Créateur</h3>
      <p className="mt-2 text-sm text-[#556159]">
        Votre communauté existe. Cardin la rend plus engagée.
      </p>

      <div className="mt-6 space-y-6">
        {/* Question 1: Community size */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Taille de votre communauté ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Abonnés, followers, liste email - qui vous suit actuellement
          </p>
          <div className="mt-3 flex items-center gap-4">
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={communitySize}
              onChange={(e) => setCommunitySize(parseInt(e.target.value))}
              className="h-2 flex-1 appearance-none rounded-full bg-[#E5E5E5]
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#173A2E]
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:appearance-none
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[#173A2E]
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:border-0"
            />
            <span className="min-w-[4rem] text-right font-serif text-2xl text-[#173A2E]">
              {communitySize}
            </span>
          </div>
        </div>

        {/* Question 2: Return rate */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            % qui reviennent actuellement ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Sur 100 personnes, combien reviennent régulièrement ?
          </p>
          <div className="mt-3 flex items-center gap-4">
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={avgReturnRate}
              onChange={(e) => setAvgReturnRate(parseFloat(e.target.value))}
              className="h-2 flex-1 appearance-none rounded-full bg-[#E5E5E5]
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#173A2E]
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:appearance-none
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[#173A2E]
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:border-0"
            />
            <span className="min-w-[4rem] text-right font-serif text-2xl text-[#173A2E]">
              {returnRatePercent}%
            </span>
          </div>
        </div>

        {/* Question 3: Content frequency */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Fréquence de contenu ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            À quelle vitesse créez-vous du contenu ?
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {CONTENT_FREQUENCIES.map((freq) => (
              <button
                key={freq.id}
                onClick={() => setContentFrequency(freq.id)}
                className={`
                  rounded-xl border p-4 text-left transition-all
                  ${
                    contentFrequency === freq.id
                      ? "border-[#173A2E] bg-[#E8F4EF]"
                      : "border-[#D5DBD1] bg-white hover:border-[#A0ADA5]"
                  }
                `}
              >
                <p
                  className={`font-medium ${
                    contentFrequency === freq.id ? "text-[#173A2E]" : "text-[#2A3F35]"
                  }`}
                >
                  {freq.label}
                </p>
                <p className="mt-1 text-xs text-[#556159]">{freq.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        disabled={!canCalculate}
        className={`
          mt-6 w-full rounded-xl py-3 text-sm font-medium transition-all
          ${
            canCalculate
              ? "bg-[#173A2E] text-white hover:bg-[#0F2820] shadow-sm"
              : "bg-[#E5E5E5] text-[#9CA3A0] cursor-not-allowed"
          }
        `}
      >
        Voir ce que Cardin peut ramener
      </button>

      {/* Current selection summary */}
      <div className="mt-4 rounded-xl bg-[#F8F7F2] p-4">
        <p className="text-xs text-[#5E6961]">Votre profil :</p>
        <p className="mt-1 text-sm text-[#2A3F35]">
          {communitySize} personnes, {returnRatePercent}% reviennent, contenu{" "}
          {CONTENT_FREQUENCIES.find(f => f.id === contentFrequency)?.label.toLowerCase()}
        </p>
      </div>
    </div>
  )
}
