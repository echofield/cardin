"use client"

/**
 * Merchant Strategy Panel
 *
 * Merchant sees strategy, not configuration
 * Chooses WHAT to amplify, Cardin decides HOW
 *
 * Shows:
 * - Strategy selector (4 modes)
 * - Client distribution (dormant/active/ascending)
 * - Strategic insights (near diamond, active dominos, weak day potential)
 *
 * Does NOT show:
 * - Weight percentages
 * - Average scores
 * - Manual threshold sliders
 * - Technical configuration
 */

import { useState } from "react"
import type { MerchantStrategyView, MerchantStrategyMode } from "@/types/cardin-core.types"
import { getStrategyModeDescription } from "@/lib/cardin/merchant-strategy-profiles"

type Props = {
  merchantId: string
  merchantName: string
  strategyView: MerchantStrategyView
  onStrategyChange: (mode: MerchantStrategyMode) => Promise<void>
}

const STRATEGY_MODES: MerchantStrategyMode[] = ["frequency", "social", "weak_time", "value"]

export function MerchantStrategyPanel({
  merchantId,
  merchantName,
  strategyView,
  onStrategyChange,
}: Props) {
  const [isChanging, setIsChanging] = useState(false)
  const [selectedMode, setSelectedMode] = useState(strategyView.currentMode)

  const handleModeChange = async (mode: MerchantStrategyMode) => {
    if (isChanging || mode === selectedMode) return

    setIsChanging(true)
    setSelectedMode(mode)

    try {
      await onStrategyChange(mode)
    } catch (error) {
      console.error("Failed to change strategy:", error)
      // Revert on error
      setSelectedMode(strategyView.currentMode)
    } finally {
      setIsChanging(false)
    }
  }

  const modeActivatedDaysAgo = Math.floor(
    (Date.now() - new Date(strategyView.modeActivatedAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#173A2E]">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">
            Vision stratégique
          </p>
          <h1 className="mt-2 font-serif text-5xl">{merchantName}</h1>
          <p className="mt-2 text-sm text-[#556159]">
            {strategyView.totalClients} client{strategyView.totalClients !== 1 ? "s" : ""} actif
            {strategyView.totalClients !== 1 ? "s" : ""}
          </p>
        </header>

        {/* THE KEY: Strategy selector - not configuration */}
        <div className="rounded-2xl border-2 border-[#173A2E] bg-white p-6">
          <p className="text-lg font-medium text-[#173A2E]">
            Quel comportement voulez-vous renforcer ?
          </p>
          <p className="mt-1 text-sm text-[#556159]">
            Cardin calcule automatiquement les profils en fonction de votre choix.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STRATEGY_MODES.map((mode) => {
              const { label, description } = getStrategyModeDescription(mode)
              const isActive = mode === selectedMode
              const isCurrentActive = mode === strategyView.currentMode

              return (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  disabled={isChanging}
                  className={`
                    rounded-xl border p-4 text-left transition-all
                    ${
                      isActive
                        ? "border-[#173A2E] bg-[#E8F4EF] shadow-sm"
                        : "border-[#D5DBD1] bg-white hover:border-[#A0ADA5]"
                    }
                    ${isChanging ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <p
                    className={`font-medium ${
                      isActive ? "text-[#173A2E]" : "text-[#2A3F35]"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="mt-1 text-xs text-[#556159]">{description}</p>

                  {isCurrentActive && (
                    <div className="mt-3">
                      <span className="inline-flex items-center rounded-full bg-[#173A2E] px-2.5 py-1 text-xs text-white">
                        Actif depuis {modeActivatedDaysAgo} jour
                        {modeActivatedDaysAgo !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Strategic distribution - NOT analytics */}
        <div className="rounded-2xl border border-[#D5DBD1] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">
            Distribution stratégique
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {strategyView.distribution.map((bucket) => {
              const labelMap = {
                dormant: "Dormants",
                active: "Actifs",
                ascending: "Ascendants",
              }

              const colorMap = {
                dormant: "bg-[#8A8A8A]",
                active: "bg-[#7FD9B8]",
                ascending: "bg-[#FFD97D]",
              }

              return (
                <div
                  key={bucket.label}
                  className="rounded-xl border border-[#E5E5E5] bg-[#FFFEFA] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${colorMap[bucket.label]}`} />
                    <span className="text-sm font-medium text-[#2A3F35]">
                      {labelMap[bucket.label]}
                    </span>
                  </div>
                  <p className="mt-3 font-serif text-3xl text-[#173A2E]">{bucket.count}</p>
                  <p className="mt-1 text-xs text-[#5E6961]">
                    {bucket.percentage.toFixed(0)}% de vos clients
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Strategic insights */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Near Diamond */}
          <div className="rounded-xl border border-[#D5DBD1] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">
              Proches Diamond
            </p>
            <p className="mt-2 font-serif text-4xl text-[#173A2E]">
              {strategyView.nearDiamondCount}
            </p>
            <p className="mt-1 text-xs text-[#556159]">
              Clients proches d'un statut fort
            </p>
          </div>

          {/* Active Dominos */}
          <div className="rounded-xl border border-[#D5DBD1] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">
              Dominos actifs
            </p>
            <p className="mt-2 font-serif text-4xl text-[#173A2E]">
              {strategyView.activeDominosCount}
            </p>
            <p className="mt-1 text-xs text-[#556159]">
              Clients avec effet multiplicateur
            </p>
          </div>

          {/* Weak Day Recovery */}
          <div className="rounded-xl border border-[#D5DBD1] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">
              Récupération potentielle
            </p>
            <p className="mt-2 font-serif text-4xl text-[#173A2E]">
              {strategyView.weakDayRecoveryPotential}
            </p>
            <p className="mt-1 text-xs text-[#556159]">
              Visites récupérables (jours faibles)
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

/**
 * Loading skeleton for merchant strategy panel
 */
export function MerchantStrategyPanelSkeleton() {
  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-300 rounded" />
          <div className="h-12 w-64 bg-gray-400 rounded" />
          <div className="h-4 w-40 bg-gray-300 rounded" />
        </div>

        <div className="rounded-2xl border-2 border-gray-300 bg-white p-6">
          <div className="h-6 w-80 bg-gray-400 rounded" />
          <div className="mt-1 h-4 w-full bg-gray-300 rounded" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-300 bg-white p-6">
          <div className="h-3 w-40 bg-gray-300 rounded" />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
