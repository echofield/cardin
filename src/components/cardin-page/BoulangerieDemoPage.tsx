import Link from "next/link"

import { formatEuro } from "@/lib/calculator"
import type { CardinMerchantPage } from "@/lib/cardin-page-data"
import { LANDING_PRICING } from "@/lib/landing-content"
import { getDiamondOptions, getRewardOptions } from "@/lib/parcours-v2"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/ui/button"

const BOULANGERIE_PARCOURS = [
  { passage: "Passage 1", label: "Decouverte du comptoir" },
  { passage: "Passage 2", label: "Retour declenche dans la semaine" },
  { passage: "Passage 3", label: "Invitation a venir avec quelqu'un" },
  { passage: "Passage 5", label: "Habitude du quartier installee" },
  { passage: "Passage 7", label: "Fidelite forte et reconnue" },
  { passage: "Diamond", label: "Acces special de la maison" },
] as const

function buildInsights(merchant: CardinMerchantPage) {
  return [
    "Cardin voit un flux de passage important le matin et au midi, avec beaucoup de decisions rapides au comptoir.",
    "Cardin voit des clients occasionnels qui entrent une fois, puis disparaissent sans raison claire de repasser.",
    `Cardin voit un manque de tension sur ${merchant.weakMomentLabel}, alors que ce moment pourrait redevenir utile.`,
    "Cardin voit qu'aucun systeme ne capte vraiment les anniversaires, commandes familiales ou grosses occasions.",
    "Cardin voit des reguliers bien reels, mais encore peu structures dans un parcours lisible pour l'equipe.",
  ]
}

function buildScenarios(merchant: CardinMerchantPage) {
  return [
    {
      title: "Client de passage",
      text: "Cardin ramene un client de passage dans la meme semaine. Le deuxieme achat le fait entrer dans une vraie boucle de retour.",
    },
    {
      title: "Habitue du quartier",
      text: "Cardin reconnait l'habitue, fait monter sa progression au comptoir et transforme sa routine en attachement visible au lieu.",
    },
    {
      title: "Etudiant",
      text: "Cardin declenche un petit avantage simple, garde la frequence active et installe une regularite utile sur les moments du quotidien.",
    },
    {
      title: "Anniversaire ou evenement",
      text: `Cardin declenche un retour autour d'une commande speciale, remet ${merchant.businessName} dans le choix du client et fait monter le panier sur une vraie occasion.`,
    },
  ]
}

export function BoulangerieDemoPage({
  merchant,
  activationHref,
}: {
  merchant: CardinMerchantPage
  activationHref: string
}) {
  const rewardOptions = getRewardOptions("boulangerie")
  const diamondOptions = getDiamondOptions("boulangerie")
  const insights = buildInsights(merchant)
  const scenarios = buildScenarios(merchant)
  const previewParams = new URLSearchParams({
    name: merchant.businessName,
    weak: merchant.weakMomentId,
    rhythm: merchant.returnRhythmId,
    clientele: merchant.clienteleId,
  })

  if (merchant.note) {
    previewParams.set("note", merchant.note)
  }

  const previewHref = `/boulangerie/preview?${previewParams.toString()}`

  return (
    <div className="bg-[#F7F3EA] text-[#18271F]">
      <section className="border-b border-[#E6E0D5] bg-[radial-gradient(circle_at_top,#F2F6EE_0%,#F7F3EA_62%)]">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pb-12 lg:pt-14">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#C8D4CB] bg-[#F5F8F2] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#173A2E]">
              Saison 01 - ouverture en 48h
            </span>
            <span className="rounded-full border border-[#DED7CA] bg-[#FFFCF6] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#6A746C]">
              Boulangerie
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Cardin pour {merchant.businessName}</p>
              <h1 className="mt-3 font-serif text-[clamp(2.8rem,7vw,5.2rem)] leading-[1.02] text-[#163328]">
                Moteur de retour client - adapte a votre lieu
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#556159] sm:text-lg">
                Une page de demo claire pour montrer comment Cardin s'installe dans une boulangerie: retour rapide,
                progression lisible, rewards tenables et Diamond credible.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <InfoPill text={merchant.temporalAnchor} />
                <InfoPill text={merchant.returnProfile} />
                <InfoPill text={`Projection ${formatEuro(merchant.projectionLow)} a ${formatEuro(merchant.projectionHigh)}`} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#D6DDD3] bg-[#FFFEFA] p-5 shadow-[0_24px_60px_-40px_rgba(23,58,46,0.3)]">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Lecture Cardin</p>
              <p className="mt-2 text-sm leading-6 text-[#203B31]">{merchant.readingLead}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FactCard label="Moment a reprendre" value={merchant.weakMomentLabel} />
                <FactCard label="Retour vise" value={merchant.returnRhythmLabel} />
                <FactCard label="Base clientele" value={merchant.clienteleLabel} />
                <FactCard label="Sommet de saison" value={merchant.seasonRewardLabel} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-[1.6rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Ce que Cardin voit</p>
          <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">Une boulangerie a deja son flux. Cardin structure le retour.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {insights.map((item) => (
              <ObservationCard key={item} text={item} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.6rem] border border-[#D7DDD2] bg-[linear-gradient(180deg,#FFFEFA_0%,#F2F6EE_100%)] p-5 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Parcours Cardin</p>
          <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">Le meme moteur Cardin, parle comme une boulangerie.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#556159] sm:text-base">
            Le comptoir reste simple. Le client comprend vite pourquoi il revient, quand il peut inviter quelqu'un et
            ce que le Diamond ouvre reellement.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {BOULANGERIE_PARCOURS.map((step, index) => (
              <div
                className={cn(
                  "rounded-[1.2rem] border p-4",
                  step.passage === "Diamond" ? "border-[#D9C08A] bg-[#F8F1E2]" : "border-[#D7DDD2] bg-[#FFFEFA]",
                )}
                key={step.passage}
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">
                  {step.passage}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#203B31]">{step.label}</p>
                <p className="mt-3 text-[13px] leading-5 text-[#556159]">
                  {index === 0 && "Le premier scan donne une entree claire dans le lieu."}
                  {index === 1 && "Le retour se joue vite, avant que l'habitude ne se perde."}
                  {index === 2 && "Le bouche-a-oreille de quartier devient visible."}
                  {index === 3 && "La routine se fixe sur plusieurs passages reels."}
                  {index === 4 && "Le client se sent reconnu, pas juste recompense."}
                  {index === 5 && "Un privilege borne s'ouvre sans casser l'economie du comptoir."}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Micro-scenarios</p>
          <h2 className="mt-2 max-w-3xl font-serif text-2xl text-[#173328] sm:text-3xl">Cardin agit sur des cas reels, pas sur une promesse abstraite.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.title} title={scenario.title} text={scenario.text} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.5rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Rewards et Diamond</p>
            <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">Des rewards tenables. Un Diamond qui reste desirable.</h2>
            <p className="mt-3 text-sm leading-6 text-[#556159] sm:text-base">
              Ici, Cardin ne pousse pas de remise brute. Il donne des gestes simples au comptoir, puis un acces rare
              qui reste coherent avec une boulangerie de quartier.
            </p>

            <div className="mt-5 grid gap-3">
              {rewardOptions.slice(0, 3).map((reward) => (
                <FactCard key={reward.key} label={reward.label} value={reward.phrase} />
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#CDB88B] bg-[linear-gradient(180deg,#F8F2E4_0%,#FBF7EE_100%)] p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A6A35]">Diamond</p>
            <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">Le haut du parcours reste borne.</h2>
            <div className="mt-4 space-y-3">
              {diamondOptions.map((diamond) => (
                <div className="rounded-[1.1rem] border border-[#DFCDA1] bg-[rgba(255,252,246,0.85)] p-4" key={diamond.key}>
                  <p className="text-sm font-medium text-[#203B31]">{diamond.label}</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#556159]">{diamond.phrase}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-[#556159]">
              La version la plus simple a montrer en demo reste: un petit-dejeuner mensuel ou un privilege de commande
              speciale, reserve aux meilleurs clients de la saison.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Base page legere</p>
          <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">Une couche simple autour du moteur Cardin.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <FactCard label="Entree scan" value="Un QR comptoir qui ouvre le parcours en quelques secondes." />
            <FactCard label="Histoire simple" value={`Une page legere qui raconte pourquoi ${merchant.businessName} vaut le retour.`} />
            <FactCard label="Support du systeme" value="La page soutient Cardin et le comptoir. Elle ne remplace ni l'equipe ni le parcours." />
          </div>
        </section>

        <section className="mt-8 rounded-[1.6rem] border border-[#173A2E] bg-[#173A2E] p-5 text-[#FBFAF6] shadow-[0_20px_60px_-44px_rgba(23,58,46,0.4)] sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#C8D4CB]">Activation</p>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Activer la saison Cardin</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#D5DDD6] sm:text-base">
                Meme moteur, meme projection, meme logique de parcours. La mise en place reste legere pour le comptoir
                et l'ouverture tient sous 48 h.
              </p>
              <p className="mt-4 text-sm text-[#E6ECE7]">
                {formatEuro(merchant.projectionLow)} a {formatEuro(merchant.projectionHigh)} de projection de saison
                pour {LANDING_PRICING.compactLabel.toLowerCase()}.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link className={cn(buttonVariants({ variant: "primary", size: "lg" }), "justify-center bg-[#FBFAF6] text-[#173A2E] hover:bg-[#F1ECE2]")} href={activationHref}>
                Activer la saison Cardin
              </Link>
              <Link className={cn(buttonVariants({ variant: "subtle", size: "lg" }), "justify-center border-[#4A6659] bg-transparent text-[#FBFAF6] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#FBFAF6]")} href={previewHref}>
                Voir la preview Diamond
              </Link>
              <span className="inline-flex items-center justify-center rounded-full border border-[#4A6659] px-4 py-3 text-sm text-[#E6ECE7]">
                Ouverture en 48h
              </span>
            </div>
          </div>
        </section>
      </div>
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

function ObservationCard({ text }: { text: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[#E2DDD1] bg-[#FBF9F3] p-4">
      <p className="text-sm leading-6 text-[#203B31]">{text}</p>
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

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[#E2DDD1] bg-[#FBF9F3] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#203B31]">{value}</p>
    </div>
  )
}
