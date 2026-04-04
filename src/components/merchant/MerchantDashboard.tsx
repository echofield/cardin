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
  }>
}

export function MerchantDashboard({ merchantId }: { merchantId: string }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MerchantApiResponse | null>(null)
  const [scanUrl, setScanUrl] = useState(`/scan/${merchantId}`)

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
      setScanUrl(`${window.location.origin}/scan/${merchantId}`)
    }
  }, [merchantId])

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

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Cartes actives" value={data.metrics.totalCards.toString()} />
          <MetricCard label="Recompenses pretes" value={data.metrics.rewardReadyCards.toString()} />
          <MetricCard label="Passages valides" value={data.metrics.totalVisits.toString()} />
          <MetricCard label="Clients recurrents" value={data.metrics.repeatClients.toString()} />
          <MetricCard label="Cap franchi" value={data.metrics.midpointReachedCards.toString()} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">QR a afficher</p>
            <img
              alt="QR fidelite"
              className="mt-3 w-full rounded-2xl border border-[#D4DBD1] bg-[#FCFCF8] p-3"
              src={`/api/merchant/${merchantId}/qr`}
            />
            <p className="mt-3 break-all text-xs text-[#5E6961]">{scanUrl}</p>
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
                  <p className="mt-1 text-xs text-[#5E6961]">
                    {card.midpoint.reached ? "Cap de reconnaissance atteint" : `Cap a ${card.midpoint.threshold} passages`}
                  </p>
                  <p className="mt-1 text-xs text-[#5E6961]">Derniere activite: {formatDate(card.lastVisitAt)}</p>

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
