"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"

import { calculateRecovery } from "@/lib/calculator"
import { CHALLENGE_PRICING, LANDING_PRICING, STRIPE_PAYMENT_LINK } from "@/lib/landing-content"
import { CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"

type RewardKey = "cafe" | "menu" | "experience"
type BusinessKey = "cafe" | "bar" | "restaurant" | "beaute" | "boutique"

type RewardConfig = {
  glyph: string
  label: string
  recoveryMultiplier: number
  steps: number
  stepLabels: string[]
}

type BusinessConfig = {
  avgTicket: number
  brand: string
  defaultReward: RewardKey
  label: string
  lossRate: number
  recoveryRate: number
}

const DAYS_OPEN = 26

const REWARDS: Record<RewardKey, RewardConfig> = {
  cafe: {
    glyph: "◇",
    label: "Café offert",
    recoveryMultiplier: 0.94,
    steps: 3,
    stepLabels: ["Première visite", "Deuxième visite", "Troisième visite"],
  },
  menu: {
    glyph: "◈",
    label: "Menu offert",
    recoveryMultiplier: 1,
    steps: 5,
    stepLabels: ["Visite 1", "Visite 2", "Visite 3", "Visite 4", "Visite 5"],
  },
  experience: {
    glyph: "◆",
    label: "Expérience",
    recoveryMultiplier: 1.08,
    steps: 8,
    stepLabels: ["Visite 1", "Visite 2", "Visite 3", "Visite 4", "Visite 5", "Visite 6", "Visite 7", "Visite 8"],
  },
}

const BUSINESSES: Record<BusinessKey, BusinessConfig> = {
  cafe: {
    avgTicket: 9,
    brand: "Le comptoir",
    defaultReward: "cafe",
    label: "Café",
    lossRate: 0.28,
    recoveryRate: 0.22,
  },
  bar: {
    avgTicket: 12,
    brand: "La maison",
    defaultReward: "menu",
    label: "Bar",
    lossRate: 0.28,
    recoveryRate: 0.2,
  },
  restaurant: {
    avgTicket: 17,
    brand: "La table",
    defaultReward: "menu",
    label: "Restaurant",
    lossRate: 0.32,
    recoveryRate: 0.16,
  },
  beaute: {
    avgTicket: 39,
    brand: "L'institut",
    defaultReward: "experience",
    label: "Beauté",
    lossRate: 0.36,
    recoveryRate: 0.15,
  },
  boutique: {
    avgTicket: 39,
    brand: "L'atelier",
    defaultReward: "experience",
    label: "Boutique",
    lossRate: 0.32,
    recoveryRate: 0.17,
  },
}

const LEGAL_LINKS = [
  { href: "/privacy", label: "Confidentialité" },
  { href: "/terms", label: "Conditions" },
  { href: "/legal", label: "Mentions" },
]

const OFFER_FRAMES = [
  {
    title: "Challenge Cardin",
    lead: "Le format d'activation. Court, visible, facile à raconter et à lancer.",
    detail: "Un cadre rapide pour provoquer un retour, une participation ou une venue accompagnée.",
    meta: `${CHALLENGE_PRICING.shortLabel} · activation sous 24 h`,
    cta: "Lancer un challenge",
    href: "/challenge",
    tone: "accent" as const,
  },
  {
    title: "Saison Cardin",
    lead: "Le système complet. Lecture, configuration, impact et offre sur 90 jours.",
    detail: "Le bon choix pour structurer le retour, la propagation et la valeur sur une vraie saison.",
    meta: `${LANDING_PRICING.compactLabel} · activation sous 48 h`,
    cta: "Construire une saison",
    href: "/parcours",
    tone: "default" as const,
  },
] as const

const PARTICLES = [
  { x: "8%", y: "18%", delay: 0.1, duration: 9.8 },
  { x: "16%", y: "72%", delay: 1.3, duration: 8.4 },
  { x: "22%", y: "44%", delay: 2.2, duration: 11.1 },
  { x: "29%", y: "14%", delay: 0.8, duration: 10.5 },
  { x: "36%", y: "66%", delay: 3.1, duration: 9.2 },
  { x: "43%", y: "24%", delay: 1.8, duration: 12.2 },
  { x: "51%", y: "78%", delay: 2.7, duration: 8.9 },
  { x: "58%", y: "36%", delay: 0.4, duration: 10.8 },
  { x: "64%", y: "16%", delay: 2.9, duration: 11.7 },
  { x: "71%", y: "58%", delay: 1.4, duration: 9.9 },
  { x: "78%", y: "28%", delay: 0.6, duration: 12.5 },
  { x: "85%", y: "74%", delay: 2.4, duration: 8.6 },
]

function useAnimatedNumber(target: number, duration = 850) {
  const [value, setValue] = useState(target)
  const valueRef = useRef(target)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    let frame = 0
    const start = valueRef.current
    const delta = target - start

    if (delta === 0) {
      setValue(target)
      return
    }

    const startedAt = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const nextValue = Math.round(start + delta * eased)
      valueRef.current = nextValue
      setValue(nextValue)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, target])

  return value
}

function formatEuro(value: number) {
  return `€${value.toLocaleString("fr-FR")}`
}

function buildGraph(values: number[]) {
  const width = 400
  const height = 44
  const max = Math.max(...values, 1)

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width
    const y = height - (value / max) * height * 0.82 - 4
    return { x, y }
  })

  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ")
  const area = `${line} L${width},${height} L0,${height} Z`
  const last = points[points.length - 1]

  return { area, line, last }
}

export function CardinHomePage() {
  const reducedMotion = useReducedMotion()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [businessKey, setBusinessKey] = useState<BusinessKey>("cafe")
  const [rewardKey, setRewardKey] = useState<RewardKey>(BUSINESSES.cafe.defaultReward)
  const [passagesPerDay, setPassagesPerDay] = useState(50)
  const [pulseIndex, setPulseIndex] = useState(0)
  const [clientStep, setClientStep] = useState(0)

  const business = BUSINESSES[businessKey]
  const reward = REWARDS[rewardKey]

  useEffect(() => {
    const pulseTimer = window.setInterval(() => setPulseIndex((value) => value + 1), 3800)
    return () => window.clearInterval(pulseTimer)
  }, [])

  useEffect(() => {
    const visibleSteps = Math.min(reward.steps, 4)
    const loopLength = visibleSteps + 2
    const storyTimer = window.setInterval(() => {
      setClientStep((value) => (value + 1) % loopLength)
    }, 1500)

    return () => window.clearInterval(storyTimer)
  }, [reward.steps])

  const monthlyProjection = useMemo(() => {
    const recoveryRate = Math.min(0.45, business.recoveryRate * reward.recoveryMultiplier)
    return calculateRecovery({
      clientsPerDay: passagesPerDay,
      avgTicket: business.avgTicket,
      daysOpen: DAYS_OPEN,
      recoveryRate,
      returnLossRate: business.lossRate,
    })
  }, [business.avgTicket, business.lossRate, business.recoveryRate, passagesPerDay, reward.recoveryMultiplier])

  const recoveredPerDay = Math.round(monthlyProjection.recoveredClients / DAYS_OPEN)

  const graph = useMemo(() => {
    const values = Array.from({ length: 20 }, (_, index) => {
      const t = index / 19
      const noise = Math.sin(index * 0.7) * 0.08 + Math.cos(index * 1.15) * 0.04
      return recoveredPerDay * (0.62 + t * 0.34 + noise)
    })
    return buildGraph(values)
  }, [recoveredPerDay])

  const displayPassages = useAnimatedNumber(passagesPerDay)
  const displayReturns = useAnimatedNumber(recoveredPerDay)
  const displayRevenue = useAnimatedNumber(Math.round(monthlyProjection.extraRevenue))
  const displayMonthlyReturns = useAnimatedNumber(Math.round(monthlyProjection.recoveredClients))
  const displayMonthlyRevenue = useAnimatedNumber(Math.round(monthlyProjection.extraRevenue))

  const visibleSteps = Math.min(reward.steps, 4)
  const phoneSteps = Array.from({ length: visibleSteps }, (_, index) => {
    const isFinalCompressed = reward.steps > 4 && index === visibleSteps - 1
    return isFinalCompressed ? `…visite ${reward.steps}` : reward.stepLabels[index]
  })

  const panelMotion = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { amount: 0.25, once: true },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
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
            <nav className="hidden sm:block">
              <ul className="flex items-center gap-7 lg:gap-9">
                <li>
                  <a className="text-[10px] uppercase tracking-[0.15em] text-[#3d4d43] transition hover:text-[#0f3d2e] sm:text-[12px]" href="#impact">
                    Impact
                  </a>
                </li>
                <li>
                  <Link className="text-[10px] uppercase tracking-[0.15em] text-[#0f3d2e] transition hover:text-[#0f3d2e] sm:text-[12px]" href="/challenge">
                    Challenge
                  </Link>
                </li>
                <li>
                  <Link className="text-[10px] uppercase tracking-[0.15em] text-[#3d4d43] transition hover:text-[#0f3d2e] sm:text-[12px]" href="/parcours">
                    Saison
                  </Link>
                </li>
                <li>
                  <a className="text-[10px] uppercase tracking-[0.15em] text-[#3d4d43] transition hover:text-[#0f3d2e] sm:text-[12px]" href="#contact">
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
            <div className="flex items-center gap-3 sm:hidden">
              <Link
                className="inline-flex h-9 items-center justify-center rounded-full border border-[#d4cdbd] bg-[rgba(242,237,228,0.86)] px-3.5 text-[12px] uppercase tracking-[0.12em] text-[#0f3d2e]"
                href="/challenge"
              >
                Lancer
              </Link>
              <button
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d4cdbd] bg-[rgba(242,237,228,0.86)] text-[#0f3d2e]"
                onClick={() => setMobileMenuOpen((open) => !open)}
                type="button"
              >
                <span className="relative block h-3.5 w-4">
                  <span className={["absolute left-0 top-0 h-px w-4 bg-current transition", mobileMenuOpen ? "translate-y-[7px] rotate-45" : ""].join(" ")} />
                  <span className={["absolute left-0 top-[7px] h-px w-4 bg-current transition", mobileMenuOpen ? "opacity-0" : "opacity-100"].join(" ")} />
                  <span className={["absolute left-0 top-[14px] h-px w-4 bg-current transition", mobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""].join(" ")} />
                </span>
              </button>
            </div>
            <p className="hidden text-[10px] tracking-[0.2em] text-[#8a8578] sm:block">
              <span className="text-[#1a2a22]">FR</span> / EN
            </p>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="mt-3 border-t border-[#d4cdbd] pt-3 sm:hidden">
            <nav className="flex flex-col items-end gap-1">
              <a
                className="rounded-2xl px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[#0f3d2e]"
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
              >
                Impact
              </a>
              <Link
                className="rounded-2xl px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[#0f3d2e]"
                href="/challenge"
                onClick={() => setMobileMenuOpen(false)}
              >
                Challenge
              </Link>
              <Link
                className="rounded-2xl px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[#0f3d2e]"
                href="/parcours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Saison
              </Link>
              <a
                className="rounded-2xl px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[#0f3d2e]"
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
            </nav>
          </div>
        ) : null}
      </header>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32 text-center sm:px-8 lg:px-12">
        <motion.svg
          aria-hidden="true"
          className="mb-12 h-[72px] w-[72px] text-[#0f3d2e]"
          fill="none"
          initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.95 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewBox="0 0 72 72"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="36" cy="36" opacity="0.25" r="35" stroke="currentColor" strokeWidth="0.5" />
          <path d="M20 36 Q 36 14, 52 36" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
          <path d="M20 36 Q 36 58, 52 36" opacity="0.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
          <circle cx="20" cy="36" fill="currentColor" r="1.8" />
          <circle cx="52" cy="36" fill="#b8956a" r="1.8" />
        </motion.svg>

        <motion.h1
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="font-serif text-[clamp(64px,10vw,128px)] font-normal leading-none tracking-[0.12em] text-[#0f3d2e]"
          initial={reducedMotion ? false : { opacity: 0, y: 22 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Cardin
        </motion.h1>

        <motion.p
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="mt-14 max-w-[720px] font-serif text-[clamp(24px,2.8vw,36px)] font-light leading-[1.28] text-[#1a2a22]"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          Le revenu qui part avec vos clients.
          <br />
          <em className="text-[#0f3d2e]">Récupéré.</em>
        </motion.p>

        <motion.p
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="mt-6 max-w-[520px] text-[13px] uppercase tracking-[0.12em] text-[#8a8578] sm:text-[14px]"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          transition={{ duration: 0.9, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          Chaque passage devient une raison structurée de revenir.
        </motion.p>

        <motion.div
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="mt-14 flex flex-wrap justify-center gap-4"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#0f3d2e] bg-[#0f3d2e] px-7 py-3 text-[12px] uppercase tracking-[0.15em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
            href="/challenge"
          >
            Lancer un challenge
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#d4cdbd] px-7 py-3 text-[12px] uppercase tracking-[0.15em] text-[#1a2a22] transition hover:border-[#0f3d2e] hover:bg-[rgba(15,61,46,0.03)] hover:text-[#0f3d2e]"
            href="/parcours"
          >
            Construire une saison
          </Link>
        </motion.div>

        <motion.p
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="mt-5 text-[11px] uppercase tracking-[0.18em] text-[#8a8578]"
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          Challenge pour déclencher vite · Saison pour structurer sur 90 jours
        </motion.p>

        <motion.a
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="mt-6 inline-flex text-[11px] uppercase tracking-[0.18em] text-[#3d4d43] underline decoration-[#d4cdbd] underline-offset-4 transition hover:text-[#0f3d2e] hover:decoration-[#0f3d2e]"
          href="#impact"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          transition={{ duration: 0.8, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
        >
          Voir l&apos;impact
        </motion.a>

      </section>

      <section className="relative overflow-hidden border-y border-[#d4cdbd] bg-[#ece6da] px-6 py-24 sm:px-8 lg:px-12 lg:py-28" id="impact">
        <div className="pointer-events-none absolute inset-0">
          {PARTICLES.map((particle) => (
            <motion.span
              animate={reducedMotion ? undefined : { x: [0, 10, -6, 0], y: [0, -24, -54, 0], opacity: [0.06, 0.32, 0.1, 0.06] }}
              className="absolute h-[2px] w-[2px] rounded-full bg-[#b8956a]"
              key={`${particle.x}-${particle.y}`}
              style={{ left: particle.x, top: particle.y }}
              transition={{
                delay: particle.delay,
                duration: particle.duration,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </div>

        <motion.div className="relative z-10 text-center" {...panelMotion}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">Le système, en temps réel</p>
          <h2 className="mt-5 font-serif text-[clamp(32px,4vw,44px)] leading-[1.15] text-[#1a2a22]">
            Ce qui fait revenir.
            <br />
            Ce que <em className="font-normal italic text-[#0f3d2e]">récupère</em> le lieu.
          </h2>
        </motion.div>

        <motion.div className="relative z-10 mx-auto mt-10 flex max-w-[620px] flex-col gap-4" {...panelMotion}>
          <div className="rounded border border-[#d4cdbd] bg-[#f2ede4] px-5 py-5 shadow-[0_8px_24px_rgba(15,61,46,0.04)]">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">Votre métier</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(BUSINESSES) as BusinessKey[]).map((key) => {
                const active = key === businessKey
                return (
                  <button
                    className={[
                      "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.1em] transition",
                      active
                        ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4]"
                        : "border-[#d4cdbd] text-[#3d4d43] hover:border-[#0f3d2e] hover:text-[#0f3d2e]",
                    ].join(" ")}
                    key={key}
                    onClick={() => {
                      setBusinessKey(key)
                      setRewardKey(BUSINESSES[key].defaultReward)
                    }}
                    type="button"
                  >
                    {BUSINESSES[key].label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded border border-[#d4cdbd] bg-[#f2ede4] px-5 py-5 shadow-[0_8px_24px_rgba(15,61,46,0.04)]">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">Votre récompense</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(REWARDS) as RewardKey[]).map((key) => {
                const active = key === rewardKey
                return (
                  <button
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.1em] transition",
                      active
                        ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4]"
                        : "border-[#d4cdbd] text-[#3d4d43] hover:border-[#0f3d2e] hover:text-[#0f3d2e]",
                    ].join(" ")}
                    key={key}
                    onClick={() => setRewardKey(key)}
                    type="button"
                  >
                    <span className={active ? "text-[#d4b892]" : "text-[#b8956a]"}>{REWARDS[key].glyph}</span>
                    {REWARDS[key].label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded border border-[#d4cdbd] bg-[#f2ede4] px-5 py-5 shadow-[0_8px_24px_rgba(15,61,46,0.04)]">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">Passages par jour</span>
            <div className="mt-4 flex items-center gap-4">
              <input
                className="h-[2px] flex-1 cursor-pointer appearance-none bg-[#d4cdbd]"
                max={300}
                min={10}
                onChange={(event) => setPassagesPerDay(Number(event.target.value))}
                step={5}
                type="range"
                value={passagesPerDay}
              />
              <span className="min-w-[3ch] text-right font-serif text-3xl text-[#0f3d2e]">{passagesPerDay}</span>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 mx-auto mt-14 flex max-w-[720px] flex-col items-center">
          <motion.div
            {...panelMotion}
            animate={
              reducedMotion
                ? undefined
                : {
                    borderColor: pulseIndex % 2 === 0 ? "rgba(212,205,189,1)" : "rgba(15,61,46,0.32)",
                    boxShadow:
                      pulseIndex % 2 === 0
                        ? "0 12px 32px rgba(15,61,46,0.04)"
                        : "0 18px 40px rgba(15,61,46,0.08)",
                  }
            }
            className="relative w-full max-w-[560px] rounded border bg-[#f2ede4] px-6 py-8 sm:px-10"
          >
            <span className="absolute left-6 top-0 -translate-y-1/2 bg-[#ece6da] px-3 text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">
              Côté marchand
            </span>

            <div className="grid grid-cols-3 gap-5 sm:gap-7">
              <Metric label="Passages / jour" value={displayPassages.toLocaleString("fr-FR")} />
              <Metric accent label="Retours déclenchés" value={displayReturns.toLocaleString("fr-FR")} />
              <Metric label="Revenu récupéré / mois" tone="warm" value={formatEuro(displayRevenue)} />
            </div>

            <div className="mt-8 h-11">
              <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 44">
                <defs>
                  <linearGradient id="cardinGraphGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0f3d2e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0f3d2e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  animate={{ d: graph.area }}
                  d={graph.area}
                  fill="url(#cardinGraphGradient)"
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                />
                <motion.path
                  animate={{ d: graph.line }}
                  d={graph.line}
                  fill="none"
                  stroke="#0f3d2e"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                />
                <motion.circle
                  animate={{ cx: graph.last.x, cy: graph.last.y }}
                  cx={graph.last.x}
                  cy={graph.last.y}
                  fill="#b8956a"
                  r="2.5"
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                />
              </svg>
            </div>

            <div className="mt-6 border-t border-dashed border-[#d4cdbd] pt-5 text-center">
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#8a8578]">Projection sur 30 jours</p>
              <p className="mt-2 font-serif text-[18px] leading-[1.45] text-[#1a2a22] sm:text-[20px]">
                <span className="text-[22px] font-medium text-[#0f3d2e] sm:text-[24px]">
                  {displayMonthlyReturns.toLocaleString("fr-FR")}
                </span>{" "}
                clients revenus ·{" "}
                <span className="text-[22px] font-medium text-[#b8956a] sm:text-[24px]">
                  {formatEuro(displayMonthlyRevenue)}
                </span>{" "}
                récupérés
              </p>
            </div>
          </motion.div>

          <div className="relative flex h-28 w-full max-w-[560px] items-center justify-center sm:h-32">
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent_0%,#d4cdbd_20%,#d4cdbd_80%,transparent_100%)]" />
            {!reducedMotion ? (
              <motion.div
                animate={{ y: [-44, 44], opacity: [0, 1, 0] }}
                className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#b8956a] shadow-[0_0_12px_#b8956a]"
                key={pulseIndex}
                transition={{ duration: 1.6, ease: "easeInOut" }}
              />
            ) : null}
            <motion.div
              animate={reducedMotion ? undefined : { scale: [1, 1.04, 1] }}
              className="relative z-10 flex h-[88px] w-[88px] items-center justify-center rounded-full border border-[#d4cdbd] bg-[#f2ede4]"
              transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <motion.div
                animate={reducedMotion ? undefined : { rotate: 360 }}
                className="absolute inset-1 rounded-full border border-dashed border-[rgba(15,61,46,0.16)]"
                transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <motion.div
                animate={reducedMotion ? undefined : { rotate: -360 }}
                className="absolute inset-3 rounded-full border border-[rgba(15,61,46,0.28)]"
                transition={{ duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <motion.div
                animate={reducedMotion ? undefined : { scale: [1, 1.38, 1] }}
                className="h-3.5 w-3.5 rounded-full bg-[#0f3d2e]"
                transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          <motion.div
            {...panelMotion}
            animate={
              reducedMotion
                ? undefined
                : {
                    borderColor: pulseIndex % 2 === 0 ? "rgba(212,205,189,1)" : "rgba(15,61,46,0.32)",
                    boxShadow:
                      pulseIndex % 2 === 0
                        ? "0 12px 32px rgba(15,61,46,0.04)"
                        : "0 18px 40px rgba(15,61,46,0.08)",
                  }
            }
            className="relative w-full max-w-[560px] rounded border bg-[#f2ede4] px-6 py-8 sm:px-10"
          >
            <span className="absolute left-6 top-0 -translate-y-1/2 bg-[#ece6da] px-3 text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">
              Côté client
            </span>

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="mx-auto h-[252px] w-[146px] rounded-[22px] border border-[#d4cdbd] bg-[#e3dccc] p-3 shadow-[0_12px_24px_rgba(15,61,46,0.05)]">
                <div className="flex h-full flex-col rounded-[14px] bg-[#f2ede4] px-3 py-4">
                  <div className="border-b border-[#d4cdbd] pb-3 text-center font-serif text-[14px] tracking-[0.24em] text-[#0f3d2e]">
                    {business.brand}
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    {phoneSteps.map((stepLabel, index) => {
                      const stepNumber = index + 1
                      const active = clientStep === stepNumber
                      const done = clientStep > stepNumber

                      return (
                        <div
                          className={[
                            "flex items-center gap-2 text-[10px] transition",
                            done ? "text-[#0f3d2e]" : active ? "text-[#1a2a22]" : "text-[#8a8578] opacity-50",
                          ].join(" ")}
                          key={stepLabel}
                        >
                          <span
                            className={[
                              "relative h-2 w-2 rounded-full border",
                              done ? "border-[#0f3d2e] bg-[#0f3d2e]" : active ? "border-[#1a2a22]" : "border-current",
                            ].join(" ")}
                          >
                            {done ? <span className="absolute inset-[2px] rounded-full bg-[#f2ede4]" /> : null}
                          </span>
                          {stepLabel}
                        </div>
                      )
                    })}
                  </div>

                  <motion.div
                    animate={
                      clientStep >= visibleSteps
                        ? { opacity: 1, scale: 1.02, y: 0 }
                        : { opacity: 0.45, scale: 1, y: 0 }
                    }
                    className="mt-auto rounded-lg border border-[#d4b892] bg-[linear-gradient(135deg,rgba(184,149,106,0.12),rgba(184,149,106,0.02))] px-3 py-3 text-center"
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <div className="font-serif text-[24px] leading-none text-[#b8956a]">{reward.glyph}</div>
                    <div className="mt-1 font-serif text-[11px] italic text-[#b8956a]">{reward.label}</div>
                  </motion.div>
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <StoryLine active={clientStep >= 1}>Il entre.</StoryLine>
                <StoryLine active={clientStep >= 2}>Il voit ce qu&apos;il débloque.</StoryLine>
                <StoryLine active={clientStep >= visibleSteps}>
                  Il <em className="text-[#b8956a]">revient.</em>
                </StoryLine>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p className="relative z-10 mx-auto mt-20 max-w-[600px] text-center font-serif text-[clamp(20px,2.2vw,24px)] italic leading-[1.5] text-[#3d4d43]" {...panelMotion}>
          Pas une carte de fidélité.
          <br />
          <strong className="font-medium not-italic text-[#0f3d2e]">Un système de retour client.</strong>
        </motion.p>

        <motion.div
          className="relative z-10 mx-auto mt-8 flex max-w-[720px] flex-wrap items-center justify-center gap-3 border-t border-[#d4cdbd] pt-6 text-[10px] uppercase tracking-[0.22em] text-[#8a8578] sm:gap-5"
          {...panelMotion}
        >
          <span>Sans paiement côté client</span>
          <span className="hidden h-3.5 w-px bg-[#d4cdbd] sm:block" />
          <span>Déployé par le lieu</span>
          <span className="hidden h-3.5 w-px bg-[#d4cdbd] sm:block" />
          <span>Données non revendues</span>
        </motion.div>
      </section>

      <motion.section className="border-t border-[#d4cdbd] bg-[#f6f1e7] px-6 py-24 sm:px-8 lg:px-12" {...panelMotion}>
        <div className="mx-auto max-w-[980px]">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">Deux intensités</p>
            <h2 className="mt-5 font-serif text-[clamp(32px,4vw,44px)] leading-[1.15] text-[#1a2a22]">
              Le même système.
              <br />
              Deux cadres pour <em className="font-normal italic text-[#0f3d2e]">entrer</em> dans Cardin.
            </h2>
            <p className="mx-auto mt-5 max-w-[640px] font-serif text-[18px] italic leading-[1.55] text-[#3d4d43]">
              Challenge pour déclencher vite. Saison pour structurer le retour sur 90 jours.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {OFFER_FRAMES.map((frame) => (
              <article
                className={[
                  "rounded border px-6 py-7 text-left shadow-[0_12px_30px_rgba(15,61,46,0.04)] sm:px-7 sm:py-8",
                  frame.tone === "accent"
                    ? "border-[#c9b28d] bg-[linear-gradient(180deg,#fff8ef_0%,#f6efe3_100%)]"
                    : "border-[#d4cdbd] bg-[#f2ede4]",
                ].join(" ")}
                key={frame.title}
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">{frame.meta}</p>
                <h3 className="mt-4 font-serif text-[30px] leading-[1.1] text-[#1a2a22]">{frame.title}</h3>
                <p className="mt-4 font-serif text-[20px] leading-[1.35] text-[#1a2a22]">{frame.lead}</p>
                <p className="mt-3 max-w-[34rem] text-[15px] leading-7 text-[#556159]">{frame.detail}</p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    className={[
                      "inline-flex min-h-11 items-center justify-center rounded-sm border px-6 py-3 text-[11px] uppercase tracking-[0.16em] transition",
                      frame.tone === "accent"
                        ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4] hover:border-[#1a2a22] hover:bg-[#1a2a22]"
                        : "border-[#0f3d2e] text-[#0f3d2e] hover:bg-[rgba(15,61,46,0.04)]",
                    ].join(" ")}
                    href={frame.href}
                  >
                    {frame.cta}
                  </Link>
                  {frame.title === "Saison Cardin" ? (
                    <a
                      className="inline-flex text-[11px] uppercase tracking-[0.18em] text-[#3d4d43] underline decoration-[#d4cdbd] underline-offset-4 transition hover:text-[#0f3d2e] hover:decoration-[#0f3d2e]"
                      href={STRIPE_PAYMENT_LINK}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Réserver directement
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="px-6 py-[136px] pb-[104px] text-center sm:px-8 lg:px-12" {...panelMotion}>
        <p className="mx-auto mb-10 max-w-[640px] font-serif text-[clamp(20px,2.2vw,26px)] italic leading-[1.5] text-[#3d4d43]">
          Conçu à Paris pour les commerçants
          <br />
          qui comptent leurs clients.
        </p>

        <p className="hidden">
          {LANDING_PRICING.compactLabel} · activation sous 48 h
        </p>

        <p className="mx-auto mb-8 max-w-[620px] text-[11px] uppercase tracking-[0.18em] text-[#8a8578]">
          Challenge pour entrer · Saison pour installer le cadre
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#0f3d2e] bg-[#0f3d2e] px-7 py-3 text-[12px] uppercase tracking-[0.15em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
            href="/parcours"
          >
            Lancer un challenge
          </Link>
          <Link
            className="group relative inline-flex min-h-12 items-center justify-center rounded-sm border border-[#d4cdbd] px-7 py-3 text-[12px] uppercase tracking-[0.15em] text-transparent transition hover:border-[#0f3d2e] hover:bg-[rgba(15,61,46,0.03)] hover:text-transparent"
            href="/parcours"
          >
            <span className="absolute inset-0 flex items-center justify-center text-[#1a2a22] transition group-hover:text-[#0f3d2e]">
              Construire une saison
            </span>
            Réserver ma saison
          </Link>
        </div>
      </motion.section>

      <footer
        className="border-t border-[#d4cdbd] px-6 py-12 text-center text-[11px] uppercase tracking-[0.15em] text-[#8a8578] sm:px-8 lg:px-12"
        id="contact"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-left">
            <div>Cardin · Paris</div>
            <div className="mt-2">by Symi</div>
          </div>

          <div className="flex flex-col gap-3 text-left">
            {LEGAL_LINKS.map((link) => (
              <Link className="transition hover:text-[#0f3d2e]" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="text-left">
            <a className="transition hover:text-[#0f3d2e]" href={`mailto:${CARDIN_CONTACT_EMAIL}`}>
              {CARDIN_CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

function Metric({
  label,
  value,
  accent = false,
  tone = "default",
}: {
  label: string
  value: string
  accent?: boolean
  tone?: "default" | "warm"
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span
        className={[
          "font-serif text-[clamp(28px,3.4vw,40px)] font-medium leading-none tabular-nums",
          tone === "warm" ? "text-[#b8956a]" : accent ? "text-[#0f3d2e]" : "text-[#1a2a22]",
        ].join(" ")}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a8578]">{label}</span>
    </div>
  )
}

function StoryLine({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <motion.p
      animate={{ color: active ? "#1a2a22" : "#8a8578", x: active ? 0 : -4 }}
      className="font-serif text-[20px] leading-[1.25] sm:text-[22px]"
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.p>
  )
}
