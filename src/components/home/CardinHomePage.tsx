"use client"

import Link from "next/link"
import { useState } from "react"

import { CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"

const compareTabs = [
  { id: "without", label: "Sans Cardin" },
  { id: "with", label: "Avec Cardin" },
] as const

export function CardinHomePage() {
  const [compareMode, setCompareMode] = useState<"without" | "with">("without")
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const handleTouchStart = (clientX: number) => setTouchStartX(clientX)
  const handleTouchEnd = (clientX: number) => {
    if (touchStartX === null) return
    const delta = clientX - touchStartX
    if (Math.abs(delta) > 50) {
      setCompareMode(delta < 0 ? "with" : "without")
    }
    setTouchStartX(null)
  }

  return (
    <main className="bg-[#f2ede4] text-[#1a2a22]" id="top">
      <header className="fixed inset-x-0 top-0 z-50 bg-[linear-gradient(to_bottom,#f2ede4_60%,transparent)] px-6 py-5 sm:px-8 lg:px-12">
        <div className="flex items-start justify-between gap-6">
          <Link className="block" href="/">
            <span className="block font-serif text-[20px] tracking-[0.35em] text-[#1a2a22]">CARDIN</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.25em] text-[#8a8578]">by Symi</span>
          </Link>

          <div className="flex flex-col items-end gap-2">
            <nav>
              <ul className="flex items-center gap-5 sm:gap-7 lg:gap-9">
                <li>
                  <a className="text-[10px] uppercase tracking-[0.15em] text-[#3d4d43] transition hover:text-[#0f3d2e] sm:text-[12px]" href="#impact">
                    Impact
                  </a>
                </li>
                <li>
                  <Link className="text-[10px] uppercase tracking-[0.15em] text-[#0f3d2e] transition hover:text-[#0f3d2e] sm:text-[12px]" href="/parcours">
                    Simuler
                  </Link>
                </li>
                <li>
                  <a className="text-[10px] uppercase tracking-[0.15em] text-[#3d4d43] transition hover:text-[#0f3d2e] sm:text-[12px]" href="#contact">
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
            <p className="text-[10px] tracking-[0.2em] text-[#8a8578]">
              <span className="text-[#1a2a22]">FR</span> / EN
            </p>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-32 text-center sm:px-8 lg:px-12">
        <svg
          aria-hidden="true"
          className="mb-12 h-[72px] w-[72px] text-[#0f3d2e] motion-safe:animate-[fade-in_1.2s_ease_0.2s_forwards]"
          fill="none"
          viewBox="0 0 72 72"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="36" cy="36" opacity="0.25" r="35" stroke="currentColor" strokeWidth="0.5" />
          <path d="M20 36 Q 36 14, 52 36" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
          <path d="M20 36 Q 36 58, 52 36" opacity="0.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
          <circle cx="20" cy="36" fill="currentColor" r="1.8" />
          <circle cx="52" cy="36" fill="#b8956a" r="1.8" />
        </svg>

        <h1 className="font-serif text-[clamp(64px,10vw,128px)] font-normal leading-none tracking-[0.12em] text-[#0f3d2e]">
          Cardin
        </h1>

        <p className="mt-14 max-w-[720px] font-serif text-[clamp(24px,2.6vw,32px)] font-light leading-[1.35] text-[#1a2a22]">
          Transformez les clients de passage
          <br />
          en clients <em className="text-[#0f3d2e]">qui reviennent.</em>
        </p>

        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#0f3d2e] bg-[#0f3d2e] px-7 py-3 text-[12px] uppercase tracking-[0.15em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
            href="#impact"
          >
            Voir l&apos;impact
          </a>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#d4cdbd] px-7 py-3 text-[12px] uppercase tracking-[0.15em] text-[#1a2a22] transition hover:border-[#0f3d2e] hover:bg-[rgba(15,61,46,0.03)] hover:text-[#0f3d2e]"
            href="/parcours"
          >
            Simuler mon commerce
          </Link>
        </div>
      </section>

      <section className="border-y border-[#d4cdbd] bg-[#ece6da] px-6 py-24 sm:px-8 lg:px-12" id="impact">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">Deux réalités. Un seul lieu.</p>

        <div className="mt-8 text-center">
          <div className="relative mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full border border-[#d4cdbd] bg-[radial-gradient(circle_at_center,rgba(184,149,106,0.12),transparent_65%)]">
            <div className="absolute inset-[-8px] rounded-full border border-[rgba(184,149,106,0.25)] motion-safe:animate-[pulse_3.5s_ease-in-out_infinite]" />
            <span className="font-serif text-[38px] leading-none text-[#b8956a]">◇</span>
          </div>
          <p className="mt-5 font-serif text-[clamp(28px,3.2vw,36px)] leading-[1.1] text-[#1a2a22]">Une raison de revenir</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#8a8578]">Récompense visible · Retour déclenché</p>
        </div>

        <div aria-label="Comparer sans et avec Cardin" className="mt-10 flex flex-wrap justify-center gap-3" role="tablist">
          {compareTabs.map((tab) => {
            const active = compareMode === tab.id
            return (
              <button
                aria-selected={active}
                className={[
                  "px-5 py-3 text-[11px] uppercase tracking-[0.14em] transition",
                  active
                    ? "border border-[#0f3d2e] bg-[rgba(15,61,46,0.04)] text-[#0f3d2e]"
                    : "border border-[#d4cdbd] text-[#3d4d43] hover:border-[#0f3d2e] hover:bg-[rgba(15,61,46,0.04)] hover:text-[#0f3d2e]",
                ].join(" ")}
                key={tab.id}
                onClick={() => setCompareMode(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div
          className="mx-auto mt-10 grid max-w-[1080px] touch-pan-y gap-4 lg:grid-cols-[1fr_92px_1fr] lg:items-stretch lg:gap-5"
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientX)}
          onTouchStart={(event) => handleTouchStart(event.touches[0].clientX)}
        >
          <article
            className={[
              "flex min-h-[420px] flex-col justify-center border border-[#d4cdbd] bg-[#f2ede4] px-7 py-11 text-center transition duration-300 lg:px-10",
              compareMode === "without"
                ? "scale-100 border-[rgba(15,61,46,0.35)] opacity-100 shadow-[0_14px_38px_rgba(15,61,46,0.07)]"
                : "scale-[0.985] opacity-[0.78]",
            ].join(" ")}
          >
            <span className="mb-11 inline-block text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">Sans Cardin</span>
            <div className="flex flex-1 flex-col justify-center gap-5">
              <p className="font-serif text-[clamp(28px,3.2vw,42px)] leading-[1.14] text-[#1a2a22]">100 passages</p>
              <p className="font-serif text-[clamp(28px,3.2vw,42px)] leading-[1.14] text-[#1a2a22]">0 raison de revenir</p>
              <p className="font-serif text-[calc(clamp(28px,3.2vw,42px)*0.8)] italic leading-[1.14] text-[#8a8578]">fin du passage</p>
            </div>
            <p className="mx-auto mt-9 max-w-[320px] border-t border-[#d4cdbd] pt-6 font-serif text-[15px] italic leading-[1.5] text-[#8a8578]">
              Le client vient. Puis disparaît.
            </p>
          </article>

          <div className="order-2 flex items-center justify-center lg:order-none">
            <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#d4cdbd] bg-[rgba(15,61,46,0.03)] text-[#0f3d2e] shadow-[inset_0_0_0_8px_rgba(15,61,46,0.015)]">
              <div className="absolute inset-[-6px] animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-[rgba(15,61,46,0.15)]" />
              <span className="font-serif text-[32px] leading-none">⟲</span>
            </div>
          </div>

          <article
            className={[
              "flex min-h-[420px] flex-col justify-center border border-[#d4cdbd] bg-[#f2ede4] px-7 py-11 text-center transition duration-300 lg:px-10",
              compareMode === "with"
                ? "scale-100 border-[rgba(15,61,46,0.35)] opacity-100 shadow-[0_14px_38px_rgba(15,61,46,0.07)]"
                : "scale-[0.985] opacity-[0.78]",
            ].join(" ")}
          >
            <span className="mb-11 inline-block text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">Avec Cardin</span>
            <div className="flex flex-1 flex-col justify-center gap-5">
              <p className="font-serif text-[clamp(28px,3.2vw,42px)] leading-[1.14] text-[#1a2a22]">100 passages</p>
              <p className="font-serif text-[clamp(28px,3.2vw,42px)] font-medium leading-[1.14] text-[#0f3d2e]">38 retours déclenchés</p>
              <p className="font-serif text-[clamp(28px,3.2vw,42px)] font-medium leading-[1.14] text-[#b8956a]">+ €2 840 récupérés</p>
            </div>
            <p className="mx-auto mt-9 max-w-[320px] border-t border-[#d4cdbd] pt-6 font-serif text-[15px] italic leading-[1.5] text-[#8a8578]">
              Le client voit ce qu&apos;il débloque. Puis revient.
            </p>
          </article>
        </div>

        <p className="mx-auto mt-14 max-w-[600px] text-center font-serif text-[clamp(20px,2.2vw,24px)] italic leading-[1.5] text-[#3d4d43]">
          Pas une carte de fidélité.
          <br />
          <strong className="font-medium not-italic text-[#0f3d2e]">Un système de retour client.</strong>
        </p>
      </section>

      <section className="px-6 py-[140px] pb-[100px] text-center sm:px-8 lg:px-12">
        <p className="mx-auto mb-14 max-w-[640px] font-serif text-[clamp(20px,2.2vw,26px)] italic leading-[1.5] text-[#3d4d43]">
          Conçu à Paris pour les commerçants
          <br />
          qui comptent leurs clients.
        </p>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#0f3d2e] bg-[#0f3d2e] px-7 py-3 text-[12px] uppercase tracking-[0.15em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
          href="/parcours"
        >
          Lancer ma simulation
        </Link>
      </section>

      <footer
        className="flex flex-col gap-4 border-t border-[#d4cdbd] px-6 py-12 text-center text-[11px] uppercase tracking-[0.15em] text-[#8a8578] sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12"
        id="contact"
      >
        <div>Cardin · Paris</div>
        <a className="transition hover:text-[#0f3d2e]" href={`mailto:${CARDIN_CONTACT_EMAIL}`}>
          {CARDIN_CONTACT_EMAIL}
        </a>
        <div>by Symi</div>
      </footer>
    </main>
  )
}
