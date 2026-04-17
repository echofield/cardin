import type { Metadata } from "next"

import { CardinCreateForm } from "@/components/cardin-page/CardinCreateForm"
import { PublicFooter } from "@/components/shared/PublicFooter"

export const metadata: Metadata = {
  title: "Créer une page Cardin",
  description: "Préparez une page Cardin dédiée à un lieu en quelques champs.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function CardinCreatePage() {
  return (
    <main className="bg-[#F7F3EA] text-[#18271F]">
      <section className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute left-1/2 top-[-260px] hidden h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[#EEF2EA] blur-3xl sm:block" />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Cardin create</p>
            <h1 className="mt-4 font-serif text-[clamp(3rem,9vw,5rem)] leading-[1.02] text-[#163328]">
              Ouvrir une page Cardin à partir d&apos;une lecture du lieu.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
              Quelques champs suffisent. Cardin lit le moment faible, le rythme de retour et la clientèle dominante, puis
              ouvre une page prête pour la démo.
            </p>
          </div>

          <div className="mt-10">
            <CardinCreateForm />
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
