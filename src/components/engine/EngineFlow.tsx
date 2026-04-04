"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { InstallLeadForm } from "@/components/landing/InstallLeadForm"
import { trackEvent } from "@/lib/analytics"
import { calculateRecovery, formatEuro, percentToRate } from "@/lib/calculator"
import { getTemplateById, merchantTemplates, type MerchantTemplate } from "@/lib/merchant-templates"
import { Button, Card, Input, Slider } from "@/ui"

import { MerchantTemplateSelector } from "./MerchantTemplateSelector"
import { WalletPassPreview } from "./WalletPassPreview"

type EngineStep = 1 | 2 | 3 | 4

type MidpointMode = "recognition_only" | "recognition_plus_boost"
type ObjectiveHintId = "return" | "domino" | "rare"

type EngineFlowProps = {
  initialObjectiveId?: string
  initialTemplateId?: string
}

const assumptionsByFrequency = {
  high: { clients: 120, avgTicket: 9, lossRatePercent: 28 },
  medium: { clients: 85, avgTicket: 17, lossRatePercent: 32 },
  low: { clients: 35, avgTicket: 39, lossRatePercent: 36 },
}

const objectiveHints: Record<ObjectiveHintId, { label: string; description: string }> = {
  return: {
    label: "Faire revenir plus souvent",
    description: "On part d'un programme simple qui raccourcit le temps entre deux visites.",
  },
  domino: {
    label: "Faire venir plus de monde",
    description: "On garde une base simple, puis le domino peut venir accelerer la circulation.",
  },
  rare: {
    label: "Creer quelque chose de rare",
    description: "On commence lisible, puis on pourra monter vers un privilège plus exceptionnel.",
  },
}

const midpointOptions: Array<{
  id: MidpointMode
  label: string
  description: string
}> = [
  {
    id: "recognition_only",
    label: "Reconnaissance simple",
    description: "Le client voit qu'il avance. La carte reste tres lisible en caisse.",
  },
  {
    id: "recognition_plus_boost",
    label: "Cap intermediaire + boost",
    description: "Un jalon visible relance l'envie avant la recompense finale.",
  },
]

const setupLines = [
  "QR de scan pret pour la boutique",
  "Carte Apple Wallet / Google Wallet cote client",
  "Tableau marchand avec suivi des passages",
]

export function EngineFlow({ initialObjectiveId, initialTemplateId }: EngineFlowProps) {
  const initialTemplate = getTemplateById(initialTemplateId ?? merchantTemplates[0].id)
  const initialAssumptions = assumptionsByFrequency[initialTemplate.defaults.average_frequency]
  const hasPreselectedTemplate = Boolean(initialTemplateId)
  const initialObjectiveHint =
    initialObjectiveId && initialObjectiveId in objectiveHints
      ? objectiveHints[initialObjectiveId as ObjectiveHintId]
      : undefined

  const [step, setStep] = useState<EngineStep>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<MerchantTemplate>(initialTemplate)
  const [showTemplateSelector, setShowTemplateSelector] = useState(!hasPreselectedTemplate)
  const [targetVisits, setTargetVisits] = useState(initialTemplate.defaults.target_visits)
  const [rewardLabel, setRewardLabel] = useState(initialTemplate.defaults.reward_label)
  const [midpointMode, setMidpointMode] = useState<MidpointMode>("recognition_only")
  const [clientsPerDay, setClientsPerDay] = useState(initialAssumptions.clients)
  const [avgTicket, setAvgTicket] = useState(initialAssumptions.avgTicket)
  const [lossRatePercent, setLossRatePercent] = useState(initialAssumptions.lossRatePercent)

  const monthlyProjection = useMemo(
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
  const reminderDelayDays = selectedTemplate.defaults.reminder_delay_days
  const notificationLabel =
    reminderDelayDays <= 14
      ? "Votre prochaine etape vous attend"
      : `Retour conseille sous ${Math.max(2, Math.round(reminderDelayDays / 7))} semaines`

  const midpointSummary =
    midpointMode === "recognition_plus_boost"
      ? "Cap intermediaire visible avant la recompense finale."
      : "Progression simple, sans etape supplementaire cote client."

  const canGoBack = step > 1
  const canGoNext = step < 4

  const applyTemplate = (template: MerchantTemplate) => {
    setSelectedTemplate(template)
    setTargetVisits(template.defaults.target_visits)
    setRewardLabel(template.defaults.reward_label)

    const nextAssumptions = assumptionsByFrequency[template.defaults.average_frequency]
    setClientsPerDay(nextAssumptions.clients)
    setAvgTicket(nextAssumptions.avgTicket)
    setLossRatePercent(nextAssumptions.lossRatePercent)

    if (hasPreselectedTemplate) {
      setShowTemplateSelector(false)
    }
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
      midpointMode,
    })

    setStep((prev) => {
      if (prev === 1) return 2
      if (prev === 2) return 3
      if (prev === 3) return 4
      return 4
    })
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-4 flex items-center justify-between">
        <Link className="text-sm text-[#173A2E] underline-offset-4 hover:underline" href="/landing">
          Retour a la landing
        </Link>
      </div>

      <div className="rounded-3xl border border-[#D7DDD2] bg-[#FFFEFB] p-4 shadow-[0_20px_60px_-45px_rgba(23,58,46,0.7)] sm:p-6 lg:p-10">
        <header className="border-b border-[#E0E4DB] pb-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[#6B746D]">QR + carte wallet + tableau marchand</p>
          <h1 className="mt-2 font-serif text-4xl text-[#173A2E]">Construisez votre carte en 4 etapes</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#556159]">
            La facade reste simple. Cardin prepare ensuite le QR, la carte Wallet et l'espace marchand avec la configuration choisie.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-4">
            {["Activite", "Configuration", "Apercu", "Activation"].map((label, index) => {
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

        <div className="mt-8 min-h-[560px]">
          {step === 1 ? (
            <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-serif text-3xl text-[#173A2E]">
                      {hasPreselectedTemplate && !showTemplateSelector ? "Votre activite est deja choisie" : "Choisissez votre activite"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-[#58625C]">
                      {hasPreselectedTemplate && !showTemplateSelector
                        ? "On reprend le lieu choisi sur la landing. Vous pouvez le changer si besoin, sans repasser par toute la grille."
                        : "Cardin part d'un point de depart simple pour votre rythme de clientele, puis le backend prend le relais pour le QR et la carte wallet."}
                    </p>
                  </div>

                  {hasPreselectedTemplate && !showTemplateSelector ? (
                    <Button onClick={() => setShowTemplateSelector(true)} variant="subtle">
                      Changer le lieu
                    </Button>
                  ) : null}
                </div>

                <div className="mt-6">
                  {hasPreselectedTemplate && !showTemplateSelector ? (
                    <Card className="p-6">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Activite retenue</p>
                      <p className="mt-3 font-serif text-4xl text-[#173A2E]">{selectedTemplate.label}</p>
                      <p className="mt-3 max-w-2xl text-sm text-[#556159]">{selectedTemplate.description}</p>

                      {initialObjectiveHint ? (
                        <div className="mt-5 rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Intention conservee</p>
                          <p className="mt-2 text-base font-medium text-[#173A2E]">{initialObjectiveHint.label}</p>
                          <p className="mt-2 text-sm text-[#556159]">{initialObjectiveHint.description}</p>
                        </div>
                      ) : null}

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Ce que Cardin travaille</p>
                          <div className="mt-3 space-y-2 text-sm text-[#203B31]">
                            {selectedTemplate.needs.map((need) => (
                              <p key={need}>{need}</p>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Point de depart</p>
                          <p className="mt-3 text-sm font-medium text-[#173A2E]">{selectedTemplate.pointOfDeparture}</p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div>
                      {hasPreselectedTemplate ? (
                        <div className="mb-4 flex justify-end">
                          <Button onClick={() => setShowTemplateSelector(false)} variant="subtle">
                            Garder {selectedTemplate.label}
                          </Button>
                        </div>
                      ) : null}

                      <MerchantTemplateSelector onSelect={applyTemplate} selectedTemplateId={selectedTemplate.id} />
                    </div>
                  )}
                </div>
              </div>

              <Card className="p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Point de depart recommande</p>
                <p className="mt-3 font-serif text-3xl text-[#173A2E]">{selectedTemplate.pointOfDeparture}</p>
                <p className="mt-3 text-sm text-[#556159]">{selectedTemplate.description}</p>

                <div className="mt-6 space-y-3 rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Ce que Cardin travaille d'abord</p>
                  {selectedTemplate.needs.map((need) => (
                    <p className="text-sm text-[#203B31]" key={need}>
                      {need}
                    </p>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Rythme de depart</p>
                  <p className="mt-2 text-sm text-[#203B31]">{selectedTemplate.rhythmLabel}</p>
                </div>
              </Card>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Configurez le programme visible</h2>
              <p className="mt-2 text-sm text-[#58625C]">
                On ne vous fait regler que ce qui sera vraiment stocke pour la mise en place.
              </p>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="space-y-4">
                  <Card className="p-6">
                    <div className="flex justify-between text-sm text-[#173A2E]">
                      <span>Nombre de passages</span>
                      <strong>{targetVisits}</strong>
                    </div>
                    <Slider className="mt-3" max={12} min={3} onChange={setTargetVisits} value={targetVisits} />

                    <label className="mt-6 block text-sm text-[#173A2E]" htmlFor="rewardLabel">
                      Recompense affichee sur la carte
                    </label>
                    <Input id="rewardLabel" onChange={(event) => setRewardLabel(event.target.value)} value={rewardLabel} />
                  </Card>

                  <div className="grid gap-3">
                    {midpointOptions.map((option) => {
                      const isActive = midpointMode === option.id

                      return (
                        <button className="text-left" key={option.id} onClick={() => setMidpointMode(option.id)} type="button">
                          <Card
                            className={[
                              "p-5 transition",
                              isActive ? "border-[#173A2E] bg-[#F1F5EF]" : "border-[#D6DCD3] hover:border-[#AEB8AB]",
                            ].join(" ")}
                          >
                            <p className="text-base font-medium text-[#173A2E]">{option.label}</p>
                            <p className="mt-1 text-sm text-[#5C655E]">{option.description}</p>
                          </Card>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="p-6">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Resume de mise en place</p>
                    <div className="mt-4 space-y-3 text-sm text-[#203B31]">
                      <p>Activite : {selectedTemplate.label}</p>
                      <p>Carte : {targetVisits} passages pour {rewardLabel}</p>
                      <p>Cap intermediaire : {midpointSummary}</p>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Extensions possibles plus tard</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedTemplate.evolvesTo.map((option) => (
                        <span className="rounded-full border border-[#CDD6CB] bg-[#F4F7F0] px-3 py-1 text-xs text-[#173A2E]" key={option}>
                          {option}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-[#556159]">
                      Le noyau reseau peut venir ensuite. La carte de depart reste volontairement simple.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div>
                <h2 className="font-serif text-3xl text-[#173A2E]">Ce que le client voit</h2>
                <p className="mt-2 text-sm text-[#58625C]">Carte claire, progression visible, aucun compte a creer.</p>

                <WalletPassPreview
                  businessLabel={selectedTemplate.label}
                  caption={midpointSummary}
                  notificationLabel={notificationLabel}
                  progressDots={progressDots}
                  rewardLabel={rewardLabel}
                />
              </div>

              <div className="space-y-4">
                <Card className="p-6">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Ce que vous obtenez deja</p>
                  <div className="mt-4 space-y-3 text-sm text-[#203B31]">
                    {setupLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Cadence visible cote client</p>
                  <p className="mt-3 rounded-2xl border border-[#D6DCD3] bg-[#F8FAF6] px-4 py-3 text-base text-[#173A2E]">
                    {notificationLabel}
                  </p>
                  <p className="mt-3 text-sm text-[#5C655E]">Point de depart : {selectedTemplate.pointOfDeparture}</p>
                </Card>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Projection et activation</h2>
              <p className="mt-2 text-sm text-[#58625C]">
                Chiffrez l'ordre de grandeur, puis lancez directement l'espace marchand avec la configuration ci-dessus.
              </p>

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
                    <strong>{avgTicket} EUR</strong>
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

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-5">
                  <Card className="border-[#BBC8BC] bg-[#F2F7EF] p-6">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#607067]">Ce que vous pouvez recuperer des ce mois</p>
                    <p className="mt-2 font-serif text-5xl text-[#173A2E]">+{formatEuro(monthlyProjection.extraRevenue)} / mois</p>
                    <p className="mt-3 text-base text-[#2E4339]">{Math.round(monthlyProjection.recoveredClients)} clients recuperes / mois</p>
                    <p className="mt-3 text-sm text-[#4F5E55]">Base calculee sur le rythme de {selectedTemplate.label.toLowerCase()} et le taux de recuperation de depart de Cardin.</p>
                  </Card>

                  <Card className="p-6">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Configuration envoyee</p>
                    <div className="mt-4 space-y-2 text-sm text-[#203B31]">
                      <p>Activite : {selectedTemplate.label}</p>
                      <p>Programme : {targetVisits} passages pour {rewardLabel}</p>
                      <p>Cap intermediaire : {midpointSummary}</p>
                    </div>
                  </Card>
                </div>

                <InstallLeadForm
                  activityTemplateId={selectedTemplate.id}
                  description="Cardin cree l'espace marchand, le QR et le parcours client avec la configuration choisie ci-dessus."
                  embedded
                  midpointMode={midpointMode}
                  rewardLabel={rewardLabel}
                  targetVisits={targetVisits}
                  title="Lancer votre carte en boutique"
                />
              </div>
            </div>
          ) : null}
        </div>

        <footer className="mt-8 flex flex-col gap-3 border-t border-[#E0E4DB] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>{canGoBack ? <Button onClick={goToPreviousStep} variant="subtle">Retour</Button> : null}</div>

          <div className="flex items-center gap-3">
            {canGoNext ? <Button onClick={goToNextStep}>Continuer</Button> : <Button onClick={() => setStep(1)}>Revoir depuis le debut</Button>}
          </div>
        </footer>
      </div>
    </section>
  )
}
