"use client"

import Link from "next/link"
import { useState } from "react"

import { InstallLeadForm } from "@/components/landing/InstallLeadForm"
import { LandingCalculatorModule } from "@/components/landing/LandingCalculatorModule"
import { MerchantProofStrip } from "@/components/landing/MerchantProofStrip"
import { MobileStickyInstallBar } from "@/components/landing/MobileStickyInstallBar"
import { TrackedInstallCta } from "@/components/landing/TrackedInstallCta"
import { Card } from "@/ui"

type EntryMode = "commerce" | "creator" | "experience"

type ModeContent = {
  label: string
  shortDescription: string
  heroContext: string
  heroSubline: string
  calculatorAudience: "clients" | "members"
  ritualExample: string
  missionExample: string
  dominoExample: string
}

const ENTRY_MODES: Record<EntryMode, ModeContent> = {
  commerce: {
    label: "Commerce",
    shortDescription: "Commerces physiques. Plus de retours entre deux achats.",
    heroContext: "Pour les commerces physiques qui veulent retrouver un rythme de retour naturel.",
    heroSubline: "Clients qui reviennent. Chiffre qui remonte.",
    calculatorAudience: "clients",
    ritualExample: "12 passages validés sur l'année, 1 prestation signature offerte.",
    missionExample: "Mission 10 jours: 4 passages, puis dessert ou avantage immédiat.",
    dominoExample: "Objectif collectif mensuel du quartier atteint, bonus débloqué pour les actifs.",
  },
  creator: {
    label: "Creator / Community",
    shortDescription: "Créateurs, coachs, studios. Audience transformée en membres actifs.",
    heroContext: "Pour les communautés qui veulent de la participation régulière, pas des vues passives.",
    heroSubline: "Membres actifs. Rythme stable.",
    calculatorAudience: "members",
    ritualExample: "12 présences validées, accès privé trimestriel débloqué.",
    missionExample: "Mission 21 jours: 6 actions validées, bonus communauté immédiat.",
    dominoExample: "Palier collectif atteint, récompense de groupe pour tous les membres engagés.",
  },
  experience: {
    label: "Experience / Brand",
    shortDescription: "Maisons premium, événements, lieux. Rituel de marque qui fait revenir.",
    heroContext: "Pour les marques qui veulent créer un réflexe de retour élégant et mémorable.",
    heroSubline: "Retour émotionnel. Relation durable.",
    calculatorAudience: "members",
    ritualExample: "12 visites qualifiées, privilège annuel de maison débloqué.",
    missionExample: "Mission saisonnière: 3 activations premium, invitation exclusive.",
    dominoExample: "Objectif communauté atteint pendant l'événement, privilège collectif activé.",
  },
}

const LOOP_TEMPLATES = [
  {
    id: "ritual",
    title: "Ritual",
    punchline: "Le retour long terme devient un rituel.",
    emotionalFraming: "Le client se sent reconnu. Pas sollicité.",
    modeExampleKey: "ritualExample",
  },
  {
    id: "mission",
    title: "Mission",
    punchline: "Une fenêtre courte. Une action claire.",
    emotionalFraming: "Le client a une raison concrète de revenir cette semaine.",
    modeExampleKey: "missionExample",
  },
  {
    id: "domino",
    title: "Domino",
    punchline: "Quand un membre avance, le groupe avance.",
    emotionalFraming: "On revient pour soi. On reste pour le collectif.",
    modeExampleKey: "dominoExample",
  },
] as const

const LOOP_STEPS = [
  {
    title: "Entrer dans le système",
    detail: "Le client ajoute la carte dans son Wallet en un geste.",
  },
  {
    title: "Voir sa progression",
    detail: "Chaque passage valide une étape visible, claire, immédiate.",
  },
  {
    title: "Revenir naturellement",
    detail: "La récompense se rapproche. Le retour devient un réflexe.",
  },
]

export default function LandingPage() {
  const [entryMode, setEntryMode] = useState<EntryMode>("commerce")

  const mode = ENTRY_MODES[entryMode]

  return (
    <main className="bg-[#F8F7F2] pb-16 text-[#152F25] sm:pb-0">
      <section className="relative overflow-hidden border-b border-[#DEE3D9]">
        <div className="absolute left-1/2 top-[-180px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#E9EFE5] blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-18">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5A645D]">Cardin — Return Engine</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#15372B] sm:text-6xl lg:text-7xl">
            Ne distribuez plus des points.
            <br />
            Créez un réflexe de retour.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-[#4F5A53] sm:text-lg">
            Cardin transforme les passages en progression visible dans Apple Wallet et Google Wallet.
            <br />
            {mode.heroSubline} {mode.heroContext}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#calculateur"
              label="Calculer mon potentiel de retour"
              source="hero"
            />
            <Link className="text-sm font-medium text-[#173A2E] underline-offset-4 hover:underline" href="#experience-templates">
              Voir une boucle en 60 secondes ?
            </Link>
          </div>

          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-[#5A645D]">Installation en 24h. Sans application à télécharger.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" id="entry-mode">
        <div className="mb-5 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Mode</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Vous êtes…</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(Object.entries(ENTRY_MODES) as [EntryMode, ModeContent][]).map(([key, item]) => {
            const active = key === entryMode
            return (
              <button
                className={[
                  "rounded-3xl border p-6 text-left transition",
                  active ? "border-[#173A2E] bg-[#EDF3EC]" : "border-[#D6DDD2] bg-[#FBFCF8] hover:border-[#BFCABD]",
                ].join(" ")}
                key={key}
                onClick={() => setEntryMode(key)}
                type="button"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-[#5D685F]">{active ? "Sélectionné" : "Mode Cardin"}</p>
                <p className="mt-2 font-serif text-3xl text-[#173A2E]">{item.label}</p>
                <p className="mt-3 text-sm text-[#4E5B52]">{item.shortDescription}</p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="calculateur">
        <LandingCalculatorModule ctaHref="#installation" defaultAudience={mode.calculatorAudience} entryModeLabel={mode.label} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="experience-templates">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Expérience</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Trois mécaniques de retour</h2>
          <p className="mt-3 text-sm text-[#556159]">Vous ne lancez pas une promo. Vous installez un comportement.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {LOOP_TEMPLATES.map((template) => (
            <Card className="p-6" key={template.id}>
              <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Template</p>
              <p className="mt-3 text-2xl font-serif text-[#173A2E]">{template.title}</p>
              <p className="mt-2 text-sm text-[#2A3F35]">{template.punchline}</p>
              <p className="mt-4 rounded-2xl border border-[#D7DED4] bg-[#F9FAF6] p-3 text-sm text-[#49574E]">
                Exemple: {mode[template.modeExampleKey]}
              </p>
              <p className="mt-4 text-sm text-[#5A665D]">{template.emotionalFraming}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Boucle comportementale</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Entrer. Progresser. Revenir.</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {LOOP_STEPS.map((step, index) => (
            <Card className="p-6" key={step.title}>
              <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Étape {index + 1}</p>
              <p className="mt-3 text-xl font-serif text-[#173A2E]">{step.title}</p>
              <p className="mt-2 text-sm text-[#5B655E]">{step.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <MerchantProofStrip />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Expérience client</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Ce que le client voit</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Wallet</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Toujours dans le téléphone</p>
            <p className="mt-2 text-sm text-[#5B655E]">Une carte claire. Sans application. Prête en un geste.</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Progression</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Un cap visible</p>
            <p className="mt-2 text-sm text-[#5B655E]">Chaque passage valide une étape. Le client sait où il en est.</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Récompense</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Une raison de revenir</p>
            <p className="mt-2 text-sm text-[#5B655E]">La prochaine récompense est proche. Le retour devient naturel.</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="pricing">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Tarification</p>
            <p className="mt-3 font-serif text-4xl text-[#173A2E]">119€ — installation complète</p>
            <p className="mt-2 text-2xl text-[#173A2E]">39€/mois — moteur actif</p>
            <p className="mt-4 text-sm text-[#4E5A52]">
              Avec une valeur moyenne de 12€ par retour, 1 retour/jour représente environ 312€/mois de potentiel.
            </p>
            <p className="mt-2 text-sm text-[#2A3F35]">1 client par jour peut couvrir Cardin.</p>
          </Card>

          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Ce que vous achetez</p>
            <div className="mt-4 space-y-3 text-sm text-[#203B31]">
              <p>Un système de retour, pas une carte statique</p>
              <p>Des boucles comportementales visibles par le client</p>
              <p>Un résultat mesurable sur 30 jours</p>
            </div>
            <div className="mt-6">
              <TrackedInstallCta
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-5 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
                href="#installation"
                label="Activer Cardin"
                source="pricing"
              />
            </div>
          </Card>
        </div>
      </section>

      <InstallLeadForm entryMode={entryMode} />

      <section className="border-t border-[#DEE3D9] bg-[#F2F5EE]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl font-serif text-4xl text-[#173A2E]">Une boucle active dès la première semaine</h2>
          <p className="mt-3 max-w-2xl text-[#556159]">Moins de friction. Plus de retour. Plus de chiffre réel.</p>
          <div className="mt-6">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#installation"
              label="Parler à un spécialiste retour"
              source="final_cta"
            />
          </div>
        </div>
      </section>

      <MobileStickyInstallBar />
    </main>
  )
}

