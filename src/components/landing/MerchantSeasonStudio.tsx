"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { WalletPassPreview } from "@/components/engine/WalletPassPreview"
import { Button, Card } from "@/ui"

type WorldId = "cafe" | "restaurant" | "beaute" | "boutique"
type SeasonLength = 3 | 6

type EntryLane = {
  title: string
  lead: string
  steps: [string, string, string]
  outcome: string
}

type TierStep = {
  name: string
  merchantOutcome: string
  socialRadius: string
  heightClass: string
  marker?: string
}

type SummitOption = {
  id: string
  title: string
  promise: string
  annualCost: number
  visibilityLabel: string
  socialLiftLabel: string
  note: string
  monthlyRecoveredBoost: number
  dominoBoost: number
  trustLift: number
}

type WorldDefinition = {
  id: WorldId
  label: string
  eyebrow: string
  hero: string
  intro: string
  baselineMonthlyRecovered: number
  baselineActivePaths: number
  baselineDominoMultiplier: number
  baselineTrust: number
  adSpend: number
  adDuration: string
  installPrice: number
  basketLine: string
  proofLine: string
  defaultSummitId: string
  walletRewardLabel: string
  walletNotification: string
  entry: {
    selective: EntryLane
    mass: EntryLane
  }
  tiers: TierStep[]
  summits: SummitOption[]
}

type ScreenId = "world" | "system" | "summit" | "season" | "checkmate" | "activate"

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/7sY5kD4RS66P4Tv7xl9Zm07"

const screens: Array<{ id: ScreenId; label: string; eyebrow: string }> = [
  { id: "world", label: "Lieu", eyebrow: "Monde marchand" },
  { id: "system", label: "Systeme", eyebrow: "Entree et trajectoire" },
  { id: "summit", label: "Sommet", eyebrow: "Grand Diamond" },
  { id: "season", label: "Saison", eyebrow: "Limite et narration" },
  { id: "checkmate", label: "Checkmate", eyebrow: "Revenu, reseau, affluence" },
  { id: "activate", label: "Activation", eyebrow: "Lancer la saison" },
]

const seasonModes: Array<{
  months: SeasonLength
  title: string
  description: string
  selectiveCards: number
  massCards: number
  note: string
  momentum: string
}> = [
  {
    months: 3,
    title: "Saison courte",
    description: "Cycle rapide pour prouver le systeme.",
    selectiveCards: 50,
    massCards: 200,
    note: "Format simple, premiere preuve terrain.",
    momentum: "3 mois: activation → retour → premiers Diamond.",
  },
  {
    months: 6,
    title: "Saison longue",
    description: "Plus de temps pour installer propagation.",
    selectiveCards: 80,
    massCards: 280,
    note: "Format long, propagation plus profonde.",
    momentum: "6 mois: bouche-a-oreille structure, preparation saison 2.",
  },
]

const worlds: WorldDefinition[] = [
  {
    id: "cafe",
    label: "Cafe",
    eyebrow: "Volume et frequence",
    hero: "Cafe: frequence elevee, retour rapide.",
    intro: "Panier moyen 5-8 EUR. Passage quotidien ou hebdomadaire. Le systeme optimise la recurrence.",
    baselineMonthlyRecovered: 1400,
    baselineActivePaths: 150,
    baselineDominoMultiplier: 1.4,
    baselineTrust: 72,
    adSpend: 500,
    adDuration: "3 jours",
    installPrice: 300,
    basketLine: "Exemple sommet: 1 boisson signature par mois pendant 1 an.",
    proofLine: "Passage → retour structure → propagation mesuree.",
    defaultSummitId: "signature-monthly",
    walletRewardLabel: "Progression visible",
    walletNotification: "Votre statut evolue avec vos visites.",
    entry: {
      selective: {
        title: "Entree selective",
        lead: "Patron choisit 50 premieres cartes.",
        steps: ["50 cartes max", "activation visite 1", "statut evolue visite 2"],
        outcome: "50 cartes → 120-150 parcours actifs via propagation.",
      },
      mass: {
        title: "Entree masse",
        lead: "QR accessible, filtre par comportement.",
        steps: ["200 cartes distribuees", "visite 1 = dormante", "visite 2 = activation"],
        outcome: "Filtre automatique: seuls les retours reels activent le systeme.",
      },
    },
    tiers: [
      { name: "Dormante", merchantOutcome: "La carte circule sans cout actif", socialRadius: "aucune propagation", heightClass: "h-14" },
      { name: "Active", merchantOutcome: "Premier retour visible", socialRadius: "radius 0", heightClass: "h-24" },
      { name: "Ancree", merchantOutcome: "Le lieu devient un rendez-vous", socialRadius: "radius 0", heightClass: "h-36" },
      { name: "Diamond", merchantOutcome: "Invite 1 a 2 personnes max", socialRadius: "radius 1", heightClass: "h-48", marker: "domino" },
      { name: "Grand Diamond", merchantOutcome: "Attracteur visible pour tout le lieu", socialRadius: "radius 2 + aura", heightClass: "h-60", marker: "summit" },
    ],
    summits: [
      {
        id: "signature-monthly",
        title: "Signature mensuelle",
        promise: "1 boisson signature par mois pendant 1 an.",
        annualCost: 120,
        visibilityLabel: "Sommet visible",
        socialLiftLabel: "attire sans sur-promettre",
        note: "Simple, lisible, rentable.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "duo-morning",
        title: "Duo du matin",
        promise: "1 duo signature par mois pour le sommet.",
        annualCost: 180,
        visibilityLabel: "Sommet tres visible",
        socialLiftLabel: "renforce invitation",
        note: "Pousse la venue a deux.",
        monthlyRecoveredBoost: 1.16,
        dominoBoost: 1.08,
        trustLift: 1.08,
      },
      {
        id: "hidden-cellar",
        title: "Privilege cache",
        promise: "Privilege non affiche, reserve au sommet.",
        annualCost: 140,
        visibilityLabel: "Sommet discret",
        socialLiftLabel: "desir sans affichage",
        note: "Version mysterieuse.",
        monthlyRecoveredBoost: 1.08,
        dominoBoost: 1.03,
        trustLift: 1.05,
      },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    eyebrow: "Panier moyen eleve",
    hero: "Restaurant: panier 40-60 EUR, retour espacé.",
    intro: "Frequence mensuelle ou bimestrielle. Table et invitation. Le systeme structure les reservations.",
    baselineMonthlyRecovered: 3800,
    baselineActivePaths: 135,
    baselineDominoMultiplier: 1.5,
    baselineTrust: 76,
    adSpend: 800,
    adDuration: "3 jours",
    installPrice: 500,
    basketLine: "Exemple sommet: 1 repas signature par mois pendant 1 an.",
    proofLine: "Table → retour structure → propagation par invitation.",
    defaultSummitId: "table-monthly",
    walletRewardLabel: "Progression table",
    walletNotification: "Votre statut evolue avec vos visites.",
    entry: {
      selective: {
        title: "Entree selective",
        lead: "Patron choisit 80 premieres cartes.",
        steps: ["80 cartes max", "activation visite 1", "statut evolue visite 2"],
        outcome: "80 cartes → 110-135 parcours actifs via invitation.",
      },
      mass: {
        title: "Entree masse",
        lead: "QR sur table, filtre par retour reel.",
        steps: ["200 cartes distribuees", "visite 1 = dormante", "visite 2 = activation"],
        outcome: "Filtre automatique: seules les tables qui reviennent activent.",
      },
    },
    tiers: [
      { name: "Dormante", merchantOutcome: "La carte installe la curiosite", socialRadius: "aucune propagation", heightClass: "h-14" },
      { name: "Active", merchantOutcome: "Retour entre deux repas", socialRadius: "radius 0", heightClass: "h-28" },
      { name: "Ancree", merchantOutcome: "Le client guette son moment reserve", socialRadius: "radius 0", heightClass: "h-40" },
      { name: "Diamond", merchantOutcome: "Invite 1 a 2 tables dans la saison", socialRadius: "radius 1", heightClass: "h-52", marker: "domino" },
      { name: "Grand Diamond", merchantOutcome: "Le sommet rend la table aspirante", socialRadius: "radius 2 + aura", heightClass: "h-64", marker: "summit" },
    ],
    summits: [
      {
        id: "table-monthly",
        title: "Table mensuelle",
        promise: "1 repas signature par mois pendant 1 an.",
        annualCost: 600,
        visibilityLabel: "Sommet visible",
        socialLiftLabel: "table meritee",
        note: "Un repas mensuel = ambassadeur 12 mois.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "chef-table",
        title: "Table du chef",
        promise: "Table chef reservee une fois par mois.",
        annualCost: 720,
        visibilityLabel: "Sommet tres visible",
        socialLiftLabel: "pousse retours et invitations",
        note: "Rare, raconte, histoire.",
        monthlyRecoveredBoost: 1.18,
        dominoBoost: 1.1,
        trustLift: 1.08,
      },
      {
        id: "secret-menu",
        title: "Menu secret",
        promise: "Privilege cache reserve au sommet.",
        annualCost: 480,
        visibilityLabel: "Sommet discret",
        socialLiftLabel: "desir et mystere",
        note: "Mystere plutot qu'affichage.",
        monthlyRecoveredBoost: 1.07,
        dominoBoost: 1.03,
        trustLift: 1.05,
      },
    ],
  },
  {
    id: "beaute",
    label: "Beaute",
    eyebrow: "Valeur et selection",
    hero: "Beaute: valeur client elevee, trajectoire.",
    intro: "Panier moyen 50-80 EUR. Frequence mensuelle ou bimestrielle. Selection qualitative, propagation par confiance.",
    baselineMonthlyRecovered: 2600,
    baselineActivePaths: 110,
    baselineDominoMultiplier: 1.3,
    baselineTrust: 81,
    adSpend: 600,
    adDuration: "3 jours",
    installPrice: 300,
    basketLine: "Exemple sommet: 1 soin signature par mois pendant 1 an.",
    proofLine: "Cycle → statut client → recommandation qualitative.",
    defaultSummitId: "cut-monthly",
    walletRewardLabel: "Progression cycle",
    walletNotification: "Votre statut evolue avec votre cycle.",
    entry: {
      selective: {
        title: "Entree selective",
        lead: "Salon choisit 50 clientes cibles.",
        steps: ["50 cartes max", "activation visite 1", "statut evolue visite 2"],
        outcome: "50 cartes → 90-110 parcours via recommandation.",
      },
      mass: {
        title: "Entree masse",
        lead: "QR a l'accueil, filtre par cycle reel.",
        steps: ["150 cartes distribuees", "visite 1 = dormante", "visite 2 = activation"],
        outcome: "Filtre automatique: seuls les cycles reels activent.",
      },
    },
    tiers: [
      { name: "Dormante", merchantOutcome: "La carte installe une attente", socialRadius: "aucune propagation", heightClass: "h-14" },
      { name: "Active", merchantOutcome: "Le prochain rendez-vous se rapproche", socialRadius: "radius 0", heightClass: "h-28" },
      { name: "Ancree", merchantOutcome: "Le lieu devient son rythme", socialRadius: "radius 0", heightClass: "h-40" },
      { name: "Diamond", merchantOutcome: "Invite 1 a 2 personnes max", socialRadius: "radius 1", heightClass: "h-52", marker: "domino" },
      { name: "Grand Diamond", merchantOutcome: "Le sommet stabilise la recommandation", socialRadius: "radius 2 + aura", heightClass: "h-64", marker: "summit" },
    ],
    summits: [
      {
        id: "cut-monthly",
        title: "Soin mensuel",
        promise: "1 soin signature par mois pendant 1 an.",
        annualCost: 300,
        visibilityLabel: "Sommet visible",
        socialLiftLabel: "statut visible",
        note: "Sommet classique salon/institut.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "ritual-duo",
        title: "Soin duo",
        promise: "1 privilege duo mensuel pour le sommet.",
        annualCost: 420,
        visibilityLabel: "Sommet tres visible",
        socialLiftLabel: "renforce invitation",
        note: "Recommandation en rendez-vous reel.",
        monthlyRecoveredBoost: 1.15,
        dominoBoost: 1.08,
        trustLift: 1.08,
      },
      {
        id: "private-ritual",
        title: "Acces prive",
        promise: "Privilege non affiche reserve au sommet.",
        annualCost: 260,
        visibilityLabel: "Sommet discret",
        socialLiftLabel: "confidence",
        note: "Version silencieuse.",
        monthlyRecoveredBoost: 1.07,
        dominoBoost: 1.03,
        trustLift: 1.06,
      },
    ],
  },
  {
    id: "boutique",
    label: "Boutique",
    eyebrow: "Desir et statut",
    hero: "Boutique: valeur par piece, trajectoire client.",
    intro: "Panier moyen 80-150 EUR. Frequence faible, valeur elevee. Collection et statut, pas volume.",
    baselineMonthlyRecovered: 2200,
    baselineActivePaths: 95,
    baselineDominoMultiplier: 1.25,
    baselineTrust: 74,
    adSpend: 700,
    adDuration: "3 jours",
    installPrice: 500,
    basketLine: "Exemple sommet: 100 EUR collection par mois pendant 1 an.",
    proofLine: "Desir → trajectoire client → acces exclusif.",
    defaultSummitId: "collection-credit",
    walletRewardLabel: "Progression collection",
    walletNotification: "Votre acces evolue avec votre trajectoire.",
    entry: {
      selective: {
        title: "Entree selective",
        lead: "Boutique choisit 60 clientes cibles.",
        steps: ["60 cartes max", "activation visite 1", "statut evolue visite 2"],
        outcome: "60 cartes → 80-95 parcours via desir et style.",
      },
      mass: {
        title: "Entree masse",
        lead: "QR en boutique, filtre par retour reel.",
        steps: ["180 cartes distribuees", "visite 1 = dormante", "visite 2 = activation"],
        outcome: "Filtre automatique: seules les clientes qui reviennent activent.",
      },
    },
    tiers: [
      { name: "Dormante", merchantOutcome: "La carte installe une promesse", socialRadius: "aucune propagation", heightClass: "h-14" },
      { name: "Active", merchantOutcome: "Le retour prend forme", socialRadius: "radius 0", heightClass: "h-24" },
      { name: "Ancree", merchantOutcome: "Le style du lieu devient un repere", socialRadius: "radius 0", heightClass: "h-36" },
      { name: "Diamond", merchantOutcome: "Invite 1 a 2 personnes max", socialRadius: "radius 1", heightClass: "h-48", marker: "domino" },
      { name: "Grand Diamond", merchantOutcome: "Le sommet rend la collection aspirante", socialRadius: "radius 2 + aura", heightClass: "h-60", marker: "summit" },
    ],
    summits: [
      {
        id: "collection-credit",
        title: "Credit collection",
        promise: "100 EUR collection par mois pendant 1 an.",
        annualCost: 1200,
        visibilityLabel: "Sommet visible",
        socialLiftLabel: "desir net clientele",
        note: "Simple, fort a raconter.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "rare-drop",
        title: "Drop mensuel",
        promise: "Acces prioritaire piece reservee mensuel.",
        annualCost: 800,
        visibilityLabel: "Sommet tres visible",
        socialLiftLabel: "desir et partage",
        note: "Montee clientele sans remise.",
        monthlyRecoveredBoost: 1.14,
        dominoBoost: 1.08,
        trustLift: 1.07,
      },
      {
        id: "private-piece",
        title: "Piece cachee",
        promise: "Piece ou acces cache reserve au sommet.",
        annualCost: 650,
        visibilityLabel: "Sommet discret",
        socialLiftLabel: "confidence et tension",
        note: "Version silencieuse.",
        monthlyRecoveredBoost: 1.07,
        dominoBoost: 1.03,
        trustLift: 1.05,
      },
    ],
  },
]

function formatEuro(value: number) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${Math.round(value)} EUR`
  }
}

function buildEngineHref(worldId: WorldId, season: SeasonLength, summitId: string) {
  return `/engine?template=${worldId}&season=${season}&summit=${summitId}`
}

export function MerchantSeasonStudio() {
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>("cafe")
  const [selectedSeason, setSelectedSeason] = useState<SeasonLength>(3)
  const [selectedSummitId, setSelectedSummitId] = useState(worlds[0].defaultSummitId)
  const [screenIndex, setScreenIndex] = useState(0)

  const selectedWorld = useMemo(
    () => worlds.find((world) => world.id === selectedWorldId) ?? worlds[0],
    [selectedWorldId]
  )

  useEffect(() => {
    setSelectedSummitId(selectedWorld.defaultSummitId)
  }, [selectedWorld])

  const selectedSummit = useMemo(
    () => selectedWorld.summits.find((summit) => summit.id === selectedSummitId) ?? selectedWorld.summits[0],
    [selectedSummitId, selectedWorld]
  )

  const selectedSeasonMode = seasonModes.find((mode) => mode.months === selectedSeason) ?? seasonModes[0]

  const monthlyRecovered = Math.round(
    selectedWorld.baselineMonthlyRecovered * selectedSummit.monthlyRecoveredBoost * (selectedSeason === 6 ? 1.06 : 1)
  )
  const activePaths = Math.round(selectedWorld.baselineActivePaths * (selectedSeason === 6 ? 1.15 : 1))
  const trustScore = Math.round(selectedWorld.baselineTrust * selectedSummit.trustLift)
  const dominoMultiplier = (selectedWorld.baselineDominoMultiplier * selectedSummit.dominoBoost).toFixed(1)
  const seasonValue = monthlyRecovered * selectedSeason
  const seasonCards = {
    selective: selectedSeasonMode.selectiveCards,
    mass: selectedSeasonMode.massCards,
  }

  const engineHref = buildEngineHref(selectedWorld.id, selectedSeason, selectedSummit.id)
  const canGoBack = screenIndex > 0
  const canGoNext = screenIndex < screens.length - 1

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <div className="rounded-[2rem] border border-[#DED7CA] bg-[linear-gradient(180deg,#FFFDF8_0%,#F5F1E8_100%)] p-5 shadow-[0_28px_90px_-54px_rgba(21,47,37,0.38)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 border-b border-[#E3DDD0] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#667067]">Simulateur saison</p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.02] text-[#173328] sm:text-5xl lg:text-6xl">
              Configurez votre saison. Voyez le revenu recuperable.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#556159] sm:text-base">
              Choisissez: lieu, sommet, duree. Le systeme calcule le retour potentiel sur la saison.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <MetricPill label="Revenu" value={formatEuro(monthlyRecovered)} sublabel="recuperables / mois" />
            <MetricPill label="Reseau" value={`x${dominoMultiplier}`} sublabel="multiplicateur domino" />
            <MetricPill label="Affluence" value={`${trustScore}%`} sublabel="intensite du systeme" />
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-6">
          {screens.map((screen, index) => {
            const isActive = index === screenIndex
            const isDone = index < screenIndex

            return (
              <button
                className={[
                  "rounded-2xl border px-3 py-3 text-left transition",
                  isActive
                    ? "border-[#173A2E] bg-[#EEF3EC] shadow-[0_14px_32px_-28px_rgba(23,58,46,0.6)]"
                    : isDone
                      ? "border-[#D6DCD2] bg-[#F7F4ED]"
                      : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#C5CFC2]",
                ].join(" ")}
                key={screen.id}
                onClick={() => setScreenIndex(index)}
                type="button"
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736B]">{screen.eyebrow}</p>
                <p className="mt-1 text-sm font-medium text-[#173A2E]">
                  {index + 1}. {screen.label}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-6 min-h-[720px] rounded-[1.9rem] border border-[#E3DDD0] bg-[#FFFEFA] p-5 sm:p-6 lg:p-8">
          {screenIndex === 0 ? (
            <WorldScreen monthlyRecovered={monthlyRecovered} onSelectWorld={setSelectedWorldId} selectedWorld={selectedWorld} />
          ) : null}

          {screenIndex === 1 ? (
            <SystemScreen activePaths={activePaths} dominoMultiplier={dominoMultiplier} selectedWorld={selectedWorld} selectedSummit={selectedSummit} />
          ) : null}

          {screenIndex === 2 ? (
            <SummitScreen monthlyRecovered={monthlyRecovered} onSelectSummit={setSelectedSummitId} selectedSummit={selectedSummit} selectedWorld={selectedWorld} />
          ) : null}
          {screenIndex === 3 ? (
            <SeasonScreen activePaths={activePaths} monthlyRecovered={monthlyRecovered} onSelectSeason={setSelectedSeason} selectedSeason={selectedSeason} selectedSeasonMode={selectedSeasonMode} selectedSummit={selectedSummit} />
          ) : null}

          {screenIndex === 4 ? (
            <CheckmateScreen activePaths={activePaths} dominoMultiplier={dominoMultiplier} monthlyRecovered={monthlyRecovered} seasonCards={seasonCards} seasonValue={seasonValue} selectedSeason={selectedSeason} selectedSummit={selectedSummit} selectedWorld={selectedWorld} trustScore={trustScore} />
          ) : null}

          {screenIndex === 5 ? (
            <ActivateScreen activePaths={activePaths} engineHref={engineHref} monthlyRecovered={monthlyRecovered} selectedSeason={selectedSeason} selectedSummit={selectedSummit} selectedWorld={selectedWorld} seasonValue={seasonValue} />
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[#E3DDD0] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#5B655E]">
            {screens[screenIndex].eyebrow} · {selectedWorld.label} · {selectedSeason} mois
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {canGoBack ? (
              <Button onClick={() => setScreenIndex((value) => Math.max(0, value - 1))} size="md" variant="subtle">
                Retour
              </Button>
            ) : null}
            {canGoNext ? (
              <Button onClick={() => setScreenIndex((value) => Math.min(screens.length - 1, value + 1))} size="md" variant="primary">
                Continuer
              </Button>
            ) : (
              <a className="inline-flex h-11 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href={STRIPE_PAYMENT_LINK} rel="noreferrer" target="_blank">
                Payer ma saison (490 EUR)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function WorldScreen({ selectedWorld, onSelectWorld, monthlyRecovered }: { selectedWorld: WorldDefinition; onSelectWorld: (worldId: WorldId) => void; monthlyRecovered: number }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Type de commerce</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Choisissez votre type de lieu.</h3>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#59635C] sm:text-base">
          Chaque commerce a sa logique: frequence, panier moyen, type de propagation.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {worlds.map((world) => {
            const isActive = world.id === selectedWorld.id
            return (
              <button className={["rounded-[1.4rem] border p-5 text-left transition-all", isActive ? "border-[#173A2E] bg-[linear-gradient(180deg,#EEF3EC_0%,#E6EEE7_100%)] shadow-[0_18px_40px_-34px_rgba(23,58,46,0.55)]" : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#B8C4B8] hover:bg-[#FAF8F1]"].join(" ")} key={world.id} onClick={() => onSelectWorld(world.id)} type="button">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6C766E]">{world.eyebrow}</p>
                <p className="mt-2 font-serif text-2xl text-[#173A2E]">{world.label}</p>
                <p className="mt-2 text-sm leading-6 text-[#556159]">{world.intro}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[linear-gradient(180deg,#F8F7F0_0%,#EEF2EA_100%)] p-6 shadow-[0_22px_48px_-38px_rgba(23,58,46,0.28)]">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#637067]">Metriques de base</p>
        <h4 className="mt-3 font-serif text-4xl leading-tight text-[#173A2E]">{selectedWorld.hero}</h4>
        <p className="mt-4 text-sm leading-7 text-[#556159]">{selectedWorld.proofLine}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MiniMetricCard label="Revenu" value={formatEuro(monthlyRecovered)} note="recuperable / mois" />
          <MiniMetricCard label="Parcours" value={`${selectedWorld.baselineActivePaths}`} note="actifs potentiels" />
          <MiniMetricCard label="Systeme" value={`${selectedWorld.baselineTrust}%`} note="intensite" />
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-[#D8DED4] bg-[#FFFEFA] p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Mecanique</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Client = carte. Marchand = saison complete (entree, activation, propagation, sommet).</p>
        </div>
      </div>
    </div>
  )
}

function SystemScreen({ selectedWorld, selectedSummit, activePaths, dominoMultiplier }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; activePaths: number; dominoMultiplier: string }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Mecanique systeme</p>
          <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Progression pour {selectedWorld.label.toLowerCase()}.</h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#59635C] sm:text-base">Entree → Activation → Retour → Propagation → Sommet</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <MiniMetricCard label="Parcours actifs" value={`${activePaths}`} note="si la saison prend" />
          <MiniMetricCard label="Domino" value={`x${dominoMultiplier}`} note="propagation plafonnee" />
          <MiniMetricCard label="Sommet" value={selectedSummit.visibilityLabel} note="moteur du desir" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[1.5rem] border border-[#E2DDD1] bg-[#FFFDF8] p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Deux modes d'entree</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <EntryLaneCard lane={selectedWorld.entry.selective} />
            <EntryLaneCard lane={selectedWorld.entry.mass} />
          </div>
        </div>

        <WalletPassPreview activeDots={4} businessLabel={selectedWorld.label} caption="Carte evolue visuellement selon statut." footerLabel="SAISON CARDIN" notificationLabel={selectedWorld.walletNotification} progressDots={6} rewardLabel={selectedWorld.walletRewardLabel} statusLabel="Active" />
      </div>

      <div className="rounded-[1.5rem] border border-[#E2DDD1] bg-[#FFFDF8] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Progression statut</p>
            <h4 className="mt-2 font-serif text-3xl text-[#173A2E]">Statut = portee sociale.</h4>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#556159]">Carte monte → retour augmente → propagation active → sommet attire.</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.35rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
            <div className="flex items-end gap-3 overflow-x-auto pb-2">
              {selectedWorld.tiers.map((tier) => (
                <div className="min-w-[88px] flex-1" key={tier.name}>
                  <div className="flex h-64 items-end">
                    <div className={["w-full rounded-t-[1.3rem] border border-[#CBD6CA] bg-[linear-gradient(180deg,#DDE8DE_0%,#8CB38D_100%)] px-3 py-3 text-left", tier.heightClass, tier.marker === "summit" ? "border-[#C3A553] bg-[linear-gradient(180deg,#F2E8C1_0%,#C3A553_100%)]" : "", tier.marker === "domino" ? "border-[#7EA0C7] bg-[linear-gradient(180deg,#E2ECFA_0%,#80A4D6_100%)]" : ""].join(" ")}>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#163328]">{tier.name}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#173A2E]">{tier.merchantOutcome}</p>
                  <p className="mt-1 text-xs leading-5 text-[#6B766D]">{tier.socialRadius}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <LawCard title="Activation" body="Visite 1 = dormante. Visite 2 = activation. Filtre comportemental automatique." />
            <LawCard title="Propagation" body="Diamond = rayon social elargi. Peut inviter 1-2 personnes." />
            <LawCard title="Sommet" body="Grand Diamond = attracteur. Rend le systeme desirable pour tous." />
          </div>
        </div>
      </div>
    </div>
  )
}
function SummitScreen({ selectedWorld, selectedSummit, onSelectSummit, monthlyRecovered }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; onSelectSummit: (summitId: string) => void; monthlyRecovered: number }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Sommet</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Choisissez votre sommet.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59635C] sm:text-base">Sommet fort = attraction forte. Le sommet justifie toute la progression.</p>

        <div className="mt-6 grid gap-4">
          {selectedWorld.summits.map((summit) => {
            const isActive = summit.id === selectedSummit.id
            return (
              <button className={["rounded-[1.45rem] border p-5 text-left transition-all", isActive ? "border-[#173A2E] bg-[linear-gradient(180deg,#EEF3EC_0%,#E8EFE7_100%)] shadow-[0_18px_40px_-34px_rgba(23,58,46,0.55)]" : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#B8C4B8] hover:bg-[#FAF8F1]"].join(" ")} key={summit.id} onClick={() => onSelectSummit(summit.id)} type="button">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{summit.visibilityLabel}</p>
                    <p className="mt-2 font-serif text-3xl text-[#173A2E]">{summit.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[#556159]">{summit.promise}</p>
                  </div>
                  <div className="rounded-full border border-[#D8DED4] bg-[#FFFEFA] px-4 py-2 text-sm font-medium text-[#173A2E]">{formatEuro(summit.annualCost)} / an</div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#D8DED4] bg-[#FBFCF8] p-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#6D776F]">Effet social</p>
                    <p className="mt-2 text-sm text-[#203B31]">{summit.socialLiftLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-[#D8DED4] bg-[#FBFCF8] p-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#6D776F]">Narration</p>
                    <p className="mt-2 text-sm text-[#203B31]">{summit.note}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <WalletPassPreview activeDots={5} businessLabel={selectedWorld.label} caption="Client voit sommet proche." footerLabel="GRAND DIAMOND" notificationLabel={`Sommet: ${selectedSummit.promise}`} progressDots={6} rewardLabel={selectedSummit.promise} statusLabel="Sommet" />

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Impact sommet</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetricCard label="Revenu" value={formatEuro(monthlyRecovered)} note="recuperable / mois" />
            <MiniMetricCard label="Effet" value={selectedSummit.socialLiftLabel} note="propagation" />
            <MiniMetricCard label="Type" value={selectedSummit.visibilityLabel} note="visibilite" />
          </div>
          <p className="mt-4 text-sm leading-7 text-[#556159]">Sommet justifie progression complete.</p>
        </Card>
      </div>
    </div>
  )
}

function SeasonScreen({ selectedSeason, onSelectSeason, selectedSeasonMode, selectedSummit, monthlyRecovered, activePaths }: { selectedSeason: SeasonLength; onSelectSeason: (season: SeasonLength) => void; selectedSeasonMode: (typeof seasonModes)[number]; selectedSummit: SummitOption; monthlyRecovered: number; activePaths: number }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Duree saison</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Choisissez la duree.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59635C] sm:text-base">Saison limitee = valeur carte. Preuve saison 1 = vente saison 2.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {seasonModes.map((mode) => {
            const isActive = mode.months === selectedSeason
            return (
              <button className={["rounded-[1.45rem] border p-5 text-left transition-all", isActive ? "border-[#173A2E] bg-[linear-gradient(180deg,#EEF3EC_0%,#E8EFE7_100%)] shadow-[0_18px_40px_-34px_rgba(23,58,46,0.55)]" : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#B8C4B8] hover:bg-[#FAF8F1]"].join(" ")} key={mode.months} onClick={() => onSelectSeason(mode.months)} type="button">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{mode.months} mois</p>
                <p className="mt-2 font-serif text-3xl text-[#173A2E]">{mode.title}</p>
                <p className="mt-3 text-sm leading-7 text-[#556159]">{mode.description}</p>
                <div className="mt-4 space-y-2 text-sm text-[#203B31]">
                  <p>{mode.selectiveCards} cartes selectives max</p>
                  <p>{mode.massCards} cartes masse max</p>
                </div>
                <p className="mt-4 text-xs leading-6 text-[#6D776F]">{mode.note}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Progression</p>
          <h4 className="mt-3 font-serif text-3xl text-[#173A2E]">{selectedSeasonMode.momentum}</h4>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Sommet fixe: <strong className="font-medium text-[#173A2E]">{selectedSummit.promise}</strong></p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <MiniMetricCard label="Revenu" value={formatEuro(monthlyRecovered)} note="par mois" />
          <MiniMetricCard label="Parcours" value={`${activePaths}`} note="actifs potentiels" />
          <MiniMetricCard label="Duree" value={`${selectedSeasonMode.months} mois`} note="cycle complet" />
        </div>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Mecanique</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Cartes limitees → progression mesuree → preuve terrain → saison 2 justifiee.</p>
        </Card>
      </div>
    </div>
  )
}

function CheckmateScreen({ selectedWorld, selectedSummit, selectedSeason, seasonValue, monthlyRecovered, activePaths, dominoMultiplier, seasonCards, trustScore }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; selectedSeason: SeasonLength; seasonValue: number; monthlyRecovered: number; activePaths: number; dominoMultiplier: string; seasonCards: { selective: number; mass: number }; trustScore: number }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Recapitulatif</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Revenu potentiel sur la saison.</h3>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#59635C] sm:text-base">Chiffres bases sur: retour client structure, propagation mesuree, sommet attracteur.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_0.1fr_1fr] xl:items-start">
        <Card className="border-[#C9B06D] bg-[linear-gradient(180deg,#FBF4DE_0%,#F5E8B9_100%)] p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A641D]">Sommet Cardin</p>
          <p className="mt-3 font-serif text-4xl text-[#4B3E12]">{formatEuro(selectedSummit.annualCost)}</p>
          <p className="mt-2 text-sm text-[#5D5223]">par an: {selectedSummit.promise.toLowerCase()}</p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[#5D5223]">
            <p>{selectedSeason} mois de presence.</p>
            <p>Trajectoire visible autres clients.</p>
            <p>Attracteur pour le lieu.</p>
          </div>
        </Card>

        <div className="hidden h-full items-center justify-center text-sm italic text-[#8B8F86] xl:flex">vs</div>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Pub classique</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">{formatEuro(selectedWorld.adSpend)}</p>
          <p className="mt-2 text-sm text-[#556159]">{selectedWorld.adDuration} attention</p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[#556159]">
            <p>Pas de carte.</p>
            <p>Pas de propagation.</p>
            <p>Pas de sommet durable.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Revenu</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">{formatEuro(monthlyRecovered)}</p>
          <p className="mt-2 text-sm leading-7 text-[#556159]">par mois → {formatEuro(seasonValue)} sur {selectedSeason} mois.</p>
        </Card>
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Propagation</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">x{dominoMultiplier}</p>
          <p className="mt-2 text-sm leading-7 text-[#556159]">{activePaths} parcours actifs via {seasonCards.selective} selective ou {seasonCards.mass} masse.</p>
        </Card>
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Systeme</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">{trustScore}%</p>
          <p className="mt-2 text-sm leading-7 text-[#556159]">Intensite systeme. Lieu gagne en presence.</p>
        </Card>
      </div>
    </div>
  )
}

function ActivateScreen({ selectedWorld, selectedSummit, selectedSeason, monthlyRecovered, seasonValue, activePaths, engineHref }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; selectedSeason: SeasonLength; monthlyRecovered: number; seasonValue: number; activePaths: number; engineHref: string }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Lancement</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Saison prete.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59635C] sm:text-base">Un lieu + un sommet + une duree = systeme complet. Client voit carte. Marchand lance machine.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Votre formule</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#203B31]">
              <p>{selectedWorld.label}</p>
              <p>{selectedSummit.title}</p>
              <p>{selectedSeason} mois</p>
              <p>{formatEuro(selectedWorld.installPrice)} d'installation</p>
              <p>{formatEuro(49)} / mois pendant la saison</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Ce qui est inclus</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#203B31]">
              <p>QR de comptoir pret sous 48h</p>
              <p>Dashboard marchand actif sous 48h</p>
              <p>Carte Apple Wallet / Google Wallet active sous 48h</p>
              <p>Espace marchand</p>
              <p>Cartes physiques expediees sous 7 a 10 jours ouvres</p>
              <p>Premiere saison calibree avec vous</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Objectif saison</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetricCard label="Revenu" value={formatEuro(monthlyRecovered)} note="par mois" />
            <MiniMetricCard label="Parcours" value={`${activePaths}`} note="actifs potentiels" />
            <MiniMetricCard label="Total" value={formatEuro(seasonValue)} note="sur saison" />
          </div>
          <p className="mt-4 text-sm leading-7 text-[#556159]">Saison 2 justifiee par preuve saison 1.</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Activation</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Paiement → activation digitale 48h → impression + envoi cartes physiques.</p>
          <div className="mt-4 rounded-2xl border border-[#D8DED4] bg-[#FBFCF8] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6D776F]">Delais</p>
            <p className="mt-2 text-sm leading-7 text-[#203B31]">Dashboard + wallet: 48h. Cartes physiques: 7-10 jours.</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex h-12 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-8 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href={STRIPE_PAYMENT_LINK} rel="noreferrer" target="_blank">
              Payer ma saison (490 EUR)
            </a>
            <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-8 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]" href={engineHref}>
              Configurer ensuite dans Cardin
            </Link>
            <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-8 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]" href="#top">
              Revoir depuis le debut
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

function MetricPill({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="rounded-2xl border border-[#DFDACC] bg-[#FFFEFA] px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#173A2E]">{value}</p>
      <p className="mt-1 text-xs text-[#6D776F]">{sublabel}</p>
    </div>
  )
}

function MiniMetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-[#E1DBCF] bg-[#FFFEFA] p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#6D776F]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#173A2E]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#6D776F]">{note}</p>
    </div>
  )
}

function EntryLaneCard({ lane }: { lane: EntryLane }) {
  return (
    <div className="rounded-[1.35rem] border border-[#D8DED4] bg-[#FBFCF8] p-5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">{lane.title}</p>
      <p className="mt-3 text-sm leading-7 text-[#203B31]">{lane.lead}</p>
      <div className="mt-4 space-y-2 text-sm text-[#556159]">
        {lane.steps.map((step) => (
          <p key={step}>{step}</p>
        ))}
      </div>
      <p className="mt-4 text-xs leading-6 text-[#6D776F]">{lane.outcome}</p>
    </div>
  )
}

function LawCard({ title, body }: { title: string; body: string }) {
  return (
    <Card className="p-5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#556159]">{body}</p>
    </Card>
  )
}





