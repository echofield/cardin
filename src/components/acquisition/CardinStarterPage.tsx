"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"

import { ParcoursParticles } from "@/components/parcours-v2/ParcoursParticles"
import { CARDIN_CONTACT_EMAIL, buildContactMailto } from "@/lib/site-contact"

const DIFFERENCES = [
  {
    title: "Visible à l'entrée",
    detail: "Pas une mécanique cachée. Un moment que le client comprend en quelques secondes.",
  },
  {
    title: "Un retour cadré",
    detail: "Le lieu choisit un jour clé, un moment clair, et donne une vraie raison de revenir.",
  },
  {
    title: "Un horizon rare",
    detail: "Le Diamond reste visible pendant la saison et garde la tension jusqu'au bout.",
  },
] as const

const STEPS = [
  {
    label: "Lecture",
    title: "On choisit le bon moment",
    detail: "Le jour faible, le moment visible, et la récompense qui reste crédible.",
  },
  {
    label: "Comptoir",
    title: "Le client voit",
    detail: "Un QR, une phrase claire, et le Diamond en jeu.",
  },
  {
    label: "Scan",
    title: "Il entre",
    detail: "Le client scanne et comprend qu'il est dans la saison.",
  },
  {
    label: "Retour",
    title: "Il revient",
    detail: "Le moment de la semaine lui redonne un rendez-vous précis.",
  },
  {
    label: "Sommet",
    title: "Le Diamond tient",
    detail: "Le lieu gagne d'abord. Le Diamond donne l'horizon rare.",
  },
] as const

const STATS = [
  {
    value: "+25 %",
    label: "de valeur sur les clients les plus actifs",
  },
  {
    value: "jour faible",
    label: "remis au centre avec un moment clair",
  },
  {
    value: "0 %",
    label: "de commission sur les ventes du lieu",
  },
  {
    value: "1 moteur",
    label: "pour l'entrée 30 jours puis la saison 90 jours",
  },
] as const

const FIRST_MONTH_CONTACT_HREF = buildContactMailto(
  "Cardin · premier mois",
  "Bonjour Cardin,\r\n\r\nJe veux échanger sur le Premier mois Cardin et voir si c'est adapté à mon lieu.\r\n",
)

const SEASON_CONTACT_HREF = buildContactMailto(
  "Cardin · saison complète",
  "Bonjour Cardin,\r\n\r\nJe veux échanger sur une saison Cardin complète pour mon lieu.\r\n",
)

const ENTRY_CARDS = [
  {
    tag: "Entrée Cardin",
    title: "Premier mois Cardin",
    signal: "contact direct",
    detail:
      "Un premier mois simple pour lancer le lieu, poser un moment visible et tester le retour sans complexité lourde.",
    meta: ["30 jours", "1 moment cadré", "même moteur Cardin"],
    cta: "Échanger avec Cardin",
    href: FIRST_MONTH_CONTACT_HREF,
    external: true,
    featured: true,
    tax: null,
  },
  {
    tag: "Saison complète",
    title: "Saison Cardin",
    signal: "sur échange",
    detail:
      "Le moteur complet sur 90 jours, avec rythme de saison, montée vers le Diamond et calibrage plus profond du lieu.",
    meta: ["90 jours", "Diamond visible", "calibrage complet"],
    cta: "Préparer la saison",
    href: SEASON_CONTACT_HREF,
    external: true,
    featured: false,
    tax: null,
  },
] as const

const STARTER_MOMENTS = [
  {
    vertical: "restaurant",
    place: "Bistro du Canal",
    day: "Mardi",
    weeklyMoment: "un dîner offert",
    weeklyDetail: "pour remettre un vrai rendez-vous dans la semaine.",
    summitTitle: "Un dîner offert",
    summitDetail: "par mois pendant un an",
    activity: "Mardi · un dîner offert peut tomber.",
  },
  {
    vertical: "café",
    place: "Café Montmartre",
    day: "Mercredi",
    weeklyMoment: "un café signature offert",
    weeklyDetail: "pour faire revenir plus vite les habitués.",
    summitTitle: "Un café offert",
    summitDetail: "par semaine pendant un an",
    activity: "Mercredi · un café signature peut tomber.",
  },
  {
    vertical: "bar",
    place: "Bar Saint-Honoré",
    day: "Vendredi",
    weeklyMoment: "une bouteille peut tomber",
    weeklyDetail: "pour créer une vraie énergie de comptoir.",
    summitTitle: "Une bouteille offerte",
    summitDetail: "par mois pendant un an",
    activity: "Vendredi · une bouteille peut tomber.",
  },
  {
    vertical: "beauté",
    place: "Maison Beauté",
    day: "Jeudi",
    weeklyMoment: "un soin offert",
    weeklyDetail: "pour transformer le passage en retour choisi.",
    summitTitle: "Un soin offert",
    summitDetail: "par trimestre pendant un an",
    activity: "Jeudi · un soin offert peut tomber.",
  },
  {
    vertical: "boutique",
    place: "Atelier Marais",
    day: "Samedi",
    weeklyMoment: "100 € boutique à gagner",
    weeklyDetail: "pour donner une vraie scène au lieu et au désir.",
    summitTitle: "100 € boutique",
    summitDetail: "par mois pendant un an",
    activity: "Samedi · 100 € boutique peuvent tomber.",
  },
] as const

const PETIT_SOUVENIR_POINTS = [
  "Cardin fait revenir les clients existants.",
  "Petit Souvenir peut aussi donner une visibilité locale plus choisie que Google.",
  "Le lieu gagne donc sur le retour, et peut aussi entrer dans un circuit de recommandation du quartier.",
] as const

function formatMeta(meta: readonly string[]) {
  return meta.join(" · ")
}

export function CardinStarterPage() {
  const rootRef = useRef<HTMLElement | null>(null)
  const heroKickerRef = useRef<HTMLParagraphElement | null>(null)
  const heroBrandRef = useRef<HTMLHeadingElement | null>(null)
  const heroTitleRef = useRef<HTMLParagraphElement | null>(null)
  const heroSubRef = useRef<HTMLParagraphElement | null>(null)
  const heroCtasRef = useRef<HTMLDivElement | null>(null)
  const heroMetaRef = useRef<HTMLParagraphElement | null>(null)
  const engineStageRef = useRef<HTMLDivElement | null>(null)

  const [isFlipped, setIsFlipped] = useState(false)
  const [visits, setVisits] = useState(8)
  const [day, setDay] = useState(42)
  const [momentIndex, setMomentIndex] = useState(0)
  const [diamondCount, setDiamondCount] = useState(2)

  const progress = Math.min(100, Math.round((day / 90) * 100))
  const currentMoment = STARTER_MOMENTS[momentIndex % STARTER_MOMENTS.length]
  const activity = currentMoment.activity
  const challengeCta = ENTRY_CARDS[0]
  const challengeCtaTarget = challengeCta.href.startsWith("mailto:") ? undefined : "_blank"

  const metaLine = useMemo(() => "Restaurants · cafés · bars · boutiques · beauté", [])

  useEffect(() => {
    const flipTimer = window.setInterval(() => {
      setIsFlipped((current) => !current)
    }, 9000)

    const momentTimer = window.setInterval(() => {
      setMomentIndex((current) => current + 1)
    }, 5200)

    const visitTimer = window.setInterval(() => {
      setVisits((current) => current + 1)
    }, 12000)

    const dayTimer = window.setInterval(() => {
      setDay((current) => {
        const next = current >= 90 ? 90 : current + 1
        if (next >= 58) setDiamondCount(3)
        return next
      })
    }, 6500)

    return () => {
      window.clearInterval(flipTimer)
      window.clearInterval(momentTimer)
      window.clearInterval(visitTimer)
      window.clearInterval(dayTimer)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const revealNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"))

    if (reduceMotion) {
      gsap.set(
        [
          heroKickerRef.current,
          heroBrandRef.current,
          heroTitleRef.current,
          heroSubRef.current,
          heroCtasRef.current,
          heroMetaRef.current,
          engineStageRef.current,
          ...revealNodes,
        ],
        { autoAlpha: 1, y: 0 },
      )
      return
    }

    const intro = gsap.timeline({ delay: 0.15 })
    intro
      .fromTo(heroKickerRef.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" })
      .fromTo(heroBrandRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.28")
      .fromTo(heroTitleRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.72, ease: "power2.out" }, "-=0.5")
      .fromTo(heroSubRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.34")
      .fromTo(heroCtasRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.24")
      .fromTo(heroMetaRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.2")
      .fromTo(engineStageRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, "-=1.1")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const node = entry.target as HTMLElement
          gsap.to(node, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" })
          observer.unobserve(node)
        })
      },
      { threshold: 0.16, rootMargin: "0px 0px -48px 0px" },
    )

    revealNodes.forEach((node) => {
      gsap.set(node, { autoAlpha: 0, y: 18 })
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

      <section className="relative z-[2] mx-auto grid min-h-[92dvh] max-w-[1240px] gap-10 px-5 pb-14 pt-24 sm:px-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-center md:gap-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:px-10 xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-16 xl:px-12">
        <div className="text-left">
          <p className="mb-4 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]" ref={heroKickerRef}>
            <span className="h-px w-[14px] bg-[#b8956a]/70" />
            Commencer avec Cardin
          </p>
          <h1 className="font-serif text-[clamp(48px,15vw,92px)] leading-[0.96] tracking-[-0.03em] text-[#1a2a22]" ref={heroBrandRef}>
            Cardin
          </h1>
          <p className="mt-4 max-w-[560px] font-serif text-[clamp(20px,6.6vw,32px)] leading-[1.2] tracking-[-0.01em] text-[#1a2a22]" ref={heroTitleRef}>
            Le système qui
            <em className="mx-2 font-medium italic text-[#0f3d2e]">fait revenir</em>
            vos clients.
          </p>
          <p className="mt-5 max-w-[540px] font-serif text-[15px] italic leading-[1.6] text-[#3d4d43] sm:text-[16px]" ref={heroSubRef}>
            Un premier mois simple pour lancer Cardin dans un lieu, poser un moment visible, faire scanner les clients,
            et commencer à transformer le passage en retour.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap" ref={heroCtasRef}>
            <a
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22] sm:w-auto sm:px-7 sm:text-[11px]"
              href={challengeCta.href}
              rel={challengeCta.external ? "noreferrer" : undefined}
              target={challengeCta.external ? challengeCtaTarget : undefined}
            >
              {challengeCta.cta}
              <span className="text-[14px]">→</span>
            </a>
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[2px] border border-[#d4cdbd] px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-[#1a2a22] transition hover:border-[#0f3d2e] hover:bg-[rgba(15,61,46,0.03)] hover:text-[#0f3d2e] sm:w-auto sm:px-7 sm:text-[11px]"
              href="/parcours/lecture"
            >
              Voir la saison complète
            </Link>
          </div>

          <p className="mt-5 text-[10px] uppercase leading-5 tracking-[0.18em] text-[#8a8578]" ref={heroMetaRef}>
            Contact direct <span className="mx-2 text-[#b8956a]">·</span> Premier échange sans paiement en ligne{" "}
            <span className="mx-2 text-[#b8956a]">·</span> {metaLine}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] md:max-w-[320px] lg:max-w-[380px] xl:max-w-[460px]" ref={engineStageRef}>
          <div className="pointer-events-none absolute inset-[-12px] rounded-[12px] border border-dashed border-[#b8956a]/30 sm:inset-[-16px] lg:inset-[-22px]" />
          <div className="pointer-events-none absolute inset-[-22px] rounded-[18px] border border-[#b8956a]/15 sm:inset-[-28px] lg:inset-[-38px]" />

          <div className="relative h-[500px] [perspective:1800px] sm:h-[540px] md:h-[500px] lg:h-[540px] xl:h-[570px]">
            <div
              className="relative h-full w-full transition-transform duration-[1200ms] [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(0.68,-0.2,0.265,1.2)]"
              style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <article className="relative flex h-full flex-col overflow-hidden rounded-[6px] border border-[#b8956a] bg-[radial-gradient(circle_at_15%_10%,rgba(184,149,106,0.08),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(15,61,46,0.04),transparent_45%),#f2ede4] px-4 pb-4 pt-6 shadow-[0_24px_60px_rgba(15,61,46,0.1),0_48px_100px_rgba(15,61,46,0.06)] sm:px-5 sm:pb-5 sm:pt-7 xl:px-7 xl:pb-6 xl:pt-8">
                  <div className="pointer-events-none absolute inset-[1px] rounded-[6px] border border-[#b8956a]/40" />
                  <span className="absolute left-[10px] top-[10px] h-[14px] w-[14px] border-l border-t border-[#b8956a]/60" />
                  <span className="absolute right-[10px] top-[10px] h-[14px] w-[14px] border-r border-t border-[#b8956a]/60" />
                  <span className="absolute bottom-[10px] left-[10px] h-[14px] w-[14px] border-b border-l border-[#b8956a]/60" />
                  <span className="absolute bottom-[10px] right-[10px] h-[14px] w-[14px] border-b border-r border-[#b8956a]/60" />

                  <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#d4b892] bg-[rgba(15,61,46,0.05)] px-3 py-1 text-[8px] uppercase tracking-[0.2em] text-[#8c6a44]">
                    <span className="relative h-[6px] w-[6px] rounded-full bg-[#0f3d2e] before:absolute before:inset-[-3px] before:animate-[pulse-live_1.8s_ease-in-out_infinite] before:rounded-full before:bg-[#0f3d2e]/35" />
                    Cardin en cours
                  </div>

                  <div className="mt-4 text-center sm:mt-5">
                    <p className="font-serif text-[12px] tracking-[0.34em] text-[#1a2a22] sm:text-[13px] xl:text-[14px]">CARDIN</p>
                    <p className="mt-1 text-[7px] uppercase tracking-[0.24em] text-[#8a8578] sm:text-[8px] sm:tracking-[0.3em]">Saison · {currentMoment.place}</p>
                  </div>

                  <div className="mt-4 border-y border-[#d4cdbd] px-3 py-3 text-center sm:mt-5 sm:px-4 sm:py-4">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-[#8c6a44]">À gagner</p>
                    <p className="mt-2 font-serif text-[18px] leading-[1.2] text-[#1a2a22] sm:text-[20px] xl:text-[22px]">
                      <em className="italic text-[#0f3d2e]">{currentMoment.summitTitle}</em>
                    </p>
                    <p className="mt-1 font-serif text-[10px] italic text-[#3d4d43] sm:text-[11px] xl:text-[12px]">{currentMoment.summitDetail}</p>
                  </div>

                  <div className="mt-4 border-y border-[#d4cdbd] px-3 py-3 text-center sm:mt-5 sm:px-4 sm:py-4">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-[#8c6a44]">Cette semaine</p>
                    <p className="mt-2 font-serif text-[18px] leading-[1.2] text-[#1a2a22] sm:text-[20px] xl:text-[22px]">
                      {currentMoment.day},
                      <em className="ml-1 italic text-[#0f3d2e]">{currentMoment.weeklyMoment}</em>
                    </p>
                    <p className="mt-1 font-serif text-[10px] italic text-[#3d4d43] sm:text-[11px] xl:text-[12px]">{currentMoment.weeklyDetail}</p>
                  </div>

                  <div className="mt-4 sm:mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[8px] uppercase tracking-[0.24em] text-[#8a8578]">Progression</span>
                      <span className="font-serif text-[12px] italic text-[#8c6a44]">{diamondCount} sur 4</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {Array.from({ length: 4 }, (_, index) => {
                        const isFilled = index < diamondCount
                        const isCurrent = index === diamondCount
                        return (
                          <div
                            className={[
                              "relative flex aspect-square items-center justify-center rounded-[3px] border font-serif text-[14px] transition sm:text-[15px] xl:text-[16px]",
                              isFilled
                                ? "border-[#b8956a] bg-[rgba(184,149,106,0.12)] text-[#8c6a44]"
                                : isCurrent
                                  ? "border-[#0f3d2e] bg-[rgba(15,61,46,0.06)] text-[#0f3d2e]"
                                  : "border-[#d4b892] bg-[rgba(184,149,106,0.03)] text-[#d4b892]",
                            ].join(" ")}
                            key={index}
                          >
                            {isFilled || isCurrent ? "◆" : "◇"}
                            {isCurrent ? <span className="absolute inset-[-3px] rounded-[4px] border border-[#0f3d2e]/40 animate-[pulse-current_2s_ease-in-out_infinite]" /> : null}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5">
                    <div className="mb-2 flex items-center justify-between text-[8px] uppercase tracking-[0.22em] text-[#8a8578]">
                      <span>Saison en cours</span>
                      <span className="font-serif text-[11px] italic normal-case tracking-normal text-[#8c6a44]">jour {day} / 90</span>
                    </div>
                    <div className="h-[3px] overflow-hidden rounded-full bg-[rgba(212,205,189,0.45)]">
                      <div
                        className="relative h-full rounded-full bg-[linear-gradient(90deg,#b8956a_0%,#8c6a44_100%)] transition-[width] duration-[1500ms]"
                        style={{ width: `${progress}%` }}
                      >
                        <span className="absolute right-[-4px] top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-[#8c6a44] shadow-[0_0_8px_rgba(140,106,68,0.45)]" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-[4px] border border-[#d4b892] bg-[rgba(184,149,106,0.04)] px-3 py-3 sm:mt-5 sm:px-4">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.24em] text-[#8a8578]">Passages validés</p>
                      <p className="mt-1 font-serif text-[18px] leading-none text-[#1a2a22] sm:text-[20px] xl:text-[22px]">{visits}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase tracking-[0.24em] text-[#8a8578]">Lecture</p>
                      <p className="mt-1 font-serif text-[12px] italic text-[#8c6a44] sm:text-[13px] xl:text-[14px]">retour en hausse</p>
                    </div>
                  </div>

                  <div className="mt-auto rounded-[3px] border border-dashed border-[#d4cdbd] bg-[rgba(15,61,46,0.03)] px-3 py-3">
                    <p className="flex items-center gap-2 font-serif text-[11px] italic leading-[1.45] text-[#3d4d43] xl:text-[12px]">
                      <span className="h-[4px] w-[4px] rounded-full bg-[#0f3d2e]" />
                      {activity}
                    </p>
                  </div>
                </article>
              </div>

              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <article className="relative flex h-full flex-col rounded-[6px] border border-[#b8956a] bg-[linear-gradient(180deg,#f5efe3,#f2ede4)] px-4 pb-4 pt-6 shadow-[0_24px_60px_rgba(15,61,46,0.1),0_48px_100px_rgba(15,61,46,0.06)] sm:px-5 sm:pb-5 sm:pt-7 xl:px-7 xl:pb-6 xl:pt-8">
                  <span className="absolute left-[10px] top-[10px] h-[14px] w-[14px] border-l border-t border-[#b8956a]/60" />
                  <span className="absolute right-[10px] top-[10px] h-[14px] w-[14px] border-r border-t border-[#b8956a]/60" />
                  <span className="absolute bottom-[10px] left-[10px] h-[14px] w-[14px] border-b border-l border-[#b8956a]/60" />
                  <span className="absolute bottom-[10px] right-[10px] h-[14px] w-[14px] border-b border-r border-[#b8956a]/60" />

                  <div className="mt-4 text-center">
                    <p className="font-serif text-[12px] tracking-[0.34em] text-[#1a2a22] sm:text-[13px] xl:text-[14px]">CARDIN</p>
                    <p className="mt-1 text-[7px] uppercase tracking-[0.24em] text-[#8c6a44] sm:text-[8px] sm:tracking-[0.3em]">{currentMoment.vertical}</p>
                  </div>

                  <div className="my-auto flex flex-col gap-3 sm:gap-4">
                    {[
                      ["Fréquence de retour", "plus lisible"],
                      ["Moment de la semaine", currentMoment.day.toLowerCase()],
                      ["Lieu", currentMoment.vertical],
                      ["Diamond", "horizon visible"],
                    ].map(([label, value]) => (
                      <div className="grid grid-cols-[1fr_auto] items-end gap-4 border-b border-dashed border-[#d4b892] pb-3" key={label}>
                        <span className="font-serif text-[12px] italic leading-[1.4] text-[#3d4d43] sm:text-[13px] xl:text-[14px]">{label}</span>
                        <span className="font-serif text-[18px] leading-none text-[#0f3d2e] sm:text-[20px] xl:text-[22px]">{value}</span>
                      </div>
                    ))}
                  </div>

                  <p className="border-t border-[#d4cdbd] pt-4 text-center font-serif text-[10px] italic text-[#8a8578] sm:text-[11px] xl:text-[12px]">
                    Le premier mois pose déjà le rythme qui peut ensuite devenir une vraie saison.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-[2] mx-auto max-w-[1080px] px-6 md:px-8 lg:px-12">
        <div className="grid border-y border-[#d4cdbd] md:grid-cols-3" data-reveal>
          {DIFFERENCES.map((item) => (
            <article className="border-b border-[#d4cdbd] px-6 py-8 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0" key={item.title}>
              <p className="font-serif text-[16px] italic text-[#b8956a]">◇</p>
              <h2 className="mt-3 font-serif text-[20px] leading-[1.34] text-[#1a2a22]">{item.title}</h2>
              <p className="mx-auto mt-2 max-w-[240px] font-serif text-[14px] italic leading-[1.55] text-[#3d4d43]">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[1100px] px-6 md:px-8 lg:px-12">
        <div className="text-center" data-reveal>
          <p className="mb-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
            Le parcours
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
          </p>
          <h2 className="font-serif text-[clamp(28px,3.4vw,36px)] leading-[1.18] tracking-[-0.015em] text-[#1a2a22]">
            De la lecture du lieu
            <em className="ml-2 font-medium italic text-[#0f3d2e]">au retour visible.</em>
          </h2>
        </div>

        <div className="relative mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="pointer-events-none absolute left-[10%] right-[10%] top-[18px] hidden h-px bg-[#b8956a]/35 xl:block" />
          {STEPS.map((step, index) => (
            <article className="relative text-center md:text-left xl:text-center" data-reveal key={step.label}>
              <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#b8956a] bg-[#ebe5d8] font-serif text-[16px] text-[#8c6a44] md:mx-0 xl:mx-auto">
                {index + 1}
              </div>
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#8a8578]">{step.label}</p>
              <h3 className="mt-2 font-serif text-[17px] leading-[1.35] text-[#1a2a22]">{step.title}</h3>
              <p className="mt-2 font-serif text-[13px] italic leading-[1.5] text-[#3d4d43]">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[1040px] px-6 md:px-8 lg:px-12">
        <div className="text-center" data-reveal>
          <p className="mb-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
            Ce que ça change
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
          </p>
          <h2 className="font-serif text-[clamp(28px,3.4vw,36px)] leading-[1.18] tracking-[-0.015em] text-[#1a2a22]">
            Cardin n'ajoute pas juste un outil.
            <em className="ml-2 font-medium italic text-[#0f3d2e]">Il change le retour.</em>
          </h2>
        </div>

        <div className="mt-10 grid border-y border-[#d4cdbd] sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {STATS.map((stat) => (
            <article className="border-b border-[#d4cdbd] px-6 py-8 text-center last:border-b-0 sm:border-r sm:even:border-r-0 lg:border-b-0 lg:border-r lg:last:border-r-0" key={stat.label}>
              <p className="font-serif text-[clamp(28px,3.5vw,38px)] leading-[1.1] text-[#1a2a22]">{stat.value}</p>
              <p className="mx-auto mt-3 max-w-[180px] font-serif text-[13px] italic leading-[1.5] text-[#3d4d43]">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[860px] px-6 text-center md:px-8 lg:px-12" data-reveal>
        <p className="mb-4 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
          <span className="h-px w-[18px] bg-[#b8956a]/70" />
          En plus du retour
          <span className="h-px w-[18px] bg-[#b8956a]/70" />
        </p>
        <h2 className="font-serif text-[clamp(26px,3vw,34px)] leading-[1.24] tracking-[-0.015em] text-[#1a2a22]">
          Certains lieux Cardin peuvent aussi entrer dans
          <em className="ml-2 font-medium italic text-[#0f3d2e]">Petit Souvenir.</em>
        </h2>
        <div className="mx-auto mt-6 max-w-[720px] rounded-[6px] border border-[#d4b892] bg-[linear-gradient(180deg,#f5efe3,#f2ede4)] px-6 py-6 text-left">
          <p className="font-serif text-[17px] italic leading-[1.6] text-[#3d4d43]">
            Petit Souvenir apporte un angle de distribution locale plus choisi que Google: voyageurs, hôtes, visiteurs du quartier,
            recommandations plus fines, circuit plus éditorial.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {PETIT_SOUVENIR_POINTS.map((point, index) => (
              <div className="rounded-[4px] border border-[#d4cdbd] bg-[#f2ede4]/75 px-4 py-4" key={point}>
                <p className="font-serif text-[12px] italic text-[#b8956a]">{["i.", "ii.", "iii."][index]}</p>
                <p className="mt-1 font-serif text-[14px] italic leading-[1.5] text-[#3d4d43]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[1040px] px-6 md:px-8 lg:px-12">
        <div className="text-center" data-reveal>
          <p className="mb-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
            Deux façons d'entrer
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
          </p>
          <h2 className="font-serif text-[clamp(28px,3.4vw,36px)] leading-[1.18] tracking-[-0.015em] text-[#1a2a22]">
            Commencer léger.
            <em className="ml-2 font-medium italic text-[#0f3d2e]">Puis installer Cardin pour de vrai.</em>
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {ENTRY_CARDS.map((card) => (
            <article
              className={[
                "relative rounded-[6px] border px-7 py-8 shadow-[0_12px_30px_rgba(15,61,46,0.04)]",
                card.featured
                  ? "border-[#c9b28d] bg-[linear-gradient(180deg,#fff8ef_0%,#f6efe3_100%)]"
                  : "border-[#d4cdbd] bg-[#f2ede4]",
              ].join(" ")}
              data-reveal
              key={card.title}
            >
              <span className="absolute left-[10px] top-[10px] h-[14px] w-[14px] border-l border-t border-[#b8956a]/60" />
              <span className="absolute bottom-[10px] right-[10px] h-[14px] w-[14px] border-b border-r border-[#b8956a]/60" />

              <span className="inline-flex rounded-full border border-[#d4b892] bg-[rgba(184,149,106,0.12)] px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-[#8c6a44]">
                {card.tag}
              </span>
              <h3 className="mt-4 font-serif text-[32px] leading-[1.08] tracking-[-0.02em] text-[#1a2a22]">
                {card.title} <em className="italic text-[#0f3d2e]">· {card.signal}</em>
              </h3>
              <p className="mt-4 font-serif text-[17px] italic leading-[1.58] text-[#3d4d43]">{card.detail}</p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#8a8578]">{formatMeta(card.meta)}</p>
              {card.tax ? <p className="mt-2 text-[11px] italic tracking-[0.06em] text-[#8a8578]">{card.tax}</p> : null}

              <div className="mt-7">
                {card.external ? (
                  <a
                    className="inline-flex items-center gap-3 rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
                    href={card.href}
                    rel="noreferrer"
                    target={card.href.startsWith("mailto:") ? undefined : "_blank"}
                  >
                    {card.cta}
                    <span className="text-[14px]">→</span>
                  </a>
                ) : (
                  <Link
                    className="inline-flex items-center gap-3 rounded-[2px] border border-[#0f3d2e] px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-[#0f3d2e] transition hover:bg-[rgba(15,61,46,0.04)]"
                    href={card.href}
                  >
                    {card.cta}
                    <span className="text-[14px]">→</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[760px] px-6 pb-20 text-center md:px-8 lg:px-12" data-reveal>
        <p className="font-serif text-[clamp(20px,2.4vw,26px)] italic leading-[1.55] text-[#1a2a22]">
          Commencez par un premier mois simple.
          <br />
          Passez ensuite à la saison complète si le rythme prend.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-7 py-3 text-[11px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
            href={challengeCta.href}
            rel={challengeCta.external ? "noreferrer" : undefined}
            target={challengeCta.external ? challengeCtaTarget : undefined}
          >
            Échanger avec Cardin
            <span className="text-[14px]">→</span>
          </a>
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-[2px] border border-[#d4cdbd] px-7 py-3 text-[11px] uppercase tracking-[0.22em] text-[#1a2a22] transition hover:border-[#0f3d2c] hover:bg-[rgba(15,61,46,0.03)] hover:text-[#0f3d2e]"
            href={SEASON_CONTACT_HREF}
            rel="noreferrer"
          >
            Préparer la saison
          </a>
        </div>
        <p className="mt-4 text-[11px] italic tracking-[0.08em] text-[#8a8578]">
          Contact direct · {CARDIN_CONTACT_EMAIL}
        </p>
      </section>

      <style jsx>{`
        @keyframes pulse-live {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(1.7);
            opacity: 0;
          }
        }

        @keyframes pulse-current {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.08);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  )
}
