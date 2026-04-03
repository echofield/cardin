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
    shortDescription: "Vos clients existent déjà. Le sujet: les faire revenir, encore.",
    heroContext: "Le trafic est là. Le trou est entre deux visites.",
    heroSubline: "Un cap clair. Un retour mesurable.",
    calculatorAudience: "clients",
    ritualExample: "12 passages valides sur l'année, 1 prestation signature offerte.",
    missionExample: "Mission 10 jours: 4 passages, puis dessert ou avantage immédiat.",
    dominoExample: "Objectif collectif mensuel du quartier atteint, bonus débloqué pour les actifs.",
  },
  creator: {
    label: "Creator / Community",
    shortDescription: "Moins de vues passives. Plus de membres qui reviennent et participent.",
    heroContext: "L'enjeu n'est pas la portée. C'est la régularité.",
    heroSubline: "Progression suivie. Presence stable.",
    calculatorAudience: "members",
    ritualExample: "12 présences validées, acces prive trimestriel débloqué.",
    missionExample: "Mission 21 jours: 6 actions validées, bonus communauté immédiat.",
    dominoExample: "Palier collectif atteint, récompense de groupe pour tous les membres engages.",
  },
  experience: {
    label: "Experience / Brand",
    shortDescription: "Pas une animation de plus. Un rituel de marque qui donne envie de revenir.",
    heroContext: "Le luxe ne force pas. Il attire le retour.",
    heroSubline: "Retour emotionnel. Relation durable.",
    calculatorAudience: "members",
    ritualExample: "12 visites qualifiées, privilège annuel de maison débloqué.",
    missionExample: "Mission saisonniere: 3 activations premium, invitation exclusive.",
    dominoExample: "Objectif communauté atteint pendant l'evenement, privilège collectif active.",
  },
}

const LOOP_TEMPLATES = [
  {
    id: "ritual",
    title: "Ritual",
    punchline: "Devenir une habitude annuelle.",
    narrative:
      "Vous ne cherchez pas a fidéliser. Vous cherchez a devenir une habitude annuelle. Ritual transforme l'année en progression.",
    emotionalFraming: "Le client se sent reconnu plutôt que sollicité.",
    modeExampleKey: "ritualExample",
  },
  {
    id: "mission",
    title: "Mission",
    punchline: "Cette semaine, une raison concrete de revenir.",
    narrative:
      "Pas une promo. Une mission avec une fin, une récompense, et l'envie de l'accomplir. Le sentiment du jeu, sans l'image du discount.",
    emotionalFraming: "Le client revient pour terminer, pas pour chasser une remise.",
    modeExampleKey: "missionExample",
  },
  {
    id: "domino",
    title: "Domino",
    punchline: "Quand le groupe avance, chacun revient.",
    narrative:
      "Le retour individuel devient un acte collectif. Pour les studios, clubs et communautés, là où l'appartenance pese plus que l'offre.",
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
    detail: "La récompense se rapproche. Le retour devient un reflexe.",
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
          <p className="text-xs uppercase tracking-[0.16em] text-[#5A645D]">Cardin - Return Engine</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#15372B] sm:text-6xl lg:text-7xl">
            Les points récompensent un achat.
            <br />
            Cardin crée une raison de revenir.
            <br />
            Ce n'est pas la même chose.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-[#4F5A53] sm:text-lg">
            Chaque passage devient une étape visible dans le téléphone de votre client.
            <br />
            Il sait ou il en est. Il revient pour avancer. Vous n'avez rien à gérer.
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
              Voir une boucle en 60 secondes &rarr;
            </Link>
          </div>

          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-[#5A645D]">
            Installation en 24h. Sans application. Les points achètent une transaction. Les boucles créent une habitude.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" id="entry-mode">
        <div className="mb-5 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Mode</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Vous êtes...</h2>
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
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Experience</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Trois mécaniques de retour</h2>
          <p className="mt-3 text-sm text-[#556159]">
            Vous ne lancez pas une promo. Vous installez un comportement.
            <br />
            Le client ne revient pas pour des points. Il revient parce qu'il a quelque chose à finir.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {LOOP_TEMPLATES.map((template) => (
            <Card className="p-6" key={template.id}>
              <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Template</p>
              <p className="mt-3 text-2xl font-serif text-[#173A2E]">{template.title}</p>
              <p className="mt-2 text-sm text-[#2A3F35]">{template.punchline}</p>
              <p className="mt-3 text-sm text-[#5A665D]">{template.narrative}</p>
              <p className="mt-4 rounded-2xl border border-[#D7DED4] bg-[#F9FAF6] p-3 text-sm text-[#49574E]">
                Exemple: {mode[template.modeExampleKey]}
              </p>
              <p className="mt-4 text-sm text-[#2A3F35]">{template.emotionalFraming}</p>
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
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Experience client</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Ce que le client voit</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Wallet</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Toujours dans le téléphone</p>
            <p className="mt-2 text-sm text-[#5B655E]">Une carte claire. Sans application. Prete en un geste.</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Progression</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Un cap visible</p>
            <p className="mt-2 text-sm text-[#5B655E]">Chaque passage valide une étape. Le client sait ou il en est.</p>
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
            <p className="mt-3 text-lg text-[#2A3F35]">119€ pour installer le système.</p>
            <p className="mt-1 text-lg text-[#2A3F35]">39€/mois pour le garder en marche.</p>
            <p className="mt-4 font-serif text-3xl text-[#173A2E]">Un client qui revient une fois par jour couvre Cardin en moins d'une semaine.</p>
            <p className="mt-3 text-sm text-[#4E5A52]">Le reste, c'est du chiffre récupéré.</p>
          </Card>

          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Ce que vous achetez</p>
            <div className="mt-4 space-y-3 text-sm text-[#203B31]">
              <p>Un comportement de retour, pas un programme de points</p>
              <p>Une progression visible que le client veut terminer</p>
              <p>Un chiffre qui se voit sur 30 jours</p>
            </div>
            <div className="mt-6">
              <TrackedInstallCta
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-5 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
                href="#installation"
                label="Lancer Cardin"
                source="pricing"
              />
            </div>
          </Card>
        </div>
      </section>

      <InstallLeadForm entryMode={entryMode} />

      <section className="border-t border-[#DEE3D9] bg-[#F2F5EE]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl font-serif text-4xl text-[#173A2E]">Vos clients savent déjà revenir. Donnez-leur une raison.</h2>
          <p className="mt-3 max-w-2xl text-[#556159]">Moins de friction. Un comportement de retour. Un chiffre qui le prouve.</p>
          <div className="mt-6">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#installation"
              label="Parler a un spécialiste retour"
              source="final_cta"
            />
          </div>
        </div>
      </section>

      <MobileStickyInstallBar />
    </main>
  )
}


