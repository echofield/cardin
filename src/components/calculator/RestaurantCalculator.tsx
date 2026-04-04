"use client"

/**
 * Restaurant Calculator
 *
 * Natural language inputs for restaurant owners:
 * - Which services are empty?
 * - How's your weekend flow?
 * - Average cover price?
 */

import { useState } from "react"
import type { RestaurantCalculatorInput, ConcreteProjection } from "@/types/cardin-core.types"
import { calculateRestaurantProjection } from "@/lib/cardin/sector-calculator"

type Props = {
  onCalculate: (result: ConcreteProjection) => void
}

const SERVICES = [
  { id: "tuesday_dinner", label: "Mardi soir" },
  { id: "wednesday_lunch", label: "Mercredi midi" },
  { id: "wednesday_dinner", label: "Mercredi soir" },
  { id: "thursday_lunch", label: "Jeudi midi" },
  { id: "thursday_dinner", label: "Jeudi soir" },
  { id: "sunday_dinner", label: "Dimanche soir" },
]

const WEEKEND_FLOWS: Array<{ id: "full" | "moderate" | "empty"; label: string; description: string }> = [
  { id: "full", label: "Complet", description: "Vous refusez du monde" },
  { id: "moderate", label: "Modéré", description: "Vous remplissez sans plus" },
  { id: "empty", label: "Vide", description: "Vous cherchez des clients" },
]

export function RestaurantCalculator({ onCalculate }: Props) {
  const [emptyServices, setEmptyServices] = useState<string[]>(["tuesday_dinner"])
  const [weekendFlow, setWeekendFlow] = useState<"full" | "moderate" | "empty">("moderate")
  const [avgCoverPrice, setAvgCoverPrice] = useState(28)

  const toggleService = (service: string) => {
    setEmptyServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    )
  }

  const handleCalculate = () => {
    const input: RestaurantCalculatorInput = {
      emptyServices,
      weekendFlow,
      avgCoverPrice,
    }

    const projection = calculateRestaurantProjection(input)
    onCalculate(projection)
  }

  const canCalculate = emptyServices.length > 0 && avgCoverPrice > 0

  return (
    <div className="rounded-2xl border-2 border-[#173A2E] bg-white p-6">
      <h3 className="font-serif text-2xl text-[#173A2E]">Calculateur Restaurant</h3>
      <p className="mt-2 text-sm text-[#556159]">
        Remplissez vos services faibles. Dites-nous lesquels.
      </p>

      <div className="mt-6 space-y-6">
        {/* Question 1: Empty services */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Vos services vides ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Sélectionnez les services où vous avez peu de couverts
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`
                  rounded-full px-4 py-2 text-sm font-medium transition-all
                  ${
                    emptyServices.includes(service.id)
                      ? "bg-[#173A2E] text-white shadow-sm"
                      : "bg-[#F0F0F0] text-[#2A3F35] hover:bg-[#E5E5E5]"
                  }
                `}
              >
                {service.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Weekend flow */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Votre flux weekend ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Cela nous aide à calculer votre potentiel social
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {WEEKEND_FLOWS.map((flow) => (
              <button
                key={flow.id}
                onClick={() => setWeekendFlow(flow.id)}
                className={`
                  rounded-xl border p-4 text-left transition-all
                  ${
                    weekendFlow === flow.id
                      ? "border-[#173A2E] bg-[#E8F4EF]"
                      : "border-[#D5DBD1] bg-white hover:border-[#A0ADA5]"
                  }
                `}
              >
                <p
                  className={`font-medium ${
                    weekendFlow === flow.id ? "text-[#173A2E]" : "text-[#2A3F35]"
                  }`}
                >
                  {flow.label}
                </p>
                <p className="mt-1 text-xs text-[#556159]">{flow.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: Average cover price */}
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">
            Prix moyen couvert ?
          </label>
          <p className="mt-1 text-xs text-[#5E6961]">
            Ticket moyen par personne (entrée + plat + dessert + boisson)
          </p>
          <div className="mt-3 flex items-center gap-4">
            <input
              type="range"
              min="15"
              max="60"
              step="1"
              value={avgCoverPrice}
              onChange={(e) => setAvgCoverPrice(parseInt(e.target.value))}
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
              {avgCoverPrice}€
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
      {emptyServices.length > 0 && (
        <div className="mt-4 rounded-xl bg-[#F8F7F2] p-4">
          <p className="text-xs text-[#5E6961]">Votre profil :</p>
          <p className="mt-1 text-sm text-[#2A3F35]">
            {emptyServices.length} service{emptyServices.length > 1 ? "s" : ""} vide
            {emptyServices.length > 1 ? "s" : ""}, weekend {WEEKEND_FLOWS.find(f => f.id === weekendFlow)?.label.toLowerCase()}, {avgCoverPrice}€ par couvert
          </p>
        </div>
      )}
    </div>
  )
}
