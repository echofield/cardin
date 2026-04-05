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

const screens: Array<{ id: ScreenId; label: string; eyebrow: string }> = [
  { id: "world", label: "Lieu", eyebrow: "Monde marchand" },
  { id: "system", label: "Systeme", eyebrow: "Entree et trajectoire" },
  { id: "summit", label: "Sommet", eyebrow: "Grand Diamond" },
  { id: "season", label: "Saison", eyebrow: "Limite et narration" },
  { id: "checkmate", label: "Checkmate", eyebrow: "Argent, reseau, confiance" },
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
    description: "Un cycle tendu pour prouver vite le systeme et lancer le desir.",
    selectiveCards: 50,
    massCards: 200,
    note: "Format le plus simple pour une premiere preuve terrain.",
    momentum: "3 mois pour activer, faire revenir, montrer les premiers Diamond.",
  },
  {
    months: 6,
    title: "Saison longue",
    description: "Plus de temps pour faire monter les cartes, filtrer et installer les ambassadeurs.",
    selectiveCards: 80,
    massCards: 280,
    note: "Le bon format quand le lieu veut un recit plus profond et plus de propagation.",
    momentum: "6 mois pour installer un vrai bouche-a-oreille visible et preparer la saison 2.",
  },
]

const worlds: WorldDefinition[] = [
  {
    id: "cafe",
    label: "Cafe",
    eyebrow: "Rythme quotidien",
    hero: "Le cafe gagne quand le retour devient bouche-a-oreille.",
    intro: "Passage rapide, routine visible, comptoir ideal pour un domino discret qui fait revenir sans promotion.",
    baselineMonthlyRecovered: 1200,
    baselineActivePaths: 150,
    baselineDominoMultiplier: 1.4,
    baselineTrust: 72,
    adSpend: 500,
    adDuration: "3 jours",
    installPrice: 300,
    basketLine: "Un sommet type: 1 boisson signature par mois pendant 1 an.",
    proofLine: "Le cafe remplace une partie de son marketing perdu par un rituel visible et transmissible.",
    defaultSummitId: "signature-monthly",
    walletRewardLabel: "Carte vivante / progression cardin",
    walletNotification: "Votre carte monte quand le lieu circule.",
    entry: {
      selective: {
        title: "Entree selective",
        lead: "Le patron choisit les premieres cartes. La rarete precede la valeur.",
        steps: ["50 cartes max", "activation silencieuse", "premier choc a la visite 2"],
        outcome: "50 cartes initiales peuvent devenir 150 parcours actifs par domino et desir.",
      },
      mass: {
        title: "Entree masse qualifiee",
        lead: "QR accessible, mais la carte reste dormante tant que la personne ne revient pas.",
        steps: ["200 cartes distribuees", "visite 1 = dormante", "visite 2 = la carte s'allume"],
        outcome: "La masse filtre naturellement: seuls les vrais retours activent la machine.",
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
        socialLiftLabel: "attire fort sans sur-promettre",
        note: "Le sommet classique d'un cafe: simple, lisible, tres rentable.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "duo-morning",
        title: "Duo du matin",
        promise: "1 duo signature par mois pour la personne qui tire le plus de cartes vers le haut.",
        annualCost: 180,
        visibilityLabel: "Sommet tres visible",
        socialLiftLabel: "renforce l'invitation et la venue a deux",
        note: "Plus vous engagez le sommet, plus le domino devient naturellement social.",
        monthlyRecoveredBoost: 1.16,
        dominoBoost: 1.08,
        trustLift: 1.08,
      },
      {
        id: "hidden-cellar",
        title: "Privilege cache",
        promise: "Un privilege non affiche, reserve au sommet de la saison.",
        annualCost: 140,
        visibilityLabel: "Sommet discret",
        socialLiftLabel: "renforce le desir sans tout reveler",
        note: "Version plus mysterieuse: moins visible, mais tres forte en tension narrative.",
        monthlyRecoveredBoost: 1.08,
        dominoBoost: 1.03,
        trustLift: 1.05,
      },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    eyebrow: "Table et occasion",
    hero: "Le restaurant gagne quand la table devient recit.",
    intro: "Retour plus espace, panier plus fort, desir de table: Cardin transforme les occasions en trajectoire sociale.",
    baselineMonthlyRecovered: 3800,
    baselineActivePaths: 135,
    baselineDominoMultiplier: 1.5,
    baselineTrust: 76,
    adSpend: 800,
    adDuration: "3 jours",
    installPrice: 500,
    basketLine: "Un sommet type: 1 repas signature par mois pendant 1 an.",
    proofLine: "Le restaurant remplace une campagne jetable par un ambassadeur qui reserve, invite et raconte.",
    defaultSummitId: "table-monthly",
    walletRewardLabel: "Table cardin / progression vivante",
    walletNotification: "Les cartes actives font monter le desir de table.",
    entry: {
      selective: {
        title: "Entree selective",
        lead: "Le patron ou le maitre d'hotel choisit les premiers cercles.",
        steps: ["80 cartes max", "table reconnue des la visite 1", "premier choc a la visite 2"],
        outcome: "Le lieu cree une rarete lisible avant meme que le domino commence.",
      },
      mass: {
        title: "Entree masse qualifiee",
        lead: "QR sur la table ou au comptoir, mais seule la visite 2 active vraiment la carte.",
        steps: ["200 cartes diffusees", "visite 1 = observation", "visite 2 = activation"],
        outcome: "La salle se remplit avec des retours qualifies, pas avec de l'audience louee.",
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
        socialLiftLabel: "fait comprendre qu'une vraie table peut se meriter",
        note: "Le meilleur checkmate commercial: un repas mensuel vaut un ambassadeur sur 12 mois.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "chef-table",
        title: "Table du chef",
        promise: "Une table chef reservee une fois par mois pour le sommet de la saison.",
        annualCost: 720,
        visibilityLabel: "Sommet tres visible",
        socialLiftLabel: "pousse les retours et les invitations de facon plus nette",
        note: "Plus rare, plus raconte, plus proche d'une histoire que d'une offre.",
        monthlyRecoveredBoost: 1.18,
        dominoBoost: 1.1,
        trustLift: 1.08,
      },
      {
        id: "secret-menu",
        title: "Menu secret",
        promise: "Un privilege cache reserve a la carte la plus haute du cycle.",
        annualCost: 480,
        visibilityLabel: "Sommet discret",
        socialLiftLabel: "mise sur le desir et la confidence",
        note: "Moins frontal, tres efficace si le lieu prefere le mystere a l'affichage.",
        monthlyRecoveredBoost: 1.07,
        dominoBoost: 1.03,
        trustLift: 1.05,
      },
    ],
  },
  {
    id: "beaute",
    label: "Beaute",
    eyebrow: "Cycle et soin",
    hero: "La beaute gagne quand le suivi devient statut.",
    intro: "Retour espace, forte confiance, bouche-a-oreille tres qualitatif: Cardin structure le cycle plutot que de le forcer.",
    baselineMonthlyRecovered: 2600,
    baselineActivePaths: 110,
    baselineDominoMultiplier: 1.3,
    baselineTrust: 81,
    adSpend: 600,
    adDuration: "3 jours",
    installPrice: 300,
    basketLine: "Un sommet type: 1 coupe ou soin signature par mois pendant 1 an.",
    proofLine: "La beaute remplace la relance froide par un recit de statut, de rythme et de recommandation.",
    defaultSummitId: "cut-monthly",
    walletRewardLabel: "Rituel cardin / progression visible",
    walletNotification: "Le statut monte quand le cycle se resserre et circule.",
    entry: {
      selective: {
        title: "Entree selective",
        lead: "Le studio ou le salon donne les premieres cartes aux clientes qu'il veut vraiment installer.",
        steps: ["50 cartes max", "la carte pose le cycle", "visite 2 = vrai declic"],
        outcome: "Le lieu choisit ses premieres ambassadrices avant meme d'activer le domino.",
      },
      mass: {
        title: "Entree masse qualifiee",
        lead: "QR a l'accueil ou apres le soin, mais seul le vrai retour donne sa chaleur a la carte.",
        steps: ["150 cartes diffusees", "visite 1 = dormante", "visite 2 = active"],
        outcome: "Le filtre comportemental garde les clientes qui entrent vraiment dans le cycle.",
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
        title: "Coupe mensuelle",
        promise: "1 coupe ou soin signature par mois pendant 1 an.",
        annualCost: 300,
        visibilityLabel: "Sommet visible",
        socialLiftLabel: "fait comprendre qu'il existe un vrai statut dans le lieu",
        note: "Le sommet le plus lisible pour un salon ou un institut.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "ritual-duo",
        title: "Rituel duo",
        promise: "1 privilege duo mensuel pour la carte la plus haute.",
        annualCost: 420,
        visibilityLabel: "Sommet tres visible",
        socialLiftLabel: "renforce naturellement l'effet invitation",
        note: "Tres fort pour transformer la recommandation en rendez-vous reel.",
        monthlyRecoveredBoost: 1.15,
        dominoBoost: 1.08,
        trustLift: 1.08,
      },
      {
        id: "private-ritual",
        title: "Rituel prive",
        promise: "Un privilege non affiche reserve au sommet de la saison.",
        annualCost: 260,
        visibilityLabel: "Sommet discret",
        socialLiftLabel: "joue la confidence plutot que l'affichage",
        note: "Version plus silencieuse, mais tres forte si le lieu veut rester precieux.",
        monthlyRecoveredBoost: 1.07,
        dominoBoost: 1.03,
        trustLift: 1.06,
      },
    ],
  },
  {
    id: "boutique",
    label: "Boutique",
    eyebrow: "Collection et desir",
    hero: "La boutique gagne quand l'acces devient histoire.",
    intro: "Passage plus rare, desir de piece, propagation elegante: Cardin structure une clientele qui revient pour viser un acces reel.",
    baselineMonthlyRecovered: 1900,
    baselineActivePaths: 95,
    baselineDominoMultiplier: 1.25,
    baselineTrust: 74,
    adSpend: 700,
    adDuration: "3 jours",
    installPrice: 500,
    basketLine: "Un sommet type: 100 EUR de collection ou un acces reserve chaque mois pendant 1 an.",
    proofLine: "La boutique remplace une partie des drops oublies par une trajectoire d'acces et de desir.",
    defaultSummitId: "collection-credit",
    walletRewardLabel: "Acces cardin / progression de collection",
    walletNotification: "La piece se rapproche quand la carte monte et circule.",
    entry: {
      selective: {
        title: "Entree selective",
        lead: "Le lieu choisit les premieres cartes et donne de la valeur avant toute remise.",
        steps: ["60 cartes max", "desir installe des l'entree", "visite 2 = bascule"],
        outcome: "Le cercle se construit avec des clientes qui comprennent deja le style du lieu.",
      },
      mass: {
        title: "Entree masse qualifiee",
        lead: "QR disponible, mais la carte reste froide tant que le retour n'a pas eu lieu.",
        steps: ["180 cartes diffusees", "visite 1 = regard", "visite 2 = la carte devient vivante"],
        outcome: "Le lieu ne paie pas pour l'audience: il retient celles qui reviennent vraiment.",
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
        promise: "100 EUR de collection par mois pendant 1 an pour la carte la plus haute.",
        annualCost: 1200,
        visibilityLabel: "Sommet visible",
        socialLiftLabel: "installe un desir net dans toute la clientele",
        note: "Le sommet frontal d'une boutique: simple a comprendre, tres fort a raconter.",
        monthlyRecoveredBoost: 1,
        dominoBoost: 1,
        trustLift: 1,
      },
      {
        id: "rare-drop",
        title: "Rare drop mensuel",
        promise: "Acces prioritaire mensuel a une piece ou capsule reservee.",
        annualCost: 800,
        visibilityLabel: "Sommet tres visible",
        socialLiftLabel: "pousse le desir et le partage de facon plus organique",
        note: "Tres fort quand la boutique veut faire monter la clientele sans parler remise.",
        monthlyRecoveredBoost: 1.14,
        dominoBoost: 1.08,
        trustLift: 1.07,
      },
      {
        id: "private-piece",
        title: "Piece cachee",
        promise: "Une piece ou acces cache reserve au sommet de la saison.",
        annualCost: 650,
        visibilityLabel: "Sommet discret",
        socialLiftLabel: "joue la confidence et la tension",
        note: "La version la plus silencieuse, ideale pour une boutique qui vit de desir plutot que d'affichage.",
        monthlyRecoveredBoost: 1.07,
        dominoBoost: 1.03,
        trustLift: 1.05,
      },
    ],
  },
]

function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
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
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#667067]">Argent. Reseau. Confiance.</p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.02] text-[#173328] sm:text-5xl lg:text-6xl">
              Une saison pour remplacer le marketing perdu par un systeme vivant.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#556159] sm:text-base">
              La carte est la premiere couche visible. Derriere, Cardin orchestre le retour, le domino et le sommet qui tire le lieu vers le haut.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <MetricPill label="Argent" value={formatEuro(monthlyRecovered)} sublabel="recuperables / mois" />
            <MetricPill label="Reseau" value={`x${dominoMultiplier}`} sublabel="multiplicateur domino" />
            <MetricPill label="Confiance" value={`${trustScore}%`} sublabel="intensite du systeme" />
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
              <Link className="inline-flex h-11 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href={engineHref}>
                Ouvrir cette saison dans Cardin
              </Link>
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
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Monde marchand</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Choisissez votre lieu. Cardin vous montre ensuite sa logique complete.</h3>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#59635C] sm:text-base">
          Vous ne reglez pas des dizaines de parametres. Vous choisissez votre monde. Le systeme se charge ensuite de l'entree, de l'activation, du domino et du sommet.
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
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#637067]">Version en cours</p>
        <h4 className="mt-3 font-serif text-4xl leading-tight text-[#173A2E]">{selectedWorld.hero}</h4>
        <p className="mt-4 text-sm leading-7 text-[#556159]">{selectedWorld.proofLine}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MiniMetricCard label="Argent" value={formatEuro(monthlyRecovered)} note="recuperables / mois" />
          <MiniMetricCard label="Reseau" value={`${selectedWorld.baselineActivePaths}`} note="parcours actifs" />
          <MiniMetricCard label="Confiance" value={`${selectedWorld.baselineTrust}%`} note="intensite du recit" />
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-[#D8DED4] bg-[#FFFEFA] p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Le role de la carte</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Le client voit une carte. Le marchand lance en realite une saison avec entree selective ou masse qualifiee, activation au bon moment, domino discret et sommet visible.</p>
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
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Entree et trajectoire</p>
          <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Le systeme Cardin pour {selectedWorld.label.toLowerCase()}.</h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#59635C] sm:text-base">Le marchand ne choisit pas une liste de mecanismes. Cardin organise une suite: entree, activation, retour, domino, attraction. C'est ce mouvement qui cree l'argent, le reseau, puis la confiance.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <MiniMetricCard label="Parcours actifs" value={`${activePaths}`} note="si la saison prend" />
          <MiniMetricCard label="Domino" value={`x${dominoMultiplier}`} note="propagation plafonnee" />
          <MiniMetricCard label="Sommet" value={selectedSummit.visibilityLabel} note="moteur du desir" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[1.5rem] border border-[#E2DDD1] bg-[#FFFDF8] p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Deux entrees, un meme sommet</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <EntryLaneCard lane={selectedWorld.entry.selective} />
            <EntryLaneCard lane={selectedWorld.entry.mass} />
          </div>
        </div>

        <WalletPassPreview activeDots={4} businessLabel={selectedWorld.label} caption="Le client n'a pas besoin de comprendre le moteur. Il sent seulement que la carte change d'etat." footerLabel="SAISON CARDIN" notificationLabel={selectedWorld.walletNotification} progressDots={6} rewardLabel={selectedWorld.walletRewardLabel} statusLabel="Active" />
      </div>

      <div className="rounded-[1.5rem] border border-[#E2DDD1] bg-[#FFFDF8] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Ascent</p>
            <h4 className="mt-2 font-serif text-3xl text-[#173A2E]">Le statut change la portee sociale.</h4>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#556159]">Plus la carte monte, plus elle fait revenir, puis circuler. Le Grand Diamond n'invite meme plus seulement: il attire par existence.</p>
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
            <LawCard title="Activation" body="En entree masse, la visite 1 ne suffit pas. La visite 2 prouve qu'une personne existe vraiment pour le lieu." />
            <LawCard title="Domino" body="Diamond n'est pas juste un meilleur client. C'est une carte qui a plus de rayon social et peut faire naitre d'autres cartes." />
            <LawCard title="Attraction" body="Le sommet ne fait pas seulement plaisir a une personne. Il tire tout le reste vers le haut en rendant le systeme desirable." />
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
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Grand Diamond</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Choisissez ce que vous etes pret a mettre au sommet.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59635C] sm:text-base">C'est votre vrai choix. Plus le sommet est fort, plus l'attraction et le domino gagnent en intensite. Le marchand ne choisit pas la machine. Il choisit les stakes.</p>

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
        <WalletPassPreview activeDots={5} businessLabel={selectedWorld.label} caption="Le client voit le sommet. Il ne voit pas les calculs. C'est ce decalage qui cree le desir." footerLabel="GRAND DIAMOND" notificationLabel={`Sommet en vue: ${selectedSummit.promise}`} progressDots={6} rewardLabel={selectedSummit.promise} statusLabel="Sommet" />

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Ce que votre sommet change deja</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetricCard label="Argent" value={formatEuro(monthlyRecovered)} note="recuperables / mois" />
            <MiniMetricCard label="Reseau" value={selectedSummit.socialLiftLabel} note="effet domino" />
            <MiniMetricCard label="Confiance" value={selectedSummit.visibilityLabel} note="pour le lieu" />
          </div>
          <p className="mt-4 text-sm leading-7 text-[#556159]">Le sommet n'est pas un cadeau de plus. C'est la piece qui justifie toute l'ascension.</p>
        </Card>
      </div>
    </div>
  )
}

function SeasonScreen({ selectedSeason, onSelectSeason, selectedSeasonMode, selectedSummit, monthlyRecovered, activePaths }: { selectedSeason: SeasonLength; onSelectSeason: (season: SeasonLength) => void; selectedSeasonMode: (typeof seasonModes)[number]; selectedSummit: SummitOption; monthlyRecovered: number; activePaths: number }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Saison</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Choisissez la duree du recit.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59635C] sm:text-base">La saison est limitee. C'est ce qui donne de la valeur aux cartes, de la lisibilite au sommet, et un vrai sens a la saison 2 si la preuve est la.</p>

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
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Narration de saison</p>
          <h4 className="mt-3 font-serif text-3xl text-[#173A2E]">{selectedSeasonMode.momentum}</h4>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Le sommet choisi reste le meme pendant tout le cycle: <strong className="font-medium text-[#173A2E]">{selectedSummit.promise}</strong></p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <MiniMetricCard label="Argent" value={formatEuro(monthlyRecovered)} note="par mois" />
          <MiniMetricCard label="Reseau" value={`${activePaths}`} note="parcours actifs" />
          <MiniMetricCard label="Confiance" value={`${selectedSeasonMode.months} mois`} note="duree du recit" />
        </div>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Ce que le marchand ressent</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Vous ne lancez pas une offre. Vous lancez une saison avec des cartes limitees, une progression qui se raconte et une deuxieme saison qui peut se payer par la preuve.</p>
        </Card>
      </div>
    </div>
  )
}

function CheckmateScreen({ selectedWorld, selectedSummit, selectedSeason, seasonValue, monthlyRecovered, activePaths, dominoMultiplier, seasonCards, trustScore }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; selectedSeason: SeasonLength; seasonValue: number; monthlyRecovered: number; activePaths: number; dominoMultiplier: string; seasonCards: { selective: number; mass: number }; trustScore: number }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Argent, reseau, confiance</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Le checkmate arrive ici.</h3>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#59635C] sm:text-base">Cardin ne se compare pas a une carte de fidelite. Il se compare a l'argent perdu en marketing, a la faiblesse du bouche-a-oreille non structure, et a l'absence de recit dans le lieu.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_0.1fr_1fr] xl:items-start">
        <Card className="border-[#C9B06D] bg-[linear-gradient(180deg,#FBF4DE_0%,#F5E8B9_100%)] p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A641D]">Grand Diamond</p>
          <p className="mt-3 font-serif text-4xl text-[#4B3E12]">{formatEuro(selectedSummit.annualCost)}</p>
          <p className="mt-2 text-sm text-[#5D5223]">par an pour {selectedSummit.promise.toLowerCase()}</p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[#5D5223]">
            <p>Une presence visible pendant {selectedSeason} mois.</p>
            <p>Une trajectoire que les autres cartes regardent.</p>
            <p>Un sommet qui transforme la venue en aspiration.</p>
          </div>
        </Card>

        <div className="hidden h-full items-center justify-center text-sm italic text-[#8B8F86] xl:flex">vs</div>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Campagne classique</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">{formatEuro(selectedWorld.adSpend)}</p>
          <p className="mt-2 text-sm text-[#556159]">pour {selectedWorld.adDuration} d'attention louee</p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[#556159]">
            <p>Pas de carte identitaire.</p>
            <p>Pas de domino structure.</p>
            <p>Pas de sommet visible qui dure.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Argent</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">{formatEuro(monthlyRecovered)}</p>
          <p className="mt-2 text-sm leading-7 text-[#556159]">recuperables par mois, soit {formatEuro(seasonValue)} sur {selectedSeason} mois si la saison prend.</p>
        </Card>
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Reseau</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">x{dominoMultiplier}</p>
          <p className="mt-2 text-sm leading-7 text-[#556159]">jusqu'a {activePaths} parcours actifs avec {seasonCards.selective} cartes selectives ou {seasonCards.mass} cartes masse.</p>
        </Card>
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Confiance</p>
          <p className="mt-3 font-serif text-4xl text-[#173A2E]">{trustScore}%</p>
          <p className="mt-2 text-sm leading-7 text-[#556159]">de force narrative percue: le lieu a un systeme, pas une campagne de plus.</p>
        </Card>
      </div>
    </div>
  )
}

function ActivateScreen({ selectedWorld, selectedSummit, selectedSeason, monthlyRecovered, seasonValue, activePaths, engineHref }: { selectedWorld: WorldDefinition; selectedSummit: SummitOption; selectedSeason: SeasonLength; monthlyRecovered: number; seasonValue: number; activePaths: number; engineHref: string }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Activation</p>
        <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">Votre saison est prete a partir.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59635C] sm:text-base">Maintenant le recit est simple: un lieu, un sommet, une duree, un systeme. Le client voit une carte. Vous, vous lancez une machine qui remplace une partie du marketing par du retour, du reseau et de la confiance.</p>

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
              <p>QR de comptoir pret</p>
              <p>Carte Apple Wallet / Google Wallet</p>
              <p>Espace marchand</p>
              <p>Premiere saison calibree avec vous</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Ce que vous visez</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetricCard label="Argent" value={formatEuro(monthlyRecovered)} note="par mois" />
            <MiniMetricCard label="Reseau" value={`${activePaths}`} note="parcours actifs" />
            <MiniMetricCard label="Confiance" value={formatEuro(seasonValue)} note="signal sur la saison" />
          </div>
          <p className="mt-4 text-sm leading-7 text-[#556159]">La saison 2 ne se vend pas en theorie. Elle se vend par la preuve que la saison 1 a laissee derriere elle.</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Phase 0</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Les premieres activations peuvent etre lancees comme des saisons accompagnees. Ensuite, le systeme devient plus autonome: le lieu garde la narration, la carte garde l'identite, Cardin garde la physique.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-8 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href={engineHref}>
              Ouvrir ma saison dans Cardin
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

