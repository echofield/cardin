import { LandingOnboardingJourney } from "@/components/landing/LandingOnboardingJourney"
import { PublicFooter } from "@/components/shared/PublicFooter"

export default function ParcoursPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] pt-14 text-[#18271F]">
      <section className="border-b border-[#E7E2D8]">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Parcours complet</p>
          <h1 className="mt-3 max-w-4xl font-serif text-[clamp(2.8rem,8vw,5rem)] leading-[1.02] text-[#163328]">
            Le parcours marchand Cardin, en plein écran.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
            Lecture du manque, choix du sommet, mécanique de retour, projection de revenu, puis activation du système.
          </p>
        </div>
      </section>

      <LandingOnboardingJourney />
      <PublicFooter />
    </main>
  )
}
