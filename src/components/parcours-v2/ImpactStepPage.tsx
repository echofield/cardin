"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { gsap } from "gsap"

import { buttonVariants } from "@/ui"
import { cn } from "@/lib/utils"
import { BUSINESS_OPTIONS, computeImpactBreakdown, serializeLectureQuery } from "@/lib/parcours-v2"
import { useParcoursFlow } from "@/components/parcours-v2/ParcoursFlowProvider"
import { ParcoursParticles } from "@/components/parcours-v2/ParcoursParticles"
import { ParcoursShell } from "@/components/parcours-v2/ParcoursShell"

type LeverKey = "retour" | "panier" | "propagation" | "missions"

export function ImpactStepPage() {
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const { state } = useParcoursFlow()
  const [viewBusiness, setViewBusiness] = useState(state.business ?? "cafe")
  const [open, setOpen] = useState(false)
  const totalRef = useRef<HTMLDivElement | null>(null)
  const waveRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const lectureQuery = serializeLectureQuery(state)
  const impact = useMemo(() => computeImpactBreakdown(state, viewBusiness), [state, viewBusiness])

  useEffect(() => {
    if (reducedMotion) {
      ;(["retour", "panier", "propagation", "missions"] as LeverKey[]).forEach((key) => {
        const row = document.getElementById(`impact-row-${key}`)
        const valueNode = document.getElementById(`impact-val-${key}`)
        const barNode = document.getElementById(`impact-bar-${key}`)
        const percentNode = document.getElementById(`impact-pct-${key}`)
        if (row) row.style.opacity = "1"
        if (barNode) barNode.style.width = `${Math.max(10, impact.percentages[key])}%`
        if (valueNode) valueNode.textContent = `€${Math.round(impact.levers[key]).toLocaleString("fr-FR")}`
        if (percentNode) percentNode.textContent = `${impact.percentages[key]}% du total`
      })
      if (totalRef.current) {
        totalRef.current.textContent = `+€${Math.round(impact.total).toLocaleString("fr-FR")}`
      }
      ;(["v1", "v2", "v3", "v4"] as const).forEach((wave) => {
        const row = document.getElementById(`wave-row-${wave}`)
        const fillNode = waveRefs.current[wave]
        const valueNode = document.getElementById(`wave-val-${wave}`)
        const value = impact.waves[wave]
        if (row) row.style.opacity = "1"
        if (fillNode) fillNode.style.width = `${(value / impact.waves.max) * 100}%`
        if (valueNode) valueNode.textContent = `${value}`
      })
      return
    }

    const counters: gsap.core.Tween[] = []
    const timeline = gsap.timeline()

    ;(["retour", "panier", "propagation", "missions"] as LeverKey[]).forEach((key, index) => {
      const valueNode = document.getElementById(`impact-val-${key}`)
      const barNode = document.getElementById(`impact-bar-${key}`)
      const percentNode = document.getElementById(`impact-pct-${key}`)

      timeline.fromTo(
        `#impact-row-${key}`,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
        index * 0.42,
      )

      timeline.call(
        () => {
          if (!valueNode || !barNode || !percentNode) return
          barNode.style.width = `${Math.max(10, impact.percentages[key])}%`
          const counter = { value: 0 }
          const tween = gsap.to(counter, {
            value: impact.levers[key],
            duration: 1.1,
            ease: "power2.out",
            onUpdate: () => {
              valueNode.textContent = `€${Math.round(counter.value).toLocaleString("fr-FR")}`
            },
            onComplete: () => {
              percentNode.textContent = `${impact.percentages[key]}% du total`
            },
          })
          counters.push(tween)
        },
        [],
        index * 0.42 + 0.08,
      )
    })

    timeline.call(
      () => {
        if (!totalRef.current) return
        const node = totalRef.current
        const counter = { value: 0 }
        const tween = gsap.to(counter, {
          value: impact.total,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            node.textContent = `+€${Math.round(counter.value).toLocaleString("fr-FR")}`
          },
        })
        counters.push(tween)
      },
      [],
      2.05,
    )

    ;(["v1", "v2", "v3", "v4"] as const).forEach((wave, index) => {
      timeline.fromTo(
        `#wave-row-${wave}`,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" },
        2.85 + index * 0.2,
      )
      timeline.call(
        () => {
          const fillNode = waveRefs.current[wave]
          const valueNode = document.getElementById(`wave-val-${wave}`)
          const value = impact.waves[wave]
          if (fillNode) fillNode.style.width = `${(value / impact.waves.max) * 100}%`
          if (valueNode) valueNode.textContent = `${value}`
        },
        [],
        2.95 + index * 0.2,
      )
    })

    return () => {
      timeline.kill()
      counters.forEach((counter) => counter.kill())
    }
  }, [impact, reducedMotion])

  return (
    <ParcoursShell
      backHref={`/parcours/configuration${lectureQuery ? `?${lectureQuery}` : ""}`}
      stepIndex={2}
      rightSlot={
        <div className="relative text-right">
          <button
            className="text-[10px] uppercase tracking-[0.18em] text-[#8a8578] transition hover:text-[#3d4d43]"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            Vue : {impact.profile.label}
          </button>
          {open ? (
            <div className="absolute right-0 top-full z-20 mt-2 min-w-[140px] rounded border border-[#d4cdbd] bg-[#f2ede4] py-1 shadow-[0_8px_24px_rgba(15,61,46,0.08)]">
              {BUSINESS_OPTIONS.map((option) => (
                <button
                  className={`block w-full px-4 py-2 text-left text-[11px] uppercase tracking-[0.1em] transition hover:bg-[#ece6da] hover:text-[#0f3d2e] ${option.key === viewBusiness ? "font-medium text-[#0f3d2e]" : "text-[#3d4d43]"}`}
                  key={option.key}
                  onClick={() => {
                    setViewBusiness(option.key)
                    setOpen(false)
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      }
    >
      <ParcoursParticles />

      <section className="relative z-[2] mx-auto max-w-[920px] pb-10">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-[#8a8578]">Étape 03 — Impact</p>
          <h1 className="font-serif text-[clamp(44px,6vw,68px)] leading-[1.02] text-[#1a2a22]">
            Votre <em className="italic text-[#0f3d2e]">saison,</em>
            <br />
            en rythme.
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] font-serif text-[clamp(18px,2vw,22px)] italic leading-[1.5] text-[#3d4d43]">
            Chaque semaine, un moment visible. Au bout, un Diamond qui reste en jeu.
          </p>
          <p className="mx-auto mt-3 max-w-[520px] text-[11px] uppercase tracking-[0.22em] text-[#8a8578] sm:text-[12px]">
            Chaque étape déclenche la suivante. La saison avance, puis se resserre.
          </p>
        </div>

        <div className="space-y-10">
          {(["retour", "panier", "propagation", "missions"] as LeverKey[]).map((key, index) => {
            const warm = key === "propagation" || key === "missions"
            return (
              <div className="grid gap-4 opacity-0 md:grid-cols-[180px_1fr_160px] md:items-center md:gap-8" id={`impact-row-${key}`} key={key}>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">{`0${index + 1} · ${capitalize(key)}`}</span>
                  <span className="font-serif text-2xl font-medium leading-tight text-[#1a2a22]">{capitalize(key)}</span>
                  <span className="font-serif text-[13px] italic text-[#8c6a44]">{impact.profile.roles[key]}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="h-[6px] overflow-hidden rounded-[3px] border border-[#d4cdbd] bg-[#ece6da]">
                    <div
                      className={`h-full w-0 transition-[width] duration-[1300ms] ${warm ? "bg-[linear-gradient(90deg,#b8956a,#8c6a44)]" : "bg-[linear-gradient(90deg,#1f5a42,#0f3d2e)]"}`}
                      id={`impact-bar-${key}`}
                    />
                  </div>
                  <div className="text-sm leading-6 text-[#3d4d43]" dangerouslySetInnerHTML={{ __html: impact.profile.winwin[key] }} />
                </div>

                <div className="flex flex-col items-end gap-1 text-right">
                  <span className={`font-serif text-[32px] font-medium leading-none ${warm ? "text-[#8c6a44]" : "text-[#0f3d2e]"}`} id={`impact-val-${key}`}>
                    €0
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#8a8578]" id={`impact-pct-${key}`} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-20 border-y border-[#d4cdbd] px-4 py-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-[#b8956a]/50" />
            <span className="font-serif text-xl text-[#b8956a]">◆</span>
            <span className="h-px w-8 bg-[#b8956a]/50" />
          </div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.32em] text-[#8a8578]">Cap réaliste · Saison 90 jours</div>
          <div className="font-serif text-[clamp(58px,8vw,92px)] font-medium leading-none tracking-[-0.02em] text-[#0f3d2e]" ref={totalRef}>
            +€0
          </div>
          <div className="mt-3 font-serif text-lg italic text-[#8a8578]">après moments, retours et coût Diamond borné</div>
          <div className="mt-8 inline-block rounded-full border border-[#d4cdbd] bg-[#f2ede4] px-5 py-2 text-[12px] text-[#3d4d43]">
            Basé sur votre volume, votre panier et votre rythme de retour · <strong className="font-medium text-[#0f3d2e]">{impact.sigma}×</strong> de levier estimé
          </div>
        </div>

        <div className="mt-20">
          <div className="mb-3 text-center text-[10px] uppercase tracking-[0.32em] text-[#8a8578]">Quand ça se propage</div>
          <h2 className="text-center font-serif text-[clamp(30px,4vw,40px)] leading-[1.15] text-[#1a2a22]">
            Vos clients reviennent avec <em className="italic text-[#8c6a44]">quelqu&apos;un.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] text-center font-serif text-[17px] italic leading-[1.5] text-[#3d4d43]">{impact.profile.cascadeSub}</p>

          <div className="mx-auto mt-12 flex max-w-[720px] flex-col gap-4">
            {(["v1", "v2", "v3", "v4"] as const).map((wave, index) => (
              <div className="grid gap-3 opacity-0 md:grid-cols-[100px_1fr_120px] md:items-center md:gap-5" id={`wave-row-${wave}`} key={wave}>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">{`Vague ${index + 1}`}</div>
                <div className="h-7 overflow-hidden rounded border border-[#d4cdbd] bg-[#ece6da]">
                  <div
                    className={`flex h-full w-0 items-center px-3 font-serif text-[13px] font-medium text-[#f2ede4] transition-[width] duration-[1000ms] ${
                      index === 0
                        ? "bg-[linear-gradient(90deg,#1f5a42,#0f3d2e)]"
                        : index === 1
                          ? "bg-[linear-gradient(90deg,rgba(15,61,46,0.6),#1f5a42)]"
                          : index === 2
                            ? "bg-[linear-gradient(90deg,#8c6a44,#b8956a)]"
                            : "bg-[linear-gradient(90deg,rgba(184,149,106,0.5),#d4b892)]"
                    }`}
                    ref={(node) => {
                      waveRefs.current[wave] = node
                    }}
                  >
                    {index === 0 ? "Visiteurs" : "Invités"}
                  </div>
                </div>
                <div className="text-right font-serif text-xl font-medium text-[#1a2a22]" id={`wave-val-${wave}`}>
                  0
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-[600px] text-center font-serif text-lg italic leading-[1.5] text-[#3d4d43]">
            Le rythme s&apos;amplifie — <em className="text-[#0f3d2e]">puis se stabilise</em>. La saison reste lisible et bornée.
          </p>
        </div>

        <div className="mt-20 rounded-md border border-[#d4cdbd] bg-[#f2ede4] px-6 py-10">
          <div className="mb-2 text-center text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">Le cadre de saison</div>
          <h3 className="mb-8 text-center font-serif text-[clamp(24px,3vw,30px)] leading-tight text-[#1a2a22]">
            Ce qui <em className="italic text-[#0f3d2e]">tient</em> la saison.
          </h3>
          <div className="mx-auto flex max-w-[620px] flex-col gap-4">
            {[
              "Chaque semaine, un moment visible donne une raison claire de revenir ici.",
              "Chaque récompense est validée au comptoir, jamais automatique.",
              "Le Diamond reste visible pendant toute la saison, mais il ne tombe que pour quelques clients.",
              "La saison dure 90 jours. Passée cette borne, un nouveau cycle peut s'ouvrir.",
            ].map((rule, index) => (
              <div className="flex gap-4 border-b border-[#d4cdbd] pb-4 last:border-b-0 last:pb-0" key={rule}>
                <span className="min-w-6 font-serif text-base italic text-[#b8956a]">{["i", "ii", "iii", "iv"][index]}</span>
                <span className="font-serif text-[17px] leading-[1.5] text-[#1a2a22]">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3">
              <button
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                onClick={() => router.push(`/parcours/offre${lectureQuery ? `?${lectureQuery}` : ""}`)}
                type="button"
              >
            Voir l'offre de saison
              </button>
          <p className="text-[11px] italic tracking-[0.1em] text-[#8a8578]">Diamond visible · saison de 90 jours · ajustable jusqu'au paiement</p>
        </div>
      </section>
    </ParcoursShell>
  )
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
