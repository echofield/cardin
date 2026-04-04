"use client"

import Link from "next/link"
import { useState } from "react"

import { BoutiqueCalculator } from "@/components/calculator/BoutiqueCalculator"
import { CafeCalculator } from "@/components/calculator/CafeCalculator"
import { ConcreteProjectionResult } from "@/components/calculator/ConcreteProjectionResult"
import { LocalCommerceCalculator } from "@/components/calculator/LocalCommerceCalculator"
import { RestaurantCalculator } from "@/components/calculator/RestaurantCalculator"
import { trackEvent } from "@/lib/analytics"
import type { ConcreteProjection } from "@/types/cardin-core.types"

type SectorType = "cafe" | "restaurant" | "local" | "boutique"

type SectorOption = {
  id: SectorType
  label: string
  eyebrow: string
  description: string
  setupHref: string
  setupNote: string
}

const sectors: SectorOption[] = [
  {
    id: "cafe",
    label: "Cafe",
    eyebrow: "Rythme quotidien",
    description: "Transformez des habitudes deja presentes en retours reguliers.",
    setupHref: "/engine?template=cafe",
    setupNote: "Le setup ouvre directement un template cafe.",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    eyebrow: "Services a remplir",
    description: "Redonnez une raison de revenir entre deux repas ou deux occasions.",
    setupHref: "/engine?template=restaurant",
    setupNote: "Le setup ouvre directement un template restaurant.",
  },
  {
    id: "local",
    label: "Commerce de quartier",
    eyebrow: "Projection large",
    description: "Pour une boutique, une boulangerie, un salon ou un commerce de proximite qui veut se projeter vite.",
    setupHref: "/engine",
    setupNote: "Le setup s'ouvre ensuite sur le choix exact de votre activite.",
  },
  {
    id: "boutique",
    label: "Boutique",
    eyebrow: "Passages a convertir",
    description: "Faites remonter les visites et les achats avec une progression claire.",
    setupHref: "/engine?template=boutique",
    setupNote: "Le setup ouvre directement un template boutique.",
  },
]

export function InlineCalculator() {
  const [selectedSector, setSelectedSector] = useState<SectorType | null>(null)
  const [projection, setProjection] = useState<ConcreteProjection | null>(null)

  const selectedOption = sectors.find((sector) => sector.id === selectedSector) ?? null

  const handleSectorSelect = (sector: SectorType) => {
    setSelectedSector(sector)
    setProjection(null)
    trackEvent("calculator_sector_selected", { sector })
  }

  const handleCalculate = (result: ConcreteProjection) => {
    setProjection(result)
    trackEvent("calculator_result_generated", {
      sector: selectedSector,
      volumeRecovered: result.volumeRecovered,
      revenueImpact: result.revenueImpact,
    })

    window.setTimeout(() => {
      document.getElementById("projection-result")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }, 100)
  }

  return (
    <div className="w-full">
      <div className="rounded-[2rem] border border-[#C6CEC2] bg-[linear-gradient(180deg,#FFFEFB_0%,#F6F6F0_100%)] p-5 shadow-[0_30px_70px_-55px_rgba(23,58,46,0.75)] sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[#5C655E]">Projection Cardin</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[#16372C] sm:text-4xl">Dans quel terrain travaillez-vous ?</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#556159]">
          Choisissez le cas le plus proche de votre realite. Cardin garde ensuite le calcul simple et concret.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sectors.map((sector) => {
            const isActive = selectedSector === sector.id

            return (
              <button
                className={[
                  "rounded-2xl border p-4 text-left transition-all duration-200",
                  isActive
                    ? "border-[#173A2E] bg-[#F1F5EF] shadow-[0_18px_40px_-34px_rgba(23,58,46,0.55)]"
                    : "border-[#D8DBD2] bg-[#FFFDF8] hover:border-[#AEB8AB] hover:shadow-[0_18px_40px_-34px_rgba(23,58,46,0.35)]",
                ].join(" ")}
                key={sector.id}
                onClick={() => handleSectorSelect(sector.id)}
                type="button"
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#637067]">{sector.eyebrow}</p>
                <p className="mt-3 font-serif text-2xl text-[#173A2E]">{sector.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#4F5A53]">{sector.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]",
          selectedSector ? "mt-6 max-h-[2200px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        {selectedSector === "cafe" ? <CafeCalculator onCalculate={handleCalculate} /> : null}
        {selectedSector === "restaurant" ? <RestaurantCalculator onCalculate={handleCalculate} /> : null}
        {selectedSector === "local" ? <LocalCommerceCalculator onCalculate={handleCalculate} /> : null}
        {selectedSector === "boutique" ? <BoutiqueCalculator onCalculate={handleCalculate} /> : null}
      </div>

      {projection && selectedSector ? (
        <div id="projection-result" className="mt-6" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <ConcreteProjectionResult projection={projection} sectorType={selectedSector} />

          <div className="mt-6 rounded-[1.75rem] border border-[#173A2E] bg-[#173A2E] p-6 text-[#FBFAF6] shadow-[0_24px_55px_-35px_rgba(23,58,46,0.7)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.14em] text-[#D5E4DA]">Si ce chiffre vous interesse</p>
                <p className="mt-2 font-serif text-3xl">on ouvre la mise en place avec le bon point de depart</p>
                <p className="mt-2 text-sm text-[#D5E4DA]">
                  119EUR de mise en place, puis 39EUR / mois. Cardin preconfigure ensuite la carte, le QR et le parcours client.
                </p>
              </div>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full border border-white bg-white px-6 text-sm font-medium text-[#173A2E] transition hover:bg-[#F2F5EE]"
                href={selectedOption?.setupHref ?? "/engine"}
                onClick={() =>
                  trackEvent("calculator_cta_clicked", {
                    sector: selectedSector,
                    volumeRecovered: projection.volumeRecovered,
                    revenueImpact: projection.revenueImpact,
                    setupHref: selectedOption?.setupHref ?? "/engine",
                  })
                }
              >
                Configurer cette version
              </Link>
            </div>
            <p className="mt-4 text-xs text-[#D5E4DA]">
              {selectedOption?.setupNote ?? "Configuration guidee. QR, carte wallet et espace marchand prets rapidement."}
            </p>
          </div>
        </div>
      ) : null}

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
