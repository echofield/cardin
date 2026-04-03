"use client"

import Link from "next/link"

import { InstallLeadForm } from "@/components/landing/InstallLeadForm"
import { LandingCalculatorModule } from "@/components/landing/LandingCalculatorModule"
import { MerchantProofStrip } from "@/components/landing/MerchantProofStrip"
import { MobileStickyInstallBar } from "@/components/landing/MobileStickyInstallBar"
import { TrackedInstallCta } from "@/components/landing/TrackedInstallCta"
import { Card } from "@/ui"

const EXPERIENCE_TEMPLATES = [
  {
    id: "ritual",
    title: "Ritual",
    punchline: "Devenir un rendez-vous.",
    body: "Vous ne cherchez pas à solliciter. Vous cherchez à être intégré dans l'année du client.",
    example: "12 passages validés sur l'année, 1 prestation signature offerte.",
    emotion: "Le client se sent reconnu. Vous devenez un repère.",
  },
  {
    id: "mission",
    title: "Mission",
    punchline: "Une raison claire de revenir maintenant.",
    body: "Un objectif court, lisible, atteignable. Pas une remise - une progression.",
    example: "4 passages en 10 jours, puis un avantage immédiat.",
    emotion: "Le client revient pour terminer.",
  },
  {
    id: "domino",
    title: "Domino",
    punchline: "Quand le groupe avance, chacun revient.",
    body: "Le retour individuel prend une dimension collective.",
    example: "Objectif mensuel atteint, bonus débloqué pour les clients actifs.",
    emotion: "On vient pour soi. On reste pour l'ensemble.",
  },
] as const

const LOOP_STEPS = [
  {
    title: "Entrer dans le système",
    detail: "Le client scanne. Il accède instantanément à son espace.",
  },
  {
    title: "Voir sa progression",
    detail: "Chaque passage valide une étape, visible et claire.",
  },
  {
    title: "Revenir naturellement",
    detail: "La prochaine étape est proche. Le retour s'installe.",
  },
]

export default function LandingPage() {
  return (
    <main className="bg-[#F8F7F2] pb-16 text-[#152F25] sm:pb-0">
      <section className="relative overflow-hidden border-b border-[#DEE3D9]">
        <div className="absolute left-1/2 top-[-180px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#E9EFE5] blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-18">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5A645D]">Cardin — Return Engine</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#15372B] sm:text-6xl lg:text-7xl">
            Les points récompensent un achat.
            <br />
            Cardin crée un retour.
          </h1>

          <p className="mt-5 max-w-3xl text-base text-[#4F5A53] sm:text-lg">
            Chaque passage devient une étape visible dans le téléphone de votre client.
            <br />
            Il sait où il en est. Il revient pour avancer.
          </p>
          <p className="mt-3 text-base text-[#2A3F35] sm:text-lg">Vous n'avez rien à gérer.</p>
          <p className="mt-3 max-w-3xl text-sm text-[#556159] sm:text-base">
            Un cap clair.
            <br />
            Un retour mesurable.
            <br />
            Le trafic est déjà là. Le manque est entre deux visites.
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
            Installation en 24h. Sans application.
            <br />
            Pas de programme à gérer. Un comportement qui s'installe.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10" id="entry-mode">
        <div className="mb-5 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Mode</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Vous êtes…</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[#173A2E] bg-[#EDF3EC] p-6 text-left">
            <p className="text-xs uppercase tracking-[0.14em] text-[#5D685F]">Sélectionné</p>
            <p className="mt-2 font-serif text-3xl text-[#173A2E]">Commerce</p>
            <p className="mt-3 text-sm text-[#4E5B52]">
              Vos clients existent déjà. Le sujet n'est pas d'en trouver plus, mais de les revoir.
            </p>
          </div>

          <div className="rounded-3xl border border-[#D6DDD2] bg-[#FBFCF8] p-6 text-left">
            <p className="text-xs uppercase tracking-[0.14em] text-[#5D685F]">Mode Cardin</p>
            <p className="mt-2 font-serif text-3xl text-[#173A2E]">Creator / Communauté</p>
            <p className="mt-3 text-sm text-[#4E5B52]">Moins de passage passif. Plus de membres présents, réguliers.</p>
          </div>

          <div className="rounded-3xl border border-[#D6DDD2] bg-[#FBFCF8] p-6 text-left">
            <p className="text-xs uppercase tracking-[0.14em] text-[#5D685F]">Mode Cardin</p>
            <p className="mt-2 font-serif text-3xl text-[#173A2E]">Marque / Expérience</p>
            <p className="mt-3 text-sm text-[#4E5B52]">Pas une animation de plus. Un rythme qui donne envie de revenir.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="calculateur">
        <LandingCalculatorModule ctaHref="#installation" defaultAudience="clients" entryModeLabel="Commerce" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="experience-templates">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Expérience</p>
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Trois mécaniques de retour</h2>
          <p className="mt-3 text-sm text-[#556159]">
            Vous ne lancez pas une promotion.
            <br />
            Vous installez une dynamique simple: revenir pour continuer.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {EXPERIENCE_TEMPLATES.map((template) => (
            <Card className="p-6" key={template.id}>
              <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Template</p>
              <p className="mt-3 text-2xl font-serif text-[#173A2E]">{template.title}</p>
              <p className="mt-2 text-sm text-[#2A3F35]">{template.punchline}</p>
              <p className="mt-3 text-sm text-[#5A665D]">{template.body}</p>
              <p className="mt-4 rounded-2xl border border-[#D7DED4] bg-[#F9FAF6] p-3 text-sm text-[#49574E]">Exemple: {template.example}</p>
              <p className="mt-4 text-sm text-[#2A3F35]">{template.emotion}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Boucle</p>
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
          <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Ce que voit votre client</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Espace client</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Toujours dans le téléphone</p>
            <p className="mt-2 text-sm text-[#5B655E]">Un espace simple, accessible en un scan. Sans application.</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Un cap visible</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Progression claire</p>
            <p className="mt-2 text-sm text-[#5B655E]">Chaque passage valide une étape. Le client sait où il en est.</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Une raison de revenir</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Retour naturel</p>
            <p className="mt-2 text-sm text-[#5B655E]">La prochaine étape est proche. Le retour devient naturel.</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <Card className="p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Pourquoi ça fonctionne</p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl text-[#173A2E]">Le client ne revient pas pour une remise.</h2>
          <p className="mt-3 max-w-3xl text-[#556159]">Il revient parce qu'il a commencé quelque chose.</p>
          <p className="mt-2 max-w-3xl text-[#2A3F35]">Et qu'il souhaite aller au bout.</p>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="pricing">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Pricing</p>
            <p className="mt-3 text-lg text-[#2A3F35]">119€ pour installer le système.</p>
            <p className="mt-1 text-lg text-[#2A3F35]">39€/mois pour le maintenir actif.</p>
            <p className="mt-4 font-serif text-3xl text-[#173A2E]">Un retour par jour couvre largement Cardin.</p>
            <p className="mt-2 text-sm text-[#4E5A52]">Au-delà, chaque retour devient du chiffre récupéré.</p>
          </Card>

          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Ce que vous mettez en place</p>
            <div className="mt-4 space-y-3 text-sm text-[#203B31]">
              <p>Un rythme de retour, sans gestion quotidienne</p>
              <p>Une progression visible côté client</p>
              <p>Un impact mesurable sur 30 jours</p>
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

      <InstallLeadForm entryMode="commerce" />

      <section className="border-t border-[#DEE3D9] bg-[#F2F5EE]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl font-serif text-4xl text-[#173A2E]">Activer Cardin</h2>
          <p className="mt-3 max-w-2xl text-[#556159]">Votre système de retour, en place en 24h.</p>
          <p className="mt-2 max-w-2xl text-sm text-[#556159]">Entrée instantanée avec Google. Activation simple. Aucun outil à apprendre.</p>
          <div className="mt-6">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#installation"
              label="Se connecter avec Google"
              source="final_cta"
            />
          </div>
          <p className="mt-6 max-w-3xl font-serif text-3xl text-[#173A2E]">Vos clients savent déjà venir.</p>
          <p className="mt-1 max-w-3xl font-serif text-3xl text-[#173A2E]">Cardin donne une raison de revenir.</p>
        </div>
      </section>

      <MobileStickyInstallBar />
    </main>
  )
}
