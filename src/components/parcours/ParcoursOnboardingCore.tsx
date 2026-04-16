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
import { formatEuro } from "@/lib/number-format"
import { buildParcoursEngineHref, type ParcoursSummitStyleId } from "@/lib/parcours-contract"
import {
  isLiteSelectionsComplete,
  liteProjectionHintLabel,
  type LiteSelections,
} from "@/lib/parcours-lite-scenarios"
import { buildProjectionCalcLines, getProjectionTraceBundle } from "@/lib/projection-traceability"
import { getVerticalExplainerConfig } from "@/lib/vertical-explainer-config"
import {
  buildEngineLine,
  buildSummaryLine,
  computeEngineMetrics,
  generateNextStep,
  getRewardTypesForWorld,
  ACCESS_OPTIONS,
  DIAMOND_RATE,
  INTENSITE_OPTIONS,
  MOMENT_OPTIONS,
  PROPAGATION_OPTIONS,
  SEASON_REWARDS,
  TRIGGER_OPTIONS,
  type AccessTypeId,
  type MomentId,
  type PropagationTypeId,
  type RewardTypeId,
  type SeasonRewardId,
  type TriggerTypeId,
} from "@/lib/parcours-selection-config"

/**
 * Mapping contract (Figma / Glow → Cardin-native):
 * - world → LandingWorldId (cafe | bar | restaurant | beaute | boutique)
 * - summit → ParcoursSummitStyleId (visible | stronger | discreet)
 * - season → 3 mois (getDemoWorldContent, aligné moteur)
 * - final CTA → /engine?template=…&summit=…&season=…  (via buildParcoursEngineHref)
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

const PHASE_LABELS = ["Mise en place", "Tension", "Décision"] as const

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
  { id: "entry", num: "01", label: "Entrée", cta: "Continuer" },
  { id: "lecture", num: "02", label: "Lecture", cta: "Activer la récupération" },
  { id: "summit", num: "03", label: "Récompense", cta: "Continuer" },
  { id: "mechanics", num: "04", label: "Mécanique", cta: "Voir l'impact sur le revenu" },
  { id: "projection", num: "05", label: "Projection", cta: "Passer à l'activation" },
  { id: "activation", num: "06", label: "Lancement", cta: "Ajuster le système" },
]

const STEPS_LITE: { id: ParcoursStepId; num: string; label: string; cta: string }[] = [
  { id: "entry", num: "01", label: "Entrée", cta: "Continuer" },
  { id: "lecture", num: "02", label: "Lecture", cta: "Activer la récupération" },
  { id: "liteScenarios", num: "03", label: "Scénarios", cta: "Voir l'impact" },
  { id: "projection", num: "04", label: "Projection", cta: "Passer à l'activation" },
  { id: "activation", num: "05", label: "Lancement", cta: "Ajuster le système" },
]

const SUMMITS: SummitOption[] = [
  { id: "visible", label: "Récompense affichée", description: "Le client voit clairement la récompense de saison et comprend ce qu'il peut viser.", metric: "x1.0", metricLabel: "lisibilité standard", multiplier: 1 },
  { id: "stronger", label: "Récompense amplifiée", description: "La promesse est plus forte et plus visible : plus de retour, plus de conversation.", metric: "x1.25", metricLabel: "intensité renforcée", multiplier: 1.25 },
  { id: "discreet", label: "Récompense sélective", description: "La promesse reste plus discrète et réservée aux meilleurs profils.", metric: "x0.85", metricLabel: "rareté protégée", multiplier: 0.85 },
]

const WORLD_DETAILS: Record<LandingWorldId, string> = {
  cafe: "Beaucoup de clients, passages rapides.",
  bar: "Soirée, comptoir, panier plus fort et réseau naturel.",
  restaurant: "Tables, service plus long, panier plus élevé.",
  beaute: "Rendez-vous réguliers, confiance et recommandation.",
  boutique: "Visites plus rares, panier et désir forts.",
}


const ease = [0.25, 0.1, 0.25, 1] as const

/* ─── COUNT-UP HOOK ─── */
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

/* ─── MAIN ─── */
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

  // Étape 3 selections
  const [seasonRewardId, setSeasonRewardId] = useState<SeasonRewardId | null>(null)
  const [rewardType, setRewardType] = useState<RewardTypeId | null>(null)
  const [rewardMoment, setRewardMoment] = useState<MomentId | null>(null)

  // Étape 4 selections
  const [accessType, setAccessType] = useState<AccessTypeId | null>(null)
  const [triggerType, setTriggerType] = useState<TriggerTypeId | null>(null)
  const [propagationType, setPropagationType] = useState<PropagationTypeId | null>(null)

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
      /* ignore — private mode / storage blocked on some mobile browsers */
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
      { signal: ac.signal, cache: "no-store" },
    )
      .then(async (res) => {
        if (!res.ok) {
          console.warn(`[PARCOURS] API returned ${res.status} for world=${worldId}`)
          return null
        }
        return (await res.json()) as { ok?: boolean; projection?: ParcoursProjectionResult; error?: string; message?: string }
      })
      .then((data) => {
        if (data?.ok && data.projection) {
          setServerProjection(data.projection)
        } else if (data && !data.ok) {
          console.warn("[PARCOURS] API returned error:", data.error, data.message)
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("[PARCOURS] Fetch failed:", err.message ?? String(err))
        }
      })
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
    (step.id === "summit" && (!seasonRewardId || !summitId || !rewardType || !rewardMoment)) ||
    (step.id === "mechanics" && (!accessType || !triggerType || !propagationType)) ||
    (step.id === "liteScenarios" && !isLiteSelectionsComplete(worldId, liteSelections))

  return (
    <div className={variant === "standalone" ? "min-h-dvh" : ""} style={{ backgroundColor: "var(--cardin-bg-cream)" }}>
      {/* ─── HEADER ─── */}
      {variant === "standalone" ? (
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 pb-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] md:px-8"
          style={{ backgroundColor: "rgba(250,248,242,0.92)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-3">
            {stepIndex > 0 && !isLive && (
              <button aria-label="Retour" onClick={goPrev} style={{ color: "var(--cardin-label)", fontSize: "0.85rem", padding: "4px 0" }} type="button">
                ←
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
              <p className="mt-1" style={{ fontSize: "0.8rem", color: "var(--cardin-body)" }}>{PHASE_LABELS[phaseIndex]} — Étape {step.num}</p>
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

      {/* ─── PROGRESS BAR ─── */}
      {variant === "standalone" && (
        <motion.div
          className="fixed left-0 z-40 h-[1px]"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 3.25rem)", backgroundColor: "var(--cardin-green-primary)" }}
          animate={{ width: `${((stepIndex + 1) / activeSteps.length) * 100}%` }}
          transition={{ duration: 0.4, ease }}
        />
      )}

      {/* ─── CONTENT ─── */}
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
            <div className={variant === "standalone" ? "mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-12 md:max-w-2xl" : "mx-auto max-w-xl md:max-w-2xl"}>
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
                  moment={rewardMoment}
                  onNext={() => { if (seasonRewardId && summitId && rewardType && rewardMoment) goNext() }}
                  rewardType={rewardType}
                  seasonRewardId={seasonRewardId}
                  selectedId={summitId}
                  setMoment={setRewardMoment}
                  setRewardType={setRewardType}
                  setSeasonRewardId={setSeasonRewardId}
                  setSelectedId={setSummitId}
                  worldId={worldId}
                />
              )}
              {step.id === "mechanics" && (
                <StepMechanics
                  accessType={accessType}
                  moment={rewardMoment}
                  onNext={goNext}
                  propagationType={propagationType}
                  rewardType={rewardType}
                  selectedId={summitId}
                  setAccessType={setAccessType}
                  setPropagationType={setPropagationType}
                  setTriggerType={setTriggerType}
                  triggerType={triggerType}
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
                  accessType={accessType}
                  demo={demo}
                  engineHref={engineHref}
                  isLite={isLite}
                  liteHintLabel={liteHint}
                  moment={rewardMoment}
                  projectionFull={projectionFull}
                  propagationType={propagationType}
                  rewardType={rewardType}
                  seasonMonths={seasonMonths}
                  seasonRewardId={seasonRewardId}
                  summit={summit}
                  summitId={summitId}
                  triggerType={triggerType}
                  variant={variant}
                  worldId={worldId}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── EMBEDDED NAV ─── */}
      {variant === "embedded" && (
        <div className="flex items-center justify-between gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] sm:px-6 lg:px-8">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm transition disabled:opacity-35"
            disabled={stepIndex === 0}
            onClick={goPrev}
            style={{ borderColor: "var(--cardin-border)", color: "var(--cardin-body)" }}
            type="button"
          >
            Précédent
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
   STEP 1 — ENTRY
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
  /** Même cadrage € que la fin du parcours / landing — pas le volume brut moteur × perte. */
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
          Fuite estimée sur la saison ({demo.seasonMonths} mois)
        </div>
        <div className="font-serif" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)", color: "#FAF8F2", lineHeight: 1, letterSpacing: "-0.03em" }}>
          ~{equivVisitsSeason}
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(250,248,242,0.55)", marginTop: "0.35rem", lineHeight: 1.35 }}>
          Équivalent passages non valorisés (à partir du panier indicatif).
        </div>
        <div style={{ fontSize: "0.8rem", color: "rgba(250,248,242,0.6)", marginTop: "0.5rem" }}>
          soit {formatEuro(band.min)} à {formatEuro(band.max)} de revenu non capté
        </div>
        <div style={{ fontSize: "0.65rem", color: "rgba(250,248,242,0.35)", marginTop: "0.25rem" }}>
          ~{equivVisitsMonth}/mois · ~{formatEuro(monthlyStakeMid)}/mois
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
        Activer la récupération
      </motion.button>
    </>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 3 — SUMMIT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/* ─────────────────────────────────────────────────────────────────────────────
   SELECTION CARD ATOM — shared across Étapes 3 & 4
   ───────────────────────────────────────────────────────────────────────────── */

type SelectionCardProps = {
  id: string
  label: string
  sub: string
  selected: boolean
  onSelect: () => void
  delay?: number
  recommended?: boolean
}

function SelectionCard({ id, label, sub, selected, onSelect, delay = 0, recommended = false }: SelectionCardProps) {
  const [hovered, setHovered] = useState(false)

  const bg = selected
    ? "rgba(0,61,44,0.06)"
    : hovered
    ? "var(--cardin-card-alt)"
    : "var(--cardin-card)"

  const border = selected
    ? "1.5px solid var(--cardin-green-primary)"
    : hovered
    ? "1px solid rgba(0,61,44,0.25)"
    : recommended
    ? "1px solid rgba(0,61,44,0.18)"
    : "1px solid var(--cardin-border)"

  return (
    <motion.button
      key={id}
      animate={{ opacity: 1, y: 0 }}
      className="text-left"
      initial={{ opacity: 0, y: 8 }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        border,
        borderRadius: "12px",
        padding: "14px 16px",
        cursor: "pointer",
        transition: "background 150ms ease-out, border-color 150ms ease-out",
        position: "relative",
      }}
      transition={{ delay, duration: 0.3, ease }}
      type="button"
    >
      {recommended && !selected && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "10px",
            fontSize: "0.5rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--cardin-green-primary)",
            opacity: 0.5,
          }}
        >
          ✦
        </div>
      )}
      <div className="flex items-start gap-2.5">
        {/* Diamond indicator — rotated square, border always visible per mockup */}
        <div style={{
          width: "9px", height: "9px", flexShrink: 0, marginTop: "4px",
          transform: "rotate(45deg)",
          border: selected ? "1.5px solid var(--cardin-green-primary)" : "1.5px solid var(--cardin-border)",
          backgroundColor: selected ? "var(--cardin-green-primary)" : "transparent",
          transition: "background-color 150ms ease-out, border-color 150ms ease-out",
        }} />
        <div className="min-w-0">
          <div style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--cardin-text)", lineHeight: 1.3 }}>{label}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--cardin-label)", marginTop: "0.2rem", lineHeight: 1.35 }}>{sub}</div>
        </div>
      </div>
    </motion.button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   BLOCK LABEL — section header above each selection group
   ───────────────────────────────────────────────────────────────────────────── */

function BlockLabel({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.9rem" }}
      transition={{ delay, duration: 0.3 }}
    >
      <div style={{ width: "2px", height: "14px", background: "var(--cardin-green-primary)", flexShrink: 0, opacity: 0.55 }} />
      <p style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--cardin-label-light)", margin: 0 }}>
        {label}
      </p>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SEASON REWARD CARD — grand attractor, top of pyramid
   Slightly taller, green-tinted bg, subtle diamond marker.
   ───────────────────────────────────────────────────────────────────────────── */

type SeasonRewardCardProps = {
  id: SeasonRewardId
  label: string
  sub: string
  selected: boolean
  onSelect: () => void
  delay?: number
}

function SeasonRewardCard({ id, label, sub, selected, onSelect, delay = 0 }: SeasonRewardCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      animate={{ opacity: 1, y: 0 }}
      aria-pressed={selected}
      initial={{ opacity: 0, y: 6 }}
      key={id}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        border: "none",
        background: "none",
        padding: 0,
      }}
      transition={{ delay, duration: 0.3, ease }}
      type="button"
    >
      <div
        style={{
          padding: "14px 16px",          // +4px taller than SelectionCard (10px)
          borderRadius: "10px",
          border: `${selected ? "1.5px" : "1px"} solid ${selected ? "var(--cardin-green-primary)" : "var(--cardin-border)"}`,
          backgroundColor: selected
            ? "rgba(0,61,44,0.06)"        // stronger tint when selected
            : hovered
              ? "rgba(0,61,44,0.035)"
              : "rgba(0,61,44,0.04)",     // persistent green tint (not neutral)
          transition: "border-color 150ms ease-out, background-color 120ms ease-out",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          position: "relative",
        }}
      >
        {/* Diamond indicator — same language as SelectionCard */}
        <div style={{
          width: "9px",
          height: "9px",
          flexShrink: 0,
          marginTop: "5px",
          transform: "rotate(45deg)",
          border: selected ? "1.5px solid var(--cardin-green-primary)" : "1.5px solid var(--cardin-border)",
          backgroundColor: selected ? "var(--cardin-green-primary)" : "transparent",
          transition: "background-color 150ms ease-out, border-color 150ms ease-out",
        }} />

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: "0.88rem",
            fontWeight: 600,
            color: selected ? "var(--cardin-green-primary)" : "var(--cardin-text)",
            lineHeight: 1.3,
            marginBottom: "3px",
            transition: "color 150ms ease-out",
          }}>
            {label}
          </div>
          <div style={{
            fontSize: "0.73rem",
            color: "var(--cardin-label)",
            lineHeight: 1.4,
          }}>
            {sub}
          </div>
        </div>

        {/* Subtle diamond marker — top right */}
        <div style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          fontSize: "0.65rem",
          color: "var(--cardin-summit-gold)",
          opacity: selected ? 0.55 : 0.2,
          transition: "opacity 150ms ease-out",
          lineHeight: 1,
          userSelect: "none",
        }}>
          ◇
        </div>
      </div>
    </motion.button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUMMARY BAR — live sentence that crossfades on every selection change
   ───────────────────────────────────────────────────────────────────────────── */

function SummaryBar({ line, label = "Résumé actif", variant = "dark" }: { line: string; label?: string; variant?: "dark" | "light" }) {
  const [key, setKey] = useState(0)
  const [displayLine, setDisplayLine] = useState(line)
  const prevLineRef = useRef(line)

  useEffect(() => {
    if (line !== prevLineRef.current) {
      prevLineRef.current = line
      setKey((k) => k + 1)
      setDisplayLine(line)
    }
  }, [line])

  const isDark = variant === "dark"

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: isDark ? "var(--cardin-green-primary)" : "rgba(0,61,44,0.07)",
        border: isDark ? "none" : "1px solid rgba(0,61,44,0.1)",
        padding: "14px 18px",
      }}
    >
      <div style={{
        fontSize: "0.56rem", letterSpacing: "0.22em", textTransform: "uppercase" as const,
        color: isDark ? "rgba(255,255,255,0.45)" : "var(--cardin-label-light)",
        marginBottom: "0.5rem",
      }}>
        {label}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          style={{
            fontSize: "0.9rem",
            fontWeight: 400,
            color: isDark ? "#E8E2D6" : "var(--cardin-text)",
            letterSpacing: "0.01em",
            lineHeight: 1.5,
            fontFamily: "Georgia, serif",
          }}
          transition={{ duration: 0.12, ease: "easeOut" }}
        >
          {displayLine}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ENGINE PREVIEW — silent consequence layer (Step 4, below selections)
   ───────────────────────────────────────────────────────────────────────────── */

type EnginePreviewProps = {
  worldId: LandingWorldId
  summitId: ParcoursSummitStyleId | null
  rewardType: RewardTypeId | null
  moment: MomentId | null
  accessType: AccessTypeId | null
  triggerType: TriggerTypeId | null
  propagationType: PropagationTypeId | null
}

function EnginePreview({ worldId, summitId, rewardType, moment, accessType, propagationType }: EnginePreviewProps) {
  const metrics = computeEngineMetrics(worldId, summitId, moment, rewardType, accessType, propagationType)

  const NODE_COUNT = 6 // V1–V5 + Diamond (index 5)
  const SVG_H = 40
  const R = 4    // all regular nodes — plan: r=4, no size variation
  const R_D = 5  // diamond end node — plan: max r=5

  const barColor =
    metrics.pulseColor === "green" ? "var(--cardin-green-primary)"
    : metrics.pulseColor === "gold" ? "var(--cardin-summit-gold)"
    : "rgba(180,60,60,0.55)" // red, opacity per plan

  // Track opacity: 0.08 when nothing selected, 0.15 otherwise
  const trackOpacity = metrics.hasAnySelection ? 0.15 : 0.08

  // Economic hint — names the pulse signal in plain French. Silent when no selection.
  const econLine =
    metrics.pulseColor === "green" ? "retour client stable sur la saison"
    : metrics.pulseColor === "gold" ? "retour client amplifié"
    : metrics.pulseColor === "red" ? "récompense très généreuse — surveillez la marge"
    : ""

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      style={{
        background: "rgba(0,61,44,0.02)", // only structural signal per plan
        padding: "12px 14px 10px",
      }}
      transition={{ delay: 0.55, duration: 0.4, ease }}
    >
      {/* SVG row: progression (~60%) + propagation tree (~32%) */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>

        {/* 1. Progression line */}
        <div style={{ width: "60%", flexShrink: 0 }}>
          <svg height={SVG_H} style={{ overflow: "visible", display: "block", width: "100%" }} viewBox={`0 0 200 ${SVG_H}`}>
            {/* Connector lines */}
            {Array.from({ length: NODE_COUNT - 1 }).map((_, i) => {
              const x1 = (i / (NODE_COUNT - 1)) * 200
              const x2 = ((i + 1) / (NODE_COUNT - 1)) * 200
              const active = metrics.progressionFilled.includes(i) && metrics.progressionFilled.includes(i + 1)
              return (
                <line
                  key={`seg-${i}`}
                  stroke="var(--cardin-green-primary)"
                  strokeOpacity={active ? 0.45 : 0.08}
                  strokeWidth={1}
                  style={{ transition: "stroke-opacity 150ms ease-out" }}
                  x1={x1} x2={x2} y1={SVG_H / 2} y2={SVG_H / 2}
                />
              )
            })}
            {/* Nodes V1–V5 + Diamond */}
            {Array.from({ length: NODE_COUNT }).map((_, i) => {
              const x = (i / (NODE_COUNT - 1)) * 200
              const isDiamond = i === NODE_COUNT - 1

              if (isDiamond) {
                // Plan: circle r=5, gold, opacity 0.2 base → 0.55 when propagation active. No glyph.
                return (
                  <circle
                    key="diamond"
                    cx={x}
                    cy={SVG_H / 2}
                    fill="var(--cardin-summit-gold)"
                    opacity={metrics.diamondGlow ? 0.55 : 0.2}
                    r={R_D}
                    style={{ transition: "opacity 150ms ease-out" }}
                  />
                )
              }

              // Regular node — r=4 always, opacity only differs (plan: no size variation for unfilled)
              const isFilled = metrics.progressionFilled.includes(i)
              return (
                <circle
                  key={`node-${i}`}
                  cx={x}
                  cy={SVG_H / 2}
                  fill={isFilled ? "var(--cardin-green-primary)" : "var(--cardin-border)"}
                  opacity={isFilled ? 0.65 : 0.12}
                  r={R}
                  style={{ transition: "opacity 150ms ease-out, fill 150ms ease-out" }}
                />
              )
            })}
          </svg>
        </div>

        {/* 2. Propagation tree — invisible when individuel/unset */}
        <motion.div
          animate={{ opacity: metrics.showTree ? 1 : 0 }}
          style={{ width: "32%", flexShrink: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <svg height={SVG_H} style={{ overflow: "visible", display: "block", width: "100%" }} viewBox="0 0 80 40">
            {/* Root node */}
            <circle cx={40} cy={8} fill="var(--cardin-green-primary)" opacity={0.35} r={3} />

            {/* Level 1 — 2 children */}
            {[20, 60].map((cx, i) => {
              const branchOp = metrics.branchAmplified ? 0.35 : 0.12
              // Plan: leaf opacity × leafOpacityMod, capped at 0.55, opacity only (no radius change)
              const leafOp = Math.min(0.55, 0.25 * metrics.leafOpacityMod)
              return (
                <g key={`l1-${i}`}>
                  <line
                    opacity={branchOp}
                    stroke="var(--cardin-green-primary)"
                    strokeDasharray="2 3"
                    strokeWidth={1}
                    style={{ transition: "opacity 150ms ease-out" }}
                    x1={40} x2={cx} y1={8} y2={22}
                  />
                  <circle
                    cx={cx} cy={22}
                    fill="var(--cardin-green-primary)"
                    opacity={leafOp}
                    r={3}
                    style={{ transition: "opacity 150ms ease-out" }}
                  />
                </g>
              )
            })}

            {/* Level 2 — groupe only (4 grandchildren) */}
            {metrics.treeDepth === 2 && ([10, 30, 50, 70] as number[]).map((cx, i) => {
              const parentX = i < 2 ? 20 : 60
              const branchOp = metrics.branchAmplified ? 0.25 : 0.08
              const leafOp = Math.min(0.55, 0.18 * metrics.leafOpacityMod)
              return (
                <g key={`l2-${i}`}>
                  <line
                    opacity={branchOp}
                    stroke="var(--cardin-green-primary)"
                    strokeDasharray="2 3"
                    strokeWidth={1}
                    style={{ transition: "opacity 150ms ease-out" }}
                    x1={parentX} x2={cx} y1={22} y2={35}
                  />
                  <circle
                    cx={cx} cy={35}
                    fill="var(--cardin-green-primary)"
                    opacity={leafOp}
                    r={3}
                    style={{ transition: "opacity 150ms ease-out" }}
                  />
                </g>
              )
            })}
          </svg>
        </motion.div>
      </div>

      {/* 3. Economic pulse bar — 2px, full width, no label */}
      <div
        style={{
          position: "relative",
          height: "2px",
          borderRadius: "1px",
          backgroundColor: "var(--cardin-border)",
          opacity: trackOpacity,
          transition: "opacity 150ms ease-out",
        }}
      >
        <motion.div
          animate={{
            width: `${metrics.pulseColor !== "none" ? metrics.pulseWidth * 100 : 0}%`,
            backgroundColor: barColor,
            opacity: metrics.pulseColor === "none" ? 0 : 0.55,
          }}
          initial={{ width: "0%", opacity: 0 }}
          style={{ position: "absolute", top: 0, left: 0, height: "100%", borderRadius: "1px" }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />
      </div>

      {/* Economic hint — one silent line labeling the pulse signal */}
      <motion.p
        animate={{ opacity: econLine ? 0.55 : 0 }}
        initial={{ opacity: 0 }}
        style={{
          marginTop: "8px",
          marginBottom: 0,
          fontSize: "0.66rem",
          letterSpacing: "0.02em",
          color: "var(--cardin-label-light)",
          lineHeight: 1.3,
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {econLine || "\u00A0"}
      </motion.p>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 3 — SUMMIT (rebuilt as instrument panel)
   ───────────────────────────────────────────────────────────────────────────── */

type StepSummitProps = {
  seasonRewardId: SeasonRewardId | null
  setSeasonRewardId: (id: SeasonRewardId) => void
  selectedId: ParcoursSummitStyleId | null
  setSelectedId: (id: ParcoursSummitStyleId) => void
  rewardType: RewardTypeId | null
  setRewardType: (id: RewardTypeId) => void
  moment: MomentId | null
  setMoment: (id: MomentId) => void
  onNext: () => void
  worldId: LandingWorldId
}

function StepSummit({ seasonRewardId, setSeasonRewardId, selectedId, setSelectedId, rewardType, setRewardType, moment, setMoment, onNext, worldId }: StepSummitProps) {
  const rewardTypes = getRewardTypesForWorld(worldId)
  const isComplete = !!seasonRewardId && !!selectedId && !!rewardType && !!moment
  const summaryLine = buildSummaryLine(worldId, rewardType, selectedId, moment)

  const seasonOptions = SEASON_REWARDS[worldId]


  return (
    <>
      <StepHeader num="03" label="Récompense" accent="gold" />

      <motion.h1
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 font-serif"
        initial={{ opacity: 0, y: 16 }}
        style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)", color: "var(--cardin-green-primary)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
        transition={{ delay: 0.1, duration: 0.4, ease }}
      >
        Configurez votre récompense
      </motion.h1>
      <motion.p
        animate={{ opacity: 1 }}
        className="mb-8"
        initial={{ opacity: 0 }}
        style={{ color: "var(--cardin-label)", fontSize: "0.88rem", lineHeight: 1.45 }}
        transition={{ delay: 0.18, duration: 0.35 }}
      >
        Commencez par choisir ce pour quoi vos clients reviendront vraiment.
      </motion.p>

      {/* Block 0 — Récompense de saison (grand attractor, top of pyramid) */}
      <div className="mb-8">
        <BlockLabel label="Récompense de saison" delay={0.2} />
        {/* Diamond rarity line — dynamic per vertical */}
        <motion.p
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          style={{ fontSize: "0.68rem", color: "var(--cardin-label-light)", marginBottom: "0.65rem", letterSpacing: "0.01em" }}
          transition={{ delay: 0.24, duration: 0.3 }}
        >
          {`réservé aux ~${Math.round(DIAMOND_RATE[worldId] * 100)}% de vos meilleurs clients sur la saison`}
        </motion.p>
        <div className="flex flex-col gap-2">
          {seasonOptions.map((opt, i) => (
            <SeasonRewardCard
              key={opt.id}
              delay={0.26 + i * 0.06}
              id={opt.id}
              label={opt.label}
              onSelect={() => setSeasonRewardId(opt.id)}
              selected={seasonRewardId === opt.id}
              sub={opt.sub}
            />
          ))}
        </div>
      </div>

      {/* Block 1 — Type de récompense */}
      <div className="mb-6">
        <BlockLabel label="Type de récompense" delay={0.22} />
        <div className="grid grid-cols-2 gap-2">
          {rewardTypes.map((opt, i) => (
            <SelectionCard
              key={opt.id}
              delay={0.25 + i * 0.05}
              id={opt.id}
              label={opt.label}
              onSelect={() => setRewardType(opt.id)}
              recommended={opt.recommended}
              selected={rewardType === opt.id}
              sub={opt.example}
            />
          ))}
        </div>
      </div>

      {/* Block 2 — Visibilité */}
      <div className="mb-6">
        <BlockLabel label="Visibilité" delay={0.38} />
        <div className="grid grid-cols-3 gap-2">
          {INTENSITE_OPTIONS.map((opt, i) => (
            <SelectionCard
              key={opt.id}
              delay={0.4 + i * 0.05}
              id={opt.id}
              label={opt.label}
              onSelect={() => setSelectedId(opt.id)}
              selected={selectedId === opt.id}
              sub={opt.sub}
            />
          ))}
        </div>
      </div>

      {/* Block 3 — Quand ça se déclenche */}
      <div className="mb-6">
        <BlockLabel label="Quand ça se déclenche" delay={0.5} />
        <div className="grid grid-cols-3 gap-2">
          {MOMENT_OPTIONS.map((opt, i) => (
            <SelectionCard
              key={opt.id}
              delay={0.52 + i * 0.05}
              id={opt.id}
              label={opt.label}
              onSelect={() => setMoment(opt.id)}
              selected={moment === opt.id}
              sub={opt.sub}
            />
          ))}
        </div>
      </div>

      {/* Live summary bar */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
        initial={{ opacity: 0, y: 6 }}
        transition={{ delay: 0.6, duration: 0.35, ease }}
      >
        <SummaryBar label="Résumé actif" line={summaryLine} variant="dark" />
      </motion.div>

      <motion.button
        animate={{
          opacity: 1,
          backgroundColor: isComplete ? "var(--cardin-green-primary)" : "var(--cardin-border)",
        }}
        className="w-full rounded-full py-4"
        disabled={!isComplete}
        initial={{ opacity: 0 }}
        onClick={onNext}
        style={{
          color: "#FAF8F2",
          fontSize: "0.95rem",
          cursor: isComplete ? "pointer" : "not-allowed",
          border: "none",
        }}
        transition={{ opacity: { delay: 0.65, duration: 0.35 }, backgroundColor: { duration: 0.2, ease: "easeOut" } }}
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
  gold: "var(--cardin-summit-gold)",
  goldLight: "rgba(163,135,103,0.1)",
}

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 4 — MECHANICS (rebuilt as instrument panel)
   ───────────────────────────────────────────────────────────────────────────── */

type StepMechanicsProps = {
  accessType: AccessTypeId | null
  setAccessType: (id: AccessTypeId) => void
  triggerType: TriggerTypeId | null
  setTriggerType: (id: TriggerTypeId) => void
  propagationType: PropagationTypeId | null
  setPropagationType: (id: PropagationTypeId) => void
  selectedId: ParcoursSummitStyleId | null
  rewardType: RewardTypeId | null
  moment: MomentId | null
  onNext: () => void
  worldId: LandingWorldId
}

function StepMechanics({
  accessType, setAccessType,
  triggerType, setTriggerType,
  propagationType, setPropagationType,
  selectedId, rewardType, moment,
  onNext,
  worldId,
}: StepMechanicsProps) {
  const isComplete = !!accessType && !!triggerType && !!propagationType
  const summaryLine3 = buildSummaryLine(worldId, rewardType, selectedId, moment)
  const engineLine4 = generateNextStep(moment, accessType, triggerType, propagationType)

  return (
    <>
      <StepHeader num="04" label="Activation" />

      <motion.h1
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 font-serif"
        initial={{ opacity: 0, y: 16 }}
        style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)", color: c.green, letterSpacing: "-0.03em", lineHeight: 1.1 }}
        transition={{ delay: 0.1, duration: 0.4, ease }}
      >
        Comment ça s&apos;active ?
      </motion.h1>
      <motion.p
        animate={{ opacity: 1 }}
        className="mb-8"
        initial={{ opacity: 0 }}
        style={{ color: c.label, fontSize: "0.88rem", lineHeight: 1.45 }}
        transition={{ delay: 0.18, duration: 0.35 }}
      >
        Définissez l&apos;accès, le déclencheur et la portée.
      </motion.p>

      {/* Loop framing — how the system works in one breath */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-7 rounded-2xl px-4 py-3.5"
        initial={{ opacity: 0, y: 8 }}
        style={{
          backgroundColor: "var(--cardin-card-alt)",
          border: "1px solid var(--cardin-border)",
          fontSize: "0.78rem",
          lineHeight: 1.65,
          color: c.body,
        }}
        transition={{ delay: 0.2, duration: 0.35, ease }}
      >
        <p style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: c.labelLight, marginBottom: 6 }}>
          Le système, en clair
        </p>
        <p>
          Le client revient <span style={{ color: c.label }}>→</span> il débloque un avantage.
          <br />
          S&apos;il revient accompagné <span style={{ color: c.label }}>→</span> la personne invitée entre à son tour dans le parcours.
          <br />
          <span style={{ color: c.green }}>→ le lieu récupère du passage et active de nouveaux clients.</span>
        </p>
      </motion.div>

      {/* Block 1 — Qui peut y accéder */}
      <div className="mb-6">
        <BlockLabel label="Qui peut y accéder" delay={0.22} />
        <div className="grid grid-cols-3 gap-2">
          {ACCESS_OPTIONS.map((opt, i) => (
            <SelectionCard
              key={opt.id}
              delay={0.25 + i * 0.05}
              id={opt.id}
              label={opt.label}
              onSelect={() => setAccessType(opt.id)}
              selected={accessType === opt.id}
              sub={opt.sub}
            />
          ))}
        </div>
      </div>

      {/* Block 2 — Déclencheur */}
      <div className="mb-6">
        <BlockLabel label="Déclencheur" delay={0.36} />
        <div className="grid grid-cols-2 gap-2">
          {TRIGGER_OPTIONS.map((opt, i) => (
            <SelectionCard
              key={opt.id}
              delay={0.38 + i * 0.05}
              id={opt.id}
              label={opt.label}
              onSelect={() => setTriggerType(opt.id)}
              selected={triggerType === opt.id}
              sub={opt.sub}
            />
          ))}
        </div>
      </div>

      {/* Block 3 — Propagation */}
      <div className="mb-6">
        <BlockLabel label="Propagation" delay={0.5} />
        <div className="grid grid-cols-3 gap-2">
          {PROPAGATION_OPTIONS.map((opt, i) => (
            <SelectionCard
              key={opt.id}
              delay={0.52 + i * 0.05}
              id={opt.id}
              label={opt.label}
              onSelect={() => setPropagationType(opt.id)}
              selected={propagationType === opt.id}
              sub={opt.sub}
            />
          ))}
        </div>
      </div>

      {/* EnginePreview — silent consequence layer */}
      <div className="mb-4">
        <EnginePreview
          accessType={accessType}
          moment={moment}
          propagationType={propagationType}
          rewardType={rewardType}
          summitId={selectedId}
          triggerType={triggerType}
          worldId={worldId}
        />
      </div>

      {/* Text recap — two bare SummaryBars, no card wrapper */}
      <div className="mb-6 space-y-2">
        <SummaryBar label="Récompense" line={summaryLine3} variant="dark" />
        <SummaryBar label="Ce que le système provoque" line={engineLine4} variant="light" />
      </div>

      <motion.p
        animate={{ opacity: isComplete ? 1 : 0.55 }}
        className="mb-3 text-center"
        initial={{ opacity: 0 }}
        style={{ color: c.body, fontSize: "0.82rem", lineHeight: 1.55 }}
        transition={{ delay: 0.6, duration: 0.35 }}
      >
        Le client gagne une vraie raison de revenir. Vous récupérez un passage réel.
      </motion.p>

      <motion.button
        animate={{
          opacity: 1,
          backgroundColor: isComplete ? c.green : c.border,
        }}
        className="w-full rounded-full py-4"
        disabled={!isComplete}
        initial={{ opacity: 0 }}
        onClick={onNext}
        style={{
          color: "#FAF8F2",
          fontSize: "0.95rem",
          cursor: isComplete ? "pointer" : "not-allowed",
          border: "none",
        }}
        transition={{ opacity: { delay: 0.65, duration: 0.35 }, backgroundColor: { duration: 0.2, ease: "easeOut" } }}
        type="button"
      >
        Voir l&apos;impact sur le revenu
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
      label: "Récupération",
      description: trace.layers.find((t) => t.key === "recovery")?.formulaFr ?? "Clients perdus qui reviennent grâce au parcours",
      value: seasonLayers.recovery,
      color: "var(--cardin-green-primary)",
      barBg: "rgba(0,61,44,0.2)",
      protocolField: "GP_direct" as const,
    },
    {
      key: "frequency" as const,
      label: "Fréquence",
      description:
        worldId === "bar"
          ? `${seasonLayers.activeCardholders} porteurs actifs — uplift de visites et panier (créneaux, invitations, moteur)`
          : `${seasonLayers.activeCardholders} porteurs actifs visitent plus souvent`,
      value: seasonLayers.frequency,
      color: "var(--cardin-green-secondary)",
      barBg: "rgba(10,77,58,0.18)",
      protocolField: "GP_uplift" as const,
    },
    {
      key: "domino" as const,
      label: "Propagation client",
      description:
        worldId === "bar"
          ? `Chaque client peut faire entrer un nouveau client dans le parcours · ~${seasonLayers.dominoNewClients} nouveaux clients (GP_prop)`
          : `Chaque client peut faire entrer un nouveau client dans le parcours · ~${seasonLayers.dominoNewClients} nouveaux clients`,
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
            Bar : chaque bandeau correspond à un <strong>poste brut protocole</strong> (GP_direct, GP_uplift, GP_prop). La fourchette haute « saison » reste alignée marché ; le net modèle intègre récompenses et Diamond.{" "}
            {trace.summitMultiplierNote}
          </>
        ) : isLite ? (
          <>
            Décomposition <strong>brute</strong> (récupération, fréquence) sur {seasonMonths} mois — vue centrée sur ces leviers (sans la couche propagation sur cet écran). Les grands chiffres sont des <strong>montants nets</strong> après récompenses et coûts système.
          </>
        ) : (
          <>
            Décomposition <strong>brute</strong> par levier sur {seasonMonths} mois. Le revenu net (titres) inclut récompenses, Diamond ({formatEuro(projectionFull.diamondCostMonth)}/mois) et frais.
          </>
        )}
      </StepSubtitle>
      <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--cardin-label)" }}>
        Simulation basée sur votre activité. Ajustable selon votre réalité.
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
        Levier · montants bruts saison
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
                    <span style={{ fontSize: "0.55rem", color: "var(--cardin-label-light)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      effet réseau
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
          Revenu supplémentaire sur la saison ({seasonMonths} mois)
        </div>
        <div className="font-serif" style={{ fontSize: "clamp(1.65rem, 5vw, 2.75rem)", color: "#FAF8F2", lineHeight: 1.12, letterSpacing: "-0.03em" }}>
          +{animatedBandMin.toLocaleString("fr-FR")} à +{animatedBandMax.toLocaleString("fr-FR")} €
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(250,248,242,0.55)", marginTop: "0.55rem", lineHeight: 1.45 }}>
          Même fourchette que la section « Par type de commerce » · panier indicatif {LANDING_WORLDS[worldId].basket}
        </div>
      </motion.div>

      {/* Concrete visits framing — trust-first, real-world units */}
      <motion.div
        animate={{ opacity: reveal ? 1 : 0, y: reveal ? 0 : 10 }}
        className="mb-3 rounded-xl p-4"
        initial={{ opacity: 0, y: 10 }}
        style={{ backgroundColor: "var(--cardin-card-alt)", border: "1px solid var(--cardin-border)" }}
        transition={{ duration: 0.4, delay: 0.78 }}
      >
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--cardin-label)", marginBottom: "0.5rem" }}>
          Concrètement sur la saison
        </div>
        <ul style={{ fontSize: "0.88rem", color: "var(--cardin-text)", lineHeight: 1.55, listStyle: "none", padding: 0, margin: 0 }}>
          <li>
            <span style={{ color: "var(--cardin-green-primary)", fontWeight: 600 }}>+ {(projectionFull.monthlyReturns * seasonMonths).toLocaleString("fr-FR")}</span> visites récupérées
          </li>
          {!isLite && seasonLayers.dominoNewClients > 0 ? (
            <li style={{ marginTop: 4 }}>
              <span style={{ color: "var(--cardin-domino-blue)", fontWeight: 600 }}>+ {seasonLayers.dominoNewClients.toLocaleString("fr-FR")}</span> nouveaux clients via invitation
            </li>
          ) : null}
        </ul>
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
          Équivalent mensuel (indicatif)
        </div>
        <div className="font-serif" style={{ fontSize: "1.35rem", color: "var(--cardin-green-primary)", letterSpacing: "-0.02em" }}>
          +{animatedMonthlyLow.toLocaleString("fr-FR")}–{animatedMonthlyHigh.toLocaleString("fr-FR")} €
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--cardin-label)", marginTop: "0.35rem" }}>
          Dérivé de la fourchette saison (÷ {seasonMonths}). Détail moteur : ~{projectionFull.monthlyAverage.toLocaleString("fr-FR")} €/mois net modèle ·{" "}
          {projectionFull.monthlyReturns} retours/mois · payback ~{demo.projectedPaybackDays} j · {demo.confidenceLabel}
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
              value={`${Math.round(marketBand.min / 1000)}–${Math.round(marketBand.max / 1000)} k€`}
            />
          </>
        ) : (
          <>
            <MiniStat color="var(--cardin-domino-blue)" label="Propagation client" value={formatEuro(seasonLayers.domino)} />
            <MiniStat color="var(--cardin-summit-gold)" label="Mode récompense" value={`×${summitMultiplier.toLocaleString("fr-FR")}`} />
            <MiniStat
              color="var(--cardin-green-primary)"
              label="Fourchette saison"
              value={`${Math.round(marketBand.min / 1000)}–${Math.round(marketBand.max / 1000)} k€`}
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
        Passer à l&apos;activation
      </motion.button>
    </>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 6 — ACTIVATION (final)
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
  seasonRewardId,
  rewardType,
  summitId,
  moment,
  accessType,
  triggerType,
  propagationType,
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
  seasonRewardId: SeasonRewardId | null
  rewardType: RewardTypeId | null
  summitId: ParcoursSummitStyleId | null
  moment: MomentId | null
  accessType: AccessTypeId | null
  triggerType: TriggerTypeId | null
  propagationType: PropagationTypeId | null
}) {
  const [phase, setPhase] = useState(0)
  const [captured, setCaptured] = useState(false)
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
  const offerPrice = isLite ? LANDING_PRICING.liteActivationFee : LANDING_PRICING.activationFee
  const offerLabel = isLite ? LANDING_PRICING.liteCompactLabel : LANDING_PRICING.compactLabel

  const launchItems = [
    `${world.label} · ${seasonMonths} mois`,
    isLite ? "Parcours lite cadré pour décision rapide" : `Mode récompense : ${summitLabel}`,
    `${offerLabel}`,
    "QR de validation + carte digitale + tableau marchand",
  ]

  const activation48hItems = [
    "QR comptoir prêt sous 48 h",
    "Tableau marchand actif sous 48 h",
    "Carte digitale active sous 48 h",
    "Récompense visible et calibration initiale en place",
  ]

  const success30dItems = [
    "Premiers passages réellement validés par l'équipe",
    `${projectionFull.monthlyReturns} retours / mois visés si le lieu distribue et valide`,
    "Récompense visible, progression comprise, premiers Diamond identifiables",
    "Lecture revenu / retour lisible sans acquisition supplémentaire",
  ]

  const staffFlowItems = [
    "Ouvrir le panneau marchand ou scanner le QR",
    "Valider le passage réel en quelques secondes",
    "Laisser le moteur mettre à jour progression, tension et droits",
    "Aucune remise libre à saisir côté staff",
  ]

  const trustItems = [
    "Coût borné sur la saison",
    "Validation réelle du passage avant activation",
    "Validation staff obligatoire avant chaque récompense",
    "Pas de discount non contrôlé ni d'ouverture massive",
  ]

  return (
    <>
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
        <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--cardin-green-primary)", fontWeight: 600 }}>Activation prête</span>
      </motion.div>

      <motion.h1
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 16 }}
        className="mb-3 font-serif"
        initial={{ opacity: 0, y: 16 }}
        style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", color: "var(--cardin-green-primary)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
        transition={{ duration: 0.4 }}
      >
        Offre claire. Saison prête.
      </motion.h1>

      <motion.p
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        className="mb-10"
        initial={{ opacity: 0 }}
        style={{ color: "var(--cardin-body)", fontSize: "0.95rem", lineHeight: 1.55, maxWidth: "620px" }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        Vous achetez une première saison de {seasonMonths} mois : QR de validation, carte digitale, tableau marchand, récompense visible et budget borné.
        Paiement aujourd&apos;hui, activation digitale sous 48 h, premiers signaux attendus sous 30 jours si l&apos;équipe distribue et valide les passages.
        {isLite && liteHintLabel ? (
          <span className="mt-3 block rounded-xl p-3" style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)", fontSize: "0.8rem" }}>
            {liteHintLabel}
          </span>
        ) : null}
      </motion.p>

      {/* Hero: season goal (left) + isolated payback box (right) */}
      <motion.div
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 16 }}
        className="mb-6 rounded-2xl p-6 sm:p-7"
        initial={{ opacity: 0, y: 16 }}
        style={{ backgroundColor: "var(--cardin-green-primary)" }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <div style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "rgba(250,248,242,0.45)", marginBottom: "0.65rem" }}>
              Objectif revenu saison ({seasonMonths} mois)
            </div>
            <div className="font-serif" style={{ fontSize: "clamp(1.55rem, 5vw, 2.4rem)", color: "#FAF8F2", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {world.claim}
            </div>
            <div style={{ fontSize: "0.78rem", color: "rgba(250,248,242,0.75)", marginTop: "0.75rem", lineHeight: 1.5 }}>
              {seasonFrame.calibratedSubline}
            </div>
          </div>
          <div
            className="shrink-0 rounded-xl px-4 py-3 text-center sm:text-right"
            style={{ backgroundColor: "rgba(232,226,214,0.1)", border: "1px solid rgba(232,226,214,0.18)", minWidth: "110px" }}
          >
            <div className="font-serif" style={{ fontSize: "1.6rem", lineHeight: 1, color: "#E8E2D6", fontWeight: 600 }}>
              ~{demo.projectedPaybackDays} j
            </div>
            <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", color: "rgba(232,226,214,0.55)", marginTop: "0.35rem", textTransform: "uppercase" as const }}>
              Payback
            </div>
          </div>
        </div>
        <div className="mt-4 border-t pt-3" style={{ borderColor: "rgba(232,226,214,0.14)" }}>
          <p style={{ fontSize: "0.68rem", color: "rgba(232,226,214,0.6)", lineHeight: 1.5 }}>
            Modèle interne : ~{projectionFull.netCardinSeason.toLocaleString("fr-FR")} € net sur la saison · ~{projectionFull.netCardinMonth.toLocaleString("fr-FR")} €/mois · {seasonFrame.floorLabel}
          </p>
        </div>
      </motion.div>

      {/* Timeline strip: Aujourd'hui → 48h → 30j → 3 mois */}
      <ActivationTimelineStrip visible={phase >= 2} />

      <ActivationChecklistRail
        cards={[
          { title: "Ce que vous achetez", icon: `${offerPrice}€`, tone: "promise", items: launchItems, pill: `${offerPrice} € · une saison` },
          { title: "Ce qui s'active sous 48 h", icon: "48h", tone: "immediate", items: activation48hItems },
          { title: "Ce qui doit être vrai sous 30 j", icon: "J30", tone: "thirty", items: success30dItems },
          { title: "Ce que le staff fait en 10 s", icon: "10s", tone: "staff", items: staffFlowItems, pill: "10 secondes · pas plus" },
        ]}
        visible={phase >= 2}
      />

      {/* Stat bar with hierarchy via border-top intensity */}
      <motion.div
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 8 }}
        className={isLite ? "mt-4 grid grid-cols-2 gap-2" : "mt-4 grid grid-cols-3 gap-2"}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="rounded-xl px-3.5 py-3" style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)", borderTop: "2.5px solid var(--cardin-green-primary)" }}>
          <div style={{ fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--cardin-label-light)", marginBottom: 4 }}>Récupération</div>
          <div className="font-serif" style={{ fontSize: "1.25rem", color: "var(--cardin-text)", lineHeight: 1 }}>{formatEuro(seasonLayers.recovery)}</div>
        </div>
        <div className="rounded-xl px-3.5 py-3" style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)", borderTop: "2.5px solid rgba(0,61,44,0.35)" }}>
          <div style={{ fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--cardin-label-light)", marginBottom: 4 }}>Fréquence</div>
          <div className="font-serif" style={{ fontSize: "1.25rem", color: "var(--cardin-text)", lineHeight: 1 }}>{formatEuro(seasonLayers.frequency)}</div>
        </div>
        {!isLite ? (
          <div className="rounded-xl px-3.5 py-3" style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)", borderTop: "2.5px solid rgba(0,61,44,0.14)" }}>
            <div style={{ fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--cardin-label-light)", marginBottom: 4 }}>Propagation</div>
            <div className="font-serif" style={{ fontSize: "1.25rem", color: "var(--cardin-text)", lineHeight: 1 }}>{formatEuro(seasonLayers.domino)}</div>
          </div>
        ) : null}
      </motion.div>

      <div className="mb-8" />

      <motion.div
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        className="mb-8 rounded-2xl border p-5"
        initial={{ opacity: 0 }}
        style={{ backgroundColor: "var(--cardin-card-alt)", borderColor: "rgba(0,61,44,0.14)" }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cardin-label-light)" }}>Confiance</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {trustItems.map((item) => (
            <div className="rounded-xl border px-3 py-3" key={item} style={{ borderColor: "var(--cardin-border)", backgroundColor: "var(--cardin-card)", fontSize: "0.75rem", color: "var(--cardin-body)", lineHeight: 1.5 }}>
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.details
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        className="mb-8"
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
            { label: "Fourchette marché (saison)", value: world.claim },
            { label: "Revenu net saison (modèle)", value: `${projectionFull.netCardinSeason.toLocaleString("fr-FR")} EUR` },
            { label: "Activation", value: `${offerPrice} € · saison ${LANDING_PRICING.seasonLengthMonths} mois` },
          ].map((line) => (
            <div className="flex items-center justify-between" key={line.label}>
              <span style={{ fontSize: "0.75rem", color: "var(--cardin-label)" }}>{line.label}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--cardin-text)", fontWeight: 500 }}>{line.value}</span>
            </div>
          ))}
        </div>
      </motion.details>

      {/* Merchant identity capture (pre-payment). Gates the Stripe CTA until submitted. */}
      <MerchantIdentityCapture
        accessType={accessType}
        captured={captured}
        moment={moment}
        onCaptured={() => setCaptured(true)}
        phase={phase}
        propagationType={propagationType}
        rewardType={rewardType}
        seasonRewardId={seasonRewardId}
        summitId={summitId}
        triggerType={triggerType}
        worldId={worldId}
      />

      <motion.div
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        className="rounded-2xl border p-5"
        initial={{ opacity: 0 }}
        style={{ backgroundColor: "var(--cardin-card)", borderColor: "var(--cardin-border)" }}
        transition={{ duration: 0.4 }}
      >
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cardin-label-light)" }}>Activation</p>
        <h3 className="mt-3 font-serif" style={{ fontSize: "clamp(1.5rem, 4vw, 2.1rem)", color: "var(--cardin-green-primary)", lineHeight: 1.15 }}>
          Un seul chemin pour lancer.
        </h3>
        <p className="mt-3" style={{ fontSize: "0.85rem", color: "var(--cardin-body)", lineHeight: 1.6, maxWidth: "42rem" }}>
          Payer aujourd&apos;hui. Activation digitale sous 48 h. Validation réelle des passages côté staff. Lecture du retour sous 30 jours sans promo ouverte ni discount non contrôlé.
        </p>
        {captured ? (
          <motion.a
            animate={{ opacity: 1, scale: 1 }}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-medium transition hover:brightness-110 sm:w-auto"
            href={STRIPE_PAYMENT_LINK}
            initial={{ opacity: 0, scale: 0.98 }}
            rel="noreferrer"
            style={{ backgroundColor: "var(--cardin-green-primary)", color: "#FAF8F2", boxShadow: "0 6px 18px rgba(0,61,44,0.18)" }}
            target="_blank"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {`Payer ${formatEuro(offerPrice)} et lancer la saison`}
          </motion.a>
        ) : (
          <div
            aria-disabled
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-medium sm:w-auto"
            style={{
              backgroundColor: "var(--cardin-card-alt)",
              color: "var(--cardin-label)",
              border: "1px dashed var(--cardin-border)",
              cursor: "not-allowed",
            }}
          >
            Précisez votre lieu pour lancer le paiement
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {!captured ? (
            <a
              className="underline underline-offset-2"
              href={STRIPE_PAYMENT_LINK}
              rel="noreferrer"
              style={{ color: "var(--cardin-label)", fontSize: "0.78rem" }}
              target="_blank"
            >
              Déjà convaincu · payer directement
            </a>
          ) : null}
          <Link className="text-[var(--cardin-green-primary)] underline underline-offset-2" href={engineHref}>
            Ajuster avant paiement
          </Link>
          <Link className="text-[var(--cardin-green-primary)] underline underline-offset-2" href="/apres-paiement">
            Voir la suite après paiement
          </Link>
          {variant === "embedded" ? null : (
            <Link className="text-[var(--cardin-green-primary)] underline underline-offset-2" href="/landing#methode">
              Revoir la méthode
            </Link>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ─── Merchant identity capture (pre-payment) ──────────────────────────────────
// Collects business name, city, phone, email. Sends the full parcours recap by
// email and unlocks the Stripe CTA. Designed to feel premium and minimal.

function MerchantIdentityCapture({
  worldId,
  seasonRewardId,
  rewardType,
  summitId,
  moment,
  accessType,
  triggerType,
  propagationType,
  captured,
  onCaptured,
  phase,
}: {
  worldId: LandingWorldId
  seasonRewardId: SeasonRewardId | null
  rewardType: RewardTypeId | null
  summitId: ParcoursSummitStyleId | null
  moment: MomentId | null
  accessType: AccessTypeId | null
  triggerType: TriggerTypeId | null
  propagationType: PropagationTypeId | null
  captured: boolean
  onCaptured: () => void
  phase: number
}) {
  const [businessName, setBusinessName] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [fallbackMailto, setFallbackMailto] = useState<string | null>(null)

  const summaryLine = buildSummaryLine(worldId, rewardType, summitId, moment)
  const nextStepLine = generateNextStep(moment, accessType, triggerType, propagationType)

  const canSubmit = businessName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || status === "sending") return
    setStatus("sending")
    setFallbackMailto(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          city: city.trim(),
          phone: phone.trim(),
          email: email.trim(),
          request: "Configuration Cardin — lieu précisé avant paiement.",
          parcoursSelections: {
            worldId,
            seasonRewardId,
            rewardType,
            intensite: summitId,
            moment,
            accessType,
            triggerType,
            propagationType,
            summaryLine,
            nextStepLine,
          },
        }),
      })
      const data = (await res.json()) as { ok: boolean; fallbackMailto?: string }
      if (data.ok) {
        setStatus("sent")
        onCaptured()
      } else {
        setFallbackMailto(data.fallbackMailto ?? null)
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (captured && status === "sent") {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl px-5 py-4"
        initial={{ opacity: 0, y: 6 }}
        style={{
          backgroundColor: "var(--cardin-green-tint)",
          border: "1px solid rgba(0,61,44,0.16)",
        }}
        transition={{ duration: 0.35 }}
      >
        <p style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cardin-green-primary)" }}>
          Lieu enregistré
        </p>
        <p className="mt-1" style={{ fontSize: "0.85rem", color: "var(--cardin-text)", fontWeight: 500 }}>
          {businessName.trim()}{city.trim() ? ` · ${city.trim()}` : ""}
        </p>
        <p className="mt-1" style={{ fontSize: "0.74rem", color: "var(--cardin-body)", lineHeight: 1.5 }}>
          Votre configuration vient d&apos;être envoyée à {email.trim()}. Le paiement est prêt juste en dessous.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 8 }}
      className="mb-6 rounded-2xl p-5"
      initial={{ opacity: 0, y: 8 }}
      style={{ border: "1px solid var(--cardin-border)", backgroundColor: "var(--cardin-card)" }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <p style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cardin-label-light)" }}>
        Avant de lancer
      </p>
      <h3 className="mt-2 font-serif" style={{ fontSize: "1.35rem", color: "var(--cardin-green-primary)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
        Précisez votre lieu.
      </h3>
      <p className="mt-1.5" style={{ fontSize: "0.8rem", color: "var(--cardin-body)", lineHeight: 1.55 }}>
        Nous envoyons votre configuration par e-mail, puis débloquons le paiement. Rapide, propre, partageable avec votre équipe.
      </p>

      <form className="mt-4 grid gap-2.5" onSubmit={handleSubmit}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <input
            aria-label="Nom du lieu"
            className="rounded-full border px-4 py-2.5 text-sm"
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Nom du lieu"
            required
            style={{ borderColor: "var(--cardin-border)", backgroundColor: "var(--cardin-card-alt)" }}
            type="text"
            value={businessName}
          />
          <input
            aria-label="Ville"
            className="rounded-full border px-4 py-2.5 text-sm"
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ville"
            style={{ borderColor: "var(--cardin-border)", backgroundColor: "var(--cardin-card-alt)" }}
            type="text"
            value={city}
          />
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <input
            aria-label="Téléphone"
            className="rounded-full border px-4 py-2.5 text-sm"
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Téléphone (facultatif)"
            style={{ borderColor: "var(--cardin-border)", backgroundColor: "var(--cardin-card-alt)" }}
            type="tel"
            value={phone}
          />
          <input
            aria-label="E-mail"
            className="rounded-full border px-4 py-2.5 text-sm"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@votre-lieu.fr"
            required
            style={{ borderColor: "var(--cardin-border)", backgroundColor: "var(--cardin-card-alt)" }}
            type="email"
            value={email}
          />
        </div>
        <button
          className="mt-1 h-11 rounded-full px-5 text-sm font-medium transition hover:brightness-110 disabled:opacity-40"
          disabled={status === "sending" || !canSubmit}
          style={{
            backgroundColor: "var(--cardin-green-primary)",
            color: "#FAF8F2",
            boxShadow: canSubmit ? "0 6px 18px rgba(0,61,44,0.18)" : "none",
          }}
          type="submit"
        >
          {status === "sending" ? "Envoi…" : "Envoyer et préparer le paiement"}
        </button>
      </form>

      {status === "error" && (
        <p className="mt-3" style={{ fontSize: "0.8rem", color: "var(--cardin-body)" }}>
          Envoi impossible.{" "}
          {fallbackMailto ? (
            <a className="underline" href={fallbackMailto}>
              Envoyer par votre messagerie
            </a>
          ) : (
            <button className="underline" onClick={() => setStatus("idle")} type="button">
              Réessayer
            </button>
          )}
        </p>
      )}
    </motion.div>
  )
}

type ActivationTone = "promise" | "immediate" | "thirty" | "staff"

type ActivationCard = {
  title: string
  icon: string
  tone: ActivationTone
  items: string[]
  pill?: string
}

const ACTIVATION_TONE_STYLES: Record<ActivationTone, {
  bg: string
  border: string
  headBg: string
  iconBg: string
  iconColor: string
  hlColor: string
  textColor: string
  diamondColor: string
  pillBg?: string
  pillColor?: string
  pillBorder?: string
}> = {
  promise: {
    bg: "var(--cardin-card)",
    border: "var(--cardin-border)",
    headBg: "rgba(0,61,44,0.08)",
    iconBg: "var(--cardin-green-primary)",
    iconColor: "#E8E2D6",
    hlColor: "var(--cardin-green-primary)",
    textColor: "var(--cardin-text)",
    diamondColor: "rgba(0,61,44,0.3)",
    pillBg: "var(--cardin-green-primary)",
    pillColor: "#E8E2D6",
  },
  immediate: {
    bg: "var(--cardin-card)",
    border: "var(--cardin-border)",
    headBg: "rgba(0,61,44,0.04)",
    iconBg: "rgba(0,61,44,0.12)",
    iconColor: "var(--cardin-green-primary)",
    hlColor: "var(--cardin-label)",
    textColor: "var(--cardin-text)",
    diamondColor: "rgba(0,61,44,0.24)",
  },
  thirty: {
    bg: "var(--cardin-card)",
    border: "var(--cardin-border)",
    headBg: "rgba(0,61,44,0.03)",
    iconBg: "rgba(0,61,44,0.08)",
    iconColor: "var(--cardin-green-primary)",
    hlColor: "var(--cardin-label)",
    textColor: "var(--cardin-text)",
    diamondColor: "rgba(0,61,44,0.2)",
  },
  staff: {
    bg: "var(--cardin-green-primary)",
    border: "transparent",
    headBg: "rgba(255,255,255,0.05)",
    iconBg: "rgba(232,226,214,0.14)",
    iconColor: "#E8E2D6",
    hlColor: "rgba(232,226,214,0.5)",
    textColor: "#E8E2D6",
    diamondColor: "rgba(232,226,214,0.4)",
    pillBg: "rgba(232,226,214,0.1)",
    pillColor: "rgba(232,226,214,0.75)",
    pillBorder: "1px solid rgba(232,226,214,0.22)",
  },
}

function Diamond({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="shrink-0"
      style={{
        width: 6,
        height: 6,
        borderRadius: 1,
        background: color,
        transform: "rotate(45deg)",
        marginTop: 6,
      }}
    />
  )
}

function ActivationChecklistCard({ card }: { card: ActivationCard }) {
  const t = ACTIVATION_TONE_STYLES[card.tone]
  return (
    <motion.div
      className="flex flex-col overflow-hidden rounded-2xl border h-full"
      style={{ backgroundColor: t.bg, borderColor: t.border }}
      whileHover={{ y: -3, boxShadow: "0 10px 28px rgba(0,61,44,0.08)" }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2.5 px-4 py-3" style={{ backgroundColor: t.headBg }}>
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 30, height: 30, flexShrink: 0,
            backgroundColor: t.iconBg,
            color: t.iconColor,
            fontSize: "0.62rem",
            fontWeight: 600,
            letterSpacing: "0.02em",
            fontFamily: "var(--font-sans), -apple-system, sans-serif",
          }}
        >
          {card.icon}
        </div>
        <span style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: t.hlColor, fontWeight: 500 }}>
          {card.title}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-4">
        {card.items.map((item) => (
          <div className="flex items-start gap-2.5" key={item}>
            <Diamond color={t.diamondColor} />
            <span style={{ fontSize: "0.78rem", color: t.textColor, lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
        {card.pill ? (
          <span
            className="mt-2 inline-block rounded-full px-3 py-1"
            style={{
              width: "fit-content",
              fontSize: "0.62rem",
              letterSpacing: "0.06em",
              backgroundColor: t.pillBg,
              color: t.pillColor,
              border: t.pillBorder ?? "none",
            }}
          >
            {card.pill}
          </span>
        ) : null}
      </div>
    </motion.div>
  )
}

function ActivationChecklistRail({
  cards,
  visible,
}: {
  cards: ActivationCard[]
  visible: boolean
}) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const onScroll = () => {
      const slide = Math.round(rail.scrollLeft / Math.max(1, rail.clientWidth * 0.86))
      setActiveIndex(Math.max(0, Math.min(cards.length - 1, slide)))
    }

    rail.addEventListener("scroll", onScroll, { passive: true })
    return () => rail.removeEventListener("scroll", onScroll)
  }, [cards.length])

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Mobile: horizontal snap rail */}
      <div className="md:hidden">
        <div
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2"
          ref={railRef}
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {cards.map((card, i) => (
            <div className="shrink-0 snap-center" key={card.title} style={{ width: "86%" }}>
              <motion.div
                animate={{ scale: activeIndex === i ? 1 : 0.975, opacity: activeIndex === i ? 1 : 0.78 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <ActivationChecklistCard card={card} />
              </motion.div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {cards.map((card, i) => (
            <motion.span
              animate={{ width: activeIndex === i ? 18 : 6, opacity: activeIndex === i ? 1 : 0.45 }}
              className="block h-1.5 rounded-full"
              key={card.title}
              style={{ backgroundColor: "var(--cardin-green-primary)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          ))}
        </div>
      </div>

      {/* Desktop / tablet: 2×2 grid */}
      <div className="hidden gap-2.5 md:grid md:grid-cols-2">
        {cards.map((card) => (
          <ActivationChecklistCard card={card} key={card.title} />
        ))}
      </div>
    </motion.div>
  )
}

function ActivationTimelineStrip({ visible }: { visible: boolean }) {
  const steps = [
    { time: "Aujourd'hui", label: "Paiement" },
    { time: "48 h", label: "Activation" },
    { time: "30 jours", label: "Premiers retours" },
    { time: "3 mois", label: "Revenu lisible" },
  ]

  const toneBg = ["rgba(0,61,44,0.06)", "rgba(0,61,44,0.1)", "rgba(0,61,44,0.16)", "var(--cardin-green-primary)"]

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
      className="mb-5 flex overflow-hidden rounded-2xl border"
      initial={{ opacity: 0, y: 6 }}
      style={{ borderColor: "var(--cardin-border)" }}
      transition={{ duration: 0.4, delay: 0.08 }}
    >
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const isDark = i === 3
        return (
          <div
            className="relative flex-1 px-3 py-3"
            key={step.time}
            style={{
              backgroundColor: toneBg[i],
              borderRight: isLast ? "none" : "1px solid rgba(0,61,44,0.08)",
            }}
          >
            <p
              style={{
                fontSize: "0.66rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: isDark ? "rgba(232,226,214,0.65)" : "var(--cardin-text)",
                marginBottom: 4,
                fontFamily: "var(--font-sans), -apple-system, sans-serif",
              }}
            >
              {step.time}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                lineHeight: 1.3,
                color: isDark ? "#E8E2D6" : "var(--cardin-text)",
              }}
            >
              {step.label}
            </p>
            {!isLast ? (
              <span
                aria-hidden
                className="absolute"
                style={{
                  right: -6, top: "50%", transform: "translateY(-50%)",
                  fontSize: "0.9rem",
                  color: "rgba(0,61,44,0.25)",
                  zIndex: 1,
                  fontFamily: "var(--font-serif), Georgia, serif",
                }}
              >
                ›
              </span>
            ) : null}
          </div>
        )
      })}
    </motion.div>
  )
}
function StepHeader({ num, label, accent }: { num: string; label: string; accent?: "gold" }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-2" initial={{ opacity: 0, y: 12 }} transition={{ delay: 0.09, duration: 0.4 }}>
      <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: accent === "gold" ? "var(--cardin-summit-gold)" : "var(--cardin-label)" }}>
        Étape {num} — {label}
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





