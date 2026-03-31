import Link from "next/link"

import { InstallLeadForm } from "@/components/landing/InstallLeadForm"
import { LandingCalculatorModule } from "@/components/landing/LandingCalculatorModule"
import { MerchantProofStrip } from "@/components/landing/MerchantProofStrip"
import { MobileStickyInstallBar } from "@/components/landing/MobileStickyInstallBar"
import { TrackedInstallCta } from "@/components/landing/TrackedInstallCta"
import { Card } from "@/ui"

export default function LandingPage() {
  return (
    <main className="bg-[#F8F7F2] pb-16 text-[#152F25] sm:pb-0">
      <section className="relative overflow-hidden border-b border-[#DEE3D9]">
        <div className="absolute left-1/2 top-[-180px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#E9EFE5] blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-18">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5A645D]">Système de fidélité wallet pour commerces physiques</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#15372B] sm:text-6xl lg:text-7xl">
            Faites revenir vos clients. Sans publicité.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[#4F5A53] sm:text-lg">
            Carte de fidélité directement dans leur téléphone.
            <br />
            Installée en 24h. Sans application.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#installation"
              label="Installer maintenant"
              source="hero"
            />
            <Link className="text-sm font-medium text-[#173A2E] underline-offset-4 hover:underline" href="#calculateur">
              Voir combien vous pouvez récupérer →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="calculateur">
        <LandingCalculatorModule ctaHref="#installation" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-6 max-w-3xl">
          <h2 className="font-serif text-4xl text-[#173A2E]">Comment ça marche</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Étape 1</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Le client scanne</p>
            <p className="mt-2 text-sm text-[#5B655E]">QR en caisse, en vitrine ou sur ticket.</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Étape 2</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Il ajoute la carte</p>
            <p className="mt-2 text-sm text-[#5B655E]">Apple Wallet ou Google Wallet, sans téléchargement.</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#657068]">Étape 3</p>
            <p className="mt-3 text-xl font-serif text-[#173A2E]">Il revient automatiquement</p>
            <p className="mt-2 text-sm text-[#5B655E]">Relances intelligentes et suivi concret des retours.</p>
          </Card>
        </div>
      </section>

      <MerchantProofStrip />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="pricing">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Tarification</p>
            <p className="mt-3 font-serif text-4xl text-[#173A2E]">119€ — installation complète</p>
            <p className="mt-2 text-2xl text-[#173A2E]">39€/mois</p>
            <p className="mt-4 text-sm text-[#4E5A52]">Rentabilisé avec 1 client en plus par jour.</p>
          </Card>

          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#627067]">Pourquoi ça marche</p>
            <div className="mt-4 space-y-3 text-sm text-[#203B31]">
              <p>Relances intelligentes</p>
              <p>Sans application</p>
              <p>Résultats mesurables</p>
            </div>
            <p className="mt-6 text-sm text-[#5B655E]">Sécurisé automatiquement</p>
          </Card>
        </div>
      </section>

      <InstallLeadForm />

      <section className="border-t border-[#DEE3D9] bg-[#F2F5EE]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl font-serif text-4xl text-[#173A2E]">On vous installe cette semaine</h2>
          <p className="mt-3 max-w-2xl text-[#556159]">Plus de clients qui reviennent = plus d'argent.</p>
          <div className="mt-6">
            <TrackedInstallCta
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-8 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#214F3E]"
              href="#installation"
              label="On vous installe cette semaine"
              source="final_cta"
            />
          </div>
        </div>
      </section>

      <MobileStickyInstallBar />
    </main>
  )
}
