"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(target)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start = display
    const diff = target - start
    if (diff === 0) return
    const t0 = performance.now()
    const step = (now: number) => {
      const elapsed = now - t0
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return display
}

export function ProjectionView() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type")
  const valid = isMerchantProjectionType(typeParam)

  const bundle = useMemo(() => (valid ? getProjectionBundle(typeParam) : null), [typeParam, valid])

  const [active, setActive] = useState<Proposition | null>(null)
  const [community, setCommunity] = useState(false)
  const [creator, setCreator] = useState(false)
  const [showHow, setShowHow] = useState(false)

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

  const animLow = useCountUp(simulation?.revenue_low ?? 0)
  const animHigh = useCountUp(simulation?.revenue_high ?? 0)

  const selectProposition = useCallback(
    (p: Proposition) => {
      setActive(p)
      trackEvent("hero_cta", { source: "projection_proposition", propositionId: p.id })
    },
    []
  )

  const selectFeatured = useCallback(() => setActive(null), [])

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

  return (
    <main className="min-h-screen bg-[#F6F5F0] pb-12 pt-10 text-[#152F25] sm:pb-16 sm:pt-16">
      <div className="mx-auto max-w-xl px-5 sm:px-6">
        <h1 className="text-center font-serif text-3xl leading-snug text-[#15372B] sm:text-4xl">
          Voici ce que Cardin mettrait en place
        </h1>

        {/* ── Primary card ── */}
        <div className="mt-10 rounded-3xl border border-[#D4D9D0] bg-[#FDFCF8] px-6 py-9 text-center shadow-[0_24px_60px_-40px_rgba(23,58,46,0.3)] sm:px-10 sm:py-11">
          <p className="font-serif text-2xl text-[#15372B] sm:text-3xl">{current.title}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#5C655E]">{current.description}</p>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-[#8A9389]">
            On concentre le trafic existant sur un point faible.
          </p>

          {/* Toggles */}
          <div className="mx-auto mt-7 max-w-xs space-y-2.5 border-t border-[#E8ECE6] pt-5 text-left">
            <label className="flex cursor-pointer items-center gap-3 text-[13px] text-[#2A3F35]">
              <input
                checked={community}
                className="h-4 w-4 shrink-0 rounded border-[#C8D1C7] text-[#173A2E] focus:ring-[#173A2E]"
                onChange={(e) => setCommunity(e.target.checked)}
                type="checkbox"
              />
              Activer communauté
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-[13px] text-[#2A3F35]">
              <input
                checked={creator}
                className="h-4 w-4 shrink-0 rounded border-[#C8D1C7] text-[#173A2E] focus:ring-[#173A2E]"
                onChange={(e) => setCreator(e.target.checked)}
                type="checkbox"
              />
              Activer créateur
            </label>
          </div>

          {/* Results */}
          <div className="mx-auto mt-8 max-w-sm space-y-3 border-t border-[#E2E8DE] pt-7">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#9AA396]">estimation prudente</p>
            <p className="font-serif text-3xl text-[#15372B] sm:text-[2.1rem]">
              +{formatEuro(animLow)} à +{formatEuro(animHigh)}
              <span className="ml-1 text-lg text-[#7A847B]">/ mois</span>
            </p>
            <p className="text-sm text-[#2A3F35]">{formatSimulationRhythm(simulation.visits_added)}</p>
            <p className="text-xs text-[#8A9389]">{formatRetentionLine(simulation.retention_gain)}</p>
          </div>

          {/* Proof */}
          <div className="mx-auto mt-7 max-w-xs border-t border-[#E8ECE6] pt-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#9AA396]">Basé sur</p>
            <ul className="mt-2 space-y-1 text-xs text-[#7A847B]">
              <li>Commerces similaires à votre activité</li>
              <li>Ticket moyen estimé du secteur</li>
              <li>Fréquence de retour observée</li>
            </ul>
          </div>

          {active ? (
            <button className="mt-6 text-xs text-[#173A2E] underline underline-offset-4" onClick={selectFeatured} type="button">
              Revoir la proposition principale
            </button>
          ) : null}
        </div>

        {/* ── Options ── */}
        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.18em] text-[#9AA396]">Autres pistes</p>
        <div className="mt-3 grid gap-3">
          {options.map((opt) => (
            <ScenarioCard key={opt.id} onSelect={() => selectProposition(opt)} proposition={opt} selected={active?.id === opt.id} />
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full justify-center sm:max-w-md")}
            href="/login"
            onClick={() => trackEvent("hero_cta", { source: "projection_cta" })}
          >
            Mettre en place dans ma boutique
          </Link>
          <Link className="text-[13px] text-[#7A847B] underline-offset-4 hover:text-[#15372B] hover:underline" href="/landing">
            Voir plus d&apos;options
          </Link>
        </div>

        {/* ── How it works ── */}
        <div className="mt-12 text-center">
          <button
            className="text-[13px] font-medium text-[#15372B] underline-offset-4 hover:underline"
            onClick={() => setShowHow((v) => !v)}
            type="button"
          >
            {showHow ? "Masquer" : "Voir comment ça fonctionne"}
          </button>

          {showHow ? (
            <div className="mx-auto mt-5 max-w-md space-y-4 rounded-2xl border border-[#E4E7E0] bg-[#FDFCF8] p-6 text-left text-sm text-[#2A3F35]">
              <p><strong className="text-[#15372B]">1.</strong> Vous choisissez un scénario adapté à votre commerce.</p>
              <p><strong className="text-[#15372B]">2.</strong> Cardin installe une carte visible en boutique — le client la scanne.</p>
              <p><strong className="text-[#15372B]">3.</strong> Le système suit la progression et relance le retour au bon moment.</p>
              <p className="text-xs text-[#8A9389]">Pas d&apos;application à télécharger. Activation en moins de 10 minutes.</p>
            </div>
          ) : null}
        </div>

        {/* ── Footer line ── */}
        <p className="mt-14 text-center text-xs text-[#9AA396]">
          Simulation basée sur vos paramètres. Ajustable en 2 minutes.
        </p>
      </div>
    </main>
  )
}
