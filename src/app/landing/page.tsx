import { MerchantSeasonStudio } from "@/components/landing/MerchantSeasonStudio"
import { PublicFooter } from "@/components/shared/PublicFooter"

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
          </div>
        </div>
      </section>

      <section className="pt-8 lg:pt-10" id="methode">
        <MerchantSeasonStudio />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" id="cas">
        <div className="rounded-[1.8rem] border border-[#E3DDD0] bg-[#FFFEFA] p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Par type de commerce</p>
          <h2 className="mt-3 font-serif text-3xl text-[#173328] sm:text-4xl">Logique differente par lieu.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
              <p className="font-serif text-2xl text-[#173A2E]">Cafe</p>
              <p className="mt-3 text-sm leading-7 text-[#556159]">+4k a 6k par saison. Frequence elevee, panier moyen 5-8 EUR, retour rapide.</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
              <p className="font-serif text-2xl text-[#173A2E]">Restaurant</p>
              <p className="mt-3 text-sm leading-7 text-[#556159]">+10k a 15k par saison. Panier moyen 40-60 EUR, table et invitation.</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
              <p className="font-serif text-2xl text-[#173A2E]">Beaute / Boutique</p>
              <p className="mt-3 text-sm leading-7 text-[#556159]">+6k a 10k par saison. Trajectoire, valeur client elevee, selection.</p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

