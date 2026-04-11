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
  }
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
}

function getStaffStorageKey(merchantId: string) {
  return `cardin:staff:last-validated:${merchantId}`
}

export function MerchantValidatePanel({ merchantId }: { merchantId: string }) {
  const [pending, setPending] = useState<PendingPayload["pending"]>(null)
  const [postValidate, setPostValidate] = useState<PostValidate | null>(null)
  const [profileId, setProfileId] = useState<MerchantProfileId>("generic")
  const [loading, setLoading] = useState(true)
  const [actionState, setActionState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [consumeState, setConsumeState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [consumeMessage, setConsumeMessage] = useState("")

  const validateIdemRef = useRef<string | null>(null)
  const consumeIdemRef = useRef<string | null>(null)
  const profile = useMemo(() => getMerchantProfile(profileId), [profileId])

  const loadPending = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/pending-validation")
      const data = (await res.json()) as PendingPayload
      if (data.ok) {
        setPending(data.pending)
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
      const data = (await res.json()) as { ok?: boolean; error?: string; sessionId?: string }
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
          summitReward: pending.summitReward,
        })
      }
      validateIdemRef.current = null
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
      const data = (await res.json()) as { ok?: boolean; error?: string; usageRemaining?: number }
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
        if (typeof data.usageRemaining !== "number" || !prev.summitReward) return null
        if (data.usageRemaining <= 0) return null
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

  const activeSummit = postValidate?.summitReward ?? pending?.summitReward
  const activeCardId = postValidate?.cardId ?? pending?.cardId
  const canConsume = Boolean(activeSummit && activeSummit.usageRemaining > 0 && activeCardId && actionState !== "loading")

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#677168]">{profile.staff.eyebrow}</p>
        <h1 className="mt-3 font-serif text-3xl text-[#163328]">{profile.staff.title}</h1>
        <p className="mt-2 text-sm leading-7 text-[#556159]">{profile.staff.subtitle}</p>
      </div>

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

            {pending.summitReward ? (
              <div className="mt-5 rounded-[1.2rem] border border-[#173A2E]/15 bg-[#F8FAF6] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#5E6961]">{profile.staff.activeRewardLabel}</p>
                <p className="mt-1 font-medium text-[#173A2E]">{pending.summitReward.title}</p>
                <p className="mt-1 text-sm text-[#2A3F35]">{pending.summitReward.description}</p>
                <p className="mt-2 text-sm text-[#556159]">
                  Reste {pending.summitReward.usageRemaining} utilisation{pending.summitReward.usageRemaining > 1 ? "s" : ""}
                </p>
              </div>
            ) : null}
          </div>
        ) : postValidate ? (
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">{profile.staff.lastValidatedLabel}</p>
            <p className="mt-2 font-serif text-2xl text-[#173A2E]">{postValidate.customerName}</p>
            <p className="mt-2 text-sm text-[#556159]">{profile.staff.lastValidatedBody}</p>
            {postValidate.summitReward ? (
              <div className="mt-5 rounded-[1.2rem] border border-[#173A2E]/15 bg-[#F8FAF6] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#5E6961]">{profile.staff.activeRewardLabel}</p>
                <p className="mt-1 font-medium text-[#173A2E]">{postValidate.summitReward.title}</p>
                <p className="mt-1 text-sm text-[#2A3F35]">{postValidate.summitReward.description}</p>
                <p className="mt-2 text-sm text-[#556159]">
                  Reste {postValidate.summitReward.usageRemaining} utilisation{postValidate.summitReward.usageRemaining > 1 ? "s" : ""}
                </p>
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
