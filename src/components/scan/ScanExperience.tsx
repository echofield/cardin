"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { getMerchantProfile, type MerchantProfileId } from "@/lib/merchant-profile"
import { Button, Card, Input } from "@/ui"

import { WalletPassPreview } from "@/components/engine/WalletPassPreview"

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

type MerchantResponse = {
  ok: boolean
  merchant?: {
    id: string
    businessName: string
    businessType: string
    profileId: MerchantProfileId
    cardinWorld: string
    promise: string
    loyaltyConfig: {
      targetVisits: number
      rewardLabel: string
      midpointMode: "recognition_only" | "recognition_plus_boost"
      midpointThreshold: number
    }
    sharedUnlock: SharedUnlockView
  }
}

type CardCreateSuccess = {
  ok: true
  card: {
    id: string
    code: string
    customerName: string
    stamps: number
    targetVisits: number
    rewardLabel: string
    midpoint: MidpointView
    status: string
  }
  merchant: {
    id: string
    businessName: string
    businessType: string
    profileId: MerchantProfileId
    cardinWorld: string
    promise: string
    loyaltyConfig: {
      targetVisits: number
      rewardLabel: string
      midpointMode: "recognition_only" | "recognition_plus_boost"
      midpointThreshold: number
    }
    sharedUnlock: SharedUnlockView
  }
  cardUrl: string
  cardLegacyUrl: string
  appleWalletUrl: string
  googleWalletUrl: string
  accessToken?: string
}

export function ScanExperience({ merchantId, demo = false }: { merchantId: string; demo?: boolean }) {
  const [loadingMerchant, setLoadingMerchant] = useState(true)
  const [merchantError, setMerchantError] = useState<string | null>(null)
  const [merchant, setMerchant] = useState<MerchantResponse["merchant"] | null>(null)

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [cardData, setCardData] = useState<CardCreateSuccess | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadMerchant = async () => {
      setLoadingMerchant(true)
      setMerchantError(null)

      try {
        const response = await fetch(`/api/public/merchant/${merchantId}`)
        const payload = (await response.json()) as MerchantResponse

        if (!response.ok || !payload.ok || !payload.merchant) {
          throw new Error("merchant_not_found")
        }

        if (isMounted) {
          setMerchant(payload.merchant)
        }
      } catch {
        if (isMounted) {
          setMerchantError(getMerchantProfile("generic").scan.notFound)
        }
      } finally {
        if (isMounted) {
          setLoadingMerchant(false)
        }
      }
    }

    void loadMerchant()

    return () => {
      isMounted = false
    }
  }, [merchantId])

  const progressDots = useMemo(() => {
    if (!cardData) return 6
    return Math.max(4, Math.min(cardData.card.targetVisits, 10))
  }, [cardData])

  const activeMerchant = cardData?.merchant ?? merchant
  const profile = getMerchantProfile(activeMerchant?.profileId ?? "generic")
  const sharedUnlock = cardData?.merchant.sharedUnlock ?? merchant?.sharedUnlock

  const onCreateCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/public/card/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          customerName,
          customerPhone,
        }),
      })

      const payload = (await response.json()) as CardCreateSuccess

      if (!response.ok || !payload.ok) {
        throw new Error("card_creation_failed")
      }

      setCardData(payload)

      if (payload.accessToken && payload.card?.id && typeof window !== "undefined") {
        sessionStorage.setItem(`cardin:access:${payload.card.id}`, payload.accessToken)
      }

      trackEvent("scan_card_created", {
        merchantId,
        cardId: payload.card.id,
        cardCode: payload.card.code,
      })
    } catch {
      alert(profile.scan.createError)
    } finally {
      setSubmitting(false)
    }
  }

  const openWalletFlow = async (walletUrl: string, provider: "apple" | "google") => {
    try {
      const response = await fetch(walletUrl)

      if (response.redirected) {
        trackEvent("wallet_button_clicked", { provider, merchantId, mode: "provider_redirect" })
        if (typeof window !== "undefined") window.location.href = response.url
        return
      }

      const payload = (await response.json()) as { fallbackUrl?: string }
      trackEvent("wallet_button_clicked", { provider, merchantId, mode: "fallback" })

      if (typeof window !== "undefined") window.location.href = payload.fallbackUrl ?? cardData?.cardUrl ?? "/landing"
    } catch {
      if (typeof window !== "undefined") window.location.href = cardData?.cardUrl ?? "/landing"
    }
  }

  if (loadingMerchant) {
    return (
      <main className="min-h-dvh-safe bg-[#F8F7F2] px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom,0px))] text-[#173A2E]">
        <p className="mx-auto max-w-xl text-sm">{profile.scan.loading}</p>
      </main>
    )
  }

  if (merchantError || !merchant) {
    const fallbackProfile = getMerchantProfile("generic")
    return (
      <main className="min-h-dvh-safe bg-[#F8F7F2] px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom,0px))] text-[#173A2E]">
        <Card className="mx-auto max-w-xl p-6">
          <p className="text-sm text-[#A64040]">{merchantError ?? fallbackProfile.scan.notFound}</p>
          <Link className="mt-4 inline-block text-sm underline" href="/landing">
            {fallbackProfile.scan.backHome}
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-dvh-safe bg-[#F8F7F2] px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] text-[#173A2E] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.14em] text-[#5D675F]">{profile.scan.eyebrow}</p>
          <h1 className="mt-2 font-serif text-5xl">{merchant.businessName}</h1>
          <p className="mt-2 text-sm text-[#556159]">{profile.scan.intro}</p>
          <p className="mt-2 text-sm text-[#2A3F35]">{merchant.promise}</p>
          {demo ? <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#173A2E]">Mode démo</p> : null}
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.scan.firstImpressionTitle}</p>
            <div className="mt-3 space-y-2 text-sm text-[#173A2E]">
              {profile.scan.firstImpression.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.scan.ritualTitle}</p>
            <div className="mt-3 space-y-2 text-sm text-[#173A2E]">
              {profile.scan.ritualSteps.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Card>
        </section>

        {!cardData ? (
          <Card className="p-6">
            <p className="text-sm text-[#556159]">{profile.scan.formIntro}</p>
            <p className="mt-3 text-sm text-[#173A2E]">
              Objectif actuel : {merchant.loyaltyConfig.targetVisits} passages pour débloquer {merchant.loyaltyConfig.rewardLabel}
            </p>
            <p className="mt-1 text-sm text-[#2A3F35]">Premier palier à {merchant.loyaltyConfig.midpointThreshold} passages.</p>

            <form className="mt-5 space-y-3" onSubmit={onCreateCard}>
              <Input
                className="text-base sm:text-sm"
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder={profile.scan.namePlaceholder}
                required
                value={customerName}
              />
              <Input
                className="text-base sm:text-sm"
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder={profile.scan.phonePlaceholder}
                value={customerPhone}
              />

              <Button className="w-full" size="lg" type="submit">
                {submitting ? profile.scan.submittingLabel : profile.scan.submitLabel}
              </Button>
            </form>
          </Card>
        ) : (
          <div className="space-y-4">
            <WalletPassPreview businessLabel={merchant.businessName} progressDots={progressDots} rewardLabel={cardData.card.rewardLabel} />

            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.scan.createdTitle}</p>
              <p className="mt-2 text-sm text-[#556159]">{profile.scan.createdBody}</p>
              <p className="mt-2 text-sm text-[#173A2E]">{cardData.card.customerName}</p>
              <p className="mt-1 text-sm text-[#173A2E]">
                {cardData.card.stamps} / {cardData.card.targetVisits}
              </p>
              <p className="mt-1 text-sm text-[#2A3F35]">{cardData.card.midpoint.copy}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button onClick={() => void openWalletFlow(cardData.appleWalletUrl, "apple")} variant="secondary">
                  {profile.scan.appleWalletLabel}
                </Button>
                <Button onClick={() => void openWalletFlow(cardData.googleWalletUrl, "google")} variant="secondary">
                  {profile.scan.googleWalletLabel}
                </Button>
              </div>

              <Link className="mt-4 inline-block text-sm underline" href={`${cardData.cardUrl}${demo ? "?demo=1" : ""}`}>
                {profile.scan.openCardLabel}
              </Link>
            </Card>
          </div>
        )}

        {sharedUnlock?.enabled ? (
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">{profile.scan.sharedUnlockTitle}</p>
            <p className="mt-2 text-sm text-[#173A2E]">
              {sharedUnlock.progress} / {sharedUnlock.objective} passages ce mois
            </p>
            <p className="mt-1 text-sm text-[#556159]">{sharedUnlock.offer}</p>
            <p className="mt-1 text-xs text-[#556159]">Fenêtre active : {sharedUnlock.windowDays} jours</p>
            {sharedUnlock.status === "active" ? <p className="mt-2 text-sm text-[#173A2E]">{profile.scan.sharedUnlockActive}</p> : null}
          </Card>
        ) : null}
      </div>
    </main>
  )
}

