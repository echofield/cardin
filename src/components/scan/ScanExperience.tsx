"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { Button, Card, Input } from "@/ui"

import { WalletPassPreview } from "@/components/engine/WalletPassPreview"

type MerchantResponse = {
  ok: boolean
  merchant?: {
    id: string
    businessName: string
    businessType: string
    loyaltyConfig: {
      targetVisits: number
      rewardLabel: string
    }
  }
}

type CardCreateSuccess = {
  ok: true
  card: {
    id: string
    customerName: string
    stamps: number
    targetVisits: number
    rewardLabel: string
    status: string
  }
  merchant: {
    id: string
    businessName: string
    businessType: string
  }
  cardUrl: string
  appleWalletUrl: string
  googleWalletUrl: string
}

export function ScanExperience({ merchantId }: { merchantId: string }) {
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
        const response = await fetch(`/api/merchant/${merchantId}`)
        const payload = (await response.json()) as MerchantResponse

        if (!response.ok || !payload.ok || !payload.merchant) {
          throw new Error("merchant_not_found")
        }

        if (isMounted) {
          setMerchant(payload.merchant)
        }
      } catch {
        if (isMounted) {
          setMerchantError("Commerce introuvable. Vérifiez le QR code utilisé.")
        }
      } finally {
        if (isMounted) {
          setLoadingMerchant(false)
        }
      }
    }

    loadMerchant()

    return () => {
      isMounted = false
    }
  }, [merchantId])

  const progressDots = useMemo(() => {
    if (!cardData) return 6
    return Math.max(4, Math.min(cardData.card.targetVisits, 10))
  }, [cardData])

  const onCreateCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/card/create", {
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

      trackEvent("scan_card_created", {
        merchantId,
        cardId: payload.card.id,
      })
    } catch {
      alert("Impossible de créer votre carte pour le moment.")
    } finally {
      setSubmitting(false)
    }
  }

  const openWalletFlow = async (walletUrl: string, provider: "apple" | "google") => {
    try {
      const response = await fetch(walletUrl)

      if (response.redirected) {
        trackEvent("wallet_button_clicked", { provider, merchantId, mode: "provider_redirect" })
        window.location.href = response.url
        return
      }

      const payload = (await response.json()) as { fallbackUrl?: string }
      trackEvent("wallet_button_clicked", { provider, merchantId, mode: "fallback" })

      window.location.href = payload.fallbackUrl ?? cardData?.cardUrl ?? "/landing"
    } catch {
      window.location.href = cardData?.cardUrl ?? "/landing"
    }
  }

  if (loadingMerchant) {
    return (
      <main className="min-h-screen bg-[#F8F7F2] px-4 py-12 text-[#173A2E]">
        <p className="mx-auto max-w-xl text-sm">Chargement de la carte...</p>
      </main>
    )
  }

  if (merchantError || !merchant) {
    return (
      <main className="min-h-screen bg-[#F8F7F2] px-4 py-12 text-[#173A2E]">
        <Card className="mx-auto max-w-xl p-6">
          <p className="text-sm text-[#A64040]">{merchantError ?? "Commerce introuvable"}</p>
          <Link className="mt-4 inline-block text-sm underline" href="/landing">
            Retour à l'accueil
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#173A2E] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.14em] text-[#5D675F]">{merchant.businessType}</p>
        <h1 className="mt-2 font-serif text-5xl">{merchant.businessName}</h1>
        <p className="mt-2 text-sm text-[#556159]">Ajoutez votre carte de fidélité en 10 secondes.</p>

        {!cardData ? (
          <Card className="mt-6 p-6">
            <p className="text-sm text-[#556159]">Programme: {merchant.loyaltyConfig.targetVisits} passages → {merchant.loyaltyConfig.rewardLabel}</p>

            <form className="mt-5 space-y-3" onSubmit={onCreateCard}>
              <Input onChange={(event) => setCustomerName(event.target.value)} placeholder="Votre prénom" required value={customerName} />
              <Input onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Téléphone (optionnel)" value={customerPhone} />

              <Button className="w-full" size="lg" type="submit">
                {submitting ? "Création..." : "Ajouter ma carte"}
              </Button>
            </form>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            <WalletPassPreview
              businessLabel={merchant.businessName}
              progressDots={progressDots}
              rewardLabel={cardData.card.rewardLabel}
            />

            <Card className="p-5">
              <p className="text-sm text-[#556159]">Bienvenue {cardData.card.customerName}. Votre carte est active.</p>
              <p className="mt-1 text-sm text-[#173A2E]">Progression: {cardData.card.stamps} / {cardData.card.targetVisits}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button onClick={() => openWalletFlow(cardData.appleWalletUrl, "apple")} variant="secondary">
                  Ajouter à Apple Wallet
                </Button>
                <Button onClick={() => openWalletFlow(cardData.googleWalletUrl, "google")} variant="secondary">
                  Ajouter à Google Wallet
                </Button>
              </div>

              <Link className="mt-4 inline-block text-sm underline" href={`/card/${cardData.card.id}`}>
                Ouvrir ma carte sur le téléphone
              </Link>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
