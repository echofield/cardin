import { MerchantSeasonStudio } from "@/components/landing/MerchantSeasonStudio"

export default function LandingPage() {
  return (
    <main className="bg-[#F7F3EA] text-[#18271F]" id="top">
      <section className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute left-1/2 top-[-260px] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[#EEF2EA] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="max-w-4xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Cardin</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-[#163328] sm:text-6xl lg:text-7xl">
              Revenu. Reseau. Influence.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
              Cardin remplace une partie du marketing perdu par une saison de retour, de propagation et d'attraction, visible a travers une carte.
            </p>
          </div>
        </div>
      </section>

      <section className="pt-8 lg:pt-10">
        <MerchantSeasonStudio />
      </section>
    </main>
  )
}



