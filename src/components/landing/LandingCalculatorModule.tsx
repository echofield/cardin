"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { calculateRecovery, DEFAULT_DAYS_OPEN, formatEuro, percentToRate } from "@/lib/calculator"
import { Button, Card, Slider } from "@/ui"

type AudienceMode = "clients" | "members"

type LandingCalculatorModuleProps = {
  ctaHref: string
  defaultAudience?: AudienceMode
  entryModeLabel?: string
}

const MONTHLY_PLAN_PRICE = 39

export function LandingCalculatorModule({ ctaHref, defaultAudience = "clients", entryModeLabel }: LandingCalculatorModuleProps) {
  const [audience, setAudience] = useState<AudienceMode>(defaultAudience)
  const [basePerMonth, setBasePerMonth] = useState(1200)
  const [avgValue, setAvgValue] = useState(12)
  const [inactivePercent, setInactivePercent] = useState(32)
  const [recoveryPercent, setRecoveryPercent] = useState(22)
  const [showAssumptionsEditor, setShowAssumptionsEditor] = useState(false)
  const [animateResult, setAnimateResult] = useState(false)

  useEffect(() => {
    setAudience(defaultAudience)
  }, [defaultAudience])

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
    trackEvent("calculator_change", { field: label, value, audience })
  }

  const baseLabel = audience === "clients" ? "Clients actifs / mois" : "Membres actifs / mois"
  const valueLabel = audience === "clients" ? "Panier moyen" : "Valeur moyenne / membre"
  const inactivityLabel = audience === "clients" ? "% de clients inactifs" : "% de membres inactifs"

  return (
    <Card className="relative overflow-hidden border-[#C6CEC2] bg-gradient-to-b from-[#FFFEFB] to-[#F6F6F0] p-5 shadow-[0_30px_70px_-55px_rgba(23,58,46,0.75)] sm:p-8">
      <div className="absolute right-[-80px] top-[-120px] h-[220px] w-[220px] rounded-full bg-[#EAF0E6] blur-2xl" />

      <div className="relative">
        <p className="text-xs uppercase tracking-[0.16em] text-[#5C655E]">Calculateur de retour · {entryModeLabel ?? "Commerce"}</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[#16372C] sm:text-4xl">
          Les points déclenchent une transaction.
          <br />
          Ici, on mesure les retours.
        </h2>
        <p className="mt-2 text-sm text-[#5C655E]">
          Base clients ou base membres. Même logique:
          <br />
          inactifs × valeur moyenne × retour visé.
        </p>

        <div className="mt-6 inline-flex rounded-full border border-[#CDD5CB] bg-[#F8FAF5] p-1">
          <button
            className={[
              "rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition",
              audience === "clients" ? "bg-[#173A2E] text-[#FBFAF6]" : "text-[#4E5A52]",
            ].join(" ")}
            onClick={() => {
              setAudience("clients")
              handleCalculatorChange("audience", "clients")
            }}
            type="button"
          >
            Clients
          </button>
          <button
            className={[
              "rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition",
              audience === "members" ? "bg-[#173A2E] text-[#FBFAF6]" : "text-[#4E5A52]",
            ].join(" ")}
            onClick={() => {
              setAudience("members")
              handleCalculatorChange("audience", "members")
            }}
            type="button"
          >
            Membres
          </button>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <p className="text-sm text-[#2A3F35]">{baseLabel}</p>
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
              <p className="text-sm text-[#2A3F35]">{valueLabel}</p>
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
              <p className="text-sm text-[#2A3F35]">{inactivityLabel}</p>
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

        <div className="mt-8 rounded-2xl border border-[#CCD3C9] bg-[#FEFEFA] p-5">
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

        <div className="sticky bottom-3 mt-6 flex flex-col gap-3 sm:static sm:flex-row sm:items-center">
          <Link
            className="sm:flex-1"
            href={ctaHref}
            onClick={() => trackEvent("calculator_cta", { extraRevenue: Math.round(result.extraRevenue), audience })}
          >
            <Button className="w-full" size="lg">
              Activer ma boucle de retour
            </Button>
          </Link>
          <Link className="text-sm font-medium text-[#16372C] underline-offset-4 hover:underline" href="#experience-templates">
            Voir les mécaniques &rarr;
          </Link>
        </div>
      </div>
    </Card>
  )
}
