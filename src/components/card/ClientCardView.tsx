"use client"

/**
 * Client Card View
 *
 * Customer-facing card that shows:
 * - Venue name (NOT "CardinPass")
 * - Branded status label
 * - Tension line (NOT circles/stamps)
 * - Domino state (always visible)
 * - Optional Grand Diamond hint
 *
 * NO visible mechanics:
 * - NO raw scores
 * - NO percentages
 * - NO component breakdowns
 */

import { useMemo } from "react"
import type { ClientCardView as ClientCardViewType } from "@/types/cardin-core.types"
import { VISUAL_STATE_COLORS } from "@/lib/cardin/status-labels"

type Props = {
  card: ClientCardViewType
}

export function ClientCardView({ card }: Props) {
  const colors = useMemo(() => {
    return VISUAL_STATE_COLORS[card.visualState]
  }, [card.visualState])

  const tensionProgress = card.tensionProgress * 100

  return (
    <div
      className={`
        relative overflow-hidden rounded-[2rem] p-6
        bg-gradient-to-br ${colors.bg}
        shadow-[0_30px_70px_-40px_rgba(0,0,0,0.5)]
        transition-all duration-[250ms]
      `}
      style={{ transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
    >
      {/* Venue name - THE KEY: not "CardinPass" */}
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs uppercase tracking-[0.14em] ${colors.text} opacity-70`}>
            Carte
          </p>
          <h2 className={`mt-1 font-serif text-3xl ${colors.text}`}>
            {card.venueName}
          </h2>
          <p className={`mt-1 text-sm ${colors.text} opacity-80`}>
            {card.customerName}
          </p>
        </div>

        {/* Domino state - ALWAYS visible, never hidden */}
        <div className="flex flex-col items-end">
          {card.dominoActive ? (
            <div className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur">
              <p className={`text-xs font-medium ${colors.accent}`}>
                {card.dominoLabel}
              </p>
            </div>
          ) : (
            <div className="rounded-full bg-white/10 px-3 py-1">
              <p className="text-xs text-white/50">{card.dominoLabel}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status label - the FACE, not the engine */}
      <div className="mt-6">
        <p className={`text-sm ${colors.text} opacity-70`}>Votre statut</p>
        <p className={`mt-1 font-serif text-4xl ${colors.accent}`}>
          {card.statusLabel}
        </p>
      </div>

      {/* Tension line - NOT circles, NOT stamp count */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs">
          <span className={colors.text}>{card.statusLabel}</span>
          {card.tensionLabel !== "Au sommet" && (
            <span className={`${colors.text} opacity-60`}>
              Prochain palier
            </span>
          )}
        </div>

        {/* Tension line */}
        <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className={`h-full transition-all duration-[400ms] ${colors.line}`}
            style={{
              width: `${tensionProgress}%`,
              transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
            }}
          />
        </div>

        <p className={`mt-2 text-xs ${colors.text} opacity-60`}>
          {card.tensionLabel}
        </p>
      </div>

      {/* Grand Diamond hint (if present) */}
      {card.grandDiamondLabel && (
        <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/90 animate-pulse" />
            <p className={`text-sm font-medium ${colors.accent}`}>
              {card.grandDiamondLabel}
            </p>
          </div>
        </div>
      )}

      {/* Last activity label */}
      {card.lastActivityLabel && (
        <div className="mt-4 flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            card.visualState === "dormant" ? "bg-gray-500" :
            card.visualState === "active" ? "bg-[#7FD9B8]" :
            "bg-[#FFD97D]"
          }`} />
          <p className={`text-xs ${colors.text} opacity-70`}>
            {card.lastActivityLabel}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Loading skeleton for card view
 */
export function ClientCardViewSkeleton() {
  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-3 w-16 bg-white/20 rounded" />
          <div className="h-8 w-32 bg-white/30 rounded" />
          <div className="h-4 w-24 bg-white/20 rounded" />
        </div>
        <div className="h-8 w-24 bg-white/20 rounded-full" />
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-3 w-20 bg-white/20 rounded" />
        <div className="h-10 w-40 bg-white/30 rounded" />
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-white/20 rounded" />
          <div className="h-3 w-20 bg-white/20 rounded" />
        </div>
        <div className="h-1 w-full bg-white/20 rounded-full" />
        <div className="h-3 w-24 bg-white/20 rounded" />
      </div>
    </div>
  )
}
