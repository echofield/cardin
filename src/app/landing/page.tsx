import Link from "next/link"

import { LandingOnboardingJourney } from "@/components/landing/LandingOnboardingJourney"
import { MerchantSeasonStudio } from "@/components/landing/MerchantSeasonStudio"
import { PublicFooter } from "@/components/shared/PublicFooter"
import { LANDING_SECTOR_CARDS } from "@/lib/landing-content"

export default function LandingPage() {
  return (
    <main className="bg-[#F7F3EA] text-[#18271F]" id="top">
      <section className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute left-1/2 top-[-260px] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[#EEF2EA] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="max-w-4xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Cardin</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-[#163328] sm:text-6xl lg:text-7xl">
              Clients qui reviennent. Bouche-a-oreille mesurable. Chiffre d'affaires recupere.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
              Une carte + une saison = un systeme qui remplace une partie de votre marketing par du retour client structure.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href="/demo">
                Voir la demo complete
              </Link>
              <a className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]" href="#onboarding">
                Voir l'onboarding
              </a>
            </div>
          </div>
        </div>
      </section>

      <LandingOnboardingJourney />

      <section className="pt-8 lg:pt-10" id="methode">
        <MerchantSeasonStudio />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" id="cas">
        <div className="rounded-[1.8rem] border border-[#E3DDD0] bg-[#FFFEFA] p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Par type de commerce</p>
          <h2 className="mt-3 font-serif text-3xl text-[#173328] sm:text-4xl">Logique differente par lieu.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {LANDING_SECTOR_CARDS.map((card) => (
              <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5" key={card.label}>
                <p className="font-serif text-2xl text-[#173A2E]">{card.label}</p>
                <p className="mt-3 text-sm leading-7 text-[#556159]">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
