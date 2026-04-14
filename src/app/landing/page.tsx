import Link from "next/link"

import { LandingOnboardingJourney } from "@/components/landing/LandingOnboardingJourney"
import { MobileStickyInstallBar } from "@/components/landing/MobileStickyInstallBar"
import { MerchantSeasonStudio } from "@/components/landing/MerchantSeasonStudio"
import { PublicFooter } from "@/components/shared/PublicFooter"
import { LANDING_PRICING, LANDING_SECTOR_CARDS, STRIPE_PAYMENT_LINK } from "@/lib/landing-content"

export default function LandingPage() {
  return (
    <main className="bg-[#F7F3EA] text-[#18271F]" id="top">
      <section className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute left-1/2 top-[-260px] hidden h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[#EEF2EA] blur-3xl sm:block" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="max-w-[60rem]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Cardin</p>
            <h1 className="mt-4 max-w-5xl font-serif text-[clamp(3rem,9vw,5.4rem)] leading-[1.02] text-[#163328]">
              Moteur de revenu saisonnier. Diamond au centre. Parcours qui compte.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
              Débloquez le Diamond comme horizon dès le départ : missions en cours de route, retour, recommandation et
              moments activés — sans promesse creuse.
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
              Objectifs de saison calibrés pour viser une revalorisation nette crédible, pas des gains symboliques.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href="/parcours">
                Voir le parcours marchand
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
                href="/parcours-client"
              >
                Parcours client
              </Link>
              <a className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]" href="/demo">
                Voir la démo complète
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
          <h2 className="mt-3 font-serif text-3xl text-[#173328] sm:text-4xl">Une logique différente selon le lieu.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {LANDING_SECTOR_CARDS.map((card) => (
              <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5" key={card.label}>
                <p className="font-serif text-2xl text-[#173A2E]">{card.label}</p>
                <p className="mt-3 text-sm leading-7 text-[#556159]">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="rounded-[1.8rem] border border-[#D7DDD2] bg-[linear-gradient(180deg,#FFFEFA_0%,#F1F5EE_100%)] p-6 shadow-[0_24px_60px_-42px_rgba(23,58,46,0.25)] sm:p-8 lg:p-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Fin de presentation</p>
          <h2 className="mt-3 max-w-3xl font-serif text-3xl text-[#173328] sm:text-4xl">Pret a lancer la saison.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#556159] sm:text-base">
            Le client voit un vrai gain. Les petits declencheurs creent le retour. La propagation reste bornee. Si la lecture vous convient, vous pouvez lancer l&apos;activation maintenant.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
              href={STRIPE_PAYMENT_LINK}
              rel="noreferrer"
              target="_blank"
            >
              {LANDING_PRICING.activationLabel}
            </a>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
              href="/parcours"
            >
              Revoir le parcours marchand
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
              href="/apres-paiement"
            >
              Voir la suite apres paiement
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
      <MobileStickyInstallBar />
    </main>
  )
}




