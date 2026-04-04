"use client"

/**
 * Café Calculator
 *
 * Natural language inputs - NO abstract sliders
 * Questions a café owner actually thinks about:
 * - Which days are empty?
 * - When do regulars come?
 * - How many regulars do you have?
 */

import { useState } from "react"
import type { CafeCalculatorInput, ConcreteProjection } from "@/types/cardin-core.types"
import { calculateCafeProjection } from "@/lib/cardin/sector-calculator"

type Props = {
  onCalculate: (result: ConcreteProjection) => void
}

const DAYS = [
  { id: "monday", label: "Lundi" },
  { id: "tuesday", label: "Mardi" },
  { id: "wednesday", label: "Mercredi" },
  { id: "thursday", label: "Jeudi" },
  { id: "friday", label: "Vendredi" },
]

const TIMES = [
  { id: "morning", label: "Matin" },
  { id: "noon", label: "Midi" },
  { id: "afternoon", label: "Après-midi" },
  { id: "evening", label: "Soir" },
]

export function CafeCalculator({ onCalculate }: Props) {
  const [emptyDays, setEmptyDays] = useState<string[]>(["monday"])
  const [peakTimes, setPeakTimes] = useState<string[]>(["morning"])
  const [regularCount, setRegularCount] = useState(45)

  const toggleDay = (day: string) => {
    setEmptyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const toggleTime = (time: string) => {
    setPeakTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const handleCalculate = () => {
    const input: CafeCalculatorInput = {
      emptyDays,
      peakTimes,
      regularCount,
    }

    const projection = calculateCafeProjection(input)
    onCalculate(projection)
  }

  const canCalculate = emptyDays.length > 0 && peakTimes.length > 0 && regularCount > 0

  return (
    <div className="rounded-2xl border-2 border-[#173A2E] bg-white p-6">
      <h3 className="font-serif text-2xl text-[#173A2E]">Calculateur Café</h3>
      <p className="mt-2 text-sm text-[#556159]">
        Pas de pourcentages abstraits. Dites-nous votre réalité.
      </p>

      <div className="mt-6 space-y-6">
        {/* Question 1: Empty days */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Vos jours vides ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Sélectionnez les jours où vous avez peu de monde
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`
                  rounded-full px-4 py-2 text-sm font-medium transition-all
                  ${
                    emptyDays.includes(day.id)
                      ? "bg-[#173A2E] text-white shadow-sm"
                      : "bg-[#F0F0F0] text-[#2A3F35] hover:bg-[#E5E5E5]"
                  }
                `}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Peak times */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Vos créneaux forts ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Quand viennent vos habitués ?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIMES.map((time) => (
              <button
                key={time.id}
                onClick={() => toggleTime(time.id)}
                className={`
                  rounded-full px-4 py-2 text-sm font-medium transition-all
                  ${
                    peakTimes.includes(time.id)
                      ? "bg-[#173A2E] text-white shadow-sm"
                      : "bg-[#F0F0F0] text-[#2A3F35] hover:bg-[#E5E5E5]"
                  }
                `}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: Regular count */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Combien d'habitués actuellement ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Clients qui viennent au moins une fois par semaine
          </p>
          <div className="mt-3 flex items-center gap-4">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={regularCount}
              onChange={(e) => setRegularCount(parseInt(e.target.value))}
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
              {regularCount}
            </span>
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
      {emptyDays.length > 0 && peakTimes.length > 0 && (
        <div className="mt-4 rounded-xl bg-[#F8F7F2] p-4">
          <p className="text-xs text-[#5E6961]">Votre profil :</p>
          <p className="mt-1 text-sm text-[#2A3F35]">
            {emptyDays.length} jour{emptyDays.length > 1 ? "s" : ""} vide
            {emptyDays.length > 1 ? "s" : ""}, créneaux forts {peakTimes.map(t =>
              TIMES.find(time => time.id === t)?.label.toLowerCase()
            ).join(" et ")}, {regularCount} habitués
          </p>
        </div>
      )}
    </div>
  )
}
