"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"

import { CHALLENGE_PRICING, STRIPE_CHALLENGE_LINK } from "@/lib/landing-content"
import { CARDIN_CONTACT_EMAIL, buildContactMailto } from "@/lib/site-contact"

type BusinessKey = "cafe" | "bar" | "restaurant" | "beaute" | "boutique"
type TempoKey = "classic" | "motion"

type MotionCard = {
  tag: string
  phrase: string
}

type ChallengeTempo = {
  name: string
  actionPhrase: string
  action: string
  actionSub: string
  duration: string
  durationSub: string
  winners: string
  winnersSub: string
  cost: number
  returnMin: number
  returnSub: string
}

type ChallengeBusiness = {
  label: string
  classic: ChallengeTempo
  motion: ChallengeTempo
  motionLabel: string
  motionCards: MotionCard[]
}

const CHALLENGES: Record<BusinessKey, ChallengeBusiness> = {
  cafe: {
    label: "Cafe",
    classic: {
      name: "L'appel du duo.",
      actionPhrase: "Invitez un ami a prendre un cafe cette semaine. Les 10 premiers duos gagnent un mois de cafe offert.",
      action: "Venir a deux",
      actionSub: "scanne au comptoir",
      duration: "7 jours",
      durationSub: "une semaine calendaire",
      winners: "10 duos",
      winnersSub: "premiers arrives",
      cost: 180,
      returnMin: 1800,
      returnSub: "sur la semaine",
    },
    motion: {
      name: "Le defi qui tourne.",
      actionPhrase: "Un nouveau defi chaque jour, lisible au comptoir. Le premier client qui le releve gagne sa recompense.",
      action: "Defi du jour",
      actionSub: "un par jour",
      duration: "2 a 3 semaines",
      durationSub: "cadre court et relancable",
      winners: "multiples",
      winnersSub: "un par defi releve",
      cost: 180,
      returnMin: 2200,
      returnSub: "sur 2 a 3 semaines",
    },
    motionLabel: "Un defi par jour qui recompense le premier a le relever",
    motionCards: [
      { tag: "Defi du matin", phrase: "Venez avant 9h. Le 5e arrive gagne son cafe + croissant offert." },
      { tag: "Defi du duo", phrase: "Venez a deux aujourd'hui. Le premier duo gagne deux cafes offerts." },
      { tag: "Defi de l'apres-midi", phrase: "Passez entre 15h et 17h. Le 3e a scanner gagne un gouter complet." },
      { tag: "Defi du week-end", phrase: "Venez samedi avec un ami. Le duo le plus tot gagne un brunch pour deux." },
    ],
  },
  bar: {
    label: "Bar",
    classic: {
      name: "La table la plus nombreuse.",
      actionPhrase: "Ramenez vos amis ce vendredi soir. L'equipe la plus nombreuse gagne la tournee.",
      action: "Venir a 3+",
      actionSub: "valide par le staff",
      duration: "1 soiree",
      durationSub: "le vendredi choisi",
      winners: "1 equipe",
      winnersSub: "la plus nombreuse",
      cost: 180,
      returnMin: 1900,
      returnSub: "sur la soiree",
    },
    motion: {
      name: "La soiree qui surprend.",
      actionPhrase: "Chaque soiree, une nouvelle mission au bar. Le premier a la valider gagne sa recompense.",
      action: "Mission du soir",
      actionSub: "revelee au comptoir",
      duration: "2 semaines",
      durationSub: "plusieurs soirees",
      winners: "multiples",
      winnersSub: "un par mission validee",
      cost: 180,
      returnMin: 2400,
      returnSub: "sur 2 semaines",
    },
    motionLabel: "Une mission par soiree qui recompense le premier a la relever",
    motionCards: [
      { tag: "Mission du soir", phrase: "Goutez le cocktail signature. Le 3e a le commander gagne sa tournee offerte." },
      { tag: "Mission du groupe", phrase: "Venez a 4 ou plus. Le premier groupe gagne la tournee du bar." },
      { tag: "Mission surprise", phrase: "Commandez la creation du jour. Le 5e a scanner gagne un verre offert." },
      { tag: "Mission du week-end", phrase: "Passez samedi avant 22h. Le premier a arriver gagne deux verres offerts." },
    ],
  },
  restaurant: {
    label: "Restaurant",
    classic: {
      name: "La plus belle table.",
      actionPhrase: "Reservez une table de 4+ ce jeudi soir. Le diner de la plus grande tablee est offert.",
      action: "Table 4+",
      actionSub: "reservation validee",
      duration: "1 soiree",
      durationSub: "le jeudi choisi",
      winners: "1 table",
      winnersSub: "la plus grande",
      cost: 220,
      returnMin: 2200,
      returnSub: "sur la soiree",
    },
    motion: {
      name: "La semaine qui recompense.",
      actionPhrase: "Un defi par service, midi ou soir. Le premier client a le valider gagne.",
      action: "Defi du service",
      actionSub: "un par midi/soir",
      duration: "2 semaines",
      durationSub: "plusieurs services",
      winners: "multiples",
      winnersSub: "un par defi valide",
      cost: 220,
      returnMin: 2800,
      returnSub: "sur 2 semaines",
    },
    motionLabel: "Un defi par service qui recompense le premier a le relever",
    motionCards: [
      { tag: "Defi du midi", phrase: "Commandez le plat du chef ce midi. Le premier a le choisir gagne son dessert offert." },
      { tag: "Defi du soir", phrase: "Reservez une table de 4+. La premiere table complete gagne l'aperitif offert." },
      { tag: "Defi de l'accord", phrase: "Prenez l'accord mets-vin. Le 3e client a le commander gagne son verre offert." },
      { tag: "Defi du retour", phrase: "Revenez cette semaine avec un nouveau convive. Le premier duo gagne un menu offert." },
    ],
  },
  beaute: {
    label: "Beaute",
    classic: {
      name: "Le rendez-vous decouverte.",
      actionPhrase: "Prenez un premier rendez-vous decouverte cette semaine. Deux clientes gagnent un soin express offert.",
      action: "RDV decouverte",
      actionSub: "effectue en salon",
      duration: "14 jours",
      durationSub: "deux semaines",
      winners: "2 clientes",
      winnersSub: "tirees parmi les RDV effectues",
      cost: 210,
      returnMin: 1800,
      returnSub: "sur le mois qui suit",
    },
    motion: {
      name: "Le parcours revelateur.",
      actionPhrase: "Chaque semaine, une nouvelle proposition en salon. La premiere cliente a la reserver gagne.",
      action: "Proposition hebdo",
      actionSub: "une par semaine",
      duration: "3 a 4 semaines",
      durationSub: "cadre relancable",
      winners: "multiples",
      winnersSub: "une par proposition",
      cost: 210,
      returnMin: 2000,
      returnSub: "sur 4 semaines",
    },
    motionLabel: "Une proposition par semaine qui recompense la premiere a la reserver",
    motionCards: [
      { tag: "Proposition de la semaine", phrase: "Reservez un soin express en semaine. La premiere a reserver gagne un second soin offert." },
      { tag: "Proposition duo", phrase: "Venez a deux pour un soin partage. Le premier duo gagne un soin visage offert." },
      { tag: "Proposition creaneau calme", phrase: "Prenez un RDV en matinee. La 3e cliente gagne un add-on offert." },
      { tag: "Proposition rituel", phrase: "Testez le rituel signature. La premiere a reserver gagne un soin anniversaire." },
    ],
  },
  boutique: {
    label: "Boutique",
    classic: {
      name: "L'essayage signature.",
      actionPhrase: "Essayez une piece de la nouvelle collection cette semaine. Deux personnes gagnent un credit boutique.",
      action: "Essayage",
      actionSub: "valide en boutique",
      duration: "14 jours",
      durationSub: "deux semaines",
      winners: "2 personnes",
      winnersSub: "tirees parmi les essayages",
      cost: 240,
      returnMin: 2000,
      returnSub: "sur le mois qui suit",
    },
    motion: {
      name: "La garde-robe qui s'ecrit.",
      actionPhrase: "Une piece a l'honneur par livraison ou drop. La premiere personne a la relever gagne un credit.",
      action: "Piece du moment",
      actionSub: "une par drop ou livraison",
      duration: "3 a 4 semaines",
      durationSub: "cadre relancable",
      winners: "multiples",
      winnersSub: "un credit par defi",
      cost: 240,
      returnMin: 2400,
      returnSub: "sur 4 semaines",
    },
    motionLabel: "Une piece par livraison qui recompense la premiere a la relever",
    motionCards: [
      { tag: "Piece du moment", phrase: "Essayez la piece du mois. La premiere a l'essayer gagne un credit boutique." },
      { tag: "Piece du drop", phrase: "Venez au lancement du drop. Le 3e arrive gagne un credit." },
      { tag: "Piece partagee", phrase: "Venez avec un proche pour un essayage duo. Le premier duo gagne un credit partage." },
      { tag: "Piece du retour", phrase: "Revenez avec la piece precedente portee. La premiere a revenir gagne un credit." },
    ],
  },
}

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  left: `${6 + ((index * 7) % 88)}%`,
  top: `${8 + ((index * 13) % 82)}%`,
}))

export function ChallengePage() {
  const [businessKey, setBusinessKey] = useState<BusinessKey>("cafe")
  const [tempo, setTempo] = useState<TempoKey>("classic")
  const [motionIndex, setMotionIndex] = useState(0)
  const [whyOpen, setWhyOpen] = useState(false)
  const returnRef = useRef<HTMLSpanElement | null>(null)
  const costRef = useRef<HTMLSpanElement | null>(null)

  const business = CHALLENGES[businessKey]
  const challenge = business[tempo]
  const ratio = challenge.returnMin / challenge.cost
  const challengeHref = STRIPE_CHALLENGE_LINK || buildChallengeFallbackMailto(business.label, tempo)
  const challengeLinkLabel = STRIPE_CHALLENGE_LINK ? "Lancer mon challenge" : "Recevoir le lien challenge"

  useEffect(() => {
    const particles = document.querySelectorAll<HTMLElement>("[data-challenge-particle]")
    const heroTimeline = gsap.timeline({ delay: 0.15 })
    heroTimeline
      .from("[data-challenge-kicker]", { opacity: 0, y: 8, duration: 0.65, ease: "power2.out" })
      .from("[data-challenge-title]", { opacity: 0, y: 10, duration: 0.75, ease: "power2.out" }, "-=0.3")
      .from("[data-challenge-sub]", { opacity: 0, y: 8, duration: 0.65, ease: "power2.out" }, "-=0.35")
      .from("[data-challenge-biz]", { opacity: 0, y: 8, duration: 0.6, ease: "power2.out" }, "-=0.25")
      .from("[data-challenge-card]", { opacity: 0, y: 12, duration: 0.75, ease: "power2.out" }, "-=0.3")

    const particleTweens = Array.from(particles).map((particle, index) =>
      gsap.to(particle, {
        y: -30 - (index % 5) * 7,
        x: (index % 2 === 0 ? 1 : -1) * (8 + (index % 4) * 5),
        opacity: 0.22 + (index % 4) * 0.06,
        duration: 7 + (index % 5),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.12,
      }),
    )

    return () => {
      heroTimeline.kill()
      particleTweens.forEach((tween) => tween.kill())
    }
  }, [])

  useEffect(() => {
    if (tempo !== "motion") return

    const timer = window.setInterval(() => {
      setMotionIndex((current) => (current + 1) % business.motionCards.length)
    }, 3500)

    return () => window.clearInterval(timer)
  }, [business.motionCards.length, tempo, businessKey])

  useEffect(() => {
    setMotionIndex(0)
    const nextCost = { value: 0 }
    const nextReturn = { value: 0 }

    const costTween = costRef.current
      ? gsap.to(nextCost, {
          value: challenge.cost,
          duration: 1,
          ease: "power2.out",
          onUpdate: () => {
            if (costRef.current) costRef.current.textContent = `${Math.round(nextCost.value).toLocaleString("fr-FR")} €`
          },
        })
      : null

    const returnTween = returnRef.current
      ? gsap.to(nextReturn, {
          value: challenge.returnMin,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: () => {
            if (returnRef.current) returnRef.current.textContent = `${Math.round(nextReturn.value).toLocaleString("fr-FR")} €`
          },
        })
      : null

    return () => {
      costTween?.kill()
      returnTween?.kill()
    }
  }, [challenge])

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f2ede4] text-[#1a2a22]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        {PARTICLES.map((particle, index) => (
          <span
            className="absolute h-[2px] w-[2px] rounded-full bg-[#b8956a] opacity-0"
            data-challenge-particle
            key={index}
            style={{ left: particle.left, top: particle.top }}
          />
        ))}
      </div>

      <section className="relative z-[2] mx-auto max-w-[1100px] px-5 pb-20 pt-32 sm:px-8 lg:px-10">
        <div className="text-center">
          <p className="mb-4 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]" data-challenge-kicker>
            <span className="h-px w-4 bg-[#b8956a]/70" />
            <span>Cardin · Challenge</span>
            <span className="h-px w-4 bg-[#b8956a]/70" />
          </p>
          <h1 className="font-serif text-[clamp(46px,7vw,76px)] leading-[1.02] tracking-[-0.015em] text-[#1a2a22]" data-challenge-title>
            Un défi. <em className="italic text-[#0f3d2e]">Un gagnant.</em>
            <br />
            Un retour mesurable.
          </h1>
          <p className="mx-auto mt-5 max-w-[680px] font-serif text-[clamp(17px,2vw,21px)] italic leading-[1.55] text-[#3d4d43]" data-challenge-sub>
            Cardin calibre un challenge court pour votre commerce. Mono-action côté client. Ratio cadré avant lancement.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3" data-challenge-biz>
          {(Object.keys(CHALLENGES) as BusinessKey[]).map((key) => (
            <button
              className={[
                "rounded-full border px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] transition",
                key === businessKey
                  ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4]"
                  : "border-[#d4cdbd] text-[#3d4d43] hover:border-[#0f3d2e] hover:text-[#0f3d2e]",
              ].join(" ")}
              key={key}
              onClick={() => setBusinessKey(key)}
              type="button"
            >
              {CHALLENGES[key].label}
            </button>
          ))}
        </div>

        <article className="relative mx-auto mt-10 max-w-[860px] rounded-md border border-[#d4cdbd] bg-[#f2ede4] px-5 py-8 shadow-[0_24px_64px_rgba(15,61,46,0.06)] sm:px-8 sm:py-10 md:px-12" data-challenge-card>
          <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-[#b8956a]/50" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[#b8956a]/50" />

          <div className="mx-auto mb-8 flex w-fit items-center gap-1 rounded-full border border-[#d4cdbd] bg-[#ece6da] p-1">
            <button
              className={tempoButtonClass(tempo === "classic")}
              onClick={() => setTempo("classic")}
              type="button"
            >
              <span className="font-serif text-[13px]">◇</span>
              Challenge signature
            </button>
            <button
              className={tempoButtonClass(tempo === "motion")}
              onClick={() => setTempo("motion")}
              type="button"
            >
              <span className="font-serif text-[13px]">↻</span>
              Challenge en mouvement
            </button>
          </div>

          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">
            {tempo === "motion" ? `Challenge en mouvement · ${business.label}` : `Challenge signature · ${business.label}`}
          </p>

          <h2 className="mt-3 text-center font-serif text-[clamp(30px,4.5vw,44px)] leading-[1.12] tracking-[-0.01em] text-[#1a2a22]">
            {challenge.name.split(".")[0]}
            <span className="text-[#0f3d2e]">{challenge.name.endsWith(".") ? "." : ""}</span>
          </h2>

          <p className="mx-auto mt-5 max-w-[590px] text-center font-serif text-[17px] italic leading-[1.55] text-[#3d4d43]">
            {challenge.actionPhrase}
          </p>

          <div className="mb-8 mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-[#b8956a]/40" />
            <span className="font-serif text-lg text-[#b8956a]">◇</span>
            <span className="h-px w-14 bg-[#b8956a]/40" />
          </div>

          {tempo === "motion" ? (
            <div className="mb-8 rounded-md border border-[#d4b892] bg-[linear-gradient(to_bottom,rgba(255,250,240,0.7),rgba(184,149,106,0.05))] px-5 py-5 text-center">
              <div className="mb-3 flex items-center justify-center gap-3 text-[9px] uppercase tracking-[0.3em] text-[#8a8578]">
                <span className="h-px w-4 bg-[#b8956a]/50" />
                <span>{business.motionLabel}</span>
                <span className="h-px w-4 bg-[#b8956a]/50" />
              </div>
              <div className="min-h-[74px]">
                <span className="inline-block rounded-full border border-[#b8956a] px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-[#8c6a44]">
                  {business.motionCards[motionIndex].tag}
                </span>
                <p className="mx-auto mt-4 max-w-[520px] font-serif text-[17px] leading-[1.4] text-[#1a2a22]">
                  {business.motionCards[motionIndex].phrase}
                </p>
              </div>
              <div className="mt-4 flex justify-center gap-1.5">
                {business.motionCards.map((_, index) => (
                  <span
                    className={[
                      "h-[5px] w-[5px] rounded-full transition",
                      index === motionIndex ? "bg-[#b8956a]" : "bg-[#d4cdbd]",
                    ].join(" ")}
                    key={index}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid border-y border-[#d4cdbd] md:grid-cols-3">
            <Param label="Action" sub={challenge.actionSub} value={challenge.action} />
            <Param label="Cadre" sub={challenge.durationSub} value={challenge.duration} />
            <Param label="Gagnants" sub={challenge.winnersSub} value={challenge.winners} warm />
          </div>

          <div className="mt-8 rounded border border-[#d4cdbd] bg-[linear-gradient(to_bottom,rgba(15,61,46,0.03),rgba(184,149,106,0.04))] px-5 py-5 sm:px-7">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#8a8578]">Cadre économique</span>
              <span className="inline-flex w-fit rounded-full bg-[#0f3d2e] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[#f2ede4]">
                Ratio cadré {ratio.toFixed(1)}×
              </span>
            </div>

            <div className="grid gap-4 text-center sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8a8578]">Investissement total</span>
                <span className="font-serif text-[30px] leading-none text-[#1a2a22]" ref={costRef}>
                  0 €
                </span>
                <span className="font-serif text-[12px] italic text-[#8a8578]">frais Cardin + récompense</span>
              </div>
              <div className="font-serif text-[26px] italic text-[#b8956a] sm:rotate-0">→</div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8a8578]">Retour minimum projeté</span>
                <span className="font-serif text-[30px] leading-none text-[#0f3d2e]" ref={returnRef}>
                  0 €
                </span>
                <span className="font-serif text-[12px] italic text-[#8a8578]">{challenge.returnSub}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8a8578] transition hover:text-[#0f3d2e]"
              onClick={() => setWhyOpen((current) => !current)}
              type="button"
            >
              <span>Pourquoi ce ratio tient</span>
              <span className={`text-[8px] transition ${whyOpen ? "rotate-180" : ""}`}>▾</span>
            </button>

            {whyOpen ? (
              <div className="mt-4 grid gap-3 text-left md:grid-cols-3">
                <WhyCard description="La récompense est comptée sur son coût réel pour vous, pas sur son prix de vente." index="i." title="Marge, pas revenu" />
                <WhyCard description="Les non-gagnants participent en consommant. C'est là que le ratio se construit." index="ii." title="Les perdants consomment" />
                <WhyCard description="Cardin ne lance pas si le volume estimé est trop faible pour rendre le cadre crédible." index="iii." title="Seuil de participation" />
              </div>
            ) : null}
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <RuleCard index="i." text="Validation au comptoir. Pas de triche possible." />
            <RuleCard index="ii." text="Règlement auto-généré, conforme au cadre français." />
            <RuleCard index="iii." text="Activation sous 24 h après paiement." />
          </div>

          <div className="mt-10 text-center">
            <div className="mb-5 inline-flex flex-wrap items-center justify-center gap-3 text-[12px] uppercase tracking-[0.2em] text-[#8a8578]">
              <span>Challenge Cardin</span>
              <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/50" />
              <span>
                <strong className="font-medium text-[#1a2a22]">{CHALLENGE_PRICING.activationFee} €</strong> TTC
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/50" />
              <span>Récompense incluse</span>
            </div>

            <a
              className="inline-flex items-center gap-3 rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-8 py-4 text-[12px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
              href={challengeHref}
              rel={STRIPE_CHALLENGE_LINK ? "noreferrer" : undefined}
              target={STRIPE_CHALLENGE_LINK ? "_blank" : undefined}
            >
              <span>{challengeLinkLabel}</span>
              <span aria-hidden="true">→</span>
            </a>
            <p className="mt-3 text-[11px] italic tracking-[0.08em] text-[#8a8578]">
              {STRIPE_CHALLENGE_LINK ? "Paiement sécurisé par Stripe · activation sous 24 h" : "Lien Stripe à brancher · fallback contact prêt"}
            </p>
          </div>
        </article>

        <div className="mx-auto mt-16 max-w-[720px] border-t border-[#d4cdbd] px-4 pt-8 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#8a8578]">Pour aller plus loin</p>
          <h3 className="mt-3 font-serif text-[clamp(24px,3vw,30px)] leading-[1.25] text-[#1a2a22]">
            Le challenge est une saison, <em className="italic text-[#0f3d2e]">condensée.</em>
          </h3>
          <p className="mx-auto mt-3 max-w-[520px] font-serif text-[16px] italic leading-[1.5] text-[#3d4d43]">
            Si vous voulez structurer le retour client sur 90 jours avec propagation, lecture du lieu et offre de saison, découvrez la Saison Cardin.
          </p>
          <Link className="mt-5 inline-flex text-[11px] uppercase tracking-[0.2em] text-[#0f3d2e] underline decoration-[#0f3d2e] underline-offset-4 transition hover:opacity-70" href="/parcours/lecture">
            Voir la Saison →
          </Link>
        </div>
      </section>
    </main>
  )
}

function tempoButtonClass(active: boolean) {
  return [
    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] transition",
    active ? "bg-[#1a2a22] text-[#f2ede4]" : "text-[#8a8578] hover:text-[#0f3d2e]",
  ].join(" ")
}

function Param({ label, sub, value, warm = false }: { label: string; sub: string; value: string; warm?: boolean }) {
  return (
    <div className="border-b border-[#d4cdbd] px-4 py-5 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">{label}</div>
      <div className={`mt-2 font-serif text-[24px] leading-[1.15] ${warm ? "text-[#8c6a44]" : "text-[#1a2a22]"}`}>{value}</div>
      <div className="mt-1 font-serif text-[12px] italic text-[#8a8578]">{sub}</div>
    </div>
  )
}

function WhyCard({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <div className="rounded-[3px] border border-dashed border-[#d4cdbd] bg-[#f2ede4] px-4 py-4">
      <div className="font-serif text-[12px] italic text-[#b8956a]">{index}</div>
      <div className="mt-1 font-serif text-[15px] text-[#1a2a22]">{title}</div>
      <div className="mt-1 font-serif text-[13px] italic leading-[1.45] text-[#3d4d43]">{description}</div>
    </div>
  )
}

function RuleCard({ index, text }: { index: string; text: string }) {
  return (
    <div className="flex gap-2 rounded-[3px] border border-[#d4cdbd] px-4 py-4 font-serif text-[13px] italic leading-[1.45] text-[#3d4d43]">
      <span className="shrink-0 text-[11px] text-[#b8956a]">{index}</span>
      <span>{text}</span>
    </div>
  )
}

function buildChallengeFallbackMailto(businessLabel: string, tempo: TempoKey) {
  return buildContactMailto(
    "Cardin · challenge",
    [
      "Bonjour Cardin,",
      "",
      "Je veux lancer un Challenge Cardin.",
      "",
      `Type de lieu : ${businessLabel}`,
      `Format : ${tempo === "motion" ? "Challenge en mouvement" : "Challenge signature"}`,
      "",
      `Recontactez-moi sur ${CARDIN_CONTACT_EMAIL} ou revenez vers moi avec le lien de paiement challenge.`,
    ].join("\r\n"),
  )
}
