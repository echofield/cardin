"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { buildBehaviorPlan, type BehaviorPlan } from "@/lib/behavior-engine"
import { calculateRecovery, DEFAULT_DAYS_OPEN, formatEuro, percentToRate } from "@/lib/calculator"
import { type MerchantTemplate } from "@/lib/merchant-templates"
import { Button, Card, Slider } from "@/ui"

type LandingCalculatorModuleProps = {
  ctaHref: string
  entryModeLabel?: string
  selectedTemplate: MerchantTemplate
  behaviorPlan: BehaviorPlan
}

const MONTHLY_PLAN_PRICE = 39

export function LandingCalculatorModule({ ctaHref, entryModeLabel, selectedTemplate }: LandingCalculatorModuleProps) {
  const [basePerMonth, setBasePerMonth] = useState(1200)
  const [avgValue, setAvgValue] = useState(12)
  const [inactivePercent, setInactivePercent] = useState(32)
  const [recoveryPercent, setRecoveryPercent] = useState(Math.round(selectedTemplate.defaults.calculator_recovery_rate * 100))
  const [showAssumptionsEditor, setShowAssumptionsEditor] = useState(false)
  const [animateResult, setAnimateResult] = useState(false)

  useEffect(() => {
    setRecoveryPercent(Math.round(selectedTemplate.defaults.calculator_recovery_rate * 100))
  }, [selectedTemplate.defaults.calculator_recovery_rate])

  const adaptivePlan = useMemo(
    () =>
      buildBehaviorPlan({
        merchantType: selectedTemplate.id,
        avgFrequency: selectedTemplate.defaults.average_frequency,
        basketValue: avgValue,
        inactivityRate: percentToRate(inactivePercent),
      }),
    [avgValue, inactivePercent, selectedTemplate.defaults.average_frequency, selectedTemplate.id]
  )

  const result = useMemo(
    () =>
      calculateRecovery({
        clientsPerDay: basePerMonth / DEFAULT_DAYS_OPEN,
        avgTicket: avgValue,
        returnLossRate: percentToRate(inactivePercent),
        recoveryRate: percentToRate(recoveryPercent),
      }),
    [avgValue, basePerMonth, inactivePercent, recoveryPercent]
  )

  const monthlyValueFromOneReturnDaily = useMemo(() => avgValue * DEFAULT_DAYS_OPEN, [avgValue])
  const returnsPerDayToCoverMonthly = useMemo(
    () => (avgValue > 0 ? MONTHLY_PLAN_PRICE / (DEFAULT_DAYS_OPEN * avgValue) : 0),
    [avgValue]
  )

  useEffect(() => {
    setAnimateResult(true)
    const timer = window.setTimeout(() => setAnimateResult(false), 220)

    return () => window.clearTimeout(timer)
  }, [result.extraRevenue])

  const handleCalculatorChange = (label: string, value: number | string) => {
    trackEvent("calculator_change", { field: label, value, audience: "clients", templateId: selectedTemplate.id })
  }

  return (
    <Card className="relative overflow-hidden border-[#C6CEC2] bg-gradient-to-b from-[#FFFEFB] to-[#F6F6F0] p-5 shadow-[0_30px_70px_-55px_rgba(23,58,46,0.75)] sm:p-8">
      <div className="absolute right-[-80px] top-[-120px] h-[220px] w-[220px] rounded-full bg-[#EAF0E6] blur-2xl" />

      <div className="relative">
        <p className="text-xs uppercase tracking-[0.16em] text-[#5C655E]">Calculateur de retour · {entryModeLabel ?? "Commerce"}</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[#16372C] sm:text-4xl">Ce que vous pouvez récupérer chaque mois</h2>
        <p className="mt-2 max-w-3xl text-sm text-[#5C655E]">
          Le trafic existe déjà. Cardin estime ce qui se perd entre deux visites et propose la bonne dynamique pour relancer le retour.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
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
                <p className="text-lg font-medium text-[#16372C]">{avgValue} €</p>
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
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#CCD3C9] bg-[#FEFEFA] p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Potentiel récupérable estimé</p>
              <p
                className={[
                  "mt-2 font-serif text-4xl text-[#153428] transition-transform duration-200 sm:text-5xl",
                  animateResult ? "scale-[1.015]" : "scale-100",
                ].join(" ")}
              >
                +{formatEuro(result.extraRevenue)} / mois
              </p>
              <p className="mt-2 text-sm text-[#5C655E]">1 retour par jour représente environ {formatEuro(monthlyValueFromOneReturnDaily)} / mois.</p>
              <p className="mt-2 text-sm text-[#2A3F35]">Seuil de rentabilité Cardin : atteint en quelques retours.</p>

              <div className="mt-4 border-t border-[#D9DDD6] pt-3">
                <p className="text-xs text-[#5A645D]">Hypothèses : {DEFAULT_DAYS_OPEN} jours ouverts / mois · retour visé {recoveryPercent}%</p>
                <button
                  className="mt-2 text-xs font-medium text-[#173A2E] underline-offset-2 hover:underline"
                  onClick={() => setShowAssumptionsEditor((prev) => !prev)}
                  type="button"
                >
                  {showAssumptionsEditor ? "Masquer" : "Ajuster les hypothèses"}
                </button>

                {showAssumptionsEditor ? (
                  <div className="mt-3">
                    <div className="mb-2 flex items-end justify-between gap-3">
                      <p className="text-sm text-[#2A3F35]">Taux de retour visé</p>
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
                    <p className="mt-2 text-xs text-[#5A645D]">Seuil calculé actuel : {returnsPerDayToCoverMonthly.toFixed(2)} retour/jour.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-[#CCD3C9] bg-[#F4F7F0] p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Pour cette activité, Cardin recommande</p>
              <div className="mt-4 space-y-3">
                {adaptivePlan.calculatorRecommendations.map((recommendation) => (
                  <div className="rounded-2xl border border-[#D7DED4] bg-[#FEFEFA] p-4" key={recommendation.title}>
                    <p className="text-sm font-medium text-[#173A2E]">{recommendation.title}</p>
                    <p className="mt-1 text-sm text-[#556159]">{recommendation.detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-[#2A3F35]">Point de départ : {selectedTemplate.pointOfDeparture}</p>
              <p className="mt-2 text-xs text-[#556159]">{adaptivePlan.movementPromise}</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-3 mt-6 flex flex-col gap-3 sm:static sm:flex-row sm:items-center">
          <Link className="sm:flex-1" href={ctaHref} onClick={() => trackEvent("calculator_cta", { extraRevenue: Math.round(result.extraRevenue), templateId: selectedTemplate.id })}>
            <Button className="w-full" size="lg">
              Lancer ma carte
            </Button>
          </Link>
          <Link className="text-sm font-medium text-[#16372C] underline-offset-4 hover:underline" href="#activity-selection">
            Voir les recommandations &rarr;
          </Link>
        </div>
      </div>
    </Card>
  )
}
