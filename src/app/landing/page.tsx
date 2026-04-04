import { IdentitySelector } from "@/components/landing/IdentitySelector"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F6F5F0] px-5 pb-16 pt-16 text-[#152F25] sm:px-6 sm:pt-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <div className="text-center">
          <p className="font-serif text-5xl tracking-[0.08em] text-[#15372B] sm:text-7xl">CARDIN</p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#91A095]">
            Systemes de retention pour commerces physiques
          </p>
          <h1 className="mx-auto mt-8 max-w-3xl font-serif text-4xl leading-[1.05] text-[#15372B] sm:text-6xl">
            Vos clients passent. Cardin leur donne une raison de revenir.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#5C655E] sm:text-lg">
            Choisissez votre situation. On vous montre le premier mouvement a mettre en place, le calcul qui va avec,
            puis la carte que votre client voit vraiment.
          </p>
        </div>

        <div className="mt-14 w-full">
          <IdentitySelector />
        </div>

        <p className="mt-10 text-center text-sm text-[#7A847B]">
          En 2 etapes: votre commerce, puis une projection intelligente scenario + audit.
        </p>
      </div>
    </main>
  )
}
