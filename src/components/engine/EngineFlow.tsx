"use client"

import { useMemo, useState } from "react"

import { calculateRecovery, formatEuro, percentToRate } from "@/lib/calculator"
import { merchantTemplates, type MerchantTemplate, type RewardType } from "@/lib/merchant-templates"
import { Button, Card, Input, Slider } from "@/ui"

import { MerchantTemplateSelector } from "./MerchantTemplateSelector"

type EngineStep = 1 | 2 | 3 | 4

type LoyaltyOption = {
  id: RewardType
  label: string
  description: string
}

const loyaltyOptions: LoyaltyOption[] = [
  { id: "stamp", label: "10 cafés → 1 offert", description: "La formule la plus simple à comprendre en caisse." },
  { id: "cashback", label: "Cashback", description: "Un pourcentage rendu en crédit utilisable plus tard." },
  { id: "vip", label: "VIP", description: "Des avantages exclusifs après un seuil de visites." },
  { id: "referral", label: "Parrainage", description: "Le client revient avec un proche et les deux sont récompensés." },
]

const assumptionsByFrequency = {
  high: { clients: 120, avgTicket: 9, lossRatePercent: 28 },
  medium: { clients: 85, avgTicket: 17, lossRatePercent: 32 },
  low: { clients: 35, avgTicket: 39, lossRatePercent: 36 },
}

export function EngineFlow() {
  const initialTemplate = merchantTemplates[0]

  const [step, setStep] = useState<EngineStep>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<MerchantTemplate>(initialTemplate)
  const [rewardType, setRewardType] = useState<RewardType>(initialTemplate.defaults.reward_type)
  const [targetVisits, setTargetVisits] = useState(initialTemplate.defaults.target_visits)
  const [rewardLabel, setRewardLabel] = useState(initialTemplate.defaults.reward_label)
  const [expirationDays, setExpirationDays] = useState(21)
  const [reminderDelayDays, setReminderDelayDays] = useState(initialTemplate.defaults.reminder_delay_days)

  const [clientsPerDay, setClientsPerDay] = useState(90)
  const [avgTicket, setAvgTicket] = useState(14)
  const [lossRatePercent, setLossRatePercent] = useState(30)

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
      ? "On ne vous a pas vu depuis 2 semaines"
      : `On ne vous a pas vu depuis ${Math.round(reminderDelayDays / 7)} semaines`

  const canGoBack = step > 1
  const canGoNext = step < 4

  const goToPreviousStep = () => {
    setStep((prev) => {
      if (prev === 4) return 3
      if (prev === 3) return 2
      if (prev === 2) return 1
      return 1
    })
  }

  const goToNextStep = () => {
    setStep((prev) => {
      if (prev === 1) return 2
      if (prev === 2) return 3
      if (prev === 3) return 4
      return 4
    })
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="rounded-3xl border border-[#D7DDD2] bg-[#FFFEFB] p-4 shadow-[0_20px_60px_-45px_rgba(23,58,46,0.7)] sm:p-6 lg:p-10">
        <header className="border-b border-[#E0E4DB] pb-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[#6B746D]">Moteur de fidélité</p>
          <h1 className="mt-2 font-serif text-4xl text-[#173A2E]">Construisez votre carte en 4 étapes</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#556159]">Simple, concret et calibré pour les commerces physiques. Sécurisé automatiquement.</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-4">
            {["Activité", "Configuration", "Aperçu", "Résultat"].map((label, index) => {
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
              <p className="mt-2 text-sm text-[#58625C]">Nous préparons une carte adaptée à votre rythme de clientèle et à votre type de récompense.</p>

              <div className="mt-6">
                <MerchantTemplateSelector
                  onSelect={(template) => {
                    setSelectedTemplate(template)
                    setRewardType(template.defaults.reward_type)
                    setTargetVisits(template.defaults.target_visits)
                    setRewardLabel(template.defaults.reward_label)
                    setReminderDelayDays(template.defaults.reminder_delay_days)

                    const nextAssumptions = assumptionsByFrequency[template.defaults.average_frequency]
                    setClientsPerDay(nextAssumptions.clients)
                    setAvgTicket(nextAssumptions.avgTicket)
                    setLossRatePercent(nextAssumptions.lossRatePercent)
                  }}
                  selectedTemplateId={selectedTemplate.id}
                />
              </div>

              <p className="mt-6 rounded-2xl border border-[#D5DBD0] bg-[#F5F8F2] px-4 py-3 text-sm text-[#395146]">
                Modèle préconfiguré. Vous pourrez ajuster les détails ensuite.
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Configurez votre programme</h2>
              <p className="mt-2 text-sm text-[#58625C]">Adaptez la fréquence, la récompense et le rythme de relance à votre commerce.</p>

              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                {loyaltyOptions.map((option) => {
                  const isActive = rewardType === option.id

                  return (
                    <button className="text-left" key={option.id} onClick={() => setRewardType(option.id)} type="button">
                      <Card
                        className={[
                          "h-full p-4 transition",
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

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Card className="p-5">
                  <div className="flex justify-between text-sm text-[#173A2E]">
                    <span>Nombre de passages</span>
                    <strong>{targetVisits}</strong>
                  </div>
                  <Slider className="mt-3" max={12} min={3} onChange={setTargetVisits} value={targetVisits} />

                  <label className="mt-6 block text-sm text-[#173A2E]" htmlFor="rewardLabel">
                    Récompense
                  </label>
                  <Input id="rewardLabel" onChange={(event) => setRewardLabel(event.target.value)} value={rewardLabel} />
                </Card>

                <Card className="p-5">
                  <div className="flex justify-between text-sm text-[#173A2E]">
                    <span>Expiration douce</span>
                    <strong>{expirationDays} jours</strong>
                  </div>
                  <Slider className="mt-3" max={60} min={7} onChange={setExpirationDays} value={expirationDays} />

                  <div className="mt-6 flex justify-between text-sm text-[#173A2E]">
                    <span>Relance automatique</span>
                    <strong>{reminderDelayDays} jours</strong>
                  </div>
                  <Slider className="mt-3" max={45} min={5} onChange={setReminderDelayDays} value={reminderDelayDays} />
                </Card>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="font-serif text-3xl text-[#173A2E]">Aperçu de la carte</h2>
                <p className="mt-2 text-sm text-[#58625C]">Le client scanne, ajoute la carte, puis revient automatiquement.</p>

                <Card className="mt-6 overflow-hidden bg-gradient-to-br from-[#183E30] to-[#244E3D] p-6 text-[#F9FAF5]">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#D7E5DA]">Carte Wallet</p>
                  <h3 className="mt-3 font-serif text-3xl">{selectedTemplate.label}</h3>
                  <p className="mt-1 text-sm text-[#D7E5DA]">{rewardLabel}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {Array.from({ length: progressDots }).map((_, index) => (
                      <span
                        className={[
                          "inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs",
                          index < Math.max(1, Math.floor(progressDots * 0.4))
                            ? "border-[#D1E5D8] bg-[#E7F2EB] text-[#1F4A38]"
                            : "border-[#A6BCAF] text-[#D9E7DE]",
                        ].join(" ")}
                        key={index}
                      >
                        {index + 1}
                      </span>
                    ))}
                  </div>

                  <p className="mt-6 text-sm text-[#D7E5DA]">Sécurisé automatiquement</p>
                </Card>
              </div>

              <Card className="p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-[#69736C]">Notification type</p>
                <p className="mt-3 rounded-2xl border border-[#D6DCD3] bg-[#F8FAF6] px-4 py-3 text-base text-[#173A2E]">"{notificationText}"</p>
                <p className="mt-3 text-sm text-[#5C655E]">Déclenchée automatiquement après {reminderDelayDays} jours d'absence.</p>

                <div className="mt-8 space-y-3 text-sm text-[#3B4D43]">
                  <p>1. Le client scanne</p>
                  <p>2. Il ajoute la carte</p>
                  <p>3. Il revient automatiquement</p>
                </div>
              </Card>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="font-serif text-3xl text-[#173A2E]">Résultat prévisionnel</h2>
              <p className="mt-2 text-sm text-[#58625C]">Projection basée sur votre activité, avec un modèle de retour ajusté à votre secteur.</p>

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

              <Card className="mt-6 border-[#BBC8BC] bg-[#F2F7EF] p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-[#607067]">Ce que vous pouvez récupérer dès ce mois</p>
                <p className="mt-2 font-serif text-5xl text-[#173A2E]">+{formatEuro(result.extraRevenue)} / mois</p>
                <p className="mt-3 text-base text-[#2E4339]">{Math.round(result.recoveredClients)} clients récupérés / mois</p>
                <p className="mt-3 text-sm text-[#4F5E55]">Rentabilisé avec 1 client en plus par jour.</p>
              </Card>
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
              <Button onClick={() => setStep(1)}>Créer ma carte</Button>
            )}
          </div>
        </footer>
      </div>
    </section>
  )
}
