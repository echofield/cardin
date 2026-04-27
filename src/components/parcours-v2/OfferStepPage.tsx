"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef } from "react"
import { gsap } from "gsap"

import { buildOfferProjectionRange, buildOfferRecapItems, computeImpactBreakdown, serializeLectureQuery } from "@/lib/parcours-v2"
import { useParcoursFlow } from "@/components/parcours-v2/ParcoursFlowProvider"
import { ParcoursParticles } from "@/components/parcours-v2/ParcoursParticles"
import { ParcoursShell } from "@/components/parcours-v2/ParcoursShell"
import { CARDIN_CONTACT_EMAIL, buildContactMailto } from "@/lib/site-contact"

export function OfferStepPage() {
  const { state } = useParcoursFlow()
  const rangeRef = useRef<HTMLSpanElement | null>(null)
  const lectureQuery = serializeLectureQuery(state)
  const recapItems = buildOfferRecapItems(state)
  const impact = useMemo(() => computeImpactBreakdown(state), [state])
  const offerRange = useMemo(() => buildOfferProjectionRange(impact.total), [impact.total])
  const contactHref = buildContactMailto(
    "Cardin · échanger sur la saison",
    "Bonjour Cardin,\r\n\r\nJe veux échanger sur cette saison Cardin et voir la bonne mise en place pour mon lieu.\r\n",
  )

  useEffect(() => {
    if (!rangeRef.current) return
    const counter = { min: 0, max: 0 }
    const tween = gsap.to(counter, {
      min: offerRange.min,
      max: offerRange.max,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        if (rangeRef.current) {
          rangeRef.current.textContent = `€${Math.round(counter.min).toLocaleString("fr-FR")} — €${Math.round(counter.max).toLocaleString("fr-FR")}`
        }
      },
    })
    return () => {
      tween.kill()
    }
  }, [offerRange.max, offerRange.min])

  return (
    <ParcoursShell backHref={`/parcours/impact${lectureQuery ? `?${lectureQuery}` : ""}`} stepIndex={3}>
      <ParcoursParticles />

      <section className="relative z-[2] flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center px-4 pb-12 pt-4 text-center">
        <div className="mb-8 flex max-w-[640px] flex-wrap justify-center gap-2">
          {recapItems.map((item) => (
            <span
              className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] ${item.warm ? "border-[#d4b892] text-[#8c6a44]" : "border-[#d4cdbd] text-[#8a8578]"}`}
              key={item.key}
            >
              {item.label}
            </span>
          ))}
        </div>

        <h1 className="font-serif text-[clamp(48px,7vw,80px)] leading-[1.02] tracking-[-0.015em] text-[#1a2a22]">
          Votre saison <em className="italic text-[#0f3d2e]">est prête.</em>
        </h1>

        <p className="mt-5 max-w-[540px] font-serif text-[clamp(16px,1.9vw,20px)] italic leading-[1.5] text-[#3d4d43]">
          Premier moment cadré cette semaine. Diamond visible dès l'installation. Activation digitale sous 48 heures.
        </p>

        <div className="mt-12 flex flex-col items-center gap-7">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-[#b8956a] opacity-30" />
            <span className="absolute -inset-3 rounded-full border border-dashed border-[#d4b892] opacity-50" />
            <span className="font-serif text-4xl text-[#b8956a]">◆</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#8a8578]">Projection réaliste de saison</span>
            <span className="font-serif text-[clamp(36px,6vw,68px)] font-medium leading-[1.06] tracking-[-0.02em] text-[#0f3d2e]" ref={rangeRef}>
              €0 — €0
            </span>
            <span className="font-serif text-base italic text-[#8a8578]">fourchette réaliste · net sur 90 jours</span>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-[12px] uppercase tracking-[0.18em] text-[#8a8578]">
          <span>Saison <strong className="font-medium text-[#1a2a22]">90 jours</strong></span>
          <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/60" />
          <span>Premier moment inclus</span>
          <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/60" />
          <span>Diamond visible</span>
          <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/60" />
          <span>Contact direct</span>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <a
            className="inline-flex items-center gap-4 rounded-sm border border-[#0f3d2e] bg-[#0f3d2e] px-12 py-5 text-[12px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
            href={contactHref}
          >
            <span>Contacter Cardin</span>
            <span aria-hidden="true">→</span>
          </a>
          <p className="text-[10px] italic tracking-[0.08em] text-[#8a8578]">Contact direct · {CARDIN_CONTACT_EMAIL}</p>
          <Link className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8a8578] transition hover:text-[#0f3d2e]" href={`/parcours/impact${lectureQuery ? `?${lectureQuery}` : ""}`}>
            <span aria-hidden="true">←</span>
            <span>Revoir l'impact</span>
          </Link>
        </div>
      </section>
    </ParcoursShell>
  )
}
