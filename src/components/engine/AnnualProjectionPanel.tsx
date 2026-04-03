import { formatEuro } from "@/lib/calculator"
import { type AnnualProjectionResult } from "@/lib/annual-projection-engine"

type AnnualProjectionPanelProps = {
  annualProjection: AnnualProjectionResult
}

export function AnnualProjectionPanel({ annualProjection }: AnnualProjectionPanelProps) {
  return (
    <div className="rounded-2xl border border-[#CCD3C9] bg-[#F4F7F0] p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Ce qu'une année avec Cardin peut produire</p>
      <p className="mt-2 font-serif text-3xl text-[#173A2E]">
        {formatEuro(annualProjection.annualRevenueMin)} à {formatEuro(annualProjection.annualRevenueMax)} / an
      </p>
      <p className="mt-2 text-sm text-[#556159]">{annualProjection.yearlyRecoveredReturns} retours récupérés estimés sur l'année.</p>

      <div className="mt-4 grid gap-2 grid-cols-3 sm:grid-cols-6 xl:grid-cols-12">
        {annualProjection.monthlyBreakdown.map((month) => (
          <div
            className={[
              "rounded-2xl border px-3 py-3 text-center",
              month.emphasis === "peak" ? "border-[#9FB3A5] bg-[#FEFEFA]" : "border-[#D7DED4] bg-[#F8FAF6]",
            ].join(" ")}
            key={month.label}
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#607067]">{month.label}</p>
            <p className="mt-1 text-sm font-medium text-[#173A2E]">{formatEuro(month.revenue)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 text-sm text-[#203B31]">
        {annualProjection.protectedPeriods.map((period) => (
          <p key={period}>{period}</p>
        ))}
      </div>
      <p className="mt-4 text-xs text-[#556159]">{annualProjection.annualNarrative}</p>
    </div>
  )
}
