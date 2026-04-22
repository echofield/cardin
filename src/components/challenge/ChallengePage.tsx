"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

import { CHALLENGE_PRICING, STRIPE_CHALLENGE_LINK } from "@/lib/landing-content"
import { CARDIN_CONTACT_EMAIL, buildContactMailto } from "@/lib/site-contact"

type BusinessKey = "cafe" | "bar" | "restaurant" | "beaute" | "boutique"

type ChallengeAct = {
  label: string
  title: string
  detail: string
}

type ChallengeBusiness = {
  label: string
  name: string
  lead: string
  frame: string
  frameSub: string
  winners: string
  winnersSub: string
  cost: number
  returnMin: number
  returnSub: string
  acts: [ChallengeAct, ChallengeAct, ChallengeAct]
  carry: [string, string, string]
}

const CHALLENGES: Record<BusinessKey, ChallengeBusiness> = {
  cafe: {
    label: "Café",
    name: "Le duo du matin.",
    lead: "Un moment simple qui fait venir, regroupe, puis fait arriver quelque chose entre deux clients.",
    frame: "7 jours",
    frameSub: "le jour et la semaine se choisissent avec vous",
    winners: "1 duo",
    winnersSub: "résolution rare, racontable, rejouable",
    cost: 180,
    returnMin: 1800,
    returnSub: "sur la semaine activée",
    acts: [
      {
        label: "Acte 1 — Attirer",
        title: "Ce matin, un café est offert.",
        detail: "Le lieu annonce une possibilité simple, visible, sans tout révéler.",
      },
      {
        label: "Acte 2 — Regrouper",
        title: "Venez à deux → votre passage compte.",
        detail: "Le duo devient l’unité du challenge. On ne pousse pas le solo, on fait se former un groupe.",
      },
      {
        label: "Acte 3 — Résoudre",
        title: "Un duo reçoit son café offert pendant 7 jours.",
        detail: "La résolution est courte, rare, immédiatement racontable au comptoir.",
      },
    ],
    carry: [
      "Des passages se forment à deux, pas seulement seuls.",
      "Le lieu prouve qu’il peut faire arriver quelque chose en direct.",
      "Ce moment peut se rejouer et ouvrir une saison Cardin.",
    ],
  },
  bar: {
    label: "Bar",
    name: "La table qui gagne.",
    lead: "Le challenge transforme une soirée en scène publique. Les groupes se composent avant même d’arriver.",
    frame: "1 soirée",
    frameSub: "le créneau et le soir se règlent avec vous",
    winners: "1 table",
    winnersSub: "la plus nombreuse, annoncée en salle",
    cost: 180,
    returnMin: 1900,
    returnSub: "sur la soirée activée",
    acts: [
      {
        label: "Acte 1 — Attirer",
        title: "Ce soir, une table sera offerte.",
        detail: "La promesse est simple. Tout le monde comprend qu’il peut se passer quelque chose.",
      },
      {
        label: "Acte 2 — Regrouper",
        title: "Venez à 3 ou plus → vous entrez dans la sélection.",
        detail: "Le challenge pousse les groupes, pas le passage isolé. Le bar devient un point de rendez-vous.",
      },
      {
        label: "Acte 3 — Résoudre",
        title: "La table la plus nombreuse gagne la tournée.",
        detail: "La résolution est visible, théâtrale, et immédiatement racontée dans la salle.",
      },
    ],
    carry: [
      "Les groupes arrivent déjà constitués avant le service.",
      "La résolution donne une scène au lieu, pas juste une remise.",
      "Le bar peut rejouer ce format sur d’autres soirs faibles.",
    ],
  },
  restaurant: {
    label: "Restaurant",
    name: "La table qui compte.",
    lead: "Le challenge crée des réservations groupées et donne une raison concrète d’être plusieurs à la même table.",
    frame: "1 soir",
    frameSub: "le jour et le service se choisissent avec vous",
    winners: "1 table",
    winnersSub: "parmi les tables de 4 ou plus",
    cost: 220,
    returnMin: 2200,
    returnSub: "sur le service activé",
    acts: [
      {
        label: "Acte 1 — Attirer",
        title: "Jeudi soir, une table sera offerte.",
        detail: "Le lieu annonce un enjeu clair, lisible en une phrase.",
      },
      {
        label: "Acte 2 — Regrouper",
        title: "Table de 4 ou plus → vous entrez dans la sélection.",
        detail: "Le challenge pousse la réservation groupée et augmente naturellement le panier.",
      },
      {
        label: "Acte 3 — Résoudre",
        title: "La table la plus nombreuse est offerte.",
        detail: "La résolution est nette, sans ambiguïté, et facile à annoncer au moment juste.",
      },
    ],
    carry: [
      "Le restaurant fait monter la taille des tables sans jargon marketing.",
      "Le challenge crée une vraie raison de réserver ensemble.",
      "Le format peut ouvrir une suite de services Cardin sur la saison.",
    ],
  },
  beaute: {
    label: "Beauté",
    name: "Le rendez-vous qui revient.",
    lead: "Ici, le groupe se forme dans le temps. Le challenge sélectionne celles qui reviennent vraiment.",
    frame: "14 jours",
    frameSub: "le rythme et la fenêtre se choisissent avec vous",
    winners: "2 clientes",
    winnersSub: "parmi celles revenues une deuxième fois",
    cost: 210,
    returnMin: 1800,
    returnSub: "sur le mois qui suit",
    acts: [
      {
        label: "Acte 1 — Attirer",
        title: "Cette semaine, deux rendez-vous seront offerts.",
        detail: "Le lieu ouvre une possibilité claire, sans rabattre la valeur du soin.",
      },
      {
        label: "Acte 2 — Regrouper",
        title: "Revenez une deuxième fois → vous entrez dans la sélection.",
        detail: "Le challenge filtre les clientes sérieuses. Ici, le groupe se crée par retour qualifié, pas par foule.",
      },
      {
        label: "Acte 3 — Résoudre",
        title: "Deux clientes parmi celles revenues reçoivent un soin complet.",
        detail: "La résolution valorise l’effort et transforme le retour en événement concret.",
      },
    ],
    carry: [
      "Le salon ne récompense pas la curiosité seule, mais le vrai retour.",
      "La sélection crée de la valeur sans banaliser le soin.",
      "Ce premier cadre peut devenir un rythme de saison et nourrir Diamond.",
    ],
  },
  boutique: {
    label: "Boutique",
    name: "La cabine du duo.",
    lead: "Le challenge transforme l’essayage en scène sociale. La boutique ne baisse pas le prix, elle fait arriver quelque chose entre deux personnes.",
    frame: "7 à 10 jours",
    frameSub: "la pièce, le look et la fenêtre se choisissent avec vous",
    winners: "1 duo",
    winnersSub: "sélectionné parmi les duos passés en cabine",
    cost: 240,
    returnMin: 2200,
    returnSub: "sur la période activée",
    acts: [
      {
        label: "Acte 1 — Attirer",
        title: "Cette semaine, un duo repartira avec un geste rare de la boutique.",
        detail: "On n’annonce pas une promo. On annonce une possibilité plus désirable, plus intrigante.",
      },
      {
        label: "Acte 2 — Regrouper",
        title: "Venez à deux essayer la même pièce ou composer un look ensemble.",
        detail: "Le duo devient la scène. L’essayage se raconte, se montre et se partage dans le lieu.",
      },
      {
        label: "Acte 3 — Résoudre",
        title: "Un duo reçoit un cadeau choisi par la boutique.",
        detail: "Pas de crédit impersonnel. Un geste choisi, remis par la boutique, qui laisse une vraie mémoire.",
      },
    ],
    carry: [
      "La boutique fait venir des duos, pas seulement des passages d’essayage.",
      "Le geste final garde de la désirabilité et du goût, sans tomber dans la remise.",
      "Le format peut se rejouer par collection, drop ou moment faible.",
    ],
  },
}

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  left: `${6 + ((index * 7) % 88)}%`,
  top: `${8 + ((index * 13) % 82)}%`,
}))

export function ChallengePage() {
  const [businessKey, setBusinessKey] = useState<BusinessKey>("cafe")
  const [whyOpen, setWhyOpen] = useState(false)
  const returnRef = useRef<HTMLSpanElement | null>(null)
  const costRef = useRef<HTMLSpanElement | null>(null)

  const challenge = CHALLENGES[businessKey]
  const ratio = challenge.returnMin / challenge.cost
  const challengeHref = STRIPE_CHALLENGE_LINK || buildChallengeFallbackMailto(challenge.label)
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
            Attirer. <em className="italic text-[#0f3d2e]">Regrouper.</em>
            <br />
            Résoudre.
          </h1>
          <p className="mx-auto mt-5 max-w-[720px] font-serif text-[clamp(17px,2vw,21px)] italic leading-[1.55] text-[#3d4d43]" data-challenge-sub>
            Un Challenge Cardin crée des groupes de clients, puis fait arriver quelque chose entre eux.
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

          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#8a8578]">Challenge Cardin · {challenge.label}</p>

          <h2 className="mt-3 text-center font-serif text-[clamp(30px,4.5vw,44px)] leading-[1.12] tracking-[-0.01em] text-[#1a2a22]">
            {challenge.name}
          </h2>

          <p className="mx-auto mt-5 max-w-[620px] text-center font-serif text-[17px] italic leading-[1.55] text-[#3d4d43]">
            {challenge.lead}
          </p>

          <div className="mb-8 mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-[#b8956a]/40" />
            <span className="font-serif text-lg text-[#b8956a]">◇</span>
            <span className="h-px w-14 bg-[#b8956a]/40" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {challenge.acts.map((act) => (
              <ActCard detail={act.detail} key={act.label} label={act.label} title={act.title} />
            ))}
          </div>

          <div className="mt-8 grid border-y border-[#d4cdbd] md:grid-cols-2">
            <Param label="Cadre" sub={challenge.frameSub} value={challenge.frame} />
            <Param label="Résolution" sub={challenge.winnersSub} value={challenge.winners} warm />
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
              <span>Ce que ce challenge laisse derrière lui</span>
              <span className={`text-[8px] transition ${whyOpen ? "rotate-180" : ""}`}>▾</span>
            </button>

            {whyOpen ? (
              <div className="mt-4 grid gap-3 text-left md:grid-cols-3">
                <WhyCard description={challenge.carry[0]} index="i." title="Des groupes se forment" />
                <WhyCard description={challenge.carry[1]} index="ii." title="Un moment se raconte" />
                <WhyCard description={challenge.carry[2]} index="iii." title="Un rythme peut s’ouvrir" />
              </div>
            ) : null}
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <RuleCard index="i." text="Toujours un groupe, jamais un passage purement individuel." />
            <RuleCard index="ii." text="Toujours peu de gagnants. La rareté fait la scène." />
            <RuleCard index="iii." text="Le jour et la fenêtre se choisissent avec le commerce." />
          </div>

          <div className="mt-9 text-center">
            <div className="mb-4 inline-flex flex-wrap items-center justify-center gap-2.5 text-[12px] uppercase tracking-[0.2em] text-[#8a8578]">
              <span>Challenge Cardin</span>
              <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/50" />
              <span>
                <strong className="font-medium text-[#1a2a22]">{CHALLENGE_PRICING.activationFee} €</strong> TTC
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/50" />
              <span>{CHALLENGE_PRICING.taxLabel}</span>
            </div>

            <a
              className="inline-flex w-full max-w-[28rem] items-center justify-center gap-3 rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-8 py-4 text-[12px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22] sm:px-10"
              href={challengeHref}
              rel={STRIPE_CHALLENGE_LINK ? "noreferrer" : undefined}
              target={STRIPE_CHALLENGE_LINK ? "_blank" : undefined}
            >
              <span>{challengeLinkLabel}</span>
              <span aria-hidden="true">→</span>
            </a>
            <p className="mt-2.5 text-[11px] italic tracking-[0.08em] text-[#8a8578]">
              {STRIPE_CHALLENGE_LINK ? "Paiement sécurisé par Stripe · activation sous 24 h" : "Lien Stripe à brancher · fallback contact prêt"}
            </p>
          </div>
        </article>

        <div className="mx-auto mt-16 max-w-[720px] border-t border-[#d4cdbd] px-4 pt-8 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#8a8578]">Le pont vers la suite</p>
          <h3 className="mt-3 font-serif text-[clamp(24px,3vw,30px)] leading-[1.25] text-[#1a2a22]">
            Le challenge ouvre un rythme. <em className="italic text-[#0f3d2e]">La saison l’installe.</em>
          </h3>
          <p className="mx-auto mt-3 max-w-[560px] font-serif text-[16px] italic leading-[1.5] text-[#3d4d43]">
            Un Challenge Cardin prouve qu’un groupe peut se former et qu’un moment peut se résoudre dans le lieu. La Saison Cardin rejoue cela sur plusieurs semaines, puis mène quelques participants jusqu’au Diamond.
          </p>
          <Link className="mt-5 inline-flex text-[11px] uppercase tracking-[0.2em] text-[#0f3d2e] underline decoration-[#0f3d2e] underline-offset-4 transition hover:opacity-70" href="/parcours/lecture">
            Ouvrir la Saison →
          </Link>
        </div>
      </section>
    </main>
  )
}

function ActCard({ label, title, detail }: ChallengeAct) {
  return (
    <div className="rounded-[3px] border border-[#d4cdbd] bg-[#f6f1e7] px-4 py-5">
      <div className="text-[9px] uppercase tracking-[0.28em] text-[#8a8578]">{label}</div>
      <div className="mt-3 font-serif text-[24px] leading-[1.15] text-[#1a2a22]">{title}</div>
      <div className="mt-2 font-serif text-[13px] italic leading-[1.5] text-[#3d4d43]">{detail}</div>
    </div>
  )
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

function buildChallengeFallbackMailto(businessLabel: string) {
  return buildContactMailto(
    "Cardin · challenge",
    [
      "Bonjour Cardin,",
      "",
      "Je veux lancer un Challenge Cardin.",
      "",
      `Type de lieu : ${businessLabel}`,
      "",
      `Recontactez-moi sur ${CARDIN_CONTACT_EMAIL} ou revenez vers moi avec le lien de paiement challenge.`,
    ].join("\r\n"),
  )
}
