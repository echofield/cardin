import Link from "next/link"

export default function ParcoursSuccessRoute() {
  return (
    <main className="min-h-dvh bg-[#f2ede4] px-6 py-24 text-center text-[#1a2a22]">
      <div className="mx-auto max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a8578]">Saison activée</p>
        <h1 className="mt-4 font-serif text-[clamp(42px,6vw,68px)] leading-[1.04]">
          Activation sous <em className="italic text-[#0f3d2e]">48 h.</em>
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-serif text-xl italic leading-[1.5] text-[#3d4d43]">
          Votre saison Cardin est confirmée. L&apos;équipe reprend contact pour la mise en place.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#0f3d2e] bg-[#0f3d2e] px-8 text-[12px] uppercase tracking-[0.2em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
            href="/"
          >
            Revenir à l'accueil
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#d4cdbd] px-8 text-[12px] uppercase tracking-[0.2em] text-[#1a2a22] transition hover:border-[#0f3d2e] hover:text-[#0f3d2e]"
            href="/parcours/lecture"
          >
            Refaire une simulation
          </Link>
        </div>
      </div>
    </main>
  )
}
