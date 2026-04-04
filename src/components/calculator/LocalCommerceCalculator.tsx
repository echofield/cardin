"use client"

import { useState } from "react"

import { calculateLocalCommerceProjection } from "@/lib/cardin/sector-calculator"
import type { ConcreteProjection, LocalCommerceCalculatorInput } from "@/types/cardin-core.types"

type Props = {
  onCalculate: (result: ConcreteProjection) => void
}

const repeatRhythms: Array<{
  id: "high" | "mixed" | "low"
  label: string
  description: string
}> = [
  {
    id: "high",
    label: "Souvent",
    description: "Une bonne partie de vos clients revient deja regulierement.",
  },
  {
    id: "mixed",
    label: "Parfois",
    description: "Vous avez a la fois des habitués et des achats plus occasionnels.",
  },
  {
    id: "low",
    label: "Rarement",
    description: "La plupart viennent plutot de temps en temps.",
  },
]

export function LocalCommerceCalculator({ onCalculate }: Props) {
  const [clientsPerDay, setClientsPerDay] = useState(35)
  const [avgBasket, setAvgBasket] = useState(22)
  const [quietDays, setQuietDays] = useState(2)
  const [repeatRhythm, setRepeatRhythm] = useState<"high" | "mixed" | "low">("mixed")

  const handleCalculate = () => {
    const input: LocalCommerceCalculatorInput = {
      clientsPerDay,
      avgBasket,
      quietDays,
      repeatRhythm,
    }

    const projection = calculateLocalCommerceProjection(input)
    onCalculate(projection)
  }

  return (
    <div className="rounded-2xl border-2 border-[#173A2E] bg-white p-6">
      <h3 className="font-serif text-2xl text-[#173A2E]">Calculateur Commerce de quartier</h3>
      <p className="mt-2 text-sm text-[#556159]">
        Pour les commerces qui veulent se projeter vite, meme sans se reconnaitre dans un vertical precis.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">Clients par jour ?</label>
          <p className="mt-1 text-xs text-[#5E6961]">Combien de personnes passez-vous en moyenne dans une journee normale ?</p>
          <div className="mt-3 flex items-center gap-4">
            <input
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
              max="120"
              min="10"
              onChange={(event) => setClientsPerDay(parseInt(event.target.value))}
              step="5"
              type="range"
              value={clientsPerDay}
            />
            <span className="min-w-[3rem] text-right font-serif text-2xl text-[#173A2E]">{clientsPerDay}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">Panier moyen ?</label>
          <p className="mt-1 text-xs text-[#5E6961]">Montant moyen depense par passage ou achat.</p>
          <div className="mt-3 flex items-center gap-4">
            <input
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
              max="90"
              min="8"
              onChange={(event) => setAvgBasket(parseInt(event.target.value))}
              step="2"
              type="range"
              value={avgBasket}
            />
            <span className="min-w-[4rem] text-right font-serif text-2xl text-[#173A2E]">{avgBasket}EUR</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">Combien de jours sont plus calmes dans votre semaine ?</label>
          <p className="mt-1 text-xs text-[#5E6961]">Le but est de recuperer du passage la ou la routine se casse.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((count) => (
              <button
                className={[
                  "rounded-xl border p-4 text-center transition-all",
                  quietDays === count ? "border-[#173A2E] bg-[#E8F4EF]" : "border-[#D5DBD1] bg-white hover:border-[#A0ADA5]",
                ].join(" ")}
                key={count}
                onClick={() => setQuietDays(count)}
                type="button"
              >
                <p className="font-serif text-2xl text-[#173A2E]">{count}</p>
                <p className="mt-1 text-xs text-[#556159]">jour{count > 1 ? "s" : ""} calme{count > 1 ? "s" : ""}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A3F35]">Votre clientele revient plutot...</label>
          <p className="mt-1 text-xs text-[#5E6961]">Cela nous aide a estimer la vitesse a laquelle Cardin peut remettre du rythme.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {repeatRhythms.map((option) => (
              <button
                className={[
                  "rounded-xl border p-4 text-left transition-all",
                  repeatRhythm === option.id ? "border-[#173A2E] bg-[#E8F4EF]" : "border-[#D5DBD1] bg-white hover:border-[#A0ADA5]",
                ].join(" ")}
                key={option.id}
                onClick={() => setRepeatRhythm(option.id)}
                type="button"
              >
                <p className="font-medium text-[#173A2E]">{option.label}</p>
                <p className="mt-1 text-xs text-[#556159]">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        className="mt-6 w-full rounded-xl bg-[#173A2E] py-3 text-sm font-medium text-white transition-all hover:bg-[#0F2820] shadow-sm"
        onClick={handleCalculate}
        type="button"
      >
        Voir ce que Cardin peut ramener
      </button>

      <div className="mt-4 rounded-xl bg-[#F8F7F2] p-4">
        <p className="text-xs text-[#5E6961]">Votre profil :</p>
        <p className="mt-1 text-sm text-[#2A3F35]">
          {clientsPerDay} clients / jour, {avgBasket}EUR de panier moyen, {quietDays} jour{quietDays > 1 ? "s" : ""} plus calme{quietDays > 1 ? "s" : ""}, clientele qui revient {repeatRhythms.find((option) => option.id === repeatRhythm)?.label.toLowerCase()}.
        </p>
      </div>
    </div>
  )
}
