"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { buttonVariants } from "@/ui"
import { calculateRecovery, formatEuro } from "@/lib/calculator"
import { cn } from "@/lib/utils"

type BusinessKey = "cafe" | "bar" | "restaurant" | "beaute" | "boutique"
type PainKey = "disappear" | "offPeak" | "frequency" | "referral" | "staff" | "structure"
type VolumeKey = "low" | "medium" | "high"
type BasketKey = "low" | "medium" | "high"
type RhythmKey = "fast" | "weekly" | "monthly"

type BusinessOption = {
  key: BusinessKey
  label: string
  avgTicket: number
  lossRate: number
  recoveryRate: number
  firstMove: string
}

type PainOption = {
  key: PainKey
  label: string
  leak: string
  lever: string
  lossShift: number
  recoveryShift: number
}

type VolumeOption = {
  key: VolumeKey
  label: string
  clientsPerDay: number
}

type BasketOption = {
  key: BasketKey
  label: string
  multiplier: number
}

type RhythmOption = {
  key: RhythmKey
  label: string
  cadence: string
  lossShift: number
  recoveryShift: number
}

const DAYS_OPEN = 26

const BUSINESSES: BusinessOption[] = [
  {
    key: "cafe",
    label: "Café",
    avgTicket: 9,
    lossRate: 0.28,
    recoveryRate: 0.22,
    firstMove: "un cycle court au comptoir, lisible dès la première visite",
  },
  {
    key: "bar",
    label: "Bar",
    avgTicket: 12,
    lossRate: 0.3,
    recoveryRate: 0.2,
    firstMove: "un retour duo sur les services plus lents, annoncé directement au bar",
  },
  {
    key: "restaurant",
    label: "Restaurant",
    avgTicket: 17,
    lossRate: 0.32,
    recoveryRate: 0.16,
    firstMove: "un retour hors pic déclenché à la fin du repas, avant le prochain service",
  },
  {
    key: "beaute",
    label: "Beauté",
    avgTicket: 39,
    lossRate: 0.36,
    recoveryRate: 0.15,
    firstMove: "un rappel de cycle réservé, posé avant de quitter le lieu",
  },
  {
    key: "boutique",
    label: "Boutique",
    avgTicket: 39,
    lossRate: 0.32,
    recoveryRate: 0.17,
    firstMove: "une avant-première discrète ou un accès réservé au passage en caisse",
  },
]

const PAINS: PainOption[] = [
  {
    key: "disappear",
    label: "Les clients viennent une fois puis disparaissent",
    leak: "Le passage existe, mais il n'a pas encore de raison claire de revenir.",
    lever: "Une récompense progressive visible dès la première visite, pas une remise immédiate.",
    lossShift: 0.04,
    recoveryShift: 0.03,
  },
  {
    key: "offPeak",
    label: "Les heures creuses restent creuses",
    leak: "Le lieu a du volume, mais vos temps faibles n'ont pas encore de déclencheur utile.",
    lever: "Un déclencheur réservé aux heures creuses, simple à annoncer par l'équipe.",
    lossShift: 0.02,
    recoveryShift: 0.04,
  },
  {
    key: "frequency",
    label: "La fréquence est trop basse",
    leak: "Le panier tient, mais le rythme naturel du retour reste trop lent.",
    lever: "Un cycle de retour calibré sur le rythme du lieu, sans brûler la marge.",
    lossShift: 0.03,
    recoveryShift: 0.02,
  },
  {
    key: "referral",
    label: "Les habitués reviennent, mais n'amènent personne",
    leak: "Le retour existe, mais il ne se propage pas encore dans le cercle proche du client.",
    lever: "Une mécanique duo qui transforme un retour en invitation.",
    lossShift: 0.01,
    recoveryShift: 0.05,
  },
  {
    key: "staff",
    label: "L'équipe n'a rien de simple à proposer",
    leak: "Le point de vente manque d'un geste comptoir clair pour provoquer le prochain passage.",
    lever: "Une phrase staff courte et un rituel de validation sans friction.",
    lossShift: 0.02,
    recoveryShift: 0.03,
  },
  {
    key: "structure",
    label: "Il y a du passage, mais pas de retour structuré",
    leak: "Le flux existe déjà, mais rien ne lui donne encore une forme Cardin.",
    lever: "Une promesse visible dès la première visite pour cadrer le retour.",
    lossShift: 0.03,
    recoveryShift: 0.04,
  },
]

const VOLUMES: VolumeOption[] = [
  { key: "low", label: "Faible", clientsPerDay: 45 },
  { key: "medium", label: "Moyen", clientsPerDay: 95 },
  { key: "high", label: "Fort", clientsPerDay: 170 },
]

const BASKETS: BasketOption[] = [
  { key: "low", label: "Bas", multiplier: 0.88 },
  { key: "medium", label: "Moyen", multiplier: 1 },
  { key: "high", label: "Élevé", multiplier: 1.18 },
]

const RHYTHMS: RhythmOption[] = [
  {
    key: "fast",
    label: "Retour rapide",
    cadence: "sur un cycle court et immédiatement lisible",
    lossShift: -0.02,
    recoveryShift: 0.03,
  },
  {
    key: "weekly",
    label: "Hebdo",
    cadence: "sur une boucle hebdomadaire simple à relancer",
    lossShift: 0,
    recoveryShift: 0.01,
  },
  {
    key: "monthly",
    label: "Mensuel",
    cadence: "sur une relance plus espacée qui garde de la valeur",
    lossShift: 0.03,
    recoveryShift: -0.01,
  },
]

function clampRate(value: number) {
  return Math.max(0.05, Math.min(0.48, value))
}

function getBusiness(key: BusinessKey) {
  return BUSINESSES.find((option) => option.key === key) ?? BUSINESSES[0]
}

function getPain(key: PainKey) {
  return PAINS.find((option) => option.key === key) ?? PAINS[0]
}

function getVolume(key: VolumeKey) {
  return VOLUMES.find((option) => option.key === key) ?? VOLUMES[1]
}

function getBasket(key: BasketKey) {
  return BASKETS.find((option) => option.key === key) ?? BASKETS[1]
}

function getRhythm(key: RhythmKey) {
  return RHYTHMS.find((option) => option.key === key) ?? RHYTHMS[1]
}

function buildFirstMove(business: BusinessOption, pain: PainOption, rhythm: RhythmOption) {
  if (pain.key === "offPeak") {
    return `Cardin lancerait d'abord ${business.firstMove}, concentré sur vos heures faibles ${rhythm.cadence}.`
  }

  if (pain.key === "referral") {
    return `Cardin lancerait d'abord ${business.firstMove}, avec une ouverture à deux pour transformer un retour en propagation.`
  }

  if (pain.key === "staff") {
    return `Cardin lancerait d'abord ${business.firstMove}, porté par une phrase équipe répétable en moins de dix secondes.`
  }

  return `Cardin lancerait d'abord ${business.firstMove}, ${rhythm.cadence}.`
}

function formatRange(low: number, high: number) {
  return `${formatEuro(low)} à ${formatEuro(high)}`
}

export function DiagnosticPage() {
  const [businessKey, setBusinessKey] = useState<BusinessKey>("cafe")
  const [painKey, setPainKey] = useState<PainKey>("disappear")
  const [volumeKey, setVolumeKey] = useState<VolumeKey>("medium")
  const [basketKey, setBasketKey] = useState<BasketKey>("medium")
  const [rhythmKey, setRhythmKey] = useState<RhythmKey>("weekly")

  const business = getBusiness(businessKey)
  const pain = getPain(painKey)
  const volume = getVolume(volumeKey)
  const basket = getBasket(basketKey)
  const rhythm = getRhythm(rhythmKey)

  const result = useMemo(() => {
    const avgTicket = Math.round(business.avgTicket * basket.multiplier)
    const lossRate = clampRate(business.lossRate + pain.lossShift + rhythm.lossShift)
    const recoveryRate = clampRate(business.recoveryRate + pain.recoveryShift + rhythm.recoveryShift)
    const projection = calculateRecovery({
      clientsPerDay: volume.clientsPerDay,
      avgTicket,
      returnLossRate: lossRate,
      recoveryRate,
      daysOpen: DAYS_OPEN,
    })

    const revenueLow = Math.round(projection.extraRevenue * 0.88)
    const revenueHigh = Math.round(projection.extraRevenue * 1.12)
    const returnsLow = Math.round(projection.recoveredClients * 0.88)
    const returnsHigh = Math.round(projection.recoveredClients * 1.12)

    return {
      avgTicket,
      revenueLow,
      revenueHigh,
      returnsLow,
      returnsHigh,
      firstMove: buildFirstMove(business, pain, rhythm),
    }
  }, [basket.multiplier, business, pain, rhythm, volume.clientsPerDay])

  return (
    <main className="min-h-dvh bg-[#f4f0e8] text-[#173328]">
      <section className="border-b border-[#ddd6ca] bg-[radial-gradient(circle_at_top,rgba(184,149,106,0.09),transparent_44%)] px-5 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#7b7a72]">Diagnostic Cardin</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] text-[#173328] sm:text-5xl lg:text-6xl">
                Où votre retour client se casse-t-il le plus ?
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#57635a] sm:text-lg">
                Cardin lit le point de fuite, recommande un levier, puis cadre une saison de retour claire. En quelques choix,
                pas en mode agence.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#d9d2c5] bg-[rgba(255,253,248,0.92)] p-5 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.24)] sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7b7a72]">Lecture en sortie</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <SummaryPill>{business.label}</SummaryPill>
                <SummaryPill>{volume.label} volume</SummaryPill>
                <SummaryPill>Panier {result.avgTicket}€</SummaryPill>
                <SummaryPill>{rhythm.label}</SummaryPill>
              </div>
              <p className="mt-5 font-serif text-2xl leading-tight text-[#173328] sm:text-[2rem]">
                Une direction nette avant même la simulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
          <div className="rounded-[1.8rem] border border-[#ddd6ca] bg-[#fffdf8] p-5 shadow-[0_16px_48px_-42px_rgba(23,58,46,0.2)] sm:p-6">
            <div className="space-y-6">
              <QuestionBlock label="Type de lieu" title="Quel est votre cadre ?" description="Un choix net suffit pour cadrer la lecture.">
                <ChoiceGrid>
                  {BUSINESSES.map((option) => (
                    <ChoiceButton
                      active={option.key === businessKey}
                      key={option.key}
                      onClick={() => setBusinessKey(option.key)}
                    >
                      {option.label}
                    </ChoiceButton>
                  ))}
                </ChoiceGrid>
              </QuestionBlock>

              <QuestionBlock
                label="Point de fuite"
                title="Où le retour fuit-il le plus ?"
                description="On ne cherche pas tout. On cherche l'endroit qui casse la boucle."
              >
                <div className="grid gap-3">
                  {PAINS.map((option) => (
                    <ChoiceRow
                      active={option.key === painKey}
                      description={option.leak}
                      key={option.key}
                      onClick={() => setPainKey(option.key)}
                      title={option.label}
                    />
                  ))}
                </div>
              </QuestionBlock>

              <div className="grid gap-6 md:grid-cols-3">
                <QuestionBlock label="Volume" title="Passages" description="Ordre de grandeur.">
                  <ChoiceGrid>
                    {VOLUMES.map((option) => (
                      <ChoiceButton active={option.key === volumeKey} key={option.key} onClick={() => setVolumeKey(option.key)}>
                        {option.label}
                      </ChoiceButton>
                    ))}
                  </ChoiceGrid>
                </QuestionBlock>

                <QuestionBlock label="Panier" title="Ticket moyen" description="Bas, moyen ou élevé.">
                  <ChoiceGrid>
                    {BASKETS.map((option) => (
                      <ChoiceButton active={option.key === basketKey} key={option.key} onClick={() => setBasketKey(option.key)}>
                        {option.label}
                      </ChoiceButton>
                    ))}
                  </ChoiceGrid>
                </QuestionBlock>

                <QuestionBlock label="Rythme" title="Retour naturel" description="Cadence dominante du lieu.">
                  <ChoiceGrid>
                    {RHYTHMS.map((option) => (
                      <ChoiceButton active={option.key === rhythmKey} key={option.key} onClick={() => setRhythmKey(option.key)}>
                        {option.label}
                      </ChoiceButton>
                    ))}
                  </ChoiceGrid>
                </QuestionBlock>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-[#cfd9cf] bg-[linear-gradient(180deg,#f5faf4_0%,#eef5ef_100%)] p-5 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.24)] sm:p-6 lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#5d7267]">Lecture Cardin</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-[#173328] sm:text-4xl">
              Votre diagnostic de départ.
            </h2>

            <div className="mt-6 space-y-4">
              <ResultCard
                label="Votre point de fuite principal"
                text={pain.leak}
              />
              <ResultCard
                label="Le bon levier"
                text={pain.lever}
              />
              <ResultCard
                label="Ce que Cardin lancerait d'abord"
                text={result.firstMove}
              />
              <ResultCard
                label="Projection de départ"
                text={`${formatRange(result.revenueLow, result.revenueHigh)} récupérés sur 30 jours, soit environ ${result.returnsLow} à ${result.returnsHigh} retours utiles.`}
              />
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[#d7ddd2] bg-[rgba(255,255,255,0.72)] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#5d7267]">Étape suivante</p>
              <p className="mt-2 text-sm leading-6 text-[#4d5c54]">
                Le diagnostic nomme la fuite. La simulation Cardin transforme cette lecture en saison, en projection, puis en mise en place.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link className={cn(buttonVariants({ variant: "primary", size: "md" }), "justify-center")} href="/parcours">
                  Continuer vers ma simulation Cardin
                </Link>
                <Link className={cn(buttonVariants({ variant: "secondary", size: "md" }), "justify-center")} href="/">
                  Revenir à l'accueil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ChoiceGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}

function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      className={[
        "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.1em] transition",
        active
          ? "border-[#173A2E] bg-[#173A2E] text-[#fffdf8]"
          : "border-[#d7ddd2] bg-[#fbfaf5] text-[#506057] hover:border-[#173A2E] hover:text-[#173A2E]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function ChoiceRow({
  active,
  description,
  onClick,
  title,
}: {
  active: boolean
  description: string
  onClick: () => void
  title: string
}) {
  return (
    <button
      className={[
        "rounded-[1.15rem] border p-4 text-left transition",
        active
          ? "border-[#173A2E] bg-[#f3f8f3] shadow-[0_12px_32px_-28px_rgba(23,58,46,0.32)]"
          : "border-[#e3ddd0] bg-[#fbfaf5] hover:border-[#c6d2c6]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <p className="text-sm font-medium text-[#173328]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#5d6a62]">{description}</p>
    </button>
  )
}

function QuestionBlock({
  children,
  description,
  label,
  title,
}: {
  children: React.ReactNode
  description: string
  label: string
  title: string
}) {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#6d776f]">{label}</p>
      <h3 className="mt-2 font-serif text-2xl leading-tight text-[#173328]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5d6a62]">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function ResultCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#d7ddd2] bg-[#fffdf8] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#5d7267]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#213b31]">{text}</p>
    </div>
  )
}

function SummaryPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#ddd6ca] bg-[#fbf7ef] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#5d6a62]">
      {children}
    </span>
  )
}
