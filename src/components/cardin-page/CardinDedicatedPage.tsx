"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import QRCode from "qrcode"

import { formatEuro } from "@/lib/calculator"
import type { CardinMerchantPage, CardinPageState } from "@/lib/cardin-page-data"
import { LANDING_PRICING } from "@/lib/landing-content"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/ui/button"

const TIMELINE_STEPS = [
  { passage: "Passage 1", label: "Entrée lue" },
  { passage: "Passage 2", label: "Créneau proposé" },
  { passage: "Passage 3", label: "Retour activé" },
  { passage: "Passage 5/7", label: "Duo ou avantage" },
  { passage: "Diamond", label: "Accès rare" },
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
    ? "Cette page garde la lecture du lieu, le cadre de saison et la suite immédiate pour le commerce."
    : "Cette page réunit la lecture du lieu, la première saison Cardin et l'ouverture de réservation pour ce commerce."
  const readingReferenceLine = isActivated
    ? "Cette lecture guide maintenant la mise en place et l'ouverture du lieu."
    : "Cette lecture donne une base claire au lieu, à l'associé et à la réservation."
  const engineReferenceLine = isActivated
    ? "La progression reste lisible pendant que le lieu entre en mise en place."
    : "Le client voit ce qui s'ouvre avec le temps. Le lieu garde le même cap sur ce lien."
  const seasonReferenceLine = isActivated
    ? "Cette page reste la référence du lieu pendant la mise en place."
    : "Le même lien reste relisible pour la décision, le partage et la suite."
  const projectionBasis = [
    {
      label: "Moment moteur",
      value: merchant.weakMomentLabel,
      detail: "Créneau que Cardin remet en mouvement pour ouvrir la saison.",
    },
    {
      label: "Rythme visé",
      value: merchant.returnRhythmLabel,
      detail: "Cadence de retour retenue pour densifier la saison.",
    },
    {
      label: "Clientèle",
      value: merchant.clienteleLabel,
      detail: "Base relationnelle sur laquelle la propagation s'appuie.",
    },
    {
      label: "Sommet",
      value: merchant.seasonRewardLabel,
      detail: "Accès visible qui donne du relief au retour.",
    },
  ] as const
  const activationSteps = [
    {
      label: "Imprimez le QR",
      value: `${merchant.seasonSetup}. Support comptoir prêt sous 48 h.`,
    },
    {
      label: "Annoncez la première ouverture",
      value: `Première promesse visible : ${merchant.seasonRewardLabel}.`,
    },
    {
      label: "Validez les passages",
      value: `L'équipe valide chaque passage réel sur ${merchant.weakMomentLabel}, puis laisse monter le retour ${merchant.returnRhythmLabel}.`,
    },
  ] as const
  const activationStaffLine = "Scannez ici, vous débloquez votre première récompense. Ensuite on valide vos passages au comptoir."

  const whatsappHref = useMemo(() => {
    const message = isActivated
      ? `Votre saison Cardin est réservée pour ${merchant.businessName}.\nVoici votre page d'activation : ${pageUrl}\nMise en place complète sous 48h.\nJe reste votre contact direct ici.`
      : `Voici votre page Cardin pour ${merchant.businessName}.\nElle reprend le cadre de votre première saison et les scénarios que nous avons vus ensemble : ${pageUrl}\nQuand vous êtes prêt, on active à partir de cette base.`

    return `https://wa.me/?text=${encodeURIComponent(message)}`
  }, [isActivated, merchant.businessName, pageUrl])

  return (
    <div className="pb-[calc(9rem+env(safe-area-inset-bottom,0px))]">
      <div className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute left-1/2 top-[-280px] hidden h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[#EEF2EA] blur-3xl sm:block" />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pb-10 lg:pt-12">
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
                  <InfoPill text={isActivated ? "Mise en place 48 h" : "Réservation directe"} />
                </div>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
                  {isActivated
                    ? "Votre saison Cardin est réservée pour ce lieu. La mise en place se prépare maintenant."
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

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.5rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Ce que Cardin voit</p>
              <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">Cardin lit le lieu avant l&apos;ouverture de saison.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#556159] sm:text-base">{merchant.readingLead}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#677168]">{readingReferenceLine}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {merchant.observations.map((item) => (
                  <ObservationCard key={item.label} label={item.label} text={item.text} />
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[#D7DDD2] bg-[linear-gradient(180deg,#FFFEFA_0%,#F1F5EE_100%)] p-5 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Le moteur</p>
              <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">Une saison vivante.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#556159] sm:text-base">{merchant.engineLead}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#677168]">{engineReferenceLine}</p>
              <div className="mt-6 flex items-start gap-2 sm:gap-3">
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

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Scénarios concrets</p>
          <h2 className="mt-2 max-w-3xl font-serif text-2xl text-[#173328] sm:text-3xl">Cardin agit dans le temps. Le lieu le sent tout de suite.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {merchant.scenarios.map((scenario) => (
              <ScenarioCard key={scenario.title} title={scenario.title} text={scenario.text} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[#E3DDD0] bg-[#FFFEFA] p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Première saison</p>
          <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">Une saison nette. Une mise en place sous 48 h.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#556159] sm:text-base">{merchant.seasonLead}</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#677168]">{seasonReferenceLine}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FactTile label="Durée" value={`${LANDING_PRICING.seasonLengthMonths} mois`} />
            <FactTile label="Mise en place" value="Sous 48 h" />
            <FactTile label="Ce qui s'ouvre" value={merchant.seasonSetup} />
            <FactTile label="Contact direct" value={merchant.humanContact} />
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[#C8D4CB] bg-[linear-gradient(180deg,#F6FAF4_0%,#EDF4EE_100%)] p-5 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#587064]">
                {isActivated ? "Cadre de saison réservé" : merchant.projectionLabel}
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">
                {formatEuro(merchant.projectionLow)} à {formatEuro(merchant.projectionHigh)}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#556159] sm:text-base">
                {isActivated
                  ? "Cardin garde ce cap pour la mise en place. La même lecture guide maintenant l'ouverture du lieu."
                  : merchant.projectionLead}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ProjectionTile label="Dominante" value={merchant.returnProfile} />
              <ProjectionTile label="Lecture du lieu" value={merchant.projectionFraming} />
              <ProjectionTile label="Sommet de saison" value={merchant.seasonRewardLabel} />
              <ProjectionTile
                label={isActivated ? "Suite immédiate" : "Réservation"}
                value={
                  isActivated
                    ? "Mise en place complète sous 48 h. Cette page reste la référence du lieu."
                    : "Le même lien reste partageable avant et après réservation."
                }
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.2rem] border border-[#D7DDD2] bg-[rgba(255,255,250,0.74)] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#587064]">Pourquoi cette projection</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#556159]">
                La fourchette s'appuie sur le point faible lu, le rythme de retour retenu, la clientèle dominante et le sommet de saison affiché plus haut.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {projectionBasis.map((item) => (
                  <ProjectionBasisTile key={item.label} detail={item.detail} label={item.label} value={item.value} />
                ))}
              </div>
            </div>

            {isActivated ? (
              <div className="rounded-[1.2rem] border border-[#C8D4CB] bg-[rgba(255,255,250,0.82)] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#173A2E]">Activation Card</p>
                <p className="mt-2 text-sm leading-6 text-[#556159]">
                  Votre système est prêt en 3 étapes. L'objectif est simple : rendre l'entrée évidente pour le client et le geste évident pour l'équipe.
                </p>
                <div className="mt-4 space-y-3">
                  {activationSteps.map((item, index) => (
                    <ChecklistItem index={index + 1} key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>
                <div className="mt-4 rounded-[1rem] border border-[#D7DDD2] bg-[#FFFEFA] p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Phrase staff</p>
                  <p className="mt-2 text-sm leading-6 text-[#203B31]">{activationStaffLine}</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#556159]">{merchant.contactEmail} reste le contact direct Cardin pour le lieu.</p>
                </div>
                <ActivationQrCard merchantId={merchant.merchantId} />
              </div>
            ) : (
              <div className="rounded-[1.2rem] border border-[#D7DDD2] bg-[rgba(255,255,250,0.82)] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#587064]">Base économique</p>
                <p className="mt-2 text-sm leading-6 text-[#556159]">
                  {LANDING_PRICING.compactLabel}. La même lecture sert la décision maintenant, puis la mise en place une fois la saison réservée.
                </p>
                <div className="mt-4 grid gap-3">
                  <ProjectionBasisTile
                    detail="Même base de lecture, même lien, même projection pour convaincre puis lancer."
                    label="Continuité"
                    value="Avant et après réservation"
                  />
                </div>
              </div>
            )}
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
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#173A2E]">Saison réservée</span>
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
    <div className="rounded-[1.1rem] border border-[#E2DDD1] bg-[#FBF9F3] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#203B31]">{text}</p>
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
    <div className="rounded-[1.2rem] border border-[#D7DDD2] bg-[#FFFEFA] p-4 shadow-[0_16px_36px_-32px_rgba(23,58,46,0.28)]">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#587064]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#203B31]">{text}</p>
    </div>
  )
}

function FactTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[#E2DDD1] bg-[#FBF9F3] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#203B31]">{value}</p>
    </div>
  )
}

function ProjectionTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[#D7DDD2] bg-[#FFFEFA] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#203B31]">{value}</p>
    </div>
  )
}

function ProjectionBasisTile({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-[1rem] border border-[#D7DDD2] bg-[#FFFEFA] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#203B31]">{value}</p>
      <p className="mt-1 text-[13px] leading-5 text-[#556159]">{detail}</p>
    </div>
  )
}

function ChecklistItem({
  index,
  label,
  value,
}: {
  index: number
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3 rounded-[1rem] border border-[#D7DDD2] bg-[#FFFEFA] p-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#173A2E] text-[11px] font-medium text-[#FBFAF6]">
        {index}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[#203B31]">{value}</p>
      </div>
    </div>
  )
}

function ActivationQrCard({ merchantId }: { merchantId?: string }) {
  const [scanUrl, setScanUrl] = useState(merchantId ? `/scan/${merchantId}` : "")
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!merchantId || typeof window === "undefined") return

    const nextScanUrl = `${window.location.origin}/scan/${merchantId}`
    setScanUrl(nextScanUrl)

    void QRCode.toDataURL(nextScanUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: "#173A2E",
        light: "#FFFEFA",
      },
    }).then(setQrCodeUrl).catch(() => setQrCodeUrl(null))
  }, [merchantId])

  if (!merchantId) {
    return (
      <div className="mt-4 rounded-[1rem] border border-[#D7DDD2] bg-[#FFFEFA] p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">QR d'activation</p>
        <p className="mt-2 text-sm leading-6 text-[#556159]">
          Le QR imprimable se branche dès que cette page est reliée à un espace marchand Cardin actif.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-[1rem] border border-[#D7DDD2] bg-[#FFFEFA] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">QR à afficher</p>
      <p className="mt-2 text-sm leading-6 text-[#556159]">
        Le client scanne ici. Sa carte s'ouvre, puis l'équipe valide le passage au comptoir.
      </p>
      {qrCodeUrl ? (
        <img alt="QR Cardin à afficher" className="mt-4 w-full max-w-[220px] rounded-xl border border-[#D7DDD2] bg-white p-2" src={qrCodeUrl} />
      ) : (
        <div className="mt-4 flex h-[220px] w-full max-w-[220px] items-center justify-center rounded-xl border border-[#D7DDD2] bg-[#FBF9F3] text-sm text-[#556159]">
          Génération du QR...
        </div>
      )}
      <p className="mt-3 break-all text-[13px] leading-5 text-[#556159]">{scanUrl}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a
          className={cn(buttonVariants({ variant: "subtle", size: "md" }), "justify-center")}
          href={scanUrl}
          rel="noreferrer"
          target="_blank"
        >
          Ouvrir le parcours client
        </a>
        {qrCodeUrl ? (
          <a
            className={cn(buttonVariants({ variant: "subtle", size: "md" }), "justify-center")}
            download={`qr-${merchantId}.png`}
            href={qrCodeUrl}
          >
            Télécharger le QR PNG
          </a>
        ) : null}
      </div>
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
  const projectionRange = `${formatEuro(merchant.projectionLow)} à ${formatEuro(merchant.projectionHigh)}`
  const roiLow = roundRoiMultiple(merchant.projectionLow / LANDING_PRICING.activationFee)
  const roiHigh = roundRoiMultiple(merchant.projectionHigh / LANDING_PRICING.activationFee)
  const roiRange = `${roiLow}x à ${roiHigh}x l'activation`

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
    setCheckoutError("Le paiement s'ouvre depuis cette page dès que la liaison Cardin est prête.")
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] sm:px-6 lg:px-8">
      <div className="pointer-events-auto mx-auto max-w-5xl rounded-[1.25rem] border border-[#D7DDD2] bg-[rgba(255,254,250,0.96)] px-4 py-3 shadow-[0_20px_50px_-26px_rgba(23,58,46,0.28)] backdrop-blur sm:px-5 sm:py-4">
        {isActivated ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="relative h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-[#173A2E]" />
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#173A2E] opacity-35" />
                </span>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#173A2E]">Saison réservée</p>
              </div>
              <p className="mt-1.5 text-[15px] font-medium leading-tight text-[#173328] sm:text-base">Votre moteur est lancé.</p>
              <p className="mt-1 text-[13px] leading-5 text-[#556159]">
                Mise en place sous 48 h · {merchant.contactEmail}
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[#556159]">Cap de saison confirmé : {projectionRange}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#6D776F]">Réserver</p>
              <p className="mt-1.5 text-[15px] font-medium leading-tight text-[#173328] sm:text-base">Réserver ma saison Cardin.</p>
              <p className="mt-1 text-[13px] leading-5 text-[#556159]">
                {LANDING_PRICING.compactLabel} · mise en place sous 48 h
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[#556159]">
                Projection : {projectionRange} · {roiRange}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "justify-center")}
                disabled={checkoutLoading}
                onClick={handleCheckout}
                type="button"
              >
                {checkoutLoading ? "Ouverture du paiement..." : "Réserver ma saison Cardin"}
              </button>
              <a
                className={cn(buttonVariants({ variant: "subtle", size: "md" }), "justify-center")}
                href={whatsappHref}
                rel="noreferrer"
                target="_blank"
              >
                Envoyer à un associé
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

function roundRoiMultiple(value: number) {
  return Math.max(0.5, Math.round(value * 10) / 10).toFixed(1)
}
