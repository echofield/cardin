"use client"

import Link from "next/link"
import QRCode from "qrcode"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { getSummitOptions, normalizeCardinWorld } from "@/lib/client-parcours-config"
import type { LandingWorldId } from "@/lib/landing-content"
import { getMerchantProfile, type MerchantProfileId } from "@/lib/merchant-profile"
import { cn } from "@/lib/utils"
import { Button, Card } from "@/ui"

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

type CardSeasonProgress = {
  currentStep: number
  stepLabel: string
  dominoUnlocked: boolean
  diamondUnlocked: boolean
  summitReached: boolean
  branchesUsed: number
  branchCapacity: number
  directInvitationsActivated: number
}

type SummitRewardView = {
  optionId: string
  title: string
  description: string
  usageRemaining: number
}

type DiamondTokenView = {
  cycleIndex: number
  expiresAt: string
  title: string
  description: string
}

type MissionView = {
  id: string
  type: "group" | "time_shift" | "aov" | "identity"
  triggerStep: 3 | 4 | 5 | "diamond"
  roleMin: number
  title: string
  copy: string
  staffHint: string
  status: "active" | "completed" | "expired"
  incentiveType: string
  incentiveTitle: string
  incentiveCopy: string
  expiresAt: string
  requiresVisitValidation: boolean
  requiresGroupSize: number | null
  requiresTimeWindow: { label: string; start: string; end: string } | null
  validationMode: "duo" | "tablee" | "apero" | "fitting"
  estimatedValueEur: number
  costEur: number
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
    seasonProgress?: CardSeasonProgress | null
    summitReward?: SummitRewardView | null
    diamondToken?: DiamondTokenView | null
    mission?: MissionView | null
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
  protocol?: {
    state: string
    rewardsPaused: boolean
    seasonObjective: string
    diamondLine: string
  } | null
  wallet?: {
    appleUrl: string
    googleUrl: string
    appleReady: boolean
    googleReady: boolean
  }
}

type DetailItem = {
  label: string
  value: string
  note?: string | null
}

type ActiveBenefit = {
  title: string
  description: string
  detail: string
}

function formatLegacyCardCode(cardId: string) {
  const normalized = cardId.replace(/-/g, "").toUpperCase()
  const head = normalized.slice(0, 2) || "CD"
  const tail = normalized.slice(-4) || "0000"
  return `${head}-${tail}`
}

function pluralizePassage(count: number) {
  return `${count} passage${count > 1 ? "s" : ""}`
}

function CardSheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string | null
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#13251D]/58 backdrop-blur-[6px] sm:items-center" role="dialog">
      <button aria-label="Fermer" className="absolute inset-0" onClick={onClose} type="button" />
      <div className="relative z-10 w-full max-w-lg rounded-t-[2rem] border border-[#D7D6CF] bg-[#FFFDF8] px-5 pb-6 pt-5 shadow-[0_40px_120px_-40px_rgba(19,37,29,0.48)] sm:rounded-[2rem]">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#E2DDD2] sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-serif text-[1.85rem] leading-[1.05] text-[#173A2E]">{title}</p>
            {subtitle ? <p className="mt-2 max-w-md text-sm leading-6 text-[#556159]">{subtitle}</p> : null}
          </div>
          <button className="text-sm text-[#6D776F] transition hover:text-[#173A2E]" onClick={onClose} type="button">
            Fermer
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

function CardProgressRail({
  milestones,
  stamps,
}: {
  milestones: number[]
  stamps: number
}) {
  const currentIndex = milestones.findIndex((threshold) => stamps < threshold)

  return (
    <div className="grid grid-cols-4 gap-2">
      {milestones.map((threshold, index) => {
        const isFilled = stamps >= threshold
        const isCurrent = !isFilled && currentIndex === index

        return (
          <div
            className={cn(
              "flex aspect-square items-center justify-center rounded-[1rem] border text-[12px] transition",
              isFilled
                ? "border-[#D1B17C] bg-[rgba(209,177,124,0.12)] text-[#9C6E2B]"
                : isCurrent
                  ? "border-[#1B4332] bg-[rgba(27,67,50,0.06)] text-[#1B4332] shadow-[inset_0_0_0_1px_rgba(27,67,50,0.12)]"
                  : "border-[#E1D8C9] bg-[#FFFDF8] text-[#D1B17C]",
            )}
            key={`${threshold}-${index}`}
          >
            <span className="font-serif text-base">{isFilled || isCurrent ? "◆" : "◇"}</span>
          </div>
        )
      })}
    </div>
  )
}

function MonQrSheet({
  scanValue,
  code,
  businessName,
  onClose,
}: {
  scanValue: string
  code: string
  businessName: string
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [qrError, setQrError] = useState(false)

  useEffect(() => {
    let active = true

    async function renderQr() {
      if (!canvasRef.current) return

      try {
        setQrError(false)
        await QRCode.toCanvas(canvasRef.current, scanValue, {
          margin: 2,
          width: 280,
          color: {
            dark: "#173A2E",
            light: "#FDFCF8",
          },
        })
      } catch {
        if (active) setQrError(true)
      }
    }

    void renderQr()
    return () => {
      active = false
    }
  }, [scanValue])

  return (
    <CardSheet
      onClose={onClose}
      subtitle="Présentez ce QR au staff. Un scan suffit pour retrouver votre passage et lancer la validation."
      title="Mon QR"
    >
      <div className="rounded-[1.5rem] border border-[#E1D8C9] bg-[#FFFDF8] p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">Carte Cardin</p>
        <p className="mt-2 font-serif text-xl text-[#173A2E]">{businessName}</p>

        <div className="mt-5 flex min-h-[320px] items-center justify-center rounded-[1.25rem] border border-[#E6DED1] bg-[#FCFBF7] p-4">
          {qrError ? (
            <div className="space-y-3 text-center">
              <p className="text-sm text-[#556159]">Le QR ne peut pas être rendu ici.</p>
              <p className="rounded-xl bg-[#F4F0E7] px-3 py-2 font-mono text-xs text-[#6B766D]">{code}</p>
            </div>
          ) : (
            <canvas ref={canvasRef} />
          )}
        </div>

        <div className="mt-4 rounded-[1rem] border border-[#E6DED1] bg-[#FBFAF6] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">Code de passage</p>
          <p className="mt-2 font-mono text-sm tracking-[0.18em] text-[#173A2E]">{code}</p>
        </div>
      </div>
    </CardSheet>
  )
}

function WalletSheet({
  businessName,
  rewardLabel,
  progressDots,
  activeDots,
  wallet,
  onClose,
  onProviderClick,
}: {
  businessName: string
  rewardLabel: string
  progressDots: number
  activeDots: number
  wallet?: {
    appleUrl: string
    googleUrl: string
    appleReady: boolean
    googleReady: boolean
  }
  onClose: () => void
  onProviderClick: (provider: "apple" | "google") => Promise<void>
}) {
  const walletReady = Boolean(wallet?.appleReady || wallet?.googleReady)

  return (
    <CardSheet
      onClose={onClose}
      subtitle="La carte web reste le coeur vivant. Wallet sert de raccourci propre et pratique."
      title="Ajouter à Wallet"
    >
      <WalletPassPreview
        activeDots={activeDots}
        businessLabel={businessName}
        caption="Pass web dynamique, wallet en extension."
        footerLabel="PASS CARDIN"
        progressDots={progressDots}
        rewardLabel={rewardLabel}
        statusLabel={walletReady ? "Wallet prêt" : "Bientôt disponible"}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          className={cn(
            "rounded-[1rem] border px-4 py-4 text-left transition",
            wallet?.appleReady
              ? "border-[#173A2E] bg-[#173A2E] text-[#FBFAF6] hover:bg-[#214939]"
              : "border-[#E2DDD3] bg-[#F7F3EA] text-[#8A9389]",
          )}
          disabled={!wallet?.appleReady}
          onClick={() => void onProviderClick("apple")}
          type="button"
        >
          <p className="text-[11px] uppercase tracking-[0.16em]">Apple Wallet</p>
          <p className="mt-2 text-sm">{wallet?.appleReady ? "Ajouter le pass" : "Bientôt activé"}</p>
        </button>

        <button
          className={cn(
            "rounded-[1rem] border px-4 py-4 text-left transition",
            wallet?.googleReady
              ? "border-[#173A2E] bg-[#173A2E] text-[#FBFAF6] hover:bg-[#214939]"
              : "border-[#E2DDD3] bg-[#F7F3EA] text-[#8A9389]",
          )}
          disabled={!wallet?.googleReady}
          onClick={() => void onProviderClick("google")}
          type="button"
        >
          <p className="text-[11px] uppercase tracking-[0.16em]">Google Wallet</p>
          <p className="mt-2 text-sm">{wallet?.googleReady ? "Ajouter le pass" : "Bientôt activé"}</p>
        </button>
      </div>

      {!walletReady ? (
        <p className="mt-4 rounded-[1rem] border border-[#E2DDD3] bg-[#FBFAF6] px-4 py-3 text-sm leading-6 text-[#556159]">
          L'interface est prête. Le vrai pass natif pourra être activé dès que les templates Apple / Google seront branchés.
        </p>
      ) : null}
    </CardSheet>
  )
}

function DetailSheet({
  businessName,
  displayCode,
  seasonSummary,
  detailItems,
  activeBenefit,
  mission,
  invite,
  inviteName,
  inviteState,
  inviteMessage,
  onInviteNameChange,
  onInvite,
  showSummitPicker,
  summitOptions,
  summitPickState,
  summitPickMessage,
  onPickSummit,
  sharedUnlock,
  onClose,
}: {
  businessName: string
  displayCode: string
  seasonSummary?: string | null
  detailItems: DetailItem[]
  activeBenefit: ActiveBenefit | null
  mission: MissionView | null | undefined
  invite: CardApiResponse["invite"]
  inviteName: string
  inviteState: "idle" | "loading" | "error" | "success"
  inviteMessage: string
  onInviteNameChange: (value: string) => void
  onInvite: () => Promise<void>
  showSummitPicker: boolean
  summitOptions: ReturnType<typeof getSummitOptions>
  summitPickState: "idle" | "loading" | "error"
  summitPickMessage: string
  onPickSummit: (optionId: string) => Promise<void>
  sharedUnlock?: SharedUnlockView | null
  onClose: () => void
}) {
  return (
    <CardSheet onClose={onClose} subtitle="Cardin reste simple au premier regard. Le moteur complet reste accessible ici." title="Voir le détail">
      <div className="space-y-4">
        <Card className="p-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">Carte</p>
          <p className="mt-2 font-serif text-2xl text-[#173A2E]">{businessName}</p>
          <p className="mt-2 font-mono text-xs tracking-[0.18em] text-[#7A847C]">{displayCode}</p>
          {seasonSummary ? <p className="mt-3 text-sm text-[#556159]">{seasonSummary}</p> : null}
        </Card>

        <Card className="p-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">Lecture Cardin</p>
          <div className="mt-4 space-y-3">
            {detailItems.map((item) => (
              <div className="rounded-[1rem] border border-[#E4DED2] bg-[#FBFAF6] px-4 py-3" key={item.label}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#7B837D]">{item.label}</p>
                <p className="mt-2 font-medium text-[#173A2E]">{item.value}</p>
                {item.note ? <p className="mt-1 text-sm text-[#556159]">{item.note}</p> : null}
              </div>
            ))}
          </div>
        </Card>

        {activeBenefit ? (
          <Card className="p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">Accès en cours</p>
            <p className="mt-2 font-serif text-2xl text-[#173A2E]">{activeBenefit.title}</p>
            <p className="mt-2 text-sm text-[#2A3F35]">{activeBenefit.description}</p>
            <p className="mt-3 text-sm text-[#556159]">{activeBenefit.detail}</p>
          </Card>
        ) : null}

        {mission ? (
          <Card className="p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">Mission du moment</p>
            <p className="mt-2 font-serif text-2xl text-[#173A2E]">{mission.title}</p>
            <p className="mt-2 text-sm text-[#2A3F35]">{mission.copy}</p>
            <p className="mt-3 text-xs text-[#556159]">{mission.incentiveCopy}</p>
            <p className="mt-1 text-xs text-[#556159]">Expire le {new Date(mission.expiresAt).toLocaleDateString("fr-FR")}</p>
          </Card>
        ) : null}

        {showSummitPicker ? (
          <Card className="p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">Choisir le sommet</p>
            <div className="mt-4 space-y-2">
              {summitOptions.map((option) => (
                <button
                  className="w-full rounded-[1rem] border border-[#D5DBD1] bg-white px-4 py-3 text-left transition hover:border-[#173A2E]/40 disabled:opacity-50"
                  disabled={summitPickState === "loading"}
                  key={option.id}
                  onClick={() => void onPickSummit(option.id)}
                  type="button"
                >
                  <span className="font-medium text-[#173A2E]">{option.title}</span>
                  <span className="mt-1 block text-sm text-[#556159]">{option.description}</span>
                </button>
              ))}
            </div>
            {summitPickState === "error" ? <p className="mt-3 text-sm text-[#A64040]">{summitPickMessage}</p> : null}
          </Card>
        ) : null}

        {invite ? (
          <Card className="p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">Propagation</p>
            <p className="mt-2 text-sm text-[#173A2E]">
              {invite.enabled
                ? `Vous pouvez faire entrer ${invite.remainingSlots} personne${invite.remainingSlots > 1 ? "s" : ""}.`
                : invite.reason === "diamond_not_earned"
                  ? "L'invitation s'ouvre après une vraie récompense consommée."
                  : "L'invitation s'ouvrira plus loin dans la saison."}
            </p>
            {invite.enabled ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  className="h-11 flex-1 rounded-xl border border-[#D5DBD1] bg-white px-3 text-sm"
                  onChange={(event) => onInviteNameChange(event.target.value)}
                  placeholder="Prénom de la personne invitée"
                  value={inviteName}
                />
                <Button disabled={inviteState === "loading"} onClick={() => void onInvite()} type="button">
                  Inviter
                </Button>
              </div>
            ) : null}
            {inviteState !== "idle" ? (
              <p className={cn("mt-3 text-xs", inviteState === "error" ? "text-[#A64040]" : "text-[#173A2E]")}>{inviteMessage}</p>
            ) : null}
          </Card>
        ) : null}

        {sharedUnlock?.enabled ? (
          <Card className="p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#69736C]">Signal collectif</p>
            <p className="mt-2 text-sm text-[#173A2E]">
              {sharedUnlock.progress} / {sharedUnlock.objective} passages ce mois
            </p>
            <p className="mt-2 text-sm text-[#556159]">{sharedUnlock.offer}</p>
            <p className="mt-1 text-xs text-[#556159]">Fenêtre active : {sharedUnlock.windowDays} jours</p>
          </Card>
        ) : null}
      </div>
    </CardSheet>
  )
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
  const [showQr, setShowQr] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showWallet, setShowWallet] = useState(false)
  const lastStampsRef = useRef<number | null>(null)

  const storageKey = useMemo(() => `cardin:access:${cardRef}`, [cardRef])

  const endpoint = useMemo(
    () => (refType === "code" ? `/api/public/card/code/${encodeURIComponent(cardRef)}` : `/api/public/card/${cardRef}`),
    [cardRef, refType],
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const token = params.get("access_token")
    if (token) {
      sessionStorage.setItem(storageKey, token)
      params.delete("access_token")
      params.delete("wallet")
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
        const token = sessionStorage.getItem(storageKey)
        if (token && cardRef !== payload.card.id) {
          sessionStorage.setItem(`cardin:access:${payload.card.id}`, token)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [authHeaders, cardRef, endpoint, storageKey])

  const ensureVisitSession = useCallback(async () => {
    if (demo || !data?.card?.id) return

    try {
      await fetch("/api/public/visit-session/open", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ cardId: data.card.id }),
      })
    } catch {
      // noop
    }
  }, [authHeaders, data?.card?.id, demo])

  const handleWalletProvider = useCallback(
    async (provider: "apple" | "google") => {
      const wallet = data?.wallet
      if (!wallet) return

      const targetUrl = provider === "apple" ? wallet.appleUrl : wallet.googleUrl
      if (!targetUrl) return

      const providerReady = provider === "apple" ? wallet.appleReady : wallet.googleReady
      if (!providerReady) return

      try {
        const response = await fetch(targetUrl)
        if (response.redirected) {
          if (typeof window !== "undefined") {
            window.location.href = response.url
          }
          return
        }

        const payload = (await response.json()) as { fallbackUrl?: string }
        if (typeof window !== "undefined") {
          window.location.href = payload.fallbackUrl ?? "/"
        }
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = targetUrl
        }
      }
    },
    [data?.wallet],
  )

  useEffect(() => {
    if (!accessGateReady) return
    void loadCard()
  }, [accessGateReady, loadCard])

  useEffect(() => {
    if (!accessGateReady) return
    void ensureVisitSession()
  }, [accessGateReady, ensureVisitSession])

  useEffect(() => {
    if (demo || !data?.ok || !data.card) return
    const timer = setInterval(() => void loadCard(), 2200)
    return () => clearInterval(timer)
  }, [data?.card, data?.ok, demo, loadCard])

  useEffect(() => {
    if (typeof data?.card?.stamps !== "number") return
    const stamps = data.card.stamps

    if (lastStampsRef.current !== null && stamps > lastStampsRef.current) {
      setMerchantValidatedBanner(true)
      const hideTimer = setTimeout(() => setMerchantValidatedBanner(false), 7000)
      lastStampsRef.current = stamps
      return () => clearTimeout(hideTimer)
    }

    lastStampsRef.current = stamps
  }, [data?.card?.stamps])

  const activeBenefitMemo = useMemo<ActiveBenefit | null>(() => {
    if (!data?.card) return null

    if (data.card.summitReward) {
      return {
        title: data.card.summitReward.title,
        description: data.card.summitReward.description,
        detail: `Reste ${data.card.summitReward.usageRemaining} utilisation${data.card.summitReward.usageRemaining > 1 ? "s" : ""}.`,
      }
    }

    if (data.card.diamondToken) {
      return {
        title: data.card.diamondToken.title,
        description: data.card.diamondToken.description,
        detail: `Actif jusqu'au ${new Date(data.card.diamondToken.expiresAt).toLocaleDateString("fr-FR")}.`,
      }
    }

    return null
  }, [data?.card])

  const progressMilestonesMemo = useMemo(
    () =>
      Array.from({ length: 4 }, (_, index) => {
        const targetVisits = data?.card?.targetVisits ?? 4
        const ratio = (index + 1) / 4
        return Math.max(1, Math.ceil(targetVisits * ratio))
      }),
    [data?.card?.targetVisits],
  )

  const nextMilestoneMemo = useMemo(() => {
    if (!data?.card) {
      return {
        label: "Prochain palier",
        title: "Chargement",
        detail: "La progression de la carte est en train d'arriver.",
      }
    }

    const rewardRemaining = Math.max(data.card.targetVisits - data.card.stamps, 0)
    const midpointRemaining = Math.max(data.card.midpoint.threshold - data.card.stamps, 0)

    if (activeBenefitMemo) {
      return {
        label: "Accès visible",
        title: activeBenefitMemo.title,
        detail: activeBenefitMemo.detail,
      }
    }

    if (data.card.seasonProgress?.summitReached) {
      return {
        label: "Sommet",
        title: "Sommet atteint",
        detail: "Le Diamond a tenu jusqu'au bout de cette saison.",
      }
    }

    if (data.card.seasonProgress?.diamondUnlocked) {
      return {
        label: "Diamond",
        title: "Diamond en cours",
        detail: data.protocol?.diamondLine ?? "Le sommet de la saison reste actif.",
      }
    }

    if (midpointRemaining > 0) {
      return {
        label: "Prochain palier",
        title: `Encore ${pluralizePassage(midpointRemaining)}`,
        detail: data.card.midpoint.copy,
      }
    }

    if (rewardRemaining > 0) {
      return {
        label: "Prochain palier",
        title: `Encore ${pluralizePassage(rewardRemaining)}`,
        detail: data.card.rewardLabel,
      }
    }

    return {
      label: "Récompense",
      title: data.card.rewardLabel,
      detail: "Le prochain passage peut faire basculer l'accès.",
    }
  }, [activeBenefitMemo, data?.card, data?.protocol?.diamondLine])

  if (loading) {
    return <p className="p-6 text-sm">Chargement de votre carte…</p>
  }

  if (loadError === "card_token_required") {
    return <p className="p-6 text-sm text-[#A64040]">Cette carte a besoin d'un accès valide pour s'ouvrir.</p>
  }

  if (!data?.ok || !data.card || !data.merchant) {
    return <p className="p-6 text-sm text-[#A64040]">Carte introuvable.</p>
  }

  const profile = getMerchantProfile(data.merchant.profileId)
  const progressDots = Math.max(4, Math.min(data.card.targetVisits, 10))
  const displayCode = data.card.code || formatLegacyCardCode(data.card.id)
  const cardinWorld: LandingWorldId = normalizeCardinWorld(data.merchant.cardinWorld)
  const summitOptions = getSummitOptions(cardinWorld)
  const showSummitPicker = Boolean(!demo && data.card.seasonProgress?.summitReached && !data.card.summitReward && !data.protocol?.rewardsPaused)
  const mission = data.card.mission

  const activeBenefit = activeBenefitMemo

  const activeMomentTitle = data.message?.title ?? "Revenez cette semaine"
  const activeMomentBody =
    data.message?.body ?? data.protocol?.seasonObjective ?? "Chaque passage validé fait avancer votre lecture Cardin."

  const progressMilestones = progressMilestonesMemo

  const nextMilestone = nextMilestoneMemo

  /* legacy milestone logic kept for reference
    const rewardRemaining = Math.max(data.card.targetVisits - data.card.stamps, 0)
    const midpointRemaining = Math.max(data.card.midpoint.threshold - data.card.stamps, 0)

    if (activeBenefit) {
      return {
        label: "Accès visible",
        title: activeBenefit.title,
        detail: activeBenefit.detail,
      }
    }

    if (data.card.seasonProgress?.summitReached) {
      return {
        label: "Sommet",
        title: "Sommet atteint",
        detail: "Le Diamond a tenu jusqu'au bout de cette saison.",
      }
    }

    if (data.card.seasonProgress?.diamondUnlocked) {
      return {
        label: "Diamond",
        title: "Diamond en cours",
        detail: data.protocol?.diamondLine ?? "Le sommet de la saison reste actif.",
      }
    }

    if (midpointRemaining > 0) {
      return {
        label: "Prochain palier",
        title: `Encore ${pluralizePassage(midpointRemaining)}`,
        detail: data.card.midpoint.copy,
      }
    }

    if (rewardRemaining > 0) {
      return {
        label: "Prochain palier",
        title: `Encore ${pluralizePassage(rewardRemaining)}`,
        detail: data.card.rewardLabel,
      }
    }

    return {
      label: "Récompense",
      title: data.card.rewardLabel,
      detail: "Le prochain passage peut faire basculer l'accès.",
    }
  }, [
    activeBenefit,
    data.card.midpoint.copy,
    data.card.midpoint.threshold,
    data.card.rewardLabel,
    data.card.seasonProgress?.diamondUnlocked,
    data.card.seasonProgress?.summitReached,
    data.card.stamps,
    data.card.targetVisits,
    data.protocol?.diamondLine,
  */

  const detailItems: DetailItem[] = [
    {
      label: "Cette semaine",
      value: activeMomentTitle,
      note: activeMomentBody,
    },
    {
      label: "Progression",
      value: `${data.card.stamps} / ${data.card.targetVisits}`,
      note: data.card.midpoint.copy,
    },
    {
      label: "Étape Cardin",
      value: data.card.seasonProgress?.stepLabel ?? "Entrée dans la saison",
      note: data.card.statusName ?? data.protocol?.state ?? null,
    },
    {
      label: "Diamond",
      value: data.card.seasonProgress?.diamondUnlocked ? "Débloqué" : "En cours",
      note: data.protocol?.diamondLine ?? null,
    },
  ]

  const seasonSummary = data.season
    ? `Saison ${data.season.number} · ${data.season.summitTitle} · fin dans ${data.season.daysRemaining} jours`
    : null

  const qrOpen = async () => {
    await ensureVisitSession()
    setShowQr(true)
  }

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
        setSummitPickMessage(payload.error === "rewards_paused" ? "Les nouveaux avantages sont temporairement en pause." : profile.card.summitPickError)
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

  return (
    <main className="min-h-dvh-safe bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.06),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(209,177,124,0.12),transparent_28%),#F8F5ED] px-4 py-6 pb-[max(2.4rem,env(safe-area-inset-bottom,0px))] text-[#173A2E] sm:px-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A847C]">Carte Cardin</p>
            <h1 className="mt-2 font-serif text-[clamp(2.35rem,11vw,3.45rem)] leading-[0.98] text-[#173A2E]">{data.merchant.businessName}</h1>
            <p className="mt-2 text-sm text-[#556159]">{data.card.customerName}</p>
          </div>
          <div className="shrink-0 rounded-full border border-[#D9D3C7] bg-[#FBFAF6] px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#7A847C]">{data.season ? "Saison en cours" : "Carte active"}</p>
            <p className="mt-1 text-xs text-[#173A2E]">{data.season ? `${data.season.daysRemaining} jours` : "Active"}</p>
          </div>
        </div>

        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#8C6A44]">{displayCode}{demo ? " · mode démo" : ""}</p>

        {merchantValidatedBanner ? (
          <div className="mt-4 rounded-[1.25rem] border border-[#1B4332]/18 bg-[#EEF4F0] px-4 py-3 text-sm text-[#173A2E]">
            Passage validé. Votre carte vient de se mettre à jour.
          </div>
        ) : null}

        <div className="mt-5 rounded-[2rem] border border-[#D9D3C7] bg-[linear-gradient(180deg,#FFFDF8_0%,#FBF8F1_100%)] p-5 shadow-[0_34px_90px_-50px_rgba(23,58,46,0.45)]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7B837D]">Saison en cours</p>
            <span className="rounded-full border border-[#DCD5C8] bg-[#FFFEFB] px-3 py-1 text-[11px] text-[#173A2E]">
              {activeBenefit ? "Accès visible" : data.card.seasonProgress?.diamondUnlocked ? "Diamond en cours" : "Cardin actif"}
            </span>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-[#E6DED1] bg-[#FFFEFB] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8C6A44]">Cette semaine</p>
            <p className="mt-2 font-serif text-[1.9rem] leading-[1.08] text-[#173A2E]">{activeMomentTitle}</p>
            <p className="mt-3 text-sm leading-6 text-[#556159]">{activeMomentBody}</p>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-4 rounded-[1.4rem] border border-[#E6DED1] bg-[#FBFAF6] px-4 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">Progression</p>
              <p className="mt-2 font-serif text-[2.2rem] leading-none text-[#173A2E]">
                {data.card.stamps}
                <span className="ml-1 text-base text-[#7A847C]">/ {data.card.targetVisits}</span>
              </p>
            </div>
            <div className="max-w-[150px] text-right">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">{nextMilestone.label}</p>
              <p className="mt-2 text-sm font-medium leading-5 text-[#173A2E]">{nextMilestone.title}</p>
              <p className="mt-2 text-xs leading-5 text-[#556159]">{nextMilestone.detail}</p>
            </div>
          </div>

          <div className={cn("mt-4 rounded-[1.35rem] border border-[#E6DED1] bg-[#FFFEFB] px-4 py-4 transition", merchantValidatedBanner ? "border-[#1B4332]/25 bg-[#F4F8F3]" : "")}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">Tension visible</p>
              <p className="text-[11px] text-[#8C6A44]">{seasonSummary ?? "Le Diamond reste en jeu."}</p>
            </div>
            <CardProgressRail milestones={progressMilestones} stamps={data.card.stamps} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button className="w-full" onClick={() => void qrOpen()} size="md" type="button">
              Mon QR
            </Button>
            <Button className="w-full" onClick={() => setShowWallet(true)} size="md" type="button" variant="secondary">
              Ajouter à Wallet
            </Button>
          </div>

          <button
            className="mt-4 w-full rounded-[1rem] border border-[#E2DDD3] bg-[#FBFAF6] px-4 py-3 text-sm text-[#173A2E] transition hover:border-[#CFC8B9] hover:bg-[#FFFDF8]"
            onClick={() => setShowDetails(true)}
            type="button"
          >
            Voir le détail
          </button>
        </div>

        <p className="mt-4 text-center text-sm italic leading-6 text-[#556159]">
          {activeBenefit ? activeBenefit.description : data.protocol?.diamondLine ?? "Le moteur Cardin continue derrière la carte."}
        </p>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link className="text-[#173A2E] underline" href={`/scan/${data.merchant.id}${demo ? "?demo=1" : ""}`}>
            Revoir l’entrée
          </Link>
          <Link className="text-[#173A2E] underline" href="/">
            Cardin
          </Link>
        </div>
      </div>

      {showQr ? <MonQrSheet businessName={data.merchant.businessName} code={displayCode} onClose={() => setShowQr(false)} scanValue={data.card.code || data.card.id} /> : null}

      {showWallet ? (
        <WalletSheet
          activeDots={Math.max(1, Math.min(data.card.stamps, progressDots))}
          businessName={data.merchant.businessName}
          onClose={() => setShowWallet(false)}
          onProviderClick={handleWalletProvider}
          progressDots={progressDots}
          rewardLabel={data.card.rewardLabel}
          wallet={data.wallet}
        />
      ) : null}

      {showDetails ? (
        <DetailSheet
          activeBenefit={activeBenefit}
          businessName={data.merchant.businessName}
          detailItems={detailItems}
          displayCode={displayCode}
          invite={data.invite}
          inviteMessage={inviteMessage}
          inviteName={inviteName}
          inviteState={inviteState}
          mission={mission}
          onClose={() => setShowDetails(false)}
          onInvite={onInvite}
          onInviteNameChange={setInviteName}
          onPickSummit={onPickSummit}
          seasonSummary={seasonSummary}
          sharedUnlock={data.merchant.sharedUnlock}
          showSummitPicker={showSummitPicker}
          summitOptions={summitOptions}
          summitPickMessage={summitPickMessage}
          summitPickState={summitPickState}
        />
      ) : null}
    </main>
  )
}
