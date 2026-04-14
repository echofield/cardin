"use client"

import Link from "next/link"
import { useCallback, useMemo, useState } from "react"

import { LANDING_WORLDS, LANDING_WORLD_ORDER, type LandingWorldId } from "@/lib/landing-content"
import {
  CLIENT_PARCOURS_SCREENS,
  SOFT_INVITE_MAX,
  WORLD_TARGET_VISITS,
  getClientParcoursScreen,
  getScreenForVisits,
  type SummitOption,
} from "@/lib/client-parcours-config"

import { ScreenEntree } from "@/components/client-parcours/ScreenEntree"
import { ScreenProgression } from "@/components/client-parcours/ScreenProgression"
import { ScreenActivation } from "@/components/client-parcours/ScreenActivation"
import { ScreenProchaineEtape } from "@/components/client-parcours/ScreenProchaineEtape"
import { ScreenDomino } from "@/components/client-parcours/ScreenDomino"
import { ScreenSommet } from "@/components/client-parcours/ScreenSommet"

const MAX_SHARES = 2

export function ClientParcoursSimulator() {
  const [worldId, setWorldId] = useState<LandingWorldId>("cafe")
  const [visits, setVisits] = useState(0)
  const [sharesUsed, setSharesUsed] = useState(0)
  const [softInviteUsed, setSoftInviteUsed] = useState(0)
  const [summitChoiceId, setSummitChoiceId] = useState<string | null>(null)

  const targetVisits = WORLD_TARGET_VISITS[worldId]
  const world = LANDING_WORLDS[worldId]
  const screenIndex = useMemo(() => getScreenForVisits(visits, targetVisits), [visits, targetVisits])
  const screen = useMemo(() => getClientParcoursScreen(worldId, screenIndex), [worldId, screenIndex])
  const isSummit = screenIndex === 5

  const handleAdvance = useCallback(() => {
    if (isSummit) {
      setVisits(0)
      setSharesUsed(0)
      setSoftInviteUsed(0)
      setSummitChoiceId(null)
    } else {
      setVisits((v) => Math.min(v + 1, targetVisits))
    }
  }, [isSummit, targetVisits])

  const handleShare = useCallback(() => {
    setSharesUsed((s) => Math.min(s + 1, MAX_SHARES))
  }, [])

  const handleSoftInvite = useCallback(() => {
    setSoftInviteUsed((s) => Math.min(s + 1, SOFT_INVITE_MAX))
  }, [])

  const handleWorldChange = useCallback((id: LandingWorldId) => {
    setWorldId(id)
    setVisits(0)
    setSharesUsed(0)
    setSoftInviteUsed(0)
    setSummitChoiceId(null)
  }, [])

  const handleSummitSelect = useCallback((option: SummitOption) => {
    setSummitChoiceId(option.id)
  }, [])

  function renderScreenContent() {
    switch (screen.id) {
      case "entree":
        return <ScreenEntree targetVisits={targetVisits} worldId={worldId} />
      case "progression":
        return <ScreenProgression targetVisits={targetVisits} visits={visits} worldId={worldId} />
      case "activation":
        return (
          <ScreenActivation
            onSoftInvite={handleSoftInvite}
            softInviteUsed={softInviteUsed}
            targetVisits={targetVisits}
            visits={visits}
            worldId={worldId}
          />
        )
      case "prochaine-etape":
        return <ScreenProchaineEtape targetVisits={targetVisits} visits={visits} worldId={worldId} />
      case "domino":
        return (
          <ScreenDomino
            maxShares={MAX_SHARES}
            onShare={handleShare}
            sharesUsed={sharesUsed}
            targetVisits={targetVisits}
            visits={visits}
            worldId={worldId}
          />
        )
      case "sommet":
        return (
          <ScreenSommet
            onSelectOption={handleSummitSelect}
            selectedOptionId={summitChoiceId}
            targetVisits={targetVisits}
            visits={visits}
            worldId={worldId}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#18271F]">
      <section className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute inset-x-0 top-[-220px] mx-auto h-[380px] w-[380px] rounded-full bg-[#E8EFE6] blur-3xl" />
        <div className="relative mx-auto max-w-xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Parcours client</p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.06] text-[#163328] sm:text-5xl">
            Désir par le fil
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[#566159]">
            Simulation simple: première visite, retour, déclencheur, invitation, puis récompense concrète. Le client voit un parcours fluide; le lieu garde un cadre précis.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6 md:space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Lieu</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANDING_WORLD_ORDER.map((candidate) => {
                const active = candidate === worldId
                return (
                  <button
                    className={[
                      "rounded-full border px-4 py-2 text-sm transition",
                      active
                        ? "border-[#173A2E] bg-[#EEF3EC] text-[#173A2E]"
                        : "border-[#DAD4C7] bg-[#F8F5EE] text-[#5C695F] hover:border-[#B9C4B8] hover:text-[#173A2E]",
                    ].join(" ")}
                    key={candidate}
                    onClick={() => handleWorldChange(candidate)}
                    type="button"
                  >
                    {LANDING_WORLDS[candidate].label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[1.3rem] border border-[#DDE3DA] bg-[#F8FAF6] px-5 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Fil</p>
              <p className="mt-1 text-sm text-[#173A2E]">
                {visits} / {targetVisits}
                {" · "}
                {isSummit ? "récompense ouverte" : "le sommet vous attend"}
              </p>
            </div>
            <div className="rounded-full border border-[#D8DED4] bg-[#FBFCF8] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#173A2E]">
              {world.label}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-[#DED9CF] bg-[linear-gradient(180deg,#FFFEFA_0%,#F4F0E7_100%)] p-6 shadow-[0_26px_80px_-60px_rgba(24,39,31,0.36)] md:p-8">
            <div className="flex items-start justify-between border-b border-[#E6E0D5] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">
                  Étape {screenIndex + 1} / {CLIENT_PARCOURS_SCREENS.length}
                </p>
                <h2 className="mt-2 font-serif text-2xl text-[#173328] sm:text-3xl">{screen.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#556159]">{screen.subtitle}</p>
              </div>
            </div>

            <div className="mt-5">{renderScreenContent()}</div>
          </div>

          <button
            className="w-full rounded-full border border-[#173A2E] bg-[#173A2E] px-6 py-4 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
            onClick={handleAdvance}
            type="button"
          >
            {isSummit ? "Recommencer le parcours" : "Valider un passage"}
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#69736C]">Simulation — aucun compte, aucune donnée enregistrée</p>
            <div className="flex gap-3">
              <Link className="text-xs text-[#173A2E] underline underline-offset-2" href="/landing">
                Retour landing
              </Link>
              <Link className="text-xs text-[#173A2E] underline underline-offset-2" href="/demo">
                Démo complète
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}