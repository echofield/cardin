import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F8F7F2] px-6 py-16 text-[#173A2E]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#D8DED4] bg-[#FFFEFA] p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">Cardin · 404</p>
        <h1 className="mt-3 font-serif text-4xl">Cette page n&apos;existe pas.</h1>
        <p className="mt-3 text-sm text-[#556159]">
          Le lien est peut-être obsolète. Revenez à l&apos;accueil ou relancez le parcours.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-6 text-sm font-medium text-[#FBFAF6] transition hover:brightness-110"
            href="/"
          >
            Revenir à l&apos;accueil
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#1B4332] px-6 text-sm font-medium text-[#1B4332] transition hover:bg-[#1B4332]/5"
            href="/parcours"
          >
            Lancer le parcours
          </Link>
        </div>
      </div>
    </main>
  )
}
