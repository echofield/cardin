"use client"

import { useMemo, useState } from "react"

import { MerchantTemplateSelector } from "@/components/engine/MerchantTemplateSelector"
import { InstallLeadForm } from "@/components/landing/InstallLeadForm"
import { LandingCalculatorModule } from "@/components/landing/LandingCalculatorModule"
import { MobileStickyInstallBar } from "@/components/landing/MobileStickyInstallBar"
import { TrackedInstallCta } from "@/components/landing/TrackedInstallCta"
import { buildBehaviorPlan } from "@/lib/behavior-engine"
import { merchantTemplates } from "@/lib/merchant-templates"
import { Card } from "@/ui"

const RETURN_MECHANICS = [
  {
    title: "Rendez-vous",
    punchline: "Un moment attendu dans la semaine.",
    effect: "Remplit les jours calmes.",
    example: "Chaque mardi -> avantage réservé aux actifs.",
  },
  {
    title: "Défi",
    punchline: "Un objectif court à compléter.",
    effect: "Accélère le retour.",
    example: "3 passages en 7 jours -> bonus immédiat.",
  },
  {
    title: "Gain mensuel",
    punchline: "Un gain important chaque mois.",
    effect: "Attire et engage.",
    example: "Un client gagne une prestation ou produit premium.",
  },
] as const

const STORE_FLOW_STEPS = [
  {
    title: "Vous donnez la carte",
    detail: "Physique, simple.",
  },
  {
    title: "Le client scanne",
    detail: "Accès instantané.",
  },
  {
    title: "Il revient pour avancer",
    detail: "Progression visible.",
  },
] as const

const PHONE_EXPERIENCE_POINTS = ["progression visible", "prochaine étape claire", "retour naturel"] as const

export default function LandingPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState("boulangerie")

  const selectedTemplate = useMemo(
    () => merchantTemplates.find((template) => template.id === selectedTemplateId) ?? merchantTemplates[0],
    [selectedTemplateId]
  )

  const behaviorPlan = useMemo(
    () =>
      buildBehaviorPlan({
        merchantType: selectedTemplate.id,
        avgFrequency: selectedTemplate.defaults.average_frequency,
      }),
    [selectedTemplate.defaults.average_frequency, selectedTemplate.id]
  )

  return (
    <main className="bg-[#F8F7F2] pb-16 text-[#152F25] sm:pb-0">
      <section className="relative overflow-hidden border-b border-[#DEE3D9]">
        <div className="absolute left-1/2 top-[-180px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#E9EFE5] blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-18">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5A645D]">Cardin - Commerce</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#15372B] sm:text-6xl lg:text-7xl">
            Vos clients passent.
            <br />
            Cardin les fait revenir.
          </h1>

          <p className="mt-5 max-w-3xl text-base text-[#4F5A53] sm:text-lg">
            Une carte simple à donner en boutique.
            <br />
            Un système derrière qui installe le retour.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#calculateur"
              label="Calculer mon potentiel ->"
              source="hero"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="calculateur">
        <LandingCalculatorModule ctaHref="#installation" entryModeLabel="Commerce" />
        <p className="mt-4 text-sm text-[#2A3F35]">Cardin construit automatiquement la mécanique adaptée à votre activité.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" id="activity-selection">
        <div className="mb-5 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Activité</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Votre activité</h2>
          <p className="mt-3 text-sm text-[#556159]">Un système calibré automatiquement selon votre rythme client.</p>
        </div>

        <MerchantTemplateSelector
          onSelect={(template) => setSelectedTemplateId(template.id)}
          selectedTemplateId={selectedTemplate.id}
          templates={merchantTemplates}
        />

        <Card className="mt-6 p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Projection</p>
          <h3 className="mt-2 font-serif text-3xl text-[#173A2E]">Voici ce que vous lancez</h3>
          <div className="mt-4 space-y-2 text-sm text-[#2A3F35]">
            {behaviorPlan.launchProjection.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="experience-templates">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Mécaniques</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Trois façons simples de faire revenir vos clients</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {RETURN_MECHANICS.map((mechanic) => (
            <Card className="p-6" key={mechanic.title}>
              <p className="text-2xl font-serif text-[#173A2E]">{mechanic.title}</p>
              <p className="mt-2 text-sm text-[#2A3F35]">{mechanic.punchline}</p>
              <p className="mt-2 text-sm text-[#556159]">{mechanic.effect}</p>
              <p className="mt-4 rounded-2xl border border-[#D7DED4] bg-[#F9FAF6] p-3 text-sm text-[#49574E]">Exemple: {mechanic.example}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="flow">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Flow</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">En boutique</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {STORE_FLOW_STEPS.map((step, index) => (
            <Card className="p-6" key={step.title}>
              <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Étape {index + 1}</p>
              <p className="mt-3 text-xl font-serif text-[#173A2E]">{step.title}</p>
              <p className="mt-2 text-sm text-[#5B655E]">{step.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="customer-experience">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Expérience client</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Dans son téléphone</h2>
        </div>

        <Card className="p-8">
          <div className="space-y-2 text-sm text-[#2A3F35]">
            {PHONE_EXPERIENCE_POINTS.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>

          <p className="mt-6 max-w-3xl font-serif text-3xl text-[#173A2E]">Le client sait où il en est.</p>
          <p className="mt-1 max-w-3xl font-serif text-3xl text-[#173A2E]">Il revient pour continuer.</p>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8" id="why-it-works">
        <Card className="p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Pourquoi ça fonctionne</p>
          <p className="mt-3 max-w-3xl text-[#556159]">Le client entre dans une progression.</p>
          <p className="mt-2 max-w-3xl text-[#556159]">Chaque passage compte.</p>
          <p className="mt-2 max-w-3xl text-[#2A3F35]">Le retour devient naturel.</p>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="pricing">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Offre</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Un système actif chaque mois</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-8">
            <p className="text-lg text-[#2A3F35]">119€ - mise en place complète</p>
            <p className="mt-1 text-sm text-[#556159]">Cartes incluses + configuration</p>
            <p className="mt-4 text-lg text-[#2A3F35]">39€/mois - moteur actif</p>
            <p className="mt-1 text-sm text-[#556159]">Nouvelles mécaniques chaque mois</p>
            <p className="mt-5 font-serif text-3xl text-[#173A2E]">Un retour par jour couvre largement Cardin.</p>
          </Card>

          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Ce que vous mettez en place</p>
            <div className="mt-4 space-y-3 text-sm text-[#203B31]">
              <p>Un rythme de retour, sans gestion quotidienne</p>
              <p>Une progression visible côté client</p>
              <p>Un impact mesurable sur 30 jours</p>
            </div>
            <p className="mt-6 text-sm text-[#2A3F35]">Chaque mois, une nouvelle dynamique prête à lancer.</p>
            <div className="mt-6">
              <TrackedInstallCta
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-5 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
                href="#installation"
                label="Lancer ma carte"
                source="pricing"
              />
            </div>
          </Card>
        </div>
      </section>

      <InstallLeadForm activityTemplateId={selectedTemplate.id} entryMode="commerce" />

      <section className="border-t border-[#DEE3D9] bg-[#F2F5EE]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl font-serif text-4xl text-[#173A2E]">Lancer votre carte en boutique</h2>
          <p className="mt-3 max-w-2xl text-[#556159]">En place en 24h.</p>
          <p className="mt-2 max-w-2xl text-sm text-[#556159]">Utilisable immédiatement. Aucune formation nécessaire.</p>
          <div className="mt-6">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#installation"
              label="Lancer ma carte"
              source="final_cta"
            />
          </div>
          <p className="mt-7 max-w-3xl font-serif text-3xl text-[#173A2E]">Une carte visible.</p>
          <p className="mt-1 max-w-3xl font-serif text-3xl text-[#173A2E]">Un retour mesurable.</p>
        </div>
      </section>

      <MobileStickyInstallBar />
    </main>
  )
}
