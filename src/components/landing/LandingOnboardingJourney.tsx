"use client"

import Link from "next/link"
import { useState } from "react"

import { LANDING_PRICING, LANDING_WORLD_ORDER, LANDING_WORLDS, type LandingWorldId } from "@/lib/landing-content"

type PhaseId = "setup" | "tension" | "decision"

type PhaseDefinition = {
  id: PhaseId
  eyebrow: string
  label: string
  title: string
  description: string
  steps: [string, string]
}

const PHASES: PhaseDefinition[] = [
  {
    id: "setup",
    eyebrow: "Acte 1",
    label: "Mise en place",
    title: "Le lieu entre dans Cardin sans friction.",
    description: "Le Figma onboarding devient une premiere lecture claire: on choisit le lieu, puis on montre ce qui s'echappe deja.",
    steps: ["Lieu", "Lecture"],
  },
  {
    id: "tension",
    eyebrow: "Acte 2",
    label: "Tension",
    title: "Le sommet et la saison installent le desir.",
    description: "Le parcours ne montre pas huit ecrans. Il concentre la tension sur deux decisions: le sommet et la duree de saison.",
    steps: ["Sommet", "Saison"],
  },
  {
    id: "decision",
    eyebrow: "Acte 3",
    label: "Decision",
    title: "Le reveal finit sur une decision exploitable.",
    description: "La sortie garde un insight dominant, deux preuves maximum et la vraie formule de lancement Cardin.",
    steps: ["Checkmate", "Activation"],
  },
]

function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function LandingOnboardingJourney() {
  const [selectedWorldId, setSelectedWorldId] = useState<LandingWorldId>("cafe")
  const [selectedPhaseId, setSelectedPhaseId] = useState<PhaseId>("setup")

  const selectedWorld = LANDING_WORLDS[selectedWorldId]
  const selectedPhase = PHASES.find((phase) => phase.id === selectedPhaseId) ?? PHASES[0]
  const phaseIndex = PHASES.findIndex((phase) => phase.id === selectedPhase.id)
  const engineHref = `/engine?template=${selectedWorldId}&season=3`

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14" id="onboarding">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#DED9CF] bg-[linear-gradient(180deg,#FFFEFA_0%,#F4F0E7_100%)] p-6 shadow-[0_32px_90px_-60px_rgba(24,39,31,0.4)] sm:p-8 lg:p-10">
        <div className="absolute left-[-80px] top-[-100px] h-[220px] w-[220px] rounded-full bg-[#EEF2EA] blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-60px] h-[260px] w-[260px] rounded-full bg-[#ECE2C8] blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Onboarding Cardin</p>
              <h2 className="mt-3 font-serif text-4xl leading-[1.02] text-[#173328] sm:text-5xl lg:text-6xl">
                Le Figma onboarding est compresse en 3 phases lisibles.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#556159] sm:text-base">
                Meme systeme, meme chiffres, meme ton. Le parcours presente l'entree, construit la tension, puis laisse le simulateur faire la preuve.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[380px]">
              <MetricPill label="Phases exposees" value="3" note="au lieu de 7 etapes visibles" />
              <MetricPill label="Pricing live" value={`${LANDING_PRICING.activationFee} EUR`} note={LANDING_PRICING.recurringLabel} />
              <MetricPill label="Source" value="Landing" note="claims et simulateur alignes" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-[#E3DDD0] bg-[#FFFEFA]/90 p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Choix du lieu</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {LANDING_WORLD_ORDER.map((worldId) => {
                    const world = LANDING_WORLDS[worldId]
                    const isActive = worldId === selectedWorldId

                    return (
                      <button
                        className={[
                          "rounded-full border px-4 py-2.5 text-sm transition",
                          isActive
                            ? "border-[#173A2E] bg-[#EEF3EC] text-[#173A2E] shadow-[0_12px_24px_-18px_rgba(23,58,46,0.35)]"
                            : "border-[#DDD8CE] bg-[#FFFDF8] text-[#556159] hover:border-[#B8C4B8] hover:text-[#173A2E]",
                        ].join(" ")}
                        key={worldId}
                        onClick={() => setSelectedWorldId(worldId)}
                        type="button"
                      >
                        {world.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-3">
                {PHASES.map((phase, index) => {
                  const isActive = phase.id === selectedPhaseId
                  const isDone = index < phaseIndex

                  return (
                    <button
                      className={[
                        "rounded-[1.5rem] border p-5 text-left transition-all",
                        isActive
                          ? "border-[#173A2E] bg-[linear-gradient(180deg,#EEF3EC_0%,#E7EDE4_100%)] shadow-[0_18px_40px_-32px_rgba(23,58,46,0.45)]"
                          : "border-[#E3DDD0] bg-[#FFFEFA] hover:border-[#C4CFC2] hover:bg-[#FBF9F3]",
                      ].join(" ")}
                      key={phase.id}
                      onClick={() => setSelectedPhaseId(phase.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{phase.eyebrow}</p>
                          <p className="mt-2 font-serif text-3xl text-[#173A2E]">{phase.label}</p>
                        </div>
                        <div
                          className={[
                            "mt-1 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                            isActive || isDone
                              ? "border-[#173A2E] bg-[#173A2E] text-[#FBFAF6]"
                              : "border-[#D9D4C9] bg-[#FBF9F3] text-[#6D776F]",
                          ].join(" ")}
                        >
                          0{index + 1}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#556159]">{phase.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {phase.steps.map((step) => (
                          <span className="rounded-full border border-[#D9D4C9] bg-[#FBF9F3] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#617067]" key={step}>
                            {step}
                          </span>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-[#DCD6CA] bg-[#FFFDF8]/95 p-5 shadow-[0_1px_0_rgba(27,67,50,0.03)] sm:p-6 lg:sticky lg:top-24">
              <div className="flex items-start justify-between gap-4 border-b border-[#E6E0D5] pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#6D776F]">
                    {selectedPhase.eyebrow} Â· {selectedWorld.label}
                  </p>
                  <h3 className="mt-3 font-serif text-4xl leading-tight text-[#173328] sm:text-5xl">
                    {selectedPhase.title}
                  </h3>
                </div>
                <div className="rounded-full border border-[#D8DED4] bg-[#FBFCF8] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#173A2E]">
                  {selectedWorld.eyebrow}
                </div>
              </div>

              <div className="mt-6">
                {selectedPhaseId === "setup" ? <SetupPreview worldId={selectedWorldId} /> : null}
                {selectedPhaseId === "tension" ? <TensionPreview worldId={selectedWorldId} /> : null}
                {selectedPhaseId === "decision" ? <DecisionPreview engineHref={engineHref} worldId={selectedWorldId} /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SetupPreview({ worldId }: { worldId: LandingWorldId }) {
  const world = LANDING_WORLDS[worldId]

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-[#D9D4C9] bg-[linear-gradient(180deg,#173A2E_0%,#214636_100%)] p-6 text-[#FBFAF6]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9D4C6]">Selection du lieu</p>
        <p className="mt-3 font-serif text-4xl">{world.label}</p>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[#E2E8DE]">{world.onboardingLead}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <MetricCardOnDark label="Potentiel saison" value={world.claim} note={world.basket} />
          <MetricCardOnDark label="Base actuelle" value={formatEuro(world.baselineRecoveredPerMonth)} note="recuperables / mois" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[1.4rem] border border-[#E1DBCF] bg-[#FBF9F3] p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Lecture</p>
          <p className="mt-3 font-serif text-3xl text-[#173A2E]">Le manque est montre avant toute promesse.</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">
            Le reveal part du reel: base recuperable, intensite du lieu et mecanique deja presente dans le simulateur principal.
          </p>
        </div>

        <div className="grid gap-3">
          <MiniStat label="Revenu recuperable" value={formatEuro(world.baselineRecoveredPerMonth)} note="baseline / mois" />
          <MiniStat label="Confiance de base" value={`${world.baselineTrust}%`} note="intensite du systeme" />
        </div>
      </div>
    </div>
  )
}

function TensionPreview({ worldId }: { worldId: LandingWorldId }) {
  const world = LANDING_WORLDS[worldId]

  return (
    <div className="space-y-5">
      <div className="rounded-[1.55rem] border border-[#D7C99A] bg-[linear-gradient(180deg,#FBF3DA_0%,#F3E3AF_100%)] p-6 text-[#4C3E13] shadow-[0_18px_42px_-34px_rgba(108,84,24,0.4)]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#866C22]">Sommet</p>
        <p className="mt-3 font-serif text-4xl leading-tight">{world.summitPromise}</p>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[#6B5921]">
          Le sommet est traite comme le centre emotionnel du parcours. Plus d'espace, plus de contraste, moins de concepts melanges.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.4rem] border border-[#E1DBCF] bg-[#FFFEFA] p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Saison courte</p>
          <p className="mt-2 font-serif text-3xl text-[#173A2E]">3 mois</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Cycle rapide pour prouver le systeme et installer une premiere preuve terrain.</p>
        </div>
        <div className="rounded-[1.4rem] border border-[#E1DBCF] bg-[#FBF9F3] p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Saison longue</p>
          <p className="mt-2 font-serif text-3xl text-[#173A2E]">6 mois</p>
          <p className="mt-3 text-sm leading-7 text-[#556159]">Plus de temps pour installer propagation, desir et preparation de la saison suivante.</p>
        </div>
      </div>

      <div className="rounded-[1.4rem] border border-[#E1DBCF] bg-[#FBF9F3] p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Reveal</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[0.8fr_0.8fr_1.4fr] sm:items-end">
          <RevealBar label="Lieu" heightClass="h-24" toneClass="bg-[#BFD2BF]" />
          <RevealBar label="Sommet" heightClass="h-36" toneClass="bg-[#D9C16E]" />
          <RevealBar label="Saison" heightClass="h-48" toneClass="bg-[#7FA4D3]" />
        </div>
        <p className="mt-4 text-sm leading-7 text-[#556159]">La projection n'arrive qu'apres la construction du contexte. Le chiffre doit sembler merite, pas instantane.</p>
      </div>
    </div>
  )
}

function DecisionPreview({ worldId, engineHref }: { worldId: LandingWorldId; engineHref: string }) {
  const world = LANDING_WORLDS[worldId]

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-[#173A2E] bg-[linear-gradient(180deg,#EEF3EC_0%,#E3EBE1_100%)] p-6 shadow-[0_20px_44px_-34px_rgba(23,58,46,0.42)]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#5D6A61]">Insight dominant</p>
        <p className="mt-3 font-serif text-4xl leading-tight text-[#173A2E] sm:text-5xl">Le lieu commence a tourner seul.</p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#556159]">
          La decision garde une phrase forte, puis seulement deux preuves visibles: l'ordre de grandeur saisonnier et la base recuperable deja presente dans le simulateur.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MiniStat label="Potentiel saison" value={world.claim} note={world.basket} />
        <MiniStat label="Base recuperable" value={formatEuro(world.baselineRecoveredPerMonth)} note="par mois" />
      </div>

      <div className="rounded-[1.45rem] border border-[#E1DBCF] bg-[#FFFEFA] p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#69736C]">Activation</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-serif text-3xl text-[#173A2E]">{LANDING_PRICING.activationLabel}</p>
            <p className="mt-2 text-sm leading-7 text-[#556159]">{LANDING_PRICING.recurringLabel}. Dashboard, QR et wallet actifs dans la meme logique que le simulateur live.</p>
          </div>
          <div className="rounded-full border border-[#D8DED4] bg-[#FBFCF8] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#173A2E]">
            Trust de base {world.baselineTrust}%
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
            href="#methode"
          >
            Voir le simulateur live
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
            href="/demo"
          >
            Voir la demo complete
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
            href={engineHref}
          >
            Ouvrir l'engine
          </Link>
        </div>
      </div>

      <details className="rounded-[1.35rem] border border-[#E1DBCF] bg-[#FBF9F3] p-5">
        <summary className="cursor-pointer list-none text-sm font-medium text-[#173A2E]">Voir le detail</summary>
        <div className="mt-4 grid gap-3 text-sm leading-7 text-[#556159]">
          <p>{world.proofLine}</p>
          <p>Les claims publics et les chiffres affiches ici sont relies aux memes valeurs que les blocs de landing et du simulateur.</p>
        </div>
      </details>
    </div>
  )
}

function MetricPill({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-[#DFDACC] bg-[#FFFEFA] px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#173A2E]">{value}</p>
      <p className="mt-1 text-xs text-[#6D776F]">{note}</p>
    </div>
  )
}

function MetricCardOnDark({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#355847] bg-[rgba(255,255,255,0.06)] p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#C9D4C6]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#FBFAF6]">{value}</p>
      <p className="mt-1 text-xs text-[#D5DED2]">{note}</p>
    </div>
  )
}

function MiniStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.35rem] border border-[#E1DBCF] bg-[#FFFEFA] p-5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#173A2E]">{value}</p>
      <p className="mt-2 text-xs leading-6 text-[#6D776F]">{note}</p>
    </div>
  )
}

function RevealBar({ label, heightClass, toneClass }: { label: string; heightClass: string; toneClass: string }) {
  return (
    <div className="min-w-[88px]">
      <div className="flex h-52 items-end">
        <div className={["w-full rounded-t-[1.2rem] border border-[#CBD6CA] px-3 py-3", toneClass, heightClass].join(" ")}>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#163328]">{label}</p>
        </div>
      </div>
    </div>
  )
}
