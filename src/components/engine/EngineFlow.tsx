"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { projectAnnualCardinPlan } from "@/lib/annual-projection-engine"
import { buildCalendarPlan } from "@/lib/calendar-engine"
import { findScenario, buildBehaviorPlan, type BehaviorScenarioId } from "@/lib/behavior-engine"
import { formatEuro, percentToRate } from "@/lib/calculator"
import { merchantTemplates, type MerchantTemplate } from "@/lib/merchant-templates"
import { projectScenarioImpact } from "@/lib/projection-engine"
import { Button, Card, Input, Slider } from "@/ui"

import { ActivityRecommendationBlock } from "./ActivityRecommendationBlock"
import { AnnualProjectionPanel } from "./AnnualProjectionPanel"
import { MerchantTemplateSelector } from "./MerchantTemplateSelector"
import { ScenarioSwitcher } from "./ScenarioSwitcher"
import { WalletPassPreview } from "./WalletPassPreview"

type EngineStep = 1 | 2 | 3 | 4

const assumptionsByFrequency = {
  high: { clients: 120, avgTicket: 9, lossRatePercent: 28 },
  medium: { clients: 85, avgTicket: 17, lossRatePercent: 32 },
  low: { clients: 35, avgTicket: 39, lossRatePercent: 36 },
}

export function EngineFlow() {
  const initialTemplate = merchantTemplates[0]

  const [step, setStep] = useState<EngineStep>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<MerchantTemplate>(initialTemplate)
  const [selectedScenarioId, setSelectedScenarioId] = useState<BehaviorScenarioId>("starting_loop")
  const [targetVisits, setTargetVisits] = useState(initialTemplate.defaults.target_visits)
  const [rewardLabel, setRewardLabel] = useState(initialTemplate.defaults.reward_label)
  const [expirationDays, setExpirationDays] = useState(21)
  const [reminderDelayDays, setReminderDelayDays] = useState(initialTemplate.defaults.reminder_delay_days)

  const [clientsPerDay, setClientsPerDay] = useState(90)
  const [avgTicket, setAvgTicket] = useState(14)
  const [lossRatePercent, setLossRatePercent] = useState(30)

  const behaviorPlan = useMemo(
    () =>
      buildBehaviorPlan({
        merchantType: selectedTemplate.id,
        avgFrequency: selectedTemplate.defaults.average_frequency,
        basketValue: avgTicket,
        inactivityRate: percentToRate(lossRatePercent),
      }),
    [avgTicket, lossRatePercent, selectedTemplate.defaults.average_frequency, selectedTemplate.id]
  )

  useEffect(() => {
    setSelectedScenarioId(behaviorPlan.recommendedScenarioId)
  }, [behaviorPlan.recommendedScenarioId, selectedTemplate.id])

  const selectedScenario = useMemo(() => findScenario(behaviorPlan, selectedScenarioId), [behaviorPlan, selectedScenarioId])
  const monthlyClients = clientsPerDay * 26

  const monthlyProjection = useMemo(
    () =>
      projectScenarioImpact({
        merchantType: selectedTemplate.id,
        scenarioId: selectedScenarioId,
        monthlyClients,
        avgTicket,
        inactivePercent: lossRatePercent,
        baseRecoveryPercent: selectedTemplate.defaults.calculator_recovery_rate * 100,
      }),
    [avgTicket, lossRatePercent, monthlyClients, selectedScenarioId, selectedTemplate.defaults.calculator_recovery_rate, selectedTemplate.id]
  )

  const calendarPlan = useMemo(() => buildCalendarPlan(selectedTemplate.id, selectedScenarioId), [selectedScenarioId, selectedTemplate.id])
  const annualProjection = useMemo(
    () =>
      projectAnnualCardinPlan({
        merchantType: selectedTemplate.id,
        scenarioId: selectedScenarioId,
        monthlyClients,
        avgTicket,
        inactivePercent: lossRatePercent,
        baseRecoveryPercent: selectedTemplate.defaults.calculator_recovery_rate * 100,
      }),
    [avgTicket, lossRatePercent, monthlyClients, selectedScenarioId, selectedTemplate.defaults.calculator_recovery_rate, selectedTemplate.id]
  )

  const progressDots = Math.max(4, Math.min(targetVisits, 10))
  const notificationText = reminderDelayDays <= 14 ? "Votre prochaine étape vous attend" : `Retour conseillé sous ${Math.round(reminderDelayDays / 7)} semaines`

  const canGoBack = step > 1
  const canGoNext = step < 4

  const applyTemplate = (template: MerchantTemplate) => {
    setSelectedTemplate(template)
    setTargetVisits(template.defaults.target_visits)
    setRewardLabel(template.defaults.reward_label)
    setReminderDelayDays(template.defaults.reminder_delay_days)

    const nextAssumptions = assumptionsByFrequency[template.defaults.average_frequency]
    setClientsPerDay(nextAssumptions.clients)
    setAvgTicket(nextAssumptions.avgTicket)
    setLossRatePercent(nextAssumptions.lossRatePercent)
  }

  const goToPreviousStep = () => {
    setStep((prev) => {
      if (prev === 4) return 3
      if (prev === 3) return 2
      if (prev === 2) return 1
      return 1
    })
  }

  const goToNextStep = () => {
    trackEvent("engine_step_completed", {
      completedStep: step,
      templateId: selectedTemplate.id,
      scenarioId: selectedScenarioId,
    })

    setStep((prev) => {
      if (prev === 1) return 2
      if (prev === 2) return 3
      if (prev === 3) return 4
      return 4
    })
  }

  const downloadSetupBrief = async () => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Cardin - Brief de mise en place", 14, 20)
    doc.setFontSize(11)
    doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28)

    const lines = [
      `Activité: ${selectedTemplate.label}`,
      `Scénario: ${selectedScenario.label}`,
      `Point de départ: ${targetVisits} passages -> ${rewardLabel}`,
      `Projection: +${formatEuro(monthlyProjection.monthlyRevenue)} / mois`,
      `Moment à activer: ${calendarPlan.nextMoment.label}`,
      `Annuel: ${formatEuro(annualProjection.annualRevenueMin)} à ${formatEuro(annualProjection.annualRevenueMax)}`,
    ]

    let y = 40
    lines.forEach((line) => {
      doc.text(line, 14, y)
      y += 8
    })

    doc.save(`cardin-brief-${selectedTemplate.id}.pdf`)
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-4 flex items-center justify-between">
        <Link className="text-sm text-[#173A2E] underline-offset-4 hover:underline" href="/landing">
          ← Retour à la landing
        </Link>
      </div>

      <div className="rounded-3xl border border-[#D7DDD2] bg-[#FFFEFB] p-4 shadow-[0_20px_60px_-45px_rgba(23,58,46,0.7)] sm:p-6 lg:p-10">
        <header className="border-b border-[#E0E4DB] pb-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[#6B746D]">Carte physique + moteur de retour</p>
          <h1 className="mt-2 font-serif text-4xl text-[#173A2E]">Mettez votre carte en place en 4 étapes</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#556159]">Choisissez l'activité. Cardin propose le bon point de départ, puis montre comment le retour peut évoluer dans l'année.</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-4">
            {["Activité", "Scénario", "Dans le téléphone", "Projection"].map((label, index) => {
              const current = index + 1
              const isActive = current === step
              const isCompleted = current < step

              return (
                <div
                  className={[
                    "rounded-full border px-3 py-2 text-center text-sm",
                    isActive ? "border-[#173A2E] bg-[#E9F0E7] text-[#173A2E]" : "border-[#D6DCD3] text-[#667068]",
                    isCompleted ? "bg-[#F4F7F0]" : "",
                  ].join(" ")}
                  key={label}
                >
                  {current}. {label}
                </div>
              )
            })}
          </div>
        </header>

        <div className="mt-8 min-h-[540px]">
          {step === 1 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Choisissez votre activité</h2>
              <p className="mt-2 text-sm text-[#58625C]">La carte reste simple. Cardin lit surtout le rythme de retour dont votre activité a besoin.</p>

              <div className="mt-6">
                <MerchantTemplateSelector onSelect={applyTemplate} selectedTemplateId={selectedTemplate.id} />
              </div>

              <div className="mt-6">
                <ActivityRecommendationBlock plan={behaviorPlan} template={selectedTemplate} title="Cardin a compris votre activité. Voici le premier lancement recommandé." />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Choisissez le scénario à lancer</h2>
              <p className="mt-2 text-sm text-[#58625C]">Vous gardez une carte simple en boutique. Cardin travaille ensuite le bon scénario selon le rythme choisi.</p>

              <div className="mt-8">
                <ScenarioSwitcher onChange={setSelectedScenarioId} scenarios={behaviorPlan.scenarios} selectedScenarioId={selectedScenarioId} />
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Card className="p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Visible en boutique</p>

                  <div className="mt-4 flex justify-between text-sm text-[#173A2E]">
                    <span>Nombre de passages</span>
                    <strong>{targetVisits}</strong>
                  </div>
                  <Slider className="mt-3" max={12} min={3} onChange={setTargetVisits} value={targetVisits} />

                  <label className="mt-6 block text-sm text-[#173A2E]" htmlFor="rewardLabel">
                    Récompense affichée sur la carte
                  </label>
                  <Input id="rewardLabel" onChange={(event) => setRewardLabel(event.target.value)} value={rewardLabel} />

                  <div className="mt-6 flex justify-between text-sm text-[#173A2E]">
                    <span>Relance automatique</span>
                    <strong>{reminderDelayDays} jours</strong>
                  </div>
                  <Slider className="mt-3" max={45} min={5} onChange={setReminderDelayDays} value={reminderDelayDays} />

                  <div className="mt-6 rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Scénario choisi</p>
                    <p className="mt-2 text-sm font-medium text-[#173A2E]">{selectedScenario.label}</p>
                    <p className="mt-1 text-sm text-[#556159]">{selectedScenario.detail}</p>
                  </div>
                </Card>

                <div className="space-y-4">
                  <Card className="p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Ce que Cardin ajoute derrière</p>
                    <div className="mt-4 space-y-3">
                      {behaviorPlan.recommendations.map((recommendation) => (
                        <div className="rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4" key={recommendation.title}>
                          <p className="text-sm font-medium text-[#173A2E]">{recommendation.title}</p>
                          <p className="mt-1 text-sm text-[#5C655E]">{recommendation.detail}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-[#203B31]">Point de départ : {selectedTemplate.pointOfDeparture}</p>
                    <p className="mt-2 text-sm text-[#203B31]">{behaviorPlan.movementPromise}</p>
                    <p className="mt-3 text-xs text-[#556159]">{behaviorPlan.invitationLayer}</p>
                  </Card>

                  <Card className="p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Prochain moment recommandé</p>
                    <p className="mt-2 text-lg font-medium text-[#173A2E]">{calendarPlan.nextMoment.label}</p>
                    <p className="mt-1 text-sm text-[#556159]">{calendarPlan.nextMoment.reason}</p>
                  </Card>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="font-serif text-3xl text-[#173A2E]">Dans le téléphone du client</h2>
                <p className="mt-2 text-sm text-[#58625C]">Le client reçoit votre carte, la scanne, puis retrouve sa progression dans son téléphone.</p>

                <WalletPassPreview businessLabel={selectedTemplate.label} progressDots={progressDots} rewardLabel={rewardLabel} />
              </div>

              <Card className="p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Ce qui restera visible</p>
                <p className="mt-3 rounded-2xl border border-[#D6DCD3] bg-[#F8FAF6] px-4 py-3 text-base text-[#173A2E]">{notificationText}</p>
                <p className="mt-3 text-sm text-[#5C655E]">La prochaine étape reste claire, même après la visite.</p>

                <div className="mt-8 space-y-3 text-sm text-[#3B4D43]">
                  <p>1. Carte remise en boutique</p>
                  <p>2. Scan immédiat</p>
                  <p>3. Retour guidé par la progression</p>
                </div>

                <div className="mt-8 rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Scénario visible pour le client</p>
                  <p className="mt-2 text-sm text-[#173A2E]">{selectedScenario.headline}</p>
                  <p className="mt-2 text-xs text-[#5C655E]">{selectedScenario.detail}</p>
                </div>
              </Card>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Projection de retour</h2>
              <p className="mt-2 text-sm text-[#58625C]">Cardin chiffre ce que le scénario choisi peut rapporter ce mois-ci et sur une année complète.</p>

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <Card className="p-5">
                  <div className="flex justify-between text-sm text-[#173A2E]">
                    <span>Clients / jour</span>
                    <strong>{clientsPerDay}</strong>
                  </div>
                  <Slider className="mt-3" max={260} min={10} onChange={setClientsPerDay} value={clientsPerDay} />
                </Card>

                <Card className="p-5">
                  <div className="flex justify-between text-sm text-[#173A2E]">
                    <span>Panier moyen</span>
                    <strong>{avgTicket} €</strong>
                  </div>
                  <Slider className="mt-3" max={80} min={5} onChange={setAvgTicket} value={avgTicket} />
                </Card>

                <Card className="p-5">
                  <div className="flex justify-between text-sm text-[#173A2E]">
                    <span>Clients perdus</span>
                    <strong>{lossRatePercent}%</strong>
                  </div>
                  <Slider className="mt-3" max={80} min={10} onChange={setLossRatePercent} value={lossRatePercent} />
                </Card>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <Card className="border-[#BBC8BC] bg-[#F2F7EF] p-6">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#607067]">Ce que vous pouvez récupérer dès ce mois</p>
                  <p className="mt-2 font-serif text-5xl text-[#173A2E]">+{formatEuro(monthlyProjection.monthlyRevenue)} / mois</p>
                  <p className="mt-3 text-base text-[#2E4339]">{monthlyProjection.monthlyReturns} retours récupérés / mois</p>
                  <p className="mt-3 text-sm text-[#4F5E55]">{monthlyProjection.primaryEffect}</p>

                  <div className="mt-5">
                    <Button onClick={downloadSetupBrief} variant="secondary">
                      Télécharger le brief PDF
                    </Button>
                  </div>
                </Card>

                <div className="space-y-5">
                  <Card className="p-6">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#607067]">Ordre de lancement recommandé</p>
                    <div className="mt-4 space-y-3">
                      {behaviorPlan.calculatorRecommendations.map((recommendation) => (
                        <div className="rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4" key={recommendation.title}>
                          <p className="text-sm font-medium text-[#173A2E]">{recommendation.title}</p>
                          <p className="mt-1 text-sm text-[#556159]">{recommendation.detail}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-[#203B31]">Point de départ : {selectedTemplate.pointOfDeparture}</p>
                    <p className="mt-2 text-xs text-[#556159]">{calendarPlan.quietPeriodLabel}</p>
                  </Card>

                  <AnnualProjectionPanel annualProjection={annualProjection} />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="mt-8 flex flex-col gap-3 border-t border-[#E0E4DB] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {canGoBack ? (
              <Button onClick={goToPreviousStep} variant="subtle">
                Retour
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {canGoNext ? <Button onClick={goToNextStep}>Continuer</Button> : <Button onClick={() => setStep(1)}>Revoir la carte</Button>}
          </div>
        </footer>
      </div>
    </section>
  )
}
