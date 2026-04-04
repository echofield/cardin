"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { ScenarioCard } from "@/components/landing/ScenarioCard"
import { trackEvent } from "@/lib/analytics"
import { formatEuro } from "@/lib/calculator"
import { cn } from "@/lib/utils"
import {
  getProjectionBundle,
  isMerchantProjectionType,
  type Proposition,
} from "@/lib/projection-scenarios"
import {
  formatRetentionLine,
  formatSimulationRhythm,
  getMockBaseMetrics,
  resolveSimulationMode,
  SIM_COMMUNITY_MULTIPLIER,
  SIM_CREATOR_MULTIPLIER,
  simulateScenario,
} from "@/lib/simulation"
import { buttonVariants } from "@/ui/button"

export function ProjectionView() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type")
  const valid = isMerchantProjectionType(typeParam)

  const bundle = useMemo(() => (valid ? getProjectionBundle(typeParam) : null), [typeParam, valid])

  const [active, setActive] = useState<Proposition | null>(null)
  const [community, setCommunity] = useState(false)
  const [creator, setCreator] = useState(false)

  useEffect(() => {
    setActive(null)
  }, [typeParam])

  const current = active ?? bundle?.featured ?? null
  const options = bundle?.options ?? []

  const communityMult = community ? SIM_COMMUNITY_MULTIPLIER : 1
  const creatorMult = creator ? SIM_CREATOR_MULTIPLIER : 1

  const simulation = useMemo(() => {
    if (!valid || !typeParam || !current) return null
    const mode = resolveSimulationMode("recursive", communityMult, creatorMult)
    return simulateScenario({
      merchantType: typeParam,
      scenarioType: current.id,
      mode,
      baseMetrics: getMockBaseMetrics(typeParam),
      community_multiplier: communityMult,
      creator_multiplier: creatorMult,
    })
  }, [valid, typeParam, current, communityMult, creatorMult])

  if (!valid || !bundle || !current || !simulation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F5F0] px-6">
        <p className="font-serif text-2xl text-[#15372B]">Aucun résultat pour ce lien.</p>
        <Link className="mt-6 text-sm text-[#173A2E] underline underline-offset-4" href="/landing">
          Retour
        </Link>
      </div>
    )
  }

  const selectProposition = (p: Proposition) => {
    setActive(p)
    trackEvent("hero_cta", { source: "projection_proposition", propositionId: p.id })
  }

  const selectFeatured = () => {
    setActive(null)
  }

  return (
    <main className="min-h-screen bg-[#F6F5F0] pb-24 pt-16 text-[#152F25] sm:pb-20 sm:pt-24">
      <div className="mx-auto max-w-xl px-5 sm:px-6">
        <h1 className="text-center font-serif text-3xl leading-snug text-[#15372B] sm:text-4xl">Voici ce que Cardin mettrait en place</h1>

        <div className="mt-12 rounded-3xl border border-[#D4D9D0] bg-[#FDFCF8] px-6 py-10 text-center shadow-[0_24px_60px_-40px_rgba(23,58,46,0.35)] sm:px-10">
          <p className="font-serif text-2xl text-[#15372B] sm:text-3xl">{current.title}</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-[#5C655E]">{current.description}</p>

          <div className="mx-auto mt-8 max-w-sm space-y-3 border-t border-[#E8ECE6] pt-6 text-left">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-[#2A3F35]">
              <input
                checked={community}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C8D1C7] text-[#173A2E] focus:ring-[#173A2E]"
                onChange={(e) => setCommunity(e.target.checked)}
                type="checkbox"
              />
              <span>Activer communauté</span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-[#2A3F35]">
              <input
                checked={creator}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C8D1C7] text-[#173A2E] focus:ring-[#173A2E]"
                onChange={(e) => setCreator(e.target.checked)}
                type="checkbox"
              />
              <span>Activer créateur</span>
            </label>
          </div>

          <div className="mx-auto mt-10 max-w-sm space-y-4 border-t border-[#E2E8DE] pt-8">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#7A847B]">Estimation</p>
              <p className="mt-1 font-serif text-3xl text-[#15372B]">+{formatEuro(simulation.revenue_estimate)} / mois</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#7A847B]">Rythme</p>
              <p className="mt-1 text-sm text-[#2A3F35]">{formatSimulationRhythm(simulation.visits_added)}</p>
            </div>
            <p className="text-xs text-[#7A847B]">{formatRetentionLine(simulation.retention_gain)}</p>
          </div>

          {active ? (
            <button
              className="mt-8 text-xs text-[#173A2E] underline underline-offset-4"
              onClick={selectFeatured}
              type="button"
            >
              Revoir la proposition principale
            </button>
          ) : null}
        </div>

        <p className="mt-12 text-center text-xs uppercase tracking-[0.16em] text-[#7A847B]">Autres pistes</p>
        <div className="mt-4 grid gap-3">
          {options.map((opt) => (
            <ScenarioCard
              key={opt.id}
              onSelect={() => selectProposition(opt)}
              proposition={opt}
              selected={active?.id === opt.id}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Link
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full justify-center sm:max-w-md")}
            href="/login"
            onClick={() => trackEvent("hero_cta", { source: "projection_cta" })}
          >
            Mettre en place dans ma boutique
          </Link>
          <Link className="text-sm text-[#5C655E] underline-offset-4 hover:text-[#173A2E] hover:underline" href="/landing">
            Voir plus d&apos;options
          </Link>
        </div>
      </div>
    </main>
  )
}
