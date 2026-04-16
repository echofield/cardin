"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { formatEuro } from "@/lib/number-format"

import { createClientSupabaseBrowser } from "@/lib/supabase/client"
import { Button, Card } from "@/ui"

import { ConfigurationRecap } from "@/components/merchant/ConfigurationRecap"
import { DASHBOARD_VERTICAL_LINE } from "@/lib/dashboard-vertical-line"

type SharedUnlockView = {
  enabled: boolean
  objective: number
  progress: number
  windowDays: number
  offer: string
  status: "disabled" | "tracking" | "active"
  activeUntil: string | null
}

type MidpointView = {
  mode: "recognition_only" | "recognition_plus_boost"
  threshold: number
  reached: boolean
  reachedAt: string | null
  copy: string
}

type MissionView = {
  id: string
  title: string
  status: "active" | "completed" | "expired"
  expiresAt: string
}

type LandingWorldIdLite = "cafe" | "bar" | "restaurant" | "beaute" | "boutique"

type ParcoursSelectionsSnapshot = {
  worldId: LandingWorldIdLite
  seasonRewardId: string | null
  rewardType: "direct" | "progression" | "invitation" | "evenement" | null
  intensite: "visible" | "stronger" | "discreet" | null
  moment: "immediat" | "apres_x" | "creneaux" | null
  accessType: "tous" | "reguliers" | "selectionnes" | null
  triggerType: "passage" | "heure" | "invitation" | "evenement" | null
  propagationType: "individuel" | "duo" | "groupe" | null
  summaryLine?: string
  nextStepLine?: string
  submittedAt?: string
}

type MerchantApiResponse = {
  ok: boolean
  merchant?: {
    id: string
    businessName: string
    businessType: string
    city: string
    cardinWorld?: LandingWorldIdLite
    loyaltyConfig: {
      targetVisits: number
      rewardLabel: string
      midpointMode: "recognition_only" | "recognition_plus_boost"
    }
    sharedUnlock: SharedUnlockView
    parcoursSelections?: ParcoursSelectionsSnapshot | null
  }
  protocol?: {
    state: string
    rewardsPaused: boolean
    diamondPaused: boolean
    seasonObjective: string
    marginLine: string
    diamondLine: string
    growthLine: string
    budgets: {
      season: { current: number; limit: number }
      week: { current: number; limit: number }
      day: { current: number; limit: number }
      diamond: { current: number; limit: number }
    }
    projected: {
      profitIncremental: number
      grossProfitTotal: number
      rewardCostTotal: number
      sigmaSeason: number
      fieldEnergy: number
    }
  } | null
  metrics?: {
    totalCards: number
    rewardReadyCards: number
    totalVisits: number
    repeatClients: number
    midpointReachedCards: number
    missionActiveCount: number
    missionCompletedCount: number
    missionRevenueEstimate: number
    season?: {
      seasonId: string
      seasonNumber: number
      summitTitle: string
      daysRemaining: number
      endsAt: string
      stepDistribution: Array<{
        step: number
        count: number
      }>
      dominoUnlockedCount: number
      diamondCount: number
      summitCount: number
      totalInvitations: number
      activatedInvitations: number
      activationRate: number
      winnerPool: {
        eligibleCount: number
        totalWeight: number
        averageWeight: number
        hasWinner: boolean
        winnerId: string | null
      }
    } | null
  }
  cards?: Array<{
    id: string
    customerName: string
    stamps: number
    targetVisits: number
    rewardLabel: string
    status: "active" | "reward_ready" | "redeemed"
    lastVisitAt: string
    midpoint: MidpointView
    seasonProgress?: {
      currentStep: number
      stepLabel: string
      dominoUnlocked: boolean
      diamondUnlocked: boolean
      summitReached: boolean
      branchesUsed: number
      branchCapacity: number
      directInvitationsActivated: number
    } | null
    diamondTokenAvailable?: boolean
    mission?: MissionView | null
  }>
}

export function MerchantDashboard({ merchantId, demo = false }: { merchantId: string; demo?: boolean }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MerchantApiResponse | null>(null)
  const [scanUrl, setScanUrl] = useState(`/scan/${merchantId}${demo ? "?demo=1" : ""}`)
  const [seasonAction, setSeasonAction] = useState<"idle" | "loading" | "error" | "success">("idle")
  const [seasonMessage, setSeasonMessage] = useState("")

  const loadMerchant = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/merchant/${merchantId}`)
      const payload = (await response.json()) as MerchantApiResponse
      setData(payload)
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    void loadMerchant()

    if (typeof window !== "undefined") {
      setScanUrl(`${window.location.origin}/scan/${merchantId}${demo ? "?demo=1" : ""}`)
    }
  }, [merchantId, demo, loadMerchant])

  const onStartSeason = async () => {
    setSeasonAction("loading")
    setSeasonMessage("")

    const response = await fetch("/api/season/start", { method: "POST" })
    const payload = await response.json()

    if (!response.ok || !payload.ok) {
      setSeasonAction("error")
      setSeasonMessage("Impossible de lancer la saison pour le moment.")
      return
    }

    setSeasonAction("success")
    setSeasonMessage(`Saison ${payload.season.seasonNumber} lancée.`)
    await loadMerchant()
  }

  const onCloseSeason = async (seasonId: string) => {
    setSeasonAction("loading")
    setSeasonMessage("")

    const response = await fetch("/api/season/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seasonId }),
    })
    const payload = await response.json()

    if (!response.ok || !payload.ok) {
      setSeasonAction("error")
      setSeasonMessage("Impossible de clôturer la saison pour le moment.")
      return
    }

    setSeasonAction("success")
    setSeasonMessage(`Saison ${payload.closedSeason.seasonNumber} clôturée, nouvelle saison ouverte.`)
    await loadMerchant()
  }

  const onSignOut = async () => {
    const supabase = createClientSupabaseBrowser()
    await supabase.auth.signOut()
    if (typeof window !== "undefined") window.location.href = "/login"
  }

  if (loading) {
    return <p className="p-6 text-sm">Chargement…</p>
  }

  if (!data?.ok || !data.merchant || !data.metrics) {
    return <p className="p-6 text-sm text-[#A64040]">Commerce introuvable.</p>
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#173A2E] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">Tableau marchand</p>
            <h1 className="mt-2 font-serif text-5xl">{data.merchant.businessName}</h1>
            <p className="mt-2 text-sm text-[#546057]">
              {data.merchant.businessType} · {data.merchant.city}
            </p>
            <p className="mt-2 text-sm text-[#556159]">
              {data.merchant.cardinWorld && DASHBOARD_VERTICAL_LINE[data.merchant.cardinWorld]
                ? DASHBOARD_VERTICAL_LINE[data.merchant.cardinWorld]
                : "Moteur de revenu saisonnier : Diamond comme horizon, missions sur le parcours, retour et activation réseau."}
            </p>
          </div>

          <Button onClick={onSignOut} variant="subtle">
            Se déconnecter
          </Button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Clients suivis" value={data.metrics.totalCards.toString()} />
          <MetricCard label="Avantages prêts" value={data.metrics.rewardReadyCards.toString()} />
          <MetricCard label="Fréquentation" value={data.metrics.totalVisits.toString()} />
          <MetricCard label="Clients revenus" value={data.metrics.repeatClients.toString()} />
          <MetricCard label="Progression active" value={data.metrics.midpointReachedCards.toString()} />
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Missions actives" value={data.metrics.missionActiveCount.toString()} />
          <MetricCard label="Missions validées" value={data.metrics.missionCompletedCount.toString()} />
          <MetricCard label="CA mission estimé" value={formatEuro(data.metrics.missionRevenueEstimate)} />
        </section>

        {data.protocol ? (
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Protocole économique</p>
            <p className="mt-3 text-sm text-[#173A2E]">{data.protocol.seasonObjective}</p>
            <p className="mt-2 text-sm text-[#556159]">{data.protocol.marginLine}</p>
            <p className="mt-2 text-sm text-[#556159]">{data.protocol.diamondLine}</p>
            <p className="mt-2 text-sm text-[#556159]">{data.protocol.growthLine}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <BudgetCard label="Saison" current={data.protocol.budgets.season.current} limit={data.protocol.budgets.season.limit} />
              <BudgetCard label="Semaine" current={data.protocol.budgets.week.current} limit={data.protocol.budgets.week.limit} />
              <BudgetCard label="Jour" current={data.protocol.budgets.day.current} limit={data.protocol.budgets.day.limit} />
              <BudgetCard label="Diamond" current={data.protocol.budgets.diamond.current} limit={data.protocol.budgets.diamond.limit} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StatPill label="État" value={data.protocol.state} />
              <StatPill label="Marge incrémentale (modèle)" value={formatEuro(data.protocol.projected.profitIncremental)} />
              <StatPill label="Sigma saison" value={data.protocol.projected.sigmaSeason.toFixed(1)} />
            </div>
            {data.protocol.rewardsPaused ? (
              <p className="mt-4 text-sm text-[#A64040]">Les nouveaux avantages sont temporairement en pause. La progression client continue.</p>
            ) : null}
          </Card>
        ) : null}

        {data.metrics.season ? (
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Saison active</p>
              <Button onClick={() => void onCloseSeason(data.metrics!.season!.seasonId)} size="sm" variant="secondary">
                Clôturer la saison
              </Button>
            </div>
            <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-2 text-sm text-[#173A2E]">
                <p>Saison {data.metrics.season.seasonNumber}</p>
                <p>Sommet : {data.metrics.season.summitTitle}</p>
                <p>Jours restants : {data.metrics.season.daysRemaining}</p>
                <p>Fin : {formatDate(data.metrics.season.endsAt)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatPill label="Domino" value={data.metrics.season.dominoUnlockedCount} />
                <StatPill label="Diamond" value={data.metrics.season.diamondCount} />
                <StatPill label="Sommet" value={data.metrics.season.summitCount} />
                <StatPill label="Invitations" value={data.metrics.season.totalInvitations} />
                <StatPill label="Activées" value={data.metrics.season.activatedInvitations} />
                <StatPill label="Taux" value={`${Math.round(data.metrics.season.activationRate * 100)}%`} />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
              <div className="flex gap-2 sm:grid sm:w-full sm:grid-cols-4 lg:grid-cols-8">
              {data.metrics.season.stepDistribution.map((step) => (
                <div className="w-[4.75rem] shrink-0 rounded-xl border border-[#D5DBD1] bg-[#FFFEFA] px-3 py-2 text-center sm:w-auto sm:shrink" key={step.step}>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#5E6961]">Étape {step.step}</p>
                  <p className="mt-1 font-serif text-xl text-[#173A2E]">{step.count}</p>
                </div>
              ))}
              </div>
            </div>

            <p className="mt-4 text-xs text-[#5E6961]">
              Winner pool : {data.metrics.season.winnerPool.eligibleCount} éligibles · poids total {data.metrics.season.winnerPool.totalWeight}
              {data.metrics.season.winnerPool.hasWinner ? ` · gagnant ${data.metrics.season.winnerPool.winnerId}` : ""}
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Saison</p>
                <p className="mt-2 text-sm text-[#173A2E]">Aucune saison active pour le moment.</p>
              </div>
              <Button onClick={() => void onStartSeason()} size="sm">
                Lancer la saison
              </Button>
            </div>
          </Card>
        )}

        {seasonAction !== "idle" ? (
          <Card className="p-4">
            <p className={`text-sm ${seasonAction === "error" ? "text-[#A64040]" : "text-[#173A2E]"}`}>{seasonMessage}</p>
          </Card>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">QR à afficher</p>
            <img alt="QR fidélité" className="mt-3 w-full rounded-2xl border border-[#D4DBD1] bg-[#FCFCF8] p-3" src={`/api/merchant/${merchantId}/qr`} />
            <p className="mt-3 break-all text-xs text-[#5E6961]">{scanUrl}</p>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                    void navigator.clipboard.writeText(scanUrl)
                    return
                  }

                  if (typeof window !== "undefined") {
                    window.prompt("Copiez ce lien :", scanUrl)
                  }
                }}
                variant="secondary"
              >
                Copier le lien de scan
              </Button>
              <a className="inline-flex items-center text-sm underline" download={`qr-${merchantId}.png`} href={`/api/merchant/${merchantId}/qr`}>
                Télécharger le QR
              </a>
            </div>
            <div className="mt-5 rounded-2xl border border-[#173A2E]/15 bg-[#EEF3EC] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#355246]">Rituel équipe</p>
              <p className="mt-2 text-sm text-[#2A3F35]">Ouvrez cette page sur le téléphone du staff : un clic valide le passage, puis l'avantage ou la mission si besoin.</p>
              <Link className="mt-3 inline-flex rounded-full border border-[#173A2E] bg-[#173A2E] px-5 py-2.5 text-sm font-medium text-[#FBFAF6]" href={`/merchant/${merchantId}/valider`}>
                Ouvrir la validation staff
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Cadre du parcours</p>
            <p className="mt-3 text-sm text-[#173A2E]">
              Objectif principal : {data.merchant.loyaltyConfig.targetVisits} passages vers {data.merchant.loyaltyConfig.rewardLabel}
            </p>
            <p className="mt-1 text-sm text-[#5E6961]">
              Milieu de parcours : {data.merchant.loyaltyConfig.midpointMode === "recognition_plus_boost" ? "reconnaissance + ajustement" : "reconnaissance uniquement"}
            </p>
            <p className="mt-3 text-sm text-[#173A2E]">Missions : une seule active max par client, déclenchée après un vrai passage validé.</p>

            {data.merchant.sharedUnlock.enabled ? (
              <div className="mt-4 rounded-2xl border border-[#D5DBD1] bg-[#FFFEFA] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Déblocage collectif</p>
                <p className="mt-2 text-sm text-[#173A2E]">Objectif : {data.merchant.sharedUnlock.objective} passages/mois</p>
                <p className="mt-1 text-sm text-[#173A2E]">Fenêtre active : {data.merchant.sharedUnlock.windowDays} jours</p>
                <p className="mt-1 text-sm text-[#173A2E]">Offre : {data.merchant.sharedUnlock.offer}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#5E6961]">Déblocage collectif non actif.</p>
            )}
          </Card>
        </section>

        {data.merchant.parcoursSelections ? (
          <ConfigurationRecap selections={data.merchant.parcoursSelections} />
        ) : null}

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Clients suivis</p>
          <div className="mt-3 space-y-3">
            {data.cards && data.cards.length > 0 ? (
              data.cards.map((card) => (
                <div className="rounded-2xl border border-[#D5DBD1] bg-[#FFFEFA] p-4" key={card.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{card.customerName}</p>
                    <span className="text-xs text-[#5E6961]">
                      {card.stamps} / {card.targetVisits}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#173A2E]">{formatCardCode(card.id)}</p>
                  <p className="mt-1 text-xs text-[#5E6961]">{card.midpoint.reached ? "Cap intermédiaire atteint" : `Cap intermédiaire à ${card.midpoint.threshold} passages`}</p>
                  <p className="mt-1 text-xs text-[#5E6961]">Dernière activité : {formatDate(card.lastVisitAt)}</p>

                  {card.seasonProgress ? (
                    <div className="mt-2 rounded-xl border border-[#D5DBD1] bg-[#F8FAF6] px-3 py-2 text-xs text-[#234438]">
                      <p>
                        Etape {card.seasonProgress.currentStep} · {card.seasonProgress.stepLabel}
                      </p>
                      <p>
                        Invitations {card.seasonProgress.branchesUsed}/{card.seasonProgress.branchCapacity} · activées {card.seasonProgress.directInvitationsActivated}
                      </p>
                      <p>
                        État : {card.seasonProgress.diamondUnlocked ? "Diamond" : "en progression"}
                        {card.seasonProgress.summitReached ? " · sommet atteint" : ""}
                        {card.diamondTokenAvailable ? " · token Diamond actif" : ""}
                      </p>
                    </div>
                  ) : null}

                  {card.mission ? (
                    <div className="mt-3 rounded-xl border border-[#D5DBD1] bg-[#F8FAF6] px-3 py-2 text-xs text-[#234438]">
                      Mission : {card.mission.title} · expire le {formatDate(card.mission.expiresAt)}
                    </div>
                  ) : null}

                  <div className="mt-3 rounded-xl border border-[#D5DBD1] bg-[#F8FAF6] px-3 py-2 text-xs text-[#355246]">
                    La progression se valide uniquement depuis la page staff.
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#5E6961]">Aucun client encore. Lancez le QR en caisse.</p>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">{label}</p>
      <p className="mt-2 font-serif text-4xl">{value}</p>
    </Card>
  )
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#D5DBD1] bg-[#FFFEFA] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#5E6961]">{label}</p>
      <p className="mt-1 font-serif text-xl text-[#173A2E]">{value}</p>
    </div>
  )
}

function BudgetCard({ label, current, limit }: { label: string; current: number; limit: number }) {
  const ratio = limit > 0 ? Math.min(1, current / limit) : 0
  return (
    <div className="rounded-xl border border-[#D5DBD1] bg-[#FFFEFA] px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#5E6961]">{label}</p>
      <p className="mt-1 text-sm text-[#173A2E]">
        {formatEuro(current)} / {formatEuro(limit)}
      </p>
      <div className="mt-2 h-2 rounded-full bg-[#E3E8E0]">
        <div className="h-2 rounded-full bg-[#173A2E]" style={{ width: `${Math.max(4, ratio * 100)}%` }} />
      </div>
    </div>
  )
}

function formatCardCode(cardId: string) {
  const normalized = cardId.replace(/-/g, "").toUpperCase()
  const head = normalized.slice(0, 2) || "CD"
  const tail = normalized.slice(-4) || "0000"
  return `${head}-${tail}`
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  try {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
  }
}



