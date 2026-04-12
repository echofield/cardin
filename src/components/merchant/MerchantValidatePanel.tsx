"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { getMerchantProfile, type MerchantProfileId } from "@/lib/merchant-profile"
import { Button, Card } from "@/ui"

type SummitRewardPending = {
  optionId: string
  title: string
  description: string
  usageRemaining: number
}

type DiamondRewardPending = {
  title: string
  description: string
  expiresAt: string
}

type MissionPending = {
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

type PendingPayload = {
  ok: boolean
  pending: null | {
    sessionId: string
    cardId: string
    startedAt: string
    customerName: string
    stamps: number
    targetVisits: number
    summitReward: SummitRewardPending | null
    diamondToken: DiamondRewardPending | null
    mission: MissionPending | null
  }
  protocol?: {
    state: string
    rewardsPaused: boolean
    seasonObjective: string
  } | null
}

type MerchantPayload = {
  ok: boolean
  merchant?: {
    profileId: MerchantProfileId
  }
}

type PostValidate = {
  cardId: string
  sessionId: string
  customerName: string
  summitReward: SummitRewardPending | null
  diamondToken: DiamondRewardPending | null
  mission: MissionPending | null
}

type ConsumeResponse = {
  ok?: boolean
  error?: string
  usageRemaining?: number
  title?: string | null
  description?: string | null
  rewardType?: "summit" | "diamond" | "mission"
  mission?: MissionPending | null
}

type ValidateResponse = {
  ok?: boolean
  error?: string
  sessionId?: string
  summitReward?: SummitRewardPending | null
  diamondToken?: DiamondRewardPending | null
  mission?: MissionPending | null
}

type MissionValidationState = {
  groupSize: string
  sameTicketConfirmed: boolean
  cardholderPresent: boolean
  singleBillConfirmed: boolean
  appointmentConfirmed: boolean
  inStoreConfirmed: boolean
  timeWindowConfirmed: boolean
}

function getStaffStorageKey(merchantId: string) {
  return `cardin:staff:last-validated:${merchantId}`
}

const DEFAULT_MISSION_VALIDATION: MissionValidationState = {
  groupSize: "",
  sameTicketConfirmed: false,
  cardholderPresent: false,
  singleBillConfirmed: false,
  appointmentConfirmed: false,
  inStoreConfirmed: false,
  timeWindowConfirmed: false,
}

export function MerchantValidatePanel({ merchantId }: { merchantId: string }) {
  const [pending, setPending] = useState<PendingPayload["pending"]>(null)
  const [protocol, setProtocol] = useState<PendingPayload["protocol"]>(null)
  const [postValidate, setPostValidate] = useState<PostValidate | null>(null)
  const [profileId, setProfileId] = useState<MerchantProfileId>("generic")
  const [loading, setLoading] = useState(true)
  const [actionState, setActionState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [consumeState, setConsumeState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [missionState, setMissionState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [consumeMessage, setConsumeMessage] = useState("")
  const [missionMessage, setMissionMessage] = useState("")
  const [missionValidation, setMissionValidation] = useState<MissionValidationState>(DEFAULT_MISSION_VALIDATION)

  const validateIdemRef = useRef<string | null>(null)
  const consumeIdemRef = useRef<string | null>(null)
  const missionIdemRef = useRef<string | null>(null)
  const profile = useMemo(() => getMerchantProfile(profileId), [profileId])

  const loadPending = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/pending-validation")
      const data = (await res.json()) as PendingPayload
      if (data.ok) {
        setPending(data.pending)
        setProtocol(data.protocol ?? null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = sessionStorage.getItem(getStaffStorageKey(merchantId))
      if (!raw) return
      setPostValidate(JSON.parse(raw) as PostValidate)
    } catch {
      sessionStorage.removeItem(getStaffStorageKey(merchantId))
    }
  }, [merchantId])

  useEffect(() => {
    if (typeof window === "undefined") return
    const key = getStaffStorageKey(merchantId)
    if (!postValidate) {
      sessionStorage.removeItem(key)
      return
    }
    sessionStorage.setItem(key, JSON.stringify(postValidate))
  }, [merchantId, postValidate])

  useEffect(() => {
    const loadMerchant = async () => {
      try {
        const response = await fetch(`/api/public/merchant/${merchantId}`)
        const payload = (await response.json()) as MerchantPayload
        if (response.ok && payload.ok && payload.merchant) {
          setProfileId(payload.merchant.profileId)
        }
      } catch {
        setProfileId("generic")
      }
    }

    void loadMerchant()
  }, [merchantId])

  useEffect(() => {
    void loadPending()
    const t = setInterval(() => void loadPending(), 5000)
    return () => clearInterval(t)
  }, [loadPending])

  const mapValidateError = (error?: string) => {
    if (!error) return profile.staff.validateErrors.fallback
    return profile.staff.validateErrors[error as keyof typeof profile.staff.validateErrors] ?? profile.staff.validateErrors.fallback
  }

  const mapConsumeError = (error?: string) => {
    if (!error) return profile.staff.consumeErrors.fallback
    if (error === "mission_validation_failed") return "Les conditions de mission doivent être confirmées."
    if (error === "mission_budget" || error === "season_budget" || error === "missions_paused") {
      return "Les missions sont temporairement en pause sur ce protocole."
    }
    if (error === "no_active_mission") return "Aucune mission active pour ce client."
    return profile.staff.consumeErrors[error as keyof typeof profile.staff.consumeErrors] ?? profile.staff.consumeErrors.fallback
  }

  const onValidate = async () => {
    if (!validateIdemRef.current) {
      validateIdemRef.current = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}`
    }
    setActionState("loading")
    setMessage("")
    try {
      const res = await fetch("/api/merchant/validate-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: validateIdemRef.current }),
      })
      const data = (await res.json()) as ValidateResponse
      if (!res.ok || !data.ok) {
        setActionState("error")
        setMessage(mapValidateError(data.error))
        return
      }
      setActionState("success")
      setMessage(profile.staff.validateSuccess)
      if (pending && data.sessionId) {
        setPostValidate({
          cardId: pending.cardId,
          sessionId: data.sessionId,
          customerName: pending.customerName,
          summitReward: data.summitReward ?? pending.summitReward,
          diamondToken: data.diamondToken ?? pending.diamondToken,
          mission: data.mission ?? pending.mission,
        })
      }
      validateIdemRef.current = null
      setMissionValidation(DEFAULT_MISSION_VALIDATION)
      await loadPending()
    } catch {
      setActionState("error")
      setMessage(profile.staff.validateErrors.network)
    }
  }

  const onConsumeReward = async () => {
    const cardId = postValidate?.cardId ?? pending?.cardId
    const sessionId = postValidate?.sessionId
    if (!cardId) return
    if (!consumeIdemRef.current) {
      consumeIdemRef.current = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`
    }
    setConsumeState("loading")
    setConsumeMessage("")
    try {
      const res = await fetch("/api/merchant/consume-summit-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          sessionId: sessionId ?? undefined,
          idempotencyKey: consumeIdemRef.current,
        }),
      })
      const data = (await res.json()) as ConsumeResponse
      if (!res.ok || !data.ok) {
        setConsumeState("error")
        setConsumeMessage(mapConsumeError(data.error))
        return
      }
      setConsumeState("success")
      consumeIdemRef.current = null
      setConsumeMessage(profile.staff.consumeSuccess(data.usageRemaining))
      setPostValidate((prev) => {
        if (!prev) return prev
        if (data.rewardType === "diamond") {
          return { ...prev, diamondToken: null }
        }
        if (typeof data.usageRemaining !== "number" || !prev.summitReward) return prev
        if (data.usageRemaining <= 0) return { ...prev, summitReward: null }
        return {
          ...prev,
          summitReward: { ...prev.summitReward, usageRemaining: data.usageRemaining },
        }
      })
      await loadPending()
    } catch {
      setConsumeState("error")
      setConsumeMessage(profile.staff.consumeErrors.network)
    }
  }

  const onCompleteMission = async () => {
    const cardId = postValidate?.cardId ?? pending?.cardId
    const sessionId = postValidate?.sessionId
    const mission = postValidate?.mission ?? pending?.mission
    if (!cardId || !sessionId || !mission) return
    if (!missionIdemRef.current) {
      missionIdemRef.current = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`
    }
    setMissionState("loading")
    setMissionMessage("")
    try {
      const res = await fetch("/api/merchant/consume-summit-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          sessionId,
          missionId: mission.id,
          missionValidation: {
            groupSize: missionValidation.groupSize ? Number(missionValidation.groupSize) : null,
            sameTicketConfirmed: missionValidation.sameTicketConfirmed,
            cardholderPresent: missionValidation.cardholderPresent,
            singleBillConfirmed: missionValidation.singleBillConfirmed,
            appointmentConfirmed: missionValidation.appointmentConfirmed,
            inStoreConfirmed: missionValidation.inStoreConfirmed,
            timeWindowConfirmed: missionValidation.timeWindowConfirmed,
          },
          idempotencyKey: missionIdemRef.current,
        }),
      })
      const data = (await res.json()) as ConsumeResponse
      if (!res.ok || !data.ok) {
        setMissionState("error")
        setMissionMessage(mapConsumeError(data.error))
        return
      }
      setMissionState("success")
      missionIdemRef.current = null
      setMissionMessage(data.description ?? "Mission validée.")
      setPostValidate((prev) => (prev ? { ...prev, mission: null } : prev))
      setMissionValidation(DEFAULT_MISSION_VALIDATION)
      await loadPending()
    } catch {
      setMissionState("error")
      setMissionMessage(profile.staff.consumeErrors.network)
    }
  }

  const activeSummit = postValidate?.summitReward ?? pending?.summitReward
  const activeDiamond = postValidate?.diamondToken ?? pending?.diamondToken
  const activeMission = postValidate?.mission ?? pending?.mission
  const activeCardId = postValidate?.cardId ?? pending?.cardId
  const activeReward = activeSummit
    ? {
        kind: "summit" as const,
        title: activeSummit.title,
        description: activeSummit.description,
        detail: `Reste ${activeSummit.usageRemaining} utilisation${activeSummit.usageRemaining > 1 ? "s" : ""}`,
      }
    : activeDiamond
      ? {
          kind: "diamond" as const,
          title: activeDiamond.title,
          description: activeDiamond.description,
          detail: `Actif jusqu'au ${new Date(activeDiamond.expiresAt).toLocaleDateString("fr-FR")}`,
        }
      : null
  const canConsume = Boolean(activeReward && activeCardId && actionState !== "loading")
  const canCompleteMission = Boolean(activeMission && activeMission.status === "active" && activeCardId && actionState !== "loading")

  return (
    <div className="mx-auto max-w-md min-h-dvh-safe space-y-6 px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#677168]">{profile.staff.eyebrow}</p>
        <h1 className="mt-3 font-serif text-3xl text-[#163328]">{profile.staff.title}</h1>
        <p className="mt-2 text-sm leading-7 text-[#556159]">{profile.staff.subtitle}</p>
      </div>

      {protocol ? (
        <Card className="p-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#5E6961]">Cadre de saison</p>
          <p className="mt-2 text-sm text-[#173A2E]">{protocol.seasonObjective}</p>
          {protocol.rewardsPaused ? (
            <p className="mt-3 text-sm text-[#A64040]">Les nouveaux avantages sont temporairement en pause. La progression continue.</p>
          ) : (
            <p className="mt-3 text-xs text-[#556159]">Etat protocole : {protocol.state}</p>
          )}
        </Card>
      ) : null}

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-[#556159]">{profile.staff.loading}</p>
        ) : pending ? (
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">{profile.staff.pendingLabel}</p>
            <p className="mt-2 font-serif text-2xl text-[#173A2E]">{pending.customerName}</p>
            <p className="mt-1 text-sm text-[#556159]">
              {pending.stamps} / {pending.targetVisits}
            </p>
            <p className="mt-3 text-xs text-[#69736C]">
              {profile.staff.pendingSincePrefix} {new Date(pending.startedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
            </p>

            {activeReward ? (
              <div className="mt-5 rounded-[1.2rem] border border-[#173A2E]/15 bg-[#F8FAF6] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#5E6961]">{profile.staff.activeRewardLabel}</p>
                <p className="mt-1 font-medium text-[#173A2E]">{activeReward.title}</p>
                <p className="mt-1 text-sm text-[#2A3F35]">{activeReward.description}</p>
                <p className="mt-2 text-sm text-[#556159]">{activeReward.detail}</p>
              </div>
            ) : null}
          </div>
        ) : postValidate ? (
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">{profile.staff.lastValidatedLabel}</p>
            <p className="mt-2 font-serif text-2xl text-[#173A2E]">{postValidate.customerName}</p>
            <p className="mt-2 text-sm text-[#556159]">{profile.staff.lastValidatedBody}</p>
            {activeReward ? (
              <div className="mt-5 rounded-[1.2rem] border border-[#173A2E]/15 bg-[#F8FAF6] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#5E6961]">{profile.staff.activeRewardLabel}</p>
                <p className="mt-1 font-medium text-[#173A2E]">{activeReward.title}</p>
                <p className="mt-1 text-sm text-[#2A3F35]">{activeReward.description}</p>
                <p className="mt-2 text-sm text-[#556159]">{activeReward.detail}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[#556159]">{profile.staff.noPending}</p>
        )}

        <Button className="mt-6 w-full" disabled={!pending || actionState === "loading"} onClick={() => void onValidate()} type="button">
          {actionState === "loading" ? profile.staff.validateLoading : profile.staff.validateAction}
        </Button>

        {canConsume ? (
          <Button className="mt-3 w-full" disabled={consumeState === "loading"} onClick={() => void onConsumeReward()} type="button" variant="secondary">
            {consumeState === "loading" ? profile.staff.consumeLoading : profile.staff.consumeAction}
          </Button>
        ) : null}

        {actionState === "success" ? <p className="mt-4 text-sm text-[#173A2E]">{message}</p> : null}
        {actionState === "error" ? <p className="mt-4 text-sm text-[#A64040]">{message}</p> : null}
        {consumeState === "success" ? <p className="mt-4 text-sm text-[#173A2E]">{consumeMessage}</p> : null}
        {consumeState === "error" ? <p className="mt-4 text-sm text-[#A64040]">{consumeMessage}</p> : null}
      </Card>

      {activeMission ? (
        <Card className="p-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#5E6961]">Mission active</p>
          <p className="mt-2 font-serif text-2xl text-[#173A2E]">{activeMission.title}</p>
          <p className="mt-2 text-sm text-[#2A3F35]">{activeMission.copy}</p>
          <p className="mt-2 text-xs text-[#556159]">{activeMission.staffHint}</p>
          <p className="mt-2 text-xs text-[#556159]">Expire le {new Date(activeMission.expiresAt).toLocaleDateString("fr-FR")}</p>

          {activeMission.requiresGroupSize ? (
            <label className="mt-4 block text-sm text-[#173A2E]">
              Groupe observé
              <input
                className="mt-2 h-11 w-full rounded-xl border border-[#D5DBD1] bg-white px-3 text-sm"
                inputMode="numeric"
                min={activeMission.requiresGroupSize}
                onChange={(event) => setMissionValidation((prev) => ({ ...prev, groupSize: event.target.value }))}
                placeholder={`${activeMission.requiresGroupSize} minimum`}
                value={missionValidation.groupSize}
              />
            </label>
          ) : null}

          {activeMission.validationMode === "duo" ? (
            <div className="mt-4 space-y-2 text-sm text-[#173A2E]">
              <label className="flex items-center gap-2"><input checked={missionValidation.sameTicketConfirmed} onChange={(event) => setMissionValidation((prev) => ({ ...prev, sameTicketConfirmed: event.target.checked }))} type="checkbox" />Même ticket</label>
              <label className="flex items-center gap-2"><input checked={missionValidation.cardholderPresent} onChange={(event) => setMissionValidation((prev) => ({ ...prev, cardholderPresent: event.target.checked }))} type="checkbox" />Titulaire présent</label>
            </div>
          ) : null}

          {activeMission.validationMode === "tablee" ? (
            <div className="mt-4 space-y-2 text-sm text-[#173A2E]">
              <label className="flex items-center gap-2"><input checked={missionValidation.singleBillConfirmed} onChange={(event) => setMissionValidation((prev) => ({ ...prev, singleBillConfirmed: event.target.checked }))} type="checkbox" />Addition unique confirmée</label>
            </div>
          ) : null}

          {activeMission.validationMode === "apero" ? (
            <div className="mt-4 space-y-2 text-sm text-[#173A2E]">
              <label className="flex items-center gap-2"><input checked={missionValidation.timeWindowConfirmed} onChange={(event) => setMissionValidation((prev) => ({ ...prev, timeWindowConfirmed: event.target.checked }))} type="checkbox" />Créneau apéro confirmé</label>
            </div>
          ) : null}

          {activeMission.validationMode === "fitting" ? (
            <div className="mt-4 space-y-2 text-sm text-[#173A2E]">
              <label className="flex items-center gap-2"><input checked={missionValidation.appointmentConfirmed} onChange={(event) => setMissionValidation((prev) => ({ ...prev, appointmentConfirmed: event.target.checked }))} type="checkbox" />Rendez-vous confirmé</label>
              <label className="flex items-center gap-2"><input checked={missionValidation.inStoreConfirmed} onChange={(event) => setMissionValidation((prev) => ({ ...prev, inStoreConfirmed: event.target.checked }))} type="checkbox" />Confirmation en boutique</label>
            </div>
          ) : null}

          {canCompleteMission ? (
            <Button className="mt-5 w-full" disabled={missionState === "loading"} onClick={() => void onCompleteMission()} type="button" variant="secondary">
              {missionState === "loading" ? "Validation mission..." : "Valider la mission"}
            </Button>
          ) : null}

          {missionState === "success" ? <p className="mt-4 text-sm text-[#173A2E]">{missionMessage}</p> : null}
          {missionState === "error" ? <p className="mt-4 text-sm text-[#A64040]">{missionMessage}</p> : null}
        </Card>
      ) : null}

      <p className="text-center text-xs text-[#69736C]">{profile.staff.cooldownNote}</p>

      <div className="flex justify-center gap-4 text-sm">
        <Link className="text-[#173A2E] underline" href={`/merchant/${merchantId}`}>
          {profile.staff.dashboardLinkLabel}
        </Link>
        <Link className="text-[#173A2E] underline" href="/landing">
          {profile.staff.brandLinkLabel}
        </Link>
      </div>
    </div>
  )
}


