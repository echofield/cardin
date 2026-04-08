"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { WalletPassPreview } from "@/components/engine/WalletPassPreview"
import { trackEvent } from "@/lib/analytics"
import { LANDING_PRICING } from "@/lib/landing-content"

type MerchantWorldId = "cafe" | "restaurant" | "boulangerie" | "coiffeur" | "institut-beaute" | "boutique"
type ObjectiveId = "return" | "domino" | "rare"
type DominoLevel = "Calme" | "Moyen" | "Fort"

type FeaturedConcept = {
  title: string
  hook: string
  condition: string
  effect: string
  rewardLabel: string
  statusLabel: string
  notificationLabel: string
  caption: string
  projectionRevenue: number
  projectionVolume: number
  projectionUnit: string
  dominoLabel: DominoLevel
  activeDots: number
}

type MerchantWorld = {
  id: MerchantWorldId
  label: string
  eyebrow: string
  description: string
  hero: string
  concepts: Record<ObjectiveId, FeaturedConcept>
}

const objectives: Array<{ id: ObjectiveId; label: string; description: string }> = [
  { id: "return", label: "Faire revenir plus souvent", description: "Rituel, statut, progression visible." },
  { id: "domino", label: "Faire venir plus de monde", description: "Invites, duo, propagation active." },
  { id: "rare", label: "Creer quelque chose de rare", description: "Grand Prix, acces, desir exceptionnel." },
]

const worlds: MerchantWorld[] = [
  {
    id: "cafe",
    label: "Cafe",
    eyebrow: "Rythme quotidien",
    description: "Comptoir, habitudes, invites rapides, statut visible.",
    hero: "Le cafe vit quand l'habitude devient desir.",
    concepts: {
      return: {
        title: "Diamond Ritual",
        hook: "Un statut mensuel qui se merite au comptoir.",
        condition: "5 passages actifs dans le mois",
        effect: "1 boisson signature reservee aux Diamond",
        rewardLabel: "Diamond Ritual / boisson signature",
        statusLabel: "Diamond",
        notificationLabel: "Votre rituel Diamond vous attend",
        caption: "Le client voit qu'il entre dans un cercle vivant.",
        projectionRevenue: 210,
        projectionVolume: 24,
        projectionUnit: "passages",
        dominoLabel: "Moyen",
        activeDots: 4,
      },
      domino: {
        title: "Domino Invite",
        hook: "Venir avec quelqu'un fait monter plus vite.",
        condition: "1 invite validee au comptoir",
        effect: "boost direct vers le palier suivant",
        rewardLabel: "Domino Invite / boost de progression",
        statusLabel: "Domino",
        notificationLabel: "Un +1 peut accelerer votre carte aujourd'hui",
        caption: "La progression s'accelere quand le lieu circule.",
        projectionRevenue: 290,
        projectionVolume: 31,
        projectionUnit: "passages",
        dominoLabel: "Fort",
        activeDots: 5,
      },
      rare: {
        title: "Grand Prix Cafe",
        hook: "Un privilege annuel au-dessus de la carte.",
        condition: "Cartes Diamond actives sur 6 semaines",
        effect: "1 boisson signature par mois pendant 1 an",
        rewardLabel: "Grand Prix Cafe / privilege annuel",
        statusLabel: "Rare",
        notificationLabel: "Le Grand Prix Cafe approche pour les cartes actives",
        caption: "Une tension rare qui donne envie de suivre sa progression.",
        projectionRevenue: 260,
        projectionVolume: 22,
        projectionUnit: "passages",
        dominoLabel: "Fort",
        activeDots: 5,
      },
    },
  },
  {
    id: "restaurant",
    label: "Restaurant",
    eyebrow: "Tables et moments",
    description: "Services a remplir, desir de table, effet groupe.",
    hero: "Le restaurant gagne quand le retour devient une occasion.",
    concepts: {
      return: {
        title: "Mardi Secret",
        hook: "Un service faible devient un rendez-vous raconte.",
        condition: "Carte active le mardi soir",
        effect: "dessert secret reserve aux cartes actives",
        rewardLabel: "Mardi Secret / dessert reserve",
        statusLabel: "Actif",
        notificationLabel: "Mardi Secret s'ouvre pour les cartes actives",
        caption: "Le moment faible devient un vrai signe de reconnaissance.",
        projectionRevenue: 340,
        projectionVolume: 14,
        projectionUnit: "couverts",
        dominoLabel: "Moyen",
        activeDots: 3,
      },
      domino: {
        title: "Table Domino",
        hook: "Une place de plus change toute la table.",
        condition: "1 invite validee sur une table active",
        effect: "boost direct vers un acces de table reserve",
        rewardLabel: "Table Domino / boost a table",
        statusLabel: "Domino",
        notificationLabel: "Inviter quelqu'un peut accelerer votre table",
        caption: "Le groupe devient la vraie variable Cardin.",
        projectionRevenue: 480,
        projectionVolume: 18,
        projectionUnit: "couverts",
        dominoLabel: "Fort",
        activeDots: 5,
      },
      rare: {
        title: "Grand Prix Table",
        hook: "Un diner rare qui attire toutes les cartes vers le haut.",
        condition: "Cartes les plus actives du cycle",
        effect: "un diner signature mensuel pendant 1 an",
        rewardLabel: "Grand Prix Table / diner signature",
        statusLabel: "Rare",
        notificationLabel: "Le Grand Prix Table se rapproche pour les cartes actives",
        caption: "Un prix rare qui change la perception du lieu.",
        projectionRevenue: 420,
        projectionVolume: 15,
        projectionUnit: "couverts",
        dominoLabel: "Fort",
        activeDots: 5,
      },
    },
  },
  {
    id: "boulangerie",
    label: "Boulangerie",
    eyebrow: "Routine de quartier",
    description: "Passage frequent, quartier, desir simple mais vivant.",
    hero: "La boulangerie gagne quand la routine devient cercle.",
    concepts: {
      return: {
        title: "Rituel Fournee",
        hook: "Un cap visible sur la routine de la semaine.",
        condition: "4 passages actifs dans la semaine",
        effect: "acces a une douceur de fournee reservee",
        rewardLabel: "Rituel Fournee / douceur reservee",
        statusLabel: "Actif",
        notificationLabel: "Votre rituel de fournee vous attend demain",
        caption: "La carte suit le rythme du quartier.",
        projectionRevenue: 230,
        projectionVolume: 28,
        projectionUnit: "passages",
        dominoLabel: "Moyen",
        activeDots: 4,
      },
      domino: {
        title: "Domino Voisin",
        hook: "Faire entrer un proche dans la meme boucle.",
        condition: "1 nouveau passage amene par une carte active",
        effect: "boost vers le prochain cercle",
        rewardLabel: "Domino Voisin / boost de quartier",
        statusLabel: "Domino",
        notificationLabel: "Inviter un voisin peut accelerer votre carte",
        caption: "La rue devient un moteur, pas seulement le comptoir.",
        projectionRevenue: 310,
        projectionVolume: 34,
        projectionUnit: "passages",
        dominoLabel: "Fort",
        activeDots: 5,
      },
      rare: {
        title: "Grand Tirage Fournee",
        hook: "Une exception rare au-dessus de la routine.",
        condition: "Cartes actives sur 6 semaines",
        effect: "1 panier du samedi par mois pendant 1 an",
        rewardLabel: "Grand Tirage Fournee / panier du samedi",
        statusLabel: "Rare",
        notificationLabel: "Le Grand Tirage Fournee approche pour les cartes actives",
        caption: "Le desir reste local mais devient exceptionnel.",
        projectionRevenue: 280,
        projectionVolume: 24,
        projectionUnit: "passages",
        dominoLabel: "Fort",
        activeDots: 5,
      },
    },
  },
  {
    id: "coiffeur",
    label: "Coiffeur",
    eyebrow: "Cycle et desir",
    description: "Retour espace, progression visible, valeur forte.",
    hero: "Le coiffeur gagne quand le cycle devient statut.",
    concepts: {
      return: {
        title: "Diamond Cut",
        hook: "Un statut qui s'installe sur le cycle.",
        condition: "3 rendez-vous actifs dans le cycle",
        effect: "acces a un soin signature reserve",
        rewardLabel: "Diamond Cut / soin signature",
        statusLabel: "Diamond",
        notificationLabel: "Votre Diamond Cut peut s'ouvrir ce mois-ci",
        caption: "Le statut est plus important que le cadeau seul.",
        projectionRevenue: 380,
        projectionVolume: 9,
        projectionUnit: "visites",
        dominoLabel: "Moyen",
        activeDots: 4,
      },
      domino: {
        title: "Bring a Friend Boost",
        hook: "Le +1 devient un saut de progression.",
        condition: "1 invitee validee",
        effect: "skip d'etape vers Diamond",
        rewardLabel: "Bring a Friend / skip vers Diamond",
        statusLabel: "Domino",
        notificationLabel: "Inviter quelqu'un peut vous faire sauter une etape",
        caption: "Le domino est direct, visible et memorable.",
        projectionRevenue: 520,
        projectionVolume: 12,
        projectionUnit: "visites",
        dominoLabel: "Fort",
        activeDots: 5,
      },
      rare: {
        title: "Grand Prix Coupe",
        hook: "Un privilege annuel qui change la perception du lieu.",
        condition: "cartes Diamond les plus actives",
        effect: "1 coupe offerte par mois pendant 1 an",
        rewardLabel: "Grand Prix Coupe / privilege annuel",
        statusLabel: "Rare",
        notificationLabel: "Le Grand Prix Coupe approche pour les cartes les plus vives",
        caption: "C'est une exception forte, pas une simple remise.",
        projectionRevenue: 470,
        projectionVolume: 10,
        projectionUnit: "visites",
        dominoLabel: "Fort",
        activeDots: 5,
      },
    },
  },
  {
    id: "institut-beaute",
    label: "Beaute",
    eyebrow: "Rituel et soin",
    description: "Frequence suivie, desir de soin, progression douce.",
    hero: "La beaute gagne quand le rituel devient statut.",
    concepts: {
      return: {
        title: "Rituel Peau",
        hook: "Un statut lie au soin suivi.",
        condition: "3 passages actifs dans le cycle",
        effect: "acces a un geste soin reserve",
        rewardLabel: "Rituel Peau / geste reserve",
        statusLabel: "Actif",
        notificationLabel: "Votre rituel peau peut monter cette semaine",
        caption: "Le suivi devient une progression sensible.",
        projectionRevenue: 360,
        projectionVolume: 8,
        projectionUnit: "visites",
        dominoLabel: "Moyen",
        activeDots: 4,
      },
      domino: {
        title: "Duo Glow",
        hook: "Venir a deux pour entrer plus vite dans le cercle.",
        condition: "1 invitee validee sur rendez-vous",
        effect: "boost direct vers un privilege soin",
        rewardLabel: "Duo Glow / boost de progression",
        statusLabel: "Domino",
        notificationLabel: "Un duo peut accelerer votre carte aujourd'hui",
        caption: "Le domino reste desirant et non agressif.",
        projectionRevenue: 470,
        projectionVolume: 10,
        projectionUnit: "visites",
        dominoLabel: "Fort",
        activeDots: 5,
      },
      rare: {
        title: "Diamond Glow",
        hook: "Un cercle rare au-dessus du rituel.",
        condition: "Diamond actif sur plusieurs cycles",
        effect: "1 soin signature par mois pendant 1 an",
        rewardLabel: "Diamond Glow / privilege annuel",
        statusLabel: "Rare",
        notificationLabel: "Diamond Glow approche pour les cartes actives",
        caption: "Le desir vient de l'exception et du statut.",
        projectionRevenue: 430,
        projectionVolume: 9,
        projectionUnit: "visites",
        dominoLabel: "Fort",
        activeDots: 5,
      },
    },
  },
  {
    id: "boutique",
    label: "Boutique",
    eyebrow: "Pieces et desir",
    description: "Passage plus rare, envie, acces, rarete visible.",
    hero: "La boutique gagne quand le desir devient cercle.",
    concepts: {
      return: {
        title: "Cercle Collection",
        hook: "Donner une progression au retour en boutique.",
        condition: "3 achats ou passages actifs",
        effect: "acces a une preview ou piece reservee",
        rewardLabel: "Cercle Collection / preview reservee",
        statusLabel: "Cercle",
        notificationLabel: "Votre cercle collection peut monter cette semaine",
        caption: "La carte nourrit l'envie entre deux achats.",
        projectionRevenue: 300,
        projectionVolume: 12,
        projectionUnit: "retours",
        dominoLabel: "Moyen",
        activeDots: 4,
      },
      domino: {
        title: "Duo Acces",
        hook: "Venir a deux pour ouvrir une porte de plus.",
        condition: "1 invitee validee en boutique",
        effect: "acces plus rapide a la preview reservee",
        rewardLabel: "Duo Acces / preview acceleree",
        statusLabel: "Domino",
        notificationLabel: "Un duo peut accelerer votre acces cette semaine",
        caption: "La propagation devient partie du style du lieu.",
        projectionRevenue: 420,
        projectionVolume: 15,
        projectionUnit: "retours",
        dominoLabel: "Fort",
        activeDots: 5,
      },
      rare: {
        title: "Rare Drop",
        hook: "Une piece ou un acces qui ne s'ouvre pas pour tout le monde.",
        condition: "cartes actives les plus hautes du cycle",
        effect: "acces prioritaire a un rare drop du mois",
        rewardLabel: "Rare Drop / acces prioritaire",
        statusLabel: "Rare",
        notificationLabel: "Un rare drop peut s'ouvrir pour les cartes vives",
        caption: "Le desir nait de l'acces, pas du discount.",
        projectionRevenue: 390,
        projectionVolume: 12,
        projectionUnit: "retours",
        dominoLabel: "Fort",
        activeDots: 5,
      },
    },
  },
]

function buildSetupHref(world: MerchantWorldId, objective: ObjectiveId) {
  return `/engine?template=${world}&objective=${objective}`
}

export function InlineCalculator() {
  const [selectedWorldId, setSelectedWorldId] = useState<MerchantWorldId>("cafe")
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<ObjectiveId>("return")

  const selectedWorld = worlds.find((world) => world.id === selectedWorldId) ?? worlds[0]
  const selectedObjective = selectedWorld.concepts[selectedObjectiveId]
  const selectedObjectiveMeta = objectives.find((objective) => objective.id === selectedObjectiveId) ?? objectives[0]
  const setupHref = useMemo(() => buildSetupHref(selectedWorld.id, selectedObjectiveId), [selectedObjectiveId, selectedWorld.id])
  const selectedWorldIndex = worlds.findIndex((world) => world.id === selectedWorldId)

  const selectWorld = (worldId: MerchantWorldId, source: "pill" | "previous_arrow" | "next_arrow") => {
    setSelectedWorldId(worldId)
    trackEvent("calculator_sector_selected", { sector: worldId, source })
  }

  const previousWorld = () => {
    const nextIndex = selectedWorldIndex <= 0 ? worlds.length - 1 : selectedWorldIndex - 1
    selectWorld(worlds[nextIndex].id, "previous_arrow")
  }

  const nextWorld = () => {
    const nextIndex = selectedWorldIndex >= worlds.length - 1 ? 0 : selectedWorldIndex + 1
    selectWorld(worlds[nextIndex].id, "next_arrow")
  }

  return (
    <div className="w-full rounded-[2rem] border border-[#D9D4C9] bg-[linear-gradient(180deg,#FFFDF8_0%,#F3F0E8_100%)] p-5 shadow-[0_24px_48px_-42px_rgba(27,67,50,0.22)] sm:p-8">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.16em] text-[#5C655E]">Cardin worlds</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[#16372C] sm:text-4xl">Choisissez votre lieu, puis la dynamique que vous voulez provoquer.</h2>
        <p className="mt-2 text-sm text-[#556159]">Chaque lieu garde ses saveurs Cardin: Diamond, Domino, acces rares et progression visible.</p>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[#E3DED4] bg-[#FFFEFA]/90 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#637067]">Choix du lieu</p>
            <p className="mt-1 text-sm text-[#556159]">Selection rapide, puis Cardin vous montre la bonne dynamique.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Lieu precedent"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D9D4C9] bg-[#FBF9F3] text-lg text-[#1B4332] transition hover:border-[#1B4332] hover:bg-[#F4F1E9]"
              onClick={previousWorld}
              type="button"
            >
              &larr;
            </button>
            <button
              aria-label="Lieu suivant"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D9D4C9] bg-[#FBF9F3] text-lg text-[#1B4332] transition hover:border-[#1B4332] hover:bg-[#F4F1E9]"
              onClick={nextWorld}
              type="button"
            >
              &rarr;
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {worlds.map((world) => {
            const isActive = world.id === selectedWorldId
            return (
              <button
                className={[
                  "shrink-0 rounded-full border px-4 py-3 text-left transition-all duration-200",
                  isActive
                    ? "border-[#1B4332] bg-[rgba(27,67,50,0.08)] text-[#1B4332] shadow-[0_12px_22px_-18px_rgba(27,67,50,0.26)]"
                    : "border-[#DDD8CE] bg-[#FFFDF8] text-[#1B4332] hover:border-[#B7C3B7]",
                ].join(" ")}
                key={world.id}
                onClick={() => selectWorld(world.id, "pill")}
                type="button"
              >
                <span className="font-medium">{world.label}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-[#E3DED4] bg-[#FBF9F3] p-4 sm:p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#637067]">{selectedWorld.eyebrow}</p>
          <p className="mt-2 font-serif text-2xl text-[#173A2E]">{selectedWorld.hero}</p>
          <p className="mt-2 max-w-2xl text-sm text-[#4F5A53]">{selectedWorld.description}</p>
        </div>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-[#E3DED4] bg-[#FFFEFA]/90 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-[#637067]">{selectedWorld.label}</p>
        <p className="mt-2 font-serif text-3xl text-[#173A2E]">Choisissez la dynamique que vous voulez provoquer.</p>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {objectives.map((objective) => {
            const isActive = objective.id === selectedObjectiveId
            return (
              <button
                className={[
                  "rounded-2xl border p-4 text-left transition-all",
                  isActive ? "border-[#1B4332] bg-[rgba(27,67,50,0.08)] text-[#1B4332]" : "border-[#DDD8CE] bg-[#FBF9F3] text-[#1B4332] hover:border-[#B7C3B7]",
                ].join(" ")}
                key={objective.id}
                onClick={() => {
                  setSelectedObjectiveId(objective.id)
                  trackEvent("calculator_change", { field: "objective", value: objective.id, templateId: selectedWorld.id })
                }}
                type="button"
              >
                <p className="font-medium">{objective.label}</p>
                <p className={["mt-2 text-xs leading-relaxed", isActive ? "text-[#516157]" : "text-[#5B655E]"].join(" ")}>{objective.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div className="relative rounded-[1.75rem] border border-[#BFCABD] bg-[linear-gradient(180deg,#F6F5EE_0%,#EEF2EA_100%)] p-6 text-[#173A2E] shadow-[0_18px_38px_-34px_rgba(27,67,50,0.16)]">
            <p className="text-xs uppercase tracking-[0.16em] text-[#5F7066]">{selectedObjectiveMeta.label}</p>
            <p className="mt-2 font-serif text-3xl">{selectedObjective.title}</p>
            <p className="mt-3 text-sm text-[#556159]">{selectedObjective.hook}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#DED9CF] bg-[#FFFEFA] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Potentiel</p>
              <p className="mt-2 font-serif text-3xl text-[#173A2E]">+{selectedObjective.projectionRevenue}EUR</p>
              <p className="mt-1 text-xs text-[#556159]">ordre de grandeur / mois</p>
            </div>
            <div className="rounded-2xl border border-[#DED9CF] bg-[#FFFEFA] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Projection</p>
              <p className="mt-2 font-serif text-3xl text-[#173A2E]">{selectedObjective.projectionVolume}</p>
              <p className="mt-1 text-xs text-[#556159]">{selectedObjective.projectionUnit} recuperables</p>
            </div>
            <div className="rounded-2xl border border-[#DED9CF] bg-[#FFFEFA] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Domino</p>
              <p className="mt-2 font-serif text-3xl text-[#173A2E]">{selectedObjective.dominoLabel}</p>
              <p className="mt-1 text-xs text-[#556159]">propagation visible</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DED9CF] bg-[#FFFEFA] p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Condition Cardin</p>
            <p className="mt-2 text-sm text-[#203B31]">{selectedObjective.condition}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#5E6961]">Effet</p>
            <p className="mt-2 text-sm text-[#203B31]">{selectedObjective.effect}</p>
          </div>

          <div className="rounded-2xl border border-[#DED9CF] bg-[#FFFEFA] p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Activation</p>
            <p className="mt-2 font-serif text-3xl text-[#173A2E]">{LANDING_PRICING.compactLabel}</p>
            <p className="mt-2 text-sm text-[#556159]">Le moteur Cardin, le QR, la carte wallet et le suivi marchand pour cette version.</p>
            <div className="mt-5">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
                href={setupHref}
                onClick={() =>
                  trackEvent("calculator_cta_clicked", {
                    sector: selectedWorld.id,
                    objective: selectedObjectiveId,
                    revenueImpact: selectedObjective.projectionRevenue,
                    setupHref,
                  })
                }
              >
                Ouvrir cette version dans Cardin
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#DED9CF] bg-[#FFFEFA]/92 p-5 sm:p-6 shadow-[0_1px_0_rgba(27,67,50,0.03)]">
          <p className="text-xs uppercase tracking-[0.14em] text-[#637067]">Apercu client</p>
          <WalletPassPreview
            activeDots={selectedObjective.activeDots}
            businessLabel={selectedWorld.label}
            caption={selectedObjective.caption}
            notificationLabel={selectedObjective.notificationLabel}
            progressDots={6}
            rewardLabel={selectedObjective.rewardLabel}
            statusLabel={selectedObjective.statusLabel}
          />
        </div>
      </div>
    </div>
  )
}



