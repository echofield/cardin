"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { ParcoursParticles } from "@/components/parcours-v2/ParcoursParticles"
import { CARDIN_CONTACT_EMAIL, buildContactMailto } from "@/lib/site-contact"

const CONTACT_HREF = buildContactMailto(
  "Cardin · international intro",
  "Hi Cardin,\r\n\r\nI want to understand how Cardin could work for my business.\r\n",
)

const SEASON_HREF = buildContactMailto(
  "Cardin · full season",
  "Hi Cardin,\r\n\r\nI want to prepare a full Cardin season for my business.\r\n",
)

const DIFFERENCES = [
  {
    title: "Visible at the entrance",
    detail: "Not a hidden loyalty rule. Customers understand the moment in seconds.",
  },
  {
    title: "Structured return",
    detail: "You define one key day, one clear moment, and one real reason to come back.",
  },
  {
    title: "A rare horizon",
    detail: "The Diamond stays visible all season and keeps anticipation alive.",
  },
] as const

const OPERATOR_SIGNALS = [
  {
    title: "Controlled weekly traffic moments",
    detail: "Turn slow days into recognizable peaks without running permanent discounts.",
  },
  {
    title: "Retention you can see",
    detail: "Not only scans or visits: visible repeat behavior, week after week.",
  },
  {
    title: "Less paid acquisition pressure",
    detail: "A growth loop built inside the location, not rented from a platform.",
  },
  {
    title: "Fast deployment",
    detail: "Start with one location, read the signal, then scale the rhythm.",
  },
] as const

const FLOW_STEPS = [
  {
    label: "Read",
    title: "Read the place",
    detail: "We define the weak day, the visible moment, and the reward that feels worth returning for.",
  },
  {
    label: "Counter",
    title: "Make it visible",
    detail: "The customer sees a QR, one clear message, and the Diamond at the counter.",
  },
  {
    label: "Scan",
    title: "Enter the season",
    detail: "They scan once and understand they are now part of something that moves.",
  },
  {
    label: "Return",
    title: "Create the return",
    detail: "The weekly moment gives them a specific reason to come back.",
  },
  {
    label: "Peak",
    title: "Hold the tension",
    detail: "The Diamond keeps the season alive. The business wins before the prize is awarded.",
  },
] as const

const SCALE_STEPS = [
  {
    title: "Pilot",
    detail: "One location, one visible moment, one 30-day return signal.",
  },
  {
    title: "Validate",
    detail: "Measure visit frequency, invitation behavior, and the strength of the key day.",
  },
  {
    title: "Deploy",
    detail: "Roll the same rhythm across multiple units, regions, or a full network.",
  },
] as const

const IMPACT = [
  { value: "+25%", label: "value on your most active customers" },
  { value: "weak day", label: "becomes a key moment people recognize" },
  { value: "0%", label: "commission on your sales" },
  { value: "1 system", label: "30-day launch into a 90-day season" },
] as const

const ENTRY_POINTS = [
  {
    tag: "Start simple",
    title: "Cardin Entry",
    signal: "30 days",
    detail: "A lightweight launch in one location to test one visible moment with the same engine.",
    meta: ["1 location", "1 moment", "direct contact"],
    cta: "Talk to Cardin",
    href: CONTACT_HREF,
    featured: true,
  },
  {
    tag: "Go deeper",
    title: "Full Season",
    signal: "90 days",
    detail: "The full rhythm: weekly moment, Diamond tension, deeper calibration, and rollout logic.",
    meta: ["full rhythm", "Diamond tension", "multi-location ready"],
    cta: "Prepare your season",
    href: SEASON_HREF,
    featured: false,
  },
] as const

export function CardinBeginPage() {
  const [day, setDay] = useState(70)
  const [visits, setVisits] = useState(25)
  const progress = Math.min(100, Math.round((day / 90) * 100))
  const metaLine = useMemo(() => "Restaurants · cafés · retail · beauty", [])

  useEffect(() => {
    const dayTimer = window.setInterval(() => {
      setDay((current) => (current >= 90 ? 70 : current + 1))
    }, 5600)
    const visitTimer = window.setInterval(() => {
      setVisits((current) => (current >= 34 ? 25 : current + 1))
    }, 8200)

    return () => {
      window.clearInterval(dayTimer)
      window.clearInterval(visitTimer)
    }
  }, [])

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.06),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(184,149,106,0.11),transparent_30%),#ebe5d8] text-[#1a2a22]">
      <ParcoursParticles />

      <section className="relative z-[2] mx-auto grid min-h-[92dvh] max-w-[1240px] gap-10 px-5 pb-14 pt-20 sm:px-6 md:grid-cols-[minmax(0,1fr)_340px] md:items-center md:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14 lg:px-10 xl:grid-cols-[minmax(0,1fr)_480px] xl:px-12">
        <div className="text-left">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
              <span className="h-px w-[14px] bg-[#b8956a]/70" />
              Start with Cardin
            </span>
            <Link className="rounded-full border border-[#d4cdbd] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#8a8578] transition hover:border-[#0f3d2e] hover:text-[#0f3d2e]" href="/commencer">
              Français
            </Link>
          </div>

          <h1 className="font-serif text-[clamp(54px,15vw,96px)] leading-[0.96] tracking-[-0.035em] text-[#1a2a22]">
            Cardin
          </h1>
          <p className="mt-4 max-w-[620px] font-serif text-[clamp(24px,6.6vw,40px)] leading-[1.12] tracking-[-0.018em] text-[#1a2a22]">
            The system that
            <em className="mx-2 font-medium italic text-[#0f3d2e]">makes customers come back, on your terms.</em>
          </p>
          <p className="mt-6 max-w-[560px] text-[15px] leading-[1.75] text-[#3d4d43] sm:text-[17px]">
            A simple first month to launch Cardin in one location or across your network: create a visible moment,
            get customers to scan, and turn visits into repeat behavior.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-7 py-3 text-[11px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22] sm:w-auto"
              href={CONTACT_HREF}
            >
              Talk to Cardin
              <span className="text-[14px]">→</span>
            </a>
            <a
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[2px] border border-[#d4cdbd] px-7 py-3 text-[11px] uppercase tracking-[0.22em] text-[#1a2a22] transition hover:border-[#0f3d2e] hover:bg-[rgba(15,61,46,0.03)] hover:text-[#0f3d2e] sm:w-auto"
              href="#entry-points"
            >
              See the full season
            </a>
          </div>

          <p className="mt-5 text-[10px] uppercase leading-5 tracking-[0.18em] text-[#8a8578]">
            Direct contact <span className="mx-2 text-[#b8956a]">·</span> No upfront payment{" "}
            <span className="mx-2 text-[#b8956a]">·</span> {metaLine}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[380px]">
          <div className="pointer-events-none absolute inset-[-14px] rounded-[14px] border border-dashed border-[#b8956a]/30 lg:inset-[-24px]" />
          <div className="pointer-events-none absolute inset-[-28px] rounded-[20px] border border-[#b8956a]/15 lg:inset-[-42px]" />

          <article className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[6px] border border-[#b8956a] bg-[radial-gradient(circle_at_15%_10%,rgba(184,149,106,0.08),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(15,61,46,0.04),transparent_45%),#f2ede4] px-5 pb-6 pt-8 shadow-[0_24px_60px_rgba(15,61,46,0.1),0_48px_100px_rgba(15,61,46,0.06)]">
            <div className="pointer-events-none absolute inset-[1px] rounded-[6px] border border-[#b8956a]/40" />
            <span className="absolute left-[10px] top-[10px] h-[14px] w-[14px] border-l border-t border-[#b8956a]/60" />
            <span className="absolute right-[10px] top-[10px] h-[14px] w-[14px] border-r border-t border-[#b8956a]/60" />
            <span className="absolute bottom-[10px] left-[10px] h-[14px] w-[14px] border-b border-l border-[#b8956a]/60" />
            <span className="absolute bottom-[10px] right-[10px] h-[14px] w-[14px] border-b border-r border-[#b8956a]/60" />

            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#d4b892] bg-[rgba(15,61,46,0.05)] px-3 py-1 text-[8px] uppercase tracking-[0.2em] text-[#8c6a44]">
              <span className="relative h-[6px] w-[6px] rounded-full bg-[#0f3d2e] before:absolute before:inset-[-3px] before:animate-[pulse-live_1.8s_ease-in-out_infinite] before:rounded-full before:bg-[#0f3d2e]/35" />
              Cardin in action
            </div>

            <div className="mt-5 text-center">
              <p className="font-serif text-[13px] tracking-[0.34em] text-[#1a2a22]">CARDIN</p>
              <p className="mt-1 text-[8px] uppercase tracking-[0.28em] text-[#8a8578]">Season · Marais Store</p>
            </div>

            <div className="mt-5 border-y border-[#d4cdbd] px-4 py-5 text-center">
              <p className="text-[8px] uppercase tracking-[0.3em] text-[#8c6a44]">Reward</p>
              <p className="mt-2 font-serif text-[23px] leading-[1.18] text-[#1a2a22]">
                <em className="italic text-[#0f3d2e]">$100 store credit</em>
              </p>
              <p className="mt-1 font-serif text-[12px] italic text-[#3d4d43]">every month for a year</p>
            </div>

            <div className="mt-5 border-b border-[#d4cdbd] px-4 pb-5 text-center">
              <p className="text-[8px] uppercase tracking-[0.3em] text-[#8c6a44]">This week</p>
              <p className="mt-2 font-serif text-[21px] leading-[1.2] text-[#1a2a22]">
                Saturday
                <em className="ml-1 italic text-[#0f3d2e]">→ $100 drop</em>
              </p>
              <p className="mt-2 text-[13px] leading-[1.5] text-[#3d4d43]">
                To create a real moment people come back for.
              </p>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-[0.24em] text-[#8a8578]">Progress</span>
                <span className="font-serif text-[12px] italic text-[#8c6a44]">3 of 4</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    className={[
                      "relative flex aspect-square items-center justify-center rounded-[3px] border font-serif text-[16px] transition",
                      index < 3
                        ? "border-[#b8956a] bg-[rgba(184,149,106,0.12)] text-[#8c6a44]"
                        : "border-[#d4b892] bg-[rgba(184,149,106,0.03)] text-[#d4b892]",
                    ].join(" ")}
                    key={index}
                  >
                    {index < 3 ? "◆" : "◇"}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[8px] uppercase tracking-[0.22em] text-[#8a8578]">
                <span>Season</span>
                <span className="font-serif text-[11px] italic normal-case tracking-normal text-[#8c6a44]">day {day} / 90</span>
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

            <div className="mt-5 flex items-center justify-between rounded-[4px] border border-[#d4b892] bg-[rgba(184,149,106,0.04)] px-4 py-3">
              <div>
                <p className="text-[8px] uppercase tracking-[0.24em] text-[#8a8578]">Validated visits</p>
                <p className="mt-1 font-serif text-[22px] leading-none text-[#1a2a22]">{visits}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.24em] text-[#8a8578]">Signal</p>
                <p className="mt-1 font-serif text-[14px] italic text-[#8c6a44]">return rate increasing</p>
              </div>
            </div>

            <div className="mt-auto rounded-[3px] border border-dashed border-[#d4cdbd] bg-[rgba(15,61,46,0.03)] px-3 py-3">
              <p className="flex items-center gap-2 font-serif text-[12px] italic leading-[1.45] text-[#3d4d43]">
                <span className="h-[4px] w-[4px] rounded-full bg-[#0f3d2e]" />
                Saturday → $100 can drop.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="relative z-[2] mx-auto max-w-[1120px] px-6 md:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[6px] border border-[#d4b892] bg-[linear-gradient(180deg,rgba(255,248,239,0.78),rgba(242,237,228,0.9))] shadow-[0_18px_60px_rgba(15,61,46,0.06)]">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
            <div className="border-b border-[#d4cdbd] px-6 py-8 lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
              <p className="mb-4 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
                <span className="h-px w-[18px] bg-[#b8956a]/70" />
                For operators
              </p>
              <h2 className="font-serif text-[clamp(28px,3.6vw,42px)] leading-[1.08] tracking-[-0.018em] text-[#1a2a22]">
                Built for operators,
                <em className="ml-2 font-medium italic text-[#0f3d2e]">not just places.</em>
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-[#3d4d43]">
                Cardin is designed for multi-location groups, franchises, and high-frequency environments without adding operational complexity.
              </p>
              <div className="mt-6 rounded-[4px] border border-[#d4cdbd] bg-[#ebe5d8]/70 px-5 py-4">
                <p className="text-[9px] uppercase tracking-[0.24em] text-[#8a8578]">Fully controlled by the operator</p>
                <p className="mt-2 font-serif text-[17px] italic leading-[1.45] text-[#1a2a22]">
                  You choose the moment. You choose the reward. You control the rhythm.
                </p>
                <p className="mt-2 text-[13px] leading-[1.6] text-[#3d4d43]">
                  Cardin does not override the business. It structures the return loop around it.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2">
              {OPERATOR_SIGNALS.map((item) => (
                <article className="border-b border-[#d4cdbd] px-6 py-7 last:border-b-0 sm:border-r sm:even:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0" key={item.title}>
                  <p className="font-serif text-[15px] italic text-[#b8956a]">◇</p>
                  <h3 className="mt-3 font-serif text-[19px] leading-[1.25] text-[#1a2a22]">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[#3d4d43]">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-[2] mx-auto max-w-[1080px] px-6 md:px-8 lg:px-12">
        <div className="grid border-y border-[#d4cdbd] md:grid-cols-3">
          {DIFFERENCES.map((item) => (
            <article className="border-b border-[#d4cdbd] px-6 py-8 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0" key={item.title}>
              <p className="font-serif text-[16px] italic text-[#b8956a]">◇</p>
              <h2 className="mt-3 font-serif text-[20px] leading-[1.34] text-[#1a2a22]">{item.title}</h2>
              <p className="mx-auto mt-2 max-w-[260px] text-[14px] leading-[1.6] text-[#3d4d43]">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[1100px] px-6 md:px-8 lg:px-12">
        <div className="text-center">
          <p className="mb-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
            The system
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
          </p>
          <h2 className="font-serif text-[clamp(28px,3.4vw,38px)] leading-[1.16] tracking-[-0.015em] text-[#1a2a22]">
            Month one sets the rhythm.
            <em className="ml-2 font-medium italic text-[#0f3d2e]">Then it becomes a season.</em>
          </h2>
        </div>

        <div className="relative mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="pointer-events-none absolute left-[10%] right-[10%] top-[18px] hidden h-px bg-[#b8956a]/35 xl:block" />
          {FLOW_STEPS.map((step, index) => (
            <article className="relative text-center md:text-left xl:text-center" key={step.label}>
              <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#b8956a] bg-[#ebe5d8] font-serif text-[16px] text-[#8c6a44] md:mx-0 xl:mx-auto">
                {index + 1}
              </div>
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#8a8578]">{step.label}</p>
              <h3 className="mt-2 font-serif text-[17px] leading-[1.35] text-[#1a2a22]">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.55] text-[#3d4d43]">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[1040px] px-6 md:px-8 lg:px-12">
        <div className="grid gap-8 border-y border-[#d4cdbd] py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
              <span className="h-px w-[18px] bg-[#b8956a]/70" />
              Pilot to scale
            </p>
            <h2 className="font-serif text-[clamp(28px,3.4vw,38px)] leading-[1.16] tracking-[-0.015em] text-[#1a2a22]">
              Start with one location.
              <em className="ml-2 font-medium italic text-[#0f3d2e]">Expand if it works.</em>
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[#3d4d43]">
              Most Cardin deployments begin as a controlled test, then scale only after the return signal is visible.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {SCALE_STEPS.map((step, index) => (
              <article className="rounded-[4px] border border-[#d4cdbd] bg-[#f2ede4]/75 px-5 py-5" key={step.title}>
                <p className="text-[9px] uppercase tracking-[0.24em] text-[#8a8578]">0{index + 1}</p>
                <h3 className="mt-3 font-serif text-[20px] leading-[1.25] text-[#1a2a22]">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-[#3d4d43]">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[1040px] px-6 md:px-8 lg:px-12">
        <div className="text-center">
          <p className="mb-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
            Impact
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
          </p>
          <h2 className="font-serif text-[clamp(28px,3.4vw,38px)] leading-[1.16] tracking-[-0.015em] text-[#1a2a22]">
            Cardin does not add a tool.
            <em className="ml-2 font-medium italic text-[#0f3d2e]">It changes customer behavior.</em>
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-[6px] border border-[#d4b892] bg-[linear-gradient(180deg,#fff8ef_0%,#f6efe3_100%)] px-6 py-6">
            <p className="text-[9px] uppercase tracking-[0.28em] text-[#8c6a44]">Designed to impact unit economics</p>
            <p className="mt-4 font-serif text-[24px] leading-[1.2] text-[#1a2a22]">
              More lifetime value, more visit frequency, more referral-driven acquisition.
            </p>
          </article>
          <article className="rounded-[6px] border border-[#d4cdbd] bg-[#f2ede4]/80 px-6 py-6">
            <p className="text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">Less dependency</p>
            <p className="mt-4 font-serif text-[24px] leading-[1.2] text-[#1a2a22]">
              Less pressure on paid ads, broad discounts, and third-party platforms.
            </p>
          </article>
        </div>

        <div className="mt-10 grid border-y border-[#d4cdbd] sm:grid-cols-2 lg:grid-cols-4">
          {IMPACT.map((stat) => (
            <article className="border-b border-[#d4cdbd] px-6 py-8 text-center last:border-b-0 sm:border-r sm:even:border-r-0 lg:border-b-0 lg:border-r lg:last:border-r-0" key={stat.label}>
              <p className="font-serif text-[clamp(30px,3.5vw,42px)] leading-[1.1] text-[#1a2a22]">{stat.value}</p>
              <p className="mx-auto mt-3 max-w-[190px] text-[13px] leading-[1.55] text-[#3d4d43]">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[860px] px-6 text-center md:px-8 lg:px-12">
        <p className="mb-4 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
          <span className="h-px w-[18px] bg-[#b8956a]/70" />
          Beyond retention
          <span className="h-px w-[18px] bg-[#b8956a]/70" />
        </p>
        <h2 className="font-serif text-[clamp(26px,3vw,34px)] leading-[1.24] tracking-[-0.015em] text-[#1a2a22]">
          Some Cardin places can also join
          <em className="ml-2 font-medium italic text-[#0f3d2e]">Petit Souvenir.</em>
        </h2>
        <div className="mx-auto mt-6 max-w-[720px] rounded-[6px] border border-[#d4b892] bg-[linear-gradient(180deg,#f5efe3,#f2ede4)] px-6 py-6 text-left">
          <p className="text-[16px] leading-[1.7] text-[#3d4d43]">
            A curated local discovery layer for travelers, hosts, and neighborhood recommendations. Cardin brings existing customers back; Petit Souvenir can bring new ones selectively.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              "Cardin brings customers back.",
              "Petit Souvenir brings new ones selectively.",
              "You win on retention and visibility.",
            ].map((point, index) => (
              <div className="rounded-[4px] border border-[#d4cdbd] bg-[#f2ede4]/75 px-4 py-4" key={point}>
                <p className="font-serif text-[12px] italic text-[#b8956a]">{["i.", "ii.", "iii."][index]}</p>
                <p className="mt-1 text-[14px] leading-[1.5] text-[#3d4d43]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[1040px] px-6 md:px-8 lg:px-12" id="entry-points">
        <div className="text-center">
          <p className="mb-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
            Entry points
            <span className="h-px w-[18px] bg-[#b8956a]/70" />
          </p>
          <h2 className="font-serif text-[clamp(28px,3.4vw,38px)] leading-[1.16] tracking-[-0.015em] text-[#1a2a22]">
            Start simple.
            <em className="ml-2 font-medium italic text-[#0f3d2e]">Go deeper when the rhythm is real.</em>
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {ENTRY_POINTS.map((card) => (
            <article
              className={[
                "relative rounded-[6px] border px-7 py-8 shadow-[0_12px_30px_rgba(15,61,46,0.04)]",
                card.featured
                  ? "border-[#c9b28d] bg-[linear-gradient(180deg,#fff8ef_0%,#f6efe3_100%)]"
                  : "border-[#d4cdbd] bg-[#f2ede4]",
              ].join(" ")}
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
              <p className="mt-4 text-[16px] leading-[1.65] text-[#3d4d43]">{card.detail}</p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#8a8578]">{card.meta.join(" · ")}</p>
              <div className="mt-7">
                <a
                  className="inline-flex items-center gap-3 rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
                  href={card.href}
                >
                  {card.cta}
                  <span className="text-[14px]">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto mt-20 max-w-[760px] px-6 pb-20 text-center md:px-8 lg:px-12">
        <p className="font-serif text-[clamp(20px,2.4vw,28px)] italic leading-[1.55] text-[#1a2a22]">
          If they do not understand it in ten seconds, you lose them.
          <br />
          Cardin is designed to make the return loop visible.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-7 py-3 text-[11px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
            href={CONTACT_HREF}
          >
            Talk to Cardin
            <span className="text-[14px]">→</span>
          </a>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-[2px] border border-[#d4cdbd] px-7 py-3 text-[11px] uppercase tracking-[0.22em] text-[#1a2a22] transition hover:border-[#0f3d2c] hover:bg-[rgba(15,61,46,0.03)] hover:text-[#0f3d2e]"
            href="/commencer"
          >
            French version
          </Link>
        </div>
        <p className="mt-4 text-[11px] italic tracking-[0.08em] text-[#8a8578]">
          Direct contact · {CARDIN_CONTACT_EMAIL}
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
      `}</style>
    </main>
  )
}
