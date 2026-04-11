"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { getSummitOptions, normalizeCardinWorld } from "@/lib/client-parcours-config"
import type { LandingWorldId } from "@/lib/landing-content"
import { getMerchantProfile, type MerchantProfileId } from "@/lib/merchant-profile"
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

type CardPrimaryMessage = {
  kind: "collective" | "comeback" | "domino" | "progress" | "summit" | "weak_day"
  title: string
  body: string
}

function formatLegacyCardCode(cardId: string) {
  const normalized = cardId.replace(/-/g, "").toUpperCase()
  const head = normalized.slice(0, 2) || "CD"
  const tail = normalized.slice(-4) || "0000"
  return `${head}-${tail}`
}

type CardApiResponse = {
  ok: boolean
  card?: {
    id: string
    code: string
    customerName: string
    stamps: number
    targetVisits: number
    rewardLabel: string
    midpoint: MidpointView
    status: "active" | "reward_ready" | "redeemed"
    statusName?: string | null
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
    summitReward?: {
      optionId: string
      title: string
      description: string
      usageRemaining: number
    } | null
  }
  merchant?: {
    id: string
    businessName: string
    businessType: string
    profileId: MerchantProfileId
    cardinWorld?: string
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
  message?: CardPrimaryMessage
}

export function CardPhoneView({
  cardRef,
  refType = "id",
  demo = false,
}: {
  cardRef: string
  refType?: "id" | "code"
  demo?: boolean
}) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CardApiResponse | null>(null)
  const [inviteName, setInviteName] = useState("")
  const [inviteState, setInviteState] = useState<"idle" | "loading" | "error" | "success">("idle")
  const [inviteMessage, setInviteMessage] = useState("")
  const [merchantValidatedBanner, setMerchantValidatedBanner] = useState(false)
  const [summitPickState, setSummitPickState] = useState<"idle" | "loading" | "error">("idle")
  const [summitPickMessage, setSummitPickMessage] = useState("")
  const [accessGateReady, setAccessGateReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const lastStampsRef = useRef<number | null>(null)

  const storageKey = useMemo(() => `cardin:access:${cardRef}`, [cardRef])

  const endpoint = useMemo(
    () => (refType === "code" ? `/api/public/card/code/${encodeURIComponent(cardRef)}` : `/api/public/card/${cardRef}`),
    [cardRef, refType],
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const t = params.get("access_token")
    if (t) {
      sessionStorage.setItem(storageKey, t)
      params.delete("access_token")
      const qs = params.toString()
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`)
    }
    setAccessGateReady(true)
  }, [storageKey])

  const authHeaders = useCallback((): HeadersInit => {
    if (typeof window === "undefined") return {}
    const token = sessionStorage.getItem(storageKey)
    if (!token) return {}
    return { Authorization: `Bearer ${token}` }
  }, [storageKey])

  const loadCard = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch(endpoint, { headers: authHeaders() })
      const payload = (await response.json()) as CardApiResponse & { error?: string }
      if (!response.ok) {
        setLoadError(payload.error ?? "load_failed")
        setData(null)
        return
      }
      setLoadError(null)
      setData(payload)
      if (payload.ok && payload.card?.id && typeof window !== "undefined") {
        const tok = sessionStorage.getItem(storageKey)
        if (tok && cardRef !== payload.card.id) {
          sessionStorage.setItem(`cardin:access:${payload.card.id}`, tok)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint, authHeaders, storageKey, cardRef])

  useEffect(() => {
    if (!accessGateReady) return
    void loadCard()
  }, [loadCard, accessGateReady])

  useEffect(() => {
    if (demo || !data?.ok || !data.card?.id) return
    void fetch("/api/public/visit-session/open", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ cardId: data.card.id }),
    }).catch(() => {
      /* noop */
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.card?.id, data?.ok, demo, authHeaders])

  useEffect(() => {
    if (demo || !data?.ok || !data.card) return
    const t = setInterval(() => void loadCard(), 4000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.ok, demo, loadCard])

  useEffect(() => {
    if (typeof data?.card?.stamps !== "number") return
    const s = data.card.stamps
    if (lastStampsRef.current !== null && s > lastStampsRef.current) {
      setMerchantValidatedBanner(true)
      const hide = setTimeout(() => setMerchantValidatedBanner(false), 8000)
      lastStampsRef.current = s
      return () => clearTimeout(hide)
    }
    lastStampsRef.current = s
  }, [data?.card?.stamps])

  const profile = getMerchantProfile(data?.merchant?.profileId ?? "generic")

  const statusLabel = useMemo(() => {
    if (!data?.card) return ""
    if (data.card.status === "reward_ready") return profile.card.status.rewardReady
    if (data.card.status === "redeemed") return profile.card.status.redeemed
    return profile.card.status.active
  }, [data, profile])

  const onPickSummit = async (optionId: string) => {
    const cardId = data?.card?.id
    if (!cardId || demo) return
    setSummitPickState("loading")
    setSummitPickMessage("")
    try {
      const response = await fetch(`/api/public/card/${cardId}/summit-reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ optionId }),
      })
      const payload = (await response.json()) as CardApiResponse & { error?: string }
      if (!response.ok || !payload.ok) {
        setSummitPickState("error")
        setSummitPickMessage(profile.card.summitPickError)
        return
      }
      setSummitPickState("idle")
      setData(payload)
    } catch {
      setSummitPickState("error")
      setSummitPickMessage(profile.card.summitPickNetworkError)
    }
  }

  const onInvite = async () => {
    const cardId = data?.card?.id

    if (!cardId) {
      setInviteState("error")
      setInviteMessage(profile.card.inviteCardMissing)
      return
    }

    if (!inviteName.trim()) {
      setInviteState("error")
      setInviteMessage(profile.card.inviteNameRequired)
      return
    }

    setInviteState("loading")
    setInviteMessage("")

    const response = await fetch(`/api/public/card/${cardId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ customerName: inviteName.trim() }),
    })

    const payload = await response.json()
    if (!response.ok || !payload.ok) {
      setInviteState("error")
      setInviteMessage(profile.card.inviteError)
      return
    }

    setInviteState("success")
    setInviteMessage(profile.card.inviteSuccess(payload.invitation.remainingSlots))
    setInviteName("")
    await loadCard()
  }

  if (loading) {
    return <p className="p-6 text-sm">{profile.card.loading}</p>
  }

  if (loadError === "card_token_required") {
    return <p className="p-6 text-sm text-[#A64040]">{profile.card.invalidAccess}</p>
  }

  if (!data?.ok || !data.card || !data.merchant) {
    return <p className="p-6 text-sm text-[#A64040]">{profile.card.notFound}</p>
  }

  const progressDots = Math.max(4, Math.min(data.card.targetVisits, 10))
  const sharedUnlock = data.merchant.sharedUnlock
  const displayCode = data.card.code || formatLegacyCardCode(data.card.id)
  const cardinWorld: LandingWorldId = normalizeCardinWorld(data.merchant.cardinWorld)
  const summitOptions = getSummitOptions(cardinWorld)
  const showSummitPicker = !demo && data.card.seasonProgress?.summitReached && !data.card.summitReward

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#173A2E] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <p className="text-xs uppercase tracking-[0.14em] text-[#5D675F]">{profile.card.pageEyebrow}</p>
        <h1 className="mt-2 font-serif text-5xl">{data.merchant.businessName}</h1>
        <p className="mt-2 text-sm text-[#556159]">
          {data.card.customerName} · {statusLabel}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#173A2E]">
          {displayCode}
          {demo ? " · mode démo" : ""}
        </p>

        {merchantValidatedBanner ? (
          <div className="mt-4 rounded-2xl border border-[#173A2E]/25 bg-[#EEF3EC] px-4 py-3 text-sm text-[#173A2E]">
            {profile.card.progressLabel} mise à jour.
          </div>
        ) : null}

        <div className="mt-6 rounded-[2rem] border border-[#CCD4CA] bg-[#FBFAF6] p-4 shadow-[0_30px_70px_-60px_rgba(20,48,38,0.8)]">
          <WalletPassPreview businessLabel={data.merchant.businessName} progressDots={progressDots} rewardLabel={data.card.rewardLabel} />

          {data.message ? (
            <Card className="mt-4 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">{profile.card.signalLabel}</p>
              <p className="mt-1 text-lg text-[#173A2E]">{data.message.title}</p>
              <p className="mt-2 text-sm text-[#2A3F35]">{data.message.body}</p>
            </Card>
          ) : null}

          <Card className="mt-4 p-4">
            <p className="text-sm text-[#556159]">{profile.card.progressLabel}</p>
            <p className="mt-1 text-xl">
              {data.card.stamps} / {data.card.targetVisits}
            </p>
            <p className="mt-2 text-sm text-[#2A3F35]">{data.card.midpoint.copy}</p>
            {data.card.statusName ? <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#355246]">{data.card.statusName}</p> : null}
            {data.card.seasonProgress ? (
              <div className="mt-3 text-xs text-[#355246]">
                <p>{data.card.seasonProgress.stepLabel}</p>
                <p>
                  {profile.card.inviteLabel} {data.card.seasonProgress.branchesUsed}/{data.card.seasonProgress.branchCapacity}
                </p>
              </div>
            ) : null}
          </Card>

          {data.card.summitReward ? (
            <Card className="mt-4 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">{profile.card.activeRewardLabel}</p>
              <p className="mt-2 text-lg text-[#173A2E]">{data.card.summitReward.title}</p>
              <p className="mt-1 text-sm text-[#2A3F35]">{data.card.summitReward.description}</p>
              <p className="mt-3 text-sm text-[#556159]">
                Reste {data.card.summitReward.usageRemaining} utilisation{data.card.summitReward.usageRemaining > 1 ? "s" : ""}
              </p>
            </Card>
          ) : null}

          {showSummitPicker ? (
            <Card className="mt-4 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">{profile.card.summitLabel}</p>
              <p className="mt-2 text-sm text-[#2A3F35]">{profile.card.summitSubtitle}</p>
              <div className="mt-4 space-y-2">
                {summitOptions.map((opt) => (
                  <button
                    className="w-full rounded-2xl border border-[#D5DBD1] bg-white px-4 py-3 text-left text-sm transition hover:border-[#173A2E]/40 disabled:opacity-50"
                    disabled={summitPickState === "loading"}
                    key={opt.id}
                    onClick={() => void onPickSummit(opt.id)}
                    type="button"
                  >
                    <span className="font-medium text-[#173A2E]">{opt.title}</span>
                    <span className="mt-1 block text-[#556159]">{opt.description}</span>
                  </button>
                ))}
              </div>
              {summitPickState === "error" ? <p className="mt-2 text-xs text-[#A64040]">{summitPickMessage}</p> : null}
            </Card>
          ) : null}

          {data.invite ? (
            <Card className="mt-4 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">{profile.card.inviteLabel}</p>
              <p className="mt-1 text-sm text-[#173A2E]">
                {data.invite.enabled
                  ? profile.card.inviteEnabled(data.invite.remainingSlots, data.invite.branchCapacity)
                  : profile.card.inviteDisabled}
              </p>
              {data.invite.enabled ? (
                <div className="mt-3 flex gap-2">
                  <input
                    className="h-10 flex-1 rounded-xl border border-[#D5DBD1] bg-white px-3 text-sm"
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder={profile.card.invitePlaceholder}
                    value={inviteName}
                  />
                  <button
                    className="rounded-xl bg-[#173A2E] px-4 text-sm text-white disabled:opacity-60"
                    disabled={inviteState === "loading"}
                    onClick={onInvite}
                    type="button"
                  >
                    {profile.card.inviteAction}
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
              <p className="text-xs uppercase tracking-[0.12em] text-[#5E6961]">{profile.card.sharedUnlockTitle}</p>
              <p className="mt-1 text-sm text-[#173A2E]">
                {sharedUnlock.progress} / {sharedUnlock.objective} passages ce mois
              </p>
              <p className="mt-1 text-xs text-[#5D675F]">{sharedUnlock.offer}</p>
              {sharedUnlock.status === "active" ? <p className="mt-2 text-sm text-[#173A2E]">{profile.card.sharedUnlockActive}</p> : null}
            </Card>
          ) : null}

          {data.season ? <p className="mt-4 text-xs text-[#5E6961]">{profile.card.seasonSummary(data.season.number, data.season.summitTitle, data.season.daysRemaining)}</p> : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link className="text-sm underline" href={`/scan/${data.merchant.id}${demo ? "?demo=1" : ""}`}>
            {profile.card.createAnotherLabel}
          </Link>
          <Link className="text-sm underline" href="/landing">
            {profile.card.brandLinkLabel}
          </Link>
        </div>
      </div>
    </main>
  )
}
