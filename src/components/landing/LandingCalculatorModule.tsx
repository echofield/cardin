"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { ProgressionStrip } from "@/components/landing/ProgressionStrip"
import { AnnualProjectionPanel } from "@/components/engine/AnnualProjectionPanel"
import { trackEvent } from "@/lib/analytics"
import { projectAnnualCardinPlan } from "@/lib/annual-projection-engine"
import { buildCalendarPlan } from "@/lib/calendar-engine"
import { type BehaviorPlan } from "@/lib/behavior-engine"
import { DEFAULT_DAYS_OPEN, formatEuro, percentToRate } from "@/lib/calculator"
import { dynamicToLegacyScenarioId, getDynamicDefinition, type DynamicId, type MerchantIntent } from "@/lib/dynamics-library"
import { type MerchantTemplate } from "@/lib/merchant-templates"
import { projectFamilyImpact, type ProjectionPresetOverrideMap } from "@/lib/projection-engine"
import { Button, Card, Slider } from "@/ui"

type LandingCalculatorModuleProps = {
  ctaHref: string
  entryModeLabel?: string
  selectedTemplate: MerchantTemplate
  behaviorPlan: BehaviorPlan
  selectedDynamicId: DynamicId
  selectedIntent: MerchantIntent | null
}

const MONTHLY_PLAN_PRICE = 180

export function LandingCalculatorModule({
  ctaHref,
  entryModeLabel,
  selectedTemplate,
  behaviorPlan,
  selectedDynamicId,
  selectedIntent,
}: LandingCalculatorModuleProps) {
  const [basePerMonth, setBasePerMonth] = useState(1200)
  const [avgValue, setAvgValue] = useState(12)
  const [inactivePercent, setInactivePercent] = useState(32)
  const [recoveryPercent, setRecoveryPercent] = useState(Math.round(selectedTemplate.defaults.calculator_recovery_rate * 100))
  const [showAssumptionsEditor, setShowAssumptionsEditor] = useState(false)
  const [animateResult, setAnimateResult] = useState(false)
  const [projectionOverrides, setProjectionOverrides] = useState<ProjectionPresetOverrideMap | undefined>(undefined)

  const dynamic = useMemo(() => getDynamicDefinition(selectedDynamicId), [selectedDynamicId])
  const legacyScenarioId = useMemo(() => dynamicToLegacyScenarioId(selectedDynamicId), [selectedDynamicId])

  useEffect(() => {
    let mounted = true

    const loadProjectionPresets = async () => {
      try {
        const response = await fetch(`/api/projection-presets?activity=${encodeURIComponent(selectedTemplate.id)}`)
        const payload = await response.json()

        if (mounted && payload?.ok && payload?.overrides) {
          setProjectionOverrides(payload.overrides as ProjectionPresetOverrideMap)
        }
      } catch {
        if (mounted) {
          setProjectionOverrides(undefined)
        }
      }
    }

    void loadProjectionPresets()

    return () => {
      mounted = false
    }
  }, [selectedTemplate.id])
  useEffect(() => {
    setRecoveryPercent(Math.round(selectedTemplate.defaults.calculator_recovery_rate * 100))
  }, [selectedTemplate.defaults.calculator_recovery_rate])

  const monthlyProjection = useMemo(
    () =>
      projectFamilyImpact({
        merchantType: selectedTemplate.id,
        projectionFamily: dynamic.projectionFamily,
        monthlyClients: basePerMonth,
        avgTicket: avgValue,
        inactivePercent,
        baseRecoveryPercent: recoveryPercent,
        primaryEffect: dynamic.calculatorPrimaryEffect,
        secondaryEffect: dynamic.calculatorSecondaryEffect,
        scenarioRole: dynamic.scenarioRole,
      }, projectionOverrides),
    [avgValue, basePerMonth, dynamic, inactivePercent, projectionOverrides, recoveryPercent, selectedTemplate.id]
  )

  const calendarPlan = useMemo(
    () => buildCalendarPlan(selectedTemplate.id, legacyScenarioId),
    [legacyScenarioId, selectedTemplate.id]
  )

  const annualProjection = useMemo(
    () =>
      projectAnnualCardinPlan({
        merchantType: selectedTemplate.id,
        scenarioId: legacyScenarioId,
        monthlyClients: basePerMonth,
        avgTicket: avgValue,
        inactivePercent,
        baseRecoveryPercent: recoveryPercent,
        projectionProfiles: projectionOverrides,
      }),
    [avgValue, basePerMonth, inactivePercent, legacyScenarioId, projectionOverrides, recoveryPercent, selectedTemplate.id]
  )

  const monthlyValueFromOneReturnDaily = useMemo(() => avgValue * DEFAULT_DAYS_OPEN, [avgValue])
  const returnsPerDayToCoverMonthly = useMemo(
    () => (avgValue > 0 ? MONTHLY_PLAN_PRICE / (DEFAULT_DAYS_OPEN * avgValue) : 0),
    [avgValue]
  )

  const equivalentLine = useMemo(() => {
    if (monthlyProjection.monthlyReturns <= 0) return null
    const perDay = monthlyProjection.monthlyReturns / DEFAULT_DAYS_OPEN
    if (perDay >= 0.9 && perDay <= 1.1) return "Ã‰quivalent : environ un passage en plus par jour ouvrÃ©."
    if (perDay < 0.15) return `Ã‰quivalent : environ un passage en plus tous les ${Math.max(2, Math.round(1 / perDay))} jours.`
    return `Ã‰quivalent : environ ${perDay.toFixed(1)} retours par jour ouvrÃ©.`
  }, [monthlyProjection.monthlyReturns])

  useEffect(() => {
    setAnimateResult(true)
    const timer = window.setTimeout(() => setAnimateResult(false), 220)

    return () => window.clearTimeout(timer)
  }, [monthlyProjection.monthlyRevenue])

  const handleCalculatorChange = (label: string, value: number | string) => {
    trackEvent("calculator_change", {
      field: label,
      value,
      audience: "clients",
      templateId: selectedTemplate.id,
      dynamicId: selectedDynamicId,
      projectionFamily: dynamic.projectionFamily,
      intent: selectedIntent ?? undefined,
    })
  }

  return (
    <Card className="relative overflow-hidden border-[#C6CEC2] bg-gradient-to-b from-[#FFFEFB] to-[#F6F6F0] p-5 shadow-[0_30px_70px_-55px_rgba(23,58,46,0.75)] sm:p-8">
      <div className="absolute right-[-80px] top-[-120px] h-[220px] w-[220px] rounded-full bg-[#EAF0E6] blur-2xl" />

      <div className="relative">
        <p className="text-xs uppercase tracking-[0.16em] text-[#5C655E]">Projection Cardin Â· {entryModeLabel ?? "Commerce"}</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[#16372C] sm:text-4xl">Ce que cela peut rÃ©ellement ramener</h2>
        <p className="mt-2 max-w-3xl text-sm text-[#5C655E]">
          Les curseurs estiment votre base. La dynamique choisie oriente l&apos;effet principal â€” sans promesse irrÃ©aliste.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <p className="text-sm text-[#2A3F35]">Clients / mois</p>
                <p className="text-lg font-medium text-[#16372C]">{basePerMonth}</p>
              </div>
              <Slider
                max={6000}
                min={120}
                onChange={(value) => {
                  setBasePerMonth(value)
                  handleCalculatorChange("base_per_month", value)
                }}
                value={basePerMonth}
              />
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <p className="text-sm text-[#2A3F35]">Panier moyen</p>
                <p className="text-lg font-medium text-[#16372C]">{avgValue} â‚¬</p>
              </div>
              <Slider
                max={250}
                min={6}
                onChange={(value) => {
                  setAvgValue(value)
                  handleCalculatorChange("avg_value", value)
                }}
                value={avgValue}
              />
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <p className="text-sm text-[#2A3F35]">% de clients qui disparaissent</p>
                <p className="text-lg font-medium text-[#16372C]">{inactivePercent}%</p>
              </div>
              <Slider
                max={85}
                min={10}
                onChange={(value) => {
                  setInactivePercent(value)
                  handleCalculatorChange("inactive_percent", value)
                }}
                value={inactivePercent}
              />
            </div>

            <div className="rounded-2xl border border-[#CCD3C9] bg-[#FEFEFA] p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Ce que vous mettez en place</p>
              <p className="mt-2 text-lg font-medium text-[#173A2E]">{dynamic.cardTitle}</p>
              <p className="mt-1 text-sm text-[#2A3F35]">{dynamic.cardHook}</p>
              <p className="mt-2 text-xs text-[#556159]">{behaviorPlan.movementPromise}</p>
              <ProgressionStrip dynamic={dynamic} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#CCD3C9] bg-[#FEFEFA] p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Estimation mensuelle</p>
              <p
                className={[
                  "mt-2 font-serif text-4xl text-[#153428] transition-transform duration-200 sm:text-5xl",
                  animateResult ? "scale-[1.015]" : "scale-100",
                ].join(" ")}
              >
                +{formatEuro(monthlyProjection.monthlyRevenue)} / mois
              </p>
              <p className="mt-2 text-sm text-[#5C655E]">{monthlyProjection.monthlyReturns} retours estimÃ©s / mois.</p>
              {equivalentLine ? <p className="mt-2 text-sm text-[#2A3F35]">{equivalentLine}</p> : null}
              <p className="mt-2 text-sm text-[#2A3F35]">{monthlyProjection.primaryEffect}</p>
              <p className="mt-1 text-sm text-[#556159]">{monthlyProjection.secondaryEffect}</p>
              <p className="mt-3 text-xs text-[#556159]">{monthlyProjection.confidenceLabel}</p>
              <p className="mt-4 text-xs italic text-[#5C655E]">Vos clients voient oÃ¹ ils en sont. Et reviennent pour avancer.</p>

              <div className="mt-4 border-t border-[#D9DDD6] pt-3">
                <p className="text-xs text-[#5A645D]">HypothÃ¨ses : {DEFAULT_DAYS_OPEN} jours ouverts / mois Â· retour visÃ© {recoveryPercent}%</p>
                <button
                  className="mt-2 text-xs font-medium text-[#173A2E] underline-offset-2 hover:underline"
                  onClick={() => setShowAssumptionsEditor((prev) => !prev)}
                  type="button"
                >
                  {showAssumptionsEditor ? "Masquer" : "Ajuster les hypothÃ¨ses"}
                </button>

                {showAssumptionsEditor ? (
                  <div className="mt-3">
                    <div className="mb-2 flex items-end justify-between gap-3">
                      <p className="text-sm text-[#2A3F35]">Taux de retour visÃ©</p>
                      <p className="text-sm font-medium text-[#16372C]">{recoveryPercent}%</p>
                    </div>
                    <Slider
                      max={45}
                      min={8}
                      onChange={(value) => {
                        setRecoveryPercent(value)
                        handleCalculatorChange("recovery_percent", value)
                      }}
                      value={recoveryPercent}
                    />
                    <p className="mt-2 text-xs text-[#5A645D]">Seuil calculÃ© actuel : {returnsPerDayToCoverMonthly.toFixed(2)} retour/jour.</p>
                    <p className="mt-2 text-xs text-[#5A645D]">1 retour par jour reprÃ©sente environ {formatEuro(monthlyValueFromOneReturnDaily)} / mois.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-[#CCD3C9] bg-[#FEFEFA] p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Prochain moment Ã  activer</p>
              <p className="mt-2 text-lg font-medium text-[#173A2E]">{calendarPlan.nextMoment.label}</p>
              <p className="mt-1 text-sm text-[#556159]">{calendarPlan.nextMoment.reason}</p>
              <p className="mt-3 text-sm text-[#2A3F35]">{calendarPlan.quietPeriodLabel}</p>
            </div>

            <AnnualProjectionPanel annualProjection={annualProjection} />

            <div className="rounded-2xl border border-[#CCD3C9] bg-[#FEFEFA] p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Mise en place</p>
              <p className="mt-2 text-sm text-[#2A3F35]">180EUR / mois</p>
              <p className="mt-1 text-sm text-[#2A3F35]">moteur Cardin actif</p>
              <p className="mt-3 text-sm text-[#556159]">Chaque mois, Cardin prÃ©pare une nouvelle proposition prÃªte Ã  lancer, 100% pour votre commerce.</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-3 mt-6 flex flex-col gap-3 sm:static sm:flex-row sm:items-center">
          <Link
            className="sm:flex-1"
            href={ctaHref}
            onClick={() =>
              trackEvent("calculator_cta", {
                revenue: monthlyProjection.monthlyRevenue,
                templateId: selectedTemplate.id,
                dynamicId: selectedDynamicId,
                projectionFamily: dynamic.projectionFamily,
                intent: selectedIntent ?? undefined,
              })
            }
          >
            <Button className="w-full" size="lg">
              Mettre en place dans ma boutique
            </Button>
          </Link>
          <div className="text-center sm:text-left">
            <p className="text-xs text-[#5C655E]">Activation en 10 minutes</p>
            <Link className="text-sm font-medium text-[#16372C] underline-offset-4 hover:underline" href="#pricing">
              Voir l&apos;offre &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}






