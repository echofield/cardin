"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { InstallLeadForm } from "@/components/landing/InstallLeadForm"
import { trackEvent } from "@/lib/analytics"
import { calculateRecovery, formatEuro, percentToRate } from "@/lib/calculator"
import { getTemplateById, merchantTemplates, type MerchantTemplate } from "@/lib/merchant-templates"
import { cardinSeasonLaw, getSummitPreset, normalizeSeasonLength } from "@/lib/season-law"
import { Button, Card, Input, Slider } from "@/ui"

import { getSeasonFrameForTemplateId } from "@/lib/merchant-season-framing"

import { MerchantTemplateSelector } from "./MerchantTemplateSelector"
import { WalletPassPreview } from "./WalletPassPreview"
import { applyObjectiveToAssumptions, buildObjectiveScenario, objectiveHints, normalizeObjectiveId, type MidpointMode } from "./objective-scenarios"

type EngineFlowProps = {
  initialObjectiveId?: string
  initialSeasonLength?: string
  initialSummitId?: string
  initialTemplateId?: string
}

const assumptionsByFrequency = {
  high: { clients: 120, avgTicket: 9, lossRatePercent: 28 },
  medium: { clients: 85, avgTicket: 17, lossRatePercent: 32 },
  low: { clients: 35, avgTicket: 39, lossRatePercent: 36 },
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
  "QR de scan prêt pour le lieu",
  "Carte Apple Wallet / Google Wallet côté client",
  "Tableau marchand : saison, passages et missions",
]

const engineSteps = [
  { id: 1, label: "Activite" },
  { id: 2, label: "Configuration" },
  { id: 3, label: "Apercu" },
  { id: 4, label: "Activation" },
] as const

type EngineStep = (typeof engineSteps)[number]["id"]

export function EngineFlow({ initialObjectiveId, initialSeasonLength, initialSummitId, initialTemplateId }: EngineFlowProps) {
  const selectedObjectiveId = normalizeObjectiveId(initialObjectiveId)
  const initialTemplate = getTemplateById(initialTemplateId ?? merchantTemplates[0].id)
  const initialScenario = buildObjectiveScenario(initialTemplate, selectedObjectiveId)
  const initialAssumptions = applyObjectiveToAssumptions(
    assumptionsByFrequency[initialTemplate.defaults.average_frequency],
    selectedObjectiveId
  )
  const hasPreselectedTemplate = Boolean(initialTemplateId)
  const initialObjectiveHint = objectiveHints[selectedObjectiveId]
  const initialSeason = normalizeSeasonLength(initialSeasonLength)
  const initialSummit = getSummitPreset(initialTemplate.id, initialSummitId)

  const [step, setStep] = useState<EngineStep>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<MerchantTemplate>(initialTemplate)
  const [seasonLength] = useState(initialSeason)
  const [selectedSummitId, setSelectedSummitId] = useState(initialSummit.id)
  const [showTemplateSelector, setShowTemplateSelector] = useState(!hasPreselectedTemplate)
  const [targetVisits, setTargetVisits] = useState(initialScenario.targetVisits)
  const [rewardLabel, setRewardLabel] = useState(initialScenario.rewardLabel)
  const [midpointMode, setMidpointMode] = useState<MidpointMode>(initialScenario.midpointMode)
  const [clientsPerDay, setClientsPerDay] = useState(initialAssumptions.clients)
  const [avgTicket, setAvgTicket] = useState(initialAssumptions.avgTicket)
  const [lossRatePercent, setLossRatePercent] = useState(initialAssumptions.lossRatePercent)

  const selectedScenario = useMemo(
    () => buildObjectiveScenario(selectedTemplate, selectedObjectiveId),
    [selectedObjectiveId, selectedTemplate]
  )

  const selectedSummit = useMemo(() => getSummitPreset(selectedTemplate.id, selectedSummitId), [selectedSummitId, selectedTemplate.id])
  const seasonLabel = seasonLength === 6 ? "Saison 6 mois" : "Saison 3 mois"
  const seasonNarrative =
    seasonLength === 6
      ? "Cycle long pour laisser monter Diamond, qualifier le Domino et faire naitre un vrai sommet visible."
      : "Cycle court pour prouver vite le système, faire monter les retours et lancer la saison suivante."

  const seasonFrame = useMemo(() => getSeasonFrameForTemplateId(selectedTemplate.id), [selectedTemplate.id])

  const monthlyProjection = useMemo(
    () =>
      calculateRecovery({
        clientsPerDay,
        avgTicket,
        returnLossRate: percentToRate(lossRatePercent),
        recoveryRate: Math.min(0.45, selectedTemplate.defaults.calculator_recovery_rate * selectedScenario.recoveryMultiplier * selectedSummit.monthlyRecoveredBoost),
      }),
    [avgTicket, clientsPerDay, lossRatePercent, selectedScenario.recoveryMultiplier, selectedSummit.monthlyRecoveredBoost, selectedTemplate.defaults.calculator_recovery_rate]
  )

  const progressDots = Math.max(4, Math.min(targetVisits, 10))
  const notificationLabel = selectedScenario.reminderLabel

  const midpointSummary =
    midpointMode === "recognition_plus_boost"
      ? "Cap intermediaire visible avant la recompense finale."
      : "Progression simple, sans etape supplementaire cote client."

  const currentStepIndex = engineSteps.findIndex(({ id }) => id === step)
  const canGoBack = currentStepIndex > 0
  const canGoNext = currentStepIndex < engineSteps.length - 1

  const applyTemplate = (template: MerchantTemplate) => {
    const scenario = buildObjectiveScenario(template, selectedObjectiveId)
    const nextAssumptions = applyObjectiveToAssumptions(
      assumptionsByFrequency[template.defaults.average_frequency],
      selectedObjectiveId
    )

    setSelectedTemplate(template)
    setTargetVisits(scenario.targetVisits)
    setRewardLabel(scenario.rewardLabel)
    setMidpointMode(scenario.midpointMode)
    setSelectedSummitId(getSummitPreset(template.id).id)
    setClientsPerDay(nextAssumptions.clients)
    setAvgTicket(nextAssumptions.avgTicket)
    setLossRatePercent(nextAssumptions.lossRatePercent)

    if (hasPreselectedTemplate) {
      setShowTemplateSelector(false)
    }
  }

  const goToPreviousStep = () => {
    setStep((prev) => {
      const previousIndex = engineSteps.findIndex(({ id }) => id === prev)
      const safeIndex = previousIndex === -1 ? 0 : previousIndex
      return engineSteps[Math.max(0, safeIndex - 1)].id
    })
  }

  const goToNextStep = () => {
    trackEvent("engine_step_completed", {
      completedStep: step,
      templateId: selectedTemplate.id,
      objectiveId: selectedObjectiveId,
      completedScenario: selectedScenario.label,
      midpointMode,
    })

    setStep((prev) => {
      const previousIndex = engineSteps.findIndex(({ id }) => id === prev)
      const safeIndex = previousIndex === -1 ? 0 : previousIndex
      return engineSteps[Math.min(engineSteps.length - 1, safeIndex + 1)].id
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
          <p className="text-xs uppercase tracking-[0.16em] text-[#6B746D]">QR + carte digitale + tableau marchand</p>
          <h1 className="mt-2 font-serif text-4xl text-[#173A2E]">Construisez votre parcours digital en {engineSteps.length} étapes</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#556159]">
            La façade reste simple. Cardin prépare ensuite le QR d&apos;entrée, la carte digitale (wallet client) et l&apos;espace marchand avec la configuration choisie.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="inline-flex rounded-full border border-[#C5D0C4] bg-[#F2F5EE] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#1B4332]">
              Scenario actif : {selectedScenario.label}
            </div>
            <div className="inline-flex rounded-full border border-[#D4DACF] bg-[#FBFCF8] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#425248]">
              {seasonLabel}
            </div>
            <div className="inline-flex rounded-full border border-[#D4DACF] bg-[#FBFCF8] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#425248]">
              Sommet : {selectedSummit.title}
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-4">
            {engineSteps.map((stepItem) => {
              const isActive = stepItem.id === step
              const isCompleted = stepItem.id < step

              return (
                <button
                  className={[
                    "rounded-full border px-3 py-2 text-center text-sm transition hover:border-[#173A2E]",
                    isActive ? "border-[#173A2E] bg-[#E9F0E7] text-[#173A2E]" : "border-[#D6DCD3] text-[#667068]",
                    isCompleted ? "bg-[#F4F7F0]" : "",
                  ].join(" ")}
                  key={stepItem.id}
                  onClick={() => setStep(stepItem.id)}
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                >
                  {stepItem.id}. {stepItem.label}
                </button>
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
                        : "Cardin part d'un point de départ simple pour votre rythme de clientèle, puis le système prend le relais pour le QR et la carte digitale."}
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
                          <p className="mt-2 text-sm text-[#556159]">{selectedScenario.description}</p>
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
                          <p className="mt-3 text-sm font-medium text-[#173A2E]">{selectedScenario.pointOfDeparture}</p>
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
                <p className="mt-3 font-serif text-3xl text-[#173A2E]">{selectedScenario.pointOfDeparture}</p>
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
                  <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Cadence scenario</p>
                  <p className="mt-2 text-sm text-[#203B31]">{selectedScenario.cadenceLabel}</p>
                </div>

                <div className="mt-4 rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Loi de saison Cardin</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-[#173A2E]">{seasonLabel}</p>
                      <p className="mt-1 text-sm text-[#556159]">{seasonNarrative}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#173A2E]">{selectedSummit.title}</p>
                      <p className="mt-1 text-sm text-[#556159]">{selectedSummit.promise}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#E0E4DB] bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Parcours</p>
                      <p className="mt-2 text-sm text-[#173A2E]">{cardinSeasonLaw.stepCount} etapes</p>
                    </div>
                    <div className="rounded-2xl border border-[#E0E4DB] bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Domino</p>
                      <p className="mt-2 text-sm text-[#173A2E]">Etape {cardinSeasonLaw.dominoStartStep} · 2 invitations puis 1 relai</p>
                    </div>
                    <div className="rounded-2xl border border-[#E0E4DB] bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-[#69736C]">Sommet</p>
                      <p className="mt-2 text-sm text-[#173A2E]">Diamond etape {cardinSeasonLaw.diamondStep} · sommet etape {cardinSeasonLaw.summitStep}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Configurez le programme visible</h2>
              <p className="mt-2 text-sm text-[#58625C]">
                {selectedScenario.growthNote}
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
                      {selectedScenario.rewardFieldLabel}
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
                      <p>Scenario : {selectedScenario.label}</p>
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
                      {selectedScenario.growthNote}
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
                  caption={selectedScenario.growthNote}
                  notificationLabel={notificationLabel}
                  progressDots={progressDots}
                  rewardLabel={rewardLabel}
                  statusLabel={selectedObjectiveId === "rare" ? "Rare" : selectedObjectiveId === "domino" ? "Domino" : "Actif"}
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
                  <p className="mt-3 text-sm text-[#5C655E]">Point de depart : {selectedScenario.pointOfDeparture}</p>
                </Card>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Projection et activation</h2>
              <p className="mt-2 text-sm text-[#58625C]">
                {selectedScenario.projectionCaption}
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
                  {seasonFrame ? (
                    <Card className="border-[#173A2E]/25 bg-[linear-gradient(165deg,#F4F1EA_0%,#E8EDE4_100%)] p-6">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#355246]">Cadrage saison (marché)</p>
                      <p className="mt-2 font-serif text-3xl text-[#173A2E] sm:text-4xl">{seasonFrame.heroBand}</p>
                      <p className="mt-2 text-sm font-medium text-[#2A3F35]">{seasonFrame.calibratedSubline}</p>
                      <p className="mt-2 text-xs text-[#5C655E]">
                        {seasonFrame.floorLabel} · {seasonFrame.upsideLabel}
                      </p>
                    </Card>
                  ) : null}
                  <Card className="border-[#BBC8BC] bg-[#F2F7EF] p-6">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#607067]">Indicateur modèle (cette version)</p>
                    <p className="mt-2 font-serif text-4xl text-[#173A2E] sm:text-5xl">+{formatEuro(monthlyProjection.extraRevenue)} / mois</p>
                    <p className="mt-3 text-base text-[#2E4339]">{Math.round(monthlyProjection.recoveredClients)} clients récupérés / mois</p>
                    <p className="mt-3 text-sm text-[#4F5E55]">{selectedScenario.projectionCaption}</p>
                    <p className="mt-2 text-sm text-[#4F5E55]">{seasonLabel} — Sommet retenu : {selectedSummit.promise}</p>
                  </Card>

                  <Card className="p-6">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Configuration envoyee</p>
                    <div className="mt-4 space-y-2 text-sm text-[#203B31]">
                      <p>Scenario : {selectedScenario.label}</p>
                      <p>Activite : {selectedTemplate.label}</p>
                      <p>Programme : {targetVisits} passages pour {rewardLabel}</p>
                      <p>Cap intermediaire : {midpointSummary}</p>
                    </div>
                  </Card>
                </div>

                <InstallLeadForm
                  activityTemplateId={selectedTemplate.id}
                  description={selectedScenario.activationDescription}
                  embedded
                  midpointMode={midpointMode}
                  rewardLabel={rewardLabel}
                  seasonLength={seasonLength}
                  summitId={selectedSummit.id}
                  summitTitle={selectedSummit.promise}
                  scenarioId={selectedObjectiveId}
                  scenarioLabel={selectedScenario.label}
                  targetVisits={targetVisits}
                  title={selectedScenario.activationTitle}
                />
              </div>
            </div>
          ) : null}
        </div>

        <footer className="mt-8 flex flex-col gap-3 border-t border-[#E0E4DB] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>{canGoBack ? <Button onClick={goToPreviousStep} variant="subtle">Retour</Button> : null}</div>

          <div className="flex items-center gap-3">
            {canGoNext ? <Button onClick={goToNextStep}>Continuer</Button> : <Button onClick={() => setStep(engineSteps[0].id)}>Revoir depuis le debut</Button>}
          </div>
        </footer>
      </div>
    </section>
  )
}

