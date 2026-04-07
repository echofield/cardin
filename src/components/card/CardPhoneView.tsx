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

function formatCardCode(cardId: string) {
  const normalized = cardId.replace(/-/g, "").toUpperCase()
  const head = normalized.slice(0, 2) || "CD"
  const tail = normalized.slice(-4) || "0000"
  return `${head}-${tail}`
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
  }
  merchant?: {
    id: string
    businessName: string
    businessType: string
    sharedUnlock?: SharedUnlockView | null
  } | null
  season?: {
    id: string
    number: number
    summitTitle: string
    daysRemaining: number
    endsAt: string
  } | null
  invite?: {
    enabled: boolean
    reason: string | null
    remainingSlots: number
    branchCapacity: number
  } | null
}

export function CardPhoneView({ cardId, demo = false }: { cardId: string; demo?: boolean }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CardApiResponse | null>(null)
  const [inviteName, setInviteName] = useState("")
  const [inviteState, setInviteState] = useState<"idle" | "loading" | "error" | "success">("idle")
  const [inviteMessage, setInviteMessage] = useState("")

  const loadCard = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/public/card/${cardId}`)
      const payload = (await response.json()) as CardApiResponse
      setData(payload)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCard()
  }, [cardId])

  const statusLabel = useMemo(() => {
    if (!data?.card) return ""
    if (data.card.status === "reward_ready") return "Recompense disponible"
    if (data.card.status === "redeemed") return "Recompense utilisee"
    return "Carte active"
  }, [data])

  const onInvite = async () => {
    if (!inviteName.trim()) {
      setInviteState("error")
      setInviteMessage("Nom requis pour inviter")
      return
    }

    setInviteState("loading")
    setInviteMessage("")

    const response = await fetch(`/api/public/card/${cardId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: inviteName.trim() }),
    })

    const payload = await response.json()
    if (!response.ok || !payload.ok) {
      setInviteState("error")
      setInviteMessage(payload.error ?? "invite_failed")
      return
    }

    setInviteState("success")
    setInviteMessage(`Invitation creee. Slots restants: ${payload.invitation.remainingSlots}`)
    setInviteName("")
    await loadCard()
  }

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
        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#173A2E]">
          Code carte: {formatCardCode(data.card.id)}{demo ? " · mode demo" : ""}
        </p>

        <div className="mt-6 rounded-[2rem] border border-[#CCD4CA] bg-[#FBFAF6] p-4 shadow-[0_30px_70px_-60px_rgba(20,48,38,0.8)]">
          <WalletPassPreview businessLabel={data.merchant.businessName} progressDots={progressDots} rewardLabel={data.card.rewardLabel} />

          <Card className="mt-4 p-4">
            <p className="text-sm text-[#556159]">Progression actuelle</p>
            <p className="mt-1 text-xl">
              {data.card.stamps} / {data.card.targetVisits}
            </p>
            <p className="mt-2 text-sm text-[#2A3F35]">{data.card.midpoint.copy}</p>
            {data.card.seasonProgress ? (
              <div className="mt-3 text-xs text-[#355246]">
                <p>Etape {data.card.seasonProgress.currentStep} · {data.card.seasonProgress.stepLabel}</p>
                <p>Domino {data.card.seasonProgress.branchesUsed}/{data.card.seasonProgress.branchCapacity}</p>
              </div>
            ) : null}
          </Card>

          {data.invite ? (
            <Card className="mt-4 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">Domino</p>
              <p className="mt-1 text-sm text-[#173A2E]">
                {data.invite.enabled
                  ? `Vous pouvez inviter (${data.invite.remainingSlots} / ${data.invite.branchCapacity} slots restants).`
                  : "Invitation verrouillee pour le moment."}
              </p>
              {data.invite.enabled ? (
                <div className="mt-3 flex gap-2">
                  <input
                    className="h-10 flex-1 rounded-xl border border-[#D5DBD1] bg-white px-3 text-sm"
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Nom de la personne invitee"
                    value={inviteName}
                  />
                  <button
                    className="rounded-xl bg-[#173A2E] px-4 text-sm text-white disabled:opacity-60"
                    disabled={inviteState === "loading"}
                    onClick={onInvite}
                    type="button"
                  >
                    Inviter
                  </button>
                </div>
              ) : null}
              {inviteState !== "idle" ? (
                <p className={`mt-2 text-xs ${inviteState === "error" ? "text-[#A64040]" : "text-[#2A3F35]"}`}>{inviteMessage}</p>
              ) : null}
            </Card>
          ) : null}

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

          {data.season ? (
            <p className="mt-4 text-xs text-[#5E6961]">
              Saison {data.season.number} · sommet {data.season.summitTitle} · {data.season.daysRemaining} jours restants
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link className="text-sm underline" href={`/scan/${data.merchant.id}${demo ? "?demo=1" : ""}`}>
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




