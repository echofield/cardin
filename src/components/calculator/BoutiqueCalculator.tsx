"use client"

/**
 * Boutique Calculator
 *
 * Focus on client trajectory and value, not traffic:
 * - Repeat clients vs one-time
 * - Average spend per client over time
 * - Collection/season cycles that drive returns
 */

import { useState } from "react"
import type { BoutiqueCalculatorInput, ConcreteProjection } from "@/types/cardin-core.types"
import { calculateBoutiqueProjection } from "@/lib/cardin/sector-calculator"

type Props = {
  onCalculate: (result: ConcreteProjection) => void
}

const MONTHS = [
  { id: "january", label: "Janvier" },
  { id: "february", label: "Février" },
  { id: "march", label: "Mars" },
  { id: "april", label: "Avril" },
  { id: "may", label: "Mai" },
  { id: "june", label: "Juin" },
  { id: "july", label: "Juillet" },
  { id: "august", label: "Août" },
  { id: "september", label: "Septembre" },
  { id: "october", label: "Octobre" },
  { id: "november", label: "Novembre" },
  { id: "december", label: "Décembre" },
]

export function BoutiqueCalculator({ onCalculate }: Props) {
  const [footfall, setFootfall] = useState(30) // Keeping for calculation but renamed conceptually
  const [conversionRate, setConversionRate] = useState(0.20) // Repeat client rate
  const [avgBasket, setAvgBasket] = useState(80) // Higher for boutique
  const [seasonalPeaks, setSeasonalPeaks] = useState<string[]>(["december"])

  const toggleMonth = (month: string) => {
    setSeasonalPeaks((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    )
  }

  const handleCalculate = () => {
    const input: BoutiqueCalculatorInput = {
      footfall,
      conversionRate,
      avgBasket,
      seasonalPeaks,
    }

    const projection = calculateBoutiqueProjection(input)
    onCalculate(projection)
  }

  const canCalculate = footfall > 0 && conversionRate > 0 && avgBasket > 0

  const conversionPercent = Math.round(conversionRate * 100)

  return (
    <div className="rounded-2xl border-2 border-[#173A2E] bg-white p-6">
      <h3 className="font-serif text-2xl text-[#173A2E]">Calculateur Boutique</h3>
      <p className="mt-2 text-sm text-[#556159]">
        Focus: valeur client, trajectoire, collection.
      </p>

      <div className="mt-6 space-y-6">
        {/* Question 1: Client base */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Clientes actives par mois ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Clientes qui passent au moins une fois par mois
          </p>
          <div className="mt-3 flex items-center gap-4">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={footfall}
              onChange={(e) => setFootfall(parseInt(e.target.value))}
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
            <span className="min-w-[3rem] text-right font-serif text-2xl text-[#173A2E]">
              {footfall}
            </span>
          </div>
        </div>

        {/* Question 2: Repeat rate */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Taux de retour ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Sur 100 clientes, combien reviennent pour une collection ?
          </p>
          <div className="mt-3 flex items-center gap-4">
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={conversionRate}
              onChange={(e) => setConversionRate(parseFloat(e.target.value))}
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
              {conversionPercent}%
            </span>
          </div>
        </div>

        {/* Question 3: Average basket */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Valeur par visite ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Panier moyen quand une cliente achète
          </p>
          <div className="mt-3 flex items-center gap-4">
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={avgBasket}
              onChange={(e) => setAvgBasket(parseInt(e.target.value))}
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
              {avgBasket}€
            </span>
          </div>
        </div>

        {/* Question 4: Collection peaks */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Vos collections fortes ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Mois où vos clientes reviennent pour la collection
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {MONTHS.map((month) => (
              <button
                key={month.id}
                onClick={() => toggleMonth(month.id)}
                className={`
                  rounded-lg px-3 py-2 text-xs font-medium transition-all
                  ${
                    seasonalPeaks.includes(month.id)
                      ? "bg-[#173A2E] text-white shadow-sm"
                      : "bg-[#F0F0F0] text-[#2A3F35] hover:bg-[#E5E5E5]"
                  }
                `}
              >
                {month.label}
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
          {footfall} clientes actives/mois, {conversionPercent}% de retour, {avgBasket}€ par visite,{" "}
          {seasonalPeaks.length} collection{seasonalPeaks.length > 1 ? "s" : ""} forte
          {seasonalPeaks.length > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
