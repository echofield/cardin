"use client"

import { useMemo, useState } from "react"

import { ActivityRecommendationBlock } from "@/components/engine/ActivityRecommendationBlock"
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
    title: "Retour régulier",
    detail: "Un cap simple pour faire revenir plus souvent sans charger la boutique.",
  },
  {
    title: "Jour creux",
    detail: "Un rendez-vous clair pour remettre du passage là où le rythme baisse.",
  },
  {
    title: "Défi court",
    detail: "Une fenêtre courte pour créer du mouvement rapidement.",
  },
  {
    title: "Gain mensuel",
    detail: "Une récompense plus désirable pour créer attention et conversation.",
  },
] as const

const STORE_FLOW_STEPS = [
  {
    title: "Vous donnez la carte",
    detail: "Visible en boutique. Immédiat à expliquer.",
  },
  {
    title: "Le client scanne",
    detail: "Son espace s'ouvre dans le téléphone en quelques secondes.",
  },
  {
    title: "Cardin installe le retour",
    detail: "Progression visible, prochaine étape claire, retour mesurable.",
  },
] as const

const PHONE_EXPERIENCE_POINTS = [
  "prochaine étape visible",
  "progression qui reste en tête",
  "gain du mois si vous l'activez",
] as const

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
          <p className="text-xs uppercase tracking-[0.16em] text-[#5A645D]">Carte visible en boutique. Moteur de retour derrière.</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#15372B] sm:text-6xl lg:text-7xl">
            Vos clients passent.
            <br />
            Cardin les fait revenir.
          </h1>

          <p className="mt-5 max-w-3xl text-base text-[#4F5A53] sm:text-lg">
            Vous mettez en place une carte simple en boutique. Le client la scanne. Cardin installe ensuite un rythme de retour adapté à votre activité.
          </p>
          <p className="mt-3 max-w-3xl text-sm text-[#556159] sm:text-base">Le trafic est déjà là. Ce qui se perd se joue entre deux visites.</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#activity-selection"
              label="Voir ce que Cardin lancerait"
              source="hero"
            />
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#C8D1C7] bg-[#FBFCF8] px-8 text-sm font-medium text-[#173A2E] transition hover:border-[#173A2E]"
              href="#calculateur"
              label="Calculer mon retour"
              source="hero_secondary"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" id="activity-selection">
        <div className="mb-5 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Votre activité</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Cardin lit le rythme avant de proposer la carte.</h2>
          <p className="mt-3 text-sm text-[#556159]">Avant la sélection, c'est simple. Après la sélection, Cardin vous montre comment créer du mouvement.</p>
        </div>

        <MerchantTemplateSelector
          onSelect={(template) => setSelectedTemplateId(template.id)}
          selectedTemplateId={selectedTemplate.id}
          templates={merchantTemplates}
        />

        <div className="mt-6">
          <ActivityRecommendationBlock plan={behaviorPlan} template={selectedTemplate} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="calculateur">
        <LandingCalculatorModule behaviorPlan={behaviorPlan} ctaHref="#installation" entryModeLabel="Commerce" selectedTemplate={selectedTemplate} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="experience-templates">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Ce que Cardin met en mouvement</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">La carte reste simple. Le retour peut devenir plus ambitieux.</h2>
          <p className="mt-3 text-sm text-[#556159]">Cardin peut démarrer avec un point de départ clair, puis faire évoluer la dynamique au fil des mois.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {RETURN_MECHANICS.map((mechanic) => (
            <Card className="p-6" key={mechanic.title}>
              <p className="text-2xl font-serif text-[#173A2E]">{mechanic.title}</p>
              <p className="mt-3 text-sm text-[#556159]">{mechanic.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="flow">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">En boutique</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Une carte devant. Un moteur de retour derrière.</h2>
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
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Dans le téléphone du client</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Le retour reste visible après le scan.</h2>
        </div>

        <Card className="p-8">
          <div className="space-y-2 text-sm text-[#2A3F35]">
            {PHONE_EXPERIENCE_POINTS.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>

          <p className="mt-6 max-w-3xl font-serif text-3xl text-[#173A2E]">Le client sait où il en est.</p>
          <p className="mt-1 max-w-3xl font-serif text-3xl text-[#173A2E]">Le prochain retour reste tangible.</p>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8" id="why-it-works">
        <Card className="p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Pourquoi ça fonctionne</p>
          <p className="mt-3 max-w-3xl text-[#556159]">Le client avance vers quelque chose de visible.</p>
          <p className="mt-2 max-w-3xl text-[#556159]">Le commerçant lance une carte simple, puis Cardin fait évoluer la dynamique.</p>
          <p className="mt-2 max-w-3xl text-[#2A3F35]">Le retour se voit en boutique et se mesure dans le chiffre.</p>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="pricing">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Mise en place</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Commencer simplement. Faire évoluer chaque mois.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-8">
            <p className="text-lg text-[#2A3F35]">119€ - mise en place complète</p>
            <p className="mt-1 text-sm text-[#556159]">Carte, point de départ, premiers réglages et QR prêts à être donnés en boutique.</p>
            <p className="mt-4 text-lg text-[#2A3F35]">39€/mois - moteur actif</p>
            <p className="mt-1 text-sm text-[#556159]">Recommandations, nouvelles mécaniques et retour mesurable chaque mois.</p>
            <p className="mt-5 font-serif text-3xl text-[#173A2E]">Un retour par jour couvre largement Cardin.</p>
          </Card>

          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Ce que vous mettez en place</p>
            <div className="mt-4 space-y-3 text-sm text-[#203B31]">
              <p>Une carte claire à remettre en boutique</p>
              <p>Une progression visible dans le téléphone du client</p>
              <p>Des mécaniques de retour qui peuvent évoluer sans vous compliquer la vie</p>
            </div>
            <div className="mt-6">
              <TrackedInstallCta
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-5 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
                href="#installation"
                label="Mettre ma carte en place"
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
          <p className="mt-3 max-w-2xl text-[#556159]">Une carte visible. Une progression claire. Un retour mesurable.</p>
          <p className="mt-2 max-w-2xl text-sm text-[#556159]">Cardin démarre simplement et peut devenir plus ambitieux mois après mois.</p>
          <div className="mt-6">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#installation"
              label="Lancer ma carte"
              source="final_cta"
            />
          </div>
        </div>
      </section>

      <MobileStickyInstallBar />
    </main>
  )
}
