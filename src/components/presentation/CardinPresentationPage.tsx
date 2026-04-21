"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"

import { ParcoursParticles } from "@/components/parcours-v2/ParcoursParticles"
import { PresentationLockButton } from "@/components/presentation/PresentationLockButton"

const examples = [
  {
    type: "Restaurant",
    moment: "Mardi, une table peut être offerte.",
    diamond: "Diamond : 1 repas / mois pendant 1 an",
  },
  {
    type: "Café",
    moment: "Cette semaine, un café peut tomber.",
    diamond: "Diamond : 1 boisson / semaine",
  },
  {
    type: "Boutique",
    moment: "Vote, duo ou pièce mise en avant.",
    diamond: "Diamond : 100 € de crédit / mois",
  },
] as const

const rules = [
  {
    title: "On réactive la base existante",
    description: "Cardin ne dépend pas d'un nouveau trafic massif. Il donne une raison claire de revenir aux clients déjà là.",
  },
  {
    title: "On remplit un jour précis",
    description: "Le moment de la semaine se cale sur un mardi, un jeudi ou un créneau faible que le lieu veut vraiment relancer.",
  },
  {
    title: "Le Diamond garde la tension",
    description: "Le lieu gagne avant la fin. Le Diamond donne simplement un horizon rare qui structure la saison.",
  },
] as const

export function CardinPresentationPage() {
  const rootRef = useRef<HTMLElement | null>(null)
  const heroKickerRef = useRef<HTMLParagraphElement | null>(null)
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null)
  const heroSubRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const revealNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"))

    if (reduceMotion) {
      gsap.set([heroKickerRef.current, heroTitleRef.current, heroSubRef.current, ...revealNodes], {
        autoAlpha: 1,
        x: 0,
        y: 0,
      })
      return
    }

    const intro = gsap.timeline({ delay: 0.18 })
    intro
      .fromTo(heroKickerRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" })
      .fromTo(heroTitleRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.82, ease: "power2.out" }, "-=0.22")
      .fromTo(heroSubRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.75, ease: "power2.out" }, "-=0.32")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const node = entry.target as HTMLElement

          if (node.dataset.story === "true") {
            const visual = node.querySelector<HTMLElement>("[data-story-visual]")
            const text = node.querySelector<HTMLElement>("[data-story-text]")

            gsap.timeline()
              .to(visual, { autoAlpha: 1, x: 0, y: 0, duration: 0.85, ease: "power2.out" })
              .to(text, { autoAlpha: 1, x: 0, y: 0, duration: 0.78, ease: "power2.out" }, "-=0.46")
          } else {
            gsap.to(node, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" })
          }

          observer.unobserve(node)
        })
      },
      { threshold: 0.16, rootMargin: "0px 0px -56px 0px" },
    )

    revealNodes.forEach((node) => {
      if (node.dataset.story === "true") {
        const visual = node.querySelector<HTMLElement>("[data-story-visual]")
        const text = node.querySelector<HTMLElement>("[data-story-text]")
        if (visual) gsap.set(visual, { autoAlpha: 0, x: -18, y: 10 })
        if (text) gsap.set(text, { autoAlpha: 0, x: 18, y: 10 })
      } else {
        gsap.set(node, { autoAlpha: 0, y: 18 })
      }
      observer.observe(node)
    })

    return () => {
      intro.kill()
      observer.disconnect()
    }
  }, [])

  return (
    <main
      className="relative min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.05),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(184,149,106,0.1),transparent_30%),#ebe5d8] text-[#1a2a22]"
      ref={rootRef}
    >
      <ParcoursParticles />

      <div className="pointer-events-none absolute left-[24px] top-[24px] z-[2] h-[78px] w-[78px] border-l border-t border-[#b8956a]/35 md:left-[56px] md:top-[56px] md:h-[96px] md:w-[96px]" />
      <div className="pointer-events-none absolute bottom-[24px] right-[24px] z-[2] h-[78px] w-[78px] border-b border-r border-[#b8956a]/35 md:bottom-[56px] md:right-[56px] md:h-[96px] md:w-[96px]" />

      <header className="fixed inset-x-0 top-0 z-20 bg-[linear-gradient(to_bottom,#ebe5d8_75%,rgba(235,229,216,0))] px-5 pb-5 pt-5 md:px-10">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-[#8a8578] transition hover:text-[#003d2c]"
            href="/"
          >
            <span>←</span>
            <span className="font-serif text-[16px] tracking-[0.34em] text-[#1a2a22]">CARDIN</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-[#8a8578] md:block">Présentation privée</span>
            <PresentationLockButton />
          </div>
        </div>
      </header>

      <section className="relative z-[2] mx-auto max-w-[900px] px-5 pb-6 pt-[138px] text-center md:px-8 md:pt-[158px]">
        <p className="mb-5 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]" ref={heroKickerRef}>
          <span className="h-px w-[14px] bg-[#b8956a]/70" />
          Présentation
          <span className="h-px w-[14px] bg-[#b8956a]/70" />
        </p>
        <h1
          className="font-serif text-[clamp(38px,5.7vw,66px)] leading-[1.04] tracking-[-0.025em] text-[#1a2a22]"
          ref={heroTitleRef}
        >
          Comprendre simplement
          <br />
          <em className="font-medium italic text-[#003d2c]">pourquoi Cardin fait revenir.</em>
        </h1>
        <p
          className="mx-auto mt-5 max-w-[720px] font-serif text-[clamp(18px,2.25vw,22px)] italic leading-[1.56] text-[#3d4d43]"
          ref={heroSubRef}
        >
          Un lieu choisit un jour clé, montre ce qui se passe cette semaine, fait scanner ses clients, puis transforme le
          passage en retour. Le Diamond reste visible tout au long de la saison.
        </p>
      </section>

      <section className="relative z-[2] mx-auto mt-6 max-w-[1040px] px-5 md:px-8">
        <StoryStep
          note="Le lieu · choisit un cadre simple"
          number={1}
          title="On part d'un lieu réel, d'un jour réel."
          description="Cardin commence par le commerce. Quel mardi est faible, quel moment mérite d'être relancé, quel Diamond reste soutenable. La saison ne sort pas d'une théorie: elle part d'un point de retour concret."
          visual={<SetupVisual />}
        />

        <StoryStep
          note="Au comptoir · l'intention devient visible"
          number={2}
          reverse
          title="Le comptoir montre ce qui se passe cette semaine."
          description="Le client n'a pas besoin qu'on lui explique tout le système. Il voit un QR, un moment clair, et le Diamond en jeu. En quelques secondes, il comprend pourquoi il a intérêt à scanner."
          visual={<CounterVisual />}
        />

        <StoryStep
          note="Côté client · on entre puis on revient"
          number={3}
          title="Le client scanne, entre dans la saison, puis revient."
          description="Chaque passage compte. Le téléphone montre le moment en cours, le prochain rendez-vous, et ce qui reste en jeu. Le retour devient lisible au lieu d'être laissé au hasard."
          visual={<ClientVisual />}
        />

        <StoryStep
          note="Résultat · le lieu gagne avant le sommet"
          number={4}
          reverse
          title="Le Diamond n'est pas le début. C'est l'horizon."
          description="La vraie valeur vient des retours répétés sur la saison. Le Diamond garde la tension et donne une fin rare. Le lieu, lui, a déjà gagné sur les passages, le rythme et la dépense existante."
          visual={<SeasonVisual />}
        />
      </section>

      <section className="relative z-[2] mx-auto mt-16 max-w-[1040px] px-5 md:mt-20 md:px-8">
        <div className="text-center" data-reveal>
          <p className="mb-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
            Pourquoi ça crée du chiffre
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
          </p>
          <h2 className="font-serif text-[clamp(28px,3.2vw,38px)] leading-[1.16] tracking-[-0.02em] text-[#1a2a22]">
            Ce n'est pas un système de points.
            <em className="ml-2 font-medium italic text-[#003d2c]">C'est un moteur de retour.</em>
          </h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto_1fr]" data-reveal>
          <div className="rounded-[6px] border border-[#d4cdbd] bg-[#f4efe5]/95 px-6 py-7 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8a8578]">Sans Cardin</p>
            <p className="mt-3 font-serif text-[clamp(32px,4vw,42px)] leading-none text-[#1a2a22]">Trafic ponctuel</p>
            <p className="mt-3 font-serif text-[15px] italic leading-[1.55] text-[#3d4d43]">
              Le client passe, repart, puis n'a aucune raison claire de revenir un mardi ou un jeudi plus faible.
            </p>
          </div>

          <div className="flex items-center justify-center text-[22px] text-[#b8956a]">→</div>

          <div className="rounded-[6px] border border-[#d4cdbd] bg-[linear-gradient(180deg,#f5efe3,#f2ede4)] px-6 py-7 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8c6a44]">Avec Cardin</p>
            <p className="mt-3 font-serif text-[clamp(32px,4vw,42px)] leading-none text-[#003d2c]">Retour structuré</p>
            <p className="mt-3 font-serif text-[15px] italic leading-[1.55] text-[#3d4d43]">
              Le lieu montre un moment clair, capte le scan, puis redonne au client un rendez-vous concret dans la saison.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3" data-reveal>
          {rules.map((rule, index) => (
            <article className="rounded-[4px] border border-[#d4cdbd] px-5 py-5" key={rule.title}>
              <p className="font-serif text-[13px] italic text-[#b8956a]">{["i.", "ii.", "iii."][index]}</p>
              <h3 className="mt-1 font-serif text-[18px] leading-[1.28] text-[#1a2a22]">{rule.title}</h3>
              <p className="mt-2 font-serif text-[14px] italic leading-[1.55] text-[#3d4d43]">{rule.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-16 max-w-[1040px] px-5 md:mt-20 md:px-8">
        <div className="text-center" data-reveal>
          <p className="mb-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
            Exemples de lieux
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
          </p>
          <h3 className="font-serif text-[clamp(24px,2.7vw,30px)] italic text-[#1a2a22]">Même moteur. Différents moments.</h3>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {examples.map((example) => (
            <article className="rounded-[6px] border border-[#d4cdbd] bg-[#f4efe5]/95 px-6 py-6 text-center" data-reveal key={example.type}>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#8a8578]">{example.type}</p>
              <p className="mt-3 font-serif text-[18px] leading-[1.42] text-[#1a2a22]">{example.moment}</p>
              <p className="mt-3 font-serif text-[14px] italic leading-[1.5] text-[#8a8578]">{example.diamond}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-16 max-w-[760px] px-5 pb-16 text-center md:mt-20 md:px-8 md:pb-20" data-reveal>
        <p className="font-serif text-[clamp(20px,2.3vw,24px)] italic leading-[1.5] text-[#3d4d43]">
          En quelques minutes, Cardin montre comment un lieu transforme un passage en retour visible.
        </p>
        <div className="mt-7">
          <Link
            className="inline-flex items-center gap-3 rounded-[2px] border border-[#003d2c] bg-[#003d2c] px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
            href="/parcours/lecture"
          >
            Voir la saison Cardin
            <span className="text-[14px]">→</span>
          </Link>
        </div>
        <p className="mt-4 text-[11px] italic tracking-[0.08em] text-[#8a8578]">Présentation privée · accès par URL uniquement</p>
      </section>
    </main>
  )
}

function StoryStep({
  number,
  title,
  description,
  note,
  visual,
  reverse = false,
}: {
  number: number
  title: string
  description: string
  note: string
  visual: React.ReactNode
  reverse?: boolean
}) {
  return (
    <section
      className={`grid items-center gap-8 border-b border-dashed border-[#d4cdbd] py-14 md:gap-12 lg:grid-cols-2 ${
        reverse ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""
      }`}
      data-reveal
      data-story="true"
    >
      <div className="relative" data-story-visual>
        {visual}
      </div>

      <div data-story-text>
        <p className="mb-4 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#8c6a44]">
          <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#b8956a] font-serif text-[14px] normal-case tracking-normal text-[#8c6a44]">
            {number}
          </span>
          Étape {number}
        </p>
        <h2 className="font-serif text-[clamp(28px,3.4vw,40px)] leading-[1.16] tracking-[-0.02em] text-[#1a2a22]">{title}</h2>
        <p className="mt-4 font-serif text-[18px] italic leading-[1.58] text-[#3d4d43]">{description}</p>
        <p className="mt-5 border-t border-[#d4cdbd] pt-4 text-[11px] uppercase tracking-[0.14em] text-[#8a8578]">
          <strong className="font-medium text-[#8c6a44]">{note}</strong>
        </p>
      </div>
    </section>
  )
}

function SetupVisual() {
  return (
    <svg className="h-auto w-full drop-shadow-[0_20px_40px_rgba(15,61,46,0.08)]" viewBox="0 0 440 340" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#ece6da" height="340" width="440" x="0" y="0" />
      <line opacity="0.25" stroke="#b8956a" strokeDasharray="3 5" strokeWidth="0.5" x1="60" x2="380" y1="170" y2="170" />

      <g transform="translate(34 34)">
        <text fill="#8c6a44" fontFamily="Inter" fontSize="9" letterSpacing="3" x="0" y="12">
          JOUR CLÉ À RELANCER
        </text>
        <line opacity="0.5" stroke="#b8956a" strokeWidth="0.5" x1="0" x2="114" y1="22" y2="22" />
      </g>

      <g transform="translate(128 54) rotate(-2)">
        <rect fill="#0f3d2e" height="214" opacity="0.1" rx="5" width="164" x="4" y="8" />
        <rect fill="#f2ede4" height="214" rx="5" stroke="#b8956a" strokeWidth="1.5" width="164" x="0" y="0" />
        <path d="M12 12 L12 24 M12 12 L24 12" fill="none" stroke="#b8956a" strokeWidth="1.2" />
        <path d="M152 12 L152 24 M152 12 L140 12" fill="none" stroke="#b8956a" strokeWidth="1.2" />
        <path d="M12 202 L12 190 M12 202 L24 202" fill="none" stroke="#b8956a" strokeWidth="1.2" />
        <path d="M152 202 L152 190 M152 202 L140 202" fill="none" stroke="#b8956a" strokeWidth="1.2" />

        <text fill="#1a2a22" fontFamily="Cormorant Garamond" fontSize="14" letterSpacing="6" textAnchor="middle" x="82" y="44">
          CARDIN
        </text>
        <line opacity="0.6" stroke="#b8956a" strokeWidth="0.5" x1="40" x2="124" y1="58" y2="58" />
        <text fill="#8a8578" fontFamily="Inter" fontSize="7" letterSpacing="2.5" textAnchor="middle" x="82" y="82">
          SAISON À CONFIGURER
        </text>
        <text fill="#0f3d2e" fontFamily="Cormorant Garamond" fontSize="17" fontStyle="italic" textAnchor="middle" x="82" y="108">
          Mardi faible
        </text>
        <text fill="#3d4d43" fontFamily="Cormorant Garamond" fontSize="13" fontStyle="italic" textAnchor="middle" x="82" y="128">
          une table peut tomber
        </text>
        <circle cx="82" cy="154" fill="#b8956a" r="6" />
        <circle cx="82" cy="154" fill="none" opacity="0.45" r="18" stroke="#b8956a" strokeWidth="1" />
        <text fill="#8a8578" fontFamily="Inter" fontSize="7" letterSpacing="2.5" textAnchor="middle" x="82" y="188">
          DIAMOND EN JEU
        </text>
        <text fill="#1a2a22" fontFamily="Cormorant Garamond" fontSize="15" textAnchor="middle" x="82" y="206">
          1 repas / mois
        </text>
      </g>
    </svg>
  )
}

function CounterVisual() {
  return (
    <svg className="h-auto w-full drop-shadow-[0_20px_40px_rgba(15,61,46,0.08)]" viewBox="0 0 440 340" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#ece6da" height="340" width="440" x="0" y="0" />

      <g transform="translate(120 46)">
        <rect fill="#f2ede4" height="248" rx="6" stroke="#b8956a" strokeWidth="1.6" width="200" x="0" y="0" />
        <path d="M10 10 L10 22 M10 10 L22 10" fill="none" stroke="#b8956a" strokeWidth="1.2" />
        <path d="M190 10 L190 22 M190 10 L178 10" fill="none" stroke="#b8956a" strokeWidth="1.2" />
        <path d="M10 238 L10 226 M10 238 L22 238" fill="none" stroke="#b8956a" strokeWidth="1.2" />
        <path d="M190 238 L190 226 M190 238 L178 238" fill="none" stroke="#b8956a" strokeWidth="1.2" />

        <text fill="#8c6a44" fontFamily="Inter" fontSize="9" letterSpacing="3" textAnchor="middle" x="100" y="28">
          EN CE MOMENT ICI
        </text>
        <text fill="#1a2a22" fontFamily="Cormorant Garamond" fontSize="28" fontStyle="italic" textAnchor="middle" x="100" y="78">
          Mardi
        </text>
        <text fill="#0f3d2e" fontFamily="Cormorant Garamond" fontSize="16" textAnchor="middle" x="100" y="104">
          une table peut être offerte
        </text>

        <line opacity="0.55" stroke="#b8956a" strokeWidth="0.5" x1="44" x2="156" y1="122" y2="122" />

        <text fill="#8a8578" fontFamily="Inter" fontSize="8" letterSpacing="2.4" textAnchor="middle" x="100" y="146">
          DIAMOND
        </text>
        <text fill="#1a2a22" fontFamily="Cormorant Garamond" fontSize="16" textAnchor="middle" x="100" y="170">
          1 repas / mois pendant 1 an
        </text>

        <rect fill="none" height="44" rx="4" stroke="#8a8578" strokeWidth="0.8" width="44" x="78" y="190" />
        <path d="M84 196 h8 v8 h-8 z M95 196 h4 v4 h-4 z M104 196 h10 v10 h-10 z M84 208 h5 v5 h-5 z M92 206 h8 v8 h-8 z M103 209 h4 v4 h-4 z M110 208 h4 v4 h-4 z M84 218 h10 v10 h-10 z M97 220 h4 v4 h-4 z M104 218 h10 v10 h-10 z" fill="#1a2a22" />
        <text fill="#8a8578" fontFamily="Inter" fontSize="7" letterSpacing="2.2" textAnchor="middle" x="100" y="248">
          SCANNEZ. VOUS ÊTES DEDANS.
        </text>
      </g>

      <g transform="translate(42 220)">
        <circle cx="20" cy="18" fill="#3d4d43" r="11" />
        <path d="M9 32 Q9 60 20 88 L32 88 Q32 60 32 32 Z" fill="#3d4d43" />
      </g>
      <path d="M90 220 Q124 180 150 164" fill="none" opacity="0.7" stroke="#b8956a" strokeDasharray="3 3" strokeWidth="1.5" />
      <path d="M148 159 L150 164 L144 166" fill="none" opacity="0.7" stroke="#b8956a" strokeWidth="1.5" />
      <text fill="#8c6a44" fontFamily="Cormorant Garamond" fontSize="11" fontStyle="italic" opacity="0.9" x="108" y="204">
        il voit
      </text>
    </svg>
  )
}

function ClientVisual() {
  return (
    <svg className="h-auto w-full drop-shadow-[0_20px_40px_rgba(15,61,46,0.08)]" viewBox="0 0 440 340" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#ece6da" height="340" width="440" x="0" y="0" />

      <g transform="translate(90 46)">
        <rect fill="#0f3d2e" height="232" opacity="0.08" rx="28" width="144" x="10" y="10" />
        <rect fill="#f7f3eb" height="232" rx="28" stroke="#b8956a" strokeWidth="1.5" width="144" x="0" y="0" />
        <rect fill="#ebe5d8" height="8" rx="4" width="44" x="50" y="12" />

        <text fill="#8a8578" fontFamily="Inter" fontSize="7" letterSpacing="2.2" textAnchor="middle" x="72" y="42">
          SAISON EN COURS
        </text>
        <text fill="#0f3d2e" fontFamily="Cormorant Garamond" fontSize="18" fontStyle="italic" textAnchor="middle" x="72" y="66">
          Vous êtes dedans.
        </text>

        <rect fill="#f2ede4" height="58" rx="8" stroke="#d4cdbd" strokeWidth="1" width="112" x="16" y="84" />
        <text fill="#8a8578" fontFamily="Inter" fontSize="7" letterSpacing="2" x="30" y="102">
          CETTE SEMAINE
        </text>
        <text fill="#1a2a22" fontFamily="Cormorant Garamond" fontSize="13" x="30" y="122">
          Mardi : une table
        </text>
        <text fill="#1a2a22" fontFamily="Cormorant Garamond" fontSize="13" x="30" y="136">
          peut être offerte
        </text>

        <text fill="#8a8578" fontFamily="Inter" fontSize="7" letterSpacing="2.2" textAnchor="middle" x="72" y="166">
          RETOUR
        </text>
        <line opacity="0.45" stroke="#d4cdbd" strokeWidth="4" x1="28" x2="116" y1="186" y2="186" />
        <line opacity="0.95" stroke="#b8956a" strokeWidth="4" x1="28" x2="82" y1="186" y2="186" />
        <circle cx="28" cy="186" fill="#b8956a" r="8" />
        <circle cx="72" cy="186" fill="#b8956a" r="8" />
        <circle cx="116" cy="186" fill="none" r="8" stroke="#b8956a" strokeDasharray="2 2" />

        <text fill="#8a8578" fontFamily="Inter" fontSize="7" letterSpacing="2.2" textAnchor="middle" x="72" y="214">
          DIAMOND
        </text>
        <text fill="#0f3d2e" fontFamily="Cormorant Garamond" fontSize="16" textAnchor="middle" x="72" y="236">
          1 repas / mois
        </text>
      </g>

      <g transform="translate(270 104)">
        <text fill="#8c6a44" fontFamily="Inter" fontSize="9" letterSpacing="3" x="0" y="0">
          LE CLIENT COMPREND
        </text>
        <line opacity="0.55" stroke="#b8956a" strokeWidth="0.5" x1="0" x2="112" y1="10" y2="10" />
        <text fill="#3d4d43" fontFamily="Cormorant Garamond" fontSize="16" fontStyle="italic" x="0" y="38">
          ce qui se passe,
        </text>
        <text fill="#3d4d43" fontFamily="Cormorant Garamond" fontSize="16" fontStyle="italic" x="0" y="58">
          quand revenir,
        </text>
        <text fill="#3d4d43" fontFamily="Cormorant Garamond" fontSize="16" fontStyle="italic" x="0" y="78">
          et ce qui reste en jeu.
        </text>
      </g>
    </svg>
  )
}

function SeasonVisual() {
  return (
    <svg className="h-auto w-full drop-shadow-[0_20px_40px_rgba(15,61,46,0.08)]" viewBox="0 0 440 340" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#ece6da" height="340" width="440" x="0" y="0" />

      <g transform="translate(52 88)">
        <text fill="#8c6a44" fontFamily="Inter" fontSize="9" letterSpacing="3" x="120" y="0">
          SAISON CARDIN
        </text>
        <line opacity="0.4" stroke="#b8956a" strokeDasharray="4 5" strokeWidth="1" x1="0" x2="310" y1="76" y2="76" />

        <circle cx="36" cy="76" fill="#b8956a" r="11" />
        <text fill="#f2ede4" fontFamily="Cormorant Garamond" fontSize="12" textAnchor="middle" x="36" y="80">
          1
        </text>
        <text fill="#3d4d43" fontFamily="Cormorant Garamond" fontSize="12" fontStyle="italic" textAnchor="middle" x="36" y="108">
          scan
        </text>

        <circle cx="116" cy="76" fill="#b8956a" r="11" />
        <text fill="#f2ede4" fontFamily="Cormorant Garamond" fontSize="12" textAnchor="middle" x="116" y="80">
          2
        </text>
        <text fill="#3d4d43" fontFamily="Cormorant Garamond" fontSize="12" fontStyle="italic" textAnchor="middle" x="116" y="108">
          retour
        </text>

        <circle cx="196" cy="76" fill="#0f3d2e" r="13" />
        <text fill="#f2ede4" fontFamily="Cormorant Garamond" fontSize="13" textAnchor="middle" x="196" y="81">
          3
        </text>
        <text fill="#0f3d2e" fontFamily="Cormorant Garamond" fontSize="12" fontStyle="italic" textAnchor="middle" x="196" y="108">
          moment actif
        </text>

        <circle cx="278" cy="76" fill="none" r="11" stroke="#b8956a" strokeDasharray="2 2" />
        <text fill="#b8956a" fontFamily="Cormorant Garamond" fontSize="12" textAnchor="middle" x="278" y="80">
          ◆
        </text>
        <text fill="#8a8578" fontFamily="Cormorant Garamond" fontSize="12" fontStyle="italic" textAnchor="middle" x="278" y="108">
          Diamond
        </text>
      </g>

      <g transform="translate(110 194)">
        <rect fill="#f2ede4" height="78" rx="6" stroke="#b8956a" strokeWidth="1.2" width="220" x="0" y="0" />
        <path d="M10 10 L10 20 M10 10 L20 10" fill="none" stroke="#b8956a" strokeWidth="1" />
        <path d="M210 10 L210 20 M210 10 L200 10" fill="none" stroke="#b8956a" strokeWidth="1" />
        <path d="M10 68 L10 58 M10 68 L20 68" fill="none" stroke="#b8956a" strokeWidth="1" />
        <path d="M210 68 L210 58 M210 68 L200 68" fill="none" stroke="#b8956a" strokeWidth="1" />
        <text fill="#8a8578" fontFamily="Inter" fontSize="8" letterSpacing="2.2" textAnchor="middle" x="110" y="24">
          LE LIEU GAGNE AVANT LA FIN
        </text>
        <text fill="#0f3d2e" fontFamily="Cormorant Garamond" fontSize="18" fontStyle="italic" textAnchor="middle" x="110" y="48">
          plus de retours · plus de rythme
        </text>
        <text fill="#3d4d43" fontFamily="Cormorant Garamond" fontSize="13" fontStyle="italic" textAnchor="middle" x="110" y="64">
          le Diamond garde simplement la tension
        </text>
      </g>
    </svg>
  )
}
