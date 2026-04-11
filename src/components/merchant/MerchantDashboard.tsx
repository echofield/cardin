"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"

import { getMerchantProfile, type MerchantProfileId } from "@/lib/merchant-profile"
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
    profileId: MerchantProfileId
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

  const profile = getMerchantProfile(data?.merchant?.profileId ?? "generic")

  const midpointLabel = useMemo(() => {
    const mode = data?.merchant?.loyaltyConfig.midpointMode
    if (mode === "recognition_plus_boost") {
      return `${profile.owner.midpointLabel} : reconnaissance + ajustement`
    }

    return `${profile.owner.midpointLabel} : reconnaissance uniquement`
  }, [data, profile])

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
    setSeasonMessage(`Saison ${payload.season.seasonNumber} lanc�e.`)
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
      setSeasonMessage("Impossible de cl�turer la saison pour le moment.")
      return
    }

    setSeasonAction("success")
    setSeasonMessage(`Saison ${payload.closedSeason.seasonNumber} cl�tur�e, nouvelle saison ouverte.`)
    await loadMerchant()
  }

  const onSignOut = async () => {
    const supabase = createClientSupabaseBrowser()
    await supabase.auth.signOut()
    if (typeof window !== "undefined") window.location.href = "/login"
  }

  if (loading) {
    return <p className="p-6 text-sm">{profile.owner.loading}</p>
  }

  if (!data?.ok || !data.merchant || !data.metrics) {
    return <p className="p-6 text-sm text-[#A64040]">{profile.owner.notFound}</p>
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#173A2E] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">{profile.owner.eyebrow}</p>
            <h1 className="mt-2 font-serif text-5xl">{data.merchant.businessName}</h1>
            <p className="mt-2 text-sm text-[#546057]">
              {data.merchant.businessType} � {data.merchant.city}
            </p>
            <p className="mt-2 text-sm text-[#556159]">{profile.owner.subtitle}</p>
          </div>

          <Button onClick={onSignOut} variant="subtle">
            {profile.owner.signOutLabel}
          </Button>
        </header>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.owner.summaryTitle}</p>
          <p className="mt-2 text-sm text-[#173A2E]">
            {profile.owner.summaryNarrative({
              totalVisits: data.metrics.totalVisits,
              repeatClients: data.metrics.repeatClients,
              rewardReadyCards: data.metrics.rewardReadyCards,
            })}
          </p>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label={profile.owner.metrics.trackedClients} value={data.metrics.totalCards.toString()} />
          <MetricCard label={profile.owner.metrics.unlockedBenefits} value={data.metrics.rewardReadyCards.toString()} />
          <MetricCard label={profile.owner.metrics.traffic} value={data.metrics.totalVisits.toString()} />
          <MetricCard label={profile.owner.metrics.returningClients} value={data.metrics.repeatClients.toString()} />
          <MetricCard label={profile.owner.metrics.progression} value={data.metrics.midpointReachedCards.toString()} />
        </section>

        {data.metrics.season ? (
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.owner.seasonTitle}</p>
              <Button onClick={() => void onCloseSeason(data.metrics!.season!.seasonId)} size="sm" variant="secondary">
                {profile.owner.seasonCloseAction}
              </Button>
            </div>
            <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-2 text-sm text-[#173A2E]">
                <p>Saison {data.metrics.season.seasonNumber}</p>
                <p>Sommet : {data.metrics.season.summitTitle}</p>
                <p>
                  {profile.owner.seasonDaysRemainingLabel} : {data.metrics.season.daysRemaining}
                </p>
                <p>
                  {profile.owner.seasonEndLabel} : {formatDate(data.metrics.season.endsAt)}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatPill label={profile.owner.seasonMetricLabels.dominoUnlocked} value={data.metrics.season.dominoUnlockedCount} />
                <StatPill label={profile.owner.seasonMetricLabels.diamond} value={data.metrics.season.diamondCount} />
                <StatPill label={profile.owner.seasonMetricLabels.summitReached} value={data.metrics.season.summitCount} />
                <StatPill label={profile.owner.seasonMetricLabels.invitations} value={data.metrics.season.totalInvitations} />
                <StatPill label={profile.owner.seasonMetricLabels.activatedInvitations} value={data.metrics.season.activatedInvitations} />
                <StatPill label={profile.owner.seasonMetricLabels.activationRate} value={`${Math.round(data.metrics.season.activationRate * 100)}%`} />
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {data.metrics.season.stepDistribution.map((step) => (
                <div className="rounded-xl border border-[#D5DBD1] bg-[#FFFEFA] px-3 py-2 text-center" key={step.step}>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#5E6961]">
                    {profile.owner.seasonMetricLabels.stepLabel} {step.step}
                  </p>
                  <p className="mt-1 font-serif text-xl text-[#173A2E]">{step.count}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-[#5E6961]">
              {profile.owner.winnerPoolLabel} : {data.metrics.season.winnerPool.eligibleCount} �ligibles � poids total {data.metrics.season.winnerPool.totalWeight}
              {data.metrics.season.winnerPool.hasWinner ? ` � gagnant ${data.metrics.season.winnerPool.winnerId}` : ""}
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.owner.seasonTitle}</p>
                <p className="mt-2 text-sm text-[#173A2E]">{profile.owner.seasonInactive}</p>
              </div>
              <Button onClick={() => void onStartSeason()} size="sm">
                {profile.owner.seasonStartAction}
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
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.owner.qrTitle}</p>
            <img alt="QR fid�lit�" className="mt-3 w-full rounded-2xl border border-[#D4DBD1] bg-[#FCFCF8] p-3" src={`/api/merchant/${merchantId}/qr`} />
            <p className="mt-3 break-all text-xs text-[#5E6961]">{scanUrl}</p>
            {data.metrics.season ? (
              <div className="mt-3 rounded-2xl border border-[#D5DBD1] bg-[#FFFEFA] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.owner.qrCounterTitle}</p>
                <p className="mt-2 text-sm text-[#173A2E]">{data.metrics.season.summitTitle}</p>
                <p className="mt-1 text-xs text-[#5E6961]">{profile.owner.qrCounterBody}</p>
              </div>
            ) : null}
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                    void navigator.clipboard.writeText(scanUrl)
                    return
                  }

                  if (typeof window !== "undefined") {
                    window.prompt(profile.owner.scanLinkPrompt, scanUrl)
                  }
                }}
                variant="secondary"
              >
                {profile.owner.qrCopyLabel}
              </Button>
              <a className="inline-flex items-center text-sm underline" download={`qr-${merchantId}.png`} href={`/api/merchant/${merchantId}/qr`}>
                {profile.owner.qrDownloadLabel}
              </a>
            </div>
            <div className="mt-5 rounded-2xl border border-[#173A2E]/15 bg-[#EEF3EC] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#355246]">{profile.owner.validationTitle}</p>
              <p className="mt-2 text-sm text-[#2A3F35]">{profile.owner.validationBody}</p>
              <Link className="mt-3 inline-flex rounded-full border border-[#173A2E] bg-[#173A2E] px-5 py-2.5 text-sm font-medium text-[#FBFAF6]" href={`/merchant/${merchantId}/valider`}>
                {profile.owner.validationAction}
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.owner.settingsTitle}</p>
            <p className="mt-3 text-sm text-[#173A2E]">
              {profile.owner.mainObjectiveLabel} : {data.merchant.loyaltyConfig.targetVisits} passages vers {data.merchant.loyaltyConfig.rewardLabel}
            </p>
            <p className="mt-1 text-sm text-[#5E6961]">{midpointLabel}</p>

            {data.merchant.sharedUnlock.enabled ? (
              <div className="mt-4 rounded-2xl border border-[#D5DBD1] bg-[#FFFEFA] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.owner.collectiveUnlockTitle}</p>
                <p className="mt-2 text-sm text-[#173A2E]">Objectif : {data.merchant.sharedUnlock.objective} passages/mois</p>
                <p className="mt-1 text-sm text-[#173A2E]">Fen�tre active : {data.merchant.sharedUnlock.windowDays} jours</p>
                <p className="mt-1 text-sm text-[#173A2E]">Offre : {data.merchant.sharedUnlock.offer}</p>
                <p className="mt-2 text-sm text-[#5E6961]">
                  �0tat : {data.merchant.sharedUnlock.status === "active" ? profile.owner.collectiveUnlockStateActive : profile.owner.collectiveUnlockStateTracking}
                  {data.merchant.sharedUnlock.activeUntil ? ` jusqu'au ${formatDate(data.merchant.sharedUnlock.activeUntil)}` : ""}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#5E6961]">{profile.owner.collectiveUnlockDisabled}</p>
            )}
          </Card>
        </section>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.owner.trackedClientsTitle}</p>
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
                  <p className="mt-1 text-xs text-[#5E6961]">{card.midpoint.reached ? "Cap interm�diaire atteint" : `Cap interm�diaire � ${card.midpoint.threshold} passages`}</p>
                  <p className="mt-1 text-xs text-[#5E6961]">Derni�re activit� : {formatDate(card.lastVisitAt)}</p>

                  {card.seasonProgress ? (
                    <div className="mt-2 rounded-xl border border-[#D5DBD1] bg-[#F8FAF6] px-3 py-2 text-xs text-[#234438]">
                      <p>
                        {profile.owner.seasonMetricLabels.stepLabel} {card.seasonProgress.currentStep} � {card.seasonProgress.stepLabel}
                      </p>
                      <p>
                        {profile.owner.seasonMetricLabels.dominoUnlocked} {card.seasonProgress.branchesUsed}/{card.seasonProgress.branchCapacity} � {profile.owner.seasonMetricLabels.activatedInvitations.toLowerCase()} {card.seasonProgress.directInvitationsActivated}
                      </p>
                      <p>
                        {profile.owner.seasonMetricLabels.stateLabel} : {card.seasonProgress.diamondUnlocked ? profile.owner.seasonMetricLabels.diamond : "en progression"}
                        {card.seasonProgress.summitReached ? ` � ${profile.owner.seasonMetricLabels.summitReached.toLowerCase()}` : ""}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-3 rounded-xl border border-[#D5DBD1] bg-[#F8FAF6] px-3 py-2 text-xs text-[#355246]">
                    {profile.owner.validationOnlyHint}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#5E6961]">{profile.owner.trackedClientsEmpty}</p>
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
