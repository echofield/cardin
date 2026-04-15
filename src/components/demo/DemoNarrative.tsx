"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { DemoMerchantBoard } from "@/components/demo/DemoMerchantBoard"
import { DemoWalletCard } from "@/components/demo/DemoWalletCard"
import { getDemoWorldContent } from "@/lib/demo-content"
import { LANDING_PRICING, LANDING_WORLD_ORDER, LANDING_WORLDS, type LandingWorldId } from "@/lib/landing-content"
import { formatEuro } from "@/lib/number-format"

const SCREENS = [
  { id: "setup", act: "Mise en place", title: "Resume de configuration", perspective: "Commercant" },
  { id: "activation", act: "Mise en place", title: "Activation", perspective: "Commercant" },
  { id: "entry", act: "Client", title: "Premier contact", perspective: "Client" },
  { id: "return", act: "Client", title: "Premier retour", perspective: "Client" },
  { id: "domino", act: "Client", title: "Propagation", perspective: "Client" },
  { id: "living-card", act: "Client", title: "Carte vivante", perspective: "Client" },
  { id: "merchant-proof", act: "Preuve", title: "Tableau marchand", perspective: "Commercant" },
] as const



export function DemoNarrative() {
  const [worldId, setWorldId] = useState<LandingWorldId>("cafe")
  const [screenIndex, setScreenIndex] = useState(0)

  const screen = SCREENS[screenIndex]
  const world = LANDING_WORLDS[worldId]
  const demo = getDemoWorldContent(worldId)
  const progressRatio = ((screenIndex + 1) / SCREENS.length) * 100

  const content = useMemo(() => {
    switch (screen.id) {
      case "setup":
        return (
          <div className="space-y-5">
            <Panel eyebrow="Configuration" title="La saison est deja lisible pour le commerce.">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard label="Secteur" value={world.label} note={world.eyebrow} />
                <InfoCard label="Sommet" value={demo.summitLabel} note="centre emotionnel" />
                <InfoCard label="Saison" value={demo.seasonLabel} note="cadre commercial" />
                <InfoCard label="Parcours" value="8 etapes" note={`objectif ${demo.targetVisits} visites`} />
              </div>
            </Panel>
            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <Panel
                eyebrow="Pricing"
                title={`${LANDING_PRICING.activationFee} EUR pour la saison (${LANDING_PRICING.seasonLengthMonths} mois).`}
                body={`${LANDING_PRICING.recurringLabel}. La demo reste alignee avec la vraie formule Cardin.`}
              />
              <Panel
                eyebrow="Projection"
                title={`${formatEuro(demo.projectedSeasonRevenue)} sur ${demo.seasonMonths} mois`}
                body={`${demo.projectedMonthlyReturns} retours projetes par mois. ${demo.confidenceLabel}.`}
                tone="dark"
              />
            </div>
          </div>
        )
      case "activation":
        return (
          <div className="space-y-5">
            <Panel eyebrow="Activation" title="Le lieu voit tout de suite ce qui sera utilisable.">
              <div className="grid gap-3 sm:grid-cols-2">
                <FeatureCard title="QR actif" body="Le commerce peut deja faire entrer un client." />
                <FeatureCard title="Carte codee" body="Chaque carte porte son identite sans login." />
                <FeatureCard title="Dashboard" body="Le marchand voit la progression sans dashboard lourd." />
                <FeatureCard title="Activation digitale" body="QR et carte digitale sous 48 h. Cartes premium optionnelles plus tard." />
              </div>
            </Panel>
            <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Ce que le commercant comprend</p>
              <p className="mt-3 text-base leading-7 text-[#173A2E]">Pas une app à installer, pas un compte à ouvrir. Le QR d&apos;entrée active la carte digitale — elle devient l&apos;identité.</p>
              <p className="mt-3 text-sm leading-7 text-[#556159]">La couche commerciale s'appuie deja sur une projection de {formatEuro(demo.projectedMonthlyRevenue)} recuperes par mois.</p>
            </div>
          </div>
        )
      case "entry":
        return (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <Panel eyebrow="Premier contact" title={`${demo.sampleClientName} entre dans le système en 10 secondes.`} body="Scan du QR, création de la carte, ouverture immédiate sur téléphone. Le commerce comprend ce que le client verra vraiment." />
              <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[#617067]">
                <Tag>Scan QR</Tag>
                <Tag>Carte active</Tag>
                <Tag>Code visible</Tag>
              </div>
            </div>
            <div className="flex justify-center">
              <DemoWalletCard
                businessName={demo.businessName}
                businessType={demo.businessTypeLabel}
                cardCode="CD-001024"
                clientName={demo.sampleClientName}
                stage="dormant"
                summitLabel={demo.summitLabel}
                totalVisits={demo.targetVisits}
                visits={0}
                prompt="Bienvenue"
              />
            </div>
          </div>
        )
      case "return":
        return (
          <div className="space-y-5">
            <Panel eyebrow="Premier retour" title="La carte passe de dormante à active." body="Le système commence à faire son travail après le retour, pas au premier scan. C'est la première preuve comportementale." />
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div className="flex justify-center">
                <DemoWalletCard
                  businessName={demo.businessName}
                  businessType={demo.businessTypeLabel}
                  cardCode="CD-001024"
                  clientName={demo.sampleClientName}
                  stage="dormant"
                  summitLabel={demo.summitLabel}
                  totalVisits={demo.targetVisits}
                  visits={0}
                />
              </div>
              <div className="text-center text-2xl text-[#173A2E]">-&gt;</div>
              <div className="flex justify-center">
                <DemoWalletCard
                  businessName={demo.businessName}
                  businessType={demo.businessTypeLabel}
                  cardCode="CD-001024"
                  clientName={demo.sampleClientName}
                  stage="active"
                  summitLabel={demo.summitLabel}
                  totalVisits={demo.targetVisits}
                  visits={2}
                  prompt={demo.returnPrompt}
                />
              </div>
            </div>
          </div>
        )
      case "domino":
        return (
          <div className="space-y-5">
            <Panel eyebrow="Propagation" title="Le parcours montre une seule chaine claire: A invite B, B invite C." body="Pas de complexite visible. Le commercant comprend que l'accomplissement nourrit le grand prix et que la carte devient transmissible." />
            <div className="grid gap-4 sm:grid-cols-3">
              <ChainCard label="Carte A" note="Domino ouvert" />
              <ChainCard label="Carte B" note="Invitation activee" />
              <ChainCard label="Carte C" note="Deuxieme cercle" />
            </div>
            <div className="flex justify-center">
              <DemoWalletCard
                businessName={demo.businessName}
                businessType={demo.businessTypeLabel}
                cardCode="CD-001024"
                clientName={demo.sampleClientName}
                stage="domino"
                summitLabel={demo.summitLabel}
                totalVisits={demo.targetVisits}
                visits={5}
                prompt={demo.invitePrompt}
              />
            </div>
          </div>
        )
      case "living-card":
        return (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <Panel eyebrow="Carte vivante" title="Apres le demo-flow, le business voit comment la carte continue a parler au client." body="C'est la couche qui manquait: signaux simples, lisibles, relies au parcours reel." />
              <div className="mt-4 space-y-3">
                <Signal title={demo.returnPrompt} body="Rappel de retour sobre, sans application lourde." />
                <Signal title={demo.weakDayPrompt} body="Signal tactique pour les jours plus faibles du lieu." />
                <Signal title={demo.invitePrompt} body="La carte pousse la propagation au bon moment." />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <DemoWalletCard
                  businessName={demo.businessName}
                  businessType={demo.businessTypeLabel}
                  cardCode="CD-001024"
                  clientName={demo.sampleClientName}
                  stage="diamond"
                  summitLabel={demo.summitLabel}
                  totalVisits={demo.targetVisits}
                  visits={6}
                  prompt={demo.returnPrompt}
                />
              </div>
              <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Vision produit</p>
                <p className="mt-3 text-base leading-7 text-[#173A2E]">La carte est le compte. Le client ouvre sa carte, lit un signal, revient ou transmet. C'est suffisant pour faire vivre Cardin sans compte client classique.</p>
                <p className="mt-3 text-sm leading-7 text-[#556159]">Ici, la promesse n'est plus abstraite: {demo.projectedMonthlyReturns} retours projetes par mois et {formatEuro(demo.projectedMonthlyRevenue)} recuperes chaque mois.</p>
              </div>
            </div>
          </div>
        )
      case "merchant-proof":
        return (
          <div className="space-y-5">
            <Panel eyebrow="Preuve" title="Le demo se termine cote marchand, pas seulement cote client." body="Le business finit sur une lecture legere mais ancree: revenu saisonnier projete, retours mensuels et lecture d'une carte concrete." />
            <DemoMerchantBoard
              businessName={demo.businessName}
              businessType={demo.businessTypeLabel}
              cardCode="CD-001024"
              clientName={demo.sampleClientName}
              confidenceLabel={demo.confidenceLabel}
              monthlyRevenue={demo.projectedMonthlyRevenue}
              monthlyReturns={demo.projectedMonthlyReturns}
              paybackDays={demo.projectedPaybackDays}
              recoveredClients={demo.projectedRecoveredClients}
              seasonLabel={demo.seasonLabel}
              seasonRevenue={demo.projectedSeasonRevenue}
              summitLabel={demo.summitLabel}
            />
          </div>
        )
      default:
        return null
    }
  }, [demo, screen.id, world])

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#18271F]">
      <section className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute inset-x-0 top-[-220px] mx-auto h-[380px] w-[380px] rounded-full bg-[#E8EFE6] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8 lg:pb-14 lg:pt-18">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Démo client</p>
              <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-[#163328] sm:text-6xl lg:text-7xl">
                Ce que le client voit, comprend et ressent sur sa carte.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
                Cette route sert à montrer la carte côté client: premier contact, retour, propagation et messages de carte vivante.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href="/landing">
                Retour landing
              </Link>
              <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]" href="/engine?template=cafe&season=3">
                Ouvrir l'engine
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <aside className="space-y-4 rounded-[1.8rem] border border-[#DED9CF] bg-[#FFFEFA] p-5 shadow-[0_22px_70px_-54px_rgba(24,39,31,0.36)] lg:sticky lg:top-24">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Monde</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {LANDING_WORLD_ORDER.map((candidate) => {
                  const active = candidate === worldId
                  return (
                    <button
                      className={[
                        "rounded-full border px-4 py-2 text-sm transition",
                        active ? "border-[#173A2E] bg-[#EEF3EC] text-[#173A2E]" : "border-[#DAD4C7] bg-[#F8F5EE] text-[#5C695F] hover:border-[#B9C4B8] hover:text-[#173A2E]",
                      ].join(" ")}
                      key={candidate}
                      onClick={() => {
                        setWorldId(candidate)
                        setScreenIndex(0)
                      }}
                      type="button"
                    >
                      {LANDING_WORLDS[candidate].label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Progression</p>
                <span className="text-xs text-[#617067]">{screenIndex + 1} / {SCREENS.length}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E3E7DF]">
                <div className="h-full rounded-full bg-[#173A2E]" style={{ width: `${progressRatio}%` }} />
              </div>
            </div>

            <div className="rounded-[1.3rem] border border-[#DDE3DA] bg-[#F8FAF6] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Projection active</p>
              <p className="mt-2 font-serif text-3xl text-[#173A2E]">{formatEuro(demo.projectedSeasonRevenue)}</p>
              <p className="mt-1 text-xs text-[#607066]">sur {demo.seasonMonths} mois</p>
              <p className="mt-3 text-sm text-[#556159]">{demo.projectedMonthlyReturns} retours / mois - {demo.confidenceLabel}</p>
            </div>

            <div className="space-y-2">
              {SCREENS.map((candidate, index) => {
                const active = index === screenIndex
                return (
                  <button
                    className={[
                      "w-full rounded-[1.2rem] border p-4 text-left transition",
                      active ? "border-[#173A2E] bg-[#EEF3EC] shadow-[0_14px_28px_-24px_rgba(23,58,46,0.4)]" : "border-[#E4DED2] bg-[#FBF9F3] hover:border-[#C2CCC0]",
                    ].join(" ")}
                    key={candidate.id}
                    onClick={() => setScreenIndex(index)}
                    type="button"
                  >
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">{candidate.act}</p>
                    <p className="mt-2 font-serif text-2xl text-[#173A2E]">{candidate.title}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#5E6961]">{candidate.perspective}</p>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="space-y-5">
            <div className="rounded-[1.8rem] border border-[#DED9CF] bg-[linear-gradient(180deg,#FFFEFA_0%,#F4F0E7_100%)] p-6 shadow-[0_26px_80px_-60px_rgba(24,39,31,0.36)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E6E0D5] pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">{screen.act} - {screen.perspective}</p>
                  <h2 className="mt-3 font-serif text-4xl text-[#173328] sm:text-5xl">{screen.title}</h2>
                </div>
                <div className="rounded-full border border-[#D8DED4] bg-[#FBFCF8] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#173A2E]">
                  {world.label}
                </div>
              </div>
              <div className="mt-6">{content}</div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[#556159]">La demo montre la logique. La carte live reste sur <code>/c/[cardCode]</code>.</div>
              <div className="flex gap-3">
                <button
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#D1D8CF] bg-[#F5F2EB] px-5 text-sm font-medium text-[#173A2E] transition disabled:opacity-40"
                  disabled={screenIndex === 0}
                  onClick={() => setScreenIndex((value) => Math.max(0, value - 1))}
                  type="button"
                >
                  Precedent
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-5 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#24533F] disabled:opacity-40"
                  disabled={screenIndex === SCREENS.length - 1}
                  onClick={() => setScreenIndex((value) => Math.min(SCREENS.length - 1, value + 1))}
                  type="button"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Panel({ eyebrow, title, body, tone = "light", children }: { eyebrow: string; title: string; body?: string; tone?: "light" | "dark"; children?: React.ReactNode }) {
  return (
    <div
      className={[
        "rounded-[1.6rem] border p-5 sm:p-6",
        tone === "dark" ? "border-[#173A2E] bg-[#173A2E] text-[#FBFAF6]" : "border-[#D8DED4] bg-[#FFFEFA] text-[#173A2E]",
      ].join(" ")}
    >
      <p className={["text-[10px] uppercase tracking-[0.18em]", tone === "dark" ? "text-[#C7D2C6]" : "text-[#69736C]"].join(" ")}>{eyebrow}</p>
      <h3 className="mt-3 font-serif text-3xl leading-tight">{title}</h3>
      {body ? <p className={["mt-3 text-sm leading-7", tone === "dark" ? "text-[#E4E8E2]" : "text-[#556159]"].join(" ")}>{body}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  )
}

function InfoCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#DDE3DA] bg-[#F8FAF6] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">{label}</p>
      <p className="mt-2 font-serif text-2xl text-[#173A2E]">{value}</p>
      <p className="mt-2 text-sm text-[#5E6961]">{note}</p>
    </div>
  )
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#DDE3DA] bg-[#F8FAF6] p-4">
      <p className="font-medium text-[#173A2E]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#5E6961]">{body}</p>
    </div>
  )
}

function Signal({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#D8DED4] bg-[#FFFEFA] p-4">
      <p className="text-sm font-medium text-[#173A2E]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#5E6961]">{body}</p>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-[#D6DCCF] bg-[#FBF9F3] px-3 py-1">{children}</span>
}

function ChainCard({ label, note }: { label: string; note: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#D8DED4] bg-[#FFFEFA] p-4 text-center shadow-[0_14px_32px_-24px_rgba(24,39,31,0.18)]">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">{label}</p>
      <p className="mt-3 font-serif text-3xl text-[#173A2E]">{label.slice(-1)}</p>
      <p className="mt-2 text-sm text-[#5E6961]">{note}</p>
    </div>
  )
}

