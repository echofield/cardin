"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { formatEuro } from "@/lib/calculator"
import type { CardinMerchantPage, CardinPageState } from "@/lib/cardin-page-data"
import { LANDING_PRICING } from "@/lib/landing-content"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/ui/button"

const TIMELINE_STEPS = [
  { passage: "Passage 1", label: "Entr\u00e9e lue" },
  { passage: "Passage 2", label: "Cr\u00e9neau propos\u00e9" },
  { passage: "Passage 3", label: "Retour activ\u00e9" },
  { passage: "Passage 5/7", label: "Duo ou avantage" },
  { passage: "Diamond", label: "Acc\u00e8s rare" },
] as const

export function CardinDedicatedPage({
  merchant,
  displayState,
}: {
  merchant: CardinMerchantPage
  displayState: CardinPageState
}) {
  const [pageUrl, setPageUrl] = useState(`/cardin/${merchant.slug}${displayState === "activation" ? "?state=activation" : ""}`)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href)
    }
  }, [])

  const isActivated = displayState === "activation"
  const heroReferenceLine = isActivated
    ? "Cette page garde la lecture du lieu, le cadre de saison et la suite imm\u00e9diate pour le commerce."
    : "Cette page r\u00e9unit la lecture du lieu, la premi\u00e8re saison Cardin et l'ouverture de r\u00e9servation pour ce commerce."
  const readingReferenceLine = isActivated
    ? "Cette lecture guide maintenant la mise en place et l'ouverture du lieu."
    : "Cette lecture donne une base claire au lieu, \u00e0 l'associ\u00e9 et \u00e0 la r\u00e9servation."
  const engineReferenceLine = isActivated
    ? "La progression reste lisible pendant que le lieu entre en mise en place."
    : "Le client voit ce qui s'ouvre avec le temps. Le lieu garde le m\u00eame cap sur ce lien."
  const seasonReferenceLine = isActivated
    ? "Cette page reste la r\u00e9f\u00e9rence du lieu pendant la mise en place."
    : "Le m\u00eame lien reste relisible pour la d\u00e9cision, le partage et la suite."

  const whatsappHref = useMemo(() => {
    const message = isActivated
      ? `Votre saison Cardin est r\u00e9serv\u00e9e pour ${merchant.businessName}.\nVoici votre page d'activation : ${pageUrl}\nMise en place compl\u00e8te sous 48h.\nJe reste votre contact direct ici.`
      : `Voici votre page Cardin pour ${merchant.businessName}.\nElle reprend le cadre de votre premi\u00e8re saison et les sc\u00e9narios que nous avons vus ensemble : ${pageUrl}\nQuand vous \u00eates pr\u00eat, on active \u00e0 partir de cette base.`

    return `https://wa.me/?text=${encodeURIComponent(message)}`
  }, [isActivated, merchant.businessName, pageUrl])

  return (
    <div className="pb-[calc(11rem+env(safe-area-inset-bottom,0px))]">
      <div className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute left-1/2 top-[-280px] hidden h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[#EEF2EA] blur-3xl sm:block" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-14 lg:pt-16">
          <header className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Cardin pour</p>
              {isActivated ? <StatusPill /> : null}
            </div>

            <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-serif text-[clamp(3rem,9vw,5.4rem)] leading-[1.02] text-[#163328]">
                  {merchant.businessName}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <InfoPill text="Lecture du lieu" />
                  <InfoPill text={`Saison ${LANDING_PRICING.seasonLengthMonths} mois`} />
                  <InfoPill text={isActivated ? "Mise en place 48 h" : "R\u00e9servation directe"} />
                </div>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
                  {isActivated
                    ? "Votre saison Cardin est r\u00e9serv\u00e9e pour ce lieu. La mise en place se pr\u00e9pare maintenant."
                    : merchant.subtitle}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#677168] sm:text-[0.95rem]">
                  {heroReferenceLine}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <InfoPill text={merchant.temporalAnchor} />
                  <InfoPill text={merchant.clienteleLabel} />
                  <InfoPill text={merchant.returnProfile} />
                </div>
              </div>

              <a
                className={cn(buttonVariants({ variant: "subtle", size: "md" }), "w-full justify-center sm:w-auto")}
                href={whatsappHref}
                rel="noreferrer"
                target="_blank"
              >
                Partager sur WhatsApp
              </a>
            </div>
          </header>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.8rem] border border-[#D7DDD2] bg-[#FFFEFA] p-6 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Ce que Cardin voit</p>
              <h2 className="mt-3 font-serif text-3xl text-[#173328] sm:text-4xl">Cardin lit le lieu avant l&apos;ouverture de saison.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#556159] sm:text-base">{merchant.readingLead}</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#677168]">{readingReferenceLine}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {merchant.observations.map((item) => (
                  <ObservationCard key={item.label} label={item.label} text={item.text} />
                ))}
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-[#D7DDD2] bg-[linear-gradient(180deg,#FFFEFA_0%,#F1F5EE_100%)] p-6 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Le moteur</p>
              <h2 className="mt-3 font-serif text-3xl text-[#173328] sm:text-4xl">Une saison vivante.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#556159] sm:text-base">{merchant.engineLead}</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#677168]">{engineReferenceLine}</p>
              <div className="mt-8 flex items-start gap-2 sm:gap-3">
                {TIMELINE_STEPS.map((step, index) => (
                  <div className="flex min-w-0 flex-1 items-start" key={step.passage}>
                    <TimelineNode
                      isActivated={isActivated}
                      isDiamond={step.passage === "Diamond"}
                      label={step.label}
                      passage={step.passage}
                    />
                    {index < TIMELINE_STEPS.length - 1 ? (
                      <div className="mt-5 hidden h-px flex-1 bg-[#D6DCD3] sm:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Sc\u00e9narios concrets</p>
          <h2 className="mt-3 max-w-3xl font-serif text-3xl text-[#173328] sm:text-4xl">Cardin agit dans le temps. Le lieu le sent tout de suite.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {merchant.scenarios.map((scenario) => (
              <ScenarioCard key={scenario.title} title={scenario.title} text={scenario.text} />
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[1.8rem] border border-[#E3DDD0] bg-[#FFFEFA] p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Premi\u00e8re saison</p>
          <h2 className="mt-3 font-serif text-3xl text-[#173328] sm:text-4xl">Une saison nette. Une mise en place sous 48 h.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#556159] sm:text-base">{merchant.seasonLead}</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#677168]">{seasonReferenceLine}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FactTile label="Dur\u00e9e" value={`${LANDING_PRICING.seasonLengthMonths} mois`} />
            <FactTile label="Mise en place" value="Sous 48 h" />
            <FactTile label="Ce qui s'ouvre" value={merchant.seasonSetup} />
            <FactTile label="Contact direct" value={merchant.humanContact} />
          </div>
        </section>

        <section className="mt-10 rounded-[1.8rem] border border-[#C8D4CB] bg-[linear-gradient(180deg,#F6FAF4_0%,#EDF4EE_100%)] p-6 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#587064]">
                {isActivated ? "Cadre de saison r\u00e9serv\u00e9" : merchant.projectionLabel}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-[#173328] sm:text-4xl">
                {formatEuro(merchant.projectionLow)} \u00e0 {formatEuro(merchant.projectionHigh)}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#556159] sm:text-base">
                {isActivated
                  ? "Cardin garde ce cap pour la mise en place. La m\u00eame lecture guide maintenant l'ouverture du lieu."
                  : merchant.projectionLead}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ProjectionTile label="Dominante" value={merchant.returnProfile} />
              <ProjectionTile label="Lecture du lieu" value={merchant.projectionFraming} />
              <ProjectionTile label="Sommet de saison" value={merchant.seasonRewardLabel} />
              <ProjectionTile
                label={isActivated ? "Suite imm\u00e9diate" : "R\u00e9servation"}
                value={
                  isActivated
                    ? "Mise en place compl\u00e8te sous 48 h. Cette page reste la r\u00e9f\u00e9rence du lieu."
                    : "Le m\u00eame lien reste partageable avant et apr\u00e8s r\u00e9servation."
                }
              />
            </div>
          </div>
        </section>
      </div>

      <StickyCta displayState={displayState} merchant={merchant} whatsappHref={whatsappHref} />
    </div>
  )
}

function StatusPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#C8D4CB] bg-[#F6FAF4] px-3 py-1">
      <span className="relative h-2.5 w-2.5">
        <span className="absolute inset-0 rounded-full bg-[#173A2E]" />
        <span className="absolute inset-0 animate-ping rounded-full bg-[#173A2E] opacity-35" />
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#173A2E]">Saison r\u00e9serv\u00e9e</span>
    </div>
  )
}

function InfoPill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-3 py-1 text-xs text-[#173A2E]">
      {text}
    </span>
  )
}

function ObservationCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[#203B31]">{text}</p>
    </div>
  )
}

function TimelineNode({
  passage,
  label,
  isDiamond,
  isActivated,
}: {
  passage: string
  label: string
  isDiamond: boolean
  isActivated: boolean
}) {
  return (
    <div className="min-w-0 text-center">
      <div
        className={cn(
          "mx-auto flex h-11 w-11 items-center justify-center rounded-full border text-base sm:h-12 sm:w-12",
          isDiamond
            ? "border-[#C9A86A] bg-[#F7F0E0] text-[#8A6A35]"
            : isActivated
              ? "border-[#173A2E] bg-[#173A2E] text-[#FBFAF6]"
              : "border-[#D6DCD3] bg-[#FFFEFA] text-[#173A2E]",
        )}
      >
        {isDiamond ? "\u25c6" : isActivated ? "\u25c8" : "\u25c7"}
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#677168]">{passage}</p>
      <p className="mt-1 text-xs leading-5 text-[#203B31]">{label}</p>
    </div>
  )
}

function ScenarioCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.6rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5 shadow-[0_20px_40px_-38px_rgba(23,58,46,0.3)]">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#587064]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#203B31]">{text}</p>
    </div>
  )
}

function FactTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[#203B31]">{value}</p>
    </div>
  )
}

function ProjectionTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[#203B31]">{value}</p>
    </div>
  )
}

function StickyCta({
  merchant,
  displayState,
  whatsappHref,
}: {
  merchant: CardinMerchantPage
  displayState: CardinPageState
  whatsappHref: string
}) {
  const isActivated = displayState === "activation"
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (checkoutLoading) return

    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const response = await fetch("/api/cardin/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: merchant.slug,
          businessName: merchant.businessName,
          worldId: merchant.worldId,
          weakMomentId: merchant.weakMomentId,
          returnRhythmId: merchant.returnRhythmId,
          clienteleId: merchant.clienteleId,
          note: merchant.note,
          contactEmail: merchant.contactEmail,
        }),
      })

      if (response.ok) {
        const data = (await response.json()) as { ok: boolean; url?: string }
        if (data.url && typeof window !== "undefined") {
          window.location.assign(data.url)
          return
        }
      }
    } catch {
      /* handled below */
    }

    setCheckoutLoading(false)
        setCheckoutError("Le paiement s'ouvre depuis cette page d\u00e8s que la liaison Cardin est pr\u00eate.")
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:px-6 lg:px-8">
      <div className="pointer-events-auto mx-auto max-w-5xl rounded-[1.8rem] border border-[#D7DDD2] bg-[rgba(255,254,250,0.96)] p-4 shadow-[0_24px_60px_-30px_rgba(23,58,46,0.28)] backdrop-blur sm:p-5">
        {isActivated ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="relative h-2.5 w-2.5">
                  <span className="absolute inset-0 rounded-full bg-[#173A2E]" />
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#173A2E] opacity-35" />
                </span>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#173A2E]">Saison r\u00e9serv\u00e9e</p>
              </div>
              <p className="mt-2 text-base font-medium text-[#173328] sm:text-lg">Votre moteur est lanc\u00e9.</p>
              <p className="mt-1 text-sm leading-6 text-[#556159]">
                Mise en place compl\u00e8te sous 48 h. Cette page reste la r\u00e9f\u00e9rence du lieu. Contact direct : {merchant.contactEmail}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className={cn(buttonVariants({ variant: "primary", size: "md" }), "justify-center")} href="/dashboard-demo">
                Voir mon journal de saison
              </Link>
              <a
                className={cn(buttonVariants({ variant: "subtle", size: "md" }), "justify-center")}
                href={whatsappHref}
                rel="noreferrer"
                target="_blank"
              >
                Partager la page
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#6D776F]">R\u00e9server</p>
              <p className="mt-2 text-base font-medium text-[#173328] sm:text-lg">R\u00e9server ma saison Cardin.</p>
              <p className="mt-1 text-sm leading-6 text-[#556159]">
                {LANDING_PRICING.compactLabel} · mise en place sous 48 h · ce m\u00eame lien reste la r\u00e9f\u00e9rence du lieu, pour vous et pour l'associ\u00e9.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "justify-center")}
                disabled={checkoutLoading}
                onClick={handleCheckout}
                type="button"
              >
                {checkoutLoading ? "Ouverture du paiement..." : "R\u00e9server ma saison Cardin"}
              </button>
              <a
                className={cn(buttonVariants({ variant: "subtle", size: "md" }), "justify-center")}
                href={whatsappHref}
                rel="noreferrer"
                target="_blank"
              >
                Envoyer \u00e0 un associ\u00e9
              </a>
            </div>
          </div>
        )}
        {!isActivated && checkoutError ? (
          <p className="mt-3 text-sm leading-6 text-[#556159]">{checkoutError}</p>
        ) : null}
      </div>
    </div>
  )
}
