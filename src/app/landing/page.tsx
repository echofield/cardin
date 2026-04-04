"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { ActivityRecommendationBlock } from "@/components/engine/ActivityRecommendationBlock"
import { MerchantTemplateSelector } from "@/components/engine/MerchantTemplateSelector"
import { LandingDynamicLibrary } from "@/components/landing/LandingDynamicLibrary"
import { LandingIntentButtons } from "@/components/landing/LandingIntentButtons"
import { InstallLeadForm } from "@/components/landing/InstallLeadForm"
import { LandingCalculatorModule } from "@/components/landing/LandingCalculatorModule"
import { MobileStickyInstallBar } from "@/components/landing/MobileStickyInstallBar"
import { TrackedInstallCta } from "@/components/landing/TrackedInstallCta"
import { trackEvent } from "@/lib/analytics"
import { buildBehaviorPlan } from "@/lib/behavior-engine"
import {
  getStrongestRecommendedDynamicId,
  type DynamicId,
  type MerchantIntent,
} from "@/lib/dynamics-library"
import { merchantTemplates } from "@/lib/merchant-templates"
import { Card } from "@/ui"

const RETURN_MECHANICS = [
  { title: "Retour régulier", detail: "Un cap simple pour faire revenir plus souvent sans charger la boutique." },
  { title: "Jour creux", detail: "Un rendez-vous clair pour remettre du passage là où le rythme baisse." },
  { title: "Défi court", detail: "Une fenêtre courte pour créer du mouvement rapidement." },
  { title: "Gain mensuel", detail: "Une récompense plus désirable pour créer attention et conversation." },
] as const

const STORE_FLOW_STEPS = [
  { title: "Vous donnez la carte", detail: "Visible en boutique. Immédiat à expliquer." },
  { title: "Le client scanne", detail: "Son espace s'ouvre dans le téléphone en quelques secondes." },
  { title: "Cardin installe le retour", detail: "Progression visible, prochaine étape claire, retour mesurable." },
] as const

const PHONE_EXPERIENCE_POINTS = ["prochaine étape visible", "progression qui reste en tête", "gain du mois si vous l'activez"] as const

export default function LandingPage() {
  const afterIntentRef = useRef<HTMLDivElement>(null)
  const [selectedIntent, setSelectedIntent] = useState<MerchantIntent | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState("boulangerie")
  const [selectedDynamicId, setSelectedDynamicId] = useState<DynamicId>("point_depart")

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

  useEffect(() => {
    if (!selectedIntent) return
    setSelectedDynamicId(getStrongestRecommendedDynamicId(selectedIntent, selectedTemplate.id))
  }, [selectedIntent, selectedTemplate.id])

  const handleIntent = (intent: MerchantIntent) => {
    setSelectedIntent(intent)
    trackEvent("landing_intent_select", { intent, templateId: selectedTemplate.id })
    window.requestAnimationFrame(() => {
      afterIntentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

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

          <p className="mt-5 max-w-3xl text-base text-[#4F5A53] sm:text-lg">Une carte simple en boutique. Un retour qui s&apos;installe derrière.</p>
          <p className="mt-3 max-w-3xl text-sm text-[#556159]">Activation simple. Sans application.</p>

          <p className="mt-8 font-serif text-2xl text-[#173A2E] sm:text-3xl">Que voulez-vous améliorer ?</p>
          <LandingIntentButtons
            onSelectIntent={handleIntent}
            selectedIntent={selectedIntent}
          />
        </div>
      </section>

      {selectedIntent ? (
        <div ref={afterIntentRef} className="scroll-mt-4">
          <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" id="activity-selection">
            <div className="mb-5 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Votre activité</p>
              <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Où voulez-vous l&apos;installer ?</h2>
              <p className="mt-3 text-sm text-[#556159]">
                Chaque activité a ses moments faibles, ses habitudes, son bon déclencheur.
              </p>
            </div>

            <MerchantTemplateSelector
              onSelect={(template) => {
                setSelectedTemplateId(template.id)
                trackEvent("calculator_change", {
                  field: "template",
                  value: template.id,
                  templateId: template.id,
                  intent: selectedIntent,
                })
              }}
              selectedTemplateId={selectedTemplate.id}
              templates={merchantTemplates}
            />

            <LandingDynamicLibrary
              intent={selectedIntent}
              merchantType={selectedTemplate.id}
              onSelectDynamic={(id) => {
                setSelectedDynamicId(id)
              }}
              selectedDynamicId={selectedDynamicId}
            />

            <div className="mt-6">
              <ActivityRecommendationBlock plan={behaviorPlan} template={selectedTemplate} />
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="calculateur">
            <LandingCalculatorModule
              behaviorPlan={behaviorPlan}
              ctaHref="#installation"
              entryModeLabel="Commerce"
              selectedDynamicId={selectedDynamicId}
              selectedIntent={selectedIntent}
              selectedTemplate={selectedTemplate}
            />
          </section>
        </div>
      ) : null}

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
