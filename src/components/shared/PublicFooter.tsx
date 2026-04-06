import Link from "next/link"

const legalLinks = [
  { href: "/privacy", label: "Confidentialite" },
  { href: "/terms", label: "Conditions" },
  { href: "/legal", label: "Mentions" },
]

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E5DED1] bg-[#F4EFE5]" id="contact">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.8fr] lg:px-8">
        <div>
          <p className="font-serif text-2xl text-[#173328]">CARDIN</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-[#5A655D]">
            Une saison pour transformer le simple passage en systeme de recurrence, de domino et d'affluence.
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6C766E]">Contact</p>
          <p className="mt-3 text-sm leading-7 text-[#5A655D]">
            Activation lieu par lieu. Premiere saison calibree avec vous, puis passage vers un systeme plus autonome.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-5 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#24533F]"
              href="/engine"
            >
              Lancer ma saison
            </Link>
            <Link className="inline-flex h-11 items-center justify-center rounded-full border border-[#D4D9D0] bg-[#FFFDF8] px-5 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5]" href="/landing#top">
              Revenir au debut
            </Link>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6C766E]">Cadre public</p>
          <div className="mt-3 space-y-2 text-sm text-[#173A2E]">
            {legalLinks.map((link) => (
              <div key={link.href}>
                <Link className="underline-offset-4 hover:underline" href={link.href}>
                  {link.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
