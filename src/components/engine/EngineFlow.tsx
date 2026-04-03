"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { buildBehaviorPlan } from "@/lib/behavior-engine"
import { calculateRecovery, formatEuro, percentToRate } from "@/lib/calculator"
import { merchantTemplates, type MerchantTemplate } from "@/lib/merchant-templates"
import { Button, Card, Input, Slider } from "@/ui"

import { ActivityRecommendationBlock } from "./ActivityRecommendationBlock"
import { MerchantTemplateSelector } from "./MerchantTemplateSelector"
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

  const result = useMemo(
    () =>
      calculateRecovery({
        clientsPerDay,
        avgTicket,
        returnLossRate: percentToRate(lossRatePercent),
        recoveryRate: selectedTemplate.defaults.calculator_recovery_rate,
      }),
    [avgTicket, clientsPerDay, lossRatePercent, selectedTemplate.defaults.calculator_recovery_rate]
  )

  const progressDots = Math.max(4, Math.min(targetVisits, 10))
  const notificationText =
    reminderDelayDays <= 14
      ? "Votre prochaine étape vous attend"
      : `Retour conseillé sous ${Math.round(reminderDelayDays / 7)} semaines`

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
      `Point de départ: ${targetVisits} passages -> ${rewardLabel}`,
      `Relance automatique: ${reminderDelayDays} jours`,
      `Fenêtre avant relance: ${expirationDays} jours`,
      `Projection: +${formatEuro(result.extraRevenue)} / mois`,
      `Clients récupérés: ${Math.round(result.recoveredClients)} / mois`,
      `Recommandation 1: ${behaviorPlan.recommendations[0].title}`,
      `Recommandation 2: ${behaviorPlan.recommendations[1].title}`,
      `Recommandation 3: ${behaviorPlan.recommendations[2].title}`,
    ]

    let y = 40
    lines.forEach((line) => {
      doc.text(line, 14, y)
      y += 8
    })

    doc.save(`cardin-brief-${selectedTemplate.id}.pdf`)

    trackEvent("download_setup_brief", {
      templateId: selectedTemplate.id,
      projectedRevenue: Math.round(result.extraRevenue),
    })
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
          <p className="mt-3 max-w-3xl text-sm text-[#556159]">Choisissez l'activité. Cardin propose le bon point de départ, puis montre comment faire évoluer le retour.</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-4">
            {["Activité", "Point de départ", "Dans le téléphone", "Projection"].map((label, index) => {
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
              <h2 className="font-serif text-3xl text-[#173A2E]">Point de départ de votre carte</h2>
              <p className="mt-2 text-sm text-[#58625C]">Vous posez une première mécanique claire. Cardin prépare déjà la suite derrière la carte.</p>

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

                  <div className="mt-6 flex justify-between text-sm text-[#173A2E]">
                    <span>Fenêtre avant relance</span>
                    <strong>{expirationDays} jours</strong>
                  </div>
                  <Slider className="mt-3" max={60} min={7} onChange={setExpirationDays} value={expirationDays} />
                </Card>

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
                  <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Gain du mois</p>
                  <p className="mt-2 text-sm text-[#173A2E]">{behaviorPlan.monthlyEvent}</p>
                  <p className="mt-2 text-xs text-[#5C655E]">Activable ensuite pour créer un désir plus fort autour de la carte.</p>
                </div>
              </Card>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Projection de retour</h2>
              <p className="mt-2 text-sm text-[#58625C]">Cardin chiffre le revenu récupérable et indique le bon ordre de lancement pour votre activité.</p>

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
                  <p className="mt-2 font-serif text-5xl text-[#173A2E]">+{formatEuro(result.extraRevenue)} / mois</p>
                  <p className="mt-3 text-base text-[#2E4339]">{Math.round(result.recoveredClients)} clients récupérés / mois</p>
                  <p className="mt-3 text-sm text-[#4F5E55]">Rentabilisé avec 1 client en plus par jour.</p>

                  <div className="mt-5">
                    <Button onClick={downloadSetupBrief} variant="secondary">
                      Télécharger le brief PDF
                    </Button>
                  </div>
                </Card>

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
                  <p className="mt-2 text-xs text-[#556159]">{behaviorPlan.invitationLayer}</p>
                </Card>
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
            {canGoNext ? (
              <Button onClick={goToNextStep}>Continuer</Button>
            ) : (
              <Button onClick={() => setStep(1)}>Revoir la carte</Button>
            )}
          </div>
        </footer>
      </div>
    </section>
  )
}
