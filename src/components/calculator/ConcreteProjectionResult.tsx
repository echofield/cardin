import type { ConcreteProjection } from "@/types/cardin-core.types"

type Props = {
  projection: ConcreteProjection
  sectorType: "cafe" | "restaurant" | "local" | "creator" | "boutique"
}

const intensityColors = {
  low: "bg-[#FFD97D]",
  medium: "bg-[#7FD9B8]",
  high: "bg-[#173A2E]",
}

const intensityLabels = {
  low: "Modere",
  medium: "Fort",
  high: "Intense",
}

export function ConcreteProjectionResult({ projection, sectorType }: Props) {
  return (
    <div className="rounded-2xl border-2 border-[#173A2E] bg-gradient-to-br from-[#E8F4EF] to-[#F0F8F5] p-6 shadow-lg">
      <div className="rounded-xl bg-white/75 p-4 shadow-sm">
        <p className="text-sm font-medium leading-relaxed text-[#173A2E]">{projection.problemStatement}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-[#CCD3C9] bg-white/70 p-5">
        <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Potentiel recuperable</p>
        <p className="mt-2 font-serif text-5xl text-[#173A2E] sm:text-6xl">+{projection.revenueImpact}EUR</p>
        <p className="mt-2 text-sm text-[#556159]">ordre de grandeur sur {projection.timeframe}</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white/55 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Volume recupere</p>
          <p className="mt-2 font-serif text-3xl text-[#173A2E]">{projection.volumeRecovered}</p>
          <p className="mt-1 text-xs text-[#556159]">{projection.concreteMetric}</p>
        </div>

        <div className="rounded-xl bg-white/55 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Effet domino</p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${intensityColors[projection.dominoIntensity]}`} />
            <p className="font-serif text-2xl text-[#173A2E]">{intensityLabels[projection.dominoIntensity]}</p>
          </div>
          <p className="mt-1 text-xs text-[#556159]">plus la carte circule, plus le retour se stabilise</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-[#CCD3C9] bg-white/55 p-4">
        <p className="text-sm leading-relaxed text-[#2A3F35]">
          Avec votre flux actuel, <strong>Cardin peut recuperer {projection.volumeRecovered} {getSectorUnit(sectorType)}</strong> et produire
          <strong> environ {projection.revenueImpact}EUR supplementaires</strong> sur <strong>{projection.timeframe}</strong>.
        </p>
      </div>
    </div>
  )
}

function getSectorUnit(sectorType: "cafe" | "restaurant" | "local" | "creator" | "boutique"): string {
  const units: Record<string, string> = {
    cafe: "passages",
    restaurant: "couverts",
    local: "retours",
    creator: "membres engages",
    boutique: "conversions",
  }
  return units[sectorType] || "passages"
}

export function ConcreteProjectionResultSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border-2 border-gray-300 bg-gradient-to-br from-[#E8F4EF] to-[#F0F8F5] p-6">
      <div className="rounded-xl bg-white/70 p-4">
        <div className="h-4 w-full rounded bg-gray-300" />
        <div className="mt-2 h-4 w-3/4 rounded bg-gray-300" />
      </div>

      <div className="mt-6 rounded-xl bg-white/70 p-5">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="mt-3 h-12 w-40 rounded bg-gray-300" />
        <div className="mt-3 h-3 w-32 rounded bg-gray-200" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-white/55 p-4">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="mt-2 h-8 w-16 rounded bg-gray-300" />
            <div className="mt-2 h-3 w-full rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white/55 p-4">
        <div className="h-4 w-full rounded bg-gray-300" />
        <div className="mt-2 h-4 w-5/6 rounded bg-gray-300" />
      </div>
    </div>
  )
}
