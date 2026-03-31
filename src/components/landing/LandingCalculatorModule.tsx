"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { calculateRecovery, DEFAULT_DAYS_OPEN, formatEuro, percentToRate } from "@/lib/calculator"
import { Button, Card, Slider } from "@/ui"

type LandingCalculatorModuleProps = {
  ctaHref: string
}

export function LandingCalculatorModule({ ctaHref }: LandingCalculatorModuleProps) {
  const [clientsPerDay, setClientsPerDay] = useState(100)
  const [avgTicket, setAvgTicket] = useState(10)
  const [returnLossPercent, setReturnLossPercent] = useState(30)
  const [recoveryPercent, setRecoveryPercent] = useState(20)
  const [showAssumptionsEditor, setShowAssumptionsEditor] = useState(false)
  const [animateResult, setAnimateResult] = useState(false)

  const result = useMemo(
    () =>
      calculateRecovery({
        clientsPerDay,
        avgTicket,
        returnLossRate: percentToRate(returnLossPercent),
        recoveryRate: percentToRate(recoveryPercent),
      }),
    [avgTicket, clientsPerDay, recoveryPercent, returnLossPercent]
  )

  useEffect(() => {
    setAnimateResult(true)
    const timer = window.setTimeout(() => setAnimateResult(false), 220)

    return () => window.clearTimeout(timer)
  }, [result.extraRevenue])

  const handleCalculatorChange = (label: string, value: number) => {
    trackEvent("calculator_change", { field: label, value })
  }

  return (
    <Card className="relative overflow-hidden border-[#C6CEC2] bg-gradient-to-b from-[#FFFEFB] to-[#F6F6F0] p-5 shadow-[0_30px_70px_-55px_rgba(23,58,46,0.75)] sm:p-8">
      <div className="absolute right-[-80px] top-[-120px] h-[220px] w-[220px] rounded-full bg-[#EAF0E6] blur-2xl" />

      <div className="relative">
        <p className="text-xs uppercase tracking-[0.16em] text-[#5C655E]">Calculateur</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[#16372C] sm:text-4xl">Ce que vous perdez chaque mois</h2>
        <p className="mt-2 text-sm text-[#5C655E]">Ce que vous laissez sur la table, puis ce que vous pouvez récupérer dès ce mois.</p>

        <div className="mt-8 space-y-6">
          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <p className="text-sm text-[#2A3F35]">Clients / jour</p>
              <p className="text-lg font-medium text-[#16372C]">{clientsPerDay}</p>
            </div>
            <Slider
              max={260}
              min={10}
              onChange={(value) => {
                setClientsPerDay(value)
                handleCalculatorChange("clients_per_day", value)
              }}
              value={clientsPerDay}
            />
          </div>

          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <p className="text-sm text-[#2A3F35]">Panier moyen</p>
              <p className="text-lg font-medium text-[#16372C]">{avgTicket} €</p>
            </div>
            <Slider
              max={70}
              min={5}
              onChange={(value) => {
                setAvgTicket(value)
                handleCalculatorChange("avg_ticket", value)
              }}
              value={avgTicket}
            />
          </div>

          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <p className="text-sm text-[#2A3F35]">% de clients qui ne reviennent pas</p>
              <p className="text-lg font-medium text-[#16372C]">{returnLossPercent}%</p>
            </div>
            <Slider
              max={80}
              min={10}
              onChange={(value) => {
                setReturnLossPercent(value)
                handleCalculatorChange("return_loss_percent", value)
              }}
              value={returnLossPercent}
            />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#CCD3C9] bg-[#FEFEFA] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Récupérables dès ce mois</p>
          <p
            className={[
              "mt-2 font-serif text-4xl text-[#153428] transition-transform duration-200 sm:text-5xl",
              animateResult ? "scale-[1.015]" : "scale-100",
            ].join(" ")}
          >
            +{formatEuro(result.extraRevenue)} / mois récupérables
          </p>
          <p className="mt-2 text-sm text-[#5C655E]">Sans publicité. Sans effort.</p>
          <p className="mt-2 text-sm text-[#2A3F35]">Rentabilisé avec 1 client en plus par jour.</p>

          <div className="mt-4 border-t border-[#D9DDD6] pt-3">
            <p className="text-xs text-[#5A645D]">Hypothèses: {DEFAULT_DAYS_OPEN} jours ouverts / mois · taux de récupération {recoveryPercent}%</p>
            <button
              className="mt-2 text-xs font-medium text-[#173A2E] underline-offset-2 hover:underline"
              onClick={() => setShowAssumptionsEditor((prev) => !prev)}
              type="button"
            >
              {showAssumptionsEditor ? "Masquer" : "Personnaliser"}
            </button>

            {showAssumptionsEditor ? (
              <div className="mt-3">
                <div className="mb-2 flex items-end justify-between gap-3">
                  <p className="text-sm text-[#2A3F35]">Taux de récupération</p>
                  <p className="text-sm font-medium text-[#16372C]">{recoveryPercent}%</p>
                </div>
                <Slider
                  max={40}
                  min={8}
                  onChange={(value) => {
                    setRecoveryPercent(value)
                    handleCalculatorChange("recovery_percent", value)
                  }}
                  value={recoveryPercent}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="sticky bottom-3 mt-6 flex flex-col gap-3 sm:static sm:flex-row sm:items-center">
          <Link
            className="sm:flex-1"
            href={ctaHref}
            onClick={() => trackEvent("calculator_cta", { extraRevenue: Math.round(result.extraRevenue) })}
          >
            <Button className="w-full" size="lg">
              Installer maintenant — 119€
            </Button>
          </Link>
          <Link className="text-sm font-medium text-[#16372C] underline-offset-4 hover:underline" href="/engine">
            Voir le moteur de fidélité
          </Link>
        </div>
      </div>
    </Card>
  )
}
