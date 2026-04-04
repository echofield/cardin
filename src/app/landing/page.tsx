import Link from "next/link"

import { InlineCalculator } from "@/components/landing/InlineCalculator"
import { Card } from "@/ui"

const journeySteps = [
  {
    title: "Le client scanne",
    description: "QR en caisse, en vitrine ou sur ticket.",
  },
  {
    title: "Il ajoute la carte",
    description: "Apple Wallet ou Google Wallet, sans application.",
  },
  {
    title: "Vous voyez les retours",
    description: "Progression visible, scans et suivi marchand deja en place.",
  },
]

const offerPoints = [
  "QR de scan pret a afficher",
  "Carte wallet pour le client",
  "Tableau marchand avec suivi",
]

export default function LandingPage() {
  return (
    <main className="bg-[#F8F7F2] text-[#152F25]">
      <section className="relative overflow-hidden border-b border-[#DEE3D9]">
        <div className="absolute left-1/2 top-[-220px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#E9EFE5] blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5A645D]">Systeme de fidelite wallet pour commerces physiques</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#15372B] sm:text-6xl lg:text-7xl">
            Faites revenir vos clients. Sans publicite.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[#4F5A53]">
            Carte de fidelite directement dans leur telephone.
            <br />
            QR, Wallet et espace marchand installes rapidement.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="/engine"
            >
              Installer maintenant
            </Link>
            <Link className="text-sm font-medium text-[#173A2E] underline-offset-4 hover:underline" href="#calculateur">
              Voir combien vous pouvez recuperer
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" id="calculateur">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-serif text-4xl text-[#173A2E]">Ce que Cardin peut reellement ramener</h2>
          <p className="mt-3 text-sm text-[#556159]">
            Choisissez votre situation. Le calculateur garde les bons inputs du nouveau front, sans perdre la lisibilite de l'ancienne landing.
          </p>
        </div>
        <InlineCalculator />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-serif text-4xl text-[#173A2E]">Comment ca marche</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {journeySteps.map((step, index) => (
            <Card className="p-6" key={step.title}>
              <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Etape {index + 1}</p>
              <p className="mt-3 text-xl font-serif text-[#173A2E]">{step.title}</p>
              <p className="mt-2 text-sm text-[#5B655E]">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16" id="pricing">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Tarification</p>
            <p className="mt-3 font-serif text-4xl text-[#173A2E]">119EUR - installation complete</p>
            <p className="mt-2 text-2xl text-[#173A2E]">39EUR / mois</p>
            <p className="mt-4 text-sm text-[#4E5A52]">Rentabilise avec environ 1 client en plus par jour.</p>
          </Card>

          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Ce que vous recevez</p>
            <div className="mt-4 space-y-3 text-sm text-[#203B31]">
              {offerPoints.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#5B655E]">Base simple en boutique. Backend pret pour QR, wallet et suivi.</p>
          </Card>
        </div>
      </section>

      <section className="border-t border-[#DEE3D9] bg-[#F2F5EE]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl font-serif text-4xl text-[#173A2E]">On vous installe cette semaine</h2>
          <p className="mt-3 max-w-2xl text-[#556159]">Une carte simple cote client. Un vrai moteur marchand derriere.</p>
          <div className="mt-7">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
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
