/**
 * Concrete Projection Result
 *
 * Displays calculator output:
 * - Problem statement (ONE sentence)
 * - 3 concrete numbers (NO percentages)
 * - Full sentence projection
 *
 * NO technical language, NO abstract metrics
 */

import type { ConcreteProjection } from "@/types/cardin-core.types"

type Props = {
  projection: ConcreteProjection
  sectorType: "cafe" | "restaurant" | "creator" | "boutique"
}

export function ConcreteProjectionResult({ projection, sectorType }: Props) {
  // Intensity indicator
  const intensityColors = {
    low: "bg-[#FFD97D]",
    medium: "bg-[#7FD9B8]",
    high: "bg-[#173A2E]",
  }

  const intensityLabels = {
    low: "Modéré",
    medium: "Fort",
    high: "Intense",
  }

  return (
    <div className="rounded-2xl border-2 border-[#173A2E] bg-gradient-to-br from-[#E8F4EF] to-[#F0F8F5] p-6 shadow-lg">
      {/* Problem statement - THE KEY: one sentence that names their specific problem */}
      <div className="rounded-xl bg-white/70 p-4 shadow-sm">
        <p className="text-sm font-medium leading-relaxed text-[#173A2E]">
          {projection.problemStatement}
        </p>
      </div>

      {/* Three concrete numbers - NO percentages */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {/* Volume recovered */}
        <div className="rounded-xl bg-white/50 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">
            Volume récupéré
          </p>
          <p className="mt-2 font-serif text-3xl text-[#173A2E]">
            {projection.volumeRecovered}
          </p>
          <p className="mt-1 text-xs text-[#556159]">{projection.concreteMetric}</p>
        </div>

        {/* Revenue impact */}
        <div className="rounded-xl bg-white/50 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">
            Potentiel revenu
          </p>
          <p className="mt-2 font-serif text-3xl text-[#173A2E]">
            {projection.revenueImpact}€
          </p>
          <p className="mt-1 text-xs text-[#556159]">par mois</p>
        </div>

        {/* Domino intensity */}
        <div className="rounded-xl bg-white/50 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">
            Effet domino
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${intensityColors[projection.dominoIntensity]}`}
            />
            <p className="font-serif text-2xl text-[#173A2E]">
              {intensityLabels[projection.dominoIntensity]}
            </p>
          </div>
          <p className="mt-1 text-xs text-[#556159]">Propagation sociale</p>
        </div>
      </div>

      {/* Full sentence projection - concrete business language */}
      <div className="mt-6 rounded-xl border border-[#CCD3C9] bg-white/50 p-4">
        <p className="text-sm leading-relaxed text-[#2A3F35]">
          Avec votre flux actuel, <strong>Cardin peut récupérer{" "}
          {projection.volumeRecovered}{" "}
          {getSectorUnit(sectorType)}</strong> et générer{" "}
          <strong>{projection.revenueImpact}€ de revenu supplémentaire</strong> en{" "}
          <strong>{projection.timeframe}</strong>.
        </p>
      </div>

      {/* Timeframe indicator */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#5E6961]">
        <span>Horizon temporel : {projection.timeframe}</span>
        <span>
          Impact domino : {intensityLabels[projection.dominoIntensity].toLowerCase()}
        </span>
      </div>
    </div>
  )
}

/**
 * Get sector-specific unit for volume
 */
function getSectorUnit(sectorType: "cafe" | "restaurant" | "creator" | "boutique"): string {
  const units: Record<string, string> = {
    cafe: "passages",
    restaurant: "couverts",
    creator: "membres engagés",
    boutique: "conversions",
  }
  return units[sectorType] || "passages"
}

/**
 * Loading skeleton for projection result
 */
export function ConcreteProjectionResultSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-gray-300 bg-gradient-to-br from-[#E8F4EF] to-[#F0F8F5] p-6 animate-pulse">
      <div className="rounded-xl bg-white/70 p-4">
        <div className="h-4 bg-gray-300 rounded w-full" />
        <div className="mt-2 h-4 bg-gray-300 rounded w-3/4" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white/50 p-4">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="mt-2 h-8 bg-gray-300 rounded w-16" />
            <div className="mt-1 h-3 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white/50 p-4">
        <div className="h-4 bg-gray-300 rounded w-full" />
        <div className="mt-2 h-4 bg-gray-300 rounded w-5/6" />
      </div>
    </div>
  )
}
