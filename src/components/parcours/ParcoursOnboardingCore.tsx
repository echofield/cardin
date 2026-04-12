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
  type LandingWorldId,
} from "@/lib/landing-content"
import { SEASON_FRAME_BY_LANDING } from "@/lib/merchant-season-framing"
import { buildParcoursEngineHref, type ParcoursSummitStyleId } from "@/lib/parcours-contract"
import {
  isLiteSelectionsComplete,
  liteProjectionHintLabel,
  type LiteSelections,
} from "@/lib/parcours-lite-scenarios"

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
  { id: "entry", num: "01", label: "Entrée", cta: "Continuer" },
  { id: "lecture", num: "02", label: "Lecture", cta: "Activer la récupération" },
  { id: "summit", num: "03", label: "Sommet", cta: "Continuer" },
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
  { id: "visible", label: "Sommet visible", description: "Le client voit sa progression et sait ce qu'il débloque. Objectif clair.", metric: "x1.0", metricLabel: "boost standard", multiplier: 1 },
  { id: "stronger", label: "Sommet renforcé", description: "Récompense amplifiée. Crée de l'attraction et de la conversation autour du lieu.", metric: "x1.25", metricLabel: "boost augmenté", multiplier: 1.25 },
  { id: "discreet", label: "Sommet discret", description: "Réservé aux initiés. Effet de surprise à l'arrivée. Pas de promesse affichée.", metric: "x0.85", metricLabel: "boost sélectif", multiplier: 0.85 },
]

const WORLD_DETAILS: Record<LandingWorldId, string> = {
  cafe: "Beaucoup de clients, passages rapides.",
  bar: "Soirée, comptoir, panier plus fort et réseau naturel.",
  restaurant: "Tables, service plus long, panier plus élevé.",
  beaute: "Rendez-vous réguliers, confiance et recommandation.",
  boutique: "Visites plus rares, panier et désir forts.",
}

const formatEuro = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

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
              <p className="mt-1" style={{ fontSize: "0.8rem", color: "var(--cardin-body)" }}>{PHASE_LABELS[phaseIndex]} — Etape {step.num}</p>
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
            <div className={variant === "standalone" ? "mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-12" : "mx-auto max-w-xl"}>
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
                />
              )}
              {step.id === "mechanics" && (
                <StepMechanics
                  onNext={goNext}
                  openIndex={openMechanic}
                  setOpenIndex={setOpenMechanic}
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

/* ═══════════════════════════════════════════════════════════
   STEP 1 — ENTRY
   ═══════════════════════════════════════════════════════════ */
function StepEntry({ worldId, onSelectWorld }: { worldId: LandingWorldId; onSelectWorld: (w: LandingWorldId) => void }) {
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
          Horizon Diamond
        </p>
        <p className="mt-3 font-serif" style={{ fontSize: "1.35rem", color: "var(--cardin-green-primary)", lineHeight: 1.2 }}>
          Débloquez le Diamond
        </p>
        <p className="mt-2" style={{ fontSize: "0.82rem", color: "var(--cardin-body)", lineHeight: 1.55 }}>
          Dès cette entrée, le parcours vise un statut long terme : expériences régulières, missions au milieu du chemin,
          privilège contrôlé — pas une réduction ponctuelle.
        </p>
      </div>
      <StepTitle>Quel lieu connectez-vous ?</StepTitle>
      <StepSubtitle>Le système s’adapte à votre type d’activité.</StepSubtitle>

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

/* ═══════════════════════════════════════════════════════════
   STEP 2 — LECTURE
   ═══════════════════════════════════════════════════════════ */
function StepLecture({ demo, worldId, onNext }: { demo: ReturnType<typeof getDemoWorldContent>; worldId: LandingWorldId; onNext: () => void }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 1400)
    const t3 = setTimeout(() => setPhase(3), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const market = LANDING_WORLDS[worldId]
  const band = market.seasonRevenueBandEuro
  /** Même cadrage € que la fin du parcours / landing — pas le volume brut moteur × perte. */
  const stakeMidSeason = Math.round((band.min + band.max) / 2)
  const monthlyStakeMid = Math.round(stakeMidSeason / demo.seasonMonths)
  const equivVisitsMonth = Math.max(1, Math.round(monthlyStakeMid / Math.max(0.01, demo.avgTicket)))
  const equivVisitsSeason = equivVisitsMonth * demo.seasonMonths

  return (
    <>
      <StepHeader num="02" label="Lecture" />
      <StepTitle>Ce que le lieu perd aujourd&apos;hui.</StepTitle>
      <StepSubtitle>
        Cadrage aligné sur « {market.claim} » · panier indicatif {market.basket} · fuite estimée {demo.inactivePercent}% (ordre de grandeur).
      </StepSubtitle>

      <motion.div
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 16 }}
        className="mb-4 rounded-2xl p-6"
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

/* ═══════════════════════════════════════════════════════════
   STEP 3 — SUMMIT
   ═══════════════════════════════════════════════════════════ */
function StepSummit({ selectedId, setSelectedId, onNext }: { selectedId: ParcoursSummitStyleId | null; setSelectedId: (id: ParcoursSummitStyleId) => void; onNext: () => void }) {
  return (
    <>
      <StepHeader num="03" label="Sommet" accent="gold" />
      <StepTitle>Comment declencher le retour.</StepTitle>
      <StepSubtitle>Le Sommet est l'objectif final du parcours. Son intensite determine la force de rappel.</StepSubtitle>

      <div className="mb-10 space-y-3">
        {SUMMITS.map((opt, i) => (
          <motion.button
            key={opt.id}
            animate={{ opacity: 1, x: 0 }}
            className="w-full rounded-2xl p-5 text-left transition-all"
            initial={{ opacity: 0, x: -12 }}
            onClick={() => setSelectedId(opt.id)}
            style={{
              backgroundColor: selectedId === opt.id ? "var(--cardin-summit-gold-light)" : "var(--cardin-card)",
              border: `1.5px solid ${selectedId === opt.id ? "var(--cardin-summit-gold)" : "var(--cardin-border)"}`,
            }}
            transition={{ delay: 0.2 + i * 0.09, duration: 0.4 }}
            type="button"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full transition-colors" style={{ backgroundColor: selectedId === opt.id ? "var(--cardin-summit-gold)" : "var(--cardin-border)" }} />
                  <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--cardin-text)" }}>{opt.label}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--cardin-body)", lineHeight: 1.5, paddingLeft: "1.1rem" }}>{opt.description}</p>
              </div>
              <div className="shrink-0 pt-0.5 text-right">
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--cardin-summit-gold)" }}>{opt.metric}</div>
                <div style={{ fontSize: "0.6rem", color: "var(--cardin-label)", letterSpacing: "0.04em" }}>{opt.metricLabel}</div>
              </div>
            </div>
          </motion.button>
        ))}
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

/* ═══════════════════════════════════════════════════════════
   STEP 4 — MECHANICS (accordion with diagrams)
   ═══════════════════════════════════════════════════════════ */
type MechanicStep = {
  num: string
  name: string
  sub: string
  accent: "default" | "blue" | "gold"
  diagram: React.ReactNode
  effect: React.ReactNode
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

function hdrBorder(accent: string, open: boolean) {
  if (accent === "blue") return open ? c.blueBorder : "rgba(128,164,214,0.15)"
  if (accent === "gold") return open ? c.goldBorder : "rgba(163,135,103,0.15)"
  return open ? c.green : c.border
}
function bodyBorder(accent: string) {
  if (accent === "blue") return c.blueBorder
  if (accent === "gold") return c.goldBorder
  return c.border
}

/* Diagram: Timeline */
function DiagramTimeline() {
  const nodes = [
    { label: "V1", style: "dim", glyph: "◦" },
    { label: "V2", style: "bright", glyph: "◆" },
    { label: "V3", style: "mid", glyph: "◦" },
    { label: "V4", style: "dim", glyph: "◦" },
    { label: "V5", style: "dim", glyph: "◦" },
    { label: "DIAMOND", style: "gold", glyph: "★" },
  ]
  const dotStyle = (s: string) => {
    if (s === "gold") return { borderColor: c.goldDim, background: c.goldLight }
    if (s === "bright") return { borderColor: c.green, background: "rgba(0,61,44,0.08)" }
    if (s === "mid") return { borderColor: "rgba(0,61,44,0.35)", background: "rgba(0,61,44,0.04)" }
    return { borderColor: c.border, background: "transparent" }
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "4px 0 16px" }}>
        {nodes.map((n, i) => (
          <div key={n.label} style={{ display: "contents" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", ...dotStyle(n.style) }}>
                <span style={{ fontFamily: "monospace", fontSize: n.glyph === "◦" ? 7 : 10, color: n.style === "gold" ? c.gold : n.style === "bright" ? c.green : c.label }}>{n.glyph}</span>
              </div>
              <span style={{ fontSize: 8, letterSpacing: "0.06em", fontFamily: "monospace", textAlign: "center", color: n.style === "gold" ? c.goldDim : n.style === "bright" || n.style === "mid" ? c.body : c.labelLight }}>{n.label}</span>
            </div>
            {i < nodes.length - 1 && <div style={{ flex: 1, height: 1, marginBottom: 22, background: i < 2 ? "rgba(0,61,44,0.3)" : c.border }} />}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 4, background: "rgba(0,61,44,0.08)", borderRadius: 2, overflow: "hidden", position: "relative" }}>
          <div style={{ height: "100%", width: "40%", background: "rgba(0,61,44,0.3)", borderRadius: 2 }} />
          <span style={{ position: "absolute", right: 0, top: -5, fontSize: 8, color: c.goldDim, fontFamily: "monospace" }}>★</span>
        </div>
        <span style={{ fontSize: 10, color: c.label, fontFamily: "monospace", whiteSpace: "nowrap" }}>3 / 8</span>
      </div>
    </div>
  )
}

/* Diagram: Bar chart comparison */
function DiagramBars() {
  const classic = [1, 1, 1, 1, 1, 1, 1, 1, 1, 5]
  const cardin = [1, 5, 1, 3, 1, 2, 1, 4, 1, 5]
  const barOpacity = (h: number, isCardin: boolean) => {
    if (!isCardin) return h === 5 ? 0.25 : 0.06
    if (h > 3) return 0.4
    if (h > 2) return 0.2
    if (h > 1) return 0.12
    return 0.05
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "4px 0 16px" }}>
      {[{ title: "Systeme classique", data: classic, hi: false }, { title: "Cardin", data: cardin, hi: true }].map((col) => (
        <div key={col.title}>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8, fontFamily: "monospace", color: col.hi ? c.body : c.labelLight }}>{col.title}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 44 }}>
            {col.data.map((h, i) => (
              <div key={i} style={{ flex: 1, height: (h / 5) * 44, borderRadius: "2px 2px 0 0", background: `rgba(0,61,44,${barOpacity(h, col.hi)})` }} />
            ))}
          </div>
          <div style={{ fontSize: 9, color: col.hi ? c.label : c.labelLight, marginTop: 6, fontFamily: "monospace" }}>{col.hi ? "variable — imprevisible" : "attendre × 10"}</div>
        </div>
      ))}
    </div>
  )
}

/* Diagram: Domino tree */
function DiagramDomino() {
  return (
    <div style={{ margin: "4px 0 16px" }}>
      {[
        { label: "50 accès\ninitiaux", count: 10, glyph: "◆", borderC: "rgba(0,61,44,0.35)", bg: "rgba(0,61,44,0.06)", txtC: "rgba(0,61,44,0.5)", labelC: c.label, mult: "×5" },
        { label: "chacun\ninvite 1", count: 10, glyph: "+1", borderC: c.blueBorder, bg: c.blueLight, txtC: c.blueDim, labelC: c.blueDim, mult: "×5" },
        { label: "ceux-la\ninvitent 1", count: 10, glyph: "+1", borderC: "rgba(128,164,214,0.15)", bg: "rgba(128,164,214,0.04)", txtC: "rgba(128,164,214,0.3)", labelC: "rgba(128,164,214,0.3)", mult: "×5" },
      ].map((row, ri) => (
        <div key={ri}>
          {ri > 0 && <div style={{ display: "flex", alignItems: "center", paddingLeft: 66, height: 12, marginBottom: 2 }}><div style={{ borderLeft: `1px solid ${ri === 1 ? c.blueDim : "rgba(128,164,214,0.15)"}`, height: "100%" }} /></div>}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: row.labelC, fontFamily: "monospace", width: 56, flexShrink: 0, textAlign: "right", lineHeight: 1.4, whiteSpace: "pre-line" }}>{row.label}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
              {Array.from({ length: row.count }).map((_, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: 3, border: `1px solid ${row.borderC}`, background: row.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 8, color: row.txtC }}>{row.glyph}</div>
              ))}
              <span style={{ fontSize: 9, color: row.labelC, alignSelf: "center", marginLeft: 2 }}>{row.mult}</span>
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(0,61,44,0.03)", border: `1px solid ${c.border}`, borderRadius: 6, marginTop: 4 }}>
        <div>
          <div className="font-serif" style={{ fontSize: 30, color: c.green, lineHeight: 1 }}>150</div>
          <div style={{ fontSize: 9, color: c.label, fontFamily: "monospace", marginTop: 2 }}>parcours actifs</div>
        </div>
        <div style={{ fontSize: 10, color: c.label, textAlign: "right", lineHeight: 1.5 }}>depuis<br />50 accès<br />initiaux</div>
      </div>
    </div>
  )
}

/* Diagram: Cost table */
function DiagramCost() {
  const rows = [
    { label: "Grand Diamond cafe", cost: "120€ / an", duration: "12 mois", gold: true },
    { label: "Grand Diamond beaute", cost: "300€ / an", duration: "12 mois", gold: true },
    { label: "Grand Diamond restaurant", cost: "600€ / an", duration: "12 mois", gold: true },
  ]
  const cell: React.CSSProperties = { padding: "10px 10px", fontSize: 11, border: `1px solid ${c.border}`, background: c.card }
  return (
    <div style={{ margin: "4px 0 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px" }}>
        <div style={{ ...cell, fontSize: 9, color: c.labelLight, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", borderRadius: "6px 0 0 0" }} />
        <div style={{ ...cell, fontSize: 9, color: c.labelLight, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Cout</div>
        <div style={{ ...cell, fontSize: 9, color: c.labelLight, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", borderRadius: "0 6px 0 0" }}>Duree</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px" }}>
          <div style={{ ...cell, color: c.text, fontWeight: 500 }}>{r.label}</div>
          <div style={{ ...cell, color: c.gold, background: c.goldLight }}>{r.cost}</div>
          <div style={{ ...cell, color: c.gold, background: c.goldLight }}>{r.duration}</div>
        </div>
      ))}
      <div style={{ height: 4 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px" }}>
        <div style={{ ...cell, color: c.label, borderRadius: "0 0 0 6px" }}>Campagne Instagram</div>
        <div style={{ ...cell, color: c.labelLight }}>500€</div>
        <div style={{ ...cell, color: c.labelLight, borderRadius: "0 0 6px 0" }}>3 jours</div>
      </div>
    </div>
  )
}

/* Diagram: Saison 2 */
function DiagramSaison2() {
  return (
    <div style={{ margin: "4px 0 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[
          { num: "150", lbl: "parcours actifs\nfin Saison 1", gold: false },
          { num: "8", lbl: "Grand Diamonds\nvisibles dans le lieu", gold: true },
          { num: "50", lbl: "accès limités\nplus d'impact par client", gold: false },
          { num: "S2", lbl: "les memes clients\nveulent recommencer", gold: false },
        ].map((card, i) => (
          <div key={i} style={{ padding: "12px 14px", border: `1px solid ${card.gold ? c.goldBorder : c.border}`, borderRadius: 8, background: card.gold ? c.goldLight : c.card }}>
            <div className="font-serif" style={{ fontSize: card.num === "S2" ? 22 : 28, lineHeight: 1, marginBottom: 3, color: card.gold ? c.gold : c.green }}>{card.num}</div>
            <div style={{ fontSize: 10, color: card.gold ? c.goldDim : c.label, lineHeight: 1.4, whiteSpace: "pre-line" }}>{card.lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: c.labelLight, fontFamily: "monospace", marginBottom: 8 }}>↓</div>
      <div style={{ padding: "12px 14px", border: `1px solid ${c.border}`, borderRadius: 8, background: c.cardAlt, fontSize: 12, color: c.body, lineHeight: 1.6, textAlign: "center" }}>
        Moins d&apos;accès = plus de valeur par client.<br /><strong style={{ color: c.text, fontWeight: 500 }}>La rareté fait le travail. La saison 2 a plus d&apos;impact que la première.</strong>
      </div>
    </div>
  )
}

const MECHANIC_STEPS: MechanicStep[] = [
  { num: "01", name: "Il revient", sub: "La progression cree une raison de repasser.", accent: "default", diagram: <DiagramTimeline />, effect: <>Il voit ou il en est. <strong>Il ne veut pas repartir a zero.</strong> Le Grand Diamond est visible depuis le debut.</> },
  { num: "02", name: "Il recoit quelque chose tot", sub: "Pas a la 10eme visite. Variable. Imprevisible.", accent: "default", diagram: <DiagramBars />, effect: <>Des la 2eme visite, quelque chose arrive. <strong>L'incertitude maintient l'engagement mieux que la previsibilite.</strong></> },
  { num: "03", name: "Il amene quelqu'un", sub: "Cette personne en amene une autre. Et ainsi de suite.", accent: "blue", diagram: <DiagramDomino />, effect: <><strong>Vos clients deviennent votre meilleur canal.</strong> Sans publicite. Sans effort de votre part.</> },
  { num: "04", name: "Grand Diamond", sub: "Le sommet visible depuis le debut. Tout le monde le sait.", accent: "gold", diagram: <DiagramCost />, effect: <>Le Grand Diamond <strong>tire tous les autres vers le haut.</strong> Sa seule existence vaut une campagne.</> },
  { num: "05", name: "Vision long terme", sub: "Accès limités. Chaque saison a plus d'impact.", accent: "default", diagram: <DiagramSaison2 />, effect: <>Moins d&apos;accès, plus de valeur. <strong>Chaque saison renforce la précédente.</strong></> },
]

function StepMechanics({ openIndex, setOpenIndex, onNext }: { openIndex: number | null; setOpenIndex: (v: number | null) => void; onNext: () => void }) {
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <>
      <StepHeader num="04" label="Mecanique" />
      <StepTitle>Ce qui fait revenir les gens.</StepTitle>
      <motion.p animate={{ opacity: 1 }} className="mb-8" initial={{ opacity: 0 }} style={{ color: c.labelLight, fontSize: "0.75rem" }} transition={{ delay: 0.25, duration: 0.4 }}>
        Cliquez sur chaque etape.
      </motion.p>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {MECHANIC_STEPS.map((ms, i) => {
          const isOpen = openIndex === i
          return (
            <motion.div
              key={ms.num}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}
            >
              <button
                onClick={() => toggle(i)}
                style={{
                  width: "100%", textAlign: "left",
                  display: "grid", gridTemplateColumns: "24px 1fr auto", alignItems: "center", gap: 14,
                  padding: "13px 16px",
                  border: `1px solid ${hdrBorder(ms.accent, isOpen)}`,
                  borderRadius: isOpen ? "10px 10px 0 0" : "10px",
                  backgroundColor: isOpen ? c.cardAlt : c.card,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                type="button"
              >
                <span style={{ fontSize: 9, fontFamily: "monospace", textAlign: "right", color: ms.accent === "blue" ? c.blueDim : ms.accent === "gold" ? c.goldDim : c.labelLight }}>{ms.num}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, color: ms.accent === "blue" ? c.blue : ms.accent === "gold" ? c.gold : c.text }}>{ms.name}</div>
                  <div style={{ fontSize: 10, color: c.label }}>{ms.sub}</div>
                </div>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: c.label, transition: "transform 0.25s", transform: isOpen ? "rotate(45deg)" : "none", display: "inline-block", width: 16, textAlign: "center" }}>+</span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden", border: `1px solid ${bodyBorder(ms.accent)}`, borderTop: "none", borderRadius: "0 0 10px 10px", background: c.cream }}
                    transition={{ duration: 0.2, ease }}
                  >
                    <div style={{ padding: "20px 20px 16px" }}>
                      {ms.diagram}
                      <div style={{ paddingTop: 14, borderTop: `1px solid ${c.border}`, fontSize: 12, color: c.body, lineHeight: 1.6 }}>{ms.effect}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <motion.button
        animate={{ opacity: 1 }}
        className="mt-8 w-full rounded-full py-4"
        initial={{ opacity: 0 }}
        onClick={onNext}
        style={{ backgroundColor: c.green, color: "#FAF8F2", fontSize: "0.95rem" }}
        transition={{ delay: 0.6, duration: 0.4 }}
        type="button"
      >
        Voir l'impact sur le revenu
      </motion.button>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 5 — PROJECTION (count-up reveal)
   ═══════════════════════════════════════════════════════════ */
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

  const baseLayers = [
    {
      key: "recovery",
      label: "Recuperation",
      description: "Clients perdus qui reviennent grace au parcours",
      value: seasonLayers.recovery,
      color: "var(--cardin-green-primary)",
      barBg: "rgba(0,61,44,0.2)",
    },
    {
      key: "frequency",
      label: "Frequence",
      description: `${seasonLayers.activeCardholders} porteurs actifs visitent plus souvent`,
      value: seasonLayers.frequency,
      color: "var(--cardin-green-secondary)",
      barBg: "rgba(10,77,58,0.18)",
    },
    {
      key: "domino",
      label: "Domino",
      description: `${seasonLayers.dominoNewClients} nouveaux clients par propagation`,
      value: seasonLayers.domino,
      color: "var(--cardin-domino-blue)",
      barBg: "rgba(128,164,214,0.2)",
      compound: true,
    },
  ]

  const layers = isLite ? baseLayers.filter((l) => l.key !== "domino") : baseLayers

  const maxLayer = Math.max(...layers.map((l) => l.value), 1)

  return (
    <>
      <StepHeader num={headerNum} label="Projection" />
      <StepTitle>Impact sur le revenu.</StepTitle>
      <StepSubtitle>
        {isLite ? (
          <>
            Décomposition <strong>brute</strong> (récupération, fréquence) sur {seasonMonths} mois — vue centrée sur ces leviers (sans couche Domino sur cet écran). Les grands chiffres sont des <strong>montants nets</strong> après récompenses et coûts système.
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
                    <span style={{ fontSize: "0.55rem", color: "var(--cardin-domino-blue)", letterSpacing: "0.04em" }}>
                      croissant
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--cardin-label)", marginTop: "0.15rem", paddingLeft: "1rem" }}>
                  {layer.description}
                </div>
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
            <MiniStat color="var(--cardin-domino-blue)" label="Domino (brut)" value={formatEuro(seasonLayers.domino)} />
            <MiniStat color="var(--cardin-summit-gold)" label="Sommet" value={`×${summitMultiplier.toLocaleString("fr-FR")}`} />
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
        Passer a l'activation
      </motion.button>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 6 — ACTIVATION (final)
   ═══════════════════════════════════════════════════════════ */
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
  const summitLabel = summit.id === "visible" ? "Visible" : summit.id === "stronger" ? "Renforcé" : "Discret"
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
        <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--cardin-green-primary)", fontWeight: 600 }}>Système actif</span>
      </motion.div>

      <motion.h1
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 16 }}
        className="mb-3 font-serif"
        initial={{ opacity: 0, y: 16 }}
        style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", color: "var(--cardin-green-primary)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
        transition={{ duration: 0.4 }}
      >
        Le moteur tourne.
      </motion.h1>

      <motion.p
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        className="mb-10"
        initial={{ opacity: 0 }}
        style={{ color: "var(--cardin-body)", fontSize: "0.95rem", lineHeight: 1.55, maxWidth: "400px" }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        Le système est actif. Les premiers retours peuvent commencer.
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
          {seasonFrame.floorLabel} · {seasonFrame.upsideLabel}
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
          Aligné avec « Par type de commerce » sur l&apos;accueil. Modèle interne (démo) : ~{projectionFull.netCardinSeason.toLocaleString("fr-FR")} € net sur la saison · ~{projectionFull.netCardinMonth.toLocaleString("fr-FR")} €/mois · payback ~{demo.projectedPaybackDays} j
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
          <div style={{ fontSize: "0.5rem", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--cardin-green-primary)", marginBottom: 2 }}>Récupération</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--cardin-green-primary)" }}>{formatEuro(seasonLayers.recovery)}</div>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--cardin-green-tint)", border: "1px solid rgba(0,61,44,0.1)" }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--cardin-green-secondary)", marginBottom: 2 }}>Fréquence</div>
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
            ...(isLite ? [] : [{ label: "Sommet", value: summitLabel }]),
            { label: "Porteurs actifs", value: `${seasonLayers.activeCardholders}` },
            { label: "Fourchette marché (saison)", value: world.claim },
            { label: "Revenu net saison (modèle)", value: `${projectionFull.netCardinSeason.toLocaleString("fr-FR")} EUR` },
            {
              label: "Activation",
              value: isLite
                ? `${LANDING_PRICING.liteActivationFee} € · saison ${LANDING_PRICING.seasonLengthMonths} mois`
                : `${LANDING_PRICING.activationFee} € · saison ${LANDING_PRICING.seasonLengthMonths} mois`,
            },
          ].map((line) => (
            <div className="flex items-center justify-between" key={line.label}>
              <span style={{ fontSize: "0.75rem", color: "var(--cardin-label)" }}>{line.label}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--cardin-text)", fontWeight: 500 }}>{line.value}</span>
            </div>
          ))}
        </div>
      </motion.details>

      {/* CTAs */}
      <motion.div
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        className="flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          className="flex-1 rounded-full py-3.5 text-center text-sm"
          href={engineHref}
          style={{ backgroundColor: "var(--cardin-green-primary)", color: "#FAF8F2" }}
        >
          Ajuster le système
        </Link>
        <Link
          className="flex-1 rounded-full py-3.5 text-center text-sm"
          href={variant === "embedded" ? "#methode" : "/landing#methode"}
          style={{ border: "1px solid var(--cardin-border)", color: "var(--cardin-text)" }}
        >
          Voir le simulateur
        </Link>
        <Link
          className="flex-1 rounded-full py-3.5 text-center text-sm"
          href="/demo"
          style={{ border: "1px solid var(--cardin-border)", color: "var(--cardin-text)" }}
        >
          Voir la demo client
        </Link>
      </motion.div>
    </>
  )
}

/* ─── SHARED ATOMS ─── */
function StepHeader({ num, label, accent }: { num: string; label: string; accent?: "gold" }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-2" initial={{ opacity: 0, y: 12 }} transition={{ delay: 0.09, duration: 0.4 }}>
      <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: accent === "gold" ? "var(--cardin-summit-gold)" : "var(--cardin-label)" }}>
        Etape {num} — {label}
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
      style={{ color: "var(--cardin-body)", fontSize: "0.95rem", lineHeight: 1.55, maxWidth: "400px" }}
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
