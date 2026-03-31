"use client"

import { useEffect, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { createClientSupabaseBrowser } from "@/lib/supabase/client"
import { Button, Card } from "@/ui"

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
    }
  }
  metrics?: {
    totalCards: number
    rewardReadyCards: number
    totalVisits: number
    repeatClients: number
  }
  cards?: Array<{
    id: string
    customerName: string
    stamps: number
    targetVisits: number
    status: "active" | "reward_ready" | "redeemed"
    lastVisitAt: string
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
    loadMerchant()

    if (typeof window !== "undefined") {
      setScanUrl(`${window.location.origin}/scan/${merchantId}`)
    }
  }, [merchantId])

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
            Se déconnecter
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Cartes actives" value={data.metrics.totalCards.toString()} />
          <MetricCard label="Récompenses prêtes" value={data.metrics.rewardReadyCards.toString()} />
          <MetricCard label="Passages validés" value={data.metrics.totalVisits.toString()} />
          <MetricCard label="Clients récurrents" value={data.metrics.repeatClients.toString()} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">QR à afficher</p>
            <img
              alt="QR fidélité"
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
                Télécharger QR
              </a>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Clients récents</p>
            <div className="mt-3 space-y-3">
              {data.cards && data.cards.length > 0 ? (
                data.cards.map((card) => (
                  <div className="rounded-2xl border border-[#D5DBD1] bg-[#FFFEFA] p-4" key={card.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{card.customerName}</p>
                      <span className="text-xs text-[#5E6961]">
                        {card.stamps} / {card.targetVisits}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#5E6961]">{card.id}</p>

                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => onStamp(card.id, "stamp")} size="sm" variant="secondary">
                        +1 passage
                      </Button>
                      {card.status === "reward_ready" ? (
                        <Button onClick={() => onStamp(card.id, "redeem")} size="sm">
                          Récompense donnée
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
        </section>
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
