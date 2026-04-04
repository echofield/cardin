"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { Card } from "@/ui"

import { WalletPassPreview } from "@/components/engine/WalletPassPreview"

type MidpointView = {
  mode: "recognition_only" | "recognition_plus_boost"
  threshold: number
  reached: boolean
  reachedAt: string | null
  copy: string
}

type SharedUnlockView = {
  enabled: boolean
  objective: number
  progress: number
  windowDays: number
  offer: string
  status: "disabled" | "tracking" | "active"
  activeUntil: string | null
}

type CardApiResponse = {
  ok: boolean
  card?: {
    id: string
    customerName: string
    stamps: number
    targetVisits: number
    rewardLabel: string
    midpoint: MidpointView
    status: "active" | "reward_ready" | "redeemed"
  }
  merchant?: {
    id: string
    businessName: string
    businessType: string
    sharedUnlock?: SharedUnlockView | null
  } | null
}

export function CardPhoneView({ cardId }: { cardId: string }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CardApiResponse | null>(null)

  useEffect(() => {
    let mounted = true

    const loadCard = async () => {
      setLoading(true)

      try {
        const response = await fetch(`/api/public/card/${cardId}`)
        const payload = (await response.json()) as CardApiResponse

        if (mounted) {
          setData(payload)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCard()

    return () => {
      mounted = false
    }
  }, [cardId])

  const statusLabel = useMemo(() => {
    if (!data?.card) return ""
    if (data.card.status === "reward_ready") return "Recompense disponible"
    if (data.card.status === "redeemed") return "Recompense utilisee"
    return "Carte active"
  }, [data])

  if (loading) {
    return <p className="p-6 text-sm">Chargement de votre carte...</p>
  }

  if (!data?.ok || !data.card || !data.merchant) {
    return <p className="p-6 text-sm text-[#A64040]">Carte introuvable.</p>
  }

  const progressDots = Math.max(4, Math.min(data.card.targetVisits, 10))
  const sharedUnlock = data.merchant.sharedUnlock

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#173A2E] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <p className="text-xs uppercase tracking-[0.14em] text-[#5D675F]">Votre carte fidelite</p>
        <h1 className="mt-2 font-serif text-5xl">{data.merchant.businessName}</h1>
        <p className="mt-2 text-sm text-[#556159]">
          {data.card.customerName} · {statusLabel}
        </p>

        <div className="mt-6 rounded-[2rem] border border-[#CCD4CA] bg-[#FBFAF6] p-4 shadow-[0_30px_70px_-60px_rgba(20,48,38,0.8)]">
          <WalletPassPreview businessLabel={data.merchant.businessName} progressDots={progressDots} rewardLabel={data.card.rewardLabel} />

          <Card className="mt-4 p-4">
            <p className="text-sm text-[#556159]">Progression actuelle</p>
            <p className="mt-1 text-xl">
              {data.card.stamps} / {data.card.targetVisits}
            </p>
            <p className="mt-2 text-sm text-[#2A3F35]">{data.card.midpoint.copy}</p>
          </Card>

          {sharedUnlock?.enabled ? (
            <Card className="mt-4 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Deblocage collectif</p>
              <p className="mt-1 text-sm text-[#173A2E]">
                {sharedUnlock.progress} / {sharedUnlock.objective} passages ce mois
              </p>
              <p className="mt-1 text-xs text-[#5D675F]">Offre debloquee: {sharedUnlock.offer}</p>
              {sharedUnlock.status === "active" ? <p className="mt-2 text-sm text-[#173A2E]">Deblocage collectif actif.</p> : null}
            </Card>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link className="text-sm underline" href={`/scan/${data.merchant.id}`}>
            Creer une autre carte
          </Link>
          <Link className="text-sm underline" href="/landing">
            Site Cardin
          </Link>
        </div>
      </div>
    </main>
  )
}
