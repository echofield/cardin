import Link from "next/link"

import type { CardinMerchantPage } from "@/lib/cardin-page-data"
import { LANDING_PRICING } from "@/lib/landing-content"
import type { ParcoursDiamondKey } from "@/lib/parcours-v2"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/ui/button"

type DiamondChoiceLink = {
  key: ParcoursDiamondKey
  label: string
  href: string
  active: boolean
}

type DiamondDisplay = {
  title: string
  detail: string
  weeklyMoment: string
  weeklyDetail: string
  entranceLine: string
}

const DIAMOND_DISPLAY: Record<ParcoursDiamondKey, DiamondDisplay> = {
  dinner: {
    title: "Une fournee signature",
    detail: "par mois pendant 1 an",
    weeklyMoment: "une fournee peut tomber",
    weeklyDetail: "pour donner un vrai rendez-vous de quartier autour de la maison.",
    entranceLine: "Diamond en jeu : une fournee signature par mois pendant 1 an.",
  },
  credit: {
    title: "120 EUR gourmand",
    detail: "de credit sur 12 mois",
    weeklyMoment: "6 EUR gourmand peuvent tomber",
    weeklyDetail: "pour faire revenir sans promo frontale ni remise libre.",
    entranceLine: "Diamond en jeu : 120 EUR de credit gourmand sur 12 mois.",
  },
  unlimited: {
    title: "Un petit-dejeuner quartier",
    detail: "par mois pendant 1 an",
    weeklyMoment: "un petit-dejeuner peut tomber",
    weeklyDetail: "pour ancrer un vrai rituel du matin sans casser l'economie.",
    entranceLine: "Diamond en jeu : un petit-dejeuner quartier par mois pendant 1 an.",
  },
}

export function BoulangeriePreviewPage({
  merchant,
  activationHref,
  backHref,
  choiceLinks,
  selectedDiamond,
  scanHref,
  merchantDashboardHref,
}: {
  merchant: CardinMerchantPage
  activationHref: string
  backHref: string
  choiceLinks: DiamondChoiceLink[]
  selectedDiamond: ParcoursDiamondKey
  scanHref?: string | null
  merchantDashboardHref?: string | null
}) {
  const diamond = DIAMOND_DISPLAY[selectedDiamond]

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.05),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(184,149,106,0.1),transparent_30%),#ebe5d8] text-[#1a2a22]">
      <section className="relative z-[2] mx-auto grid min-h-[92dvh] max-w-[1240px] gap-10 px-5 pb-14 pt-24 sm:px-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-center md:gap-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:px-10 xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-16 xl:px-12">
        <div className="text-left">
          <p className="mb-4 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8c6a44]">
            <span className="h-px w-[14px] bg-[#b8956a]/70" />
            Version comptoir
          </p>
          <h1 className="font-serif text-[clamp(46px,14vw,88px)] leading-[0.96] tracking-[-0.03em] text-[#1a2a22]">
            Ce qui se voit
            <br />
            a l'entree.
          </h1>
          <p className="mt-4 max-w-[560px] font-serif text-[clamp(20px,6.2vw,30px)] leading-[1.2] tracking-[-0.01em] text-[#1a2a22]">
            Cardin pour
            <em className="mx-2 font-medium italic text-[#0f3d2e]">{merchant.businessName}</em>
            en version comptoir.
          </p>
          <p className="mt-5 max-w-[540px] font-serif text-[15px] italic leading-[1.6] text-[#3d4d43] sm:text-[16px]">
            Cette page montre ce que le lieu affiche a l'entree, ce que le client comprend en quelques secondes, et
            comment le Diamond choisi change le haut du systeme sans le rendre froid.
          </p>

          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">Choix Diamond</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {choiceLinks.map((choice) => (
                <Link
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition",
                    choice.active
                      ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4]"
                      : "border-[#d4cdbd] bg-[rgba(255,252,246,0.82)] text-[#1a2a22] hover:border-[#0f3d2e] hover:text-[#0f3d2e]",
                  )}
                  href={choice.href}
                  key={choice.key}
                >
                  {choice.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <FactPanel
              label="Choix affiche"
              value={diamond.title}
              detail={diamond.detail}
            />
            <FactPanel
              label="Lecture boulangerie"
              value={merchant.weakMomentLabel}
              detail="Matin, midi, retour rapide et routine de quartier."
            />
            <FactPanel
              label="Domino"
              value="Viens avec quelqu'un"
              detail="Au passage 3, le client peut faire entrer quelqu'un. L'autre personne commence a son tour."
            />
            <FactPanel
              label="Projection"
              value={`${merchant.projectionLow} a ${merchant.projectionHigh} EUR`}
              detail="Meme moteur Cardin, meme logique de saison, rendu plus situe pour le rendez-vous."
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }), "justify-center")} href={backHref}>
              Revenir a la page boulangerie
            </Link>
            <Link className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "justify-center")} href={activationHref}>
              Ouvrir la page Cardin du lieu
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] md:max-w-[320px] lg:max-w-[380px] xl:max-w-[460px]">
          <div className="pointer-events-none absolute inset-[-12px] rounded-[12px] border border-dashed border-[#b8956a]/30 sm:inset-[-16px] lg:inset-[-22px]" />
          <div className="pointer-events-none absolute inset-[-22px] rounded-[18px] border border-[#b8956a]/15 sm:inset-[-28px] lg:inset-[-38px]" />

          <article className="relative flex min-h-[520px] flex-col overflow-hidden rounded-[6px] border border-[#b8956a] bg-[radial-gradient(circle_at_15%_10%,rgba(184,149,106,0.08),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(15,61,46,0.04),transparent_45%),#f2ede4] px-4 pb-4 pt-6 shadow-[0_24px_60px_rgba(15,61,46,0.1),0_48px_100px_rgba(15,61,46,0.06)] sm:px-5 sm:pb-5 sm:pt-7 xl:px-7 xl:pb-6 xl:pt-8">
            <div className="pointer-events-none absolute inset-[1px] rounded-[6px] border border-[#b8956a]/40" />
            <span className="absolute left-[10px] top-[10px] h-[14px] w-[14px] border-l border-t border-[#b8956a]/60" />
            <span className="absolute right-[10px] top-[10px] h-[14px] w-[14px] border-r border-t border-[#b8956a]/60" />
            <span className="absolute bottom-[10px] left-[10px] h-[14px] w-[14px] border-b border-l border-[#b8956a]/60" />
            <span className="absolute bottom-[10px] right-[10px] h-[14px] w-[14px] border-b border-r border-[#b8956a]/60" />

            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#d4b892] bg-[rgba(15,61,46,0.05)] px-3 py-1 text-[8px] uppercase tracking-[0.2em] text-[#8c6a44]">
              <span className="relative h-[6px] w-[6px] rounded-full bg-[#0f3d2e]" />
              Visible a l'entree
            </div>

            <div className="mt-4 text-center sm:mt-5">
              <p className="font-serif text-[12px] tracking-[0.34em] text-[#1a2a22] sm:text-[13px] xl:text-[14px]">CARDIN</p>
              <p className="mt-1 text-[7px] uppercase tracking-[0.24em] text-[#8a8578] sm:text-[8px] sm:tracking-[0.3em]">Saison · {merchant.businessName}</p>
            </div>

            <div className="mt-4 border-y border-[#d4cdbd] px-3 py-3 text-center sm:mt-5 sm:px-4 sm:py-4">
              <p className="text-[8px] uppercase tracking-[0.3em] text-[#8c6a44]">Diamond choisi</p>
              <p className="mt-2 font-serif text-[18px] leading-[1.2] text-[#1a2a22] sm:text-[20px] xl:text-[22px]">
                <em className="italic text-[#0f3d2e]">{diamond.title}</em>
              </p>
              <p className="mt-1 font-serif text-[10px] italic text-[#3d4d43] sm:text-[11px] xl:text-[12px]">{diamond.detail}</p>
            </div>

            <div className="mt-4 border-y border-[#d4cdbd] px-3 py-3 text-center sm:mt-5 sm:px-4 sm:py-4">
              <p className="text-[8px] uppercase tracking-[0.3em] text-[#8c6a44]">Cette semaine</p>
              <p className="mt-2 font-serif text-[18px] leading-[1.2] text-[#1a2a22] sm:text-[20px] xl:text-[22px]">
                Mardi matin,
                <em className="ml-1 italic text-[#0f3d2e]">{diamond.weeklyMoment}</em>
              </p>
              <p className="mt-1 font-serif text-[10px] italic text-[#3d4d43] sm:text-[11px] xl:text-[12px]">{diamond.weeklyDetail}</p>
            </div>

            <div className="mt-4 sm:mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-[0.24em] text-[#8a8578]">Progression</span>
                <span className="font-serif text-[12px] italic text-[#8c6a44]">2 sur 4</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[0, 1, 2, 3].map((index) => {
                  const isFilled = index < 2
                  const isCurrent = index === 2
                  return (
                    <div
                      className={cn(
                        "relative flex aspect-square items-center justify-center rounded-[3px] border font-serif text-[14px] transition sm:text-[15px] xl:text-[16px]",
                        isFilled
                          ? "border-[#b8956a] bg-[rgba(184,149,106,0.12)] text-[#8c6a44]"
                          : isCurrent
                            ? "border-[#0f3d2e] bg-[rgba(15,61,46,0.06)] text-[#0f3d2e]"
                            : "border-[#d4b892] bg-[rgba(184,149,106,0.03)] text-[#d4b892]",
                      )}
                      key={index}
                    >
                      {isFilled || isCurrent ? "◇" : "◈"}
                      {isCurrent ? <span className="absolute inset-[-3px] rounded-[4px] border border-[#0f3d2e]/40" /> : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 rounded-[4px] border border-[#d4b892] bg-[rgba(184,149,106,0.04)] px-3 py-3 sm:mt-5 sm:px-4">
              <p className="text-[8px] uppercase tracking-[0.24em] text-[#8a8578]">Moment copain</p>
              <p className="mt-2 font-serif text-[14px] italic leading-[1.45] text-[#1a2a22] sm:text-[16px]">
                Au passage 3, viens avec quelqu'un.
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#3d4d43]">
                Le nouveau client entre dans Cardin. Le passeur avance si l'autre revient vraiment.
              </p>
            </div>

            <div className="mt-auto rounded-[3px] border border-dashed border-[#d4cdbd] bg-[rgba(15,61,46,0.03)] px-3 py-3">
              <p className="flex items-center gap-2 font-serif text-[11px] italic leading-[1.45] text-[#3d4d43] xl:text-[12px]">
                <span className="h-[4px] w-[4px] rounded-full bg-[#0f3d2e]" />
                {diamond.entranceLine}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="relative z-[2] mx-auto max-w-[1080px] px-6 pb-20 md:px-8 lg:px-12">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <InteractiveSurface
            description={scanHref ? "Ouvrir l'experience client" : "Ouvrir la page du lieu"}
            href={scanHref ?? activationHref}
            tone="warm"
          >
            <span className="inline-flex rounded-full border border-[#d4b892] bg-[rgba(184,149,106,0.12)] px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-[#8c6a44]">
              Affiche comptoir
            </span>
            <h2 className="mt-4 font-serif text-[32px] leading-[1.08] tracking-[-0.02em] text-[#1a2a22]">
              Ce que le client voit
              <em className="ml-2 italic text-[#0f3d2e]">en 3 secondes</em>
            </h2>
            <div className="mt-5 grid gap-3">
              <FactPanel
                label="Message"
                value="Scannez pour entrer dans la saison"
                detail="Pas besoin d'expliquer tout le moteur au comptoir."
              />
              <FactPanel
                label="Cette semaine"
                value={`Mardi matin · ${diamond.weeklyMoment}`}
                detail={diamond.weeklyDetail}
              />
              <FactPanel
                label="Diamond"
                value={diamond.title}
                detail={diamond.detail}
              />
            </div>
          </InteractiveSurface>

          <InteractiveSurface
            description={merchantDashboardHref ? "Ouvrir le cote marchand" : "Ouvrir la page Cardin du lieu"}
            href={merchantDashboardHref ?? activationHref}
            tone="base"
          >
            <span className="inline-flex rounded-full border border-[#d4b892] bg-[rgba(184,149,106,0.12)] px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-[#8c6a44]">
              Suite reelle
            </span>
            <h2 className="mt-4 font-serif text-[32px] leading-[1.08] tracking-[-0.02em] text-[#1a2a22]">
              Ce qui s'ouvre
              <em className="ml-2 italic text-[#0f3d2e]">sur le telephone</em>
            </h2>
            <div className="mt-5 grid gap-3">
              <FactPanel
                label="Carte"
                value="Progression visible, Mon QR, installation"
                detail="Le client entre sans compte lourd. La carte devient sa surface Cardin."
              />
              <FactPanel
                label="Domino"
                value="Passage 3 · viens avec quelqu'un"
                detail="Le systeme montre qu'un client peut devenir passeur, sans tomber dans un referral froid."
              />
              <FactPanel
                label="Equipe"
                value="Validation simple au comptoir"
                detail="Le lieu garde un geste staff clair, court, defendable."
              />
            </div>

          </InteractiveSurface>
        </div>

        <div className="mt-10 grid border-y border-[#d4cdbd] md:grid-cols-3">
          <InsightCard
            title="Visible a l'entree"
            detail="Le lieu affiche un moment simple, lisible et relie a une vraie saison Cardin."
          />
          <InsightCard
            title="Domino maitrise"
            detail="La propagation existe, mais elle reste bornee: peu d'invitations, validation sur vrai retour."
          />
          <InsightCard
            title="Meme moteur"
            detail={`Premier mois ou saison complete, ${merchant.businessName} garde le meme systeme Cardin sous ${LANDING_PRICING.activationFee} EUR la saison.`}
          />
        </div>
      </section>
    </div>
  )
}

function FactPanel({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-[4px] border border-[#d4cdbd] bg-[#f2ede4]/75 px-4 py-4">
      <p className="text-[9px] uppercase tracking-[0.22em] text-[#8a8578]">{label}</p>
      <p className="mt-2 font-serif text-[18px] leading-[1.2] text-[#1a2a22]">{value}</p>
      <p className="mt-2 font-serif text-[13px] italic leading-[1.5] text-[#3d4d43]">{detail}</p>
    </div>
  )
}

function InteractiveSurface({
  href,
  description,
  tone,
  children,
}: {
  href: string
  description: string
  tone: "warm" | "base"
  children: React.ReactNode
}) {
  return (
    <Link
      className={cn(
        "group block rounded-[6px] border px-7 py-8 shadow-[0_12px_30px_rgba(15,61,46,0.04)] transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_20px_45px_rgba(15,61,46,0.08)]",
        tone === "warm"
          ? "border-[#c9b28d] bg-[linear-gradient(180deg,#fff8ef_0%,#f6efe3_100%)] hover:border-[#b8956a]"
          : "border-[#d4cdbd] bg-[#f2ede4] hover:border-[#b8956a]",
      )}
      href={href}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">{children}</div>
        <div className="shrink-0 rounded-full border border-[#d4b892] bg-[rgba(255,252,246,0.72)] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#8c6a44] transition group-hover:border-[#0f3d2e] group-hover:text-[#0f3d2e]">
          {description}
        </div>
      </div>
    </Link>
  )
}

function InsightCard({
  title,
  detail,
}: {
  title: string
  detail: string
}) {
  return (
    <article className="border-b border-[#d4cdbd] px-6 py-8 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <p className="font-serif text-[16px] italic text-[#b8956a]">◇</p>
      <h2 className="mt-3 font-serif text-[20px] leading-[1.34] text-[#1a2a22]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[240px] font-serif text-[14px] italic leading-[1.55] text-[#3d4d43]">{detail}</p>
    </article>
  )
}
