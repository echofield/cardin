import Link from "next/link"

import { InlineCalculator } from "@/components/landing/InlineCalculator"
import { Card } from "@/ui"

const journeySteps = [
  {
    title: "Le client entre dans le cercle",
    description: "Il scanne, ajoute la carte et voit sa progression vivante.",
  },
  {
    title: "Le lieu declenche un mouvement",
    description: "Diamond, Domino et acces rares donnent une vraie raison de revenir.",
  },
  {
    title: "Vous pilotez sans lourdeur",
    description: "QR, wallet et suivi marchand restent simples a deployer.",
  },
]

const offerPoints = [
  "Carte wallet avec progression visible",
  "QR de scan pret pour le comptoir",
  "Moments Domino et privileges rares",
  "Suivi marchand et activation simple",
]

export default function LandingPage() {
  return (
    <main className="bg-[#FAF8F2] text-[#18271F]">
      <section className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute left-1/2 top-[-240px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#EEF2EA] blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332]" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#69736B]">Statut vivant pour commerces physiques</p>
          </div>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#163328] sm:text-6xl lg:text-7xl">
            Faites revenir vos clients. <span className="text-[#1B4332]">Sans promotion.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[#566159]">
            Cardin transforme un lieu en progression vivante: Diamond, Domino, privileges rares et retour visible dans le telephone.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-8 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
              href="#parcours"
            >
              Voir des versions pour mon lieu
            </Link>
            <Link className="text-sm font-medium text-[#1B4332] underline-offset-4 hover:underline" href="/engine">
              Ouvrir directement la mise en place
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" id="parcours">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-serif text-4xl text-[#173328]">Chaque lieu doit pouvoir se reconnaitre immediatement.</h2>
          <p className="mt-3 text-sm text-[#5A655D]">
            Choisissez votre monde, la dynamique que vous voulez provoquer, puis regardez comment Cardin se manifeste pour vos clients.
          </p>
        </div>
        <InlineCalculator />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Comment Cardin opere</p>
          <h2 className="mt-3 font-serif text-4xl text-[#173328]">Un moteur discret, un effet visible.</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {journeySteps.map((step, index) => (
            <Card className="relative p-6" key={step.title}>
              <div className="absolute -left-px -top-px h-3 w-3 border-l border-t border-[#CFC8BC]" />
              <div className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-[#CFC8BC]" />
              <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Etape {index + 1}</p>
              <p className="mt-3 text-xl font-serif text-[#173A2E]">{step.title}</p>
              <p className="mt-2 text-sm text-[#5B655E]">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16" id="pricing">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="relative p-8">
            <div className="absolute -left-px -top-px h-3 w-3 border-l border-t border-[#CFC8BC]" />
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Tarification</p>
            <p className="mt-3 font-serif text-4xl text-[#173A2E]">180EUR / mois</p>
            <p className="mt-4 text-sm text-[#4E5A52]">Le moteur Cardin, la carte wallet, le QR et le suivi marchand pour votre lieu.</p>
          </Card>

          <Card className="relative p-8">
            <div className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-[#CFC8BC]" />
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Ce que vous recevez</p>
            <div className="mt-4 space-y-3 text-sm text-[#203B31]">
              {offerPoints.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#5B655E]">Base simple en boutique. Cardin garde la complexite dans le moteur, pas dans la caisse.</p>
          </Card>
        </div>
      </section>

      <section className="border-t border-[#E7E2D8] bg-[#F4F1E9]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl font-serif text-4xl text-[#173A2E]">On active la bonne version pour votre lieu.</h2>
          <p className="mt-3 max-w-2xl text-[#5A655D]">Un front simple pour le client. Un moteur de statut, Domino et progression pour le marchand.</p>
          <div className="mt-7">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-8 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
              href="/engine"
            >
              Ouvrir la mise en place
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
