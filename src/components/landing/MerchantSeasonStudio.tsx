"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { WalletPassPreview } from "@/components/engine/WalletPassPreview"
import { LANDING_PRICING, STRIPE_PAYMENT_LINK, type LandingWorldId } from "@/lib/landing-content"
import { SEASON_FRAME_BY_LANDING } from "@/lib/merchant-season-framing"
import { landingWorldToEngineTemplateId, type ParcoursSummitStyleId } from "@/lib/parcours-contract"
import { getProtocolMappingLabel, getSeasonRewardOption, getVerticalExplainerConfig } from "@/lib/vertical-explainer-config"
import { Button, Card } from "@/ui"

type WorldId = LandingWorldId
/** Offre actuelle : une seule saison calibrée (3 mois), alignée landing / moteur. */
type SeasonLength = 3

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

function StripePaymentNextSteps() {
  return (
    <p className="mt-3 max-w-prose text-xs leading-relaxed text-[#5B655E]">
      Après le paiement sur Stripe, revenez sur cet onglet ou suivez l&apos;e-mail de confirmation.{" "}
      <Link className="font-medium text-[#16372C] underline underline-offset-2" href="/apres-paiement">
        Que faire ensuite
      </Link>
      .
    </p>
  )
}

/** Merchant-facing step labels (adoption first; see `advancedEyebrow` in optional details). */
const screens: Array<{ id: ScreenId; label: string; advancedEyebrow: string }> = [
  { id: "world", label: "Lieu", advancedEyebrow: "Monde marchand" },
  { id: "system", label: "Clients", advancedEyebrow: "Entrée et trajectoire" },
  { id: "summit", label: "Récompense", advancedEyebrow: "Récompense saison · accès Diamond" },
  { id: "season", label: "Retour", advancedEyebrow: "Saison · déclencheurs et durée" },
  { id: "checkmate", label: "Résultat", advancedEyebrow: "Bilan · revenu et réseau" },
  { id: "activate", label: "Activation", advancedEyebrow: "Lancer la saison" },
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
    title: "Saison Cardin",
    description: "Cycle standard pour prouver le retour client et lancer la suite.",
    selectiveCards: 50,
    massCards: 200,
    note: "Seule offre saison pour l’instant : 3 mois calibrés avec vous.",
    momentum: "3 mois : activation, retour client, premiers Diamond.",
  },
]

const worlds: WorldDefinition[] = [
  {
    id: "cafe",
    label: "Café",
    eyebrow: "Volume et fréquence",
    hero: "Café : fréquence élevée, retour rapide.",
    intro: "Panier moyen 5-8 €. Passage quotidien ou hebdomadaire. Le système renforce la fréquence.",
    baselineMonthlyRecovered: 2000,
    baselineActivePaths: 150,
    baselineDominoMultiplier: 1.4,
    baselineTrust: 72,
    adSpend: 500,
    adDuration: "3 jours",
    installPrice: 300,
    basketLine: "Exemple récompense : 1 boisson signature par mois pendant 1 an.",
    proofLine: "Passage -> retour client -> réseau activé.",
    defaultSummitId: "signature-monthly",
    walletRewardLabel: "Projection de saison visible",
    walletNotification: "Votre statut évolue avec vos visites.",
    entry: {
      selective: {
        title: "Entrée sélective",
        lead: "Patron choisit 50 premières cartes.",
        steps: ["50 cartes max", "activation visite 1", "statut évolue visite 2"],
        outcome: "50 cartes -> 120 à 150 parcours actifs via réseau activé.",
      },
      mass: {
        title: "Entrée diffusion large",
        lead: "QR accessible, filtre par retour réel.",
        steps: ["200 cartes distribuées", "visite 1 = dormante", "visite 2 = activation"],
        outcome: "Filtre automatique: seuls les retours réels activent le système.",
      },
    },
    tiers: [
      { name: "Dormante", merchantOutcome: "La carte circule sans coût actif", socialRadius: "réseau inactif", heightClass: "h-14" },
      { name: "Active", merchantOutcome: "Premier retour visible", socialRadius: "réseau local", heightClass: "h-24" },
      { name: "Ancrée", merchantOutcome: "Le lieu devient un rendez-vous", socialRadius: "réseau local", heightClass: "h-36" },
      { name: "Diamond", merchantOutcome: "Invite 1 à 2 personnes max", socialRadius: "réseau activé", heightClass: "h-48", marker: "domino" },
      { name: "Récompense saison", merchantOutcome: "Récompense affichée pour tout le lieu", socialRadius: "réseau étendu", heightClass: "h-60", marker: "summit" },
    ],
    summits: [
      {
        id: "signature-monthly",
        title: "Signature mensuelle",
        promise: "1 boisson signature par mois pendant 1 an.",
        annualCost: 120,
        visibilityLabel: "Récompense affichée",
        socialLiftLabel: "attire sans sur-promettre",
        note: "Simple, lisible, rentable.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "duo-morning",
        title: "Duo du matin",
        promise: "1 duo signature par mois pour la récompense.",
        annualCost: 180,
        visibilityLabel: "Récompense amplifiée",
        socialLiftLabel: "réseau renforcé",
        note: "Pousse la venue a deux.",
        monthlyRecoveredBoost: 1.16,
        dominoBoost: 1.08,
        trustLift: 1.08,
      },
      {
        id: "hidden-cellar",
        title: "Privilege caché",
        promise: "Privilege non affiche, réservé à la récompense.",
        annualCost: 140,
        visibilityLabel: "Récompense sélective",
        socialLiftLabel: "désir discret",
        note: "Version mystérieuse.",
        monthlyRecoveredBoost: 1.08,
        dominoBoost: 1.03,
        trustLift: 1.05,
      },
    ],
  },
  {
    id: "bar",
    label: "Bar",
    eyebrow: "Soiree & comptoir",
    hero: "Bar : soiree structuree, retour de creneau.",
    intro: "Panier moyen 10-20 EUR. Frequence de soiree, reseau naturel, fenetres a activer sans promo ouverte.",
    baselineMonthlyRecovered: 3000,
    baselineActivePaths: 120,
    baselineDominoMultiplier: 1.45,
    baselineTrust: 73,
    adSpend: 700,
    adDuration: "3 jours",
    installPrice: 400,
    basketLine: "Exemple Diamond : 1 creation signature au bar par mois pendant 1 an.",
    proofLine: "Sortie -> retour de soiree -> groupe active.",
    defaultSummitId: "signature-monthly",
    walletRewardLabel: "Projection de saison soiree",
    walletNotification: "Votre acces de soiree evolue avec vos passages.",
    entry: {
      selective: {
        title: "Entree selective",
        lead: "Le lieu cible ses premiers habitues.",
        steps: ["60 cartes max", "activation visite 1", "statut evolue visite 2"],
        outcome: "60 cartes -> 100 a 120 parcours actifs via reseau du comptoir.",
      },
      mass: {
        title: "Entree diffusion large",
        lead: "QR au comptoir, filtre par retour reel.",
        steps: ["180 cartes distribuees", "visite 1 = dormante", "visite 2 = activation"],
        outcome: "Filtre automatique: seuls les vrais retours de soiree activent.",
      },
    },
    tiers: [
      { name: "Dormante", merchantOutcome: "Le lieu installe une promesse de soiree", socialRadius: "reseau inactif", heightClass: "h-14" },
      { name: "Active", merchantOutcome: "Le retour de semaine prend forme", socialRadius: "reseau local", heightClass: "h-24" },
      { name: "Ancree", merchantOutcome: "Le bar devient un rendez-vous", socialRadius: "reseau local", heightClass: "h-36" },
      { name: "Diamond", merchantOutcome: "Le privilege peut ouvrir un groupe ou un duo", socialRadius: "reseau active", heightClass: "h-48", marker: "domino" },
      { name: "Couche rare", merchantOutcome: "Les activations choisies rendent la soiree desirable", socialRadius: "reseau etendu", heightClass: "h-60", marker: "summit" },
    ],
    summits: [
      {
        id: "signature-monthly",
        title: "Creation du mois",
        promise: "1 cocktail ou creation signature au bar par mois pendant 1 an.",
        annualCost: 180,
        visibilityLabel: "Acces affiche",
        socialLiftLabel: "privilege de comptoir lisible",
        note: "Lisible, frequentable, sans promo large.",
        monthlyRecoveredBoost: 1.08,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "duo-soir",
        title: "Duo du soir",
        promise: "1 duo signature par mois pour le niveau Diamond.",
        annualCost: 220,
        visibilityLabel: "Fenetre de groupe",
        socialLiftLabel: "soiree et invitations renforcees",
        note: "Ouvre un moment a deux ou a plusieurs.",
        monthlyRecoveredBoost: 1.15,
        dominoBoost: 1.08,
        trustLift: 1.07,
      },
      {
        id: "hidden-bar",
        title: "Privilege comptoir",
        promise: "Privilege reserve et non affiche pour les meilleurs clients.",
        annualCost: 160,
        visibilityLabel: "Selection rare",
        socialLiftLabel: "tension sociale conservee",
        note: "Version discrete, tres choisie.",
        monthlyRecoveredBoost: 1.06,
        dominoBoost: 1.03,
        trustLift: 1.05,
      },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    eyebrow: "Panier moyen élevé",
    hero: "Restaurant : panier 40-60 €, retour espacé.",
    intro: "Fréquence mensuelle ou bimestrielle. Table et invitation. Le système structure le retour entre deux services.",
    baselineMonthlyRecovered: 3800,
    baselineActivePaths: 135,
    baselineDominoMultiplier: 1.5,
    baselineTrust: 76,
    adSpend: 800,
    adDuration: "3 jours",
    installPrice: 500,
    basketLine: "Exemple récompense : 1 repas signature par mois pendant 1 an.",
    proofLine: "Table -> retour client -> réseau activé par invitation.",
    defaultSummitId: "table-monthly",
    walletRewardLabel: "Projection de saison table",
    walletNotification: "Votre statut évolue avec vos visites.",
    entry: {
      selective: {
        title: "Entrée sélective",
        lead: "Patron choisit 80 premières cartes.",
        steps: ["80 cartes max", "activation visite 1", "statut évolue visite 2"],
        outcome: "80 cartes → 110 à 135 parcours actifs via invitation.",
      },
      mass: {
        title: "Entrée diffusion large",
        lead: "QR sur table, filtre par retour réel.",
        steps: ["200 cartes distribuées", "visite 1 = dormante", "visite 2 = activation"],
        outcome: "Filtre automatique: seules les tables qui reviennent activent.",
      },
    },
    tiers: [
      { name: "Dormante", merchantOutcome: "La carte installe la curiosité", socialRadius: "réseau inactif", heightClass: "h-14" },
      { name: "Active", merchantOutcome: "Retour entre deux repas", socialRadius: "réseau local", heightClass: "h-28" },
      { name: "Ancrée", merchantOutcome: "Le client guette son moment réservé", socialRadius: "réseau local", heightClass: "h-40" },
      { name: "Diamond", merchantOutcome: "Invite 1 à 2 tables dans la saison", socialRadius: "réseau activé", heightClass: "h-52", marker: "domino" },
      { name: "Récompense saison", merchantOutcome: "La récompense rend la table désirable", socialRadius: "réseau étendu", heightClass: "h-64", marker: "summit" },
    ],
    summits: [
      {
        id: "table-monthly",
        title: "Table mensuelle",
        promise: "1 repas signature par mois pendant 1 an.",
        annualCost: 600,
        visibilityLabel: "Récompense affichée",
        socialLiftLabel: "table méritée",
        note: "Un repas mensuel = ambassadeur 12 mois.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "chef-table",
        title: "Table du chef",
        promise: "Table chef réservée une fois par mois.",
        annualCost: 720,
        visibilityLabel: "Récompense amplifiée",
        socialLiftLabel: "pousse retours et invitations",
        note: "Rare, raconte, histoire.",
        monthlyRecoveredBoost: 1.18,
        dominoBoost: 1.1,
        trustLift: 1.08,
      },
      {
        id: "secret-menu",
        title: "Menu secret",
        promise: "Privilege caché réservé à la récompense.",
        annualCost: 480,
        visibilityLabel: "Récompense sélective",
        socialLiftLabel: "désir et mystere",
        note: "Mystere plutot qu'affichage.",
        monthlyRecoveredBoost: 1.07,
        dominoBoost: 1.03,
        trustLift: 1.05,
      },
    ],
  },
  {
    id: "beaute",
    label: "Beauté",
    eyebrow: "Valeur et sélection",
    hero: "Beauté : valeur client élevée, retour plus sélectif.",
    intro: "Panier moyen 50-80 €. Fréquence mensuelle ou bimestrielle. Sélection qualitative, réseau activé par confiance.",
    baselineMonthlyRecovered: 2600,
    baselineActivePaths: 110,
    baselineDominoMultiplier: 1.3,
    baselineTrust: 81,
    adSpend: 600,
    adDuration: "3 jours",
    installPrice: 300,
    basketLine: "Exemple récompense : 1 soin signature par mois pendant 1 an.",
    proofLine: "Cycle -> retour client -> réseau activé par recommandation.",
    defaultSummitId: "cut-monthly",
    walletRewardLabel: "Projection de saison cycle",
    walletNotification: "Votre statut évolue avec votre cycle.",
    entry: {
      selective: {
        title: "Entrée sélective",
        lead: "Salon choisit 50 clientes cibles.",
        steps: ["50 cartes max", "activation visite 1", "statut évolue visite 2"],
        outcome: "50 cartes → 90 à 110 parcours via recommandation.",
      },
      mass: {
        title: "Entrée diffusion large",
        lead: "QR à l'accueil, filtre par cycle réel.",
        steps: ["150 cartes distribuées", "visite 1 = dormante", "visite 2 = activation"],
        outcome: "Filtre automatique: seuls les cycles réels activent.",
      },
    },
    tiers: [
      { name: "Dormante", merchantOutcome: "La carte installe une attente", socialRadius: "réseau inactif", heightClass: "h-14" },
      { name: "Active", merchantOutcome: "Le prochain rendez-vous se rapproche", socialRadius: "réseau local", heightClass: "h-28" },
      { name: "Ancrée", merchantOutcome: "Le lieu devient son rythme", socialRadius: "réseau local", heightClass: "h-40" },
      { name: "Diamond", merchantOutcome: "Invite 1 à 2 personnes max", socialRadius: "réseau activé", heightClass: "h-52", marker: "domino" },
      { name: "Récompense saison", merchantOutcome: "La récompense stabilise la recommandation", socialRadius: "réseau étendu", heightClass: "h-64", marker: "summit" },
    ],
    summits: [
      {
        id: "cut-monthly",
        title: "Soin mensuel",
        promise: "1 soin signature par mois pendant 1 an.",
        annualCost: 300,
        visibilityLabel: "Récompense affichée",
        socialLiftLabel: "statut visible",
        note: "Récompense classique salon/institut.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "ritual-duo",
        title: "Soin duo",
        promise: "1 privilege duo mensuel pour la récompense.",
        annualCost: 420,
        visibilityLabel: "Récompense amplifiée",
        socialLiftLabel: "réseau renforcé",
        note: "Recommandation en rendez-vous réel.",
        monthlyRecoveredBoost: 1.15,
        dominoBoost: 1.08,
        trustLift: 1.08,
      },
      {
        id: "private-ritual",
        title: "Accès privé",
        promise: "Privilege non affiche réservé à la récompense.",
        annualCost: 260,
        visibilityLabel: "Récompense sélective",
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
    intro: "Panier moyen 80-150 €. Fréquence faible, valeur élevée. Collection et statut, pas volume.",
    baselineMonthlyRecovered: 2200,
    baselineActivePaths: 95,
    baselineDominoMultiplier: 1.25,
    baselineTrust: 74,
    adSpend: 700,
    adDuration: "3 jours",
    installPrice: 500,
    basketLine: "Exemple récompense : 100 € collection par mois pendant 1 an.",
    proofLine: "Désir → trajectoire client → accès exclusif.",
    defaultSummitId: "collection-credit",
    walletRewardLabel: "Projection de saison collection",
    walletNotification: "Votre accès évolue avec votre trajectoire.",
    entry: {
      selective: {
        title: "Entrée sélective",
        lead: "Boutique choisit 60 clientes cibles.",
        steps: ["60 cartes max", "activation visite 1", "statut évolue visite 2"],
        outcome: "60 cartes → 80 à 95 parcours via désir et style.",
      },
      mass: {
        title: "Entrée diffusion large",
        lead: "QR en boutique, filtre par retour réel.",
        steps: ["180 cartes distribuées", "visite 1 = dormante", "visite 2 = activation"],
        outcome: "Filtre automatique: seules les clientes qui reviennent activent.",
      },
    },
    tiers: [
      { name: "Dormante", merchantOutcome: "La carte installe une promesse", socialRadius: "réseau inactif", heightClass: "h-14" },
      { name: "Active", merchantOutcome: "Le retour prend forme", socialRadius: "réseau local", heightClass: "h-24" },
      { name: "Ancrée", merchantOutcome: "Le style du lieu devient un repère", socialRadius: "réseau local", heightClass: "h-36" },
      { name: "Diamond", merchantOutcome: "Invite 1 à 2 personnes max", socialRadius: "réseau activé", heightClass: "h-48", marker: "domino" },
      { name: "Récompense saison", merchantOutcome: "La récompense rend la collection désirable", socialRadius: "réseau étendu", heightClass: "h-60", marker: "summit" },
    ],
    summits: [
      {
        id: "collection-credit",
        title: "Credit collection",
        promise: "100 € collection par mois pendant 1 an.",
        annualCost: 1200,
        visibilityLabel: "Récompense affichée",
        socialLiftLabel: "désir net clientele",
        note: "Simple, fort a raconter.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "rare-drop",
        title: "Drop mensuel",
        promise: "Accès prioritaire pièce réservée chaque mois.",
        annualCost: 800,
        visibilityLabel: "Récompense amplifiée",
        socialLiftLabel: "désir et partage",
        note: "Montee clientele sans remise.",
        monthlyRecoveredBoost: 1.14,
        dominoBoost: 1.08,
        trustLift: 1.07,
      },
      {
        id: "private-piece",
        title: "Piece cachée",
        promise: "Pièce ou accès caché réservé à la récompense.",
        annualCost: 650,
        visibilityLabel: "Récompense sélective",
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
  return `/engine?template=${landingWorldToEngineTemplateId(worldId)}&season=${season}&summit=${summitId}`
}

function getSummitStyleId(world: WorldDefinition, summitId: string): ParcoursSummitStyleId {
  const index = world.summits.findIndex((summit) => summit.id === summitId)
  if (index === 1) return "stronger"
  if (index === 2) return "discreet"
  return "visible"
}

export function MerchantSeasonStudio() {
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>("cafe")
  const selectedSeason: SeasonLength = 3
  const [selectedSummitId, setSelectedSummitId] = useState(worlds[0].defaultSummitId)
  const [screenIndex, setScreenIndex] = useState(0)
  const [showAdvancedSteps, setShowAdvancedSteps] = useState(false)

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

  const monthlyRecovered = Math.round(selectedWorld.baselineMonthlyRecovered * selectedSummit.monthlyRecoveredBoost)
  const activePaths = Math.round(selectedWorld.baselineActivePaths)
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
      <div className="rounded-[2rem] border border-[#DED7CA] bg-[linear-gradient(180deg,#FFFDF8_0%,#F5F1E8_100%)] p-4 shadow-[0_28px_90px_-54px_rgba(21,47,37,0.38)] sm:p-6 lg:p-10">
        <div className="flex flex-col gap-6 border-b border-[#E3DDD0] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#667067]">Simulateur</p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.02] text-[#173328] sm:text-5xl lg:text-6xl">
              Voyez le revenu récupérable selon votre lieu.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#556159] sm:text-base">
              Ajustez le type de commerce : Cardin estime l’impact sur le revenu, le réseau et l’affluence (saison 3 mois).
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6B756E] sm:text-base">
              Simulation basée sur votre activité. Ajustable selon votre réalité.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <MetricPill label="Revenu" value={formatEuro(monthlyRecovered)} sublabel="revenu récupérable / mois" />
            <MetricPill label="Réseau" value={`×${dominoMultiplier}`} sublabel="effet domino activé" />
            <MetricPill label="Affluence" value={`${trustScore}%`} sublabel="niveau d'affluence générée" />
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-[#E3DDD0] bg-[#FFFCF7] p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#667067]">Comment ça fonctionne</p>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#2A3F35] sm:text-base">
            <li>Les clients passent</li>
            <li>Vous validez</li>
            <li>Le système crée du retour</li>
            <li>Les clients reviennent</li>
            <li>Vous récupérez du revenu</li>
          </ul>
          <details className="mt-5 border-t border-[#E8E2D6] pt-4">
            <summary className="cursor-pointer text-sm font-medium text-[#173A2E] underline-offset-4 hover:underline">
              Voir la logique complète (saison, récompense, trajectoire)
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-[#5B655E]">
              Cardin structure une <strong className="font-medium text-[#173A2E]">saison</strong> limitée, une <strong className="font-medium text-[#173A2E]">récompense majeure</strong> visible et une <strong className="font-medium text-[#173A2E]">couche Diamond</strong> qui filtre l'éligibilité et les privilèges. Ce niveau de détail devient utile une fois le principe compris.
            </p>
          </details>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Parcours du simulateur</p>
          <button
            className="text-xs font-medium text-[#173A2E] underline-offset-4 hover:underline"
            onClick={() => setShowAdvancedSteps((v) => !v)}
            type="button"
          >
            {showAdvancedSteps ? "Masquer les noms internes" : "Afficher les noms internes"}
          </button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-6">
          {screens.map((screen, index) => {
            const isActive = index === screenIndex
            const isDone = index < screenIndex

            return (
              <button
                className={[
                  "rounded-2xl border px-3 py-3 text-left transition",
                  isActive
                    ?"border-[#173A2E] bg-[#EEF3EC] shadow-[0_14px_32px_-28px_rgba(23,58,46,0.6)]"
                    : isDone
                      ?"border-[#D6DCD2] bg-[#F7F4ED]"
                      : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#C5CFC2]",
                ].join(" ")}
                key={screen.id}
                onClick={() => setScreenIndex(index)}
                type="button"
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736B]">
                  {showAdvancedSteps ? screen.advancedEyebrow : `Étape ${index + 1}`}
                </p>
                <p className="mt-1 text-sm font-medium text-[#173A2E]">
                  {index + 1}. {screen.label}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-6 min-h-[640px] rounded-[1.9rem] border border-[#E3DDD0] bg-[#FFFEFA] p-4 sm:p-6 lg:min-h-[720px] lg:p-8">
          {screenIndex === 0 ?(
            <WorldScreen monthlyRecovered={monthlyRecovered} onSelectWorld={setSelectedWorldId} selectedWorld={selectedWorld} />
          ) : null}

          {screenIndex === 1 ?(
            <SystemScreen activePaths={activePaths} dominoMultiplier={dominoMultiplier} selectedWorld={selectedWorld} selectedSummit={selectedSummit} />
          ) : null}

          {screenIndex === 2 ?(
            <SummitScreen monthlyRecovered={monthlyRecovered} onSelectSummit={setSelectedSummitId} selectedSummit={selectedSummit} selectedWorld={selectedWorld} />
          ) : null}
          {screenIndex === 3 ?(
            <SeasonScreen activePaths={activePaths} monthlyRecovered={monthlyRecovered} selectedSeasonMode={selectedSeasonMode} selectedSummit={selectedSummit} selectedWorld={selectedWorld} />
          ) : null}

          {screenIndex === 4 ?(
            <CheckmateScreen activePaths={activePaths} dominoMultiplier={dominoMultiplier} monthlyRecovered={monthlyRecovered} seasonCards={seasonCards} seasonValue={seasonValue} selectedSeason={selectedSeason} selectedSummit={selectedSummit} selectedWorld={selectedWorld} trustScore={trustScore} />
          ) : null}

          {screenIndex === 5 ?(
            <ActivateScreen activePaths={activePaths} engineHref={engineHref} monthlyRecovered={monthlyRecovered} selectedSeason={selectedSeason} selectedSummit={selectedSummit} selectedWorld={selectedWorld} seasonValue={seasonValue} />
          ) : null}
        </div>

        <div className="mt-6 space-y-3 border-t border-[#E3DDD0] pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[#5B655E]">
              {screens[screenIndex].label}
              {showAdvancedSteps ? ` · ${screens[screenIndex].advancedEyebrow}` : ""} · {selectedWorld.label} · {selectedSeason} mois
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {canGoBack ?(
                <Button onClick={() => setScreenIndex((value) => Math.max(0, value - 1))} size="md" variant="subtle">
                  Retour
                </Button>
              ) : null}
              {canGoNext ?(
                <Button onClick={() => setScreenIndex((value) => Math.min(screens.length - 1, value + 1))} size="md" variant="primary">
                  Continuer
                </Button>
              ) : (
                <a className="inline-flex h-11 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href={STRIPE_PAYMENT_LINK} rel="noreferrer" target="_blank">
                  {LANDING_PRICING.activationLabel}
                </a>
              )}
            </div>
          </div>
          {!canGoNext ? <StripePaymentNextSteps /> : null}
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
          Chaque lieu a sa logique : fréquence, panier moyen, retour client et réseau.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {worlds.map((world) => {
            const isActive = world.id === selectedWorld.id
            return (
              <button className={["rounded-[1.4rem] border p-5 text-left transition-all", isActive ?"border-[#173A2E] bg-[linear-gradient(180deg,#EEF3EC_0%,#E6EEE7_100%)] shadow-[0_18px_40px_-34px_rgba(23,58,46,0.55)]" : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#B8C4B8] hover:bg-[#FAF8F1]"].join(" ")} key={world.id} onClick={() => onSelectWorld(world.id)} type="button">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6C766E]">{world.eyebrow}</p>
                <p className="mt-2 font-serif text-2xl text-[#173A2E]">{world.label}</p>
                <p className="mt-2 text-sm leading-6 text-[#556159]">{world.intro}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[linear-gradient(180deg,#F8F7F0_0%,#EEF2EA_100%)] p-6 shadow-[0_22px_48px_-38px_rgba(23,58,46,0.28)]">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#637067]">Métriques de base</p>
        <h4 className="mt-3 font-serif text-4xl leading-tight text-[#173A2E]">{selectedWorld.hero}</h4>
        <p className="mt-4 text-sm leading-7 text-[#556159]">{selectedWorld.proofLine}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MiniMetricCard label="Revenu" value={formatEuro(monthlyRecovered)} note="revenu récupérable / mois" />
          <MiniMetricCard label="Parcours" value={`${selectedWorld.baselineActivePaths}`} note="actifs potentiels" />
          <MiniMetricCard label="Affluence" value={`${selectedWorld.baselineTrust}%`} note="niveau du lieu" />
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-[#D8DED4] bg-[#FFFEFA] p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Mécanique</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">
            Le client voit une vraie récompense de saison, reçoit de petits déclencheurs au bon moment et remonte vers Diamond si le comportement suit.
          </p>
        </div>
      </div>
    </div>
  )
}

function SystemScreen({ selectedWorld, selectedSummit, activePaths, dominoMultiplier }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; activePaths: number; dominoMultiplier: string }) {
  const explainer = getVerticalExplainerConfig(selectedWorld.id)
  const rewardCopy = getSeasonRewardOption(selectedWorld.id, selectedSummit.id)
  const summitMode = explainer.summitModes[getSummitStyleId(selectedWorld, selectedSummit.id)]
  const roleChart = selectedWorld.tiers.map((tier, index) => {
    if (index === 0) return tier
    const role = explainer.roleProgressionSummary.steps[Math.min(index - 1, explainer.roleProgressionSummary.steps.length - 1)]
    return {
      ...tier,
      name: role.label,
      merchantOutcome: role.meaning,
      socialRadius: index === selectedWorld.tiers.length - 1 ? explainer.diamondMeaning.title : tier.socialRadius,
    }
  })

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Vos clients</p>
          <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Ce que le client veut, ce qu'il gagne, ce qui vous rapporte.</h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#59635C] sm:text-base">{explainer.merchantExplanationCopy.whatMechanicsDo}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <MiniMetricCard label="Parcours actifs" value={String(activePaths)} note="si la saison prend" />
          <MiniMetricCard label="Réseau" value={"x" + dominoMultiplier} note="propagation plafonnée" />
          <MiniMetricCard label="Récompense" value={summitMode.badge} note="intensité choisie" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[1.5rem] border border-[#E2DDD1] bg-[#FFFDF8] p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Deux modes d'entrée</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <EntryLaneCard lane={selectedWorld.entry.selective} />
            <EntryLaneCard lane={selectedWorld.entry.mass} />
          </div>
        </div>

        <WalletPassPreview
          activeDots={4}
          businessLabel={selectedWorld.label}
          caption={explainer.seasonReward.title}
          footerLabel="SAISON CARDIN"
          notificationLabel={rewardCopy?.promise ?? selectedSummit.promise}
          progressDots={6}
          rewardLabel={rewardCopy?.title ?? selectedSummit.title}
          statusLabel={explainer.roleProgressionSummary.steps[1]?.label ?? "Active"}
        />
      </div>

      <div className="rounded-[1.5rem] border border-[#E2DDD1] bg-[#FFFDF8] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Progression des rôles</p>
            <h4 className="mt-2 font-serif text-3xl text-[#173A2E]">Diamond = comportement reconnu = revenu mieux cadré.</h4>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#556159]">{explainer.merchantExplanationCopy.whatDiamondMeans}</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.35rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
            <div className="flex items-end gap-3 overflow-x-auto pb-2">
              {roleChart.map((tier) => (
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

          <div className="grid gap-3 sm:grid-cols-2">
            {explainer.roleProgressionSummary.steps.map((step) => (
              <Card className="p-4" key={step.label}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#6D776F]">Rôle</p>
                <p className="mt-2 text-sm font-medium text-[#173A2E]">{step.label}</p>
                <p className="mt-2 text-sm leading-6 text-[#556159]">{step.meaning}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummitScreen({ selectedWorld, selectedSummit, onSelectSummit, monthlyRecovered }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; onSelectSummit: (summitId: string) => void; monthlyRecovered: number }) {
  const explainer = getVerticalExplainerConfig(selectedWorld.id)
  const selectedMode = explainer.summitModes[getSummitStyleId(selectedWorld, selectedSummit.id)]
  const selectedReward = getSeasonRewardOption(selectedWorld.id, selectedSummit.id)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Récompense de saison + Diamond</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">La saison montre le gain majeur. Diamond contrôle l'accès.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59635C] sm:text-base">{explainer.merchantExplanationCopy.rewardVsDiamond}</p>

        <div className="mt-5 rounded-[1.4rem] border border-[#E2DDD1] bg-[#FFFEFA] p-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#6D776F]">Lecture métier</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">{explainer.seasonReward.merchantFraming}</p>
        </div>

        <div className="mt-6 grid gap-4">
          {selectedWorld.summits.map((summit) => {
            const mode = explainer.summitModes[getSummitStyleId(selectedWorld, summit.id)]
            const rewardCopy = getSeasonRewardOption(selectedWorld.id, summit.id)
            const isActive = summit.id === selectedSummit.id
            return (
              <button className={["rounded-[1.45rem] border p-5 text-left transition-all", isActive ? "border-[#173A2E] bg-[linear-gradient(180deg,#EEF3EC_0%,#E8EFE7_100%)] shadow-[0_18px_40px_-34px_rgba(23,58,46,0.55)]" : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#B8C4B8] hover:bg-[#FAF8F1]"].join(" ")} key={summit.id} onClick={() => onSelectSummit(summit.id)} type="button">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{mode.badge}</p>
                    <p className="mt-2 font-serif text-3xl text-[#173A2E]">{rewardCopy?.title ?? summit.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[#556159]">{rewardCopy?.merchantMeaning ?? mode.title}</p>
                  </div>
                  <div className="rounded-full border border-[#D8DED4] bg-[#FFFEFA] px-4 py-2 text-sm font-medium text-[#173A2E]">{formatEuro(summit.annualCost)} / an</div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#D8DED4] bg-[#FBFCF8] p-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#6D776F]">Récompense visible</p>
                    <p className="mt-2 text-sm text-[#203B31]">{rewardCopy?.promise ?? summit.promise}</p>
                  </div>
                  <div className="rounded-2xl border border-[#D8DED4] bg-[#FBFCF8] p-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#6D776F]">Effet de mode</p>
                    <p className="mt-2 text-sm text-[#203B31]">{mode.summary}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-[#556159]">{mode.merchantMeaning}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <WalletPassPreview activeDots={5} businessLabel={selectedWorld.label} caption={explainer.seasonReward.title} footerLabel="DIAMOND" notificationLabel={selectedReward?.promise ?? selectedSummit.promise} progressDots={6} rewardLabel={selectedReward?.title ?? selectedSummit.title} statusLabel={selectedMode.badge} />

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Impact récompense</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetricCard label="Revenu" value={formatEuro(monthlyRecovered)} note="revenu récupérable / mois" />
            <MiniMetricCard label="Mode" value={selectedMode.badge} note="intensité choisie" />
            <MiniMetricCard label="Moteur" value={selectedMode.engineEffect} note="effet principal" />
          </div>
          <p className="mt-4 text-sm leading-7 text-[#556159]">{explainer.merchantExplanationCopy.revenueConnection}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedMode.protocolMapping.map((mapping) => (
              <span className="rounded-full border px-2.5 py-1 text-[11px] text-[#556159]" key={mapping}>
                {getProtocolMappingLabel(mapping)}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-[#6D776F]">{explainer.merchantExplanationCopy.budgetConstraint}</p>
        </Card>
      </div>
    </div>
  )
}

function SeasonScreen({ selectedWorld, selectedSeasonMode, selectedSummit, monthlyRecovered, activePaths }: { selectedWorld: WorldDefinition; selectedSeasonMode: (typeof seasonModes)[number]; selectedSummit: SummitOption; monthlyRecovered: number; activePaths: number }) {
  const explainer = getVerticalExplainerConfig(selectedWorld.id)
  const selectedReward = getSeasonRewardOption(selectedWorld.id, selectedSummit.id)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Retour sur la durée</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Une saison courte, des retours concrets.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59635C] sm:text-base">
          La récompense majeure crée le désir. Les petits déclencheurs gardent la trajectoire vivante. La fenêtre courte rend le tout crédible et défendable.
        </p>

        <div className="mt-6 rounded-[1.45rem] border border-[#173A2E] bg-[linear-gradient(180deg,#EEF3EC_0%,#E8EFE7_100%)] p-5 shadow-[0_18px_40px_-34px_rgba(23,58,46,0.55)]">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{selectedSeasonMode.months} mois</p>
          <p className="mt-2 font-serif text-3xl text-[#173A2E]">{selectedSeasonMode.title}</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">{selectedSeasonMode.description}</p>
          <div className="mt-4 space-y-2 text-sm text-[#203B31]">
            <p>{selectedSeasonMode.selectiveCards} cartes sélectives max</p>
            <p>{selectedSeasonMode.massCards} cartes diffusion large max</p>
          </div>
          <p className="mt-4 text-xs leading-6 text-[#6D776F]">{explainer.merchantExplanationCopy.budgetConstraint}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Projection de saison</p>
          <h4 className="mt-3 font-serif text-3xl text-[#173A2E]">{selectedSeasonMode.momentum}</h4>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Récompense choisie : <strong className="font-medium text-[#173A2E]">{selectedReward?.promise ?? selectedSummit.promise}</strong></p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <MiniMetricCard label="Revenu" value={formatEuro(monthlyRecovered)} note="par mois" />
          <MiniMetricCard label="Parcours" value={`${activePaths}`} note="retours potentiels" />
          <MiniMetricCard label="Durée" value={`${selectedSeasonMode.months} mois`} note="cycle complet" />
        </div>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Mécanique</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">{explainer.merchantExplanationCopy.whatMechanicsDo}</p>
        </Card>
      </div>
    </div>
  )
}

function CheckmateScreen({ selectedWorld, selectedSummit, selectedSeason, seasonValue, monthlyRecovered, activePaths, dominoMultiplier, seasonCards, trustScore }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; selectedSeason: SeasonLength; seasonValue: number; monthlyRecovered: number; activePaths: number; dominoMultiplier: string; seasonCards: { selective: number; mass: number }; trustScore: number }) {
  const seasonFrame = SEASON_FRAME_BY_LANDING[selectedWorld.id]
  const explainer = getVerticalExplainerConfig(selectedWorld.id)
  const selectedReward = getSeasonRewardOption(selectedWorld.id, selectedSummit.id)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Récapitulatif</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Revenu potentiel sur la saison.</h3>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#59635C] sm:text-base">La récompense de saison crée le désir, les petits déclencheurs créent le retour, Diamond augmente la valeur et le modèle reste borné.</p>
        <div className="mt-5 max-w-3xl rounded-2xl border border-[#173A2E]/15 bg-[linear-gradient(165deg,#F4F1EA_0%,#E8EDE4_100%)] px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#355246]">Cadrage marché · machine active</p>
          <p className="mt-2 font-serif text-2xl text-[#173A2E] sm:text-3xl">{seasonFrame.heroBand}</p>
          <p className="mt-2 text-sm font-medium text-[#2A3F35]">{seasonFrame.calibratedSubline}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_0.1fr_1fr] lg:items-start">
        <Card className="border-[#C9B06D] bg-[linear-gradient(180deg,#FBF4DE_0%,#F5E8B9_100%)] p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A641D]">Récompense de saison</p>
          <p className="mt-3 font-serif text-4xl text-[#4B3E12]">{formatEuro(selectedSummit.annualCost)}</p>
          <p className="mt-2 text-sm text-[#5D5223]">par an : {(selectedReward?.promise ?? selectedSummit.promise).toLowerCase()}</p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[#5D5223]">
            <p>{selectedSeason} mois de présence.</p>
            <p>La récompense se voit, Diamond filtre l'accès.</p>
            <p>Le lieu garde une promesse forte sans promo ouverte.</p>
          </div>
        </Card>

        <div className="hidden h-full items-center justify-center text-sm italic text-[#8B8F86] lg:flex">vs</div>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Publicité classique</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">{formatEuro(selectedWorld.adSpend)}</p>
          <p className="mt-2 text-sm text-[#556159]">{selectedWorld.adDuration} attention</p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[#556159]">
            <p>Pas de carte.</p>
            <p>Pas de propagation activée.</p>
            <p>Pas de raison durable de revenir.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Revenu</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">{formatEuro(monthlyRecovered)}</p>
          <p className="mt-2 text-sm leading-7 text-[#556159]">par mois, soit {formatEuro(seasonValue)} sur {selectedSeason} mois.</p>
        </Card>
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Réseau</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">×{dominoMultiplier}</p>
          <p className="mt-2 text-sm leading-7 text-[#556159]">{activePaths} parcours actifs via {seasonCards.selective} cartes sélectives ou {seasonCards.mass} cartes en diffusion large.</p>
        </Card>
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Système</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">{trustScore}%</p>
          <p className="mt-2 text-sm leading-7 text-[#556159]">{explainer.merchantExplanationCopy.revenueConnection}</p>
        </Card>
      </div>
    </div>
  )
}

function ActivateScreen({ selectedWorld, selectedSummit, selectedSeason, monthlyRecovered, seasonValue, activePaths, engineHref }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; selectedSeason: SeasonLength; monthlyRecovered: number; seasonValue: number; activePaths: number; engineHref: string }) {
  const explainer = getVerticalExplainerConfig(selectedWorld.id)
  const selectedReward = getSeasonRewardOption(selectedWorld.id, selectedSummit.id)

  const offerItems = [
    selectedWorld.label,
    selectedReward?.title ?? selectedSummit.title,
    `${selectedSeason} mois`,
    `${formatEuro(LANDING_PRICING.activationFee)} pour la saison (${LANDING_PRICING.seasonLengthMonths} mois)`,
    LANDING_PRICING.recurringLabel,
  ]

  const activationItems = [
    'QR de comptoir prêt sous 48 h',
    'Tableau marchand actif sous 48 h',
    'Carte digitale active sous 48 h',
    'Première saison calibrée avec vous',
  ]

  const trustItems = [
    'Validation réelle du passage avant effet récompense',
    'Budget borné et coût saison clairement limité',
    'Pas de discount non contrôlé ni de promo ouverte',
    'Fraude limitée par QR, code et contrôle staff',
  ]

  const thirtyDayItems = [
    'Premiers passages validés par l’équipe',
    `${activePaths} retours potentiels lisibles dans le tableau`,
    'Récompense visible et progression comprise par le client',
    'Premiers Diamond identifiables sans acquisition payante',
  ]

  const staffItems = [
    'Ouvrir le panneau marchand ou scanner le QR',
    'Valider le passage réel',
    'Laisser Cardin mettre à jour progression et droits',
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Activation</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Une saison claire, pas un setup flou.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59635C] sm:text-base">
          Vous achetez une première saison Cardin : QR de validation, carte digitale, tableau marchand, récompense visible et cadre Diamond. Paiement maintenant, activation digitale sous 48 h, premiers signaux attendus sous 30 jours si l&apos;équipe distribue et valide.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Ce que vous achetez</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#203B31]">
              {offerItems.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Ce qui s&apos;active sous 48 h</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#203B31]">
              {activationItems.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Objectif de saison</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetricCard label="Revenu" value={formatEuro(monthlyRecovered)} note="par mois" />
            <MiniMetricCard label="Parcours" value={`${activePaths}`} note="retours potentiels" />
            <MiniMetricCard label="Total" value={formatEuro(seasonValue)} note="sur saison" />
          </div>
          <p className="mt-4 text-sm leading-7 text-[#556159]">{explainer.merchantExplanationCopy.revenueConnection}</p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Confiance</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#203B31]">
              {trustItems.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Sous 30 jours</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#203B31]">
              {thirtyDayItems.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Ce que le staff fait en 10 secondes</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[#203B31]">
            {staffItems.map((item, index) => (
              <p key={item}>{index + 1}. {item}</p>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Passer à l&apos;activation</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Un chemin dominant : payer, attendre 48 h, valider les passages réels, lire les premiers retours. Le reste peut se configurer avant ou après.</p>
          <div className="mt-6">
            <a className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-8 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href={STRIPE_PAYMENT_LINK} rel="noreferrer" target="_blank">
              {`Payer ${formatEuro(LANDING_PRICING.activationFee)} et lancer`}
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link className="text-[#173A2E] underline underline-offset-2" href={engineHref}>
              Ajuster avant paiement
            </Link>
            <Link className="text-[#173A2E] underline underline-offset-2" href="#top">
              Revoir depuis le début
            </Link>
          </div>
          <StripePaymentNextSteps />
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


























