"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"

import type { LandingWorldId } from "@/lib/landing-content"
import { LITE_SCENARIOS_BY_WORLD, type LiteSelections } from "@/lib/parcours-lite-scenarios"

const ease = [0.25, 0.1, 0.25, 1] as const

type Props = {
  worldId: LandingWorldId
  selections: LiteSelections
  onSelectionsChange: (next: LiteSelections) => void
  onNext: () => void
}

function StepHeaderLite({ num, label }: { num: string; label: string }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-2" initial={{ opacity: 0, y: 12 }} transition={{ delay: 0.09, duration: 0.4 }}>
      <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--cardin-label)" }}>
        Etape {num} — {label}
      </span>
    </motion.div>
  )
}

export function StepLiteScenarios({ worldId, selections, onSelectionsChange, onNext }: Props) {
  const scenarios = LITE_SCENARIOS_BY_WORLD[worldId]
  const [openId, setOpenId] = useState<string | null>(scenarios[0]?.id ?? null)

  const complete = useMemo(() => scenarios.every((s) => Boolean(selections[s.id])), [scenarios, selections])

  const pick = (scenarioId: string, rewardId: string) => {
    onSelectionsChange({ ...selections, [scenarioId]: rewardId })
  }

  return (
    <>
      <StepHeaderLite num="03" label="Vos scenarios" />
      <motion.h1
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 font-serif"
        initial={{ opacity: 0, y: 16 }}
        style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "var(--cardin-green-primary)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        Vos scenarios
      </motion.h1>
      <motion.p
        animate={{ opacity: 1 }}
        className="mb-10"
        initial={{ opacity: 0 }}
        style={{ color: "var(--cardin-body)", fontSize: "0.95rem", lineHeight: 1.55, maxWidth: "400px" }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        Pour chaque situation, choisissez le type de recompense que vous souhaitez proposer. Vous pourrez les affiner apres activation.
      </motion.p>

      <div className="mb-8 space-y-3">
        {scenarios.map((sc, i) => {
          const open = openId === sc.id
          const selectedRewardId = selections[sc.id]
          return (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden rounded-2xl transition-colors"
              initial={{ opacity: 0, x: -12 }}
              key={sc.id}
              style={{
                backgroundColor: "var(--cardin-card)",
                border: `1px solid ${open ? "var(--cardin-green-primary)" : "var(--cardin-border)"}`,
              }}
              transition={{ delay: 0.12 + i * 0.06, duration: 0.35, ease }}
            >
              <button
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
                onClick={() => setOpenId(open ? null : sc.id)}
                type="button"
              >
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--cardin-text)" }}>{sc.title}</div>
                  {selectedRewardId && (
                    <div style={{ fontSize: "0.7rem", color: "var(--cardin-label)", marginTop: "0.2rem" }}>
                      {sc.rewards.find((r) => r.id === selectedRewardId)?.label ?? ""}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--cardin-label)" }}>{open ? "−" : "+"}</span>
              </button>
              {open && (
                <div className="border-t px-4 pb-4 pt-2" style={{ borderColor: "var(--cardin-border)" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--cardin-body)", lineHeight: 1.5, marginBottom: "0.75rem" }}>{sc.mechanicOneLiner}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {sc.rewards.map((r) => {
                      const selected = selections[sc.id] === r.id
                      return (
                        <button
                          className="rounded-xl p-3 text-left transition-colors"
                          key={r.id}
                          onClick={() => pick(sc.id, r.id)}
                          style={{
                            backgroundColor: selected ? "rgba(0,61,44,0.06)" : "var(--cardin-bg-cream)",
                            border: `1.5px solid ${selected ? "var(--cardin-green-primary)" : "var(--cardin-border)"}`,
                          }}
                          type="button"
                        >
                          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--cardin-text)" }}>{r.label}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--cardin-label)", marginTop: "0.35rem", lineHeight: 1.4 }}>{r.shortExample}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <p className="mb-6 text-center" style={{ fontSize: "0.75rem", color: "var(--cardin-label)", lineHeight: 1.5 }}>
        Vous pouvez changer ces choix a tout moment apres activation.
      </p>

      <motion.button
        animate={{ opacity: 1 }}
        className="w-full rounded-full py-4 transition-all"
        disabled={!complete}
        initial={{ opacity: 0 }}
        onClick={onNext}
        style={{
          backgroundColor: complete ? "var(--cardin-green-primary)" : "var(--cardin-border)",
          color: "#FAF8F2",
          fontSize: "0.95rem",
          cursor: complete ? "pointer" : "not-allowed",
        }}
        transition={{ delay: 0.35, duration: 0.4 }}
        type="button"
      >
        Voir l&apos;impact
      </motion.button>
    </>
  )
}
