"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"

import { WalletPassPreview } from "@/components/engine/WalletPassPreview"
import { ScenarioCard } from "@/components/landing/ScenarioCard"
import { trackEvent } from "@/lib/analytics"
import { formatEuro } from "@/lib/calculator"
import { cn } from "@/lib/utils"
import {
  type AuditSelection,
  getProjectionBundle,
  isMerchantProjectionType,
  type ProjectionAuditOption,
  type ProjectionScenario,
} from "@/lib/projection-scenarios"
import { formatRetentionLine, formatSimulationRhythm, simulateScenario } from "@/lib/simulation"
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

  const [active, setActive] = useState<ProjectionScenario | null>(null)
  const [audit, setAudit] = useState<AuditSelection | null>(null)

  useEffect(() => {
    setActive(null)
  }, [typeParam])

  const current = active ?? bundle?.featured ?? null
  const options = bundle?.options ?? []

  useEffect(() => {
    if (current) {
      setAudit(current.defaultAudit)
    }
  }, [current])

  const simulation = useMemo(() => {
    if (!valid || !typeParam || !current || !audit || !bundle) return null
    return simulateScenario({
      merchantType: typeParam,
      merchantLabel: bundle.merchantLabel,
      scenario: current,
      audit,
    })
  }, [audit, bundle, current, typeParam, valid])

  const animLow = useCountUp(simulation?.revenue_low ?? 0)
  const animHigh = useCountUp(simulation?.revenue_high ?? 0)

  const selectProposition = useCallback(
    (p: ProjectionScenario) => {
      setActive(p)
      trackEvent("hero_cta", { source: "projection_proposition", propositionId: p.id })
    },
    []
  )

  const selectFeatured = useCallback(() => setActive(null), [])

  if (!valid || !bundle || !current || !simulation || !audit) {
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
    <main className="min-h-screen bg-[#F6F5F0] pb-16 pt-10 text-[#152F25] sm:pb-20 sm:pt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#93A094]">{bundle.merchantLabel}</p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-[#15372B] sm:text-5xl">
            Voici le mouvement que Cardin lancerait chez vous
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#5C655E]">{bundle.brandPunchline}</p>
        </div>

        <section className="mx-auto mt-12 max-w-4xl rounded-[32px] border border-[#D7DDD2] bg-[#FDFCF8] px-6 py-8 shadow-[0_24px_60px_-42px_rgba(23,58,46,0.25)] sm:px-8">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#93A094]">Scenario choisi</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="font-serif text-3xl text-[#15372B]">{current.title}</h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#5C655E]">{current.description}</p>
            </div>
            {active ? (
              <div className="flex items-start justify-start lg:justify-end">
                <button className="text-sm text-[#173A2E] underline underline-offset-4" onClick={selectFeatured} type="button">
                  Revenir a la proposition principale
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <DetailBlock label="Ce que Cardin declenche" value={current.summaryLine} />
            <DetailBlock label="Point de depart" value={current.startingOffer} />
            <DetailBlock label="Ce que le client ressent" value={current.customerPromise} />
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-4xl rounded-[32px] border border-[#D7DDD2] bg-[#FFFEFB] px-6 py-8 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#93A094]">Mini-audit Cardin</p>
            <h2 className="mt-3 font-serif text-3xl text-[#15372B]">On calibre le calcul a partir de votre carte</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5C655E]">
              Vous choisissez seulement le niveau de flux, de panier et de frequence. Le scenario fait ensuite le reste.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {bundle.auditBlocks.map((block) => (
              <AuditBlockSelector
                help={block.help}
                key={block.id}
                label={block.label}
                onSelect={(value) => setAudit((prev) => (prev ? { ...prev, [block.id]: value } : prev))}
                options={block.options}
                selectedId={audit[block.id]}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-5xl grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-[#D7DDD2] bg-[#FDFCF8] px-6 py-8 shadow-[0_24px_60px_-42px_rgba(23,58,46,0.2)] sm:px-8">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#93A094]">Projection mensuelle</p>
            <h2 className="mt-3 font-serif text-3xl text-[#15372B]">Ce que ce mouvement peut vraiment recuperer</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5C655E]">{simulation.rationale}</p>

            <div className="mt-8 border-t border-[#E7EAE4] pt-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#9AA396]">Estimation prudente</p>
              <p className="mt-2 font-serif text-4xl leading-none text-[#15372B] sm:text-5xl">
                +{formatEuro(animLow)}
                <span className="mx-2 text-[#98A297]">a</span>
                +{formatEuro(animHigh)}
              </p>
              <p className="mt-3 text-base text-[#2A3F35]">/ mois</p>
            </div>

            <div className="mt-6 rounded-3xl bg-[#F4F6F1] px-5 py-4">
              <p className="text-sm text-[#2A3F35]">{formatSimulationRhythm(simulation.visits_added)}</p>
              <p className="mt-2 text-xs text-[#7A847B]">{formatRetentionLine(simulation.retention_gain)}</p>
            </div>

            <div className="mt-6 border-t border-[#E7EAE4] pt-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#93A094]">Base de projection</p>
              <ul className="mt-3 space-y-2 text-sm text-[#5C655E]">
                {simulation.proofLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <WalletPassPreview
              activeDots={current.pass.activeDots}
              businessLabel={bundle.merchantLabel}
              caption={current.triggerHint}
              footerLabel={current.pass.footerLabel}
              notificationLabel={current.pass.notificationLabel}
              progressDots={current.pass.progressDots}
              rewardLabel={current.pass.rewardLabel}
            />

            <div className="mt-5 rounded-[28px] border border-[#D7DDD2] bg-[#FDFCF8] px-6 py-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#93A094]">Ce qui tourne apres le scan</p>
              <div className="mt-4 space-y-3 text-sm text-[#2A3F35]">
                <p>1. Le client scanne et ajoute la carte.</p>
                <p>2. Il voit la progression et l'offre de depart.</p>
                <p>3. Cardin relance au bon moment pour provoquer le prochain retour.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-4xl">
          <p className="text-center text-[10px] uppercase tracking-[0.18em] text-[#93A094]">Autres mouvements possibles</p>
          <div className="mt-4 grid gap-4">
            {options.map((opt) => (
              <ScenarioCard key={opt.id} onSelect={() => selectProposition(opt)} proposition={opt} selected={active?.id === opt.id} />
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-col items-center gap-3">
          <Link
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full justify-center sm:max-w-md")}
            href="/login"
            onClick={() => trackEvent("hero_cta", { source: "projection_cta" })}
          >
            Mettre en place dans ma boutique
          </Link>
          <Link className="text-sm text-[#7A847B] underline-offset-4 hover:text-[#15372B] hover:underline" href="/landing">
            Voir d'autres commerces
          </Link>
        </div>
      </div>
    </main>
  )
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#E7EAE4] bg-[#FCFBF7] px-5 py-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#93A094]">{label}</p>
      <p className="mt-3 text-sm leading-relaxed text-[#2A3F35]">{value}</p>
    </div>
  )
}

function AuditBlockSelector({
  label,
  help,
  options,
  selectedId,
  onSelect,
}: {
  label: string
  help: string
  options: ProjectionAuditOption<string>[]
  selectedId: string
  onSelect: (id: AuditSelection[keyof AuditSelection]) => void
}) {
  return (
    <div className="rounded-3xl border border-[#E7EAE4] bg-[#FCFBF7] px-5 py-5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#93A094]">{label}</p>
      <p className="mt-2 text-sm text-[#5C655E]">{help}</p>

      <div className="mt-4 space-y-2">
        {options.map((option) => {
          const isSelected = option.id === selectedId

          return (
            <button
              className={[
                "w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                isSelected
                  ? "border-[#173A2E] bg-[#EEF4EC] shadow-sm"
                  : "border-[#DDE3DB] bg-[#FFFEFB] hover:border-[#173A2E]/50 hover:bg-[#F8FAF6]",
              ].join(" ")}
              key={option.id}
              onClick={() => onSelect(option.id as AuditSelection[keyof AuditSelection])}
              type="button"
            >
              <p className="text-sm font-medium text-[#15372B]">{option.label}</p>
              <p className="mt-1 text-xs text-[#6B766D]">{option.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
