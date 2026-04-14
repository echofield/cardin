"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"

import { ParcoursSeasonTradingChart } from "@/components/parcours/ParcoursSeasonTradingChart"
import { StepLiteScenarios } from "@/components/parcours/StepLiteScenarios"
import { computeParcoursProjectionFull, getDemoWorldContent } from "@/lib/demo-content"
import type { ParcoursProjectionResult } from "@/lib/demo-content"
import {
  LANDING_PRICING,
  LANDING_WORLD_ORDER,
  LANDING_WORLDS,
  STRIPE_PAYMENT_LINK,
  type LandingWorldId,
} from "@/lib/landing-content"
import { SEASON_FRAME_BY_LANDING } from "@/lib/merchant-season-framing"
import { buildParcoursEngineHref, type ParcoursSummitStyleId } from "@/lib/parcours-contract"
import {
  isLiteSelectionsComplete,
  liteProjectionHintLabel,
  type LiteSelections,
} from "@/lib/parcours-lite-scenarios"
import { buildProjectionCalcLines, getProjectionTraceBundle } from "@/lib/projection-traceability"
import { getPrimaryLeverLabel, getProtocolMappingLabel, getVerticalExplainerConfig } from "@/lib/vertical-explainer-config"

/**
 * Mapping contract (Figma / Glow â†’ Cardin-native):
 * - world â†’ LandingWorldId (cafe | bar | restaurant | beaute | boutique)
 * - summit â†’ ParcoursSummitStyleId (visible | stronger | discreet)
 * - season â†’ 3 mois (getDemoWorldContent, alignÃ© moteur)
 * - final CTA â†’ /engine?template=â€¦&summit=â€¦&season=â€¦  (via buildParcoursEngineHref)
 * - (optional later) same payload shape reusable for POST /api/leads
 *
 * Projection: `computeParcoursProjectionFull` + optional `/api/parcours/projection` (SQL `projection_presets` when DB available).
 * No duplicate math engine.
 */

export type ParcoursStepId =
  | "entry"
  | "lecture"
  | "liteScenarios"
  | "summit"
  | "mechanics"
  | "projection"
  | "activation"
export type ParcoursOnboardingVariant = "standalone" | "embedded"

type MechanicId = "return" | "surprise" | "domino" | "diamond" | "season"

type SummitOption = {
  id: ParcoursSummitStyleId
  label: string
  description: string
  metric: string
  metricLabel: string
  multiplier: number
}

const PHASE_LABELS = ["Mise en place", "Tension", "Decision"] as const

function phaseForStep(isLite: boolean, idx: number): number {
  if (isLite) {
    if (idx <= 1) return 0
    if (idx <= 3) return 1
    return 2
  }
  if (idx <= 1) return 0
  if (idx <= 4) return 1
  return 2
}

const STEPS_FULL: { id: ParcoursStepId; num: string; label: string; cta: string }[] = [
  { id: "entry", num: "01", label: "EntrÃ©e", cta: "Continuer" },
  { id: "lecture", num: "02", label: "Lecture", cta: "Activer la rÃ©cupÃ©ration" },
  { id: "summit", num: "03", label: "Récompense", cta: "Continuer" },
  { id: "mechanics", num: "04", label: "MÃ©canique", cta: "Voir l'impact sur le revenu" },
  { id: "projection", num: "05", label: "Projection", cta: "Passer Ã  l'activation" },
  { id: "activation", num: "06", label: "Lancement", cta: "Ajuster le systÃ¨me" },
]

const STEPS_LITE: { id: ParcoursStepId; num: string; label: string; cta: string }[] = [
  { id: "entry", num: "01", label: "EntrÃ©e", cta: "Continuer" },
  { id: "lecture", num: "02", label: "Lecture", cta: "Activer la rÃ©cupÃ©ration" },
  { id: "liteScenarios", num: "03", label: "ScÃ©narios", cta: "Voir l'impact" },
  { id: "projection", num: "04", label: "Projection", cta: "Passer Ã  l'activation" },
  { id: "activation", num: "05", label: "Lancement", cta: "Ajuster le systÃ¨me" },
]

const SUMMITS: SummitOption[] = [
  { id: "visible", label: "Récompense affichée", description: "Le client voit clairement la récompense de saison et comprend ce qu'il peut viser.", metric: "x1.0", metricLabel: "lisibilité standard", multiplier: 1 },
  { id: "stronger", label: "Récompense amplifiée", description: "La promesse est plus forte et plus visible : plus de retour, plus de conversation.", metric: "x1.25", metricLabel: "intensité renforcée", multiplier: 1.25 },
  { id: "discreet", label: "Récompense sélective", description: "La promesse reste plus discrète et réservée aux meilleurs profils.", metric: "x0.85", metricLabel: "rareté protégée", multiplier: 0.85 },
]

const WORLD_DETAILS: Record<LandingWorldId, string> = {
  cafe: "Beaucoup de clients, passages rapides.",
  bar: "SoirÃ©e, comptoir, panier plus fort et rÃ©seau naturel.",
  restaurant: "Tables, service plus long, panier plus Ã©levÃ©.",
  beaute: "Rendez-vous rÃ©guliers, confiance et recommandation.",
  boutique: "Visites plus rares, panier et dÃ©sir forts.",
}

const formatEuro = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

const ease = [0.25, 0.1, 0.25, 1] as const

/* â”€â”€â”€ COUNT-UP HOOK â”€â”€â”€ */
function useCountUp(target: number, duration = 1200, trigger = true) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!trigger) { setValue(0); return }
    const startTime = Date.now()
    let raf: number
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, trigger])
  return value
}

/* â”€â”€â”€ MAIN â”€â”€â”€ */
type Props = { variant: ParcoursOnboardingVariant }

function ParcoursOnboardingCoreInner({ variant }: Props) {
  const searchParams = useSearchParams()
  const isLite = variant === "standalone" && searchParams.get("mode") === "lite"

  const activeSteps = isLite ? STEPS_LITE : STEPS_FULL

  const [worldId, setWorldId] = useState<LandingWorldId>("cafe")
  const [stepIndex, setStepIndex] = useState(0)
  const [summitId, setSummitId] = useState<ParcoursSummitStyleId | null>(null)
  const [openMechanic, setOpenMechanic] = useState<number | null>(0)
  const [liteSelections, setLiteSelections] = useState<LiteSelections>({})
  const skipLitePersistRef = useRef(false)

  useEffect(() => {
    if (!isLite || typeof window === "undefined") return
    skipLitePersistRef.current = true
    try {
      const raw = window.sessionStorage.getItem(`cardin-parcours-lite-${worldId}`)
      if (raw) setLiteSelections(JSON.parse(raw) as LiteSelections)
      else setLiteSelections({})
    } catch {
      setLiteSelections({})
    }
  }, [worldId, isLite])

  useEffect(() => {
    if (!isLite || typeof window === "undefined") return
    if (skipLitePersistRef.current) {
      skipLitePersistRef.current = false
      return
    }
    try {
      window.sessionStorage.setItem(`cardin-parcours-lite-${worldId}`, JSON.stringify(liteSelections))
    } catch {
      /* ignore â€” private mode / storage blocked on some mobile browsers */
    }
  }, [worldId, isLite, liteSelections])

  const demo = getDemoWorldContent(worldId)
  const step = activeSteps[stepIndex]
  const summit = SUMMITS.find((s) => s.id === summitId) ?? SUMMITS[0]
  const seasonMonths = demo.seasonMonths
  const phaseIndex = phaseForStep(isLite, stepIndex)

  const localProjection = useMemo(
    () => computeParcoursProjectionFull(demo, summit.multiplier, undefined, { lite: isLite }),
    [demo, summit.multiplier, isLite],
  )
  const [serverProjection, setServerProjection] = useState<ParcoursProjectionResult | null>(null)
  useEffect(() => {
    setServerProjection(null)
    const ac = new AbortController()
    const liteQ = isLite ? "&lite=1" : ""
    fetch(
      `/api/parcours/projection?world=${encodeURIComponent(worldId)}&summit=${encodeURIComponent(String(summit.multiplier))}${liteQ}`,
      { signal: ac.signal },
    )
      .then((res) => res.json())
      .then((data: { ok?: boolean; projection?: ParcoursProjectionResult }) => {
        if (data.ok && data.projection) setServerProjection(data.projection)
      })
      .catch(() => {})
    return () => ac.abort()
  }, [worldId, summit.multiplier, isLite])
  const projectionFull = serverProjection ?? localProjection

  const liteHint = useMemo(
    () => (isLite ? liteProjectionHintLabel(worldId, liteSelections) : ""),
    [isLite, worldId, liteSelections],
  )

  const engineHref = buildParcoursEngineHref({ worldId, summitStyle: summitId ?? "visible", seasonMonths })

  const goNext = useCallback(() => {
    if (stepIndex === activeSteps.length - 1) {
      if (typeof window !== "undefined") {
        window.location.assign(engineHref)
      }
      return
    }
    setStepIndex((v) => v + 1)
  }, [stepIndex, engineHref, activeSteps.length])

  const goPrev = useCallback(() => setStepIndex((v) => Math.max(0, v - 1)), [])

  const isLive = stepIndex === activeSteps.length - 1

  const embeddedNextDisabled =
    (step.id === "summit" && !summitId) ||
    (step.id === "liteScenarios" && !isLiteSelectionsComplete(worldId, liteSelections))

  return (
    <div className={variant === "standalone" ? "min-h-dvh" : ""} style={{ backgroundColor: "var(--cardin-bg-cream)" }}>
      {/* â”€â”€â”€ HEADER â”€â”€â”€ */}
      {variant === "standalone" ? (
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 pb-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] md:px-8"
          style={{ backgroundColor: "rgba(250,248,242,0.92)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-3">
            {stepIndex > 0 && !isLive && (
              <button aria-label="Retour" onClick={goPrev} style={{ color: "var(--cardin-label)", fontSize: "0.85rem", padding: "4px 0" }} type="button">
                â†
              </button>
            )}
            <Link className="font-serif" href="/landing" style={{ fontSize: "1.05rem", color: "var(--cardin-green-primary)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              Cardin
            </Link>
          </div>

          {!isLive ? (
            <div className="flex items-center gap-1.5">
              {activeSteps.slice(0, -1).map((s, i) => (
                <div className="flex items-center gap-1.5" key={s.id}>
                  <div
                    className="h-1.5 w-1.5 rounded-full transition-all"
                    style={{
                      backgroundColor: i <= stepIndex ? "var(--cardin-green-primary)" : "var(--cardin-border)",
                      transform: i === stepIndex ? "scale(1.5)" : "scale(1)",
                      transitionDuration: "400ms",
                    }}
                  />
                  {i < activeSteps.length - 2 && (
                    <div
                      className="hidden h-px w-3 md:block md:w-5"
                      style={{
                        backgroundColor: i < stepIndex ? "var(--cardin-green-primary)" : "var(--cardin-border)",
                        transitionDuration: "400ms",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--cardin-green-primary)" }} />
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--cardin-green-primary)", fontWeight: 600 }}>Actif</span>
            </div>
          )}
        </header>
      ) : (
        <div className="border-b px-4 py-4 sm:px-6 sm:py-5 lg:px-8" style={{ borderColor: "var(--cardin-border)" }}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--cardin-label-light)" }}>Parcours marchand</p>
              <p className="mt-1" style={{ fontSize: "0.8rem", color: "var(--cardin-body)" }}>{PHASE_LABELS[phaseIndex]} â€” Ã‰tape {step.num}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {activeSteps.map((s, i) => (
                <div className="flex items-center gap-1.5" key={s.id}>
                  <div
                    className="h-1.5 w-1.5 rounded-full transition-all"
                    style={{
                      backgroundColor: i <= stepIndex ? "var(--cardin-green-primary)" : "var(--cardin-border)",
                      transform: i === stepIndex ? "scale(1.5)" : "scale(1)",
                      transitionDuration: "400ms",
                    }}
                  />
                  {i < activeSteps.length - 1 && (
                    <div className="hidden h-px w-3 sm:block" style={{ backgroundColor: i < stepIndex ? "var(--cardin-green-primary)" : "var(--cardin-border)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ PROGRESS BAR â”€â”€â”€ */}
      {variant === "standalone" && (
        <motion.div
          className="fixed left-0 z-40 h-[1px]"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 3.25rem)", backgroundColor: "var(--cardin-green-primary)" }}
          animate={{ width: `${((stepIndex + 1) / activeSteps.length) * 100}%` }}
          transition={{ duration: 0.4, ease }}
        />
      )}

      {/* â”€â”€â”€ CONTENT â”€â”€â”€ */}
      <main className={variant === "standalone" ? "pt-[calc(3.5rem+env(safe-area-inset-top,0px))]" : ""}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            animate={{ opacity: 1, y: 0 }}
            className={
              variant === "standalone"
                ? "flex min-h-[calc(100dvh-5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex-col px-5 md:px-8"
                : "px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
            }
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className={variant === "standalone" ? "mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-12 md:max-w-2xl lg:max-w-3xl" : "mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl"}>
              {step.id === "entry" && (
                <StepEntry
                  onSelectWorld={(w) => { setWorldId(w); setStepIndex(1) }}
                  worldId={worldId}
                />
              )}
              {step.id === "lecture" && (
                <StepLecture
                  demo={demo}
                  onNext={goNext}
                  worldId={worldId}
                />
              )}
              {step.id === "summit" && (
                <StepSummit
                  onNext={() => { if (summitId) goNext() }}
                  selectedId={summitId}
                  setSelectedId={setSummitId}
                  worldId={worldId}
                />
              )}
              {step.id === "mechanics" && (
                <StepMechanics
                  onNext={goNext}
                  openIndex={openMechanic}
                  setOpenIndex={setOpenMechanic}
                  worldId={worldId}
                />
              )}
              {step.id === "liteScenarios" && (
                <StepLiteScenarios
                  onNext={goNext}
                  onSelectionsChange={setLiteSelections}
                  selections={liteSelections}
                  worldId={worldId}
                />
              )}
              {step.id === "projection" && (
                <StepProjection
                  demo={demo}
                  headerNum={step.num}
                  isLite={isLite}
                  liteHintLabel={liteHint}
                  onNext={goNext}
                  projectionFull={projectionFull}
                  seasonMonths={seasonMonths}
                  summitMultiplier={summit.multiplier}
                  worldId={worldId}
                />
              )}
              {step.id === "activation" && (
                <StepActivation
                  demo={demo}
                  engineHref={engineHref}
                  isLite={isLite}
                  liteHintLabel={liteHint}
                  projectionFull={projectionFull}
                  seasonMonths={seasonMonths}
                  summit={summit}
                  variant={variant}
                  worldId={worldId}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* â”€â”€â”€ EMBEDDED NAV â”€â”€â”€ */}
      {variant === "embedded" && (
        <div className="flex items-center justify-between gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] sm:px-6 lg:px-8">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm transition disabled:opacity-35"
            disabled={stepIndex === 0}
            onClick={goPrev}
            style={{ borderColor: "var(--cardin-border)", color: "var(--cardin-body)" }}
            type="button"
          >
            PrÃ©cÃ©dent
          </button>
          <button
            className="inline-flex h-11 items-center rounded-full px-6 text-sm transition disabled:opacity-35"
            disabled={embeddedNextDisabled}
            onClick={goNext}
            style={{ backgroundColor: "var(--cardin-green-primary)", color: "#FAF8F2" }}
            type="button"
          >
            {step.cta}
          </button>
        </div>
      )}
    </div>
  )
}

export function ParcoursOnboardingCore(props: Props) {
  return (
    <Suspense
      fallback={
        <div
          className={props.variant === "standalone" ? "min-h-dvh" : undefined}
          style={{ backgroundColor: "var(--cardin-bg-cream)" }}
        />
      }
    >
      <ParcoursOnboardingCoreInner {...props} />
    </Suspense>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 1 â€” ENTRY
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function StepEntry({ worldId, onSelectWorld }: { worldId: LandingWorldId; onSelectWorld: (w: LandingWorldId) => void }) {
  const explainer = getVerticalExplainerConfig(worldId)

  return (
    <>
      <StepHeader num="01" label="Entrée" />
      <div
        className="mb-6 rounded-2xl border px-5 py-5"
        style={{
          borderColor: "rgba(0,61,44,0.2)",
          background: "linear-gradient(165deg, #F4F1EA 0%, #E8EDE4 100%)",
        }}
      >
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--cardin-green-secondary)" }}>
          Récompense de saison
        </p>
        <p className="mt-3 font-serif" style={{ fontSize: "1.35rem", color: "var(--cardin-green-primary)", lineHeight: 1.2 }}>
          {explainer.seasonReward.examples[0]}
        </p>
        <p className="mt-2" style={{ fontSize: "0.82rem", color: "var(--cardin-body)", lineHeight: 1.55 }}>
          {explainer.merchantExplanationCopy.whatSeasonRewardDoes}
        </p>
        <p className="mt-3" style={{ fontSize: "0.72rem", color: "var(--cardin-label)", lineHeight: 1.55 }}>
          {explainer.merchantExplanationCopy.rewardVsDiamond}
        </p>
      </div>
      <StepTitle>Quel lieu connectez-vous ?</StepTitle>
      <StepSubtitle>Le système adapte la récompense, les rôles et les déclencheurs à votre activité.</StepSubtitle>

      <div className="space-y-3">
        {LANDING_WORLD_ORDER.map((id, i) => (
          <motion.button
            key={id}
            animate={{ opacity: 1, x: 0 }}
            className="flex w-full items-center gap-5 rounded-2xl p-5 text-left transition-colors"
            initial={{ opacity: 0, x: -12 }}
            onClick={() => onSelectWorld(id)}
            style={{ backgroundColor: "var(--cardin-card)", border: `1px solid ${id === worldId ? "var(--cardin-green-primary)" : "var(--cardin-border)"}` }}
            transition={{ delay: 0.2 + i * 0.09, duration: 0.4 }}
            type="button"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--cardin-bg-cream)" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--cardin-green-primary)", letterSpacing: "0.06em" }}>
                {LANDING_WORLDS[id].label.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--cardin-text)" }}>{LANDING_WORLDS[id].label}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--cardin-label)", marginTop: "0.1rem" }}>{WORLD_DETAILS[id]}</div>
            </div>
            <svg fill="none" height="16" stroke="var(--cardin-label)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16"><polyline points="9 18 15 12 9 6" /></svg>
          </motion.button>
        ))}
      </div>
    </>
  )
}

function StepLecture({ demo, worldId, onNext }: { demo: ReturnType<typeof getDemoWorldContent>; worldId: LandingWorldId; onNext: () => void }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 1400)
    const t3 = setTimeout(() => setPhase(3), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const band = LANDING_WORLDS[worldId].seasonRevenueBandEuro
  /** MÃªme cadrage â‚¬ que la fin du parcours / landing â€” pas le volume brut moteur Ã— perte. */
  const stakeMidSeason = Math.round((band.min + band.max) / 2)
  const monthlyStakeMid = Math.round(stakeMidSeason / demo.seasonMonths)
  const equivVisitsMonth = Math.max(1, Math.round(monthlyStakeMid / Math.max(0.01, demo.avgTicket)))
  const equivVisitsSeason = equivVisitsMonth * demo.seasonMonths

  return (
    <>
      <StepHeader num="02" label="Lecture" />
      <StepTitle>Ce que le lieu perd aujourd&apos;hui.</StepTitle>

      <motion.div
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 16 }}
        className="mb-4 mt-8 rounded-2xl p-6"
        initial={{ opacity: 0, y: 16 }}
        style={{ backgroundColor: "var(--cardin-green-primary)" }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(250,248,242,0.5)", marginBottom: "0.5rem" }}>
          Fuite estimÃ©e sur la saison ({demo.seasonMonths} mois)
        </div>
        <div className="font-serif" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)", color: "#FAF8F2", lineHeight: 1, letterSpacing: "-0.03em" }}>
          ~{equivVisitsSeason}
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(250,248,242,0.55)", marginTop: "0.35rem", lineHeight: 1.35 }}>
          Ã‰quivalent passages non valorisÃ©s (Ã  partir du panier indicatif).
        </div>
        <div style={{ fontSize: "0.8rem", color: "rgba(250,248,242,0.6)", marginTop: "0.5rem" }}>
          soit {formatEuro(band.min)} Ã  {formatEuro(band.max)} de revenu non captÃ©
        </div>
        <div style={{ fontSize: "0.65rem", color: "rgba(250,248,242,0.35)", marginTop: "0.25rem" }}>
          ~{equivVisitsMonth}/mois Â· ~{formatEuro(monthlyStakeMid)}/mois
        </div>
      </motion.div>

      <div className="mb-12 grid grid-cols-2 gap-3">
        <motion.div
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 12 }}
          className="rounded-xl p-4"
          initial={{ opacity: 0, y: 12 }}
          style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)" }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--cardin-label)", marginBottom: "0.25rem" }}>Perte mensuelle</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--cardin-green-primary)" }}>{demo.inactivePercent}%</div>
        </motion.div>
        <motion.div
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 12 }}
          className="rounded-xl p-4"
          initial={{ opacity: 0, y: 12 }}
          style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)" }}
          transition={{ duration: 0.4, delay: 0.09 }}
        >
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--cardin-label)", marginBottom: "0.25rem" }}>Panier moyen</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--cardin-summit-gold)" }}>{formatEuro(demo.avgTicket)}</div>
        </motion.div>
      </div>

      <motion.button
        animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 8 }}
        className="w-full rounded-full py-4"
        initial={{ opacity: 0, y: 8 }}
        onClick={onNext}
        style={{ backgroundColor: "var(--cardin-green-primary)", color: "#FAF8F2", fontSize: "0.95rem" }}
        transition={{ duration: 0.4 }}
        type="button"
      >
        Activer la rÃ©cupÃ©ration
      </motion.button>
    </>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 3 â€” SUMMIT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function StepSummit({ selectedId, setSelectedId, onNext, worldId }: { selectedId: ParcoursSummitStyleId | null; setSelectedId: (id: ParcoursSummitStyleId) => void; onNext: () => void; worldId: LandingWorldId }) {
  const world = LANDING_WORLDS[worldId]
  const explainer = getVerticalExplainerConfig(worldId)
  const summitModes: ParcoursSummitStyleId[] = ["visible", "stronger", "discreet"]

  return (
    <>
      <StepHeader num="03" label="Récompense" accent="gold" />
      <StepTitle>La récompense de saison attire. Diamond filtre l'accès.</StepTitle>
      <StepSubtitle>{explainer.merchantExplanationCopy.rewardVsDiamond}</StepSubtitle>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--cardin-card)", borderColor: "var(--cardin-border)" }}>
          <p style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cardin-label-light)" }}>Récompense de saison</p>
          <h3 className="mt-2 font-serif text-2xl" style={{ color: "var(--cardin-green-primary)" }}>{explainer.seasonReward.title}</h3>
          <p className="mt-3" style={{ fontSize: "0.8rem", color: "var(--cardin-body)", lineHeight: 1.6 }}>{explainer.seasonReward.summary}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {explainer.seasonReward.examples.map((example) => (
              <div className="rounded-xl border px-3 py-3" key={example} style={{ borderColor: "var(--cardin-border)", backgroundColor: "var(--cardin-card-alt)", fontSize: "0.72rem", color: "var(--cardin-body)", lineHeight: 1.5 }}>
                {example}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--cardin-card)", borderColor: "var(--cardin-border)" }}>
          <p style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cardin-label-light)" }}>{explainer.merchantFacingTopLayerLabel}</p>
          <h3 className="mt-2 font-serif text-2xl" style={{ color: "var(--cardin-green-primary)" }}>{explainer.diamondMeaning.title}</h3>
          <p className="mt-3" style={{ fontSize: "0.8rem", color: "var(--cardin-body)", lineHeight: 1.6 }}>{explainer.diamondMeaning.summary}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {explainer.diamondMeaning.concreteExamples.map((example) => (
              <div className="rounded-xl border px-3 py-3" key={example} style={{ borderColor: "var(--cardin-border)", backgroundColor: "var(--cardin-card-alt)", fontSize: "0.72rem", color: "var(--cardin-body)", lineHeight: 1.5 }}>
                {example}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-3 rounded-2xl border p-4" style={{ borderColor: "var(--cardin-border)", backgroundColor: "var(--cardin-card)" }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cardin-label-light)" }}>Lecture merchant</p>
        <p className="mt-2" style={{ fontSize: "0.75rem", color: "var(--cardin-body)", lineHeight: 1.6 }}>
          {explainer.seasonReward.merchantFraming} Pour votre {world.label.toLowerCase()}, {explainer.merchantExplanationCopy.whatDiamondMeans.toLowerCase()}
        </p>
      </div>

      <div className="mb-10 space-y-3">
        {summitModes.map((modeId, i) => {
          const mode = explainer.summitModes[modeId]
          const isActive = selectedId === mode.id
          return (
            <motion.button
              key={mode.id}
              animate={{ opacity: 1, x: 0 }}
              className="w-full rounded-2xl p-5 text-left transition-all"
              initial={{ opacity: 0, x: -12 }}
              onClick={() => setSelectedId(mode.id)}
              style={{
                backgroundColor: isActive ? "var(--cardin-summit-gold-light)" : "var(--cardin-card)",
                border: "1.5px solid " + (isActive ? "var(--cardin-summit-gold)" : "var(--cardin-border)"),
              }}
              transition={{ delay: 0.2 + i * 0.09, duration: 0.4 }}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: isActive ? "var(--cardin-summit-gold)" : "var(--cardin-border)" }} />
                    <span style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cardin-label-light)" }}>{mode.badge}</span>
                  </div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--cardin-text)" }}>{mode.title}</p>
                  <p className="mt-2" style={{ fontSize: "0.78rem", color: "var(--cardin-body)", lineHeight: 1.55 }}>{mode.summary}</p>
                  <p className="mt-3" style={{ fontSize: "0.72rem", color: "var(--cardin-label)", lineHeight: 1.5 }}>{mode.merchantMeaning}</p>
                </div>
                <div className="shrink-0 rounded-full border px-3 py-1.5" style={{ borderColor: "var(--cardin-border)", backgroundColor: "var(--cardin-card-alt)", fontSize: "0.68rem", color: "var(--cardin-green-primary)" }}>
                  {mode.engineEffect}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {mode.protocolMapping.map((mapping) => (
                  <span className="rounded-full border px-2.5 py-1" key={mapping} style={{ borderColor: "var(--cardin-border)", fontSize: "0.62rem", color: "var(--cardin-label)" }}>
                    {getProtocolMappingLabel(mapping)}
                  </span>
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.button
        animate={{ opacity: 1 }}
        className="w-full rounded-full py-4 transition-all"
        disabled={!selectedId}
        initial={{ opacity: 0 }}
        onClick={onNext}
        style={{
          backgroundColor: selectedId ? "var(--cardin-green-primary)" : "var(--cardin-border)",
          color: "#FAF8F2",
          fontSize: "0.95rem",
          cursor: selectedId ? "pointer" : "not-allowed",
        }}
        transition={{ delay: 0.5, duration: 0.4 }}
        type="button"
      >
        Continuer
      </motion.button>
    </>
  )
}

const c = {
  green: "var(--cardin-green-primary)",
  text: "var(--cardin-text)",
  body: "var(--cardin-body)",
  label: "var(--cardin-label)",
  labelLight: "var(--cardin-label-light)",
  border: "var(--cardin-border)",
  card: "var(--cardin-card)",
  cardAlt: "var(--cardin-card-alt)",
  cream: "var(--cardin-bg-cream)",
  blue: "var(--cardin-domino-blue)",
  blueLight: "rgba(128,164,214,0.12)",
  blueBorder: "rgba(128,164,214,0.25)",
  blueDim: "rgba(128,164,214,0.4)",
  gold: "var(--cardin-summit-gold)",
  goldLight: "rgba(163,135,103,0.1)",
  goldBorder: "rgba(163,135,103,0.25)",
  goldDim: "rgba(163,135,103,0.45)",
}

function StepMechanics({ openIndex, setOpenIndex, onNext, worldId }: { openIndex: number | null; setOpenIndex: (v: number | null) => void; onNext: () => void; worldId: LandingWorldId }) {
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)
  const explainer = getVerticalExplainerConfig(worldId)

  return (
    <>
      <StepHeader num="04" label="Mécanique" />
      <StepTitle>Comment le client avance et revient.</StepTitle>
      <StepSubtitle>{explainer.merchantExplanationCopy.whatMechanicsDo}</StepSubtitle>
      <motion.p animate={{ opacity: 1 }} className="mb-6" initial={{ opacity: 0 }} style={{ color: c.labelLight, fontSize: "0.75rem", lineHeight: 1.6 }} transition={{ delay: 0.2, duration: 0.4 }}>
        {explainer.merchantExplanationCopy.revenueConnection + " " + explainer.merchantExplanationCopy.budgetConstraint}
      </motion.p>

      <div className="mb-6 rounded-2xl border p-4" style={{ borderColor: c.border, backgroundColor: c.card }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: c.labelLight }}>Leviers prioritaires</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {explainer.primaryLevers.map((lever) => (
            <span className="rounded-full border px-3 py-1.5" key={lever} style={{ borderColor: c.border, fontSize: "0.68rem", color: c.body }}>
              {getPrimaryLeverLabel(lever)}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {explainer.mechanics.map((mechanic, i) => {
          const isOpen = openIndex === i
          const accent = mechanic.tone === "blue" ? c.blue : mechanic.tone === "gold" ? c.gold : c.green
          const accentSoft = mechanic.tone === "blue" ? c.blueLight : mechanic.tone === "gold" ? c.goldLight : c.cardAlt
          return (
            <motion.div key={mechanic.id} animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 8 }} transition={{ delay: 0.18 + i * 0.05, duration: 0.35 }}>
              <button
                onClick={() => toggle(i)}
                style={{ width: "100%", textAlign: "left", display: "grid", gridTemplateColumns: "24px 1fr auto", alignItems: "center", gap: 14, padding: "13px 16px", border: "1px solid " + accent, borderRadius: isOpen ? "10px 10px 0 0" : "10px", backgroundColor: isOpen ? accentSoft : c.card, cursor: "pointer" }}
                type="button"
              >
                <span style={{ fontSize: 9, fontFamily: "monospace", textAlign: "right", color: accent }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, color: accent }}>{mechanic.title}</div>
                  <div style={{ fontSize: 10, color: c.label }}>{mechanic.summary}</div>
                </div>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: c.label, transform: isOpen ? "rotate(45deg)" : "none", display: "inline-block", width: 16, textAlign: "center" }}>+</span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} initial={{ height: 0, opacity: 0 }} style={{ overflow: "hidden", border: "1px solid " + accent, borderTop: "none", borderRadius: "0 0 10px 10px", background: c.cream }} transition={{ duration: 0.2, ease }}>
                    <div style={{ padding: "18px 18px 16px" }}>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border px-4 py-4" style={{ borderColor: c.border, backgroundColor: c.card }}>
                          <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: c.labelLight }}>Ce que le client fait</p>
                          <p className="mt-2" style={{ fontSize: 12, color: c.body, lineHeight: 1.6 }}>{mechanic.clientAction}</p>
                        </div>
                        <div className="rounded-xl border px-4 py-4" style={{ borderColor: c.border, backgroundColor: c.card }}>
                          <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: c.labelLight }}>Ce que le système fait</p>
                          <p className="mt-2" style={{ fontSize: 12, color: c.body, lineHeight: 1.6 }}>{mechanic.systemAction}</p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-xl border px-4 py-4" style={{ borderColor: c.border, backgroundColor: c.card }}>
                        <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: c.labelLight }}>Pourquoi le business gagne</p>
                        <p className="mt-2" style={{ fontSize: 12, color: c.body, lineHeight: 1.6 }}>{mechanic.merchantMeaning}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border px-3 py-1.5" style={{ borderColor: c.border, backgroundColor: c.card, fontSize: "0.68rem", color: c.green }}>
                          {mechanic.engineEffect}
                        </span>
                        {mechanic.protocolMapping.map((mapping) => (
                          <span className="rounded-full border px-2.5 py-1" key={mapping} style={{ borderColor: c.border, fontSize: "0.62rem", color: c.label }}>
                            {getProtocolMappingLabel(mapping)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <motion.button animate={{ opacity: 1 }} className="mt-8 w-full rounded-full py-4" initial={{ opacity: 0 }} onClick={onNext} style={{ backgroundColor: c.green, color: "#FAF8F2", fontSize: "0.95rem" }} transition={{ delay: 0.5, duration: 0.4 }} type="button">
        Voir l'impact sur le revenu
      </motion.button>
    </>
  )
}

function StepProjection({
  demo,
  projectionFull,
  seasonMonths,
  summitMultiplier,
  onNext,
  isLite,
  headerNum = "05",
  liteHintLabel = "",
  worldId,
}: {
  demo: ReturnType<typeof getDemoWorldContent>
  projectionFull: ParcoursProjectionResult
  seasonMonths: 3
  summitMultiplier: number
  onNext: () => void
  isLite?: boolean
  headerNum?: string
  liteHintLabel?: string
  worldId: LandingWorldId
}) {
  const [reveal, setReveal] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 600)
    return () => clearTimeout(t)
  }, [])

  const marketBand = LANDING_WORLDS[worldId].seasonRevenueBandEuro
  const monthlyBandLow = Math.round(marketBand.min / seasonMonths)
  const monthlyBandHigh = Math.round(marketBand.max / seasonMonths)

  const seasonLayers = projectionFull.layers
  const animatedBandMin = useCountUp(marketBand.min, 1600, reveal)
  const animatedBandMax = useCountUp(marketBand.max, 1800, reveal)
  const animatedMonthlyLow = useCountUp(monthlyBandLow, 1300, reveal)
  const animatedMonthlyHigh = useCountUp(monthlyBandHigh, 1500, reveal)

  const trace = getProjectionTraceBundle(worldId)
  const calcLines = buildProjectionCalcLines(projectionFull, summitMultiplier, seasonMonths)

  const baseLayers = [
    {
      key: "recovery" as const,
      label: "RÃ©cupÃ©ration",
      description: trace.layers.find((t) => t.key === "recovery")?.formulaFr ?? "Clients perdus qui reviennent grÃ¢ce au parcours",
      value: seasonLayers.recovery,
      color: "var(--cardin-green-primary)",
      barBg: "rgba(0,61,44,0.2)",
      protocolField: "GP_direct" as const,
    },
    {
      key: "frequency" as const,
      label: "FrÃ©quence",
      description:
        worldId === "bar"
          ? `${seasonLayers.activeCardholders} porteurs actifs â€” uplift de visites et panier (crÃ©neaux, invitations, moteur)`
          : `${seasonLayers.activeCardholders} porteurs actifs visitent plus souvent`,
      value: seasonLayers.frequency,
      color: "var(--cardin-green-secondary)",
      barBg: "rgba(10,77,58,0.18)",
      protocolField: "GP_uplift" as const,
    },
    {
      key: "domino" as const,
      label: "Domino",
      description:
        worldId === "bar"
          ? `${seasonLayers.dominoNewClients} nouveaux clients â€” propagation / invitations (GP_prop)`
          : `${seasonLayers.dominoNewClients} nouveaux clients par propagation`,
      value: seasonLayers.domino,
      color: "var(--cardin-domino-blue)",
      barBg: "rgba(128,164,214,0.2)",
      compound: true,
      protocolField: "GP_prop" as const,
    },
  ]

  const layers = isLite ? baseLayers.filter((l) => l.key !== "domino") : baseLayers

  const maxLayer = Math.max(...layers.map((l) => l.value), 1)

  return (
    <>
      <StepHeader num={headerNum} label="Projection" />
      <StepTitle>Impact sur le revenu.</StepTitle>
      <StepSubtitle>
        {worldId === "bar" && !isLite ? (
          <>
            Bar : chaque bandeau correspond Ã  un <strong>poste brut protocole</strong> (GP_direct, GP_uplift, GP_prop). La fourchette haute Â« saison Â» reste alignÃ©e marchÃ© ; le net modÃ¨le intÃ¨gre rÃ©compenses et Diamond.{" "}
            {trace.summitMultiplierNote}
          </>
        ) : isLite ? (
          <>
            DÃ©composition <strong>brute</strong> (rÃ©cupÃ©ration, frÃ©quence) sur {seasonMonths} mois â€” vue centrÃ©e sur ces leviers (sans couche Domino sur cet Ã©cran). Les grands chiffres sont des <strong>montants nets</strong> aprÃ¨s rÃ©compenses et coÃ»ts systÃ¨me.
          </>
        ) : (
          <>
            DÃ©composition <strong>brute</strong> par levier sur {seasonMonths} mois. Le revenu net (titres) inclut rÃ©compenses, Diamond ({formatEuro(projectionFull.diamondCostMonth)}/mois) et frais.
          </>
        )}
      </StepSubtitle>
      <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--cardin-label)" }}>
        Simulation basÃ©e sur votre activitÃ©. Ajustable selon votre rÃ©alitÃ©.
      </p>
      {isLite && liteHintLabel ? (
        <motion.p
          animate={{ opacity: reveal ? 1 : 0 }}
          className="mb-8 rounded-xl p-3"
          initial={{ opacity: 0 }}
          style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)", fontSize: "0.8rem", color: "var(--cardin-body)", lineHeight: 1.5 }}
          transition={{ duration: 0.35 }}
        >
          {liteHintLabel}
        </motion.p>
      ) : null}

      <p className="mb-3" style={{ fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--cardin-label-light)" }}>
        Levier Â· montants bruts saison
      </p>
      {/* Stacked layers (gross) */}
      <div className="mb-4 space-y-2.5">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.key}
            animate={{ opacity: reveal ? 1 : 0, x: reveal ? 0 : -16 }}
            className="rounded-xl p-4"
            initial={{ opacity: 0, x: -16 }}
            style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)" }}
            transition={{ duration: 0.35, delay: 0.15 + i * 0.18, ease }}
          >
            <div className="mb-2.5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: layer.color }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--cardin-text)" }}>
                    {layer.label}
                  </span>
                  {"compound" in layer && layer.compound && (
                    <span style={{ fontSize: "0.55rem", color: "var(--cardin-domino-blue)", letterSpacing: "0.04em" }}>
                      croissant
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--cardin-label)", marginTop: "0.15rem", paddingLeft: "1rem" }}>
                  {layer.description}
                </div>
                {"protocolField" in layer ? (
                  <div style={{ fontSize: "0.58rem", color: "var(--cardin-label-light)", marginTop: "0.2rem", paddingLeft: "1rem", fontFamily: "monospace" }}>
                    Moteur : {layer.protocolField}
                  </div>
                ) : null}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: layer.color, whiteSpace: "nowrap", fontFamily: "monospace" }}>
                +{formatEuro(layer.value)}
              </div>
            </div>
            <div style={{ height: 4, borderRadius: 2, backgroundColor: layer.barBg, overflow: "hidden" }}>
              <motion.div
                animate={{ width: reveal ? `${Math.max(8, Math.round((layer.value / maxLayer) * 100))}%` : "0%" }}
                initial={{ width: "0%" }}
                style={{ height: "100%", borderRadius: 2, backgroundColor: layer.color }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <details className="mb-4 rounded-xl border border-[var(--cardin-border)] bg-[var(--cardin-card)] p-4" style={{ fontSize: "0.75rem", color: "var(--cardin-body)", lineHeight: 1.55 }}>
        <summary className="cursor-pointer select-none font-medium text-[var(--cardin-text)]">Voir le calcul (moteur)</summary>
        <ul className="mt-3 list-inside list-disc space-y-1.5">
          {calcLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-[0.7rem] text-[var(--cardin-label)]">{trace.monthlyEquivalentNote(seasonMonths)}</p>
        {trace.barFeatureNote ? <p className="mt-2 text-[0.7rem] text-[var(--cardin-label)]">{trace.barFeatureNote}</p> : null}
      </details>

      {/* Primary: net season */}
      <motion.div
        animate={{ opacity: reveal ? 1 : 0, y: reveal ? 0 : 16 }}
        className="mb-3 rounded-2xl p-6"
        initial={{ opacity: 0, y: 16 }}
        style={{ backgroundColor: "var(--cardin-green-primary)" }}
        transition={{ duration: 0.4, delay: 0.75 }}
      >
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(250,248,242,0.5)", marginBottom: "0.5rem" }}>
          Revenu supplÃ©mentaire sur la saison ({seasonMonths} mois)
        </div>
        <div className="font-serif" style={{ fontSize: "clamp(1.65rem, 5vw, 2.75rem)", color: "#FAF8F2", lineHeight: 1.12, letterSpacing: "-0.03em" }}>
          +{animatedBandMin.toLocaleString("fr-FR")} Ã  +{animatedBandMax.toLocaleString("fr-FR")} â‚¬
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(250,248,242,0.55)", marginTop: "0.55rem", lineHeight: 1.45 }}>
          MÃªme fourchette que la section Â« Par type de commerce Â» Â· panier indicatif {LANDING_WORLDS[worldId].basket}
        </div>
      </motion.div>

      {/* Secondary: indicative monthly band (from landing range) */}
      <motion.div
        animate={{ opacity: reveal ? 1 : 0, y: reveal ? 0 : 10 }}
        className="mb-3 rounded-xl p-4"
        initial={{ opacity: 0 }}
        style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)" }}
        transition={{ duration: 0.4, delay: 0.82 }}
      >
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--cardin-label)", marginBottom: "0.35rem" }}>
          Ã‰quivalent mensuel (indicatif)
        </div>
        <div className="font-serif" style={{ fontSize: "1.35rem", color: "var(--cardin-green-primary)", letterSpacing: "-0.02em" }}>
          +{animatedMonthlyLow.toLocaleString("fr-FR")}â€“{animatedMonthlyHigh.toLocaleString("fr-FR")} â‚¬
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--cardin-label)", marginTop: "0.35rem" }}>
          DÃ©rivÃ© de la fourchette saison (Ã· {seasonMonths}). DÃ©tail moteur : ~{projectionFull.monthlyAverage.toLocaleString("fr-FR")} â‚¬/mois net modÃ¨le Â·{" "}
          {projectionFull.monthlyReturns} retours/mois Â· payback ~{demo.projectedPaybackDays} j Â· {demo.confidenceLabel}
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: reveal ? 1 : 0 }}
        className="mb-4"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.88 }}
      >
        <ParcoursSeasonTradingChart projection={projectionFull} reveal={reveal} seasonMonths={seasonMonths} />
      </motion.div>

      <motion.div
        animate={{ opacity: reveal ? 1 : 0 }}
        className={isLite ? "mb-10 grid grid-cols-2 gap-3" : "mb-10 grid grid-cols-3 gap-3"}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.95 }}
      >
        {isLite ? (
          <>
            <MiniStat color="var(--cardin-green-secondary)" label="Porteurs" value={`${seasonLayers.activeCardholders}`} />
            <MiniStat
              color="var(--cardin-green-primary)"
              label="Fourchette saison"
              value={`${Math.round(marketBand.min / 1000)}â€“${Math.round(marketBand.max / 1000)} kâ‚¬`}
            />
          </>
        ) : (
          <>
            <MiniStat color="var(--cardin-domino-blue)" label="Domino (brut)" value={formatEuro(seasonLayers.domino)} />
            <MiniStat color="var(--cardin-summit-gold)" label="Mode récompense" value={`Ã—${summitMultiplier.toLocaleString("fr-FR")}`} />
            <MiniStat
              color="var(--cardin-green-primary)"
              label="Fourchette saison"
              value={`${Math.round(marketBand.min / 1000)}â€“${Math.round(marketBand.max / 1000)} kâ‚¬`}
            />
          </>
        )}
      </motion.div>

      <motion.button
        animate={{ opacity: reveal ? 1 : 0 }}
        className="w-full rounded-full py-4"
        initial={{ opacity: 0 }}
        onClick={onNext}
        style={{ backgroundColor: "var(--cardin-green-primary)", color: "#FAF8F2", fontSize: "0.95rem" }}
        transition={{ duration: 0.4, delay: 1.0 }}
        type="button"
      >
        Passer Ã  l&apos;activation
      </motion.button>
    </>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 6 â€” ACTIVATION (final)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function StepActivation({
  demo,
  projectionFull,
  seasonMonths,
  summit,
  worldId,
  engineHref,
  variant,
  isLite,
  liteHintLabel = "",
}: {
  demo: ReturnType<typeof getDemoWorldContent>
  projectionFull: ParcoursProjectionResult
  seasonMonths: 3
  summit: SummitOption
  worldId: LandingWorldId
  engineHref: string
  variant: ParcoursOnboardingVariant
  isLite?: boolean
  liteHintLabel?: string
}) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setPhase(3), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const world = LANDING_WORLDS[worldId]
  const seasonFrame = SEASON_FRAME_BY_LANDING[worldId]
  const summitLabel = getVerticalExplainerConfig(worldId).summitModes[summit.id].badge
  const seasonLayers = projectionFull.layers

  return (
    <>
      {/* Status pulse */}
      <motion.div
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        className="mb-8 flex items-center gap-3"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          className="relative h-3 w-3"
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "var(--cardin-green-primary)" }} />
          <motion.div
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "var(--cardin-green-primary)" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.div>
        <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--cardin-green-primary)", fontWeight: 600 }}>SystÃ¨me actif</span>
      </motion.div>

      <motion.h1
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 16 }}
        className="mb-3 font-serif"
        initial={{ opacity: 0, y: 16 }}
        style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", color: "var(--cardin-green-primary)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
        transition={{ duration: 0.4 }}
      >
        La machine est active.
      </motion.h1>

      <motion.p
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        className="mb-10"
        initial={{ opacity: 0 }}
        style={{ color: "var(--cardin-body)", fontSize: "0.95rem", lineHeight: 1.55, maxWidth: "560px" }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        Le systÃ¨me est actif. Les premiers retours peuvent commencer.
        {isLite && liteHintLabel ? (
          <span className="mt-3 block rounded-xl p-3" style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)", fontSize: "0.8rem" }}>
            {liteHintLabel}
          </span>
        ) : null}
      </motion.p>

      {/* Season framing + model indicator */}
      <motion.div
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 16 }}
        className="mb-3 rounded-2xl border px-5 py-5 text-left"
        initial={{ opacity: 0, y: 16 }}
        style={{ backgroundColor: "var(--cardin-card)", borderColor: "var(--cardin-border)" }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--cardin-label)" }}>Objectif de saison</div>
        <p className="mt-3 font-serif" style={{ fontSize: "clamp(1.65rem, 5vw, 2.25rem)", color: "var(--cardin-green-primary)", lineHeight: 1.15 }}>
          {seasonFrame.heroBand}
        </p>
        <p className="mt-3 font-medium" style={{ fontSize: "0.9rem", color: "var(--cardin-text)", lineHeight: 1.45 }}>
          {seasonFrame.calibratedSubline}
        </p>
        <p className="mt-3" style={{ fontSize: "0.78rem", color: "var(--cardin-label)", lineHeight: 1.5 }}>
          {seasonFrame.floorLabel} Â· {seasonFrame.upsideLabel}
        </p>
      </motion.div>

      <motion.div
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 16 }}
        className="mb-2 rounded-2xl p-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        style={{ backgroundColor: "var(--cardin-green-primary)" }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(250,248,242,0.5)", marginBottom: "0.6rem" }}>
          Objectif revenu saison ({seasonMonths} mois)
        </div>
        <div className="font-serif" style={{ fontSize: "clamp(1.35rem, 4.5vw, 2.35rem)", color: "#FAF8F2", lineHeight: 1.15, letterSpacing: "-0.03em" }}>
          {world.claim}
        </div>
        <div style={{ fontSize: "0.7rem", color: "rgba(250,248,242,0.58)", marginTop: "0.65rem", lineHeight: 1.5 }}>
          AlignÃ© avec Â« Par type de commerce Â» sur l&apos;accueil. ModÃ¨le interne (dÃ©mo) : ~{projectionFull.netCardinSeason.toLocaleString("fr-FR")} â‚¬ net sur la saison Â· ~{projectionFull.netCardinMonth.toLocaleString("fr-FR")} â‚¬/mois Â· payback ~{demo.projectedPaybackDays} j
        </div>
      </motion.div>

      {/* Layer breakdown pills */}
      <motion.div
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        className={isLite ? "mb-8 grid grid-cols-2 gap-2" : "mb-8 grid grid-cols-3 gap-2"}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--cardin-green-tint)", border: "1px solid rgba(0,61,44,0.1)" }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--cardin-green-primary)", marginBottom: 2 }}>RÃ©cupÃ©ration</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--cardin-green-primary)" }}>{formatEuro(seasonLayers.recovery)}</div>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--cardin-green-tint)", border: "1px solid rgba(0,61,44,0.1)" }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--cardin-green-secondary)", marginBottom: 2 }}>FrÃ©quence</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--cardin-green-secondary)" }}>{formatEuro(seasonLayers.frequency)}</div>
        </div>
        {!isLite ? (
          <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--cardin-domino-blue-light)", border: "1px solid rgba(128,164,214,0.15)" }}>
            <div style={{ fontSize: "0.5rem", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--cardin-domino-blue)", marginBottom: 2 }}>Domino</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--cardin-domino-blue)" }}>{formatEuro(seasonLayers.domino)}</div>
          </div>
        ) : null}
      </motion.div>

      {/* Config details */}
      <motion.details
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        className="mb-10"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <summary className="flex cursor-pointer select-none items-center gap-2 py-2" style={{ listStyle: "none", fontSize: "0.75rem", color: "var(--cardin-label)" }}>
          <span>Voir la configuration</span>
          <svg fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ marginLeft: "auto" }} viewBox="0 0 24 24" width="12"><polyline points="6 9 12 15 18 9" /></svg>
        </summary>
        <div className="mt-2 space-y-2.5 rounded-xl p-4" style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)" }}>
          {[
            { label: "Lieu", value: world.label },
            { label: "Saison", value: `${seasonMonths} mois` },
            ...(isLite ? [] : [{ label: "Mode récompense", value: summitLabel }]),
            { label: "Porteurs actifs", value: `${seasonLayers.activeCardholders}` },
            { label: "Fourchette marchÃ© (saison)", value: world.claim },
            { label: "Revenu net saison (modÃ¨le)", value: `${projectionFull.netCardinSeason.toLocaleString("fr-FR")} EUR` },
            {
              label: "Activation",
              value: isLite
                ? `${LANDING_PRICING.liteActivationFee} â‚¬ Â· saison ${LANDING_PRICING.seasonLengthMonths} mois`
                : `${LANDING_PRICING.activationFee} â‚¬ Â· saison ${LANDING_PRICING.seasonLengthMonths} mois`,
            },
          ].map((line) => (
            <div className="flex items-center justify-between" key={line.label}>
              <span style={{ fontSize: "0.75rem", color: "var(--cardin-label)" }}>{line.label}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--cardin-text)", fontWeight: 500 }}>{line.value}</span>
            </div>
          ))}
        </div>
      </motion.details>

            <motion.div
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        className="space-y-3"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            className="min-w-[min(100%,14rem)] flex-1 rounded-full py-3.5 text-center text-sm font-medium"
            href={STRIPE_PAYMENT_LINK}
            rel="noreferrer"
            style={{ backgroundColor: "var(--cardin-green-primary)", color: "#FAF8F2" }}
            target="_blank"
          >
            Payer sur Stripe
          </a>
          <Link
            className="min-w-[min(100%,14rem)] flex-1 rounded-full py-3.5 text-center text-sm"
            href={engineHref}
            style={{ border: "1px solid var(--cardin-border)", color: "var(--cardin-text)" }}
          >
            Ajuster le systeme
          </Link>
          <Link
            className="min-w-[min(100%,14rem)] flex-1 rounded-full py-3.5 text-center text-sm"
            href="/demo"
            style={{ border: "1px solid var(--cardin-border)", color: "var(--cardin-text)" }}
          >
            Voir la demo client
          </Link>
        </div>
        <div className="rounded-2xl border border-[var(--cardin-border)] bg-[var(--cardin-card)] px-4 py-3 text-center text-xs leading-relaxed text-[var(--cardin-body)]">
          <p>
            Paiement dans un nouvel onglet, puis retour sur{" "}
            <Link className="font-medium text-[var(--cardin-green-primary)] underline underline-offset-2" href="/apres-paiement">
              apres le paiement
            </Link>
            . Si vous n&apos;etes pas pret, vous pouvez encore affiner la configuration dans le moteur.
          </p>
        </div>
      </motion.div>
    </>
  )
}

/* â”€â”€â”€ SHARED ATOMS â”€â”€â”€ */
function StepHeader({ num, label, accent }: { num: string; label: string; accent?: "gold" }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-2" initial={{ opacity: 0, y: 12 }} transition={{ delay: 0.09, duration: 0.4 }}>
      <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: accent === "gold" ? "var(--cardin-summit-gold)" : "var(--cardin-label)" }}>
        Ã‰tape {num} â€” {label}
      </span>
    </motion.div>
  )
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h1
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 font-serif"
      initial={{ opacity: 0, y: 16 }}
      style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "var(--cardin-green-primary)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
      transition={{ delay: 0.15, duration: 0.4 }}
    >
      {children}
    </motion.h1>
  )
}

function StepSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      animate={{ opacity: 1 }}
      className="mb-12"
      initial={{ opacity: 0 }}
      style={{ color: "var(--cardin-body)", fontSize: "0.95rem", lineHeight: 1.55, maxWidth: "560px" }}
      transition={{ delay: 0.25, duration: 0.4 }}
    >
      {children}
    </motion.p>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)" }}>
      <div style={{ fontSize: "0.55rem", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--cardin-label)", marginBottom: "0.15rem" }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 600, color }}>{value}</div>
    </div>
  )
}





