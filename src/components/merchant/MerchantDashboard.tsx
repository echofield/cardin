"use client"

import { useEffect, useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { createClientSupabaseBrowser } from "@/lib/supabase/client"
import { Button, Card } from "@/ui"

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

type MerchantApiResponse = {
  ok: boolean
  merchant?: {
    id: string
    businessName: string
    businessType: string
    city: string
    loyaltyConfig: {
      targetVisits: number
      rewardLabel: string
      midpointMode: "recognition_only" | "recognition_plus_boost"
    }
    sharedUnlock: SharedUnlockView
  }
  metrics?: {
    totalCards: number
    rewardReadyCards: number
    totalVisits: number
    repeatClients: number
    midpointReachedCards: number
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
  }>
}

export function MerchantDashboard({ merchantId, demo = false }: { merchantId: string; demo?: boolean }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MerchantApiResponse | null>(null)
  const [scanUrl, setScanUrl] = useState(`/scan/${merchantId}${demo ? "?demo=1" : ""}`)
  const [seasonAction, setSeasonAction] = useState<"idle" | "loading" | "error" | "success">("idle")
  const [seasonMessage, setSeasonMessage] = useState<string>("")

  const loadMerchant = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/merchant/${merchantId}`)
      const payload = (await response.json()) as MerchantApiResponse
      setData(payload)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMerchant()

    if (typeof window !== "undefined") {
      setScanUrl(`${window.location.origin}/scan/${merchantId}${demo ? "?demo=1" : ""}`)
    }
  }, [merchantId, demo])

  const midpointLabel = useMemo(() => {
    const mode = data?.merchant?.loyaltyConfig.midpointMode
    if (mode === "recognition_plus_boost") {
      return "Reconnaissance + ajustement"
    }

    return "Reconnaissance uniquement"
  }, [data])

  const onStamp = async (cardId: string, action: "stamp" | "redeem") => {
    await fetch(`/api/card/${cardId}/stamp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })

    trackEvent("merchant_stamp", { cardId, action, merchantId })
    await loadMerchant()
  }

  const onStartSeason = async () => {
    setSeasonAction("loading")
    setSeasonMessage("")

    const response = await fetch("/api/season/start", { method: "POST" })
    const payload = await response.json()

    if (!response.ok || !payload.ok) {
      setSeasonAction("error")
      setSeasonMessage(payload.error ?? "season_start_failed")
      return
    }

    setSeasonAction("success")
    setSeasonMessage(`Saison ${payload.season.seasonNumber} lancee.`)
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
      setSeasonMessage(payload.error ?? "season_close_failed")
      return
    }

    setSeasonAction("success")
    setSeasonMessage(`Saison ${payload.closedSeason.seasonNumber} cloturee, nouvelle saison ouverte.`)
    await loadMerchant()
  }

  const onSignOut = async () => {
    const supabase = createClientSupabaseBrowser()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (loading) {
    return <p className="p-6 text-sm">Chargement...</p>
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
          </div>

          <Button onClick={onSignOut} variant="subtle">
            Se deconnecter
          </Button>
        </header>

                {demo ? (
          <Card className="p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Mode demo</p>
            <p className="mt-2 text-sm text-[#173A2E]">Parcours en direct: scan QR, creation carte, progression visible cote client et cote marchand.</p>
          </Card>
        ) : null}
<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Cartes actives" value={data.metrics.totalCards.toString()} />
          <MetricCard label="Recompenses pretes" value={data.metrics.rewardReadyCards.toString()} />
          <MetricCard label="Passages valides" value={data.metrics.totalVisits.toString()} />
          <MetricCard label="Clients recurrents" value={data.metrics.repeatClients.toString()} />
          <MetricCard label="Cap franchi" value={data.metrics.midpointReachedCards.toString()} />
        </section>

        {data.metrics.season ? (
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Saison active</p>
              <Button onClick={() => onCloseSeason(data.metrics!.season!.seasonId)} size="sm" variant="secondary">
                Cloturer la saison
              </Button>
            </div>
            <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-2 text-sm text-[#173A2E]">
                <p>Saison {data.metrics.season.seasonNumber}</p>
                <p>Sommet: {data.metrics.season.summitTitle}</p>
                <p>Jours restants: {data.metrics.season.daysRemaining}</p>
                <p>Fin: {formatDate(data.metrics.season.endsAt)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatPill label="Domino ouverts" value={data.metrics.season.dominoUnlockedCount} />
                <StatPill label="Diamond" value={data.metrics.season.diamondCount} />
                <StatPill label="Sommet atteint" value={data.metrics.season.summitCount} />
                <StatPill label="Invitations" value={data.metrics.season.totalInvitations} />
                <StatPill label="Invitees actives" value={data.metrics.season.activatedInvitations} />
                <StatPill label="Taux activation" value={`${Math.round(data.metrics.season.activationRate * 100)}%`} />
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {data.metrics.season.stepDistribution.map((step) => (
                <div className="rounded-xl border border-[#D5DBD1] bg-[#FFFEFA] px-3 py-2 text-center" key={step.step}>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#5E6961]">Etape {step.step}</p>
                  <p className="mt-1 font-serif text-xl text-[#173A2E]">{step.count}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-[#5E6961]">
              Winner pool: {data.metrics.season.winnerPool.eligibleCount} eligibles · poids total {data.metrics.season.winnerPool.totalWeight}
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
              <Button onClick={onStartSeason} size="sm">
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
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">QR a afficher</p>
            <img
              alt="QR fidelite"
              className="mt-3 w-full rounded-2xl border border-[#D4DBD1] bg-[#FCFCF8] p-3"
              src={`/api/merchant/${merchantId}/qr`}
            />
            <p className="mt-3 break-all text-xs text-[#5E6961]">{scanUrl}</p>
            {data.metrics.season ? (
              <div className="mt-3 rounded-2xl border border-[#D5DBD1] bg-[#FFFEFA] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Presentoir sommet</p>
                <p className="mt-2 text-sm text-[#173A2E]">{data.metrics.season.summitTitle}</p>
                <p className="mt-1 text-xs text-[#5E6961]">Affichage recommande au comptoir avec QR actif.</p>
              </div>
            ) : null}
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(scanUrl)
                }}
                variant="secondary"
              >
                Copier le lien scan
              </Button>
              <a className="inline-flex items-center text-sm underline" download={`qr-${merchantId}.png`} href={`/api/merchant/${merchantId}/qr`}>
                Telecharger QR
              </a>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Parametres actifs</p>
            <p className="mt-3 text-sm text-[#173A2E]">
              Objectif principal: {data.merchant.loyaltyConfig.targetVisits} passages {"->"} {data.merchant.loyaltyConfig.rewardLabel}
            </p>
            <p className="mt-1 text-sm text-[#5E6961]">Milieu de parcours: {midpointLabel}</p>

            {data.merchant.sharedUnlock.enabled ? (
              <div className="mt-4 rounded-2xl border border-[#D5DBD1] bg-[#FFFEFA] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Deblocage collectif</p>
                <p className="mt-2 text-sm text-[#173A2E]">Objectif: {data.merchant.sharedUnlock.objective} passages/mois</p>
                <p className="mt-1 text-sm text-[#173A2E]">Fenetre active: {data.merchant.sharedUnlock.windowDays} jours</p>
                <p className="mt-1 text-sm text-[#173A2E]">Offre debloquee: {data.merchant.sharedUnlock.offer}</p>
                <p className="mt-2 text-sm text-[#5E6961]">
                  Etat: {data.merchant.sharedUnlock.status === "active" ? "actif" : "en suivi"}
                  {data.merchant.sharedUnlock.activeUntil ? ` jusqu'au ${formatDate(data.merchant.sharedUnlock.activeUntil)}` : ""}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#5E6961]">Deblocage collectif non active.</p>
            )}
          </Card>
        </section>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Clients recents</p>
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
                  <p className="mt-1 text-xs text-[#5E6961]">{card.id}</p>
                  <p className="mt-1 text-xs text-[#173A2E]">Code carte: {formatCardCode(card.id)}</p>
                  <p className="mt-1 text-xs text-[#5E6961]">
                    {card.midpoint.reached ? "Cap de reconnaissance atteint" : `Cap a ${card.midpoint.threshold} passages`}
                  </p>
                  <p className="mt-1 text-xs text-[#5E6961]">Derniere activite: {formatDate(card.lastVisitAt)}</p>

                  {card.seasonProgress ? (
                    <div className="mt-2 rounded-xl border border-[#D5DBD1] bg-[#F8FAF6] px-3 py-2 text-xs text-[#234438]">
                      <p>
                        Saison: etape {card.seasonProgress.currentStep} · {card.seasonProgress.stepLabel}
                      </p>
                      <p>
                        Domino {card.seasonProgress.branchesUsed}/{card.seasonProgress.branchCapacity} · invitees actives {card.seasonProgress.directInvitationsActivated}
                      </p>
                      <p>
                        Etat: {card.seasonProgress.diamondUnlocked ? "Diamond" : "en progression"}
                        {card.seasonProgress.summitReached ? " · sommet atteint" : ""}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => onStamp(card.id, "stamp")} size="sm" variant="secondary">
                      +1 passage
                    </Button>
                    {card.status === "reward_ready" ? (
                      <Button onClick={() => onStamp(card.id, "redeem")} size="sm">
                        Recompense donnee
                      </Button>
                    ) : null}
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

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}



